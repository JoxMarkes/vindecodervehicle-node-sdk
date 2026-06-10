import { NetworkError } from './exceptions.js';

export interface HttpResponse {
  status: number;
  body: string;
}

export interface HttpClient {
  get(url: string, params: Record<string, string | number>): Promise<HttpResponse>;
}

export class FetchHttpClient implements HttpClient {
  constructor(private readonly timeoutMs = 30_000) {}

  async get(url: string, params: Record<string, string | number>): Promise<HttpResponse> {
    const query = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    );
    const fullUrl = `${url}?${query.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'vindecodervehicle-node-sdk/1.0',
        },
        signal: controller.signal,
      });

      return {
        status: response.status,
        body: await response.text(),
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError('Request timed out while calling VIN Decoder API.');
      }
      throw new NetworkError(
        `Network error while calling VIN Decoder API: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}