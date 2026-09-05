import { useEffect, useMemo, useState } from "react";
import { type ChillerSpec, type UnitSpec, chillerData, chwIndoorData } from "../data/hvacData";
import { Wind, Snowflake, Activity, Zap, Shield, LayoutGrid, ChevronDown, Info, Droplets, Cpu } from 'lucide-react';

type CHWMode = "indoor" | "chiller";

export default function CHWSection({ theme }: { theme: string }) {
  const [mode, setMode] = useState<CHWMode>("indoor");
  const [indoorType, setIndoorType] = useState("");
  const [chillerType, setChillerType] = useState<"Air Cooled" | "Water Cooled">("Air Cooled");
  const [compressorType, setCompressorType] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [openModel, setOpenModel] = useState<string | null>(null);

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
  const selectStyle = isDark
    ? "w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm font-medium text-white outline-none focus:border-[#2DD4BF] appearance-none"
    : "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#2DD4BF] appearance-none";

  // Market standard CHW Indoor Types
  const indoorTypes = useMemo(() => chwIndoorData.map((category) => category.type), []);

  const selectedIndoorCategory = useMemo(
    () => chwIndoorData.find((category) => category.type === indoorType) ?? chwIndoorData[0],
    [indoorType],
  );

  const chillerUnits = useMemo(
    () => chillerData.flatMap((category) => category.units).filter((unit) => unit.chiller_type === chillerType),
    [chillerType],
  );

  const compressorTypes = useMemo(
    () => Array.from(new Set(chillerUnits.map((unit) => unit.compressor_type))),
    [chillerUnits],
  );

  const capacityOptions = useMemo(() => {
    if (mode === "indoor") {
      if (!selectedIndoorCategory) return [];
      return Array.from(new Set(selectedIndoorCategory.units.map((unit) => unit.capacity_tr))).sort((a, b) => a - b);
    }
    const byCompressor = chillerUnits.filter((unit) => unit.compressor_type === compressorType);
    return Array.from(new Set(byCompressor.map((unit) => unit.capacity_tr))).sort((a, b) => a - b);
  }, [mode, selectedIndoorCategory, chillerUnits, compressorType]);

  const filteredIndoorUnits = useMemo(() => {
    if (!selectedIndoorCategory || !selectedCapacity) return [];
    return selectedIndoorCategory.units.filter((unit) => unit.capacity_tr === Number(selectedCapacity));
  }, [selectedIndoorCategory, selectedCapacity]);

  const filteredChillerUnits = useMemo(() => {
    if (!selectedCapacity) return [];
    return chillerUnits.filter(
      (unit) => unit.compressor_type === compressorType && unit.capacity_tr === Number(selectedCapacity),
    );
  }, [chillerUnits, compressorType, selectedCapacity]);

  useEffect(() => {
    if (indoorTypes.length > 0 && !indoorType) {
      setIndoorType(indoorTypes[0]);
    }
  }, [indoorTypes, indoorType]);

  useEffect(() => {
    setCompressorType(compressorTypes[0] ?? "");
    setOpenModel(null);
  }, [compressorTypes]);

  useEffect(() => {
    const firstCapacity = capacityOptions[0];
    setSelectedCapacity(firstCapacity ? String(firstCapacity) : "");
    setOpenModel(null);
  }, [capacityOptions]);


  return (
    <div className={`space-y-6 max-w-4xl mx-auto pb-10 px-4 ${textColor}`}>
      
      {/* HEADER */}
      <div className={`${cardBg} rounded-2xl p-6`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`${accentTealBg} p-2 rounded-lg`}>
            <Snowflake className={`w-5 h-5 ${accentTeal}`} />
          </div>
          <h2 className="text-xl font-bold italic tracking-tight">CHW LOAD SELECTOR</h2>
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Professional tool for Chilled Water System components and load analysis.</p>
      </div>

      {/* STEP 1: Mode Selection */}
      <div className={`${cardBg} rounded-2xl p-6 shadow-xl`}>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-3">
          <span className={`${accentTealBg} ${accentTeal} w-6 h-6 rounded-lg flex items-center justify-center text-xs`}>01</span>
          System Selection
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode("indoor")}
            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${mode === "indoor" ? activeBtn : inactiveBtn}`}
          >
            <Wind className="w-5 h-5" /> CHW Indoor Unit
          </button>
          <button
            onClick={() => setMode("chiller")}
            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${mode === "chiller" ? activeBtn : inactiveBtn}`}
          >
            <Droplets className="w-5 h-5" /> Chiller Plant
          </button>
        </div>
      </div>

      {/* DYNAMIC STEPS */}
      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
        {mode === "indoor" ? (
          <div className="space-y-4">
            {/* GRID SELECTION FOR INDOOR TYPES */}
            <div className={`${cardBg} rounded-2xl p-6`}>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-5 flex items-center gap-3">
                <LayoutGrid className={`w-4 h-4 ${accentTeal}`} />
                02: Select Indoor Model
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {indoorTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setIndoorType(type)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-[11px] font-bold uppercase tracking-tight text-center flex items-center justify-center leading-tight h-16 ${indoorType === type ? activeBtn : inactiveBtn}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* CAPACITY SELECTOR */}
            <div className={`${cardBg} rounded-2xl p-6`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                <Activity className="w-3 h-3 text-[#2DD4BF]" /> 03: Tonnage Capacity
              </p>
              <div className="relative">
                <select value={selectedCapacity} onChange={(e) => setSelectedCapacity(e.target.value)} className={selectStyle}>
                  {capacityOptions.map((tr) => <option key={tr} value={String(tr)} className="bg-[#0B1F3A]">{tr} TR</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`${cardBg} rounded-2xl p-6`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
                 <Snowflake className="w-3 h-3 text-[#2DD4BF]" /> 02: Chiller Cooling Method
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["Air Cooled", "Water Cooled"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setChillerType(type)}
                    className={`p-3 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-tighter ${chillerType === type ? activeBtn : inactiveBtn}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`${cardBg} rounded-2xl p-6`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">03: Compressor</p>
                <select value={compressorType} onChange={(e) => setCompressorType(e.target.value)} className={selectStyle}>
                  {compressorTypes.map((type) => <option key={type} value={type} className="bg-[#0B1F3A]">{type}</option>)}
                </select>
              </div>
              <div className={`${cardBg} rounded-2xl p-6`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">04: Capacity (TR)</p>
                <select value={selectedCapacity} onChange={(e) => setSelectedCapacity(e.target.value)} className={selectStyle}>
                  {capacityOptions.map((tr) => <option key={tr} value={String(tr)} className="bg-[#0B1F3A]">{tr} TR</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {mode === "indoor" ? filteredIndoorUnits.length : filteredChillerUnits.length} Specifications Loaded
            </p>
        </div>

        {mode === "indoor" && filteredIndoorUnits.map((unit) => (
  <IndoorModelRow 
    key={unit.model} 
    unit={unit} 
    isDark={isDark} // <--- Ye naya prop yahan add karein
    isOpen={openModel === unit.model} 
    onToggle={() => setOpenModel(openModel === unit.model ? null : unit.model)} 
  />
        ))}

        {mode === "chiller" && filteredChillerUnits.map((unit) => (
  <ChillerModelRow 
    key={unit.model} 
    unit={unit} 
    isDark={isDark} // <--- Ye naya prop yahan bhi add karein
    isOpen={openModel === unit.model} 
    onToggle={() => setOpenModel(openModel === unit.model ? null : unit.model)} 
  />
))}

        {((mode === "indoor" ? filteredIndoorUnits.length : filteredChillerUnits.length) === 0) && (
             <div className="rounded-2xl border-2 border-dashed border-white/5 bg-white/5 p-12 text-center">
                <Info className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">No matching units in database</p>
             </div>
        )}
      </div>

      {/* FOOTER NOTE */}
      <div className="rounded-2xl bg-[#2DD4BF]/5 border border-[#2DD4BF]/10 p-5">
          <div className="flex items-start gap-4">
            <Shield className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                Note: Data points for MCA, MOP, and Current are based on standard nominal conditions. Always refer to the manufacturer's nameplate on site for final verification.
            </p>
          </div>
      </div>
    </div>
  );
}

// Sub-components
function IndoorModelRow({ unit, isDark, isOpen, onToggle }: { unit: UnitSpec; isDark: boolean; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-all duration-500 
      ${isOpen ? "border-[#2DD4BF]/40 shadow-2xl" : "border-black/5"} 
      ${isDark 
        ? (isOpen ? "bg-[#0B1F3A]/90 border-white/10" : "bg-[#0B1F3A]/40 border-white/10") 
        : (isOpen ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200")}`}>
      
      <button onClick={onToggle} className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors 
        ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
        <div className="min-w-0">
          <p className={`text-sm font-black italic tracking-wider uppercase truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{unit.model}</p>
          <div className="flex items-center gap-2 mt-1.5">
             <span className="text-[9px] font-black bg-[#2DD4BF]/20 text-[#2DD4BF] px-2 py-0.5 rounded uppercase">{unit.capacity_tr} TR</span>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{unit.voltage} | {unit.phase === "Single Phase" ? "1P" : "3P"}</span>
          </div>
        </div>
        <div className="text-right flex items-center gap-5">
          <div className="hidden sm:block text-right">
            <p className={`text-xl font-black leading-none ${isDark ? 'text-[#2DD4BF]' : 'text-[#0D9488]'}`}>{unit.power_input_kw}<span className="text-[10px] ml-1">kW</span></p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Power</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-500 ${isOpen ? "rotate-180 text-[#2DD4BF]" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-6 pt-0 animate-in slide-in-from-top-3">
          <InfoBox label="Power Input" value={`${unit.power_input_kw} kW`} icon={<Zap className="w-3 h-3 text-teal-500" />} isDark={isDark} />
          <InfoBox label="Running" value={`${unit.running_current_a}A`} icon={<Activity className="w-3 h-3 text-teal-500" />} isDark={isDark} />
          <InfoBox label="MCA" value={`${unit.mca}A`} icon={<Zap className="w-3 h-3 text-teal-500" />} isDark={isDark} />
          <InfoBox label="Breaker" value={`${unit.mop}A`} icon={<Shield className="w-3 h-3 text-teal-500" />} isDark={isDark} />
          <InfoBox label="Freq" value={unit.frequency} icon={<Cpu className="w-3 h-3 text-teal-500" />} isDark={isDark} />
        </div>
      )}
    </div>
  );
}

function ChillerModelRow({ unit, isDark, isOpen, onToggle }: { unit: ChillerSpec; isDark: boolean; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-all duration-500 
      ${isOpen ? "border-[#2DD4BF]/40 shadow-2xl" : "border-black/5"} 
      ${isDark 
        ? (isOpen ? "bg-[#0B1F3A]/90 border-white/10" : "bg-[#0B1F3A]/40 border-white/10") 
        : (isOpen ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200")}`}>
      
      <button onClick={onToggle} className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors 
        ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
        <div className="min-w-0">
          <p className={`text-sm font-black italic tracking-wider uppercase truncate ${isDark ? 'text-[#2DD4BF]' : 'text-[#0D9488]'}`}>{unit.model}</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-tighter">
            {unit.capacity_tr} TR • {unit.compressor_type} • {unit.chiller_type}
          </p>
        </div>
        <div className="text-right flex items-center gap-5">
          <div>
            <p className={`text-xl font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>{unit.power_input_kw}<span className="text-[10px] ml-1">kW</span></p>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Comp Power</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-500 ${isOpen ? "rotate-180 text-[#2DD4BF]" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="space-y-4 p-6 pt-0 animate-in slide-in-from-top-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoBox label="Power Input" value={`${unit.power_input_kw} kW`} icon={<Zap className="w-3 h-3 text-teal-500" />} isDark={isDark} />
            <InfoBox label="FLA Amps" value={`${unit.full_load_current_a}A`} icon={<Activity className="w-3 h-3 text-teal-500" />} isDark={isDark} />
            <InfoBox label="LRA Amps" value={unit.starting_current_a ? `${unit.starting_current_a}A` : "Soft Start"} icon={<Zap className="w-3 h-3 text-teal-500" />} isDark={isDark} />
            <InfoBox label="EER/COP" value={String(unit.cop)} icon={<Activity className="w-3 h-3 text-teal-500" />} isDark={isDark} />
            <InfoBox label="Supply" value={unit.voltage} icon={<Cpu className="w-3 h-3 text-teal-500" />} isDark={isDark} />
            <InfoBox label="MCA" value={`${unit.mca}A`} icon={<Shield className="w-3 h-3 text-teal-500" />} isDark={isDark} />
            <InfoBox label="Breaker" value={`${unit.mop}A`} icon={<Shield className="w-3 h-3 text-teal-500" />} isDark={isDark} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, icon, isDark }: { label: string; value: string; icon: React.ReactNode; isDark: boolean }) {
  return (
    <div className={`rounded-xl border p-4 transition-all group ${isDark ? 'bg-black/40 border-white/5 hover:border-[#2DD4BF]/20' : 'bg-white border-slate-100 shadow-sm hover:border-teal-200'}`}>
      <div className="flex items-center gap-2 mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
        {icon}
        <p className="text-[8px] uppercase tracking-[0.2em] font-black text-slate-400">{label}</p>
      </div>
      <p className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}