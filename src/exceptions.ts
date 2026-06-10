export class VinDecoderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VinDecoderError';
  }
}

export class InvalidArgumentError extends VinDecoderError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidArgumentError';
  }
}

export class NetworkError extends VinDecoderError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends VinDecoderError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseBody?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(
    message: string,
    statusCode?: number,
    responseBody?: Record<string, unknown>,
  ) {
    super(message, statusCode, responseBody);
    this.name = 'AuthenticationError';
  }
}