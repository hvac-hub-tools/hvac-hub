import { useState, useMemo, createContext, useContext } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import {
  Activity,
  ArrowDownLeft,
  ArrowUp,
  ArrowUpFromLine,
  ArrowUpRight,
  BatteryCharging,
  BookOpen,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CircleDot,
  ClipboardList,
  Cog,
  Cpu,
  Droplets,
  Fan,
  Filter,
  Gauge,
  Info,
  IndianRupee,
  MoveHorizontal,
  ParkingCircle,
  Plus,
  Printer,
  RefreshCw,
  Ruler,
  Scale,
  Search,
  Shuffle,
  Target,
  Trash2,
  Wind,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

/* ============================================================================
   DATA: Ventilation Types
============================================================================ */

interface VentilationType {
  id: number;
  name: string;
  shortDesc: string;
  description: string;
  howItWorks: string;
  category: 'Natural' | 'Mechanical' | 'Hybrid';
  icon: string;
  color: string;
  achRange: string;
  efficiency: 'Low' | 'Medium' | 'High' | 'Very High';
  cost: string;
  energyUse: string;
  pros: string[];
  cons: string[];
  applications: string[];
}

const ventilationTypes: VentilationType[] = [
  {
    id: 1,
    name: 'Cross Ventilation',
    shortDesc: 'Natural airflow through openings on opposite walls',
    description:
      'Cross ventilation uses wind pressure differences to move air through a building. Openings on opposite or adjacent walls allow fresh air to enter from one side and stale air to exit from the other.',
    howItWorks:
      'Wind creates positive pressure on the windward side and negative pressure on the leeward side. Air enters through windward openings, flows across the space, and exits through leeward openings. The driving force is the wind speed and direction.',
    category: 'Natural',
    icon: 'Wind',
    color: 'from-emerald-500 to-teal-600',
    achRange: '1–5 ACH',
    efficiency: 'Medium',
    cost: 'Very Low',
    energyUse: 'Zero',
    pros: [
      'No energy cost',
      'Simple design — just openings on opposite walls',
      'Provides good comfort in mild climates',
      'No maintenance required',
    ],
    cons: [
      'Depends on wind — unreliable in calm conditions',
      'Cannot filter incoming air',
      'No humidity or temperature control',
      'Security & noise concerns with open windows',
    ],
    applications: ['Residential homes', 'Schools', 'Low-rise offices', 'Warehouses'],
  },
  {
    id: 2,
    name: 'Stack Ventilation',
    shortDesc: 'Warm air rises and exits through high openings',
    description:
      'Stack ventilation (also called buoyancy-driven or chimney ventilation) relies on the natural tendency of warm air to rise. Warm indoor air exits through high-level openings, drawing in cooler fresh air from low-level openings.',
    howItWorks:
      'Indoor heat sources warm the air, making it less dense. This warm air rises and exits through openings at the top of the space (roof vents, clerestory windows, or a solar chimney). The resulting low pressure at the bottom draws in cooler outside air through low-level openings.',
    category: 'Natural',
    icon: 'ArrowUp',
    color: 'from-orange-500 to-amber-600',
    achRange: '2–8 ACH',
    efficiency: 'Medium',
    cost: 'Low',
    energyUse: 'Zero',
    pros: [
      'Works even without wind',
      'Very effective in tall spaces (atriums, stairwells)',
      'Zero energy consumption',
      'Can be enhanced with solar chimneys',
    ],
    cons: [
      'Requires significant height difference between inlet and outlet',
      'Less effective in hot weather when indoor/outdoor temp difference is small',
      'Design must account for reverse stack effect in winter',
      'Limited control over airflow rate',
    ],
    applications: ['Atriums', 'Stairwells', 'Tall industrial buildings', 'Churches'],
  },
  {
    id: 3,
    name: 'Supply Ventilation',
    shortDesc: 'Fans push fresh air in, creating positive pressure',
    description:
      'Supply ventilation systems use fans to force outdoor air into the building, creating positive pressure that pushes stale air out through exhaust vents, cracks, and other openings.',
    howItWorks:
      'A supply fan draws outdoor air through a duct, optionally through a filter and/or heating/cooling coil, and delivers it into the conditioned space. The positive pressure inside causes air to leak out through any available opening.',
    category: 'Mechanical',
    icon: 'ArrowDownLeft',
    color: 'from-blue-500 to-indigo-600',
    achRange: '4–12 ACH',
    efficiency: 'High',
    cost: 'Medium',
    energyUse: 'Medium',
    pros: [
      'Allows filtration and conditioning of incoming air',
      'Positive pressure prevents infiltration of pollutants',
      'Controlled and measurable airflow',
      'Good for allergy sufferers — filtered supply air',
    ],
    cons: [
      'Requires ductwork and fan energy',
      'Positive pressure may push moist indoor air into wall cavities (condensation risk in cold climates)',
      'Higher installation cost than natural ventilation',
      'Needs regular filter maintenance',
    ],
    applications: ['Hospitals', 'Clean rooms', 'Server rooms', 'Offices'],
  },
  {
    id: 4,
    name: 'Exhaust Ventilation',
    shortDesc: 'Fans pull stale air out, creating negative pressure',
    description:
      'Exhaust ventilation systems use fans to extract indoor air, creating negative pressure that draws fresh outdoor air in through vents, windows, or building leakage paths.',
    howItWorks:
      'An exhaust fan mounted in a wall, ceiling, or connected to ductwork removes indoor air. The resulting negative pressure causes fresh outdoor air to be drawn in through intentional openings (trickle vents) or unintentional cracks.',
    category: 'Mechanical',
    icon: 'ArrowUpRight',
    color: 'from-rose-500 to-pink-600',
    achRange: '4–15 ACH',
    efficiency: 'High',
    cost: 'Low–Medium',
    energyUse: 'Low–Medium',
    pros: [
      'Simple and inexpensive to install',
      'Very effective for removing localized pollutants (kitchens, bathrooms)',
      'Negative pressure prevents conditioned air from entering wall cavities',
      'Easy to retrofit',
    ],
    cons: [
      'Incoming air is unfiltered and unconditioned',
      'Negative pressure can draw in radon, soil gases, or combustion products',
      'May cause drafts near entry points',
      'Can increase heating/cooling loads',
    ],
    applications: ['Kitchens', 'Bathrooms', 'Laboratories', 'Industrial workshops', 'Parking garages'],
  },
  {
    id: 5,
    name: 'Balanced Ventilation',
    shortDesc: 'Equal supply and exhaust for neutral pressure',
    description:
      'Balanced ventilation provides equal amounts of supply and exhaust air, maintaining neutral pressure. This gives the benefits of both systems without the drawbacks of pressure imbalances.',
    howItWorks:
      'Separate supply and exhaust fans (or a single balanced unit) move equal volumes of air. Fresh air is ducted in while stale air is ducted out. Often combined with heat recovery (HRV/ERV) to transfer energy between streams.',
    category: 'Mechanical',
    icon: 'Scale',
    color: 'from-violet-500 to-purple-600',
    achRange: '4–12 ACH',
    efficiency: 'Very High',
    cost: 'Medium–High',
    energyUse: 'Medium',
    pros: [
      'No pressure imbalance issues',
      'Both supply and exhaust air can be filtered',
      'Can incorporate heat/energy recovery (HRV/ERV)',
      'Precise control of ventilation rates',
    ],
    cons: [
      'Higher installation cost and complexity',
      'Requires more ductwork (supply + exhaust)',
      'More maintenance (two fan systems, filters)',
      'Needs proper commissioning and balancing',
    ],
    applications: ['Modern offices', 'Hospitals', 'High-performance homes', 'Schools'],
  },
  {
    id: 6,
    name: 'Heat Recovery (HRV)',
    shortDesc: 'Recovers heat from exhaust air to pre-heat supply',
    description:
      'A Heat Recovery Ventilator (HRV) is a balanced ventilation system with a heat exchanger that transfers sensible heat from the warm exhaust air stream to the cooler incoming fresh air stream.',
    howItWorks:
      'Exhaust and supply air streams pass through a heat exchanger (counter-flow, cross-flow, or rotary wheel) without mixing. In winter, warm exhaust air pre-heats cold incoming air. In summer, cool exhaust air pre-cools hot incoming air. Typical efficiency: 70–90%.',
    category: 'Mechanical',
    icon: 'RefreshCw',
    color: 'from-cyan-500 to-teal-600',
    achRange: '4–10 ACH',
    efficiency: 'Very High',
    cost: 'High',
    energyUse: 'Low',
    pros: [
      'Recovers 70–90% of heat energy from exhaust',
      'Dramatically reduces heating/cooling costs',
      'Provides filtered, tempered fresh air',
      'Meets passive house ventilation requirements',
    ],
    cons: [
      'High initial cost',
      'Requires regular maintenance (filters, heat exchanger cleaning)',
      'Does not transfer moisture (use ERV for humidity control)',
      'Frost risk in very cold climates without defrost cycle',
    ],
    applications: ['Passive houses', 'Energy-efficient offices', 'Cold climate buildings', 'Swimming pools'],
  },
  {
    id: 7,
    name: 'Energy Recovery (ERV)',
    shortDesc: 'Recovers both heat and moisture from exhaust',
    description:
      'An Energy Recovery Ventilator (ERV) transfers both sensible heat AND moisture (latent heat) between exhaust and supply air streams. Ideal for humid or very dry climates.',
    howItWorks:
      'Similar to HRV but uses an enthalpy wheel or membrane-based exchanger that transfers both heat and moisture. In summer, it removes some humidity from incoming air. In winter, it adds moisture from exhaust to dry incoming air.',
    category: 'Mechanical',
    icon: 'Droplets',
    color: 'from-sky-500 to-blue-600',
    achRange: '4–10 ACH',
    efficiency: 'Very High',
    cost: 'High',
    energyUse: 'Low',
    pros: [
      'Recovers both heat and moisture',
      'Reduces humidity load on AC systems in summer',
      'Prevents over-drying in winter',
      'More energy savings than HRV in humid climates',
    ],
    cons: [
      'Higher cost than HRV',
      'Enthalpy wheels require more maintenance',
      'Small risk of cross-contamination between air streams',
      'Less effective in mild, moderate-humidity climates',
    ],
    applications: ['Hot-humid climates', 'Cold-dry climates', 'Hospitals', 'Hotels'],
  },
  {
    id: 8,
    name: 'Demand-Controlled (DCV)',
    shortDesc: 'Adjusts ventilation based on occupancy sensors',
    description:
      'Demand-Controlled Ventilation (DCV) automatically adjusts the ventilation rate based on actual occupancy or air quality, rather than running at a fixed rate. Uses CO₂ sensors, occupancy sensors, or VOC sensors.',
    howItWorks:
      'CO₂ or occupancy sensors monitor the space. When CO₂ rises (more people), the system increases outdoor air. When the space is empty or lightly occupied, ventilation is reduced to save energy. Typically integrated with BMS/BAS.',
    category: 'Mechanical',
    icon: 'Activity',
    color: 'from-amber-500 to-yellow-600',
    achRange: '2–15 ACH (variable)',
    efficiency: 'Very High',
    cost: 'Medium–High',
    energyUse: 'Low',
    pros: [
      'Major energy savings (30–70% reduction in ventilation energy)',
      'Always provides adequate ventilation based on actual need',
      'Reduces over-ventilation and associated heating/cooling costs',
      'Improves indoor air quality by responding to real conditions',
    ],
    cons: [
      'Requires sensors and controls (higher initial cost)',
      'Sensor calibration and maintenance needed',
      'CO₂ sensors don\'t detect all pollutants (e.g., VOCs from furniture)',
      'Complex control logic may require BMS expertise',
    ],
    applications: ['Conference rooms', 'Auditoriums', 'Classrooms', 'Retail stores', 'Gyms'],
  },
  {
    id: 9,
    name: 'Displacement Ventilation',
    shortDesc: 'Cool air supplied at floor, rises as it warms',
    description:
      'Displacement ventilation supplies cool air at low velocity near the floor. The air warms as it absorbs heat from occupants and equipment, then rises to ceiling-level exhaust. Creates a clean lower zone.',
    howItWorks:
      'Air is supplied at floor level (or just above) at low velocity (< 50 fpm) and slightly below room temperature (2–5°F cooler). Heat sources (people, computers) create thermal plumes that carry the warmed, contaminated air upward to ceiling-level return/exhaust grilles.',
    category: 'Mechanical',
    icon: 'Target',
    color: 'from-indigo-500 to-blue-600',
    achRange: '4–8 ACH',
    efficiency: 'Very High',
    cost: 'Medium–High',
    energyUse: 'Low–Medium',
    pros: [
      'Superior air quality in the breathing zone',
      'Lower fan energy (low velocity = low pressure drop)',
      'Higher cooling efficiency (supply temp closer to room temp)',
      'Ideal for spaces with high heat loads',
    ],
    cons: [
      'Requires raised floor or floor-mounted diffusers',
      'Not suitable for heating mode',
      'Large floor-level diffusers take up space',
      'Limited cooling capacity compared to mixing systems',
    ],
    applications: ['Offices', 'Theaters', 'Airports', 'Data centers'],
  },
  {
    id: 10,
    name: 'Mixing Ventilation',
    shortDesc: 'High-velocity jets mix supply with room air',
    description:
      'Mixing ventilation delivers supply air at high velocity from ceiling diffusers, creating turbulent mixing throughout the room. The goal is a uniform temperature and contaminant concentration.',
    howItWorks:
      'Supply air is delivered through ceiling-mounted diffusers at relatively high velocity. The jets entrain room air, creating thorough mixing. Return air is also typically at ceiling level. The room air becomes a uniform mixture.',
    category: 'Mechanical',
    icon: 'Shuffle',
    color: 'from-teal-500 to-emerald-600',
    achRange: '6–15 ACH',
    efficiency: 'High',
    cost: 'Medium',
    energyUse: 'Medium',
    pros: [
      'Uniform temperature throughout the space',
      'Works for both heating and cooling',
      'Well-understood design principles',
      'Wide range of diffuser options',
    ],
    cons: [
      'Contaminants are spread throughout the room',
      'Higher fan energy than displacement systems',
      'Less energy efficient — supply air must be cooler',
      'Can cause drafts if not designed properly',
    ],
    applications: ['Offices', 'Retail', 'Hotels', 'Residential'],
  },
  {
    id: 11,
    name: 'Personalized Ventilation',
    shortDesc: 'Fresh air delivered directly to individual occupant',
    description:
      'Personalized Ventilation (PV) delivers clean, conditioned air directly to the breathing zone of each occupant through desk-mounted or chair-mounted nozzles. Each person controls their own airflow.',
    howItWorks:
      'Small nozzles or diffusers at the workstation deliver fresh air at low flow rates directly to the occupant\'s face. The user controls direction and flow rate. Background ventilation handles the rest of the space.',
    category: 'Mechanical',
    icon: 'MoveHorizontal',
    color: 'from-pink-500 to-rose-600',
    achRange: '2–6 ACH (per person)',
    efficiency: 'Very High',
    cost: 'High',
    energyUse: 'Low',
    pros: [
      'Highest air quality at the breathing zone',
      'Individual comfort control',
      'Reduces total ventilation air volume needed',
      'Proven to reduce infection risk',
    ],
    cons: [
      'Complex piping/ductwork to each workstation',
      'Only works for seated, fixed workstations',
      'Higher installation cost',
      'Maintenance of individual units',
    ],
    applications: ['Open-plan offices', 'Call centers', 'Aircraft cabins', 'Hospital beds'],
  },
  {
    id: 12,
    name: 'Positive Pressure Ventilation',
    shortDesc: 'Maintains higher indoor pressure to prevent infiltration',
    description:
      'Positive pressure ventilation maintains indoor air pressure slightly above atmospheric pressure. This prevents uncontrolled infiltration of outdoor air, dust, insects, and contaminants.',
    howItWorks:
      'Supply fans deliver more air than exhaust fans remove, creating a net positive pressure (typically 0.02–0.05 inches WG). Air leaks outward through any gaps. Critical for clean rooms and hospitals.',
    category: 'Mechanical',
    icon: 'ArrowUpFromLine',
    color: 'from-lime-500 to-green-600',
    achRange: '10–600+ ACH',
    efficiency: 'Very High',
    cost: 'High',
    energyUse: 'High',
    pros: [
      'Prevents contamination from outside',
      'Essential for clean rooms and sterile environments',
      'Keeps insects and dust out',
      'Controlled air quality',
    ],
    cons: [
      'High energy consumption',
      'Requires well-sealed building envelope',
      'Can push moisture into walls in cold climates',
      'Expensive to maintain',
    ],
    applications: ['Clean rooms', 'Operating theaters', 'Pharmaceutical manufacturing', 'Electronics assembly'],
  },
  {
    id: 13,
    name: 'Negative Pressure Ventilation',
    shortDesc: 'Lower indoor pressure contains contaminants inside',
    description:
      'Negative pressure ventilation maintains indoor air pressure slightly below atmospheric pressure. This ensures that air always flows inward, containing any airborne contaminants within the space.',
    howItWorks:
      'Exhaust fans remove more air than supply fans deliver, creating net negative pressure. Air flows inward through controlled openings. Used to contain hazardous materials, odors, or infectious agents.',
    category: 'Mechanical',
    icon: 'Zap',
    color: 'from-red-500 to-rose-600',
    achRange: '6–12 ACH',
    efficiency: 'High',
    cost: 'Medium–High',
    energyUse: 'Medium',
    pros: [
      'Contains airborne contaminants within the room',
      'Prevents odors from spreading to adjacent spaces',
      'Essential for infection control',
      'Protects surrounding areas',
    ],
    cons: [
      'Unfiltered air infiltration through cracks',
      'Can draw in radon or soil gases at ground level',
      'Requires careful pressure monitoring',
      'Door operation can disrupt pressure balance',
    ],
    applications: ['Isolation rooms', 'Laboratories', 'Kitchens', 'Bathrooms', 'Chemical storage'],
  },
  {
    id: 14,
    name: 'Jet Fan Ventilation',
    shortDesc: 'Ductless fans for large open spaces like parking',
    description:
      'Jet fan ventilation uses wall or ceiling-mounted jet fans to move air in large, open spaces without ductwork. Commonly used in underground car parks to dilute vehicle exhaust.',
    howItWorks:
      'Multiple jet fans mounted on the ceiling create a directed airflow pattern that moves air from fresh air inlets toward exhaust points. They work in sequence to push air across the entire space. No ductwork needed.',
    category: 'Mechanical',
    icon: 'Fan',
    color: 'from-slate-500 to-gray-600',
    achRange: '6–12 ACH',
    efficiency: 'High',
    cost: 'Medium',
    energyUse: 'Medium',
    pros: [
      'No ductwork required — saves headroom',
      'Flexible installation and rearrangement',
      'Lower installed cost than ducted systems',
      'Effective smoke management in fire scenarios',
    ],
    cons: [
      'Can create noise in enclosed spaces',
      'Requires CFD analysis for optimal placement',
      'Not suitable for small rooms',
      'Limited to large open volumes',
    ],
    applications: ['Underground car parks', 'Tunnels', 'Bus stations', 'Loading docks'],
  },
  {
    id: 15,
    name: 'Mechanical Ventilation with Heat Recovery (MVHR)',
    shortDesc: 'Whole-house balanced system with heat recovery',
    description:
      'MVHR is a whole-building balanced ventilation system that combines supply and exhaust fans with a heat exchanger. It provides continuous, filtered fresh air while recovering up to 90% of the heat from exhaust air.',
    howItWorks:
      'A central unit contains supply and exhaust fans plus a high-efficiency heat exchanger. Supply air is drawn from outside, filtered, pre-heated by the heat exchanger, and distributed to living spaces. Exhaust air is drawn from wet rooms (kitchens, bathrooms), passes through the heat exchanger, and is expelled outside.',
    category: 'Hybrid',
    icon: 'Cog',
    color: 'from-fuchsia-500 to-pink-600',
    achRange: '0.5–1.5 ACH (whole building)',
    efficiency: 'Very High',
    cost: 'High',
    energyUse: 'Very Low',
    pros: [
      'Up to 90% heat recovery efficiency',
      'Continuous filtered fresh air to all rooms',
      'Eliminates condensation and mold risk',
      'Essential for airtight/passive house construction',
    ],
    cons: [
      'High initial cost (unit + full ductwork)',
      'Requires careful design and installation',
      'Regular filter changes needed (every 3–6 months)',
      'Ductwork takes up space in walls/ceilings',
    ],
    applications: ['Passive houses', 'New-build residential', 'Low-energy buildings', 'Apartments'],
  },
  {
    id: 16,
    name: 'Hybrid (Mixed-Mode) Ventilation',
    shortDesc: 'Switches between natural and mechanical as needed',
    description:
      'Hybrid ventilation intelligently combines natural and mechanical ventilation. It uses natural ventilation when outdoor conditions are favorable and switches to mechanical when they are not.',
    howItWorks:
      'Sensors monitor outdoor temperature, humidity, wind speed, and indoor CO₂. When conditions are suitable, motorized windows/louvers open for natural ventilation. When conditions deteriorate, the BMS closes openings and activates mechanical ventilation.',
    category: 'Hybrid',
    icon: 'CircleDot',
    color: 'from-emerald-500 to-cyan-600',
    achRange: '2–15 ACH',
    efficiency: 'Very High',
    cost: 'High',
    energyUse: 'Low',
    pros: [
      'Best of both worlds — comfort + efficiency',
      'Major energy savings over pure mechanical',
      'Occupant satisfaction (operable windows)',
      'Resilient — works even during power failures (natural mode)',
    ],
    cons: [
      'Complex control systems required',
      'Higher design and installation cost',
      'Requires BMS integration',
      'May not suit all climates or building types',
    ],
    applications: ['Modern offices', 'Universities', 'Libraries', 'Mixed-use buildings'],
  },
];

interface RecommendedACH {
  space: string;
  ach: number;
}

const recommendedACH: RecommendedACH[] = [
  { space: 'Bedroom', ach: 4 },
  { space: 'Living Room', ach: 4 },
  { space: 'Kitchen', ach: 15 },
  { space: 'Bathroom', ach: 10 },
  { space: 'Office', ach: 6 },
  { space: 'Classroom', ach: 6 },
  { space: 'Conference Room', ach: 8 },
  { space: 'Restaurant', ach: 12 },
  { space: 'Hospital Ward', ach: 6 },
  { space: 'Operating Theater', ach: 25 },
  { space: 'Laboratory', ach: 10 },
  { space: 'Clean Room (ISO 7)', ach: 60 },
  { space: 'Gymnasium', ach: 8 },
  { space: 'Parking Garage', ach: 6 },
  { space: 'Server Room', ach: 15 },
  { space: 'Industrial Workshop', ach: 10 },
  { space: 'Warehouse', ach: 4 },
  { space: 'Auditorium', ach: 6 },
  { space: 'Retail Store', ach: 8 },
  { space: 'Swimming Pool', ach: 6 },
  { space: 'Boiler Room', ach: 15 },
  { space: 'STP Room', ach: 30 },
  { space: 'DG Room', ach: 30 },
  { space: 'Electrical Room', ach: 15 },
];

/* ============================================================================
   DATA: ASHRAE 62.1 Table
============================================================================ */

interface ASHRAEEntry {
  occupancy: string;
  rpCfm: string;
  rpLs: string;
  raCfm: string;
  raLs: string;
  notes: string;
  density: string;
  combinedCfm: string;
  combinedLs: string;
  airClass: string;
}

interface ASHRAECategory {
  category: string;
  entries: ASHRAEEntry[];
}

const ashrae621Table: ASHRAECategory[] = [
  {
    category: 'Correctional Facilities',
    entries: [
      { occupancy: 'Booking/waiting', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '50', combinedCfm: '8.7', combinedLs: '4.4', airClass: '2' },
      { occupancy: 'Cell', rpCfm: '5', rpLs: '2.5', raCfm: '0.12', raLs: '0.6', notes: '', density: '25', combinedCfm: '9.8', combinedLs: '4.9', airClass: '2' },
      { occupancy: 'Dayroom', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '30', combinedCfm: '7', combinedLs: '3.5', airClass: '1' },
      { occupancy: 'Guard station', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '15', combinedCfm: '9', combinedLs: '4.5', airClass: '1' },
    ],
  },
  {
    category: 'Education Facilities',
    entries: [
      { occupancy: 'Art classroom', rpCfm: '10', rpLs: '5', raCfm: '0.18', raLs: '0.9', notes: '', density: '20', combinedCfm: '19', combinedLs: '9.5', airClass: '2' },
      { occupancy: 'Classroom (ages 5-8)', rpCfm: '10', rpLs: '5', raCfm: '0.12', raLs: '0.6', notes: '', density: '25', combinedCfm: '14.8', combinedLs: '7.4', airClass: '1' },
      { occupancy: 'Classroom (ages 9+)', rpCfm: '10', rpLs: '5', raCfm: '0.12', raLs: '0.6', notes: '', density: '35', combinedCfm: '13.4', combinedLs: '6.7', airClass: '1' },
      { occupancy: 'Computer lab', rpCfm: '10', rpLs: '5', raCfm: '0.12', raLs: '0.6', notes: '', density: '25', combinedCfm: '14.8', combinedLs: '7.4', airClass: '1' },
      { occupancy: 'Daycare (through age 4)', rpCfm: '10', rpLs: '5', raCfm: '0.18', raLs: '0.9', notes: '', density: '25', combinedCfm: '17.2', combinedLs: '8.6', airClass: '2' },
      { occupancy: 'Lecture classroom', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '65', combinedCfm: '8.4', combinedLs: '4.3', airClass: '1' },
      { occupancy: 'Lecture hall (fixed seats)', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '150', combinedCfm: '7.9', combinedLs: '4.1', airClass: '1' },
      { occupancy: 'Library', rpCfm: '5', rpLs: '2.5', raCfm: '0.12', raLs: '0.6', notes: '', density: '10', combinedCfm: '17', combinedLs: '8.5', airClass: '1' },
      { occupancy: 'Media center', rpCfm: '10', rpLs: '5', raCfm: '0.12', raLs: '0.6', notes: '', density: '25', combinedCfm: '14.8', combinedLs: '7.4', airClass: '1' },
      { occupancy: 'Music/drama', rpCfm: '10', rpLs: '5', raCfm: '0.06', raLs: '0.3', notes: '', density: '35', combinedCfm: '11.7', combinedLs: '5.9', airClass: '1' },
      { occupancy: 'Science laboratory', rpCfm: '10', rpLs: '5', raCfm: '0.18', raLs: '0.9', notes: '', density: '25', combinedCfm: '17.2', combinedLs: '8.6', airClass: '2' },
      { occupancy: 'University laboratory', rpCfm: '10', rpLs: '5', raCfm: '0.18', raLs: '0.9', notes: '', density: '25', combinedCfm: '17.2', combinedLs: '8.6', airClass: '2' },
      { occupancy: 'Wood/metal shop', rpCfm: '10', rpLs: '5', raCfm: '0.18', raLs: '0.9', notes: '', density: '20', combinedCfm: '19', combinedLs: '9.5', airClass: '2' },
    ],
  },
  {
    category: 'Food and Beverage Service',
    entries: [
      { occupancy: 'Bar, cocktail lounge', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.18', raLs: '0.9', notes: '', density: '100', combinedCfm: '9.3', combinedLs: '4.7', airClass: '2' },
      { occupancy: 'Cafeteria/fast food', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.18', raLs: '0.9', notes: '', density: '100', combinedCfm: '9.3', combinedLs: '4.7', airClass: '2' },
      { occupancy: 'Kitchen (cooking)', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.12', raLs: '0.6', notes: '', density: '20', combinedCfm: '13.5', combinedLs: '6.8', airClass: '2' },
      { occupancy: 'Restaurant dining room', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.18', raLs: '0.9', notes: '', density: '70', combinedCfm: '10.1', combinedLs: '5.2', airClass: '2' },
    ],
  },
  {
    category: 'General',
    entries: [
      { occupancy: 'Break room', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '25', combinedCfm: '7.4', combinedLs: '3.7', airClass: '1' },
      { occupancy: 'Coffee station', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '20', combinedCfm: '8', combinedLs: '4', airClass: '1' },
      { occupancy: 'Conference/meeting', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '50', combinedCfm: '6.2', combinedLs: '3.1', airClass: '1' },
      { occupancy: 'Corridor', rpCfm: '0', rpLs: '0', raCfm: '0.06', raLs: '0.3', notes: '', density: '—', combinedCfm: '—', combinedLs: '—', airClass: '1' },
      { occupancy: 'Occupiable storage', rpCfm: '0', rpLs: '0', raCfm: '0.12', raLs: '0.6', notes: '', density: '2', combinedCfm: '—', combinedLs: '—', airClass: '1' },
    ],
  },
  {
    category: 'Hotels, Motels, Resorts, Dormitories',
    entries: [
      { occupancy: 'Bedroom/living area', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '10', combinedCfm: '11', combinedLs: '5.5', airClass: '1' },
      { occupancy: 'Barracks sleeping area', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '20', combinedCfm: '8', combinedLs: '4', airClass: '1' },
      { occupancy: 'Laundry (central)', rpCfm: '5', rpLs: '2.5', raCfm: '0.12', raLs: '0.6', notes: '', density: '10', combinedCfm: '17', combinedLs: '8.5', airClass: '2' },
      { occupancy: 'Lobby/prefunction', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '30', combinedCfm: '9.5', combinedLs: '4.8', airClass: '1' },
      { occupancy: 'Multipurpose assembly', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '120', combinedCfm: '5.5', combinedLs: '2.8', airClass: '1' },
    ],
  },
  {
    category: 'Office Buildings',
    entries: [
      { occupancy: 'Main entry lobby', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '10', combinedCfm: '11', combinedLs: '5.5', airClass: '1' },
      { occupancy: 'Office space', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '5', combinedCfm: '17', combinedLs: '8.5', airClass: '1' },
      { occupancy: 'Reception area', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '30', combinedCfm: '7', combinedLs: '3.5', airClass: '1' },
      { occupancy: 'Telephone/data entry', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '60', combinedCfm: '6', combinedLs: '3', airClass: '1' },
    ],
  },
  {
    category: 'Miscellaneous Spaces',
    entries: [
      { occupancy: 'Bank vault/safe deposit', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '5', combinedCfm: '17', combinedLs: '8.5', airClass: '2' },
      { occupancy: 'Computer (not printing)', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '4', combinedCfm: '20', combinedLs: '10', airClass: '1' },
      { occupancy: 'Electrical equipment room', rpCfm: '0', rpLs: '0', raCfm: '0.06', raLs: '0.3', notes: '', density: '—', combinedCfm: '—', combinedLs: '—', airClass: '1' },
      { occupancy: 'Elevator car', rpCfm: '0', rpLs: '0', raCfm: '0.06', raLs: '0.3', notes: '', density: '—', combinedCfm: '—', combinedLs: '—', airClass: '1' },
      { occupancy: 'Pharmacy', rpCfm: '5', rpLs: '2.5', raCfm: '0.18', raLs: '0.9', notes: '', density: '10', combinedCfm: '23', combinedLs: '11.5', airClass: '2' },
      { occupancy: 'Photo studio', rpCfm: '5', rpLs: '2.5', raCfm: '0.12', raLs: '0.6', notes: '', density: '10', combinedCfm: '17', combinedLs: '8.5', airClass: '2' },
      { occupancy: 'Shipping/receiving', rpCfm: '0', rpLs: '0', raCfm: '0.12', raLs: '0.6', notes: '', density: '—', combinedCfm: '—', combinedLs: '—', airClass: '2' },
      { occupancy: 'Telephone closet', rpCfm: '0', rpLs: '0', raCfm: '0.06', raLs: '0.3', notes: '', density: '—', combinedCfm: '—', combinedLs: '—', airClass: '1' },
      { occupancy: 'Transportation waiting', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '100', combinedCfm: '8.1', combinedLs: '4.1', airClass: '1' },
      { occupancy: 'Warehouse', rpCfm: '0', rpLs: '0', raCfm: '0.06', raLs: '0.3', notes: '', density: '—', combinedCfm: '—', combinedLs: '—', airClass: '2' },
    ],
  },
  {
    category: 'Public Assembly Spaces',
    entries: [
      { occupancy: 'Auditorium seating', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '150', combinedCfm: '5.4', combinedLs: '2.7', airClass: '1' },
      { occupancy: 'Places of worship', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '120', combinedCfm: '5.5', combinedLs: '2.8', airClass: '1' },
      { occupancy: 'Courtroom', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '70', combinedCfm: '5.9', combinedLs: '2.9', airClass: '1' },
      { occupancy: 'Legislative chambers', rpCfm: '5', rpLs: '2.5', raCfm: '0.06', raLs: '0.3', notes: '', density: '50', combinedCfm: '6.2', combinedLs: '3.1', airClass: '1' },
      { occupancy: 'Library', rpCfm: '5', rpLs: '2.5', raCfm: '0.12', raLs: '0.6', notes: '', density: '10', combinedCfm: '17', combinedLs: '8.5', airClass: '1' },
      { occupancy: 'Museum/gallery', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '40', combinedCfm: '9', combinedLs: '4.5', airClass: '1' },
    ],
  },
  {
    category: 'Retail',
    entries: [
      { occupancy: 'Sales area (dept store)', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.12', raLs: '0.6', notes: '', density: '15', combinedCfm: '15.5', combinedLs: '7.8', airClass: '2' },
      { occupancy: 'Mall common area', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '40', combinedCfm: '9', combinedLs: '4.5', airClass: '1' },
      { occupancy: 'Barbershop', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '25', combinedCfm: '9.9', combinedLs: '5', airClass: '2' },
      { occupancy: 'Beauty/nail salon', rpCfm: '20', rpLs: '10', raCfm: '0.12', raLs: '0.6', notes: '', density: '25', combinedCfm: '24.8', combinedLs: '12.4', airClass: '2' },
      { occupancy: 'Pet shop', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.18', raLs: '0.9', notes: '', density: '10', combinedCfm: '25.5', combinedLs: '12.8', airClass: '2' },
      { occupancy: 'Supermarket', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '8', combinedCfm: '15', combinedLs: '7.6', airClass: '1' },
    ],
  },
  {
    category: 'Sports and Entertainment',
    entries: [
      { occupancy: 'Disco/dance floor', rpCfm: '20', rpLs: '10', raCfm: '0.06', raLs: '0.3', notes: '', density: '100', combinedCfm: '20.6', combinedLs: '10.3', airClass: '2' },
      { occupancy: 'Bowling alley', rpCfm: '10', rpLs: '5', raCfm: '0.12', raLs: '0.6', notes: '', density: '40', combinedCfm: '13', combinedLs: '6.5', airClass: '1' },
      { occupancy: 'Game arcade', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.18', raLs: '0.9', notes: '', density: '20', combinedCfm: '16.5', combinedLs: '8.3', airClass: '1' },
      { occupancy: 'Gym/fitness (play area)', rpCfm: '20', rpLs: '10', raCfm: '0.06', raLs: '0.3', notes: '', density: '7', combinedCfm: '28.6', combinedLs: '14.3', airClass: '2' },
      { occupancy: 'Health club/aerobics', rpCfm: '20', rpLs: '10', raCfm: '0.06', raLs: '0.3', notes: '', density: '40', combinedCfm: '21.5', combinedLs: '10.8', airClass: '2' },
      { occupancy: 'Spectator area', rpCfm: '7.5', rpLs: '3.8', raCfm: '0.06', raLs: '0.3', notes: '', density: '150', combinedCfm: '7.9', combinedLs: '4.1', airClass: '1' },
      { occupancy: 'Swimming pool area', rpCfm: '0', rpLs: '0', raCfm: '0.48', raLs: '2.4', notes: '', density: '—', combinedCfm: '—', combinedLs: '—', airClass: '2' },
    ],
  },
];

const generalNotes: string[] = [
  'Table 6.2.2.1 is the minimum ventilation rates for the listed occupancy categories.',
  'Rates are based on the ventilation rate procedure in Section 6.2.',
  'These rates may not alone provide thermal comfort; supplemental conditioning may be needed.',
  'Rp is the outdoor airflow rate required per person. Ra is the outdoor airflow rate required per unit area.',
  'The zone outdoor airflow (Vbz) is calculated as: Vbz = Rp x Pz + Ra x Az.',
  'Default occupant densities are provided to assist designers when actual occupancy is not known.',
  'Combined outdoor air rate is based on default occupant density and equals Rp + (Ra x 1000)/density.',
  'Air class designations are used to determine recirculation limitations per Section 5.16.',
];

const itemSpecificNotes: { code: string; note: string }[] = [
  { code: 'A', note: 'Rate does not allow for humidity control. Additional ventilation or dehumidification may be needed.' },
  { code: 'B', note: 'Rate may not be sufficient for occupancies involving significant sources of contaminants such as printers and copiers.' },
  { code: 'C', note: 'Rate is based on the assumption that the kitchen hoods are operating. If hoods are not operating, increase rate.' },
  { code: 'D', note: 'Rate does not include provisions for exhaust air required for laboratory fume hoods or other exhaust devices.' },
  { code: 'E', note: 'Rate is based on sedentary activity. For higher activity levels, use the appropriate rate from a higher occupancy category.' },
  { code: 'F', note: 'Rate applies when no unusual contaminant sources are present. Higher rates may be needed for some industrial processes.' },
];

/* ============================================================================
   DATA: Room Ventilation Reference
============================================================================ */

interface RoomVentilationItem {
  name: string;
  achRange: string;
  achMid: number;
  freshAir: boolean;
  exhaust: boolean;
  pressure: string;
}

interface RoomVentilationCategory {
  category: string;
  icon: string;
  items: RoomVentilationItem[];
}

const roomVentilationData: RoomVentilationCategory[] = [
  {
    category: 'Residential',
    icon: '🏠',
    items: [
      { name: 'Bedroom', achRange: '2–4', achMid: 4, freshAir: true, exhaust: false, pressure: 'Positive' },
      { name: 'Living Room', achRange: '3–6', achMid: 4, freshAir: true, exhaust: false, pressure: 'Positive' },
      { name: 'Kitchen (Residential)', achRange: '15–25', achMid: 20, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Bathroom/Toilet', achRange: '6–10', achMid: 8, freshAir: false, exhaust: true, pressure: 'Negative' },
      { name: 'Laundry Room', achRange: '8–12', achMid: 10, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Dining Room', achRange: '3–6', achMid: 5, freshAir: true, exhaust: false, pressure: 'Positive' },
      { name: 'Corridor/Hallway', achRange: '2–4', achMid: 3, freshAir: true, exhaust: false, pressure: 'Neutral' },
    ],
  },
  {
    category: 'Commercial/Office',
    icon: '🏢',
    items: [
      { name: 'General Office', achRange: '4–8', achMid: 6, freshAir: true, exhaust: false, pressure: 'Positive' },
      { name: 'Conference Room', achRange: '6–10', achMid: 8, freshAir: true, exhaust: true, pressure: 'Neutral' },
      { name: 'Reception/Lobby', achRange: '4–6', achMid: 5, freshAir: true, exhaust: false, pressure: 'Positive' },
      { name: 'Server/IT Room', achRange: '10–20', achMid: 15, freshAir: true, exhaust: true, pressure: 'Positive' },
      { name: 'Print/Copy Room', achRange: '6–10', achMid: 8, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Storage Room', achRange: '1–3', achMid: 2, freshAir: false, exhaust: true, pressure: 'Negative' },
      { name: 'Pantry/Break Room', achRange: '8–12', achMid: 10, freshAir: true, exhaust: true, pressure: 'Negative' },
    ],
  },
  {
    category: 'Healthcare',
    icon: '🏥',
    items: [
      { name: 'Hospital Ward', achRange: '4–6', achMid: 6, freshAir: true, exhaust: true, pressure: 'Neutral' },
      { name: 'Operating Theater', achRange: '20–30', achMid: 25, freshAir: true, exhaust: true, pressure: 'Positive' },
      { name: 'ICU', achRange: '6–12', achMid: 10, freshAir: true, exhaust: true, pressure: 'Positive' },
      { name: 'Isolation Room', achRange: '6–12', achMid: 12, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Pharmacy', achRange: '6–10', achMid: 8, freshAir: true, exhaust: true, pressure: 'Positive' },
      { name: 'Lab (Clinical)', achRange: '6–12', achMid: 10, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Autopsy Room', achRange: '12–15', achMid: 12, freshAir: true, exhaust: true, pressure: 'Negative' },
    ],
  },
  {
    category: 'Industrial/Utility',
    icon: '🏭',
    items: [
      { name: 'Workshop', achRange: '6–10', achMid: 8, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Warehouse', achRange: '2–4', achMid: 3, freshAir: true, exhaust: false, pressure: 'Neutral' },
      { name: 'Parking Garage', achRange: '6–12', achMid: 6, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Boiler Room', achRange: '15–25', achMid: 20, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Electrical Room', achRange: '10–15', achMid: 15, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Transformer Room', achRange: '20–30', achMid: 25, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Pump Room', achRange: '10–20', achMid: 15, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'STP Room', achRange: '20–30', achMid: 30, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'DG Room', achRange: '20–30', achMid: 30, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Lift Machine Room', achRange: '10–15', achMid: 15, freshAir: true, exhaust: true, pressure: 'Negative' },
    ],
  },
  {
    category: 'Hospitality',
    icon: '🏨',
    items: [
      { name: 'Hotel Room', achRange: '4–6', achMid: 5, freshAir: true, exhaust: false, pressure: 'Positive' },
      { name: 'Restaurant Dining', achRange: '8–12', achMid: 10, freshAir: true, exhaust: true, pressure: 'Neutral' },
      { name: 'Commercial Kitchen', achRange: '25–40', achMid: 30, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Bar/Lounge', achRange: '10–15', achMid: 12, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Banquet Hall', achRange: '6–10', achMid: 8, freshAir: true, exhaust: true, pressure: 'Neutral' },
      { name: 'Swimming Pool Area', achRange: '4–8', achMid: 6, freshAir: true, exhaust: true, pressure: 'Negative' },
    ],
  },
  {
    category: 'Education',
    icon: '🎓',
    items: [
      { name: 'Classroom', achRange: '4–8', achMid: 6, freshAir: true, exhaust: false, pressure: 'Positive' },
      { name: 'Computer Lab', achRange: '6–10', achMid: 8, freshAir: true, exhaust: true, pressure: 'Positive' },
      { name: 'Science Lab', achRange: '8–15', achMid: 12, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Library', achRange: '4–6', achMid: 5, freshAir: true, exhaust: false, pressure: 'Positive' },
      { name: 'Auditorium', achRange: '4–8', achMid: 6, freshAir: true, exhaust: true, pressure: 'Neutral' },
      { name: 'Gymnasium', achRange: '6–10', achMid: 8, freshAir: true, exhaust: true, pressure: 'Negative' },
    ],
  },
  {
    category: 'Cleanroom / Specialized',
    icon: '🔬',
    items: [
      { name: 'ISO Class 5 (Class 100)', achRange: '240–480', achMid: 360, freshAir: true, exhaust: true, pressure: 'Positive' },
      { name: 'ISO Class 6 (Class 1000)', achRange: '90–180', achMid: 120, freshAir: true, exhaust: true, pressure: 'Positive' },
      { name: 'ISO Class 7 (Class 10000)', achRange: '30–60', achMid: 45, freshAir: true, exhaust: true, pressure: 'Positive' },
      { name: 'ISO Class 8 (Class 100000)', achRange: '10–25', achMid: 20, freshAir: true, exhaust: true, pressure: 'Positive' },
      { name: 'BSL-2 Laboratory', achRange: '6–12', achMid: 10, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'BSL-3 Laboratory', achRange: '12–15', achMid: 12, freshAir: true, exhaust: true, pressure: 'Negative' },
      { name: 'Paint Booth', achRange: '50–100', achMid: 75, freshAir: true, exhaust: true, pressure: 'Negative' },
    ],
  },
];

/* ============================================================================
   THEME CONTEXT
============================================================================ */

type Theme = 'dark' | 'light';

const VentilationThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
});

const useVentilationTheme = () => useContext(VentilationThemeContext);
const useTheme = useVentilationTheme;

/* ============================================================================
   COMPONENT: PrintHeader
============================================================================ */

function PrintHeader({ elementDescription }: { elementDescription: string }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [info, setInfo] = useState({
    project: '',
    areaProject: '',
    elementDescription,
    pageNumber: '',
    revision: '',
    preparedBy: '',
    preparedDate: '',
    checkedBy: '',
    checkedDate: '',
  });

  const update = (field: keyof typeof info, value: string) =>
    setInfo((prev) => ({ ...prev, [field]: value }));

  const [pdfBusy, setPdfBusy] = useState(false);

  // Builds a clean, off-screen, print-styled clone of the sections to be exported.
  // Shared by both the mobile PDF path and (indirectly) the desktop print path.
  const cloneSourceNodes = (sourceNodes: HTMLElement[]): HTMLElement[] => {
    return sourceNodes.map((node) => {
      const clone = node.cloneNode(true) as HTMLElement;

      // Un-hide the root element itself if it's a "hidden print:block" node
      // (querySelectorAll below only checks descendants, not the root clone).
      const rootCls = clone.className || '';
      if (clone.classList.contains('hidden')) {
        if (rootCls.includes('print:block') || rootCls.includes('print:flex')) {
          clone.style.display = 'block';
          clone.classList.remove('hidden');
        }
      }

      clone.querySelectorAll(
        '.print\\:hidden, [class*="print:hidden"], button, [role="button"]'
      ).forEach((el) => el.remove());

      clone.querySelectorAll('.hidden').forEach((el) => {
        const cls = (el as HTMLElement).className || '';
        if (cls.includes('print:block') || cls.includes('print:flex')) {
          (el as HTMLElement).style.display = 'block';
          (el as HTMLElement).classList.remove('hidden');
        } else {
          el.remove();
        }
      });

      clone.querySelectorAll('input, select, textarea').forEach((el) => {
        const inp = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const span = document.createElement('span');
        span.textContent = 'value' in inp ? String(inp.value || '') : '';
        span.style.cssText = 'display:inline-block;width:100%;padding:1px 2px;font-size:10px;color:#000;';
        el.replaceWith(span);
      });

      return clone;
    });
  };

  // Same print-reset CSS used by the desktop iframe print flow — reused here so
  // the mobile-captured PDF looks identical (clean white/black) regardless of
  // whether the app is currently in dark or light theme.
  const PRINT_RESET_CSS = `
    * { box-sizing: border-box; }
    .hvac-pdf-root, .hvac-pdf-root * {
      background-color: transparent;
      color: #000 !important;
    }
    .hvac-pdf-root {
      background: #ffffff !important;
    }
    .hvac-pdf-root table {
      border-collapse: collapse !important;
      width: 100% !important;
      table-layout: fixed !important;
      margin-bottom: 10px;
    }
    .hvac-pdf-root td, .hvac-pdf-root th {
      border: 1px solid #000 !important;
      padding: 2px 3px !important;
      font-size: 9px !important;
      line-height: 1.2 !important;
      color: #000 !important;
      vertical-align: middle !important;
      word-wrap: break-word !important;
      background: #ffffff !important;
    }
    .hvac-pdf-root th { font-weight: 700 !important; text-align: center !important; }
    .hvac-pdf-root [class*="d9e2f3"] { background: #d9e2f3 !important; }
    .hvac-pdf-root .rounded-2xl, .hvac-pdf-root .ring-1, .hvac-pdf-root .shadow-sm, .hvac-pdf-root .overflow-hidden {
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }
    .hvac-pdf-root .space-y-6 > * + *, .hvac-pdf-root .space-y-4 > * + * { margin-top: 10px; }
  `;

  // MOBILE/NATIVE PATH: renders the clones into an off-screen container,
  // rasterizes them with html2canvas, builds a multi-page PDF with jsPDF,
  // then opens the native Share sheet so the user can Save/Download it
  // (native WebViews have no window.print() dialog, so this replaces it).
  const generateAndSharePdfMobile = async (sourceNodes: HTMLElement[], fileLabel: string) => {
    const clones = cloneSourceNodes(sourceNodes);

    const container = document.createElement('div');
    container.className = 'hvac-pdf-root';
    container.style.cssText =
      'position:fixed; left:-9999px; top:0; width:1000px; background:#ffffff; color:#000000; padding:16px; font-family:Arial, Helvetica, sans-serif; z-index:-1;';

    const styleTag = document.createElement('style');
    styleTag.textContent = PRINT_RESET_CSS;
    container.appendChild(styleTag);

    clones.forEach((clone) => {
      clone.style.borderRadius = '0';
      clone.style.boxShadow = 'none';
      container.appendChild(clone);
    });
    document.body.appendChild(container);

    try {
      setPdfBusy(true);
      // let layout settle before rasterizing
      await new Promise((resolve) => setTimeout(resolve, 200));

      let canvas: HTMLCanvasElement;
      try {
        canvas = await html2canvas(container, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
        });
      } catch (renderErr: any) {
        throw new Error(`Render step failed: ${renderErr?.message || renderErr}`);
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const base64Data = pdf.output('datauristring').split(',')[1];
      const safeName = fileLabel.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '') || 'HVAC_Calculation';
      const fileName = `${safeName}_${Date.now()}.pdf`;

      let savedFile;
      try {
        savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });
      } catch (fsErr: any) {
        throw new Error(`Save step failed: ${fsErr?.message || fsErr}`);
      }

      try {
        await Share.share({
          title: fileLabel,
          text: 'HVAC calculation PDF',
          url: savedFile.uri,
          dialogTitle: 'Save or Share PDF',
        });
      } catch (shareErr: any) {
        throw new Error(`Share step failed: ${shareErr?.message || shareErr}`);
      }
    } catch (err: any) {
      console.error('Mobile PDF generation failed:', err);
      alert(`PDF error: ${err?.message || err}`);
    } finally {
      container.remove();
      setPdfBusy(false);
    }
  };

  const handlePrint = async (e?: React.MouseEvent) => {
    // Build a clean print document from this PrintHeader + sibling print content only.
    // Uses a hidden iframe so parent-app bottom nav / theme toggle never appear.
    const btn = (e?.currentTarget as HTMLElement | null) || (document.activeElement as HTMLElement | null);
    const hostCard = btn?.closest('.space-y-6, .space-y-4')
      || (document.getElementById('print-root') as HTMLElement | null)
      || (document.querySelector('main') as HTMLElement | null)
      || document.body;

    // Prefer data-print-section roots if present
    const printSections = hostCard.querySelectorAll('[data-print-section]');
    const sourceNodes: HTMLElement[] = printSections.length > 0
      ? Array.from(printSections) as HTMLElement[]
      : [hostCard as HTMLElement];

    // ── MOBILE / NATIVE APP: window.print() has no dialog here, so
    // generate a real PDF file and hand it to the native Share/Save sheet.
    if (Capacitor.isNativePlatform()) {
      await generateAndSharePdfMobile(sourceNodes, info.elementDescription || 'HVAC_Calculation');
      return;
    }

    // ── DESKTOP / WEB: keep the existing browser print flow unchanged.
    // Remove old iframe if any
    const old = document.getElementById('hvac-print-frame');
    if (old) old.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'hvac-print-frame';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;';
    document.body.appendChild(iframe);

    const idoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!idoc) {
      iframe.remove();
      window.print();
      return;
    }

    // Build HTML fragments
    const parts: string[] = [];
    sourceNodes.forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;

      // Strip screen-only UI
      clone.querySelectorAll(
        '.print\\:hidden, [class*="print:hidden"], button, [role="button"]'
      ).forEach((el) => el.remove());

      // Force-show print-only blocks
      clone.querySelectorAll('.hidden').forEach((el) => {
        const cls = (el as HTMLElement).className || '';
        if (cls.includes('print:block') || cls.includes('print:flex')) {
          (el as HTMLElement).style.display = 'block';
          (el as HTMLElement).classList.remove('hidden');
        } else {
          // screen-only hidden that is not print:block — remove
          el.remove();
        }
      });

      // Replace inputs with plain text
      clone.querySelectorAll('input, select, textarea').forEach((el) => {
        const inp = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const span = document.createElement('span');
        span.textContent = 'value' in inp ? String(inp.value || '') : '';
        span.style.cssText = 'display:inline-block;width:100%;padding:1px 2px;font-size:10px;color:#000;';
        el.replaceWith(span);
      });

      parts.push(clone.outerHTML);
    });

    idoc.open();
    idoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>HVAC Calculation Print</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      color: #000 !important;
      font-family: Arial, Helvetica, sans-serif;
    }
    body { padding: 4mm !important; }
    /* Absolutely no app chrome */
    nav, footer, header, button, [class*="fixed"], [class*="sticky"],
    [class*="bottom"], [class*="toggle"], [class*="theme"], [class*="nav"] {
      display: none !important;
    }
    .print\\:hidden, [class*="print:hidden"] { display: none !important; }
    .hidden.print\\:block, .print\\:block, [class*="print:block"] {
      display: block !important;
      visibility: visible !important;
    }
    table {
      border-collapse: collapse !important;
      width: 100% !important;
      table-layout: fixed !important;
      page-break-inside: auto;
      margin-bottom: 10px;
    }
    td, th {
      border: 1px solid #000 !important;
      padding: 2px 3px !important;
      font-size: 9px !important;
      line-height: 1.2 !important;
      color: #000 !important;
      vertical-align: middle !important;
      word-wrap: break-word !important;
    }
    th { font-weight: 700 !important; text-align: center !important; }
    [class*="d9e2f3"], .bg-\\[\\#d9e2f3\\] {
      background: #d9e2f3 !important;
    }
    .rounded-2xl, .ring-1, .shadow-sm, .overflow-hidden {
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: visible !important;
    }
    .space-y-6 > * + *, .space-y-4 > * + * { margin-top: 10px; }
    input, select, textarea, button { display: none !important; }
    /* Keep first table (document header) full width */
    table:first-of-type { margin-bottom: 8px; }
  </style>
</head>
<body>
  ${parts.join('\n')}
</body>
</html>`);
    idoc.close();

    const win = iframe.contentWindow;
    if (!win) {
      iframe.remove();
      return;
    }

    const cleanup = () => {
      setTimeout(() => {
        try { iframe.remove(); } catch { /* ignore */ }
      }, 400);
    };

    win.onafterprint = cleanup;

    // Wait for layout then print
    setTimeout(() => {
      try {
        win.focus();
        win.print();
      } catch {
        // ignore
      }
      // Safety cleanup if afterprint never fires
      setTimeout(cleanup, 1500);
    }, 300);
  };

  const cellLabel = `border px-3 py-2 text-xs font-bold ${
    isDark ? 'border-slate-700 bg-slate-800/70 text-slate-300' : 'border-slate-300 bg-slate-100 text-slate-700'
  }`;
  const cellInput = `border px-1 py-1 ${isDark ? 'border-slate-700' : 'border-slate-300'}`;
  const inputCls = `w-full bg-transparent px-2 py-1 text-xs outline-none ${
    isDark
      ? 'text-slate-100 placeholder:text-slate-600'
      : 'text-slate-900 placeholder:text-slate-400'
  }`;

  return (
    <div
      data-print-section
      className={`overflow-hidden rounded-2xl ring-1 print:rounded-none print:ring-0 ${
        isDark ? 'bg-slate-900/60 ring-slate-800' : 'bg-white ring-slate-200 shadow-sm'
      }`}
    >
      <div className={`flex items-center justify-between border-b p-4 print:hidden ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Document Information</span>
          <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Fill in project details — they will appear on the printout header
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => handlePrint(e)}
          disabled={pdfBusy}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Printer className="h-4 w-4" />
          {pdfBusy ? 'Generating PDF…' : 'Print / Save PDF'}
        </button>
      </div>

      {/* Excel-style header block */}
      <div className="p-4 print:p-0">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={`${cellLabel} w-40`}>Project</td>
              <td className={cellInput} colSpan={3}>
                <input
                  value={info.project}
                  onChange={(e) => update('project', e.target.value)}
                  placeholder="Enter project name"
                  className={inputCls}
                />
              </td>
              <td className={`${cellLabel} w-32`}>Page Number</td>
              <td className={`${cellInput} w-52`}>
                <input
                  value={info.pageNumber}
                  onChange={(e) => update('pageNumber', e.target.value)}
                  placeholder="e.g. HVAC-CAL-001"
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel}>Area Project</td>
              <td className={cellInput} colSpan={3}>
                <input
                  value={info.areaProject}
                  onChange={(e) => update('areaProject', e.target.value)}
                  placeholder="e.g. Residential Tower / Commercial Block"
                  className={inputCls}
                />
              </td>
              <td className={cellLabel}>Revision</td>
              <td className={cellInput}>
                <input
                  value={info.revision}
                  onChange={(e) => update('revision', e.target.value)}
                  placeholder="e.g. R0"
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel} rowSpan={2}>Element Description</td>
              <td className={cellInput} colSpan={3} rowSpan={2}>
                <input
                  value={info.elementDescription}
                  onChange={(e) => update('elementDescription', e.target.value)}
                  placeholder="e.g. Ventilation Calculation"
                  className={inputCls}
                />
              </td>
              <td className={cellLabel}>Prepared by</td>
              <td className={cellInput}>
                <input
                  value={info.preparedBy}
                  onChange={(e) => update('preparedBy', e.target.value)}
                  placeholder="Enter name / initials"
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel}>Date</td>
              <td className={cellInput}>
                <input
                  type="date"
                  value={info.preparedDate}
                  onChange={(e) => update('preparedDate', e.target.value)}
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel} colSpan={2}></td>
              <td className={cellInput} colSpan={2}></td>
              <td className={cellLabel}>Checked by</td>
              <td className={cellInput}>
                <input
                  value={info.checkedBy}
                  onChange={(e) => update('checkedBy', e.target.value)}
                  placeholder="Enter name / initials"
                  className={inputCls}
                />
              </td>
            </tr>
            <tr>
              <td className={cellLabel} colSpan={2}></td>
              <td className={cellInput} colSpan={2}></td>
              <td className={cellLabel}>Date</td>
              <td className={cellInput}>
                <input
                  type="date"
                  value={info.checkedDate}
                  onChange={(e) => update('checkedDate', e.target.value)}
                  className={inputCls}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================================
   COMPONENT: VentilationTypes
============================================================================ */

const iconMap: Record<string, any> = {
  Wind,
  Fan,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  RefreshCw,
  Zap,
  Activity,
  Target,
  Droplets,
  ArrowUp,
  Shuffle,
  MoveHorizontal,
  ArrowUpFromLine,
  Cog,
  CircleDot,
};

type CategoryFilter = 'All' | 'Natural' | 'Mechanical' | 'Hybrid';

function VentilationTypes() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selected, setSelected] = useState<VentilationType | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');

  const filtered = useMemo(() => {
    return ventilationTypes.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.shortDesc.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || v.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  const categories: CategoryFilter[] = ['All', 'Natural', 'Mechanical', 'Hybrid'];

  return (
    <>
      {/* Search and filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div
          className={`relative flex-1 rounded-xl ${
            isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'
          }`}
        >
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ventilation types..."
            className={`w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none ${
              isDark
                ? 'text-slate-100 placeholder:text-slate-500'
                : 'text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>

        <div
          className={`flex gap-1 rounded-xl p-1 ${
            isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'
          }`}
        >
          <Filter
            className={`ml-2 self-center h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
          />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                category === c
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((v) => {
          const Icon = iconMap[v.icon] ?? Wind;
          return (
            <button
              key={v.id}
              onClick={() => setSelected(v)}
              className={`group relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
                isDark
                  ? 'bg-slate-900/60 ring-1 ring-slate-800 hover:ring-slate-700'
                  : 'bg-white ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-slate-200'
              }`}
            >
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${v.color} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
              />
              <div className="relative">
                <div
                  className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${v.color} shadow-lg`}
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{v.name}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      v.category === 'Natural'
                        ? isDark
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : v.category === 'Mechanical'
                          ? isDark
                            ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30'
                            : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                          : isDark
                            ? 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/30'
                            : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                    }`}
                  >
                    {v.category}
                  </span>
                </div>
                <p
                  className={`mt-2 line-clamp-2 text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {v.shortDesc}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-700/40 pt-3">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Gauge
                      className={`h-3 w-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}
                    />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {v.achRange}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isDark ? 'text-cyan-400' : 'text-cyan-600'
                    } group-hover:underline`}
                  >
                    Details →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          className={`rounded-2xl p-12 text-center ${
            isDark ? 'bg-slate-900/40 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'
          }`}
        >
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            No ventilation type found. Try changing your search or filter.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <DetailModal type={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function DetailModal({
  type,
  onClose,
}: {
  type: VentilationType;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = iconMap[type.icon] ?? Wind;

  const efficiencyColor: Record<string, string> = {
    Low: 'text-red-400',
    Medium: 'text-amber-400',
    High: 'text-emerald-400',
    'Very High': 'text-cyan-400',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl sm:rounded-3xl ${
          isDark ? 'bg-slate-900 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 border-b backdrop-blur-xl ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90'
          }`}
        >
          <div className="flex items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${type.color} shadow-lg`}
              >
                <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold sm:text-2xl">{type.name}</h3>
                <p
                  className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {type.category} Ventilation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`rounded-lg p-2 transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Description */}
          <div>
            <h4
              className={`mb-2 text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              Overview
            </h4>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {type.description}
            </p>
          </div>

          {/* How it works */}
          <div
            className={`rounded-2xl p-4 ${
              isDark ? 'bg-slate-800/50 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'
            }`}
          >
            <h4
              className={`mb-2 text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-cyan-400' : 'text-cyan-600'
              }`}
            >
              ⚙️ How It Works
            </h4>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {type.howItWorks}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat
              label="Air Changes"
              value={type.achRange}
              icon={Gauge}
              isDark={isDark}
              color="cyan"
            />
            <MiniStat
              label="Efficiency"
              value={type.efficiency}
              icon={Activity}
              isDark={isDark}
              color="emerald"
              valueClass={efficiencyColor[type.efficiency]}
            />
            <MiniStat
              label="Cost"
              value={type.cost}
              icon={IndianRupee}
              isDark={isDark}
              color="amber"
            />
            <MiniStat
              label="Energy Use"
              value={type.energyUse}
              icon={BatteryCharging}
              isDark={isDark}
              color="violet"
            />
          </div>

          {/* Pros & Cons */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className={`rounded-2xl p-4 ${
                isDark
                  ? 'bg-emerald-500/5 ring-1 ring-emerald-500/20'
                  : 'bg-emerald-50 ring-1 ring-emerald-200'
              }`}
            >
              <h4
                className={`mb-3 flex items-center gap-2 text-sm font-bold ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}
              >
                <Check className="h-4 w-4" /> Advantages
              </h4>
              <ul className="space-y-2">
                {type.pros.map((p, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-xs ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        isDark ? 'bg-emerald-400' : 'bg-emerald-600'
                      }`}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                isDark
                  ? 'bg-rose-500/5 ring-1 ring-rose-500/20'
                  : 'bg-rose-50 ring-1 ring-rose-200'
              }`}
            >
              <h4
                className={`mb-3 flex items-center gap-2 text-sm font-bold ${
                  isDark ? 'text-rose-400' : 'text-rose-700'
                }`}
              >
                <XCircle className="h-4 w-4" /> Disadvantages
              </h4>
              <ul className="space-y-2">
                {type.cons.map((c, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-xs ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        isDark ? 'bg-rose-400' : 'bg-rose-600'
                      }`}
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Applications */}
          <div>
            <h4
              className={`mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" /> Common Applications
            </h4>
            <div className="flex flex-wrap gap-2">
              {type.applications.map((a, i) => (
                <span
                  key={i}
                  className={`rounded-full px-3 py-1 text-xs ${
                    isDark
                      ? 'bg-slate-800 text-slate-300 ring-1 ring-slate-700'
                      : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                  }`}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  isDark,
  color,
  valueClass,
}: {
  label: string;
  value: string;
  icon: any;
  isDark: boolean;
  color: 'cyan' | 'emerald' | 'amber' | 'violet';
  valueClass?: string;
}) {
  const colors = {
    cyan: isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600',
    emerald: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
    amber: isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
    violet: isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600',
  };
  return (
    <div
      className={`rounded-xl p-3 ${
        isDark ? 'bg-slate-800/50 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'
      }`}
    >
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        {label}
      </div>
      <div className={`mt-0.5 text-sm font-semibold ${valueClass || (isDark ? 'text-slate-100' : 'text-slate-900')}`}>
        {value}
      </div>
    </div>
  );
}

/* ============================================================================
   COMPONENT: ASHRAEGuide
============================================================================ */

function ASHRAEGuide() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');

  const filteredTable = useMemo(() => {
    if (!search.trim()) return ashrae621Table;
    const q = search.toLowerCase();
    return ashrae621Table
      .map((cat) => ({
        category: cat.category,
        entries: cat.entries.filter(
          (e) =>
            e.occupancy.toLowerCase().includes(q) ||
            cat.category.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.entries.length > 0);
  }, [search]);

  return (
    <div className="space-y-6 print-area">

      {/* Intro */}
      <div
        className={`rounded-2xl p-5 print:hidden ${
          isDark
            ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/5 ring-1 ring-cyan-500/20'
            : 'bg-gradient-to-br from-cyan-50 to-blue-50 ring-1 ring-cyan-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
            }`}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold">TABLE 6.2.2.1 — Minimum Ventilation Rates in Breathing Zone</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Based on ANSI/ASHRAE Addendum p to ANSI/ASHRAE Standard 62.1-2013. This table is not
              valid in isolation; it must be used in conjunction with the accompanying notes.
              Formula: Vbz = Rp × Pz + Ra × Az
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div
        className={`relative rounded-xl print:hidden ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'
        }`}
      >
        <Search
          className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search occupancy category (e.g. office, classroom, gym...)"
          className={`w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none ${
            isDark
              ? 'text-slate-100 placeholder:text-slate-500'
              : 'text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>

      {/* Main ASHRAE 62.1 Table */}
      <div
        className={`overflow-hidden rounded-2xl print:rounded-none print:ring-0 ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <div className={`border-b p-4 print:border-black ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <h3 className="text-center font-bold">
            TABLE 6.2.2.1 — Minimum Ventilation Rates in Breathing Zone
          </h3>
          <p className={`mt-0.5 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            (This table is not valid in isolation; it must be used in conjunction with the accompanying notes.)
          </p>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead>
              <tr className={isDark ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                <th className={`border px-2 py-2 text-left font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} rowSpan={2}>
                  Occupancy Category
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} colSpan={2}>
                  People Outdoor<br />Air Rate R<sub>p</sub>
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} colSpan={2}>
                  Area Outdoor<br />Air Rate R<sub>a</sub>
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} rowSpan={2}>
                  Notes
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} colSpan={3}>
                  Default Values
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} rowSpan={2}>
                  Air<br />Class
                </th>
              </tr>
              <tr className={isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-600'}>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>cfm/<br />person</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>L/s·<br />person</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>cfm/ft²</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>L/s·m²</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                  #/1000 ft²<br />or #/100 m²
                </th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>cfm/<br />person</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>L/s·person</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'text-slate-200' : 'text-slate-800'}>
              {filteredTable.map((cat) => (
                <CategoryRows key={cat.category} category={cat.category} entries={cat.entries} isDark={isDark} />
              ))}
              {filteredTable.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No occupancy category found. Try a different search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* General Notes */}
      <div
        className={`rounded-2xl p-5 print:rounded-none print:ring-0 ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <h4 className={`mb-3 text-sm font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
          GENERAL NOTES FOR TABLE 6.2.2.1
        </h4>
        <ol className={`space-y-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {generalNotes.map((note, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-bold">{i + 1}</span>
              <span>{note}</span>
            </li>
          ))}
        </ol>

        <h4 className={`mb-3 mt-5 text-sm font-bold ${isDark ? 'text-violet-400' : 'text-violet-700'}`}>
          ITEM-SPECIFIC NOTES FOR TABLE 6.2.2.1
        </h4>
        <ul className={`space-y-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {itemSpecificNotes.map((n) => (
            <li key={n.code} className="flex gap-2">
              <span className="w-4 shrink-0 font-bold">{n.code}</span>
              <span>{n.note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ACH Reference (screen only) */}
      <div
        className={`overflow-hidden rounded-2xl print:hidden ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <div className={`border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Gauge className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className="font-bold">Recommended ACH by Space</h3>
          </div>
          <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Air Changes per Hour — how many times the room air is replaced in one hour
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedACH.map((r) => (
            <div
              key={r.space}
              className={`flex items-center justify-between rounded-xl p-3 ${
                isDark ? 'bg-slate-800/40 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'
              }`}
            >
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.space}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700/30">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${Math.min((r.ach / 30) * 100, 100)}%` }}
                  />
                </div>
                <span
                  className={`min-w-[3rem] text-right font-mono text-sm font-bold ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  {r.ach}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Formulas (screen only) */}
      <div
        className={`overflow-hidden rounded-2xl print:hidden ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <div className={`border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Info className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <h3 className="font-bold">Essential HVAC Formulas</h3>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <FormulaCard title="Breathing Zone Airflow" formula="Vbz = Rp × Pz + Ra × Az" description="Rp = people rate, Pz = people count, Ra = area rate, Az = zone area" isDark={isDark} color="cyan" />
          <FormulaCard title="CFM from ACH" formula="CFM = (Volume × ACH) / 60" description="Room volume in ft³, ACH = air changes per hour" isDark={isDark} color="violet" />
          <FormulaCard title="ACH from CFM" formula="ACH = (CFM × 60) / Volume" description="Convert CFM to air changes per hour" isDark={isDark} color="emerald" />
          <FormulaCard title="Duct Velocity" formula="Velocity (FPM) = CFM / Area" description="Area in ft², velocity in ft/min" isDark={isDark} color="amber" />
          <FormulaCard title="Heat Load (Sensible)" formula="Q = 1.08 × CFM × ΔT" description="Q in BTU/hr, ΔT in °F" isDark={isDark} color="rose" />
          <FormulaCard title="Unit Conversion" formula="1 CFM = 0.4719 L/s" description="CFM to L/s conversion factor" isDark={isDark} color="indigo" />
        </div>
      </div>

      {/* Copyright note */}
      <p className={`text-center text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        Reference: ANSI/ASHRAE Addendum p to ANSI/ASHRAE Standard 62.1-2013 — © ASHRAE (www.ashrae.org). For reference use only.
      </p>
    </div>
  );
}

function CategoryRows({
  category,
  entries,
  isDark,
}: {
  category: string;
  entries: ASHRAEEntry[];
  isDark: boolean;
}) {
  const border = isDark ? 'border-slate-800' : 'border-slate-300';
  return (
    <>
      <tr className={isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}>
        <td
          colSpan={10}
          className={`border px-2 py-1.5 font-bold ${border} ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}
        >
          {category}
        </td>
      </tr>
      {entries.map((e) => (
        <tr
          key={e.occupancy}
          className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}
        >
          <td className={`border px-2 py-1.5 ${border}`}>{e.occupancy}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.rpCfm}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.rpLs}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.raCfm}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.raLs}</td>
          <td className={`border px-2 py-1.5 text-center font-semibold ${border} ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {e.notes || '—'}
          </td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.density}</td>
          <td className={`border px-2 py-1.5 text-center font-mono font-semibold ${border} ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {e.combinedCfm}
          </td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.combinedLs}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.airClass}</td>
        </tr>
      ))}
    </>
  );
}

function FormulaCard({
  title,
  formula,
  description,
  isDark,
  color,
}: {
  title: string;
  formula: string;
  description: string;
  isDark: boolean;
  color: string;
}) {
  const bgMap: Record<string, string> = {
    cyan: isDark ? 'bg-cyan-500/5 ring-cyan-500/20' : 'bg-cyan-50 ring-cyan-200',
    violet: isDark ? 'bg-violet-500/5 ring-violet-500/20' : 'bg-violet-50 ring-violet-200',
    emerald: isDark ? 'bg-emerald-500/5 ring-emerald-500/20' : 'bg-emerald-50 ring-emerald-200',
    amber: isDark ? 'bg-amber-500/5 ring-amber-500/20' : 'bg-amber-50 ring-amber-200',
    rose: isDark ? 'bg-rose-500/5 ring-rose-500/20' : 'bg-rose-50 ring-rose-200',
    indigo: isDark ? 'bg-indigo-500/5 ring-indigo-500/20' : 'bg-indigo-50 ring-indigo-200',
  };
  const textMap: Record<string, string> = {
    cyan: isDark ? 'text-cyan-300' : 'text-cyan-700',
    violet: isDark ? 'text-violet-300' : 'text-violet-700',
    emerald: isDark ? 'text-emerald-300' : 'text-emerald-700',
    amber: isDark ? 'text-amber-300' : 'text-amber-700',
    rose: isDark ? 'text-rose-300' : 'text-rose-700',
    indigo: isDark ? 'text-indigo-300' : 'text-indigo-700',
  };

  return (
    <div className={`rounded-xl p-3 ring-1 ${bgMap[color]}`}>
      <div className={`mb-1 text-xs font-semibold ${textMap[color]}`}>{title}</div>
      <div className={`font-mono text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formula}</div>
      <div className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</div>
    </div>
  );
}

/* ============================================================================
   COMPONENT: BasementVentilation
============================================================================ */

interface BasementZone {
  id: number;
  level: string;
  zone: string;
  area: number;
  height: number;
  normalACH: number;
  emergencyACH: number;
  shaftVelocity: number;
}

function BasementVentilation() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [zones, setZones] = useState<BasementZone[]>([
    { id: 1, level: 'Lower Ground', zone: 'Zone-1', area: 465, height: 4.1, normalACH: 6, emergencyACH: 12, shaftVelocity: 1500 },
    { id: 2, level: 'Lower Ground', zone: 'Zone-2', area: 465, height: 4.1, normalACH: 6, emergencyACH: 12, shaftVelocity: 1500 },
    { id: 3, level: 'Basement-1', zone: 'Zone-1', area: 620, height: 3.3, normalACH: 6, emergencyACH: 12, shaftVelocity: 1500 },
    { id: 4, level: 'Basement-1', zone: 'Zone-2', area: 470, height: 3.3, normalACH: 6, emergencyACH: 12, shaftVelocity: 1500 },
    { id: 5, level: 'Basement-2', zone: 'Zone-1', area: 620, height: 3.2, normalACH: 6, emergencyACH: 12, shaftVelocity: 1500 },
    { id: 6, level: 'Basement-2', zone: 'Zone-2', area: 470, height: 3.2, normalACH: 6, emergencyACH: 12, shaftVelocity: 1500 },
    { id: 7, level: 'Basement-3', zone: 'Zone-1', area: 670, height: 3.3, normalACH: 6, emergencyACH: 12, shaftVelocity: 1500 },
    { id: 8, level: 'Basement-3', zone: 'Zone-2', area: 525, height: 3.3, normalACH: 6, emergencyACH: 12, shaftVelocity: 1500 },
  ]);

  const [jetFanAreaCoverage, setJetFanAreaCoverage] = useState(350);
  const [jetFanCfmCapacity, setJetFanCfmCapacity] = useState(20000);
  const [jetFanLowKw, setJetFanLowKw] = useState(0.37);
  const [jetFanHighKw, setJetFanHighKw] = useState(1.5);
  // Input unit for basement Area/Height. Internal storage remains metric (m², m).
  const [dimUnit, setDimUnit] = useState<'m' | 'ft'>('m');

  const addZone = () => {
    const newId = Math.max(...zones.map((z) => z.id)) + 1;
    setZones([
      ...zones,
      { id: newId, level: 'Basement-1', zone: 'Zone-1', area: 500, height: 3.5, normalACH: 6, emergencyACH: 12, shaftVelocity: 1500 },
    ]);
  };

  const deleteZone = (id: number) => {
    setZones(zones.filter((z) => z.id !== id));
  };

  const updateZone = (id: number, field: keyof BasementZone, value: string | number) => {
    setZones(
      zones.map((z) => {
        if (z.id !== id) return z;
        if (field === 'level' || field === 'zone') {
          return { ...z, [field]: value };
        }
        if (value === '' || value === null) {
          return { ...z, [field]: 0 };
        }
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return { ...z, [field]: 0 };

        // Convert display unit → metric storage
        if (field === 'area') {
          const areaM2 = dimUnit === 'ft' ? num * 0.092903 : num;
          return { ...z, area: areaM2 };
        }
        if (field === 'height') {
          const heightM = dimUnit === 'ft' ? num * 0.3048 : num;
          return { ...z, height: heightM };
        }
        return { ...z, [field]: num };
      })
    );
  };

  const displayArea = (areaM2: number) =>
    dimUnit === 'ft' ? areaM2 / 0.092903 : areaM2;
  const displayHeight = (heightM: number) =>
    dimUnit === 'ft' ? heightM / 0.3048 : heightM;

  const calculateZone = (zone: BasementZone) => {
    const volume = zone.area * zone.height;
    // CFM = Volume(m³) × 35.315(ft³/m³) × ACH / 60  -- converts m³ to ft³ first
    const normalCFM = (volume * 35.315 * zone.normalACH) / 60;
    const emergencyCFM = (volume * 35.315 * zone.emergencyACH) / 60;
    const normalM3s = normalCFM * 0.0004719;
    const emergencyM3s = emergencyCFM * 0.0004719;
    const shaftAreaM2 = (normalCFM / zone.shaftVelocity) * 0.0929;
    const shaftAreaM2Emergency = (emergencyCFM / zone.shaftVelocity) * 0.0929;
    // Round up air quantity CFM to nearest 500 (as per Excel)
    const airQtyNormalCFM = Math.ceil(normalCFM / 500) * 500;
    const airQtyEmergencyCFM = Math.ceil(emergencyCFM / 500) * 500;
    // Shaft size based on rounded CFM
    const shaftNormal = (airQtyNormalCFM / zone.shaftVelocity) * 0.0929;
    const shaftEmergency = (airQtyEmergencyCFM / zone.shaftVelocity) * 0.0929;
    return { volume, normalCFM, emergencyCFM, normalM3s, emergencyM3s, shaftAreaM2, shaftAreaM2Emergency, airQtyNormalCFM, airQtyEmergencyCFM, shaftNormal, shaftEmergency };
  };

  const calculateJetFan = (zone: BasementZone) => {
    const airflow = calculateZone(zone);
    const fansByArea = jetFanAreaCoverage > 0 ? Math.ceil(zone.area / jetFanAreaCoverage) : 0;
    const fansByCfm = jetFanCfmCapacity > 0 ? Math.ceil(airflow.emergencyCFM / jetFanCfmCapacity) : 0;
    const jetFans = zone.area > 0 ? Math.max(1, fansByArea, fansByCfm) : 0;

    return {
      normalCFM: airflow.normalCFM,
      emergencyCFM: airflow.emergencyCFM,
      fansByArea,
      fansByCfm,
      jetFans,
      totalKwLow: jetFans * jetFanLowKw,
      totalKwHigh: jetFans * jetFanHighKw,
    };
  };

  const totalNormalCFM = zones.reduce((sum, z) => sum + calculateZone(z).normalCFM, 0);
  const totalEmergencyCFM = zones.reduce((sum, z) => sum + calculateZone(z).emergencyCFM, 0);
  const jetFanRows = zones.map((zone) => ({ zone, calc: calculateJetFan(zone) }));
  const totalJetFans = jetFanRows.reduce((sum, row) => sum + row.calc.jetFans, 0);
  const totalKwLow = jetFanRows.reduce((sum, row) => sum + row.calc.totalKwLow, 0);
  const totalKwHigh = jetFanRows.reduce((sum, row) => sum + row.calc.totalKwHigh, 0);

  // Group zones by level for print table
  const groupedByLevel = zones.reduce<Record<string, BasementZone[]>>((acc, z) => {
    if (!acc[z.level]) acc[z.level] = [];
    acc[z.level].push(z);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Print Header (Excel-style) */}
      <PrintHeader elementDescription="Basement Parking Ventilation Calculation" />

      {/* ====== PRINT-ONLY: Excel-format Ventilation Table ====== */}
      <div data-print-section className="hidden print:block">
        <table className="print-basement-table w-full border-collapse border border-black text-[10px]">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            {/* Excel sheet has exactly 15 printed columns. Keeping header/body column counts equal prevents the right-side blank block. */}
            <tr>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 text-left font-bold">Basement<br/>Reference</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Zone<br/>no.</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Zone<br/>Area</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Height</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Volume</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold" colSpan={3}>Normal Airflow</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Air<br/>Quantity<br/>(CFM)</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Shaft size<br/>(m²)<br/>Velocity= 1500 FPM</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold" colSpan={3}>Emergency Airflow</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Air Quantity<br/>(CFM)</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Shaft size<br/>(m²)<br/>Velocity= 1500 FPM</th>
            </tr>
            <tr>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold"></th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold"></th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">m²</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">m</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">m³</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 font-bold">ACPH</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 font-bold">m³/sec</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 font-bold">CFM</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">Normal<br/>Mode</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">Normal Mode</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 font-bold">ACPH</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 font-bold">m³/sec</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 font-bold">CFM</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">Emergency<br/>Mode</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">Normal Mode</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedByLevel).map(([level, levelZones]) => (
              levelZones.map((zone, idx) => {
                const calc = calculateZone(zone);
                return (
                  <tr key={zone.id}>
                    {idx === 0 && (
                      <td className="border border-black px-1 py-1 font-medium" rowSpan={levelZones.length}>{level}</td>
                    )}
                    <td className="border border-black px-1 py-1 text-center">{zone.zone}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono">{zone.area}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono">{zone.height}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono">{calc.volume.toFixed(0)}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono">{zone.normalACH.toFixed(1)}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono">{calc.normalM3s.toFixed(2)}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono">{calc.normalCFM.toFixed(0)}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono font-bold">{calc.airQtyNormalCFM}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono font-bold">{calc.shaftNormal.toFixed(1)}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono">{zone.emergencyACH.toFixed(1)}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono">{calc.emergencyM3s.toFixed(2)}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono">{calc.emergencyCFM.toFixed(0)}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono font-bold">{calc.airQtyEmergencyCFM}</td>
                    <td className="border border-black px-1 py-1 text-center font-mono font-bold">{calc.shaftEmergency.toFixed(1)}</td>
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>

        {/* Print-only Jet Fan table */}
        <div className="mt-6">
          <div className="mb-1 text-xs font-bold">Jet fan</div>
          <table className="w-auto border-collapse border border-black text-[10px]">
            <thead>
              <tr>
                <th className="border border-black bg-[#d9e2f3] px-2 py-1.5 text-left font-bold">Area Details</th>
                <th className="border border-black bg-[#d9e2f3] px-2 py-1.5 font-bold">Location</th>
                <th className="border border-black bg-[#d9e2f3] px-2 py-1.5 font-bold">Area</th>
                <th className="border border-black bg-[#d9e2f3] px-2 py-1.5 font-bold">No. of Jet fans</th>
                <th className="border border-black bg-[#d9e2f3] px-2 py-1.5 font-bold">Single Fan<br/>Kw (low<br/>speed)</th>
                <th className="border border-black bg-[#d9e2f3] px-2 py-1.5 font-bold">Total Fans<br/>Kw (low<br/>speed)</th>
                <th className="border border-black bg-[#d9e2f3] px-2 py-1.5 font-bold">Single Fan<br/>Kw (High<br/>speed)</th>
                <th className="border border-black bg-[#d9e2f3] px-2 py-1.5 font-bold">Total Fans<br/>Kw (High<br/>speed)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedByLevel).map(([level, levelZones]) => (
                levelZones.map((zone, idx) => {
                  const jCalc = calculateJetFan(zone);
                  return (
                    <tr key={zone.id}>
                      {idx === 0 && (
                        <td className="border border-black px-2 py-1 font-medium" rowSpan={levelZones.length}>{level}</td>
                      )}
                      <td className="border border-black px-2 py-1 text-center">{zone.zone}</td>
                      <td className="border border-black px-2 py-1 text-center font-mono">{zone.area}</td>
                      <td className="border border-black px-2 py-1 text-center font-mono font-bold">{jCalc.jetFans}</td>
                      <td className="border border-black px-2 py-1 text-center font-mono">{jetFanLowKw.toFixed(2)}</td>
                      <td className="border border-black px-2 py-1 text-center font-mono">{jCalc.totalKwLow.toFixed(2)}</td>
                      <td className="border border-black px-2 py-1 text-center font-mono">{jetFanHighKw.toFixed(1)}</td>
                      <td className="border border-black px-2 py-1 text-center font-mono">{jCalc.totalKwHigh.toFixed(2)}</td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====== SCREEN-ONLY content below ====== */}

      {/* Header Card */}
      <div
        className={`rounded-2xl p-5 print:hidden ${
          isDark
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 ring-1 ring-slate-700'
            : 'bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
            <ParkingCircle className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Basement Parking Ventilation Calculator</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Professional HVAC calculation sheet with Normal &amp; Emergency airflow modes
            </p>
          </div>
        </div>
      </div>

      {/* Main Calculation Table */}
      <div
        className={`overflow-x-auto rounded-2xl print:hidden ${isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'}`}
      >
        <div className={`flex items-center justify-between border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Zone-wise Ventilation Calculation</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Unit:</span>
              <select
                value={dimUnit}
                onChange={(e) => setDimUnit(e.target.value as 'm' | 'ft')}
                className={`rounded-lg border-0 px-2 py-1 text-xs outline-none ring-1 focus:ring-2 ${
                  isDark
                    ? 'bg-slate-800 text-slate-100 ring-slate-700 focus:ring-cyan-500'
                    : 'bg-white text-slate-900 ring-slate-200 focus:ring-cyan-500'
                }`}
              >
                <option value="m">m / m²</option>
                <option value="ft">ft / ft²</option>
              </select>
            </div>
            <button
              onClick={addZone}
              className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-600"
            >
              <Plus className="h-3.5 w-3.5" /> Add Zone
            </button>
          </div>
        </div>

        <table className="w-full min-w-[1400px] text-xs">
          <thead>
            <tr className={isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-100 text-slate-600'}>
              <th className="border-r px-2 py-2 font-semibold" rowSpan={2}>Level</th>
              <th className="border-r px-2 py-2 font-semibold" rowSpan={2}>Zone</th>
              <th className="border-r px-2 py-2 font-semibold" rowSpan={2}>Area<br />({dimUnit === 'ft' ? 'ft²' : 'm²'})</th>
              <th className="border-r px-2 py-2 font-semibold" rowSpan={2}>Height<br />({dimUnit === 'ft' ? 'ft' : 'm'})</th>
              <th className="border-r px-2 py-2 font-semibold" rowSpan={2}>Volume<br />(m³)</th>
              <th className="border-r px-2 py-2 font-semibold" colSpan={5}>Normal Airflow</th>
              <th className="border-r px-2 py-2 font-semibold" colSpan={4}>Emergency Airflow</th>
              <th className="px-2 py-2" rowSpan={2}></th>
            </tr>
            <tr className={isDark ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-600'}>
              <th className="border-r px-1 py-1 font-medium">ACH</th>
              <th className="border-r px-1 py-1 font-medium">m³/s</th>
              <th className="border-r px-1 py-1 font-medium">CFM</th>
              <th className="border-r px-1 py-1 font-medium">Shaft (m²)<br />@1500FPM</th>
              <th className="border-r px-1 py-1 font-medium">Shaft (m)</th>
              <th className="border-r px-1 py-1 font-medium">ACH</th>
              <th className="border-r px-1 py-1 font-medium">m³/s</th>
              <th className="border-r px-1 py-1 font-medium">CFM</th>
              <th className="border-r px-1 py-1 font-medium">Shaft (m²)</th>
            </tr>
          </thead>
          <tbody className={`text-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {zones.map((zone) => {
              const calc = calculateZone(zone);
              return (
                <tr key={zone.id} className={`border-t ${isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <td className="border-r px-2 py-2">
                    <input
                      type="text"
                      value={zone.level}
                      onChange={(e) => updateZone(zone.id, 'level', e.target.value)}
                      className={`w-full rounded border-0 bg-transparent px-1 text-center text-xs focus:bg-slate-800 ${isDark ? 'text-slate-200' : ''}`}
                    />
                  </td>
                  <td className="border-r px-2 py-2">
                    <input
                      type="text"
                      value={zone.zone}
                      onChange={(e) => updateZone(zone.id, 'zone', e.target.value)}
                      className={`w-16 rounded border-0 bg-transparent px-1 text-center text-xs focus:bg-slate-800 ${isDark ? 'text-slate-200' : ''}`}
                    />
                  </td>
                  <td className="border-r px-1 py-2">
                    <input
                      type="number"
                      step="any"
                      value={zone.area ? Number(displayArea(zone.area).toFixed(2)) : ''}
                      onChange={(e) => updateZone(zone.id, 'area', e.target.value)}
                      className="w-16 rounded border-0 bg-transparent px-1 text-center font-mono text-xs focus:bg-slate-800"
                    />
                  </td>
                  <td className="border-r px-1 py-2">
                    <input
                      type="number"
                      step="any"
                      value={zone.height ? Number(displayHeight(zone.height).toFixed(2)) : ''}
                      onChange={(e) => updateZone(zone.id, 'height', e.target.value)}
                      className="w-14 rounded border-0 bg-transparent px-1 text-center font-mono text-xs focus:bg-slate-800"
                    />
                  </td>
                  <td className="border-r px-1 py-2 font-mono text-cyan-400">{calc.volume.toFixed(0)}</td>
                  <td className="border-r px-1 py-2">
                    <input
                      type="number"
                      value={zone.normalACH || ''}
                      onChange={(e) => updateZone(zone.id, 'normalACH', e.target.value)}
                      className="w-10 rounded border-0 bg-transparent px-1 text-center font-mono text-xs focus:bg-slate-800"
                    />
                  </td>
                  <td className="border-r px-1 py-2 font-mono">{calc.normalM3s.toFixed(2)}</td>
                  <td className="border-r px-1 py-2 font-mono font-semibold text-emerald-400">{calc.normalCFM.toFixed(0)}</td>
                  <td className="border-r px-1 py-2 font-mono text-amber-400">{calc.shaftAreaM2.toFixed(2)}</td>
                  <td className="border-r px-1 py-2 font-mono text-amber-400">{(calc.shaftAreaM2 * 10.76).toFixed(1)}</td>
                  <td className="border-r px-1 py-2">
                    <input
                      type="number"
                      value={zone.emergencyACH || ''}
                      onChange={(e) => updateZone(zone.id, 'emergencyACH', e.target.value)}
                      className="w-10 rounded border-0 bg-transparent px-1 text-center font-mono text-xs focus:bg-slate-800"
                    />
                  </td>
                  <td className="border-r px-1 py-2 font-mono">{calc.emergencyM3s.toFixed(2)}</td>
                  <td className="border-r px-1 py-2 font-mono font-semibold text-rose-400">{calc.emergencyCFM.toFixed(0)}</td>
                  <td className="border-r px-1 py-2 font-mono text-amber-400">{calc.shaftAreaM2Emergency.toFixed(2)}</td>
                  <td className="px-1 py-2">
                    <button onClick={() => deleteZone(zone.id)} className="text-rose-400 hover:text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {/* Totals Row */}
            <tr className={`border-t font-bold ${isDark ? 'border-slate-700 bg-slate-800/60 text-slate-100' : 'border-slate-300 bg-slate-100 text-slate-900'}`}>
              <td className="border-r px-2 py-2.5 text-left" colSpan={5}>TOTAL</td>
              <td className="border-r px-1 py-2.5"></td>
              <td className="border-r px-1 py-2.5"></td>
              <td className="border-r px-1 py-2.5 font-mono text-emerald-400">{totalNormalCFM.toFixed(0)}</td>
              <td className="border-r px-1 py-2.5"></td>
              <td className="border-r px-1 py-2.5"></td>
              <td className="border-r px-1 py-2.5"></td>
              <td className="border-r px-1 py-2.5"></td>
              <td className="border-r px-1 py-2.5 font-mono text-rose-400">{totalEmergencyCFM.toFixed(0)}</td>
              <td className="border-r px-1 py-2.5"></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Jet Fan Summary Table */}
      <div
        className={`overflow-hidden rounded-2xl print:hidden ${isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'}`}
      >
        <div className={`border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <span className={`font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>Jet Fan Summary</span>
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Jet fan quantity is calculated automatically from both zone area and emergency CFM. The higher requirement is selected.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SettingInput
              label="Area per Jet Fan (m²)"
              value={jetFanAreaCoverage}
              onChange={setJetFanAreaCoverage}
              isDark={isDark}
            />
            <SettingInput
              label="Airflow per Jet Fan (CFM)"
              value={jetFanCfmCapacity}
              onChange={setJetFanCfmCapacity}
              isDark={isDark}
            />
            <SettingInput
              label="Single Fan kW (Low)"
              value={jetFanLowKw}
              onChange={setJetFanLowKw}
              isDark={isDark}
              step="0.01"
            />
            <SettingInput
              label="Single Fan kW (High)"
              value={jetFanHighKw}
              onChange={setJetFanHighKw}
              isDark={isDark}
              step="0.01"
            />
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[1120px] text-xs">
            <thead>
              <tr className={isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-100 text-slate-600'}>
                <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">Level</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Zone</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Area (m²)</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Normal CFM</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Emergency CFM</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Fans by Area</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Fans by CFM</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Selected Fans</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Single Fan kW (Low)</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Total kW (Low)</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Single Fan kW (High)</th>
                <th className="whitespace-nowrap px-3 py-2 font-semibold">Total kW (High)</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'text-slate-200' : 'text-slate-800'}>
              {jetFanRows.map(({ zone, calc }) => {
                return (
                  <tr key={zone.id} className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <td className="whitespace-nowrap px-3 py-2">{zone.level}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center">{zone.zone}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono">{zone.area}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono text-emerald-400">{calc.normalCFM.toFixed(0)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono text-rose-400">{calc.emergencyCFM.toFixed(0)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono">{calc.fansByArea}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono">{calc.fansByCfm}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono font-bold text-cyan-400">{calc.jetFans}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono">{jetFanLowKw}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono text-emerald-400">{calc.totalKwLow.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono">{jetFanHighKw}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-center font-mono text-rose-400">{calc.totalKwHigh.toFixed(2)}</td>
                  </tr>
                );
              })}
              <tr className={`border-t font-bold ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-300 bg-slate-100'}`}>
                <td className="whitespace-nowrap px-3 py-2.5" colSpan={7}>TOTAL JET FANS</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-center font-mono text-lg text-cyan-400">{totalJetFans}</td>
                <td></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-center font-mono text-emerald-400">{totalKwLow.toFixed(2)}</td>
                <td></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-center font-mono text-rose-400">{totalKwHigh.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 print:hidden">
        <div className={`rounded-xl p-4 text-center ring-1 ${isDark ? 'bg-slate-900/60 ring-slate-800' : 'bg-white ring-slate-200'}`}>
          <div className="text-xs text-slate-500">Total Normal CFM</div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">{totalNormalCFM.toFixed(0)}</div>
        </div>
        <div className={`rounded-xl p-4 text-center ring-1 ${isDark ? 'bg-slate-900/60 ring-slate-800' : 'bg-white ring-slate-200'}`}>
          <div className="text-xs text-slate-500">Total Emergency CFM</div>
          <div className="mt-1 text-2xl font-bold text-rose-400">{totalEmergencyCFM.toFixed(0)}</div>
        </div>
        <div className={`rounded-xl p-4 text-center ring-1 ${isDark ? 'bg-slate-900/60 ring-slate-800' : 'bg-white ring-slate-200'}`}>
          <div className="text-xs text-slate-500">Total Jet Fans</div>
          <div className="mt-1 text-2xl font-bold text-cyan-400">{totalJetFans}</div>
        </div>
        <div className={`rounded-xl p-4 text-center ring-1 ${isDark ? 'bg-slate-900/60 ring-slate-800' : 'bg-white ring-slate-200'}`}>
          <div className="text-xs text-slate-500">Total Power (High)</div>
          <div className="mt-1 text-2xl font-bold text-violet-400">{totalKwHigh.toFixed(1)} kW</div>
        </div>
      </div>
    </div>
  );
}

function SettingInput({
  label,
  value,
  onChange,
  isDark,
  step = '1',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  isDark: boolean;
  step?: string;
}) {
  return (
    <label className="block">
      <span className={`mb-1 block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {label}
      </span>
      <input
        type="number"
        min="0"
        step={step}
        value={value || ''}
        onChange={(event) => onChange(parseFloat(event.target.value) || 0)}
        className={`w-full rounded-lg border-0 px-3 py-2 text-xs outline-none ring-1 focus:ring-2 ${
          isDark
            ? 'bg-slate-800 text-slate-100 ring-slate-700 focus:ring-violet-500'
            : 'bg-white text-slate-900 ring-slate-200 focus:ring-violet-500'
        }`}
      />
    </label>
  );
}

/* ============================================================================
   COMPONENT: Calculators
============================================================================ */

type ScheduleItem = {
  id: number;
  name: string;
  category: string;
  length: number;
  width: number;
  height: number;
  volume: number;
  exhaustAch: number;
  freshAch: number;
  exhaustCfm: number;
  freshCfm: number;
  pressure: string;
  roomTypeName?: string;
  level?: string;
  remarks?: string;
};

function Calculators() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [expandedCalc, setExpandedCalc] = useState<string | null>(null);

  const addToSchedule = (item: Omit<ScheduleItem, 'id'>) => {
    setSchedule((prev) => [...prev, { ...item, id: Date.now() }]);
  };

  const removeFromSchedule = (id: number) => {
    setSchedule((prev) => prev.filter((i) => i.id !== id));
  };

  const updateScheduleItem = (id: number, field: keyof ScheduleItem, value: string | number) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'length' || field === 'width' || field === 'height') {
          updated.volume = updated.length * updated.width * updated.height;
          updated.exhaustCfm = (updated.volume * updated.exhaustAch) / 60;
          updated.freshCfm = (updated.volume * updated.freshAch) / 60;
        }
        if (field === 'exhaustAch') {
          updated.exhaustCfm = (updated.volume * (value as number)) / 60;
        }
        if (field === 'freshAch') {
          updated.freshCfm = (updated.volume * (value as number)) / 60;
        }
        return updated;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* CFM Calculator always visible */}
      <div className="print:hidden">
        <CFMCalculator onAdd={addToSchedule} />
      </div>

      {/* Document Information & Schedule below Add to Schedule */}
      <VentilationSchedule
        items={schedule}
        onRemove={removeFromSchedule}
        onUpdate={updateScheduleItem}
      />

      {/* Other calculators - collapsible */}
      <div className="space-y-4 print:hidden">
        <CollapsibleCalculator
          title="ACH Calculator"
          isExpanded={expandedCalc === 'ach'}
          onToggle={() => setExpandedCalc(expandedCalc === 'ach' ? null : 'ach')}
        >
          <ACHCalculator />
        </CollapsibleCalculator>

        <CollapsibleCalculator
          title="Fresh Air Requirements"
          isExpanded={expandedCalc === 'fresh'}
          onToggle={() => setExpandedCalc(expandedCalc === 'fresh' ? null : 'fresh')}
        >
          <FreshAirCalculator />
        </CollapsibleCalculator>

        <CollapsibleCalculator
          title="Duct Sizer"
          isExpanded={expandedCalc === 'duct'}
          onToggle={() => setExpandedCalc(expandedCalc === 'duct' ? null : 'duct')}
        >
          <DuctSizer />
        </CollapsibleCalculator>
      </div>

      {/* Reference Guide at bottom */}
      <div className="print:hidden">
        <VentilationReferenceTable />
      </div>
    </div>
  );
}

// ============= Collapsible Calculator Wrapper =============
function CollapsibleCalculator({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`overflow-hidden rounded-2xl transition-all ${
        isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
      }`}
    >
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between px-5 py-4 text-left ${
          isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
        }`}
      >
        <span className="font-bold">{title}</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''} ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        />
      </button>
      {isExpanded && <div className="border-t px-5 pb-5 pt-4">{children}</div>}
    </div>
  );
}

// ============= Room Type Dropdown (closes after selection) =============
function RoomTypeDropdown({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (name: string) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm outline-none ring-1 transition ${
          isDark
            ? 'bg-slate-800 text-slate-100 ring-slate-700 hover:ring-slate-600'
            : 'bg-white text-slate-900 ring-slate-200 hover:ring-slate-300'
        } ${open ? 'ring-2 ring-cyan-500' : ''}`}
      >
        <span>{selected || 'Pick a room type'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div
            className={`absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg shadow-2xl ring-1 ${
              isDark ? 'bg-slate-800 ring-slate-700' : 'bg-white ring-slate-200'
            }`}
          >
            {roomVentilationData.map((category) => (
              <div key={category.category}>
                <div
                  className={`sticky top-0 px-3 py-1.5 text-xs font-bold ${
                    isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {category.icon} {category.category}
                </div>
                {category.items.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      onSelect(item.name);
                      setOpen(false);
                    }}
                    className={`block w-full px-3 py-1.5 pl-7 text-left text-sm transition ${
                      selected === item.name
                        ? 'bg-cyan-500 text-white'
                        : isDark
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============= Ventilation Schedule (multi-room + print) =============
function VentilationSchedule({
  items,
  onRemove,
  onUpdate,
}: {
  items: ScheduleItem[];
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: keyof ScheduleItem, value: string | number) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Schedule stores dimensions in ft; this only changes display/edit unit
  const [scheduleUnit, setScheduleUnit] = useState<'ft' | 'm'>('ft');

  if (items.length === 0) {
    return (
      <div
        className={`rounded-2xl border-2 border-dashed p-8 text-center print:hidden ${
          isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
        }`}
      >
        <ClipboardList className="mx-auto mb-2 h-8 w-8" />
        <p className="text-sm font-medium">Ventilation Schedule is empty</p>
        <p className="mt-1 text-xs">
          Use the &quot;+ Add to Schedule&quot; button in the CFM Calculator to collect multiple rooms here, then print them all together.
        </p>
      </div>
    );
  }

  const totalExhaust = items.reduce((s, i) => s + i.exhaustCfm, 0);
  const totalFresh = items.reduce((s, i) => s + i.freshCfm, 0);

  // For print: calculate shaft velocity at 1200 FPM
  const shaftVelocity = 1200;

  return (
    <div className="space-y-4">
      <PrintHeader elementDescription="Mechanical Room Ventilation Calculation" />

      {/* ====== PRINT-ONLY: Excel-format table matching 2nd screenshot ====== */}
      <div data-print-section className="hidden print:block">
        <table className="print-calculator-table w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Sr.<br/>No.</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold text-left">Zone  Reference</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Level</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Area</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Height</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Volume</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold" colSpan={3}>Normal Airflow</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Air Quantity<br/>(CFM)</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Shaft size<br/>(m²)<br/>Velocity= {shaftVelocity} FPM</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1.5 font-bold">Remarks</th>
            </tr>
            <tr>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold"></th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold"></th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold"></th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">m²</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">m</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">m³</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 font-bold">ACPH</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 font-bold">m³/sec</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 font-bold">CFM</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">Normal Mode</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold">Normal Mode</th>
              <th className="border border-black bg-[#d9e2f3] px-1 py-1 text-center font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              // Convert ft dimensions to m for print (area in m², height in m, volume in m³)
              const areaM2 = (item.length * item.width) * 0.0929;
              const heightM = item.height * 0.3048;
              const volumeM3 = areaM2 * heightM;
              // Use the higher ACH (exhaust or fresh) for calculation
              const ach = Math.max(item.exhaustAch, item.freshAch);
              const m3sec = (volumeM3 * ach) / 3600;
              const cfm = (item.volume * ach) / 60;
              // Round CFM to nearest integer for air quantity
              const airQtyCfm = Math.round(cfm);
              // Shaft size at given velocity
              const shaftArea = (airQtyCfm / shaftVelocity) * 0.0929;
              const roomName = item.roomTypeName || item.name;

              return (
                <tr key={item.id}>
                  <td className="border border-black px-1 py-1 text-center">{idx + 1}</td>
                  <td className="border border-black px-1 py-1 text-left font-medium">{roomName}</td>
                  <td className="border border-black px-1 py-1 text-center">{item.level || ''}</td>
                  <td className="border border-black px-1 py-1 text-center font-mono">{Math.round(areaM2)}</td>
                  <td className="border border-black px-1 py-1 text-center font-mono">{heightM.toFixed(1)}</td>
                  <td className="border border-black px-1 py-1 text-center font-mono">{Math.round(volumeM3)}</td>
                  <td className="border border-black px-1 py-1 text-center font-mono">{ach.toFixed(1)}</td>
                  <td className="border border-black px-1 py-1 text-center font-mono">{m3sec.toFixed(2)}</td>
                  <td className="border border-black px-1 py-1 text-center font-mono">{Math.round(cfm)}</td>
                  <td className="border border-black px-1 py-1 text-center font-mono font-bold">{airQtyCfm}</td>
                  <td className="border border-black px-1 py-1 text-center font-mono font-bold">{shaftArea.toFixed(1)}</td>
                  <td className="border border-black px-1 py-1 text-center">{item.remarks || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ====== SCREEN-ONLY: Interactive table ====== */}
      <div
        className={`overflow-hidden rounded-2xl print:hidden ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <div className={`flex items-center justify-between border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              Ventilation Schedule ({items.length} {items.length === 1 ? 'room' : 'rooms'})
            </span>
            <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Add multiple rooms from the CFM Calculator, then use Print / Save PDF above
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Unit:</span>
            <select
              value={scheduleUnit}
              onChange={(e) => setScheduleUnit(e.target.value as 'ft' | 'm')}
              className={`rounded-lg border-0 px-2 py-1 text-xs outline-none ring-1 focus:ring-2 ${
                isDark
                  ? 'bg-slate-800 text-slate-100 ring-slate-700 focus:ring-cyan-500'
                  : 'bg-white text-slate-900 ring-slate-200 focus:ring-cyan-500'
              }`}
            >
              <option value="ft">ft</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse text-xs">
            <thead>
              <tr className={isDark ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                <th className={`border px-2 py-2 text-left font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Sr.</th>
                <th className={`border px-2 py-2 text-left font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Room Type</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Level</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>L × W × H ({scheduleUnit})</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Volume (ft³)</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Exhaust ACPH</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Fresh ACPH</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Exhaust CFM</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Fresh Air CFM</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Pressure</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Remarks</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></th>
              </tr>
            </thead>
            <tbody className={isDark ? 'text-slate-200' : 'text-slate-800'}>
              {items.map((item, idx) => {
                const border = isDark ? 'border-slate-800' : 'border-slate-300';
                const inputClass = `w-full bg-transparent px-1 py-0.5 text-xs outline-none ${
                  isDark ? 'text-slate-100 focus:bg-slate-700' : 'text-slate-900 focus:bg-slate-100'
                }`;
                const roomName = item.roomTypeName || item.name;
                // Display dims in selected unit; store always in ft
                const dispL = scheduleUnit === 'm' ? item.length * 0.3048 : item.length;
                const dispW = scheduleUnit === 'm' ? item.width * 0.3048 : item.width;
                const dispH = scheduleUnit === 'm' ? item.height * 0.3048 : item.height;
                const toFt = (v: number) => (scheduleUnit === 'm' ? v / 0.3048 : v);
                return (
                  <tr key={item.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                    <td className={`border px-2 py-2 ${border}`}>{idx + 1}</td>
                    <td className={`border px-2 py-2 ${border}`}>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => onUpdate(item.id, 'roomTypeName', e.target.value)}
                        className={`font-medium ${inputClass} text-left`}
                      />
                      <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.category}</div>
                    </td>
                    <td className={`border px-1 py-2 ${border}`}>
                      <input
                        type="text"
                        value={item.level || ''}
                        onChange={(e) => onUpdate(item.id, 'level', e.target.value)}
                        placeholder="e.g. B1"
                        className={inputClass}
                      />
                    </td>
                    <td className={`border px-1 py-2 ${border}`}>
                      <div className="flex items-center justify-center gap-0.5">
                        <input
                          type="number"
                          step="any"
                          value={Number(dispL.toFixed(2))}
                          onChange={(e) => onUpdate(item.id, 'length', toFt(parseFloat(e.target.value) || 0))}
                          className={`w-12 ${inputClass}`}
                        />
                        <span>×</span>
                        <input
                          type="number"
                          step="any"
                          value={Number(dispW.toFixed(2))}
                          onChange={(e) => onUpdate(item.id, 'width', toFt(parseFloat(e.target.value) || 0))}
                          className={`w-12 ${inputClass}`}
                        />
                        <span>×</span>
                        <input
                          type="number"
                          step="any"
                          value={Number(dispH.toFixed(2))}
                          onChange={(e) => onUpdate(item.id, 'height', toFt(parseFloat(e.target.value) || 0))}
                          className={`w-12 ${inputClass}`}
                        />
                      </div>
                    </td>
                    <td className={`border px-2 py-2 text-center font-mono ${border}`}>{item.volume.toFixed(0)}</td>
                    <td className={`border px-1 py-2 ${border}`}>
                      <input
                        type="number"
                        value={item.exhaustAch > 0 ? item.exhaustAch : ''}
                        onChange={(e) => onUpdate(item.id, 'exhaustAch', parseFloat(e.target.value) || 0)}
                        className={inputClass}
                        placeholder="—"
                      />
                    </td>
                    <td className={`border px-1 py-2 ${border}`}>
                      <input
                        type="number"
                        value={item.freshAch > 0 ? item.freshAch : ''}
                        onChange={(e) => onUpdate(item.id, 'freshAch', parseFloat(e.target.value) || 0)}
                        className={inputClass}
                        placeholder="—"
                      />
                    </td>
                    <td className={`border px-2 py-2 text-center font-mono font-semibold ${border} ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                      {item.exhaustCfm.toFixed(0)}
                    </td>
                    <td className={`border px-2 py-2 text-center font-mono font-semibold ${border} ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {item.freshCfm.toFixed(0)}
                    </td>
                    <td className={`border px-2 py-2 text-center ${border}`}>{item.pressure}</td>
                    <td className={`border px-1 py-2 ${border}`}>
                      <input
                        type="text"
                        value={item.remarks || ''}
                        onChange={(e) => onUpdate(item.id, 'remarks', e.target.value)}
                        placeholder=""
                        className={inputClass}
                      />
                    </td>
                    <td className={`border px-1 py-2 text-center ${border}`}>
                      <button onClick={() => onRemove(item.id)} className="text-rose-400 hover:text-rose-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Totals */}
              <tr className={`font-bold ${isDark ? 'bg-slate-800/60 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
                <td className={`border px-2 py-2.5 ${isDark ? 'border-slate-700' : 'border-slate-300'}`} colSpan={7}>TOTAL</td>
                <td className={`border px-2 py-2.5 text-center font-mono ${isDark ? 'border-slate-700 text-rose-400' : 'border-slate-300 text-rose-600'}`}>
                  {totalExhaust.toFixed(0)}
                </td>
                <td className={`border px-2 py-2.5 text-center font-mono ${isDark ? 'border-slate-700 text-emerald-400' : 'border-slate-300 text-emerald-600'}`}>
                  {totalFresh.toFixed(0)}
                </td>
                <td className={`border px-2 py-2.5 ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></td>
                <td className={`border px-2 py-2.5 ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></td>
                <td className={`border px-2 py-2.5 ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============= CFM Calculator =============
function CFMCalculator({ onAdd }: { onAdd: (item: Omit<ScheduleItem, 'id'>) => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [length, setLength] = useState('20');
  const [width, setWidth] = useState('15');
  const [height, setHeight] = useState('9');
  const [dimUnit, setDimUnit] = useState<'ft' | 'm'>('ft');
  const [inputMode, setInputMode] = useState<'dims' | 'area'>('dims');
  const [floorArea, setFloorArea] = useState('300');
  const [ach, setAch] = useState('4');
  const [exhaustAch, setExhaustAch] = useState('0');
  const [freshAch, setFreshAch] = useState('4');
  const [selectedPreset, setSelectedPreset] = useState('Bedroom');

  // Transformer Room specific: choose ACH method (heat load unknown) or Heat Removal method
  const [transformerMethod, setTransformerMethod] = useState<'ach' | 'heat'>('ach');
  const [tKva, setTKva] = useState('1250');
  const [tType, setTType] = useState<'dry' | 'oil'>('oil');
  const [tLossPct, setTLossPct] = useState('3.5');
  const [tManualLossKw, setTManualLossKw] = useState('');
  const [tOutdoorTemp, setTOutdoorTemp] = useState('32');
  const [tMaxRoomTemp, setTMaxRoomTemp] = useState('40');
  const [tSafetyFactor, setTSafetyFactor] = useState('15');
  const [tLouverVelocity, setTLouverVelocity] = useState('500');
  const [tFreeAreaRatio, setTFreeAreaRatio] = useState('50');
  const [tNumFans, setTNumFans] = useState('2');
  const [tNumLouvers, setTNumLouvers] = useState('2');
  const [tPressureMode, setTPressureMode] = useState<'negative' | 'equal'>('negative');

  const allPresets = roomVentilationData.flatMap((cat) =>
    cat.items.map((item) => ({
      name: item.name,
      category: cat.category,
      achRange: item.achRange,
      achMid: item.achMid,
      freshAir: item.freshAir,
      exhaust: item.exhaust,
      pressure: item.pressure,
    }))
  );

  const activePreset = allPresets.find((p) => p.name === selectedPreset);

  const applyPreset = (preset: (typeof allPresets)[number]) => {
    setSelectedPreset(preset.name);
    setAch(preset.achMid.toString());

    if (preset.freshAir && !preset.exhaust) {
      setFreshAch(preset.achMid.toString());
      setExhaustAch('0');
    } else if (!preset.freshAir && preset.exhaust) {
      setFreshAch('0');
      setExhaustAch(preset.achMid.toString());
    } else if (preset.freshAir && preset.exhaust) {
      setExhaustAch(preset.achMid.toString());
      setFreshAch((preset.achMid * 0.9).toString());
    } else {
      setFreshAch('0');
      setExhaustAch('0');
    }
  };

  const L = parseFloat(length) || 0;
  const W = parseFloat(width) || 0;
  const H = parseFloat(height) || 0;
  const exA = parseFloat(exhaustAch) || 0;
  const frA = parseFloat(freshAch) || 0;

  // Convert to feet for CFM formula (CFM uses ft³)
  const Lf = dimUnit === 'm' ? L / 0.3048 : L;
  const Wf = dimUnit === 'm' ? W / 0.3048 : W;
  const Hf = dimUnit === 'm' ? H / 0.3048 : H;
  const areaRaw = parseFloat(floorArea) || 0;
  // dimUnit doubles as the area unit here: 'm' => m², 'ft' => sq ft
  const floorAreaFt2 = dimUnit === 'm' ? areaRaw / 0.092903 : areaRaw;
  const effFloorAreaFt2 = inputMode === 'area' ? floorAreaFt2 : Lf * Wf;
  // Equivalent square Length/Width derived from Area, used only when saving to schedule
  const derivedSide = Math.sqrt(effFloorAreaFt2);
  const volume = effFloorAreaFt2 * Hf; // ft³
  const exhaustCfm = (volume * exA) / 60;
  const freshCfm = (volume * frA) / 60;

  // ----- Transformer Room: Heat Removal Method calculations -----
  const isTransformer = selectedPreset === 'Transformer Room';
  const applyTType = (t: 'dry' | 'oil') => {
    setTType(t);
    setTLossPct(t === 'dry' ? '2.5' : '3.5');
  };
  const tKvaN = parseFloat(tKva) || 0;
  const tLossN = parseFloat(tLossPct) || 0;
  const tManualKwN = parseFloat(tManualLossKw) || 0;
  const tQ = tManualKwN > 0 ? tManualKwN : (tKvaN * tLossN) / 100; // kW
  const tOutdoorN = parseFloat(tOutdoorTemp) || 0;
  const tMaxRoomN = parseFloat(tMaxRoomTemp) || 0;
  const tDeltaT = tMaxRoomN - tOutdoorN; // °C
  const tValidDeltaT = tDeltaT > 0;
  const tBaseCfm = tValidDeltaT ? (1755 * tQ) / tDeltaT : 0;
  const tSafetyN = parseFloat(tSafetyFactor) || 0;
  const tDesignCfm = tBaseCfm * (1 + tSafetyN / 100);
  const tVelocityN = parseFloat(tLouverVelocity) || 1;
  const tNetFreeArea = tDesignCfm / tVelocityN; // ft²
  const tRatioN = parseFloat(tFreeAreaRatio) || 1;
  const tGrossLouverArea = tNetFreeArea / (tRatioN / 100); // ft²
  const tFansN = parseFloat(tNumFans) || 1;
  const tAirflowPerFan = tDesignCfm / tFansN;
  const tLouversN = parseFloat(tNumLouvers) || 1;
  const tGrossAreaPerLouver = tGrossLouverArea / tLouversN;

  // Fresh air inlet kept at 90% of exhaust design airflow — same negative-pressure
  // convention used in the ACH method, so the room stays slightly negative relative
  // to adjoining areas (standard practice for transformer/electrical/DG rooms).
  // Fresh air inlet: "Negative" mode (recommended for transformer rooms) keeps fresh
  // air at 90% of exhaust so the room stays slightly negative relative to adjoining
  // areas — heat/dust/fumes don't migrate out. "Equal" mode matches fresh air 1:1 to
  // exhaust for a neutral-pressure room (only use if there's no containment concern).
  const tFreshInletCfm = tPressureMode === 'negative' ? tDesignCfm * 0.9 : tDesignCfm;
  const tFreshNetFreeArea = tFreshInletCfm / tVelocityN; // ft²
  const tFreshGrossLouverArea = tFreshNetFreeArea / (tRatioN / 100); // ft²

  const useHeatMethod = isTransformer && transformerMethod === 'heat';

  // Final values used for display + "Add to Schedule" (heat method overrides ACH-based CFM)
  const finalExhaustCfm = useHeatMethod ? tDesignCfm : exhaustCfm;
  const finalFreshCfm = useHeatMethod ? tFreshInletCfm : freshCfm;
  const finalExA = useHeatMethod ? (volume > 0 ? (tDesignCfm * 60) / volume : 0) : exA;
  const finalFrA = useHeatMethod ? (volume > 0 ? (tFreshInletCfm * 60) / volume : 0) : frA;

  return (
    <CalcCard
      title="CFM Calculator"
      subtitle="Exhaust & fresh air CFM based on room type"
      icon={Wind}
      color="cyan"
    >
      <div className="mb-3 flex items-center justify-end gap-2">
        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Unit:</span>
        <select
          value={dimUnit}
          onChange={(e) => {
            const newUnit = e.target.value as 'ft' | 'm';
            if (newUnit !== dimUnit) {
              const lenFactor = newUnit === 'm' ? 0.3048 : 1 / 0.3048;
              const areaFactor = newUnit === 'm' ? 0.092903 : 1 / 0.092903;
              const convertLen = (v: string) => {
                const n = parseFloat(v);
                return isNaN(n) ? v : (n * lenFactor).toFixed(2);
              };
              const convertArea = (v: string) => {
                const n = parseFloat(v);
                return isNaN(n) ? v : (n * areaFactor).toFixed(2);
              };
              setLength((prev) => convertLen(prev));
              setWidth((prev) => convertLen(prev));
              setHeight((prev) => convertLen(prev));
              setFloorArea((prev) => convertArea(prev));
            }
            setDimUnit(newUnit);
          }}
          className={`rounded-lg border-0 px-2 py-1 text-xs outline-none ring-1 focus:ring-2 ${
            isDark
              ? 'bg-slate-800 text-slate-100 ring-slate-700 focus:ring-cyan-500'
              : 'bg-white text-slate-900 ring-slate-200 focus:ring-cyan-500'
          }`}
        >
          <option value="ft">ft</option>
          <option value="m">m</option>
        </select>
      </div>
      <AreaDimsModeToggle mode={inputMode} onChange={setInputMode} color="cyan" />
      {inputMode === 'dims' ? (
        <div className="grid grid-cols-3 gap-2">
          <NumInput label={`Length (${dimUnit})`} value={length} onChange={setLength} />
          <NumInput label={`Width (${dimUnit})`} value={width} onChange={setWidth} />
          <NumInput label={`Height (${dimUnit})`} value={height} onChange={setHeight} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <NumInput label={`Floor Area (${dimUnit === 'm' ? 'm²' : 'sq ft'})`} value={floorArea} onChange={setFloorArea} />
          <NumInput label={`Height (${dimUnit})`} value={height} onChange={setHeight} />
        </div>
      )}
      {!useHeatMethod && (
      <div className="mt-4">
        <label className={`mb-2 block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Air Changes per Hour (ACH)
        </label>
        <input
          type="range"
          min="0.5"
          max="100"
          step="0.5"
          value={ach}
          onChange={(e) => {
            setAch(e.target.value);
            if (activePreset) {
              if (activePreset.freshAir && !activePreset.exhaust) {
                setFreshAch((parseFloat(e.target.value)).toString());
                setExhaustAch('0');
              } else if (!activePreset.freshAir && activePreset.exhaust) {
                setFreshAch('0');
                setExhaustAch((parseFloat(e.target.value)).toString());
              } else if (activePreset.freshAir && activePreset.exhaust) {
                setExhaustAch((parseFloat(e.target.value)).toString());
                setFreshAch((parseFloat(e.target.value) * 0.9).toString());
              }
            }
          }}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-cyan-500"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>0.5</span>
          <span className={`rounded px-3 py-1 font-bold ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-50 text-cyan-700'}`}>
            {ach} ACH
          </span>
          <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>100</span>
        </div>
      </div>
      )}

      {/* Room Type Dropdown */}
      <div className="mt-4">
        <label className={`mb-2 block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Pick a room type
        </label>
        <RoomTypeDropdown
          selected={selectedPreset}
          onSelect={(name) => {
            const preset = allPresets.find((p) => p.name === name);
            if (preset) applyPreset(preset);
          }}
        />
      </div>

      {activePreset && (
        <div className={`mt-3 rounded-lg p-2.5 text-xs ${isDark ? 'bg-cyan-500/5 text-cyan-300 ring-1 ring-cyan-500/20' : 'bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200'}`}>
          <span className="font-semibold">{activePreset.name} ({activePreset.category}):</span> ACPH {activePreset.achRange}, Pressure: {activePreset.pressure}
        </div>
      )}

      {/* Transformer Room: method switch + heat removal inputs */}
      {isTransformer && (
        <div className="mt-3">
          <div className={`flex rounded-lg p-1 text-xs font-medium ring-1 ${isDark ? 'bg-slate-800 ring-slate-700' : 'bg-slate-100 ring-slate-200'}`}>
            <button
              type="button"
              onClick={() => setTransformerMethod('ach')}
              className={`flex-1 rounded-md px-2 py-2 transition ${transformerMethod === 'ach' ? 'bg-cyan-500 text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              ACH Method (Heat Load Unknown)
            </button>
            <button
              type="button"
              onClick={() => setTransformerMethod('heat')}
              className={`flex-1 rounded-md px-2 py-2 transition ${transformerMethod === 'heat' ? 'bg-cyan-500 text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              Heat Removal Method
            </button>
          </div>

          {useHeatMethod && (
            <div className="mt-3 space-y-3">
              <div className={`flex rounded-lg p-1 text-xs font-medium ring-1 ${isDark ? 'bg-slate-800 ring-slate-700' : 'bg-slate-100 ring-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => applyTType('dry')}
                  className={`flex-1 rounded-md px-2 py-2 transition ${tType === 'dry' ? 'bg-amber-500 text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Dry Type (2.5%)
                </button>
                <button
                  type="button"
                  onClick={() => applyTType('oil')}
                  className={`flex-1 rounded-md px-2 py-2 transition ${tType === 'oil' ? 'bg-amber-500 text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Oil-Cooled (3–3.5%)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <NumInput label="Transformer Rating (kVA)" value={tKva} onChange={setTKva} />
                <NumInput label="Estimated Loss (%)" value={tLossPct} onChange={setTLossPct} />
              </div>
              <NumInput label="Manufacturer Total Loss (kW) — optional, overrides above" value={tManualLossKw} onChange={setTManualLossKw} />
              <div className="grid grid-cols-2 gap-2">
                <NumInput label="Outdoor / Inlet Temp (°C)" value={tOutdoorTemp} onChange={setTOutdoorTemp} />
                <NumInput label="Max Allowable Room Temp (°C)" value={tMaxRoomTemp} onChange={setTMaxRoomTemp} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <NumInput label="Safety Factor (%)" value={tSafetyFactor} onChange={setTSafetyFactor} />
                <NumInput label="Louver Face Velocity (FPM)" value={tLouverVelocity} onChange={setTLouverVelocity} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <NumInput label="Louver Free Area Ratio (%)" value={tFreeAreaRatio} onChange={setTFreeAreaRatio} />
                <NumInput label="Number of Exhaust Fans" value={tNumFans} onChange={setTNumFans} />
              </div>
              <NumInput label="Number of Louvers" value={tNumLouvers} onChange={setTNumLouvers} />

              {!tValidDeltaT && (
                <div className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${isDark ? 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'}`}>
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>Max Room Temp must be greater than Outdoor Temp (ΔT &gt; 0) for a valid airflow calculation.</span>
                </div>
              )}

              <ResultRow label="Selected Heat Loss (Q)" value={`${tQ.toFixed(2)} kW`} />
              <ResultRow label="Temperature Difference (ΔT)" value={`${tDeltaT.toFixed(1)} °C`} />
              <ResultRow label="Base Exhaust Airflow" value={`${tBaseCfm.toLocaleString(undefined, { maximumFractionDigits: 0 })} CFM`} />
              <ResultRow label="Design Exhaust Airflow (with Safety Factor)" value={`${tDesignCfm.toLocaleString(undefined, { maximumFractionDigits: 0 })} CFM`} highlight />
              <ResultRow label="Required Exhaust Louver Net Free Area" value={`${tNetFreeArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} ft²`} />
              <ResultRow label="Required Exhaust Louver Gross Area" value={`${tGrossLouverArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} ft²`} />
              <ResultRow label="Airflow per Exhaust Fan" value={`${tAirflowPerFan.toLocaleString(undefined, { maximumFractionDigits: 0 })} CFM/fan`} />
              <ResultRow label="Exhaust Gross Louver Area per Louver" value={`${tGrossAreaPerLouver.toLocaleString(undefined, { maximumFractionDigits: 2 })} ft²/louver`} />

              {/* Fresh Air (inlet) side */}
              <div className={`mt-2 rounded-lg px-3 py-2 text-xs font-semibold ${isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                Fresh Air Inlet (Low-Level Louvers)
              </div>

              {/* Pressure mode guidance */}
              <div className={`mt-2 rounded-lg p-2.5 text-xs ${isDark ? 'bg-slate-800/60 text-slate-300 ring-1 ring-slate-700' : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'}`}>
                <div className="font-semibold mb-1">When to use Negative vs Equal?</div>
                <div><span className="font-semibold text-rose-400">🔴 Negative</span> — Use when there's heat/dust/oil fumes/smell inside the room that shouldn't escape to outside areas (corridor, office). Recommended default for cases like Transformer, DG, Electrical, Boiler, Pump Room.</div>
                <div className="mt-1"><span className="font-semibold text-emerald-400">🟢 Equal</span> — Use when there's no containment concern and only neutral air exchange is needed. Less recommended for most transformer rooms.</div>
              </div>

              <div className={`mt-2 flex rounded-lg p-1 text-xs font-medium ring-1 ${isDark ? 'bg-slate-800 ring-slate-700' : 'bg-slate-100 ring-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setTPressureMode('negative')}
                  className={`flex-1 rounded-md px-2 py-2 transition ${tPressureMode === 'negative' ? 'bg-rose-500 text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Negative (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setTPressureMode('equal')}
                  className={`flex-1 rounded-md px-2 py-2 transition ${tPressureMode === 'equal' ? 'bg-emerald-500 text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`}
                >
                  Equal
                </button>
              </div>

              <ResultRow
                label={tPressureMode === 'negative' ? 'Fresh Air Inlet Capacity (90% of exhaust)' : 'Fresh Air Inlet Capacity (100% of exhaust)'}
                value={`${tFreshInletCfm.toLocaleString(undefined, { maximumFractionDigits: 0 })} CFM`}
                highlight
              />
              <ResultRow label="Required Inlet Louver Net Free Area" value={`${tFreshNetFreeArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} ft²`} />
              <ResultRow label="Required Inlet Louver Gross Area" value={`${tFreshGrossLouverArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} ft²`} />
              <ResultRow label="Fresh Air Fan" value="Normally Not Required" />
              <ResultRow label="Pressure Balance" value={tPressureMode === 'negative' ? 'Negative (exhaust > fresh air)' : 'Neutral (exhaust = fresh air)'} />

              <InfoBox>
                <div className="space-y-1">
                  <div className="font-semibold">Heat Loss ≈ 2.5%–3.5% of kVA rating (Industry standard)</div>
                  <div>🔹 Dry Type → 2.5% &nbsp; 🔹 Oil-Cooled → 3–3.5%</div>
                  <div className="mt-1">Q = kVA × Loss% ÷ 100 · ΔT = Max Room Temp − Outdoor Temp</div>
                  <div>Base CFM = (1755 × Q) ÷ ΔT · Design CFM = Base CFM × (1 + Safety Factor%)</div>
                  <div className="mt-1">Exhaust fans create the negative pressure and draw fresh air in naturally through inlet louvers, so a dedicated supply/fresh-air fan is normally not required — only a properly sized inlet louver.</div>
                  <div>Keep inlet louvers at low level and exhaust at high level, on opposite sides where possible, to avoid short-circuiting.</div>
                </div>
              </InfoBox>
            </div>
          )}
        </div>
      )}

      {/* Manual ACPH override */}
      {!useHeatMethod && (
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumInput label="Exhaust ACPH" value={exhaustAch} onChange={setExhaustAch} />
        <NumInput label="Fresh Air ACPH" value={freshAch} onChange={setFreshAch} />
      </div>
      )}

      <ResultRow label="Floor Area Used" value={`${effFloorAreaFt2.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft`} />
      <ResultRow label="Room Volume" value={`${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} ft³`} />
      {!useHeatMethod && exA > 0 && (
        <>
          <ResultRow label="Exhaust Air CFM" value={`${exhaustCfm.toFixed(1)} CFM`} highlight />
          <ResultRow label="Exhaust Air (L/s)" value={`${(exhaustCfm * 0.4719).toFixed(1)} L/s`} />
        </>
      )}
      {!useHeatMethod && frA > 0 && (
        <>
          <ResultRow label="Fresh Air CFM" value={`${freshCfm.toFixed(1)} CFM`} highlight />
          <ResultRow label="Fresh Air (L/s)" value={`${(freshCfm * 0.4719).toFixed(1)} L/s`} />
        </>
      )}
      {!useHeatMethod && exA > 0 && frA > 0 && (
        <ResultRow
          label="Pressure Balance"
          value={exA > frA ? 'Negative (exhaust > fresh)' : exA < frA ? 'Positive (fresh > exhaust)' : 'Neutral (balanced)'}
        />
      )}

      {/* Add to Schedule button */}
      <button
        onClick={() => {
          onAdd({
            name: selectedPreset,
            category: activePreset?.category || '—',
            length: inputMode === 'area' ? derivedSide : Lf,
            width: inputMode === 'area' ? derivedSide : Wf,
            height: Hf,
            volume,
            exhaustAch: finalExA,
            freshAch: finalFrA,
            exhaustCfm: finalExhaustCfm,
            freshCfm: finalFreshCfm,
            pressure: activePreset?.pressure || (finalExA > finalFrA ? 'Negative' : finalExA < finalFrA ? 'Positive' : 'Neutral'),
            roomTypeName: selectedPreset,
            level: '',
            remarks: '',
          });
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-600 hover:to-blue-700"
      >
        <Plus className="h-4 w-4" /> Add to Schedule
      </button>
      <p className={`mt-1.5 text-center text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Add 4-5 rooms to the schedule below, then print them all together
      </p>

      <InfoBox>
        <div className="space-y-1">
          <div>Formula: CFM = (Length × Width × Height × ACPH) ÷ 60</div>
          <div>• STP & DG Rooms: designed at 30 ACPH</div>
          <div>• General Chemical Labs: 6-12 ACPH</div>
          <div>• BSL-2 / BSL-3 Labs: minimum 12 ACPH</div>
          <div>• Cleanroom ISO Class 6/7: 60-90 ACPH</div>
        </div>
      </InfoBox>
    </CalcCard>
  );
}

// ============= ACH Calculator =============
function ACHCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [cfm, setCfm] = useState('200');
  const [length, setLength] = useState('20');
  const [width, setWidth] = useState('15');
  const [height, setHeight] = useState('9');
  const [dimUnit, setDimUnit] = useState<'ft' | 'm'>('ft');
  const [inputMode, setInputMode] = useState<'dims' | 'area'>('dims');
  const [floorArea, setFloorArea] = useState('300');

  const C = parseFloat(cfm) || 0;
  const L = parseFloat(length) || 0;
  const W = parseFloat(width) || 0;
  const H = parseFloat(height) || 0;

  // Convert to feet for ACH formula (volume in ft³)
  const Lf = dimUnit === 'm' ? L / 0.3048 : L;
  const Wf = dimUnit === 'm' ? W / 0.3048 : W;
  const Hf = dimUnit === 'm' ? H / 0.3048 : H;
  const areaRaw = parseFloat(floorArea) || 0;
  const floorAreaFt2 = dimUnit === 'm' ? areaRaw / 0.092903 : areaRaw;
  const effFloorAreaFt2 = inputMode === 'area' ? floorAreaFt2 : Lf * Wf;
  const volume = effFloorAreaFt2 * Hf; // ft³
  const ach = volume > 0 ? (C * 60) / volume : 0;

  return (
    <CalcCard title="ACH Calculator" subtitle="Calculate Air Changes per Hour from CFM" icon={Calculator} color="violet">
      <NumInput label="Airflow (CFM)" value={cfm} onChange={setCfm} />
      <div className="mt-3 flex items-center justify-end gap-2">
        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Unit:</span>
        <select
          value={dimUnit}
          onChange={(e) => {
            const newUnit = e.target.value as 'ft' | 'm';
            if (newUnit !== dimUnit) {
              const lenFactor = newUnit === 'm' ? 0.3048 : 1 / 0.3048;
              const areaFactor = newUnit === 'm' ? 0.092903 : 1 / 0.092903;
              const convertLen = (v: string) => {
                const n = parseFloat(v);
                return isNaN(n) ? v : (n * lenFactor).toFixed(2);
              };
              const convertArea = (v: string) => {
                const n = parseFloat(v);
                return isNaN(n) ? v : (n * areaFactor).toFixed(2);
              };
              setLength((prev) => convertLen(prev));
              setWidth((prev) => convertLen(prev));
              setHeight((prev) => convertLen(prev));
              setFloorArea((prev) => convertArea(prev));
            }
            setDimUnit(newUnit);
          }}
          className={`rounded-lg border-0 px-2 py-1 text-xs outline-none ring-1 focus:ring-2 ${
            isDark
              ? 'bg-slate-800 text-slate-100 ring-slate-700 focus:ring-violet-500'
              : 'bg-white text-slate-900 ring-slate-200 focus:ring-violet-500'
          }`}
        >
          <option value="ft">ft</option>
          <option value="m">m</option>
        </select>
      </div>
      <AreaDimsModeToggle mode={inputMode} onChange={setInputMode} color="violet" />
      {inputMode === 'dims' ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <NumInput label={`Length (${dimUnit})`} value={length} onChange={setLength} />
          <NumInput label={`Width (${dimUnit})`} value={width} onChange={setWidth} />
          <NumInput label={`Height (${dimUnit})`} value={height} onChange={setHeight} />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <NumInput label={`Floor Area (${dimUnit === 'm' ? 'm²' : 'sq ft'})`} value={floorArea} onChange={setFloorArea} />
          <NumInput label={`Height (${dimUnit})`} value={height} onChange={setHeight} />
        </div>
      )}
      <ResultRow label="Floor Area Used" value={`${effFloorAreaFt2.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft`} />
      <ResultRow label="Room Volume" value={`${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} ft³`} />
      <ResultRow label="Air Changes per Hour" value={`${ach.toFixed(2)} ACH`} highlight />
      <InfoBox>Formula: ACH = (CFM × 60) ÷ Volume</InfoBox>
    </CalcCard>
  );
}

// ============= Fresh Air Calculator (ASHRAE 62.1) =============
function FreshAirCalculator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [spaceType, setSpaceType] = useState('Office');
  const [area, setArea] = useState('500');
  const [occupants, setOccupants] = useState('10');
  const [areaUnit, setAreaUnit] = useState<'ft' | 'm'>('ft');

  const rates: Record<string, { perPerson: number; perArea: number }> = {
    Office: { perPerson: 5, perArea: 0.06 },
    Classroom: { perPerson: 10, perArea: 0.08 },
    'Conference Room': { perPerson: 5, perArea: 0.06 },
    Bedroom: { perPerson: 5, perArea: 0.06 },
    'Living Room': { perPerson: 5, perArea: 0.06 },
    Kitchen: { perPerson: 0, perArea: 0.12 },
    Bathroom: { perPerson: 0, perArea: 0.12 },
    Restaurant: { perPerson: 7.5, perArea: 0.18 },
    Retail: { perPerson: 7.5, perArea: 0.12 },
    'Hospital Room': { perPerson: 25, perArea: 0.06 },
    Gym: { perPerson: 20, perArea: 0.06 },
    Auditorium: { perPerson: 5, perArea: 0.06 },
    Warehouse: { perPerson: 0, perArea: 0.06 },
    Basement: { perPerson: 0, perArea: 0.15 },
    'STP Room': { perPerson: 0, perArea: 0.25 },
    'Pump Room': { perPerson: 0, perArea: 0.2 },
    'Electrical Room': { perPerson: 0, perArea: 0.12 },
    'DG Room': { perPerson: 0, perArea: 0.3 },
    'Lift Well': { perPerson: 0, perArea: 0.15 },
    'Server Room': { perPerson: 0, perArea: 0.2 },
    Workshop: { perPerson: 10, perArea: 0.18 },
    Laundry: { perPerson: 5, perArea: 0.12 },
  };

  const rate = rates[spaceType];
  const Araw = parseFloat(area) || 0;
  // Convert area to ft² for ASHRAE rates (which are per ft²)
  const A = areaUnit === 'm' ? Araw / 0.092903 : Araw;
  const P = parseFloat(occupants) || 0;
  const cfm = rate.perPerson * P + rate.perArea * A;
  const lps = cfm * 0.4719;

  return (
    <CalcCard title="Fresh Air Requirements" subtitle="ASHRAE 62.1 based outdoor airflow" icon={Building2} color="emerald">
      <div>
        <label className={`mb-1 block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Space Type</label>
        <select
          value={spaceType}
          onChange={(e) => setSpaceType(e.target.value)}
          className={`w-full rounded-lg border-0 px-3 py-2 text-sm outline-none ring-1 focus:ring-2 ${isDark ? 'bg-slate-800 text-slate-100 ring-slate-700 focus:ring-emerald-500' : 'bg-white text-slate-900 ring-slate-200 focus:ring-emerald-500'}`}
        >
          {Object.keys(rates).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Area Unit:</span>
        <select
          value={areaUnit}
          onChange={(e) => setAreaUnit(e.target.value as 'ft' | 'm')}
          className={`rounded-lg border-0 px-2 py-1 text-xs outline-none ring-1 focus:ring-2 ${
            isDark
              ? 'bg-slate-800 text-slate-100 ring-slate-700 focus:ring-emerald-500'
              : 'bg-white text-slate-900 ring-slate-200 focus:ring-emerald-500'
          }`}
        >
          <option value="ft">ft²</option>
          <option value="m">m²</option>
        </select>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumInput label={`Floor Area (${areaUnit === 'm' ? 'm²' : 'sq ft'})`} value={area} onChange={setArea} />
        <NumInput label="Occupants" value={occupants} onChange={setOccupants} />
      </div>
      <div className={`mt-3 rounded-lg p-2.5 text-xs ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
        Rates: {rate.perPerson} CFM/person + {rate.perArea} CFM/ft²
      </div>
      <ResultRow label="Occupant Component" value={`${(rate.perPerson * P).toFixed(1)} CFM`} />
      <ResultRow label="Area Component" value={`${(rate.perArea * A).toFixed(1)} CFM`} />
      <ResultRow label="Total Outdoor Air Required" value={`${cfm.toFixed(1)} CFM`} highlight />
      <ResultRow label="In L/s" value={`${lps.toFixed(1)} L/s`} />
      <InfoBox>ASHRAE Standard 62.1: Vbz = Rp × Pz + Ra × Az</InfoBox>
    </CalcCard>
  );
}

// ============= Duct Sizer =============
function DuctSizer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [cfm, setCfm] = useState('500');
  const [velocity, setVelocity] = useState('1000');

  const C = parseFloat(cfm) || 0;
  const V = parseFloat(velocity) || 1;

  const areaFt2 = C / V;
  const areaIn2 = areaFt2 * 144;
  const diameterIn = Math.sqrt((4 * areaIn2) / Math.PI);
  const squareSide = Math.sqrt(areaIn2);
  const rectWidth = Math.sqrt(areaIn2 * 2);
  const rectHeight = rectWidth / 2;

  return (
    <CalcCard title="Duct Sizer" subtitle="Determine duct size from CFM and velocity" icon={Ruler} color="amber">
      <NumInput label="Airflow (CFM)" value={cfm} onChange={setCfm} />
      <div className="mt-3">
        <label className={`mb-1 block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Air Velocity: <span className="font-bold">{velocity} FPM</span>
        </label>
        <input
          type="range"
          min="300"
          max="3000"
          step="50"
          value={velocity}
          onChange={(e) => setVelocity(e.target.value)}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-amber-500"
        />
        <div className="mt-1 flex justify-between text-[10px]">
          <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>Quiet (300)</span>
          <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>Standard (1000)</span>
          <span className={isDark ? 'text-rose-400' : 'text-rose-600'}>High (3000)</span>
        </div>
      </div>
      <ResultRow label="Required Duct Area" value={`${areaIn2.toFixed(1)} in² (${areaFt2.toFixed(3)} ft²)`} />
      <ResultRow label="Round Duct Diameter" value={`${diameterIn.toFixed(1)} inches`} highlight />
      <ResultRow label="Square Duct" value={`${squareSide.toFixed(1)} × ${squareSide.toFixed(1)} in`} />
      <ResultRow label="Rectangular (2:1)" value={`${rectWidth.toFixed(1)} × ${rectHeight.toFixed(1)} in`} />
      <InfoBox>
        <div className="space-y-1">
          <div className="font-semibold">Velocity Guidelines:</div>
          <div>• Residential: 500-700 FPM (quiet)</div>
          <div>• Commercial main duct: 1000-1500 FPM</div>
          <div>• Industrial / risers: 1500-2500 FPM</div>
        </div>
      </InfoBox>
    </CalcCard>
  );
}

// ============= Reference Table =============
function VentilationReferenceTable() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'}`}>
      <h3 className="mb-6 text-xl font-bold">Complete Ventilation Reference Guide</h3>
      <div className="space-y-8">
        {roomVentilationData.map((category) => (
          <div key={category.category}>
            <h4 className="mb-3 flex items-center gap-2 text-lg font-bold">
              <span>{category.icon}</span> {category.category}
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full text-xs">
                <thead className={isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Room Type</th>
                    <th className="px-4 py-3 text-center font-semibold">ACPH</th>
                    <th className="px-4 py-3 text-center font-semibold">Fresh Air</th>
                    <th className="px-4 py-3 text-center font-semibold">Exhaust</th>
                    <th className="px-4 py-3 text-left font-semibold">Pressure</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                  {category.items.map((item) => (
                    <tr key={item.name} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      <td className="px-4 py-2.5 font-medium">{item.name}</td>
                      <td className="px-4 py-2.5 text-center font-mono">{item.achRange}</td>
                      <td className="px-4 py-2.5 text-center">
                        {item.freshAir ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-rose-500" />
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {item.exhaust ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-rose-500" />
                        )}
                      </td>
                      <td className={`px-4 py-2.5 ${item.pressure.includes('Negative') ? 'text-rose-400' : item.pressure.includes('Positive') ? 'text-emerald-400' : ''}`}>
                        {item.pressure}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= Reusable components =============
function CalcCard({ title, subtitle, icon: Icon, color, children }: { title: string; subtitle: string; icon: any; color: 'cyan' | 'violet' | 'emerald' | 'amber'; children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = { cyan: 'from-cyan-500 to-blue-600', violet: 'from-violet-500 to-purple-600', emerald: 'from-emerald-500 to-teal-600', amber: 'from-amber-500 to-orange-600' };

  return (
    <div className={`rounded-2xl p-5 ${isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ============= Area OR Length&Width toggle switch (shared UI) =============
function AreaDimsModeToggle({
  mode,
  onChange,
  color = 'cyan',
}: {
  mode: 'dims' | 'area';
  onChange: (m: 'dims' | 'area') => void;
  color?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const activeMap: Record<string, string> = {
    cyan: 'bg-cyan-500 text-white',
    violet: 'bg-violet-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
  };
  const activeCls = activeMap[color] || activeMap.cyan;
  return (
    <div className={`mb-3 flex rounded-lg p-1 text-xs font-medium ring-1 ${isDark ? 'bg-slate-800 ring-slate-700' : 'bg-slate-100 ring-slate-200'}`}>
      <button
        type="button"
        onClick={() => onChange('dims')}
        className={`flex-1 rounded-md px-2 py-1.5 transition ${mode === 'dims' ? activeCls : isDark ? 'text-slate-400' : 'text-slate-600'}`}
      >
        Length & Width
      </button>
      <button
        type="button"
        onClick={() => onChange('area')}
        className={`flex-1 rounded-md px-2 py-1.5 transition ${mode === 'area' ? activeCls : isDark ? 'text-slate-400' : 'text-slate-600'}`}
      >
        Area Only
      </button>
    </div>
  );
}

function NumInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div>
      <label className={`mb-1 block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min="0"
        step="any"
        className={`w-full rounded-lg border-0 px-3 py-2 text-sm outline-none ring-1 focus:ring-2 ${isDark ? 'bg-slate-800 text-slate-100 ring-slate-700 focus:ring-cyan-500' : 'bg-white text-slate-900 ring-slate-200 focus:ring-cyan-500'}`}
      />
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className={`mt-2 flex items-center justify-between rounded-lg px-3 py-2 text-sm ${highlight ? (isDark ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 ring-1 ring-cyan-500/30' : 'bg-gradient-to-r from-cyan-50 to-blue-50 ring-1 ring-cyan-200') : isDark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{label}</span>
      <span className={`font-semibold ${highlight ? (isDark ? 'text-cyan-300' : 'text-cyan-700') : isDark ? 'text-slate-100' : 'text-slate-900'}`}>{value}</span>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className={`mt-3 flex items-start gap-2 rounded-lg p-2.5 text-xs ${isDark ? 'bg-amber-500/5 text-amber-300 ring-1 ring-amber-500/20' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'}`}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/* ============================================================================
   COMPONENT: VentilationGuide (main layout with tabs)
============================================================================ */

type Tab = 'types' | 'calculators' | 'ashrae' | 'basement';

interface VentilationGuideProps {
  theme: Theme;
  onToggleTheme?: () => void;
}

export default function VentilationGuide({ theme, onToggleTheme }: VentilationGuideProps) {
  const [activeTab, setActiveTab] = useState<Tab>('types');

  const isDark = theme === 'dark';

  const tabs: { id: Tab; label: string; icon: typeof Wind }[] = [
    { id: 'types', label: 'Ventilation Types', icon: Wind },
    { id: 'calculators', label: 'Calculators', icon: Cpu },
    { id: 'basement', label: 'Basement Ventilation', icon: ParkingCircle },
    { id: 'ashrae', label: 'ASHRAE Guide', icon: BookOpen },
  ];

  return (
    <VentilationThemeContext.Provider value={{ theme, toggle: onToggleTheme ?? (() => {}) }}>
      <div
        className={
          isDark
            ? 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
            : 'min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900'
        }
      >
        {/* Background glow effects */}
        <div className="app-glow pointer-events-none fixed inset-0 overflow-hidden print:hidden">
          <div
            className={`absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl opacity-20 ${
              isDark ? 'bg-cyan-500' : 'bg-cyan-300'
            }`}
          />
          <div
            className={`absolute top-1/2 -right-40 h-96 w-96 rounded-full blur-3xl opacity-20 ${
              isDark ? 'bg-violet-500' : 'bg-violet-300'
            }`}
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header
            className={`app-header sticky top-0 z-40 border-b backdrop-blur-xl print:hidden ${
              isDark
                ? 'border-slate-800/60 bg-slate-950/70'
                : 'border-slate-200 bg-white/70'
            }`}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                  <Wind className="h-6 w-6 text-white" strokeWidth={2.5} />
                  <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                    HVAC Ventilation Tool
                  </h1>
                  <p
                    className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Complete Ventilation Guide • Calculators • ASHRAE 62.1
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:flex ${
                    isDark
                      ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  }`}
                >
                  <Activity className="h-3 w-3" /> Live
                </div>
              </div>
            </div>
          </header>

          {/* Hero */}
          <section className="app-hero mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 print:hidden">
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div
                  className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    isDark
                      ? 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30'
                      : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                  }`}
                >
                  <Wind className="h-3 w-3" /> 16 Ventilation Types
                </div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  All Types of{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                    Ventilation
                  </span>
                </h2>
                <p
                  className={`mt-3 max-w-2xl text-sm sm:text-base ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  From Natural to Hybrid — discover detailed insights, pros and cons, applications, 
                  and professional-grade CFM/ACH calculators for every ventilation system, all in one place..
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <StatCard label="Types" value="16+" color="cyan" isDark={isDark} />
                <StatCard
                  label="Calculators"
                  value="4"
                  color="violet"
                  isDark={isDark}
                />
                <StatCard
                  label="Standards"
                  value="ASHRAE"
                  color="emerald"
                  isDark={isDark}
                />
              </div>
            </div>

            {/* Tabs */}
            <div
              className={`mb-8 flex gap-1 overflow-x-auto rounded-2xl p-1.5 ${
                isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-slate-100'
              }`}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? isDark
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 ring-1 ring-cyan-500/40 shadow-lg shadow-cyan-500/10'
                          : 'bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200'
                        : isDark
                          ? 'text-slate-400 hover:text-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Content */}
          <main id="print-root" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
            {activeTab === 'types' && <VentilationTypes />}
            {activeTab === 'calculators' && <Calculators />}
            {activeTab === 'basement' && <BasementVentilation />}
            {activeTab === 'ashrae' && <ASHRAEGuide />}
          </main>

          {/* Footer */}
          <footer
            className={`app-footer border-t print:hidden ${
              isDark ? 'border-slate-800/60' : 'border-slate-200'
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <p
                className={`text-center text-xs ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                © 2026 HVAC Ventilation Tool • Based on ASHRAE Standard 62.1 &
                62.2 • For professional reference use
              </p>
            </div>
          </footer>
        </div>
      </div>
    </VentilationThemeContext.Provider>
  );
}

function StatCard({
  label,
  value,
  color,
  isDark,
}: {
  label: string;
  value: string;
  color: 'cyan' | 'violet' | 'emerald';
  isDark: boolean;
}) {
  const colorMap = {
    cyan: isDark
      ? 'from-cyan-500/10 to-cyan-500/5 ring-cyan-500/20 text-cyan-400'
      : 'from-cyan-50 to-cyan-100 ring-cyan-200 text-cyan-700',
    violet: isDark
      ? 'from-violet-500/10 to-violet-500/5 ring-violet-500/20 text-violet-400'
      : 'from-violet-50 to-violet-100 ring-violet-200 text-violet-700',
    emerald: isDark
      ? 'from-emerald-500/10 to-emerald-500/5 ring-emerald-500/20 text-emerald-400'
      : 'from-emerald-50 to-emerald-100 ring-emerald-200 text-emerald-700',
  };
  return (
    <div
      className={`rounded-xl bg-gradient-to-br p-3 ring-1 ${colorMap[color]} text-center`}
    >
      <div className="text-lg font-bold sm:text-xl">{value}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-70">
        {label}
      </div>
    </div>
  );
}