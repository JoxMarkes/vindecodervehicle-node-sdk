# VIN Decoder Vehicle — Node.js SDK

[![CI](https://github.com/JoxMarkes/vindecodervehicle-node-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/JoxMarkes/vindecodervehicle-node-sdk/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@vindecodervehicle/sdk.svg)](https://www.npmjs.com/package/@vindecodervehicle/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Official Node.js SDK for the **[VIN Decoder Vehicle API](https://vindecodervehicle.com)**.

## Features

- TypeScript with full type definitions
- Zero runtime dependencies
- Native `fetch` (Node.js 18+)
- ESM-first
- All API endpoints supported

## Installation

```bash
npm install @vindecodervehicle/sdk
```

## Quick Start

```typescript
import { VinDecoderClient, getVehicleFullName } from '@vindecodervehicle/sdk';

const client = VinDecoderClient.create('YOUR_USER', 'YOUR_API_KEY');

const vehicle = await client.decodeVin('WF0GXXGAJ69C71882');
console.log(getVehicleFullName(vehicle)); // BMW 3 Coupe (E92) 316 i
console.log(vehicle.make);              // BMW
console.log(vehicle.carId);             // 55565
```

## API Reference

### VIN

```typescript
const vehicle = await client.decodeVin('WF0GXXGAJ69C71882');
const vehicles = await client.decodeVinAll('WF0GXXGAJ69C71882');
const engines = await client.getEngines('WF0GXXGAJ69C71882');
```

### Vehicle by carId

```typescript
const vehicle = await client.getVehicle(55565);
const fluids = await client.getFluidCapacities(55565);
const parts = await client.getOemParts(55565);
const repairs = await client.getRepairTimes(55565);
```

### Catalog

```typescript
const brands = await client.listBrands();
const models = await client.listModels('bmw');
const variants = await client.listVariants('bmw', '3-series');
```

## Error Handling

```typescript
import {
  ApiError,
  AuthenticationError,
  InvalidArgumentError,
} from '@vindecodervehicle/sdk';

try {
  await client.decodeVin('INVALID');
} catch (error) {
  if (error instanceof InvalidArgumentError) { /* invalid VIN */ }
  if (error instanceof AuthenticationError) { /* bad credentials */ }
  if (error instanceof ApiError) {
    console.log(error.statusCode, error.responseBody);
  }
}
```

## Links

- [API Documentation](https://vindecodervehicle.com/api/doc/)
- [PHP SDK](https://github.com/JoxMarkes/vindecodervehicle-php-sdk)
- [Python SDK](https://github.com/JoxMarkes/vindecodervehicle-python-sdk)
- [JavaScript SDK](https://github.com/JoxMarkes/vindecodervehicle-js-sdk)

## License

MIT