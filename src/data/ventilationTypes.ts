export interface VentilationType {
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

export const ventilationTypes: VentilationType[] = [
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

export interface RecommendedACH {
  space: string;
  ach: number;
}

export const recommendedACH: RecommendedACH[] = [
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
