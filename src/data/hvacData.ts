export type PhaseType = "Single Phase" | "Three Phase";

export interface UnitSpec {
  model: string;
  capacity_tr: number;
  capacity_kw?: number;
  voltage: string;
  phase: PhaseType;
  frequency: string;
  running_current_a: number;
  starting_current_a?: number;
  power_input_kw: number;
  mca: number; // Minimum Circuit Ampacity
  mop: number; // Maximum Over Current Protection (Fuse/Breaker)
  notes?: string;
}

// ─────────────────────────────────────────────
// 1. DX UNITS
// ─────────────────────────────────────────────

export interface DXCategory {
  type: string;
  units: UnitSpec[];
}

export const dxData: DXCategory[] = [
  {
    type: "Split AC – Indoor (Fan Coil / IDU)",
    units: [
      { model: "0.75 TR Split IDU", capacity_tr: 0.75, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.4, power_input_kw: 0.09, mca: 1.0, mop: 6 },
      { model: "1.0 TR Split IDU", capacity_tr: 1.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.5, power_input_kw: 0.11, mca: 1.5, mop: 6 },
      { model: "1.5 TR Split IDU", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.6, power_input_kw: 0.14, mca: 2.0, mop: 6 },
      { model: "2.0 TR Split IDU", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.7, power_input_kw: 0.16, mca: 2.0, mop: 10 },
    ],
  },
  {
    type: "Split AC – Outdoor Unit (ODU)",
    units: [
      { model: "0.75 TR Split ODU", capacity_tr: 0.75, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 3.5, starting_current_a: 18, power_input_kw: 0.75, mca: 5.0, mop: 16 },
      { model: "1.0 TR Split ODU", capacity_tr: 1.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 4.5, starting_current_a: 22, power_input_kw: 0.98, mca: 6.5, mop: 20 },
      { model: "1.5 TR Split ODU", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 6.5, starting_current_a: 30, power_input_kw: 1.45, mca: 9.0, mop: 25 },
      { model: "2.0 TR Split ODU", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 8.8, starting_current_a: 40, power_input_kw: 1.95, mca: 12.0, mop: 32 },
      { model: "2.5 TR Split ODU", capacity_tr: 2.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 11.0, starting_current_a: 50, power_input_kw: 2.40, mca: 15.0, mop: 40 },
      { model: "3.0 TR Split ODU", capacity_tr: 3.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 5.5, starting_current_a: 28, power_input_kw: 3.20, mca: 8.0, mop: 20 },
    ],
  },
  {
    type: "Cassette AC (4-Way) – ODU",
    units: [
      { model: "1.5 TR Cassette ODU", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 6.8, starting_current_a: 32, power_input_kw: 1.50, mca: 9.5, mop: 25 },
      { model: "2.0 TR Cassette ODU", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 9.0, starting_current_a: 42, power_input_kw: 2.00, mca: 12.5, mop: 32 },
      { model: "2.5 TR Cassette ODU", capacity_tr: 2.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 11.5, starting_current_a: 52, power_input_kw: 2.55, mca: 16.0, mop: 40 },
      { model: "3.0 TR Cassette ODU", capacity_tr: 3.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 5.8, starting_current_a: 30, power_input_kw: 3.30, mca: 8.5, mop: 25 },
      { model: "4.0 TR Cassette ODU", capacity_tr: 4.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 7.5, starting_current_a: 38, power_input_kw: 4.20, mca: 11.0, mop: 32 },
      { model: "5.0 TR Cassette ODU", capacity_tr: 5.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 9.2, starting_current_a: 46, power_input_kw: 5.20, mca: 13.5, mop: 40 },
    ],
  },
  {
    type: "Ductable / Ducted Split Unit (AHU type DX)",
    units: [
      { model: "2.0 TR Ductable", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 9.5, starting_current_a: 45, power_input_kw: 2.10, mca: 13.0, mop: 32, notes: "IDU fan: ~0.37kW extra" },
      { model: "3.0 TR Ductable", capacity_tr: 3.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 5.8, starting_current_a: 28, power_input_kw: 3.20, mca: 8.5, mop: 25, notes: "IDU fan: ~0.55kW extra" },
      { model: "4.0 TR Ductable", capacity_tr: 4.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 7.8, starting_current_a: 38, power_input_kw: 4.30, mca: 11.5, mop: 32, notes: "IDU fan: ~0.75kW extra" },
      { model: "5.0 TR Ductable", capacity_tr: 5.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 9.5, starting_current_a: 46, power_input_kw: 5.30, mca: 14.0, mop: 40, notes: "IDU fan: ~0.75kW extra" },
      { model: "6.0 TR Ductable", capacity_tr: 6.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 11.5, starting_current_a: 55, power_input_kw: 6.40, mca: 17.0, mop: 50, notes: "IDU fan: ~1.1kW extra" },
      { model: "7.5 TR Ductable", capacity_tr: 7.5, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 14.5, starting_current_a: 68, power_input_kw: 8.00, mca: 21.0, mop: 63, notes: "IDU fan: ~1.5kW extra" },
      { model: "10.0 TR Ductable", capacity_tr: 10.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 18.5, starting_current_a: 88, power_input_kw: 10.50, mca: 27.0, mop: 80, notes: "IDU fan: ~2.2kW extra" },
      { model: "12.5 TR Ductable", capacity_tr: 12.5, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 23.0, starting_current_a: 108, power_input_kw: 13.00, mca: 33.0, mop: 100, notes: "IDU fan: ~2.2kW extra" },
      { model: "15.0 TR Ductable", capacity_tr: 15.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 27.5, starting_current_a: 130, power_input_kw: 15.50, mca: 40.0, mop: 125, notes: "IDU fan: ~3.0kW extra" },
    ],
  },
  {
    type: "Package Unit (Rooftop / Floor Mounted DX)",
    units: [
      { model: "5.0 TR Package Unit", capacity_tr: 5.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 12.0, starting_current_a: 58, power_input_kw: 6.50, mca: 17.5, mop: 50 },
      { model: "7.5 TR Package Unit", capacity_tr: 7.5, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 17.0, starting_current_a: 80, power_input_kw: 9.00, mca: 25.0, mop: 63 },
      { model: "10.0 TR Package Unit", capacity_tr: 10.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 22.0, starting_current_a: 104, power_input_kw: 12.00, mca: 32.0, mop: 80 },
      { model: "12.5 TR Package Unit", capacity_tr: 12.5, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 27.0, starting_current_a: 128, power_input_kw: 14.80, mca: 39.0, mop: 100 },
      { model: "15.0 TR Package Unit", capacity_tr: 15.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 31.0, starting_current_a: 148, power_input_kw: 17.50, mca: 45.0, mop: 125 },
      { model: "20.0 TR Package Unit", capacity_tr: 20.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 40.0, starting_current_a: 190, power_input_kw: 22.50, mca: 58.0, mop: 160 },
    ],
  },
];

// ─────────────────────────────────────────────
// 2. VRV / VRF UNITS
// ─────────────────────────────────────────────

export interface VRVCategory {
  type: string;
  units: UnitSpec[];
}

export const vrvIndoorData: VRVCategory[] = [
  {
    type: "Wall Mounted IDU",
    units: [
      { model: "0.75 TR Wall IDU", capacity_tr: 0.75, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.35, power_input_kw: 0.07, mca: 1.0, mop: 6 },
      { model: "1.0 TR Wall IDU", capacity_tr: 1.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.45, power_input_kw: 0.09, mca: 1.5, mop: 6 },
      { model: "1.5 TR Wall IDU", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.55, power_input_kw: 0.12, mca: 2.0, mop: 10 },
      { model: "2.0 TR Wall IDU", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.65, power_input_kw: 0.14, mca: 2.0, mop: 10 },
    ],
  },
  {
    type: "Cassette IDU (4-Way)",
    units: [
      { model: "0.75 TR Cassette IDU", capacity_tr: 0.75, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.40, power_input_kw: 0.08, mca: 1.0, mop: 6 },
      { model: "1.0 TR Cassette IDU", capacity_tr: 1.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.50, power_input_kw: 0.10, mca: 1.5, mop: 6 },
      { model: "1.5 TR Cassette IDU", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.60, power_input_kw: 0.13, mca: 2.0, mop: 10 },
      { model: "2.0 TR Cassette IDU", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.75, power_input_kw: 0.16, mca: 2.5, mop: 10 },
      { model: "2.5 TR Cassette IDU", capacity_tr: 2.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.85, power_input_kw: 0.18, mca: 3.0, mop: 10 },
      { model: "3.0 TR Cassette IDU", capacity_tr: 3.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.00, power_input_kw: 0.22, mca: 3.5, mop: 16 },
    ],
  },
  {
    type: "Ducted IDU (Medium / High Static)",
    units: [
      { model: "1.0 TR Ducted IDU", capacity_tr: 1.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.80, power_input_kw: 0.17, mca: 2.0, mop: 10 },
      { model: "1.5 TR Ducted IDU", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.00, power_input_kw: 0.22, mca: 2.5, mop: 10 },
      { model: "2.0 TR Ducted IDU", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.20, power_input_kw: 0.26, mca: 3.0, mop: 10 },
      { model: "2.5 TR Ducted IDU", capacity_tr: 2.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.50, power_input_kw: 0.33, mca: 4.0, mop: 16 },
      { model: "3.0 TR Ducted IDU", capacity_tr: 3.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.80, power_input_kw: 0.40, mca: 4.5, mop: 16 },
      { model: "4.0 TR Ducted IDU", capacity_tr: 4.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 2.20, power_input_kw: 0.48, mca: 5.5, mop: 20 },
      { model: "5.0 TR Ducted IDU", capacity_tr: 5.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 2.70, power_input_kw: 0.59, mca: 6.5, mop: 20 },
    ],
  },
  {
    type: "Floor Standing / Concealed IDU",
    units: [
      { model: "1.5 TR Floor IDU", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.70, power_input_kw: 0.15, mca: 2.0, mop: 10 },
      { model: "2.0 TR Floor IDU", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.90, power_input_kw: 0.20, mca: 2.5, mop: 10 },
      { model: "3.0 TR Floor IDU", capacity_tr: 3.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.20, power_input_kw: 0.26, mca: 3.0, mop: 16 },
    ],
  },
];

export const vrvOutdoorData: VRVCategory[] = [
  {
    type: "VRV/VRF Outdoor Unit (Single Phase)",
    units: [
      { model: "2.0 TR VRV ODU", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 10.0, starting_current_a: 45, power_input_kw: 2.20, mca: 14.5, mop: 40 },
      { model: "2.5 TR VRV ODU", capacity_tr: 2.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 12.5, starting_current_a: 55, power_input_kw: 2.75, mca: 18.0, mop: 50 },
      { model: "3.0 TR VRV ODU", capacity_tr: 3.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 14.5, starting_current_a: 65, power_input_kw: 3.20, mca: 21.0, mop: 63 },
    ],
  },
  {
    type: "VRV/VRF Outdoor Unit (Three Phase)",
    units: [
      { model: "4.0 TR VRV ODU", capacity_tr: 4.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 7.5, starting_current_a: 35, power_input_kw: 4.40, mca: 11.0, mop: 32 },
      { model: "5.0 TR VRV ODU", capacity_tr: 5.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 9.2, starting_current_a: 43, power_input_kw: 5.50, mca: 13.5, mop: 40 },
      { model: "6.0 TR VRV ODU", capacity_tr: 6.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 11.0, starting_current_a: 52, power_input_kw: 6.60, mca: 16.0, mop: 50 },
      { model: "7.0 TR VRV ODU", capacity_tr: 7.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 12.8, starting_current_a: 60, power_input_kw: 7.70, mca: 18.5, mop: 63 },
      { model: "8.0 TR VRV ODU", capacity_tr: 8.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 14.5, starting_current_a: 68, power_input_kw: 8.80, mca: 21.0, mop: 63 },
      { model: "10.0 TR VRV ODU", capacity_tr: 10.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 18.0, starting_current_a: 84, power_input_kw: 11.00, mca: 26.0, mop: 80 },
      { model: "12.0 TR VRV ODU", capacity_tr: 12.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 21.5, starting_current_a: 100, power_input_kw: 13.20, mca: 31.0, mop: 100 },
      { model: "14.0 TR VRV ODU", capacity_tr: 14.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 25.0, starting_current_a: 116, power_input_kw: 15.40, mca: 36.0, mop: 100 },
      { model: "16.0 TR VRV ODU", capacity_tr: 16.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 28.5, starting_current_a: 132, power_input_kw: 17.60, mca: 41.0, mop: 125 },
      { model: "18.0 TR VRV ODU", capacity_tr: 18.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 32.0, starting_current_a: 148, power_input_kw: 19.80, mca: 46.0, mop: 125 },
      { model: "20.0 TR VRV ODU", capacity_tr: 20.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 35.5, starting_current_a: 164, power_input_kw: 22.00, mca: 51.0, mop: 160 },
      { model: "22.0 TR VRV ODU", capacity_tr: 22.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 39.0, starting_current_a: 180, power_input_kw: 24.20, mca: 56.0, mop: 160 },
      { model: "24.0 TR VRV ODU", capacity_tr: 24.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 42.5, starting_current_a: 196, power_input_kw: 26.40, mca: 61.0, mop: 200 },
    ],
  },
];

// ─────────────────────────────────────────────
// 3. CHW INDOOR UNITS (FCU / AHU)
// ─────────────────────────────────────────────

export interface CHWCategory {
  type: string;
  units: UnitSpec[];
}

export const chwIndoorData: CHWCategory[] = [
  {
    type: "Hi-Wall Unit",
    units: [
      { model: "CHW-HW-1.0 TR", capacity_tr: 1.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.45, power_input_kw: 0.10, mca: 1.5, mop: 6 },
      { model: "CHW-HW-1.5 TR", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.60, power_input_kw: 0.13, mca: 2.0, mop: 6 },
      { model: "CHW-HW-2.0 TR", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.75, power_input_kw: 0.16, mca: 2.5, mop: 10 },
    ],
  },
  {
    type: "Cassette (4-Way)",
    units: [
      { model: "CHW-CAS-1.5 TR", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.65, power_input_kw: 0.14, mca: 2.0, mop: 10 },
      { model: "CHW-CAS-2.0 TR", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.85, power_input_kw: 0.18, mca: 3.0, mop: 10 },
      { model: "CHW-CAS-3.0 TR", capacity_tr: 3.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.20, power_input_kw: 0.25, mca: 4.0, mop: 16 },
      { model: "CHW-CAS-4.0 TR", capacity_tr: 4.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.50, power_input_kw: 0.32, mca: 5.0, mop: 16 },
    ],
  },
  {
    type: "1-Way Cassette",
    units: [
      { model: "1-Way 0.75 TR", capacity_tr: 0.75, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.35, power_input_kw: 0.08, mca: 1.0, mop: 6 },
      { model: "1-Way 1.0 TR", capacity_tr: 1.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.45, power_input_kw: 0.10, mca: 1.5, mop: 6 },
    ],
  },
  {
    type: "CSU (Ceiling Suspended)",
    units: [
      { model: "CSU 2.0 TR", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.90, power_input_kw: 0.20, mca: 2.5, mop: 10 },
      { model: "CSU 3.0 TR", capacity_tr: 3.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.30, power_input_kw: 0.28, mca: 4.0, mop: 16 },
    ],
  },
  {
    type: "AHU (Air Handling Unit)",
    units: [
      { model: "AHU 2000 CFM", capacity_tr: 5.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 2.5, power_input_kw: 1.10, mca: 4.0, mop: 10 },
      { model: "AHU 4000 CFM", capacity_tr: 10.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 4.2, power_input_kw: 2.20, mca: 7.0, mop: 20 },
      { model: "AHU 8000 CFM", capacity_tr: 20.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 8.5, power_input_kw: 4.50, mca: 13.0, mop: 32 },
    ],
  },
  {
    type: "Fan Coil Unit – FCU (2 Pipe / 4 Pipe)",
    units: [
      { model: "200 CFM FCU", capacity_tr: 0.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.30, power_input_kw: 0.06, mca: 1.0, mop: 6, notes: "Fan motor only" },
      { model: "300 CFM FCU", capacity_tr: 0.75, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.35, power_input_kw: 0.075, mca: 1.0, mop: 6, notes: "Fan motor only" },
      { model: "400 CFM FCU", capacity_tr: 1.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.45, power_input_kw: 0.10, mca: 1.5, mop: 6, notes: "Fan motor only" },
      { model: "600 CFM FCU", capacity_tr: 1.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.60, power_input_kw: 0.13, mca: 2.0, mop: 10, notes: "Fan motor only" },
      { model: "800 CFM FCU", capacity_tr: 2.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.75, power_input_kw: 0.16, mca: 2.5, mop: 10, notes: "Fan motor only" },
      { model: "1000 CFM FCU", capacity_tr: 2.5, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 0.90, power_input_kw: 0.20, mca: 3.0, mop: 10, notes: "Fan motor only" },
      { model: "1200 CFM FCU", capacity_tr: 3.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.10, power_input_kw: 0.24, mca: 3.5, mop: 16, notes: "Fan motor only" },
      { model: "1600 CFM FCU", capacity_tr: 4.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.40, power_input_kw: 0.31, mca: 4.5, mop: 16, notes: "Fan motor only" },
      { model: "2000 CFM FCU", capacity_tr: 5.0, voltage: "220-240V", phase: "Single Phase", frequency: "50 Hz", running_current_a: 1.70, power_input_kw: 0.37, mca: 5.5, mop: 20, notes: "Fan motor only" },
    ],
  },
  {
    type: "Air Handling Unit – AHU (Chilled Water)",
    units: [
      { model: "2000 CFM AHU", capacity_tr: 5.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 2.2, power_input_kw: 1.10, mca: 3.5, mop: 10, notes: "Fan motor only; add controls load" },
      { model: "3000 CFM AHU", capacity_tr: 7.5, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 3.0, power_input_kw: 1.50, mca: 5.0, mop: 16, notes: "Fan motor only; add controls load" },
      { model: "4000 CFM AHU", capacity_tr: 10.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 3.8, power_input_kw: 2.20, mca: 6.5, mop: 20, notes: "Fan motor only; add controls load" },
      { model: "5000 CFM AHU", capacity_tr: 12.5, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 4.8, power_input_kw: 2.75, mca: 8.0, mop: 25, notes: "Fan motor only; add controls load" },
      { model: "6000 CFM AHU", capacity_tr: 15.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 5.8, power_input_kw: 3.30, mca: 9.5, mop: 25, notes: "Fan motor only; add controls load" },
      { model: "8000 CFM AHU", capacity_tr: 20.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 7.5, power_input_kw: 4.40, mca: 12.0, mop: 32, notes: "Fan motor only; add controls load" },
      { model: "10000 CFM AHU", capacity_tr: 25.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 9.5, power_input_kw: 5.50, mca: 15.0, mop: 40, notes: "Fan motor only; add controls load" },
      { model: "12000 CFM AHU", capacity_tr: 30.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 11.5, power_input_kw: 6.60, mca: 18.0, mop: 50, notes: "Fan motor only; add controls load" },
      { model: "15000 CFM AHU", capacity_tr: 37.5, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 14.5, power_input_kw: 8.25, mca: 22.0, mop: 63, notes: "Fan motor only; add controls load" },
      { model: "20000 CFM AHU", capacity_tr: 50.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 18.5, power_input_kw: 11.00, mca: 28.0, mop: 80, notes: "Fan motor only; add controls load" },
    ],
  },
  {
    type: "TFA (Treated Fresh Air)",
    units: [
      { model: "TFA 1000 CFM", capacity_tr: 3.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 1.8, power_input_kw: 0.75, mca: 3.0, mop: 10 },
      { model: "TFA 3000 CFM", capacity_tr: 8.0, voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", running_current_a: 3.5, power_input_kw: 1.50, mca: 5.5, mop: 16 },
    ],
  },
];

// ─────────────────────────────────────────────
// 4. CHILLERS
// ─────────────────────────────────────────────

export interface ChillerSpec {
  model: string;
  capacity_tr: number;
  chiller_type: "Air Cooled" | "Water Cooled";
  compressor_type: string;
  voltage: string;
  phase: PhaseType;
  frequency: string;
  full_load_current_a: number;
  starting_current_a?: number;
  power_input_kw: number;
  cop: number;
  eer?: number;
  mca: number;
  mop: number;
  notes?: string;
}

export interface ChillerCategory {
  type: string;
  units: ChillerSpec[];
}

export const chillerData: ChillerCategory[] = [
  {
    type: "Air Cooled Chiller (Scroll / Screw Compressor)",
    units: [
      { model: "10 TR Air Cooled Chiller", capacity_tr: 10, chiller_type: "Air Cooled", compressor_type: "Scroll", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 18.5, starting_current_a: 90, power_input_kw: 11.5, cop: 2.8, eer: 9.5, mca: 27.0, mop: 80 },
      { model: "15 TR Air Cooled Chiller", capacity_tr: 15, chiller_type: "Air Cooled", compressor_type: "Scroll", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 27.0, starting_current_a: 132, power_input_kw: 17.0, cop: 2.8, eer: 9.5, mca: 39.0, mop: 100 },
      { model: "20 TR Air Cooled Chiller", capacity_tr: 20, chiller_type: "Air Cooled", compressor_type: "Scroll", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 34.5, starting_current_a: 168, power_input_kw: 22.0, cop: 2.9, eer: 9.8, mca: 50.0, mop: 160 },
      { model: "30 TR Air Cooled Chiller", capacity_tr: 30, chiller_type: "Air Cooled", compressor_type: "Scroll", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 50.0, starting_current_a: 240, power_input_kw: 32.0, cop: 2.9, eer: 9.8, mca: 72.0, mop: 200 },
      { model: "40 TR Air Cooled Chiller", capacity_tr: 40, chiller_type: "Air Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 66.0, starting_current_a: 310, power_input_kw: 42.0, cop: 3.0, eer: 10.2, mca: 95.0, mop: 250 },
      { model: "50 TR Air Cooled Chiller", capacity_tr: 50, chiller_type: "Air Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 80.0, starting_current_a: 380, power_input_kw: 52.0, cop: 3.0, eer: 10.2, mca: 116.0, mop: 315 },
      { model: "60 TR Air Cooled Chiller", capacity_tr: 60, chiller_type: "Air Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 95.0, starting_current_a: 450, power_input_kw: 62.0, cop: 3.1, eer: 10.5, mca: 138.0, mop: 400 },
      { model: "80 TR Air Cooled Chiller", capacity_tr: 80, chiller_type: "Air Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 126.0, starting_current_a: 595, power_input_kw: 82.0, cop: 3.1, eer: 10.5, mca: 183.0, mop: 500, notes: "Separate condenser fan circuit req." },
      { model: "100 TR Air Cooled Chiller", capacity_tr: 100, chiller_type: "Air Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 156.0, starting_current_a: 738, power_input_kw: 102.0, cop: 3.2, eer: 10.9, mca: 226.0, mop: 630, notes: "Separate condenser fan circuit req." },
      { model: "120 TR Air Cooled Chiller", capacity_tr: 120, chiller_type: "Air Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 185.0, starting_current_a: 875, power_input_kw: 122.0, cop: 3.2, eer: 10.9, mca: 268.0, mop: 800, notes: "Separate condenser fan circuit req." },
      { model: "150 TR Air Cooled Chiller", capacity_tr: 150, chiller_type: "Air Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 228.0, starting_current_a: 1080, power_input_kw: 150.0, cop: 3.3, eer: 11.3, mca: 330.0, mop: 1000, notes: "Separate condenser fan circuit req." },
      { model: "200 TR Air Cooled Chiller", capacity_tr: 200, chiller_type: "Air Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 300.0, starting_current_a: 1420, power_input_kw: 198.0, cop: 3.4, eer: 11.6, mca: 435.0, mop: 1250, notes: "Dual circuit; separate condenser fans" },
    ],
  },
  {
    type: "Water Cooled Chiller (Screw / Centrifugal Compressor)",
    units: [
      { model: "30 TR WC Chiller (Scroll)", capacity_tr: 30, chiller_type: "Water Cooled", compressor_type: "Scroll", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 40.0, starting_current_a: 190, power_input_kw: 25.5, cop: 4.5, eer: 15.3, mca: 58.0, mop: 160, notes: "Excl. cooling tower & pump loads" },
      { model: "50 TR WC Chiller (Screw)", capacity_tr: 50, chiller_type: "Water Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 60.0, starting_current_a: 285, power_input_kw: 38.0, cop: 4.8, eer: 16.4, mca: 87.0, mop: 250, notes: "Excl. cooling tower & pump loads" },
      { model: "80 TR WC Chiller (Screw)", capacity_tr: 80, chiller_type: "Water Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 94.0, starting_current_a: 445, power_input_kw: 60.0, cop: 4.8, eer: 16.4, mca: 136.0, mop: 400, notes: "Excl. cooling tower & pump loads" },
      { model: "100 TR WC Chiller (Screw)", capacity_tr: 100, chiller_type: "Water Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 116.0, starting_current_a: 550, power_input_kw: 74.0, cop: 5.0, eer: 17.0, mca: 168.0, mop: 500, notes: "Excl. cooling tower & pump loads" },
      { model: "150 TR WC Chiller (Screw)", capacity_tr: 150, chiller_type: "Water Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 168.0, starting_current_a: 795, power_input_kw: 107.0, cop: 5.1, eer: 17.4, mca: 243.0, mop: 630, notes: "Excl. cooling tower & pump loads" },
      { model: "200 TR WC Chiller (Screw)", capacity_tr: 200, chiller_type: "Water Cooled", compressor_type: "Screw", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 220.0, starting_current_a: 1040, power_input_kw: 140.0, cop: 5.2, eer: 17.7, mca: 319.0, mop: 800, notes: "Excl. cooling tower & pump loads" },
      { model: "250 TR WC Chiller (Centrifugal)", capacity_tr: 250, chiller_type: "Water Cooled", compressor_type: "Centrifugal", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 265.0, starting_current_a: 1255, power_input_kw: 168.0, cop: 5.8, eer: 19.8, mca: 384.0, mop: 1000, notes: "Excl. cooling tower & pump loads" },
      { model: "300 TR WC Chiller (Centrifugal)", capacity_tr: 300, chiller_type: "Water Cooled", compressor_type: "Centrifugal", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 316.0, starting_current_a: 1500, power_input_kw: 200.0, cop: 5.9, eer: 20.1, mca: 458.0, mop: 1250, notes: "Excl. cooling tower & pump loads" },
      { model: "400 TR WC Chiller (Centrifugal)", capacity_tr: 400, chiller_type: "Water Cooled", compressor_type: "Centrifugal", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 408.0, starting_current_a: 1935, power_input_kw: 258.0, cop: 6.0, eer: 20.5, mca: 591.0, mop: 1600, notes: "Excl. cooling tower & pump loads" },
      { model: "500 TR WC Chiller (Centrifugal)", capacity_tr: 500, chiller_type: "Water Cooled", compressor_type: "Centrifugal", voltage: "380-415V", phase: "Three Phase", frequency: "50 Hz", full_load_current_a: 502.0, starting_current_a: 2380, power_input_kw: 318.0, cop: 6.1, eer: 20.8, mca: 728.0, mop: 2000, notes: "Excl. cooling tower & pump loads" },
    ],
  },
];

// ─────────────────────────────────────────────
// 5. VRV SERIES (AS PER SITE REFERENCE SHEET)
// ─────────────────────────────────────────────

export interface VRVSeriesSpec {
  model: string;
  type: string;
  capacity_tr: number;
  power_input_kw: number;
  voltage: string;
  phase: PhaseType;
  frequency: string;
  mca: number;
  mfa?: number;
  mcb_amps: number;
  elcb_amps: number;
  cable_core: string;
  cable_sqmm: number;
  hp?: number;
  min_voltage?: string;
  max_voltage?: string;
  power_partload_kw?: {
    p130: number;
    p120: number;
    p110: number;
    p100: number;
  };
}

export interface VRVSeriesData {
  key: "home" | "s" | "x";
  label: string;
  outdoor: VRVSeriesSpec[];
  indoor: VRVSeriesSpec[];
}

export const vrvSeriesData: VRVSeriesData[] = [
  {
    key: "home",
    label: "Home Series",
    outdoor: [
      {
        model: "RXRQ6ARV16",
        type: "Outdoor Unit",
        hp: 6,
        capacity_tr: 6,
        power_input_kw: 6.9,
        voltage: "230 V AC",
        phase: "Single Phase",
        frequency: "50 Hz",
        min_voltage: "207 V AC",
        max_voltage: "253 V AC",
        mca: 30,
        mfa: 32,
        mcb_amps: 32,
        elcb_amps: 32,
        cable_core: "3 Core",
        cable_sqmm: 4,
      },
      {
        model: "RXRQ5ARV16",
        type: "Outdoor Unit",
        hp: 5,
        capacity_tr: 5,
        power_input_kw: 5.8,
        voltage: "230 V AC",
        phase: "Single Phase",
        frequency: "50 Hz",
        min_voltage: "207 V AC",
        max_voltage: "253 V AC",
        mca: 27,
        mfa: 30,
        mcb_amps: 32,
        elcb_amps: 32,
        cable_core: "3 Core",
        cable_sqmm: 4,
      },
      {
        model: "RXRQ4ARV16",
        type: "Outdoor Unit",
        hp: 4,
        capacity_tr: 4,
        power_input_kw: 4.4,
        voltage: "230 V AC",
        phase: "Single Phase",
        frequency: "50 Hz",
        min_voltage: "207 V AC",
        max_voltage: "253 V AC",
        mca: 16.5,
        mfa: 25,
        mcb_amps: 25,
        elcb_amps: 25,
        cable_core: "3 Core",
        cable_sqmm: 4,
      },
    ],
    indoor: [
      { model: "FXARQ20ARVE6", type: "Wall Mounted", capacity_tr: 0.63, power_input_kw: 0.04, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.3, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXARQ25ARVE6", type: "Wall Mounted", capacity_tr: 0.8, power_input_kw: 0.04, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.4, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXARQ32ARVE6", type: "Wall Mounted", capacity_tr: 1.03, power_input_kw: 0.04, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.4, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXARQ40ARVE6", type: "Wall Mounted", capacity_tr: 1.28, power_input_kw: 0.04, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.4, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXARQ50ARVE6", type: "Wall Mounted", capacity_tr: 1.59, power_input_kw: 0.04, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.5, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXARQ63ARVE6", type: "Wall Mounted", capacity_tr: 2.02, power_input_kw: 0.056, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.7, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXMQ40ARV16", type: "Mid Static Duct", capacity_tr: 1.28, power_input_kw: 0.16, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXMQ50ARV16", type: "Mid Static Duct", capacity_tr: 1.59, power_input_kw: 0.21, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.2, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXMQ63ARV16", type: "Mid Static Duct", capacity_tr: 2.02, power_input_kw: 0.185, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.0, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXMQ80ARV16", type: "Mid Static Duct", capacity_tr: 2.56, power_input_kw: 0.3, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.6, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXMQ100ARV16", type: "Mid Static Duct", capacity_tr: 3.18, power_input_kw: 0.345, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.6, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXDQ20PDV36", type: "Slim Duct 700 mm", capacity_tr: 0.63, power_input_kw: 0.086, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXDQ25PDV36", type: "Slim Duct 700 mm", capacity_tr: 0.8, power_input_kw: 0.086, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXDQ32PDV36", type: "Slim Duct 700 mm", capacity_tr: 1.03, power_input_kw: 0.089, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXDQ40NDV36", type: "Slim Duct 900/1100 mm", capacity_tr: 1.28, power_input_kw: 0.16, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.0, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXDQ50NDV36", type: "Slim Duct 900/1100 mm", capacity_tr: 1.59, power_input_kw: 0.165, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.0, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXDQ63NDV36", type: "Slim Duct 900/1100 mm", capacity_tr: 2.02, power_input_kw: 0.181, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.1, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
    ],
  },
  {
    key: "s",
    label: "VRV S",
    outdoor: [
      {
        model: "RXMQ8ARY16",
        type: "Side Discharge Outdoor",
        hp: 8,
        capacity_tr: 8,
        power_input_kw: 6.61,
        voltage: "415 V AC",
        phase: "Three Phase",
        frequency: "50 Hz",
        min_voltage: "342 V AC",
        max_voltage: "456 V AC",
        mca: 18.9,
        mfa: 25,
        mcb_amps: 25,
        elcb_amps: 25,
        cable_core: "4 Core",
        cable_sqmm: 6,
        power_partload_kw: {
          p130: 6.7,
          p120: 6.67,
          p110: 6.64,
          p100: 6.61,
        },
      },
    ],
    indoor: [
      {
        model: "FXKQ40AV16",
        type: "Ceiling Cassette Corner",
        capacity_tr: 1.28,
        power_input_kw: 0.046,
        voltage: "220-240 V AC",
        phase: "Single Phase",
        frequency: "50 Hz",
        min_voltage: "198 V AC",
        max_voltage: "264 V AC",
        mca: 0.5,
        mcb_amps: 6,
        elcb_amps: 100,
        cable_core: "3 Core",
        cable_sqmm: 1.5,
      },
    ],
  },
  {
    key: "x",
    label: "VRV X",
    outdoor: [
      {
        model: "RXQ20ARY5",
        type: "Top Discharge Outdoor",
        hp: 20,
        capacity_tr: 20,
        power_input_kw: 17.7,
        voltage: "400 V AC",
        phase: "Three Phase",
        frequency: "50 Hz",
        min_voltage: "342 V AC",
        max_voltage: "456 V AC",
        mca: 38.9,
        mfa: 45,
        mcb_amps: 63,
        elcb_amps: 63,
        cable_core: "4 Core",
        cable_sqmm: 10,
        power_partload_kw: { p130: 17.9, p120: 17.8, p110: 17.8, p100: 17.7 },
      },
      {
        model: "RXQ18ARY5",
        type: "Top Discharge Outdoor",
        hp: 18,
        capacity_tr: 18,
        power_input_kw: 15.3,
        voltage: "400 V AC",
        phase: "Three Phase",
        frequency: "50 Hz",
        min_voltage: "342 V AC",
        max_voltage: "456 V AC",
        mca: 30.2,
        mfa: 35,
        mcb_amps: 40,
        elcb_amps: 40,
        cable_core: "4 Core",
        cable_sqmm: 10,
        power_partload_kw: { p130: 15.5, p120: 15.4, p110: 15.4, p100: 15.3 },
      },
      {
        model: "RXQ16ARY6",
        type: "Top Discharge Outdoor",
        hp: 16,
        capacity_tr: 16,
        power_input_kw: 12.9,
        voltage: "400 V AC",
        phase: "Three Phase",
        frequency: "50 Hz",
        min_voltage: "342 V AC",
        max_voltage: "456 V AC",
        mca: 30.2,
        mfa: 35,
        mcb_amps: 40,
        elcb_amps: 40,
        cable_core: "4 Core",
        cable_sqmm: 10,
        power_partload_kw: { p130: 13.1, p120: 13, p110: 13, p100: 12.9 },
      },
      {
        model: "RXQ14ARY6",
        type: "Top Discharge Outdoor",
        hp: 14,
        capacity_tr: 14,
        power_input_kw: 10.7,
        voltage: "400 V AC",
        phase: "Three Phase",
        frequency: "50 Hz",
        min_voltage: "342 V AC",
        max_voltage: "456 V AC",
        mca: 26.9,
        mfa: 30,
        mcb_amps: 32,
        elcb_amps: 32,
        cable_core: "4 Core",
        cable_sqmm: 10,
        power_partload_kw: { p130: 10.8, p120: 10.7, p110: 10.7, p100: 10.7 },
      },
      {
        model: "RXQ12ARY5",
        type: "Top Discharge Outdoor",
        hp: 12,
        capacity_tr: 12,
        power_input_kw: 8.7,
        voltage: "400 V AC",
        phase: "Three Phase",
        frequency: "50 Hz",
        min_voltage: "342 V AC",
        max_voltage: "456 V AC",
        mca: 22.5,
        mfa: 25,
        mcb_amps: 25,
        elcb_amps: 25,
        cable_core: "4 Core",
        cable_sqmm: 6,
        power_partload_kw: { p130: 8.7, p120: 8.7, p110: 8.7, p100: 8.7 },
      },
      {
        model: "RXQ10ARY6",
        type: "Top Discharge Outdoor",
        hp: 10,
        capacity_tr: 10,
        power_input_kw: 6.8,
        voltage: "400 V AC",
        phase: "Three Phase",
        frequency: "50 Hz",
        min_voltage: "342 V AC",
        max_voltage: "456 V AC",
        mca: 21.2,
        mfa: 25,
        mcb_amps: 25,
        elcb_amps: 25,
        cable_core: "4 Core",
        cable_sqmm: 6,
        power_partload_kw: { p130: 6.8, p120: 6.8, p110: 6.8, p100: 6.8 },
      },
      {
        model: "RXQ8ARY6",
        type: "Top Discharge Outdoor",
        hp: 8,
        capacity_tr: 8,
        power_input_kw: 5.2,
        voltage: "400 V AC",
        phase: "Three Phase",
        frequency: "50 Hz",
        min_voltage: "342 V AC",
        max_voltage: "456 V AC",
        mca: 16.1,
        mfa: 20,
        mcb_amps: 20,
        elcb_amps: 20,
        cable_core: "4 Core",
        cable_sqmm: 6,
        power_partload_kw: { p130: 5.3, p120: 5.2, p110: 5.2, p100: 5.2 },
      },
    ],
    indoor: [
      { model: "FXFSQ25ARV16", type: "Round Flow Cassette", capacity_tr: 0.8, power_input_kw: 0.053, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.3, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXFSQ32ARV16", type: "Round Flow Cassette", capacity_tr: 1.03, power_input_kw: 0.053, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.3, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXFSQ40ARV16", type: "Round Flow Cassette", capacity_tr: 1.28, power_input_kw: 0.053, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.4, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXFSQ50ARV16", type: "Round Flow Cassette", capacity_tr: 1.59, power_input_kw: 0.058, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.6, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXFSQ63ARV16", type: "Round Flow Cassette", capacity_tr: 2.02, power_input_kw: 0.061, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.6, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXFSQ80ARV16", type: "Round Flow Cassette", capacity_tr: 2.56, power_input_kw: 0.092, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.0, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXFSQ100ARV16", type: "Round Flow Cassette", capacity_tr: 3.18, power_input_kw: 0.164, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.4, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXFSQ125ARV16", type: "Round Flow Cassette", capacity_tr: 3.98, power_input_kw: 0.17, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.6, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXFSQ140ARV16", type: "Round Flow Cassette", capacity_tr: 4.55, power_input_kw: 0.194, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXZQ20MVE9", type: "Compact Cassette", capacity_tr: 0.63, power_input_kw: 0.073, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXZQ25MVE9", type: "Compact Cassette", capacity_tr: 0.8, power_input_kw: 0.073, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXZQ32MVE9", type: "Compact Cassette", capacity_tr: 1.03, power_input_kw: 0.076, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXZQ40MVE9", type: "Compact Cassette", capacity_tr: 1.28, power_input_kw: 0.089, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXKQ32AV16", type: "Cassette Corner", capacity_tr: 1.03, power_input_kw: 0.034, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.4, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXKQ40AV16", type: "Cassette Corner", capacity_tr: 1.28, power_input_kw: 0.046, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.5, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXKQ50AV16", type: "Cassette Corner", capacity_tr: 1.59, power_input_kw: 0.048, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.5, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXDQ20PDV36", type: "Slim Duct 700 mm", capacity_tr: 0.63, power_input_kw: 0.086, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXDQ40NDV36", type: "Slim Duct 900 mm", capacity_tr: 1.28, power_input_kw: 0.16, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.0, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXMQ80PV36", type: "Ceiling Mounted Duct", capacity_tr: 2.56, power_input_kw: 0.298, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 2.3, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXMQ125PV36", type: "Ceiling Mounted Duct", capacity_tr: 3.98, power_input_kw: 0.461, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 3.4, mcb_amps: 15, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 2.5 },
      { model: "FXMQ200PVE6", type: "Ceiling Mounted Duct", capacity_tr: 6.37, power_input_kw: 1.1, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 8.2, mcb_amps: 15, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 4 },
      { model: "FXAQ20ARVE6", type: "Wall Mounted", capacity_tr: 0.63, power_input_kw: 0.04, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.3, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXAQ50ARVE6", type: "Wall Mounted", capacity_tr: 1.59, power_input_kw: 0.04, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.5, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXHQ63MAVE", type: "Ceiling Suspended", capacity_tr: 2.02, power_input_kw: 0.115, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 0.8, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
      { model: "FXHQ125AVM", type: "Ceiling Suspended", capacity_tr: 3.98, power_input_kw: 0.168, voltage: "220-240 V AC", phase: "Single Phase", frequency: "50 Hz", min_voltage: "198 V AC", max_voltage: "264 V AC", mca: 1.4, mcb_amps: 6, elcb_amps: 100, cable_core: "3 Core", cable_sqmm: 1.5 },
    ],
  },
];
