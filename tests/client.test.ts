import { VinDecoderClient } from '../src/client.js';
import {
  ApiError,
  AuthenticationError,
  InvalidArgumentError,
} from '../src/exceptions.js';
import type { HttpClient, HttpResponse } from '../src/http.js';

class MockHttpClient implements HttpClient {
  private responses: HttpResponse[] = [];

  queue(status: number, payload: Record<string, unknown>): void {
    this.responses.push({ status, body: JSON.stringify(payload) });
  }

  async get(): Promise<HttpResponse> {
    const response = this.responses.shift();
    if (!response) throw new Error('No mock response queued.');
    return response;
  }
}

describe('VinDecoderClient', () => {
  const http = new MockHttpClient();
  const client = new VinDecoderClient('demo-user', 'demo-key', { httpClient: http });

  beforeEach(() => {
    http['responses'] = [];
  });

  it('decodes a VIN', async () => {
    http.queue(200, {
      success: true,
      timestamp: '2025-07-02T22:37:25+00:00',
      api_version: '2.0',
      data: {
        carId: 55565,
        vin: '',
        make: 'BMW',
        model: '3 Coupe (E92)',
        year: '2007',
        yearEnd: '2013',
        description: '316 i',
        body: 'Coupe',
        fuel: 'Petrol',
        engine: 'Petrol Engine',
        cubicCapacityCcm: 1599,
        cubicCapacityLiters: 1.6,
        powerHpFrom: 122,
        powerHpTo: 122,
        kwPowerFrom: '',
        kwPowerTo: 90,
        cylinder: 4,
        drive: 'Rear Wheel Drive',
        valves: 4,
        fuelMixtureFormation: 'Direct Injection',
        aspiration: '',
        cylinderDesign: '',
        coolingType: '',
        tonnage: '',
        axleLoadFromKg: '',
        axleLoadToKg: '',
        axleStyle: '',
        axleType: '',
        axleBody: '',
        axleConfiguration: '',
        wheelMounting: '',
        brakeType: '',
        hmdMfrModelName: '',
      },
    });

    const vehicle = await client.decodeVin('WF0GXXGAJ69C71882');
    expect(vehicle.carId).toBe(55565);
    expect(vehicle.make).toBe('BMW');
  });

  it('lists brands', async () => {
    http.queue(200, {
      success: true,
      api_version: '2.0',
      data: [{ name: 'BMW', slug: 'bmw' }],
    });

    const brands = await client.listBrands();
    expect(brands).toHaveLength(1);
    expect(brands[0].slug).toBe('bmw');
  });

  it('rejects invalid VIN', async () => {
    await expect(client.decodeVin('ABC')).rejects.toBeInstanceOf(InvalidArgumentError);
  });

  it('throws on authentication failure', async () => {
    http.queue(401, { success: false, message: 'Invalid credentials' });
    await expect(client.listBrands()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('throws on API failure', async () => {
    http.queue(200, { success: false, message: 'Quota exceeded' });
    await expect(client.listBrands()).rejects.toBeInstanceOf(ApiError);
  });
});