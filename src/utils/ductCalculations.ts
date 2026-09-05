// HVAC Duct Sizing Calculations - Same methodology as McQuay Duct Sizer
// Based on ASHRAE standards and Darcy-Weisbach equation

// Constants
const AIR_DENSITY = 0.075; // lb/ft³ at standard conditions
const ROUGHNESS = 0.0003; // ft - galvanized steel duct roughness
const KINEMATIC_VISCOSITY = 1.57e-4; // ft²/s for air at standard conditions

// Calculate equivalent diameter for rectangular duct (inches)
// Formula: De = 1.30 × (a × b)^0.625 / (a + b)^0.25
export function calculateEquivalentDiameter(width: number, height: number): number {
  if (width <= 0 || height <= 0) return 0;
  return 1.30 * Math.pow(width * height, 0.625) / Math.pow(width + height, 0.25);
}

// Calculate flow area in square feet
export function calculateFlowArea(width: number, height: number): number {
  return (width * height) / 144; // convert sq inches to sq feet
}

// Calculate velocity in ft/min
export function calculateVelocity(cfm: number, width: number, height: number): number {
  const area = calculateFlowArea(width, height);
  if (area <= 0) return 0;
  return cfm / area;
}

// Calculate velocity from CFM and equivalent diameter
export function calculateVelocityFromDe(cfm: number, de: number): number {
  const area = Math.PI * Math.pow(de / 24, 2); // de in inches, convert to feet for area
  if (area <= 0) return 0;
  return cfm / area;
}

// Calculate velocity pressure (inches w.g.)
// Formula: Pv = (V/4005)²
export function calculateVelocityPressure(velocity: number): number {
  return Math.pow(velocity / 4005, 2);
}

// Calculate Reynolds number
export function calculateReynoldsNumber(velocity: number, de: number): number {
  // velocity in ft/min, de in inches
  const v_fps = velocity / 60; // convert to ft/s
  const d_ft = de / 12; // convert to feet
  return (v_fps * d_ft) / KINEMATIC_VISCOSITY;
}

// Calculate friction factor using Colebrook-White equation (iterative)
export function calculateFrictionFactor(reynoldsNumber: number, de: number): number {
  if (reynoldsNumber <= 0) return 0;
  
  const d_ft = de / 12;
  const relativeRoughness = ROUGHNESS / d_ft;
  
  // Initial guess using Swamee-Jain approximation
  let f = 0.25 / Math.pow(Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynoldsNumber, 0.9)), 2);
  
  // Iterate using Colebrook-White equation
  for (let i = 0; i < 20; i++) {
    const f_new = 1 / Math.pow(-2 * Math.log10(relativeRoughness / 3.7 + 2.51 / (reynoldsNumber * Math.sqrt(f))), 2);
    if (Math.abs(f_new - f) < 1e-8) break;
    f = f_new;
  }
  
  return f;
}

// Calculate friction loss per 100 ft (inches w.g.)
// Using Darcy-Weisbach equation
export function calculateFrictionLoss(velocity: number, de: number): number {
  if (velocity <= 0 || de <= 0) return 0;
  
  const re = calculateReynoldsNumber(velocity, de);
  const f = calculateFrictionFactor(re, de);
  
  // Darcy-Weisbach: ΔP = f × (L/D) × (V/4005)²
  // For 100 ft length, converting to inches w.g.
  const d_ft = de / 12;
  const v_fps = velocity / 60;
  
  // ΔP in lb/ft² then convert to inches w.g.
  const deltaP = f * (100 / d_ft) * (AIR_DENSITY * v_fps * v_fps) / (2 * 32.174);
  
  // Convert lb/ft² to inches w.g. (1 inch w.g. = 5.202 lb/ft²)
  return deltaP / 5.202;
}

// Alternative friction loss calculation using ASHRAE simplified formula
// ΔP = 0.109136 × Q^1.9 / De^5.02
export function calculateFrictionLossASHRAE(cfm: number, de: number): number {
  if (cfm <= 0 || de <= 0) return 0;
  return 0.109136 * Math.pow(cfm, 1.9) / Math.pow(de, 5.02);
}

// Calculate CFM from velocity and duct dimensions
export function calculateCFM(velocity: number, width: number, height: number): number {
  const area = calculateFlowArea(width, height);
  return velocity * area;
}

// Calculate CFM from velocity and equivalent diameter
export function calculateCFMFromDe(velocity: number, de: number): number {
  const area = Math.PI * Math.pow(de / 24, 2);
  return velocity * area;
}

// Calculate duct dimension given CFM, friction loss, and one side
// This requires iterative solution
export function calculateDuctSide(
  cfm: number,
  frictionLoss: number,
  knownSide: number,
  isWidth: boolean
): number {
  if (cfm <= 0 || frictionLoss <= 0 || knownSide <= 0) return 0;
  
  // Iterative approach - try different values for unknown side
  let low = 4;
  let high = 1000;
  let result = 0;
  
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const width = isWidth ? knownSide : mid;
    const height = isWidth ? mid : knownSide;
    
    const de = calculateEquivalentDiameter(width, height);
    const velocity = calculateVelocity(cfm, width, height);
    const calculatedFL = calculateFrictionLossASHRAE(cfm, de);
    
    if (Math.abs(calculatedFL - frictionLoss) < 0.0001) {
      result = mid;
      break;
    }
    
    if (calculatedFL > frictionLoss) {
      low = mid;
    } else {
      high = mid;
    }
    result = mid;
  }
  
  return result;
}

// Calculate duct side given CFM, velocity, and one side
export function calculateDuctSideFromVelocity(
  cfm: number,
  velocity: number,
  knownSide: number
): number {
  if (cfm <= 0 || velocity <= 0 || knownSide <= 0) return 0;
  
  // Area = CFM / Velocity (in sq ft)
  const area = cfm / velocity;
  // Convert to sq inches and divide by known side
  const unknownSide = (area * 144) / knownSide;
  
  return unknownSide;
}

// Calculate equivalent diameter from CFM and friction loss
export function calculateDeFromFrictionLoss(cfm: number, frictionLoss: number): number {
  if (cfm <= 0 || frictionLoss <= 0) return 0;
  
  // Using ASHRAE formula: ΔP = 0.109136 × Q^1.9 / De^5.02
  // Solving for De: De = (0.109136 × Q^1.9 / ΔP)^(1/5.02)
  return Math.pow((0.109136 * Math.pow(cfm, 1.9)) / frictionLoss, 1 / 5.02);
}

// Calculate equivalent diameter from CFM and velocity
export function calculateDeFromVelocity(cfm: number, velocity: number): number {
  if (cfm <= 0 || velocity <= 0) return 0;
  
  // Area = CFM / Velocity
  const area = cfm / velocity; // sq ft
  // De = 2 × sqrt(Area / π) converted to inches
  return 2 * Math.sqrt(area / Math.PI) * 12;
}

// Get all results from CFM and duct dimensions
export interface DuctResults {
  flowArea: number;        // sq ft
  velocity: number;        // ft/min
  velocityPressure: number; // inches w.g.
  equivalentDiameter: number; // inches
  frictionLoss: number;    // inches w.g. per 100 ft
  reynoldsNumber: number;
  frictionFactor: number;
}

export function calculateAllResults(cfm: number, width: number, height: number): DuctResults {
  const flowArea = calculateFlowArea(width, height);
  const velocity = calculateVelocity(cfm, width, height);
  const velocityPressure = calculateVelocityPressure(velocity);
  const equivalentDiameter = calculateEquivalentDiameter(width, height);
  const frictionLoss = calculateFrictionLoss(velocity, equivalentDiameter);
  const reynoldsNumber = calculateReynoldsNumber(velocity, equivalentDiameter);
  const frictionFactor = calculateFrictionFactor(reynoldsNumber, equivalentDiameter);
  
  return {
    flowArea,
    velocity,
    velocityPressure,
    equivalentDiameter,
    frictionLoss,
    reynoldsNumber,
    frictionFactor
  };
}

// Round duct size to standard sizes
export function roundToStandardSize(size: number): number {
  const standardSizes = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150 ];
  
  let closest = standardSizes[0];
  let minDiff = Math.abs(size - closest);
  
  for (const stdSize of standardSizes) {
    const diff = Math.abs(size - stdSize);
    if (diff < minDiff) {
      minDiff = diff;
      closest = stdSize;
    }
  }
  
  return closest;
}
