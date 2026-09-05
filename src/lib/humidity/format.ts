/** Unit conversion + display helpers. */

export type Units = 'metric' | 'imperial';

// dimension units user can pick directly
export type DimUnit = 'mm' | 'cm' | 'm' | 'ft' | 'in';

export const PINT_LITRE = 0.473176;
export const GAL_LITRE = 3.78541;
export const FT_M = 0.3048;
export const IN_M = 0.0254;

export function dimUnitToM(v: number, unit: DimUnit): number {
  switch (unit) {
    case 'mm': return v / 1000;
    case 'cm': return v / 100;
    case 'm': return v;
    case 'ft': return v * FT_M;
    case 'in': return v * IN_M;
  }
}
export function mToDimUnit(m: number, unit: DimUnit): number {
  switch (unit) {
    case 'mm': return m * 1000;
    case 'cm': return m * 100;
    case 'm': return m;
    case 'ft': return m / FT_M;
    case 'in': return m / IN_M;
  }
}
export function dimUnitLabel(unit: DimUnit): string { return unit; }

// For global toggle display (legacy helpers)
export function mToDisplay(m: number, units: Units): number {
  return units === 'metric' ? m : m / FT_M;
}
export function displayToM(v: number, units: Units): number {
  return units === 'metric' ? v : v * FT_M;
}
export function lengthUnit(units: Units): string {
  return units === 'metric' ? 'm' : 'ft';
}
export function areaUnit(units: Units): string {
  return units === 'metric' ? 'm²' : 'sq ft';
}
export function m2ToDisplay(m2: number, units: Units): number {
  return units === 'metric' ? m2 : m2 / (FT_M * FT_M);
}
export function displayToM2(v: number, units: Units): number {
  return units === 'metric' ? v : v * FT_M * FT_M;
}

export function cToDisplay(c: number, units: Units): number {
  return units === 'metric' ? c : (c * 9) / 5 + 32;
}
export function displayToC(v: number, units: Units): number {
  return units === 'metric' ? v : ((v - 32) * 5) / 9;
}
export function tempUnit(units: Units): string {
  return units === 'metric' ? '°C' : '°F';
}
export function volumeUnit(units: Units): string {
  return units === 'metric' ? 'm³' : 'cu ft';
}

export function litresToPints(l: number): number { return l / PINT_LITRE; }
export function litresToGallons(l: number): number { return l / GAL_LITRE; }
export function mlhToOzH(mlh: number): number { return mlh / 29.5735; }

export function fmt(n: number, digits = 1): string {
  if (!isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}
export function capacityLabel(lDay: number, units: Units): string {
  if (units === 'imperial') return `${fmt(litresToPints(lDay), 0)} pints/day`;
  return `${fmt(lDay, 1)} L/day`;
}
export function smallCapacityLabel(mlh: number, units: Units): string {
  if (units === 'imperial') return `${fmt(mlhToOzH(mlh), 0)} oz/h`;
  return `${fmt(mlh, 0)} mL/h`;
}
