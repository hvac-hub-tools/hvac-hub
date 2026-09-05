/**
 * Psychrometric calculations (standard HVAC engineering formulas)
 * Based on the Magnus formula for saturation vapour pressure and
 * the ASHRAE humidity-ratio relationship.
 */

export const AIR_DENSITY = 1.2; // kg/m³ (dry air at ~20°C, sea level)
export const ATM_PRESSURE = 101325; // Pa (standard atmospheric pressure)
export const GAS_CONSTANT_WATER = 461.5; // J/(kg·K)

/** Saturation vapour pressure in Pa (Magnus formula, ±0.1% accuracy 0–40°C) */
export function saturationVapourPressure(tempC: number): number {
  return 610.94 * Math.exp((17.625 * tempC) / (243.04 + tempC));
}

/** Actual vapour pressure in Pa */
export function actualVapourPressure(tempC: number, rh: number): number {
  return saturationVapourPressure(tempC) * (rh / 100);
}

/**
 * Humidity ratio W (kg water / kg dry air)
 * W = 0.622 · e / (P − e)
 */
export function humidityRatio(tempC: number, rh: number): number {
  const e = actualVapourPressure(tempC, rh);
  return (0.62198 * e) / (ATM_PRESSURE - e);
}

/** Absolute humidity in g/m³ */
export function absoluteHumidity(tempC: number, rh: number): number {
  const e = actualVapourPressure(tempC, rh);
  return (e / (GAS_CONSTANT_WATER * (tempC + 273.15))) * 1000;
}

/** Dew point temperature in °C */
export function dewPoint(tempC: number, rh: number): number {
  const e = actualVapourPressure(tempC, rh);
  const a = Math.log(e / 610.94);
  return (243.04 * a) / (17.625 - a);
}

/** Specific volume of moist air in m³/kg dry air (approx) */
export function specificVolume(tempC: number): number {
  return (287.058 * (tempC + 273.15)) / ATM_PRESSURE;
}

/**
 * Dehumidifier capacity derating factor vs. operating temperature.
 * Dehumidifiers are RATED at 30°C / 80% RH (European / Indian convention,
 * EN 810 / ISHRAE practice). Capacity falls sharply at lower temperatures
 * and coils frost below ~10°C.
 */
export function dehumidifierCapacityFactor(tempC: number): number {
  const t = tempC;
  if (t >= 30) return 1.0;
  if (t >= 27) return 0.95;
  if (t >= 24) return 0.88;
  if (t >= 21) return 0.8;
  if (t >= 18) return 0.7;
  if (t >= 15) return 0.58;
  if (t >= 12) return 0.45;
  if (t >= 10) return 0.35;
  return 0.25;
}

/** Comfort classification of relative humidity (ASHRAE 55 / Standard 62.1) */
export function comfortStatus(rh: number): { label: string; tone: 'good' | 'warn' | 'bad'; emoji: string; advice: string } {
  if (rh < 20) return { label: 'Extremely dry — health risk, very low humidity', tone: 'bad', emoji: '🏜️', advice: 'Humidifier strongly recommended — target 40–55% RH' };
  if (rh < 30) return { label: 'Too dry — static, dry skin, cracked wood', tone: 'warn', emoji: '🌵', advice: 'Consider a humidifier to reach 40–50%' };
  if (rh <= 60) return { label: 'Ideal comfort range — excellent!', tone: 'good', emoji: '✨', advice: 'No action needed — this is the ideal range (30–60%)' };
  if (rh <= 70) return { label: 'Humid — mould & condensation risk rising', tone: 'warn', emoji: '💧', advice: 'Use a dehumidifier to reach 50–55%' };
  return { label: 'Very humid — mould, mildew & condensation risk', tone: 'bad', emoji: '🌧️', advice: 'Dehumidifier strongly recommended!' };
}

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
export function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
