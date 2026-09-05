export interface RoomVentilationItem {
  name: string;
  achRange: string;
  achMid: number;
  freshAir: boolean;
  exhaust: boolean;
  pressure: string;
}

export interface RoomVentilationCategory {
  category: string;
  icon: string;
  items: RoomVentilationItem[];
}

export const roomVentilationData: RoomVentilationCategory[] = [
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
