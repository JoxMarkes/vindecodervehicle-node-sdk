export interface Vehicle {
  carId: number;
  vin: string;
  make: string;
  model: string;
  year: string;
  yearEnd: string;
  description: string;
  body: string;
  fuel: string;
  engine: string;
  cubicCapacityCcm: number | null;
  cubicCapacityLiters: number | null;
  powerHpFrom: number | null;
  powerHpTo: number | null;
  kwPowerFrom: unknown;
  kwPowerTo: unknown;
  cylinder: number | null;
  drive: string;
  valves: number | null;
  fuelMixtureFormation: string;
  aspiration: string;
  cylinderDesign: string;
  coolingType: string;
  tonnage: string;
  axleLoadFromKg: unknown;
  axleLoadToKg: unknown;
  axleStyle: string;
  axleType: string;
  axleBody: string;
  axleConfiguration: string;
  wheelMounting: string;
  brakeType: string;
  hmdMfrModelName: string;
}

export interface FluidCapacity {
  item: string;
  qualifier: string;
  value: string;
  quantityUnit: string;
  additionalInfo: string;
}

export interface OemPart {
  manufacturer: string;
  oeNumber: string;
}

export interface OemPartGroup {
  group: string;
  shortname: string;
  name: string;
  parts: OemPart[];
}

export interface RepairTime {
  workName: string;
  partName: string;
  hours: string;
}

export interface Brand {
  name: string;
  slug: string;
}

export interface VehicleModel {
  name: string;
  slug: string;
}

export interface Variant {
  typeName: string;
  typeYears: string;
  fullTitle: string;
}

export interface Engine {
  brand: string;
  model: string;
  description: string;
  kiloWatts: number | null;
  from: string;
  until: string;
  engineDetails: Record<string, unknown>;
}

const str = (value: unknown): string => (value == null ? '' : String(value));
const intOrNull = (value: unknown): number | null =>
  value == null || value === '' ? null : Number(value);
const floatOrNull = (value: unknown): number | null =>
  value == null || value === '' ? null : Number(value);

export function mapVehicle(data: Record<string, unknown>): Vehicle {
  return {
    carId: Number(data.carId ?? 0),
    vin: str(data.vin),
    make: str(data.make),
    model: str(data.model),
    year: str(data.year),
    yearEnd: str(data.yearEnd),
    description: str(data.description),
    body: str(data.body),
    fuel: str(data.fuel),
    engine: str(data.engine),
    cubicCapacityCcm: intOrNull(data.cubicCapacityCcm),
    cubicCapacityLiters: floatOrNull(data.cubicCapacityLiters),
    powerHpFrom: intOrNull(data.powerHpFrom),
    powerHpTo: intOrNull(data.powerHpTo),
    kwPowerFrom: data.kwPowerFrom,
    kwPowerTo: data.kwPowerTo,
    cylinder: intOrNull(data.cylinder),
    drive: str(data.drive),
    valves: intOrNull(data.valves),
    fuelMixtureFormation: str(data.fuelMixtureFormation),
    aspiration: str(data.aspiration),
    cylinderDesign: str(data.cylinderDesign),
    coolingType: str(data.coolingType),
    tonnage: str(data.tonnage),
    axleLoadFromKg: data.axleLoadFromKg,
    axleLoadToKg: data.axleLoadToKg,
    axleStyle: str(data.axleStyle),
    axleType: str(data.axleType),
    axleBody: str(data.axleBody),
    axleConfiguration: str(data.axleConfiguration),
    wheelMounting: str(data.wheelMounting),
    brakeType: str(data.brakeType),
    hmdMfrModelName: str(data.hmdMfrModelName),
  };
}

export function getVehicleFullName(vehicle: Vehicle): string {
  return `${vehicle.make} ${vehicle.model} ${vehicle.description}`.trim();
}

export function mapFluidCapacity(data: Record<string, unknown>): FluidCapacity {
  return {
    item: str(data.ItemMPText),
    qualifier: str(data.QualColTextStr),
    value: str(data.ValueText),
    quantityUnit: str(data.ADQuantityTextStr),
    additionalInfo: str(data.AddTextStr),
  };
}

export function mapOemPartGroup(data: Record<string, unknown>): OemPartGroup {
  const parts = Array.isArray(data.parts)
    ? data.parts.map((part) => ({
        manufacturer: str((part as Record<string, unknown>).manufacturer),
        oeNumber: str((part as Record<string, unknown>).oe_number),
      }))
    : [];

  return {
    group: str(data.group),
    shortname: str(data.shortname),
    name: str(data.name),
    parts,
  };
}

export function mapRepairTime(data: Record<string, unknown>): RepairTime {
  return {
    workName: str(data.workname),
    partName: str(data.partname),
    hours: str(data.hours),
  };
}

export function mapBrand(data: Record<string, unknown>): Brand {
  return { name: str(data.name), slug: str(data.slug) };
}

export function mapVehicleModel(data: Record<string, unknown>): VehicleModel {
  return { name: str(data.name), slug: str(data.slug) };
}

export function mapVariant(data: Record<string, unknown>): Variant {
  return {
    typeName: str(data.typeName),
    typeYears: str(data.typeYears),
    fullTitle: str(data.fullTitle),
  };
}

export function mapEngine(data: Record<string, unknown>): Engine {
  return {
    brand: str(data.Brand),
    model: str(data.Model),
    description: str(data.Description),
    kiloWatts: intOrNull(data.kiloWatts),
    from: str(data.From),
    until: str(data.Until),
    engineDetails:
      data.EngineDetails && typeof data.EngineDetails === 'object'
        ? (data.EngineDetails as Record<string, unknown>)
        : {},
  };
}