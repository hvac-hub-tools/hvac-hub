export interface ASHRAEEntry {
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

export interface ASHRAECategory {
  category: string;
  entries: ASHRAEEntry[];
}

export const ashrae621Table: ASHRAECategory[] = [
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

export const generalNotes: string[] = [
  'Table 6.2.2.1 is the minimum ventilation rates for the listed occupancy categories.',
  'Rates are based on the ventilation rate procedure in Section 6.2.',
  'These rates may not alone provide thermal comfort; supplemental conditioning may be needed.',
  'Rp is the outdoor airflow rate required per person. Ra is the outdoor airflow rate required per unit area.',
  'The zone outdoor airflow (Vbz) is calculated as: Vbz = Rp x Pz + Ra x Az.',
  'Default occupant densities are provided to assist designers when actual occupancy is not known.',
  'Combined outdoor air rate is based on default occupant density and equals Rp + (Ra x 1000)/density.',
  'Air class designations are used to determine recirculation limitations per Section 5.16.',
];

export const itemSpecificNotes: { code: string; note: string }[] = [
  { code: 'A', note: 'Rate does not allow for humidity control. Additional ventilation or dehumidification may be needed.' },
  { code: 'B', note: 'Rate may not be sufficient for occupancies involving significant sources of contaminants such as printers and copiers.' },
  { code: 'C', note: 'Rate is based on the assumption that the kitchen hoods are operating. If hoods are not operating, increase rate.' },
  { code: 'D', note: 'Rate does not include provisions for exhaust air required for laboratory fume hoods or other exhaust devices.' },
  { code: 'E', note: 'Rate is based on sedentary activity. For higher activity levels, use the appropriate rate from a higher occupancy category.' },
  { code: 'F', note: 'Rate applies when no unusual contaminant sources are present. Higher rates may be needed for some industrial processes.' },
];
