import { VinDecoderClient } from '../dist/index.js';

const user = process.env.VINDECODER_USER;
const key = process.env.VINDECODER_KEY;
const vin = 'WF0GXXGAJ69C71882';

if (!user || !key) {
  console.error('Set VINDECODER_USER and VINDECODER_KEY');
  process.exit(1);
}

const client = VinDecoderClient.create(user, key);
const results = [];

async function test(name, fn, planLimited = false) {
  try {
    const r = await fn();
    console.log(`  OK  ${name}${r ? ` - ${r}` : ''}`);
    results.push(true);
  } catch (e) {
    if (planLimited && e.message.includes('not available in your plan')) {
      console.log(`  SKIP ${name}: plan limit`);
      results.push(true);
      return;
    }
    console.log(`  FAIL ${name}: ${e.message}`);
    results.push(false);
  }
}

console.log('\n=== Node.js SDK ===');
const vehicle = await client.decodeVin(vin);
await test('decodeVin', () => vehicle.make);
await test('decodeVinAll', async () => `${(await client.decodeVinAll(vin)).length} vehicles`);
await test('getEngines', async () => `${(await client.getEngines(vin)).length} engines`);
await test('getVehicle', async () => (await client.getVehicle(vehicle.carId)).make);
await test('getFluidCapacities', async () => `${(await client.getFluidCapacities(vehicle.carId)).length} fluids`);
await test('getOemParts', async () => `${(await client.getOemParts(vehicle.carId)).length} groups`, true);
await test('getRepairTimes', async () => `${(await client.getRepairTimes(vehicle.carId)).length} repairs`, true);
await test('listBrands', async () => `${(await client.listBrands()).length} brands`);
const models = await client.listModels('bmw');
const modelSlug = models[0]?.slug ?? '3-series';
await test('listModels', async () => `${models.length} models`);
await test('listVariants', async () => `${(await client.listVariants('bmw', modelSlug)).length} variants (${modelSlug})`);

const passed = results.filter(Boolean).length;
console.log(`\nNode.js SDK: ${passed}/${results.length} passed\n`);
process.exit(passed === results.length ? 0 : 1);