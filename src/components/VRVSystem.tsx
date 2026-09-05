import { useState } from 'react';
import { CheckCircle2, Zap, Shield, Power, Info, Cpu, Activity, LayoutGrid } from 'lucide-react';

const outdoorData: Record<string, any[]> = {
  'Home': [
    { hp: '4 HP', mca: '16.5', mfa: '25', mcb: '25A (2-Pole)', elcb: '25A (300mA)', cable: '3 Core x 4 Sq.mm (Armoured)', phase: '1 Phase, 230V', desc: 'RXRQ4ARV16', kw: '1.45' },
    { hp: '5 HP', mca: '27.0', mfa: '30', mcb: '32A (2-Pole)', elcb: '32A (300mA)', cable: '3 Core x 4 Sq.mm (Armoured)', phase: '1 Phase, 230V', desc: 'RXRQ5ARV16', kw: '1.93' },
    { hp: '6 HP', mca: '30.0', mfa: '32', mcb: '32A (2-Pole)', elcb: '32A (300mA)', cable: '3 Core x 4 Sq.mm (Armoured)', phase: '1 Phase, 230V', desc: 'RXRQ6ARV16', kw: '2.41' },
  ],
  'S': [
    { hp: '4 HP', mca: '16.5', mfa: '25', mcb: '25A (2-Pole)', elcb: '25A (300mA)', cable: '3 Core x 4 Sq.mm (Armoured)', phase: '1 Phase, 230V', desc: 'RXMQ4BRV16' },
    { hp: '5 HP', mca: '27.0', mfa: '32', mcb: '32A (2-Pole)', elcb: '32A (300mA)', cable: '3 Core x 4 Sq.mm (Armoured)', phase: '1 Phase, 230V', desc: 'RXMQ5BRV16' },
    { hp: '6 HP', mca: '27.0', mfa: '32', mcb: '32A (2-Pole)', elcb: '32A (300mA)', cable: '3 Core x 6 Sq.mm (Armoured)', phase: '1 Phase, 230V', desc: 'RXMQ6ARV16' },
    { hp: '8 HP', mca: '18.9', mfa: '25', mcb: '25A (4-Pole)', elcb: '25A (300mA)', cable: '4 Core x 6 Sq.mm (Armoured)', phase: '3 Phase, 415V', desc: 'RXMQ8ARY16', kw: '6.6' },
    { hp: '10 HP', mca: '22.0', mfa: '25', mcb: '25A (4-Pole)', elcb: '25A (300mA)', cable: '4 Core x 6 Sq.mm (Armoured)', phase: '3 Phase, 415V', desc: 'RXMQ10BRY16' },
    { hp: '12 HP', mca: '24.0', mfa: '32', mcb: '32A (4-Pole)', elcb: '32A (300mA)', cable: '4 Core x 6 Sq.mm (Armoured)', phase: '3 Phase, 415V', desc: 'RXMQ12BRY16' },
  ],
  'X': [
    { hp: '8 HP', mca: '16.1', mfa: '20', mcb: '20A (4-Pole)', elcb: '20A (300mA)', cable: '4 Core x 6 Sq.mm (Armoured)', phase: '3 Phase, 400V', desc: 'RXQ8ARY6', kw: '5.2' },
    { hp: '10 HP', mca: '21.2', mfa: '25', mcb: '25A (4-Pole)', elcb: '25A (300mA)', cable: '4 Core x 6 Sq.mm (Armoured)', phase: '3 Phase, 400V', desc: 'RXQ10ARY6', kw: '6.8' },
    { hp: '12 HP', mca: '22.5', mfa: '25', mcb: '25A (4-Pole)', elcb: '25A (300mA)', cable: '4 Core x 6 Sq.mm (Armoured)', phase: '3 Phase, 400V', desc: 'RXQ12ARY6', kw: '8.7' },
    { hp: '14 HP', mca: '26.9', mfa: '30', mcb: '32A (4-Pole)', elcb: '32A (300mA)', cable: '4 Core x 10 Sq.mm (Armoured)', phase: '3 Phase, 400V', desc: 'RXQ14ARY6', kw: '10.7' },
    { hp: '16 HP', mca: '30.2', mfa: '35', mcb: '40A (4-Pole)', elcb: '40A (300mA)', cable: '4 Core x 10 Sq.mm (Armoured)', phase: '3 Phase, 400V', desc: 'RXQ16ARY6', kw: '13.0' },
    { hp: '18 HP', mca: '35.2', mfa: '35', mcb: '40A (4-Pole)', elcb: '40A (300mA)', cable: '4 Core x 10 Sq.mm (Armoured)', phase: '3 Phase, 400V', desc: 'RXQ18ARY6', kw: '15.3' },
    { hp: '20 HP', mca: '38.9', mfa: '45', mcb: '63A (4-Pole)', elcb: '63A (300mA)', cable: '4 Core x 10 Sq.mm (Armoured)', phase: '3 Phase, 400V', desc: 'RXQ20ARY6', kw: '17.7' },
  ]
};

const indoorTypes = ['Wall Mounted', '1-Way Cassette', '2-Way Cassette', '4-Way Cassette', 'Compact Cassette', 'Slim Duct', 'Mid Static Duct', 'Ceiling Mounted Duct (High Static)', 'Ceiling Suspended'];

// Not every indoor type is actually available in every VRV series.
// VRV Home only comes with these 3 (FXARQ / FXMRQ / FXDRQ) — no cassettes, no high-static duct, no ceiling suspended.
// VRV S and VRV X share the full commercial indoor lineup.
const indoorTypesBySeries: Record<string, string[]> = {
  'Home': ['Wall Mounted', 'Slim Duct', 'Mid Static Duct'],
  'S': ['Wall Mounted', '1-Way Cassette', '2-Way Cassette', '4-Way Cassette', 'Compact Cassette', 'Slim Duct', 'Mid Static Duct', 'Ceiling Mounted Duct (High Static)', 'Ceiling Suspended'],
  'X': ['Wall Mounted', '1-Way Cassette', '2-Way Cassette', '4-Way Cassette', 'Compact Cassette', 'Slim Duct', 'Mid Static Duct', 'Ceiling Mounted Duct (High Static)', 'Ceiling Suspended'],
};

const indoorData: Record<string, any[]> = {
  'Wall Mounted': [
    { tr: '0.63 TR', mca: '0.3', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '0.80 TR', mca: '0.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.03 TR', mca: '0.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.28 TR', mca: '0.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.59 TR', mca: '0.5', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.02 TR', mca: '0.7', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
  ],
  '1-Way Cassette': [
    { tr: '1.03 TR', mca: '0.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.28 TR', mca: '0.5', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.59 TR', mca: '0.5', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.02 TR', mca: '0.7', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
  ],
  '2-Way Cassette': [
    { tr: '0.63 TR', mca: '0.3', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '0.80 TR', mca: '0.3', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.03 TR', mca: '0.3', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.28 TR', mca: '0.3', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.59 TR', mca: '0.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.02 TR', mca: '0.5', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.56 TR', mca: '0.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '3.98 TR', mca: '1.1', mcb: '16A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
  ],
  '4-Way Cassette': [
    { tr: '0.80 TR', mca: '0.3', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.03 TR', mca: '0.3', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.28 TR', mca: '0.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.59 TR', mca: '0.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.02 TR', mca: '0.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.56 TR', mca: '1.0', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '3.18 TR', mca: '1.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '3.98 TR', mca: '1.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '4.55 TR', mca: '1.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
  ],
  'Compact Cassette': [
    { tr: '0.63 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '0.80 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.03 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.28 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.59 TR', mca: '0.9', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
  ],
  'Slim Duct': [
    { tr: '0.63 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '0.80 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.03 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.28 TR', mca: '1.0', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.59 TR', mca: '1.0', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.02 TR', mca: '1.1', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
  ],
  'Mid Static Duct': [
    { tr: '1.28 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.59 TR', mca: '1.2', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.02 TR', mca: '1.0', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.56 TR', mca: '1.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '3.18 TR', mca: '1.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
  ],
  'Ceiling Mounted Duct (High Static)': [
    { tr: '0.63 TR', mca: '0.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '0.80 TR', mca: '0.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.03 TR', mca: '0.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.28 TR', mca: '1.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '1.59 TR', mca: '1.6', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.02 TR', mca: '1.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.56 TR', mca: '2.3', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '3.18 TR', mca: '2.9', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '3.98 TR', mca: '3.4', mcb: '15A (1-Pole)', cable: '3 Core x 2.5 Sq.mm' },
    { tr: '4.55 TR', mca: '3.4', mcb: '15A (1-Pole)', cable: '3 Core x 2.5 Sq.mm' },
    { tr: '5.48 TR', mca: '4.9', mcb: '15A (1-Pole)', cable: '3 Core x 2.5 Sq.mm' },
    { tr: '6.37 TR', mca: '8.2', mcb: '15A (1-Pole)', cable: '3 Core x 4.0 Sq.mm' },
    { tr: '7.96 TR', mca: '10.9', mcb: '15A (1-Pole)', cable: '3 Core x 4.0 Sq.mm' },
  ],
  'Ceiling Suspended': [
    { tr: '1.03 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '2.02 TR', mca: '0.8', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '3.18 TR', mca: '0.9', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '3.98 TR', mca: '1.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
    { tr: '4.55 TR', mca: '1.4', mcb: '6A (1-Pole)', cable: '3 Core x 1.5 Sq.mm' },
  ]
};

export default function VRVSystem({ theme }: { theme: string }) {
  
  const [series, setSeries] = useState<string>('');
  const [unitType, setUnitType] = useState<string>('');
  const [indoorType, setIndoorType] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');

  // ✅ Theme logic setup
  const isDark = theme === 'dark';
  const cardBg = isDark ? "bg-[#0B1F3A]/60 backdrop-blur-md border border-white/10" : "bg-white border border-slate-200 shadow-sm";
  const textColor = isDark ? "text-white" : "text-slate-800";
  const accentTeal = "text-[#2DD4BF]";
  const accentTealBg = "bg-[#2DD4BF]/10";
  const activeBtn = "border-[#2DD4BF] bg-[#2DD4BF]/20 text-[#2DD4BF] shadow-[0_0_15px_rgba(45,212,191,0.3)]";
  const inactiveBtn = isDark 
    ? "border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10" 
    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100";

  const handleSeriesSelect = (s: string) => { setSeries(s); setUnitType(''); setIndoorType(''); setCapacity(''); };
  const handleUnitSelect = (u: string) => { setUnitType(u); setIndoorType(''); setCapacity(''); };
  const handleIndoorTypeSelect = (t: string) => { setIndoorType(t); setCapacity(''); };

  const getSelectedData = () => {
    if (unitType === 'Outdoor') return outdoorData[series]?.find(d => d.hp === capacity);
    return indoorData[indoorType]?.find(d => d.tr === capacity);
  };

  const result = capacity ? getSelectedData() : null;



  return (
    <div className={`space-y-6 max-w-4xl mx-auto pb-10 px-4 ${textColor}`}>
      
      {/* STEP 1: Series */}
      <div className={`${cardBg} rounded-2xl p-6 transition-all`}>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
          <span className={`${accentTealBg} ${accentTeal} w-6 h-6 rounded-lg flex items-center justify-center`}>01</span>
          Select VRV Series
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Home', 'S', 'X'].map((s) => (
            <button 
              key={s}
              onClick={() => handleSeriesSelect(s)}
              className={`p-5 rounded-xl border-2 text-left transition-all duration-300 ${series === s ? activeBtn : inactiveBtn}`}
            >
              <div className="font-bold text-lg mb-1">VRV {s === 'Home' ? 'Home' : s}</div>
              <div className="text-[10px] opacity-60 uppercase tracking-wider italic">
                {s === 'Home' ? 'Premium Residential' : s === 'S' ? 'Side Discharge' : 'Heavy Duty ODU'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2: Unit Type */}
      {series && (
        <div className={`${cardBg} rounded-2xl p-6 animate-in fade-in slide-in-from-top-4`}>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
            <span className={`${accentTealBg} ${accentTeal} w-6 h-6 rounded-lg flex items-center justify-center`}>02</span>
            Unit Configuration
          </h3>
          <div className="flex flex-wrap gap-4">
            {['Outdoor', 'Indoor'].map((u) => (
              <button 
                key={u}
                onClick={() => handleUnitSelect(u)}
                className={`px-8 py-4 rounded-xl border-2 font-semibold transition-all flex items-center gap-3 ${unitType === u ? activeBtn : inactiveBtn}`}
              >
                {u === 'Outdoor' ? <Cpu className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                {u} Unit
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Indoor Type Selection */}
      {unitType === 'Indoor' && (
        <div className={`${cardBg} rounded-2xl p-6 animate-in fade-in slide-in-from-top-4`}>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
            <span className={`${accentTealBg} ${accentTeal} w-6 h-6 rounded-lg flex items-center justify-center`}>03</span>
            Select Unit Model
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(indoorTypesBySeries[series] || indoorTypes).map((type) => (
              <button
                key={type}
                onClick={() => handleIndoorTypeSelect(type)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border ${indoorType === type ? activeBtn : inactiveBtn}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Capacity */}
      {((unitType === 'Outdoor' && series) || (unitType === 'Indoor' && indoorType)) && (
        <div className={`${cardBg} rounded-2xl p-6 animate-in fade-in slide-in-from-top-4`}>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
            <span className={`${accentTealBg} ${accentTeal} w-6 h-6 rounded-lg flex items-center justify-center`}>
              {unitType === 'Outdoor' ? '03' : '04'}
            </span>
            System Capacity {unitType === 'Outdoor' ? '(HP)' : '(TR)'}
          </h3>
          <div className="flex flex-wrap gap-3">
            {(unitType === 'Outdoor' ? outdoorData[series] : indoorData[indoorType]).map((item) => {
              const val = unitType === 'Outdoor' ? item.hp : item.tr;
              return (
                <button
                  key={val}
                  onClick={() => setCapacity(val)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all border-2 ${capacity === val ? activeBtn : inactiveBtn}`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* RESULT CARD - Updated with "Required ELCB" */}
      {result && (
        <div className="relative group animate-in zoom-in-95 duration-500">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2DD4BF] to-[#0B1F3A] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className={`relative ${isDark ? 'bg-[#050C16]' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'border-[#2DD4BF]/30' : 'border-slate-200'}`}>
            <div className={`p-8 border-b ${isDark ? 'border-white/5 bg-gradient-to-r from-black to-[#0B1F3A]' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`${accentTeal} font-bold text-xs tracking-widest flex items-center gap-2 mb-2`}>
                    <CheckCircle2 className="w-4 h-4" /> SYSTEM CONFIGURED
                  </p>
                  <h2 className={`text-3xl font-black italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {series === 'Home' ? 'Home' : `VRV ${series}`} <span className={accentTeal}>{unitType}</span> {capacity}
                  </h2>
                </div>
                <Zap className={`w-12 h-12 ${accentTeal} opacity-20`} />
              </div>
            </div>
            
            <div className={`p-8 grid grid-cols-1 md:grid-cols-2 gap-6 ${isDark ? 'bg-black/40' : 'bg-white'}`}>
              {/* Info Boxes */}
              {[
                { label: 'Power Supply', value: result.phase || '1 Phase, 230V', icon: Power, color: 'text-blue-400' },
                { label: 'MCB Size', value: result.mcb, icon: Shield, color: 'text-red-400' },
                { label: 'Cable Size', value: result.cable, icon: LayoutGrid, color: 'text-teal-400' },
                { label: 'Min. Circuit Amps (MCA)', value: `${result.mca} A`, icon: Activity, color: 'text-emerald-400' },
                ...(unitType === 'Outdoor' && result.kw ? [{ label: 'Rated Power Input (kW)', value: `${result.kw} kW`, icon: Cpu, color: 'text-purple-400' }] : []),
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-5 p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-black/50' : 'bg-white shadow-sm'} ${item.color} border border-current/20`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{item.label}</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Required ELCB Rating */}
              <div className={`flex items-center gap-5 p-4 rounded-xl border md:col-span-2 ${isDark ? 'bg-white/5 border-orange-400/20' : 'bg-orange-50/50 border-orange-100'}`}>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-black/50' : 'bg-white shadow-sm'} text-orange-400 border border-current/20`}>
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Required ELCB Rating</p>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {unitType === 'Outdoor' ? result.elcb : 'Per Phase 100mA (Floor DB)'}
                  </p>
                  {unitType === 'Indoor' && (
                    <p className="text-[11px] text-slate-400 mt-1 italic font-medium">Note: Indoor unit MCB must be in Floor DB.</p>
                  )}
                </div>
              </div>

              {/* MFA for Outdoor only */}
              {unitType === 'Outdoor' && (
                <div className={`flex items-center gap-5 p-4 rounded-xl border md:col-span-2 ${isDark ? 'bg-white/5 border-yellow-400/20' : 'bg-yellow-50/50 border-yellow-100'}`}>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-black/50' : 'bg-white shadow-sm'} text-yellow-400 border border-current/20`}>
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Max Fuse Amps (MFA)</p>
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{result.mfa} A</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Notes */}
      <div className={`border-l-4 border-[#2DD4BF] ${isDark ? 'bg-[#2DD4BF]/5' : 'bg-slate-50'} p-6 rounded-r-xl mt-10`}>
        <h4 className={`font-black uppercase tracking-tighter flex items-center gap-2 mb-4 ${accentTeal}`}>
          <Info className="w-5 h-5" /> Engineering Notes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 font-medium">
          <div className="flex gap-2"><span>•</span> <p>MCA is used for cable sizing (minimum 125% factor).</p></div>
          <div className="flex gap-2"><span>•</span> <p>Use 300mA ELCB for ODU to prevent harmonic tripping.</p></div>
          <div className="flex gap-2"><span>•</span> <p>Floor DB must have 100mA ELCB for Indoor Units.</p></div>
          <div className="flex gap-2"><span>•</span> <p>Voltage unbalance must be within ±2% limit.</p></div>
        </div>
      </div>
    </div>
  );
}