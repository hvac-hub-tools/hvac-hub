import { useState } from 'react';
import { Calculator, Building2, Wind, Ruler, Info, Check, X, ChevronDown, Plus, Trash2, ClipboardList } from 'lucide-react';
import { useVentilationTheme as useTheme } from './VentilationGuide';
import { roomVentilationData } from '../data/roomVentilationData';
import PrintHeader from './PrintHeader';

export type ScheduleItem = {
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
  roomTypeName?: string; // Custom editable room name (e.g., "Bedroom 1", "Bedroom 2")
};

export default function Calculators() {
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
        // Recalculate volume and CFM if dimensions or ACPH change
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
          {/* Backdrop to close on outside click */}
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
          Use the "+ Add to Schedule" button in the CFM Calculator to collect multiple rooms here, then print them all together.
        </p>
      </div>
    );
  }

  const totalExhaust = items.reduce((s, i) => s + i.exhaustCfm, 0);
  const totalFresh = items.reduce((s, i) => s + i.freshCfm, 0);

  return (
    <div className="space-y-4">
      <PrintHeader elementDescription="Room Ventilation Calculation Schedule" />

      <div
        className={`overflow-hidden rounded-2xl print:rounded-none print:ring-0 ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <div className={`border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
            Ventilation Schedule ({items.length} {items.length === 1 ? 'room' : 'rooms'})
          </span>
          <p className={`mt-0.5 text-xs print:hidden ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Add multiple rooms from the CFM Calculator, then use Print / Save PDF above
          </p>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead>
              <tr className={isDark ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                <th className={`border px-2 py-2 text-left font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Sr.</th>
                <th className={`border px-2 py-2 text-left font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Room Type</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>L × W × H (ft)</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Volume (ft³)</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Exhaust ACPH</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Fresh ACPH</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Exhaust CFM</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Fresh Air CFM</th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>Pressure</th>
                <th className={`border px-2 py-2 font-bold print:hidden ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></th>
              </tr>
            </thead>
            <tbody className={isDark ? 'text-slate-200' : 'text-slate-800'}>
              {items.map((item, idx) => {
                const border = isDark ? 'border-slate-800' : 'border-slate-300';
                const inputClass = `w-full bg-transparent px-1 py-0.5 text-xs outline-none ${
                  isDark ? 'text-slate-100 focus:bg-slate-700' : 'text-slate-900 focus:bg-slate-100'
                }`;
                const roomName = item.roomTypeName || item.name;
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
                      <div className="flex items-center justify-center gap-0.5">
                        <input
                          type="number"
                          value={item.length}
                          onChange={(e) => onUpdate(item.id, 'length', parseFloat(e.target.value) || 0)}
                          className={`w-12 ${inputClass}`}
                        />
                        <span>×</span>
                        <input
                          type="number"
                          value={item.width}
                          onChange={(e) => onUpdate(item.id, 'width', parseFloat(e.target.value) || 0)}
                          className={`w-12 ${inputClass}`}
                        />
                        <span>×</span>
                        <input
                          type="number"
                          value={item.height}
                          onChange={(e) => onUpdate(item.id, 'height', parseFloat(e.target.value) || 0)}
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
                    <td className={`border px-1 py-2 text-center print:hidden ${border}`}>
                      <button onClick={() => onRemove(item.id)} className="text-rose-400 hover:text-rose-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Totals */}
              <tr className={`font-bold ${isDark ? 'bg-slate-800/60 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
                <td className={`border px-2 py-2.5 ${isDark ? 'border-slate-700' : 'border-slate-300'}`} colSpan={6}>TOTAL</td>
                <td className={`border px-2 py-2.5 text-center font-mono ${isDark ? 'border-slate-700 text-rose-400' : 'border-slate-300 text-rose-600'}`}>
                  {totalExhaust.toFixed(0)}
                </td>
                <td className={`border px-2 py-2.5 text-center font-mono ${isDark ? 'border-slate-700 text-emerald-400' : 'border-slate-300 text-emerald-600'}`}>
                  {totalFresh.toFixed(0)}
                </td>
                <td className={`border px-2 py-2.5 ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></td>
                <td className={`border px-2 py-2.5 print:hidden ${isDark ? 'border-slate-700' : 'border-slate-300'}`}></td>
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
  const [ach, setAch] = useState('4');
  const [exhaustAch, setExhaustAch] = useState('0');
  const [freshAch, setFreshAch] = useState('4');
  const [selectedPreset, setSelectedPreset] = useState('Bedroom');

  // Flatten presets for buttons
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
    
    // Logic: If both, split or use specific ratios. For simplicity, let's use the ACH for the primary mode.
    // If both are true, let's assume 50/50 or user adjusts. 
    // Actually, let's set exhaust and fresh based on the preset flags.
    // If fresh only: fresh = ach, exhaust = 0
    // If exhaust only: exhaust = ach, fresh = 0
    // If both: exhaust = ach, fresh = ach * 0.9 (makeup air logic) or just ach. Let's use ach for both for simplicity, user can tweak.
    // Wait, previous logic was specific. Let's stick to: if both, exhaust=ach, fresh=ach*0.9.
    
    if (preset.freshAir && !preset.exhaust) {
      setFreshAch(preset.achMid.toString());
      setExhaustAch('0');
    } else if (!preset.freshAir && preset.exhaust) {
      setFreshAch('0');
      setExhaustAch(preset.achMid.toString());
    } else if (preset.freshAir && preset.exhaust) {
      setExhaustAch(preset.achMid.toString());
      setFreshAch((preset.achMid * 0.9).toString()); // Makeup air logic
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

  const volume = L * W * H;
  const exhaustCfm = (volume * exA) / 60;
  const freshCfm = (volume * frA) / 60;

  return (
    <CalcCard
      title="CFM Calculator"
      subtitle="Exhaust & fresh air CFM based on room type"
      icon={Wind}
      color="cyan"
    >
      <div className="grid grid-cols-3 gap-2">
        <NumInput label="Length (ft)" value={length} onChange={setLength} />
        <NumInput label="Width (ft)" value={width} onChange={setWidth} />
        <NumInput label="Height (ft)" value={height} onChange={setHeight} />
      </div>

      {/* ACH Slider */}
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
            // Update exhaust/fresh proportionally if a preset is active
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

      {/* Manual ACPH override */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumInput label="Exhaust ACPH" value={exhaustAch} onChange={setExhaustAch} />
        <NumInput label="Fresh Air ACPH" value={freshAch} onChange={setFreshAch} />
      </div>

      <ResultRow label="Room Volume" value={`${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} ft³`} />
      {exA > 0 && (
        <>
          <ResultRow label="Exhaust Air CFM" value={`${exhaustCfm.toFixed(1)} CFM`} highlight />
          <ResultRow label="Exhaust Air (L/s)" value={`${(exhaustCfm * 0.4719).toFixed(1)} L/s`} />
        </>
      )}
      {frA > 0 && (
        <>
          <ResultRow label="Fresh Air CFM" value={`${freshCfm.toFixed(1)} CFM`} highlight />
          <ResultRow label="Fresh Air (L/s)" value={`${(freshCfm * 0.4719).toFixed(1)} L/s`} />
        </>
      )}
      {exA > 0 && frA > 0 && (
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
            length: L,
            width: W,
            height: H,
            volume,
            exhaustAch: exA,
            freshAch: frA,
            exhaustCfm,
            freshCfm,
            pressure: activePreset?.pressure || (exA > frA ? 'Negative' : exA < frA ? 'Positive' : 'Neutral'),
            roomTypeName: selectedPreset, // Initialize with preset name, user can edit later
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
  const [cfm, setCfm] = useState('200');
  const [length, setLength] = useState('20');
  const [width, setWidth] = useState('15');
  const [height, setHeight] = useState('9');

  const C = parseFloat(cfm) || 0;
  const L = parseFloat(length) || 0;
  const W = parseFloat(width) || 0;
  const H = parseFloat(height) || 0;

  const volume = L * W * H;
  const ach = volume > 0 ? (C * 60) / volume : 0;

  return (
    <CalcCard title="ACH Calculator" subtitle="Calculate Air Changes per Hour from CFM" icon={Calculator} color="violet">
      <NumInput label="Airflow (CFM)" value={cfm} onChange={setCfm} />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <NumInput label="Length (ft)" value={length} onChange={setLength} />
        <NumInput label="Width (ft)" value={width} onChange={setWidth} />
        <NumInput label="Height (ft)" value={height} onChange={setHeight} />
      </div>
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
  const A = parseFloat(area) || 0;
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
      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumInput label="Floor Area (sq ft)" value={area} onChange={setArea} />
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
