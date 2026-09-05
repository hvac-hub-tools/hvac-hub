/**
 * Engineering reference data: room types, moisture-source emission rates,
 * Worldwide climate presets and commercial product capacity tiers.
 */

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy';
export type SeepageLevel = 'none' | 'light' | 'moderate' | 'heavy';
export type AbsorptionLevel = 'low' | 'medium' | 'high';

export interface RoomType {
  id: string;
  label: string;
  ach: number;
  hint: string;
  icon?: string;
}

export const ROOM_TYPES: RoomType[] = [
  { id: 'bedroom', label: 'Bedroom (Normal occupancy)', ach: 0.8, hint: 'Closed bedroom, low air change — 10–20 m² typical' },
  { id: 'living', label: 'Living Room (Higher ventilation)', ach: 1.0, hint: 'Average residential living space' },
  { id: 'hotel', label: 'Hotel Room (Inc. shower vapor load)', ach: 1.5, hint: 'Fresh-air ventilation from HVAC — coastal & monsoon hotels' },
  { id: 'bathroom', label: 'Bathroom (High steam load)', ach: 2.0, hint: 'Exhaust ventilated, high moisture' },
  { id: 'kitchen', label: 'Kitchen (High moisture from cooking)', ach: 2.5, hint: 'Cooking steam + exhaust' },
  { id: 'basement', label: 'Basement / Cellar (Low ventilation, high dampness)', ach: 0.4, hint: 'Sealed, prone to seepage & damp walls' },
  { id: 'server', label: 'Server / IT Room (Strict moisture criteria)', ach: 2.0, hint: 'Mechanical ventilation, 24×7 load' },
  { id: 'gym', label: 'Gym / Studio (High sweat evaporation load)', ach: 1.5, hint: 'High occupancy & perspiration load' },
  { id: 'warehouse', label: 'Warehouse / Store (Large storage area)', ach: 0.5, hint: 'Large volume, low air change' },
  { id: 'office', label: 'Office / Classroom (Medium occupancy)', ach: 1.2, hint: 'HVAC ventilated office space' },
  { id: 'custom', label: 'Custom Specifications', ach: 0.8, hint: 'Set your own air-change rate below' },
];

export interface ActivityOption { id: ActivityLevel; label: string; rate: number; hint: string; }
export const ACTIVITY_LEVELS: ActivityOption[] = [
  { id: 'sedentary', label: 'Resting / Sleeping', rate: 0.04, hint: '40 g/h per person' },
  { id: 'light', label: 'Light activity', rate: 0.06, hint: '60 g/h per person' },
  { id: 'moderate', label: 'Moderate activity', rate: 0.09, hint: '90 g/h per person' },
  { id: 'heavy', label: 'Heavy / Gym work', rate: 0.14, hint: '140 g/h per person' },
];

export interface SeepageOption { id: SeepageLevel; label: string; ratePerM2: number; hint: string; }
export const SEEPAGE_LEVELS: SeepageOption[] = [
  { id: 'none', label: 'None', ratePerM2: 0, hint: 'Dry walls & floor' },
  { id: 'light', label: 'Light dampness', ratePerM2: 0.08, hint: 'Slight musty smell, damp corners' },
  { id: 'moderate', label: 'Moderate seepage', ratePerM2: 0.2, hint: 'Visible damp patches on walls' },
  { id: 'heavy', label: 'Heavy / flooding', ratePerM2: 0.4, hint: 'Standing water, saturated walls' },
];

export interface AbsorptionOption { id: AbsorptionLevel; label: string; factor: number; hint: string; }
export const ABSORPTION_LEVELS: AbsorptionOption[] = [
  { id: 'low', label: 'Light furniture', factor: 1.1, hint: 'Few soft furnishings, tiled room' },
  { id: 'medium', label: 'Normal furnishing', factor: 1.2, hint: 'Typical bedroom / living room' },
  { id: 'high', label: 'Heavy wood & fabric', factor: 1.35, hint: 'Wood panelling, carpets, curtains, books' },
];

/* ------------------------- Climate presets — WORLDWIDE ------------------------- */

export interface ClimatePreset {
  id: string;
  city: string;
  season: string;
  tempC: number;
  rh: number;
  tag: 'humid' | 'dry' | 'moderate';
  region: string;
}

export const CLIMATE_PRESETS: ClimatePreset[] = [
  // India
  { id: 'goa-monsoon', city: 'Goa (India) — coastal', season: 'Monsoon / rainy', tempC: 27, rh: 88, tag: 'humid', region: 'India' },
  { id: 'goa-summer', city: 'Goa (India) — coastal', season: 'Summer', tempC: 31, rh: 78, tag: 'humid', region: 'India' },
  { id: 'goa-winter', city: 'Goa (India) — coastal', season: 'Winter', tempC: 26, rh: 62, tag: 'moderate', region: 'India' },
  { id: 'mumbai-monsoon', city: 'Mumbai, India', season: 'Monsoon / rainy', tempC: 28, rh: 88, tag: 'humid', region: 'India' },
  { id: 'chennai', city: 'Chennai, India', season: 'Humid all year', tempC: 32, rh: 72, tag: 'humid', region: 'India' },
  { id: 'kolkata', city: 'Kolkata, India', season: 'Monsoon / rainy', tempC: 30, rh: 85, tag: 'humid', region: 'India' },
  { id: 'bengaluru', city: 'Bengaluru, India', season: 'Average year', tempC: 27, rh: 62, tag: 'moderate', region: 'India' },
  { id: 'delhi-winter', city: 'Delhi / NCR, India', season: 'Winter (dry)', tempC: 11, rh: 45, tag: 'dry', region: 'India' },
  { id: 'delhi-summer', city: 'Delhi / NCR, India', season: 'Summer', tempC: 36, rh: 38, tag: 'dry', region: 'India' },
  { id: 'jaipur', city: 'Jaipur / Rajasthan, India', season: 'Dry season', tempC: 30, rh: 35, tag: 'dry', region: 'India' },
  { id: 'hyderabad', city: 'Hyderabad, India', season: 'Summer', tempC: 35, rh: 45, tag: 'dry', region: 'India' },
  { id: 'hill-station', city: 'Shimla (Hill station), India', season: 'Winter', tempC: 4, rh: 42, tag: 'dry', region: 'India' },
  // Middle East & Africa
  { id: 'dubai-summer', city: 'Dubai, UAE', season: 'Summer (extreme humid)', tempC: 38, rh: 68, tag: 'humid', region: 'Middle East' },
  { id: 'dubai-winter', city: 'Dubai, UAE', season: 'Winter', tempC: 24, rh: 60, tag: 'moderate', region: 'Middle East' },
  { id: 'riyadh', city: 'Riyadh, Saudi Arabia', season: 'Dry desert', tempC: 38, rh: 18, tag: 'dry', region: 'Middle East' },
  { id: 'cairo', city: 'Cairo, Egypt', season: 'Summer', tempC: 34, rh: 45, tag: 'dry', region: 'Middle East' },
  // Southeast Asia & East Asia
  { id: 'singapore', city: 'Singapore', season: 'All year (tropical)', tempC: 30, rh: 84, tag: 'humid', region: 'Asia Pacific' },
  { id: 'bangkok', city: 'Bangkok, Thailand', season: 'Rainy season', tempC: 31, rh: 82, tag: 'humid', region: 'Asia Pacific' },
  { id: 'manila', city: 'Manila, Philippines', season: 'Monsoon', tempC: 29, rh: 85, tag: 'humid', region: 'Asia Pacific' },
  { id: 'jakarta', city: 'Jakarta, Indonesia', season: 'Humid tropical', tempC: 31, rh: 80, tag: 'humid', region: 'Asia Pacific' },
  { id: 'tokyo-summer', city: 'Tokyo, Japan', season: 'Summer (muggy)', tempC: 30, rh: 75, tag: 'humid', region: 'Asia Pacific' },
  { id: 'tokyo-winter', city: 'Tokyo, Japan', season: 'Winter (dry)', tempC: 8, rh: 42, tag: 'dry', region: 'Asia Pacific' },
  { id: 'beijing-winter', city: 'Beijing, China', season: 'Winter', tempC: -2, rh: 35, tag: 'dry', region: 'Asia Pacific' },
  { id: 'sydney-summer', city: 'Sydney, Australia', season: 'Summer', tempC: 26, rh: 65, tag: 'moderate', region: 'Asia Pacific' },
  // Europe
  { id: 'london-winter', city: 'London, UK', season: 'Winter (damp)', tempC: 6, rh: 82, tag: 'humid', region: 'Europe' },
  { id: 'london-summer', city: 'London, UK', season: 'Summer', tempC: 22, rh: 62, tag: 'moderate', region: 'Europe' },
  { id: 'berlin-winter', city: 'Berlin, Germany', season: 'Winter', tempC: 1, rh: 78, tag: 'humid', region: 'Europe' },
  { id: 'moscow-winter', city: 'Moscow, Russia', season: 'Winter', tempC: -8, rh: 82, tag: 'humid', region: 'Europe' },
  { id: 'madrid-summer', city: 'Madrid, Spain', season: 'Summer (dry)', tempC: 33, rh: 32, tag: 'dry', region: 'Europe' },
  // Americas
  { id: 'nyc-summer', city: 'New York, USA', season: 'Summer (humid)', tempC: 29, rh: 68, tag: 'moderate', region: 'Americas' },
  { id: 'nyc-winter', city: 'New York, USA', season: 'Winter (dry indoor)', tempC: 0, rh: 45, tag: 'dry', region: 'Americas' },
  { id: 'miami', city: 'Miami, USA', season: 'All year (humid)', tempC: 30, rh: 76, tag: 'humid', region: 'Americas' },
  { id: 'la', city: 'Los Angeles, USA', season: 'Average', tempC: 24, rh: 58, tag: 'moderate', region: 'Americas' },
  { id: 'mexico-city', city: 'Mexico City, Mexico', season: 'Dry season', tempC: 22, rh: 42, tag: 'dry', region: 'Americas' },
  { id: 'sao-paulo', city: 'São Paulo, Brazil', season: 'Summer', tempC: 27, rh: 78, tag: 'humid', region: 'Americas' },
  // Other
  { id: 'capetown-summer', city: 'Cape Town, SA', season: 'Summer', tempC: 26, rh: 62, tag: 'moderate', region: 'Africa' },
  { id: 'custom', city: 'Custom', season: 'Manual entry', tempC: 25, rh: 60, tag: 'moderate', region: 'Other' },
];

export const CLIMATE_REGIONS = ['All', 'India', 'Asia Pacific', 'Middle East', 'Europe', 'Americas', 'Africa', 'Other'] as const;

/* ------------------- Dehumidifier product classes ------------------- */
export interface DehumidifierClass { maxLDay: number; label: string; coverageM2: string; typical: string; notes: string; }
export const DEHUMIDIFIER_CLASSES: DehumidifierClass[] = [
  { maxLDay: 8, label: 'Up to 8 L/day', coverageM2: '10 – 18 m²', typical: 'Portable units (Blue Star, Voltas, Amcor, Kent)', notes: 'Compact bedrooms, wardrobes, small hotel rooms' },
  { maxLDay: 12, label: '8 – 12 L/day', coverageM2: '18 – 30 m²', typical: 'Portable mid-range (Voltas, Blue Star, Sharp, Panasonic)', notes: 'Standard bedrooms & hotel rooms, mildly damp' },
  { maxLDay: 16, label: '12 – 16 L/day', coverageM2: '30 – 45 m²', typical: 'Mid-size portable (Sharp, Panasonic, Honeywell)', notes: 'Living rooms, large hotel rooms (Goa monsoon)' },
  { maxLDay: 20, label: '16 – 20 L/day', coverageM2: '40 – 55 m²', typical: 'Large portable (Blue Star, Voltas, Amcor, ETA)', notes: 'Large living areas, coastal monsoon duty' },
  { maxLDay: 25, label: '20 – 25 L/day', coverageM2: '50 – 70 m²', typical: 'Heavy portable / semi-commercial', notes: 'Basements, showrooms, server rooms' },
  { maxLDay: 30, label: '25 – 30 L/day', coverageM2: '70 – 90 m²', typical: 'Semi-commercial units', notes: 'Large basements, warehouses, gyms' },
  { maxLDay: 50, label: '30 – 50 L/day', coverageM2: '90 – 140 m²', typical: 'Commercial dehumidifiers', notes: 'Industrial stores, water-damage restoration' },
  { maxLDay: Infinity, label: 'Above 50 L/day', coverageM2: '140 m² +', typical: 'Industrial / desiccant systems', notes: 'Consult an HVAC engineer for ducted systems' },
];

/* ------------------- Humidifier product classes ------------------- */
export interface HumidifierClass { maxMLh: number; label: string; coverageM2: string; types: string; notes: string; }
export const HUMIDIFIER_CLASSES: HumidifierClass[] = [
  { maxMLh: 250, label: 'Up to 250 mL/h', coverageM2: '10 – 20 m²', types: 'Ultrasonic / small evaporative', notes: 'Compact bedrooms, baby rooms, study' },
  { maxMLh: 450, label: '250 – 450 mL/h', coverageM2: '20 – 35 m²', types: 'Ultrasonic / evaporative', notes: 'Bedrooms, small living rooms (dry winter)' },
  { maxMLh: 700, label: '450 – 700 mL/h', coverageM2: '35 – 60 m²', types: 'Large evaporative / warm-mist', notes: 'Living rooms, open-plan spaces' },
  { maxMLh: 1000, label: '700 – 1000 mL/h', coverageM2: '60 – 100 m²', types: 'Steam humidifier / large evaporative', notes: 'Whole apartments, offices, wood-floored rooms' },
  { maxMLh: Infinity, label: 'Above 1000 mL/h', coverageM2: '100 m² +', types: 'Central / whole-house systems', notes: 'Ducted steam or evaporative — consult an engineer' },
];

export const SOURCE_DEFAULTS = {
  showerKg: 0.25,
  cookingKgPerMeal: 0.3,
  laundryKgPerHour: 0.15,
  plantKgPerHour: 0.006,
  aquariumKgPerHourPerL: 0.0002,
};
export const SAFETY_FACTOR_DEHUMIDIFIER = 1.25;
export const SAFETY_FACTOR_HUMIDIFIER = 1.15;
export const PEOPLE_RATE_SEDENTARY = 0.04;
