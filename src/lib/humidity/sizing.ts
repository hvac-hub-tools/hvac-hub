/**
 * Sizing engine for dehumidifiers and humidifiers.
 *
 * Method (dehumidifier): steady-state moisture balance —
 *   Total moisture load = ventilation ingress + people + showers + cooking
 *   + laundry + plants + aquarium + structural seepage (kg/day)
 *   Required operating capacity = load × safety factor
 *   Rated capacity (quoted at 30°C / 80% RH) = operating ÷ derating factor
 *
 * Method (humidifier): steady-state moisture loss —
 *   Ventilation loss = ρ·V·ACH·(W_target − W_outside)
 *   minus moisture added by occupants, × safety factor.
 *   Initial conditioning charge also computed for first run.
 */

import {
  AIR_DENSITY,
  humidityRatio,
  dehumidifierCapacityFactor,
  dewPoint,
} from './psychrometrics';
import {
  ActivityLevel,
  SeepageLevel,
  AbsorptionLevel,
  ACTIVITY_LEVELS,
  SEEPAGE_LEVELS,
  ABSORPTION_LEVELS,
  SOURCE_DEFAULTS,
  SAFETY_FACTOR_DEHUMIDIFIER,
  SAFETY_FACTOR_HUMIDIFIER,
  PEOPLE_RATE_SEDENTARY,
} from './constants';

export interface DehumidifierInput {
  lengthM: number;
  widthM: number;
  heightM: number;
  ach: number;
  indoorTempC: number;
  indoorRH: number; // current
  targetRH: number;
  outsideTempC: number;
  outsideRH: number;
  occupants: number;
  occupancyHours: number;
  activityLevel: ActivityLevel;
  showersPerDay: number;
  cookingMealsPerDay: number;
  dryingClothesHours: number;
  plantsCount: number;
  aquariumLiters: number;
  seepage: SeepageLevel;
}

export interface LoadItem {
  id: string;
  label: string;
  kgDay: number;
  color: string;
  detail: string;
}

export interface DehumidifierResult {
  volumeM3: number;
  areaM2: number;
  wCurrent: number; // g/kg
  wTarget: number; // g/kg
  wOutside: number; // g/kg
  dewPointC: number;
  loads: LoadItem[];
  totalLoadKgDay: number;
  requiredOperatingLDay: number; // at actual operating conditions
  ratedLDay: number; // equivalent @30°C/80% RH
  capacityFactor: number;
  comfortNote: string;
  comfortTone: 'good' | 'warn' | 'bad';
  ruleOfThumbLDay: number;
  ruleOfThumbLabel: string;
  needsDehumidification: boolean;
  loadPerM2: number;
}

export function calculateDehumidifier(input: DehumidifierInput): DehumidifierResult {
  const volumeM3 = input.lengthM * input.widthM * input.heightM;
  const areaM2 = input.lengthM * input.widthM;

  const wCurrent = humidityRatio(input.indoorTempC, input.indoorRH) * 1000; // g/kg
  const wTarget = humidityRatio(input.indoorTempC, input.targetRH) * 1000;
  const wOutside = humidityRatio(input.outsideTempC, input.outsideRH) * 1000;

  const activity = ACTIVITY_LEVELS.find((a) => a.id === input.activityLevel) ?? ACTIVITY_LEVELS[0];
  const seepage = SEEPAGE_LEVELS.find((s) => s.id === input.seepage) ?? SEEPAGE_LEVELS[0];

  // 1. Ventilation / infiltration moisture ingress (kg/day)
  //    Only when outside air is more humid than the target indoor air.
  const wOutKg = wOutside / 1000;
  const wTgtKg = wTarget / 1000;
  let ventKgDay = 0;
  if (wOutKg > wTgtKg) {
    ventKgDay = AIR_DENSITY * volumeM3 * input.ach * (wOutKg - wTgtKg) * 24;
  }

  // 2. People
  const peopleKgDay = input.occupants * activity.rate * input.occupancyHours;

  // 3. Showers
  const showerKgDay = input.showersPerDay * SOURCE_DEFAULTS.showerKg;

  // 4. Cooking
  const cookingKgDay = input.cookingMealsPerDay * SOURCE_DEFAULTS.cookingKgPerMeal;

  // 5. Laundry drying indoors
  const laundryKgDay = input.dryingClothesHours * SOURCE_DEFAULTS.laundryKgPerHour;

  // 6. Plants
  const plantsKgDay = input.plantsCount * SOURCE_DEFAULTS.plantKgPerHour * 24;

  // 7. Aquarium
  const aquariumKgDay = input.aquariumLiters * SOURCE_DEFAULTS.aquariumKgPerHourPerL * 24;

  // 8. Structural seepage
  const seepageKgDay = seepage.ratePerM2 * areaM2;

  const loads: LoadItem[] = [
    {
      id: 'ventilation',
      label: 'Ventilation / infiltration',
      kgDay: ventKgDay,
      color: '#0ea5e9',
      detail: `ρ·V·ACH·ΔW = 1.2 × ${volumeM3.toFixed(1)} × ${input.ach} × (${wOutKg.toFixed(5)} − ${wTgtKg.toFixed(5)}) × 24 h`,
    },
    {
      id: 'people',
      label: 'Occupants',
      kgDay: peopleKgDay,
      color: '#f59e0b',
      detail: `${input.occupants} person × ${activity.rate} kg/h × ${input.occupancyHours} h`,
    },
    {
      id: 'showers',
      label: 'Showers / bathing',
      kgDay: showerKgDay,
      color: '#06b6d4',
      detail: `${input.showersPerDay} shower × ~0.25 kg each`,
    },
    {
      id: 'cooking',
      label: 'Cooking',
      kgDay: cookingKgDay,
      color: '#f97316',
      detail: `${input.cookingMealsPerDay} meals × ~0.3 kg each`,
    },
    {
      id: 'laundry',
      label: 'Clothes drying',
      kgDay: laundryKgDay,
      color: '#8b5cf6',
      detail: `${input.dryingClothesHours} h × ~0.15 kg/h`,
    },
    {
      id: 'plants',
      label: 'Plants',
      kgDay: plantsKgDay,
      color: '#22c55e',
      detail: `${input.plantsCount} plants × 0.006 kg/h × 24 h`,
    },
    {
      id: 'aquarium',
      label: 'Aquarium / open water',
      kgDay: aquariumKgDay,
      color: '#3b82f6',
      detail: `${input.aquariumLiters} L open surface`,
    },
    {
      id: 'seepage',
      label: 'Seepage / damp walls',
      kgDay: seepageKgDay,
      color: '#ef4444',
      detail: `${seepage.label} (${seepage.ratePerM2} kg/day/m²) × ${areaM2.toFixed(1)} m²`,
    },
  ];

  const totalLoadKgDay = loads.reduce((s, l) => s + l.kgDay, 0);

  // Required capacity in operating conditions, then convert to the
  // manufacturer's rated condition (30°C / 80% RH).
  const requiredOperatingLDay = totalLoadKgDay * SAFETY_FACTOR_DEHUMIDIFIER;
  const capacityFactor = dehumidifierCapacityFactor(input.indoorTempC);
  const ratedLDay = capacityFactor > 0 ? requiredOperatingLDay / capacityFactor : requiredOperatingLDay * 4;

  // Rule-of-thumb cross-check (AHAM style: 10 pints ≈ 4.7 L per 46 m²)
  const loadPerM2 = areaM2 > 0 ? totalLoadKgDay / areaM2 : 0;
  let ruleOfThumbLDay: number;
  let ruleOfThumbLabel: string;
  if (loadPerM2 <= 0.1) {
    ruleOfThumbLDay = areaM2 * 0.101;
    ruleOfThumbLabel = 'Mildly damp (10 pints / 500 sq ft)';
  } else if (loadPerM2 <= 0.2) {
    ruleOfThumbLDay = areaM2 * 0.202;
    ruleOfThumbLabel = 'Very damp (20 pints / 500 sq ft)';
  } else {
    ruleOfThumbLDay = areaM2 * 0.35;
    ruleOfThumbLabel = 'Wet / seepage (35 pints / 500 sq ft)';
  }

  return {
    volumeM3,
    areaM2,
    wCurrent,
    wTarget,
    wOutside,
    dewPointC: dewPoint(input.indoorTempC, input.indoorRH),
    loads,
    totalLoadKgDay,
    requiredOperatingLDay,
    ratedLDay,
    capacityFactor,
    comfortNote: '',
    comfortTone: 'good',
    ruleOfThumbLDay,
    ruleOfThumbLabel,
    needsDehumidification: input.indoorRH > input.targetRH,
    loadPerM2,
  };
}

/* ------------------------------ Humidifier ------------------------------ */

export interface HumidifierInput {
  lengthM: number;
  widthM: number;
  heightM: number;
  ach: number;
  indoorTempC: number;
  currentRH: number;
  targetRH: number;
  outsideTempC: number;
  outsideRH: number;
  occupants: number;
  occupancyHours: number;
  absorption: AbsorptionLevel;
}

export interface HumidifierResult {
  volumeM3: number;
  areaM2: number;
  wCurrent: number;
  wTarget: number;
  wOutside: number;
  ventLossKgH: number; // moisture that must be added to offset dry air
  peopleGainKgH: number;
  netKgH: number;
  requiredOutputMLh: number; // recommended steady output (mL/h)
  dailyNeedL: number; // L/day to maintain target
  initChargeKg: number; // kg to condition room from current → target initially
  comfortNote: string;
  comfortTone: 'good' | 'warn' | 'bad';
  targetWarn: string | null;
  absorptionFactor: number;
}

export function calculateHumidifier(input: HumidifierInput): HumidifierResult {
  const volumeM3 = input.lengthM * input.widthM * input.heightM;
  const areaM2 = input.lengthM * input.widthM;

  const wCurrent = humidityRatio(input.indoorTempC, input.currentRH) * 1000;
  const wTarget = humidityRatio(input.indoorTempC, input.targetRH) * 1000;
  const wOutside = humidityRatio(input.outsideTempC, input.outsideRH) * 1000;

  // Steady-state moisture lost through ventilation / infiltration (kg/h)
  // Q = ρ · V · ACH · ΔW  (ACH is already per-hour → result is kg/h)
  let ventLossKgH = 0;
  if (wOutside / 1000 < wTarget / 1000) {
    ventLossKgH = AIR_DENSITY * volumeM3 * input.ach * ((wTarget - wOutside) / 1000);
  }

  // Occupants add moisture (reduces humidifier need slightly)
  const peopleGainKgH = (input.occupants * PEOPLE_RATE_SEDENTARY * input.occupancyHours) / 24;

  const netKgH = Math.max(0, ventLossKgH - peopleGainKgH);
  const absorption = ABSORPTION_LEVELS.find((a) => a.id === input.absorption) ?? ABSORPTION_LEVELS[1];

  const requiredOutputMLh = netKgH * SAFETY_FACTOR_HUMIDIFIER * 1000;
  const dailyNeedL = (netKgH * 24 * SAFETY_FACTOR_HUMIDIFIER);

  // Initial conditioning: kg of water to raise humidity from current to target
  const initDeficitKg = AIR_DENSITY * volumeM3 * ((wTarget - wCurrent) / 1000);
  const initChargeKg = Math.max(0, initDeficitKg) * absorption.factor;

  let targetWarn: string | null = null;
  if (input.targetRH < 30) targetWarn = 'Below 30% RH can cause static shock, dry skin & cracked wood — raise your target.';
  if (input.targetRH > 60) targetWarn = 'Above 60% RH risks mould & condensation — keep the target between 40–55%.';

  const comfort = input.currentRH >= 60 ? 'already humid' : 'dry';
  void comfort;

  return {
    volumeM3,
    areaM2,
    wCurrent,
    wTarget,
    wOutside,
    ventLossKgH,
    peopleGainKgH,
    netKgH,
    requiredOutputMLh,
    dailyNeedL,
    initChargeKg,
    comfortNote: '',
    comfortTone: 'good',
    targetWarn,
    absorptionFactor: absorption.factor,
  };
}

/** Pick the recommended dehumidifier class */
export function recommendDehumidifierClass(ratedLDay: number) {
  const classes = [
    { maxLDay: 8, index: 0 },
    { maxLDay: 12, index: 1 },
    { maxLDay: 16, index: 2 },
    { maxLDay: 20, index: 3 },
    { maxLDay: 25, index: 4 },
    { maxLDay: 30, index: 5 },
    { maxLDay: 50, index: 6 },
    { maxLDay: Infinity, index: 7 },
  ];
  const hit = classes.find((c) => ratedLDay <= c.maxLDay) ?? classes[classes.length - 1];
  return hit.index;
}

/** Pick the recommended humidifier class */
export function recommendHumidifierClass(requiredMLh: number) {
  if (requiredMLh <= 250) return 0;
  if (requiredMLh <= 450) return 1;
  if (requiredMLh <= 700) return 2;
  if (requiredMLh <= 1000) return 3;
  return 4;
}
