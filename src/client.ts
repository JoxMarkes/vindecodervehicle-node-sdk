import {
  ApiError,
  AuthenticationError,
  InvalidArgumentError,
} from './exceptions.js';
import { FetchHttpClient, type HttpClient } from './http.js';
import {
  mapBrand,
  mapEngine,
  mapFluidCapacity,
  mapOemPartGroup,
  mapRepairTime,
  mapVariant,
  mapVehicle,
  mapVehicleModel,
  type Brand,
  type Engine,
  type FluidCapacity,
  type OemPartGroup,
  type RepairTime,
  type Variant,
  type Vehicle,
  type VehicleModel,
} from './models.js';

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]+$/;

export class VinDecoderClient {
  static readonly DEFAULT_BASE_URL = 'https://vindecodervehicle.com/api/';

  constructor(
    private readonly user: string,
    private readonly apiKey: string,
    private readonly options: {
      baseUrl?: string;
      httpClient?: HttpClient;
    } = {},
  ) {}

  static create(user: string, apiKey: string, baseUrl?: string): VinDecoderClient {
    return new VinDecoderClient(user, apiKey, { baseUrl });
  }

  private get baseUrl(): string {
    return this.options.baseUrl ?? VinDecoderClient.DEFAULT_BASE_URL;
  }

  private get http(): HttpClient {
    return this.options.httpClient ?? new FetchHttpClient();
  }

  async request(params: Record<string, string | number>): Promise<Record<string, unknown>> {
    const { status, body } = await this.http.get(this.baseUrl, {
      user: this.user,
      key: this.apiKey,
      ...params,
    });

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(body) as Record<string, unknown>;
    } catch {
      throw new ApiError('Invalid JSON response from VIN Decoder API.', status);
    }

    if (status === 401 || status === 403) {
      throw new AuthenticationError(
        this.extractError(payload, 'Authentication failed.'),
        status,
        payload,
      );
    }

    if (status >= 400) {
      throw new ApiError(this.extractError(payload, 'API request failed.'), status, payload);
    }

    if (!payload.success) {
      throw new ApiError(this.extractError(payload, 'API returned success=false.'), status, payload);
    }

    return payload;
  }

  async decodeVin(vin: string): Promise<Vehicle> {
    const normalized = this.validateVin(vin);
    const payload = await this.request({ vin: normalized });
    const data = payload.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new InvalidArgumentError('Expected a single vehicle in the API response.');
    }
    return mapVehicle(data as Record<string, unknown>);
  }

  async decodeVinAll(vin: string): Promise<Vehicle[]> {
    const normalized = this.validateVin(vin);
    const payload = await this.request({ vin: normalized, allCars: 1 });
    const data = payload.data;
    if (!Array.isArray(data)) return [];
    return data.map((item) => mapVehicle(item as Record<string, unknown>));
  }

  async getEngines(vin: string): Promise<Engine[]> {
    const normalized = this.validateVin(vin);
    const payload = await this.request({ vin: normalized, getEngines: 1 });
    const data = payload.data;
    if (!Array.isArray(data)) return [];
    return data.map((item) => mapEngine(item as Record<string, unknown>));
  }

  async getVehicle(carId: number): Promise<Vehicle> {
    this.validateCarId(carId);
    const payload = await this.request({ carId, only: 1 });
    const data = payload.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new InvalidArgumentError('Expected a single vehicle in the API response.');
    }
    return mapVehicle(data as Record<string, unknown>);
  }

  async getFluidCapacities(carId: number): Promise<FluidCapacity[]> {
    this.validateCarId(carId);
    const payload = await this.request({ carId, fluids: 1 });
    const data = payload.data;
    if (!Array.isArray(data)) return [];
    return data.map((item) => mapFluidCapacity(item as Record<string, unknown>));
  }

  async getOemParts(carId: number): Promise<OemPartGroup[]> {
    this.validateCarId(carId);
    const payload = await this.request({ carId, oemParts: 1 });
    const data = payload.data;
    if (!Array.isArray(data)) return [];
    return data.map((item) => mapOemPartGroup(item as Record<string, unknown>));
  }

  async getRepairTimes(carId: number): Promise<RepairTime[]> {
    this.validateCarId(carId);
    const payload = await this.request({ carId, timeRepair: 1 });
    const data = payload.data;
    if (!Array.isArray(data)) return [];
    return data.map((item) => mapRepairTime(item as Record<string, unknown>));
  }

  async listBrands(): Promise<Brand[]> {
    const payload = await this.request({ brands: 1 });
    const data = payload.data;
    if (!Array.isArray(data)) return [];
    return data.map((item) => mapBrand(item as Record<string, unknown>));
  }

  async listModels(brand: string): Promise<VehicleModel[]> {
    const brandSlug = this.normalizeSlug(brand, 'brand');
    const payload = await this.request({ brand: brandSlug, models: 1 });
    const data = payload.data;
    if (!Array.isArray(data)) return [];
    return data.map((item) => mapVehicleModel(item as Record<string, unknown>));
  }

  async listVariants(brand: string, model: string): Promise<Variant[]> {
    const brandSlug = this.normalizeSlug(brand, 'brand');
    const modelSlug = this.normalizeSlug(model, 'model');
    const payload = await this.request({ brand: brandSlug, model: modelSlug, variants: 1 });
    const data = payload.data;
    if (!Array.isArray(data)) return [];
    return data.map((item) => mapVariant(item as Record<string, unknown>));
  }

  private validateVin(vin: string): string {
    const normalized = vin.trim().toUpperCase();
    if (normalized.length < 8 || normalized.length > 17) {
      throw new InvalidArgumentError(
        `VIN must be between 8 and 17 characters. Got ${normalized.length}.`,
      );
    }
    if (!VIN_PATTERN.test(normalized)) {
      throw new InvalidArgumentError('VIN contains invalid characters.');
    }
    return normalized;
  }

  private validateCarId(carId: number): void {
    if (carId <= 0) {
      throw new InvalidArgumentError('carId must be a positive integer.');
    }
  }

  private normalizeSlug(value: string, field: string): string {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      throw new InvalidArgumentError(`${field} must not be empty.`);
    }
    return normalized;
  }

  private extractError(payload: Record<string, unknown>, fallback: string): string {
    for (const key of ['message', 'error', 'detail']) {
      const value = payload[key];
      if (typeof value === 'string' && value) return value;
    }
    return fallback;
  }
}