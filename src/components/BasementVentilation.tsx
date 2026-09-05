import { useState } from 'react';
import { ParkingCircle, Plus, Trash2 } from 'lucide-react';
import { useVentilationTheme as useTheme } from './VentilationGuide';
import PrintHeader from './PrintHeader';

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

export default function BasementVentilation() {
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

  const [jetFanAreaCoverage, setJetFanAreaCoverage] = useState(250);
  const [jetFanCfmCapacity, setJetFanCfmCapacity] = useState(7000);
  const [jetFanLowKw, setJetFanLowKw] = useState(0.37);
  const [jetFanHighKw, setJetFanHighKw] = useState(1.5);

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

        // Text fields
        if (field === 'level' || field === 'zone') {
          return { ...z, [field]: value };
        }

        // Numeric fields - allow editing without forcing 0 on empty
        if (value === '' || value === null) {
          return { ...z, [field]: 0 };
        }
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return { ...z, [field]: isNaN(num) ? 0 : num };
      })
    );
  };

  const calculateZone = (zone: BasementZone) => {
    const volume = zone.area * zone.height;
    const normalCFM = (volume * zone.normalACH) / 60;
    const emergencyCFM = (volume * zone.emergencyACH) / 60;
    const normalM3s = normalCFM * 0.0004719;
    const emergencyM3s = emergencyCFM * 0.0004719;
    const shaftAreaM2 = (normalCFM / zone.shaftVelocity) * 0.0929;
    const shaftAreaM2Emergency = (emergencyCFM / zone.shaftVelocity) * 0.0929;
    return { volume, normalCFM, emergencyCFM, normalM3s, emergencyM3s, shaftAreaM2, shaftAreaM2Emergency };
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

  return (
    <div className="space-y-6">
      {/* Print Header (Excel-style) */}
      <PrintHeader elementDescription="Basement Parking Ventilation Calculation" />

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
        className={`overflow-x-auto rounded-2xl ${isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'}`}
      >
        <div className={`flex items-center justify-between border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Zone-wise Ventilation Calculation</span>
          </div>
          <button
            onClick={addZone}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-600 print:hidden"
          >
            <Plus className="h-3.5 w-3.5" /> Add Zone
          </button>
        </div>

        <table className="w-full min-w-[1400px] text-xs">
          <thead>
            <tr className={isDark ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-100 text-slate-600'}>
              <th className="border-r px-2 py-2 font-semibold" rowSpan={2}>Level</th>
              <th className="border-r px-2 py-2 font-semibold" rowSpan={2}>Zone</th>
              <th className="border-r px-2 py-2 font-semibold" rowSpan={2}>Area<br />(m²)</th>
              <th className="border-r px-2 py-2 font-semibold" rowSpan={2}>Height<br />(m)</th>
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
                      value={zone.area || ''}
                      onChange={(e) => updateZone(zone.id, 'area', e.target.value)}
                      className="w-16 rounded border-0 bg-transparent px-1 text-center font-mono text-xs focus:bg-slate-800"
                    />
                  </td>
                  <td className="border-r px-1 py-2">
                    <input
                      type="number"
                      step="0.1"
                      value={zone.height || ''}
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
        className={`overflow-hidden rounded-2xl ${isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'}`}
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
