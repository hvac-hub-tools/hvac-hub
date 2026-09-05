import { useEffect, useMemo, useState } from "react";
import { type DXCategory, type UnitSpec, dxData } from "../data/hvacData";
import { Cpu, Activity, Zap, Info, Shield, LayoutGrid, ChevronDown, AlertCircle } from 'lucide-react';

type DXSystemKey = "split" | "cassette" | "ductable" | "package";

interface DXSystem {
  key: DXSystemKey;
  label: string;
  outdoor: DXCategory[];
}

const dxSystems: DXSystem[] = [
  {
    key: "split",
    label: "Split AC",
    outdoor: dxData.filter((cat) => cat.type.includes("Split AC") && cat.type.includes("Outdoor")),
  },
  {
    key: "cassette",
    label: "Cassette AC",
    outdoor: dxData.filter((cat) => cat.type.includes("Cassette AC")),
  },
  {
    key: "ductable",
    label: "Ductable DX",
    outdoor: dxData.filter((cat) => cat.type.includes("Ductable")),
  },
  {
    key: "package",
    label: "Package Unit",
    outdoor: dxData.filter((cat) => cat.type.includes("Package Unit")),
  },
];

// ✅ Theme prop add kiya gaya hai
export default function DXSection({ theme }: { theme: string }) {
  const [system, setSystem] = useState<DXSystemKey>("split");
  const [unitType, setUnitType] = useState("");
  const [selectedTr, setSelectedTr] = useState("");
  const [openModel, setOpenModel] = useState<string | null>(null);

  const isDark = theme === 'dark';

  const selectedSystem = useMemo(
    () => dxSystems.find((item) => item.key === system) ?? dxSystems[0],
    [system],
  );

  const outdoorCategories = useMemo(() => selectedSystem.outdoor, [selectedSystem]);
  const unitTypes = useMemo(() => outdoorCategories.map((item) => item.type), [outdoorCategories]);

  const selectedCategory = useMemo(
    () => outdoorCategories.find((item) => item.type === unitType) ?? outdoorCategories[0],
    [outdoorCategories, unitType],
  );

  const trOptions = useMemo(() => {
    if (!selectedCategory) return [];
    return Array.from(new Set(selectedCategory.units.map((unit) => unit.capacity_tr))).sort((a, b) => a - b);
  }, [selectedCategory]);

  const filteredUnits = useMemo(() => {
    if (!selectedCategory || !selectedTr) return [];
    return selectedCategory.units.filter((unit) => unit.capacity_tr === Number(selectedTr));
  }, [selectedCategory, selectedTr]);

  useEffect(() => {
    setUnitType(unitTypes[0] ?? "");
    setOpenModel(null);
  }, [unitTypes]);

  useEffect(() => {
    const firstTr = trOptions[0];
    setSelectedTr(firstTr ? String(firstTr) : "");
    setOpenModel(null);
  }, [trOptions]);

  // ✅ Dynamic Theme Constants
  const cardBg = isDark 
    ? "bg-[#0B1F3A]/60 backdrop-blur-md border border-white/10" 
    : "bg-white border border-slate-200 shadow-sm";
  
  const accentTeal = "text-[#2DD4BF]";
  const accentTealBg = "bg-[#2DD4BF]/10";
  
  const activeBtn = isDark
    ? "border-[#2DD4BF] bg-[#2DD4BF]/20 text-[#2DD4BF] shadow-[0_0_15px_rgba(45,212,191,0.3)]"
    : "border-[#2DD4BF] bg-[#2DD4BF] text-white shadow-md";
    
  const inactiveBtn = isDark
    ? "border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10"
    : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100";

  const selectStyle = `w-full rounded-xl border px-3 py-3 text-sm font-medium outline-none transition-all cursor-pointer ${
    isDark 
      ? "border-white/10 bg-black/40 text-white focus:border-[#2DD4BF]" 
      : "border-slate-200 bg-white text-slate-700 focus:border-[#2DD4BF] shadow-sm"
  }`;

  return (
    <div className={`space-y-6 max-w-4xl mx-auto pb-10 px-4 transition-colors duration-300 ${isDark ? "text-white" : "text-slate-800"}`}>
      
      {/* HEADER */}
      <div className={`${cardBg} rounded-2xl p-6`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`${accentTealBg} p-2 rounded-lg`}>
            <LayoutGrid className={`w-5 h-5 ${accentTeal}`} />
          </div>
          <h2 className={`text-xl font-bold italic tracking-tight uppercase ${isDark ? "text-white" : "text-slate-800"}`}>DX Outdoor Selector</h2>
        </div>
        <p className="text-xs text-slate-400 font-medium">Select system and capacity to find Outdoor Unit (ODU) electrical details.</p>
      </div>

      {/* STEP 1: DX Type */}
      <div className={`${cardBg} rounded-2xl p-6`}>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
          <span className={`${accentTealBg} ${accentTeal} w-6 h-6 rounded-lg flex items-center justify-center font-black`}>01</span>
          Select Type of DX
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dxSystems.map((item) => (
            <button
              key={item.key}
              onClick={() => setSystem(item.key)}
              className={`p-3 rounded-xl border-2 text-center transition-all duration-300 font-bold text-sm ${system === item.key ? activeBtn : inactiveBtn}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2 & 3: Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
        <div className={`${cardBg} rounded-2xl p-6`}>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <Cpu className="w-3 h-3" /> 02: Unit Model
          </p>
          <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className={selectStyle}>
            {unitTypes.map((type) => <option key={type} value={type} className={isDark ? "bg-[#0B1F3A]" : "bg-white"}>{type}</option>)}
          </select>
        </div>

        <div className={`${cardBg} rounded-2xl p-6`}>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
            <Activity className="w-3 h-3" /> 03: Capacity (TR)
          </p>
          <select value={selectedTr} onChange={(e) => setSelectedTr(e.target.value)} className={selectStyle}>
            {trOptions.map((tr) => <option key={tr} value={String(tr)} className={isDark ? "bg-[#0B1F3A]" : "bg-white"}>{tr} TR</option>)}
          </select>
        </div>
      </div>

      {/* RESULTS AREA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filteredUnits.length} Matching ODU Models Found
           </p>
        </div>

        {filteredUnits.map((unit) => (
          <DxModelRow
            key={`${system}-${unit.model}`}
            unit={unit}
            isOpen={openModel === unit.model}
            onToggle={() => setOpenModel(openModel === unit.model ? null : unit.model)}
            theme={theme} // ✅ Prop pass kiya
          />
        ))}

        {filteredUnits.length === 0 && (
          <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
            <Info className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No matching outdoor unit available.</p>
          </div>
        )}
      </div>

      {/* IMPORTANT NOTE */}
      <div className={`rounded-2xl p-5 mt-6 border ${isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-100"}`}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-600 uppercase tracking-wide">Engineering Note</p>
            <p className={`text-xs mt-1 leading-relaxed ${isDark ? "text-amber-200/70" : "text-amber-700/80"}`}>
              "The main electrical power supply for DX Units (Split, Cassette, and Ductable) is always provided at the Outdoor Unit (ODU). The Indoor Unit receives its power from the outdoor section via an interconnecting cable."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DxModelRow({ unit, isOpen, onToggle, theme }: { unit: UnitSpec; isOpen: boolean; onToggle: () => void; theme: string }) {
  const isDark = theme === 'dark';
  const accentTeal = "text-[#2DD4BF]";
  
  return (
    <div className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
      isOpen 
        ? (isDark ? "border-[#2DD4BF]/50 bg-[#0B1F3A]/80 shadow-[0_0_20px_rgba(45,212,191,0.1)]" : "border-[#2DD4BF] bg-white shadow-md")
        : (isDark ? "border-white/10 bg-[#0B1F3A]/40" : "border-slate-200 bg-white shadow-sm")
    }`}>
      <button onClick={onToggle} className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}>
        <div className="min-w-0">
          <p className={`text-sm font-black italic tracking-wide truncate uppercase ${isDark ? "text-white" : "text-slate-800"}`}>{unit.model}</p>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{unit.capacity_tr} TR</span>
             <span className="w-1 h-1 rounded-full bg-slate-400"></span>
             <span className="text-[10px] font-bold text-[#2DD4BF]/80 uppercase tracking-tighter">Outdoor Unit</span>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <p className={`text-lg font-black ${accentTeal}`}>{unit.power_input_kw} <span className="text-[10px]">kW</span></p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Input</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#2DD4BF]" : ""}`} />
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-3 p-5 pt-0">
            <InfoItem label="Running Current" value={`${unit.running_current_a} A`} icon={<Activity className="w-3 h-3"/>} theme={theme} />
            <InfoItem label="Starting Current" value={unit.starting_current_a ? `${unit.starting_current_a} A` : "-"} icon={<Zap className="w-3 h-3"/>} theme={theme} />
            <InfoItem label="Supply" value={`${unit.phase === "Single Phase" ? "1P" : "3P"} | ${unit.voltage}`} icon={<CheckCircle2 className="w-3 h-3" stroke="#2DD4BF"/>} theme={theme} />
            <InfoItem label="Breaker Size" value={`${unit.mop} A`} icon={<Shield className="w-3 h-3"/>} theme={theme} />
            <div className="col-span-2">
               <InfoItem label="MCA (Wire Sizing)" value={`${unit.mca} A`} icon={<Zap className="w-3 h-3" stroke="#2DD4BF"/>} theme={theme} />
            </div>
          </div>
          {unit.notes && (
            <div className={`px-5 py-3 border-t ${isDark ? "bg-orange-400/10 border-orange-400/20 text-orange-300" : "bg-orange-50 border-orange-100 text-orange-700"}`}>
               <p className="text-[11px] italic font-medium flex items-center gap-2">
                 <Info className="w-3 h-3" /> {unit.notes}
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon, theme }: { label: string; value: string; icon: React.ReactNode; theme: string }) {
  const isDark = theme === 'dark';
  return (
    <div className={`rounded-xl border p-3 ${isDark ? "bg-black/40 border-white/5" : "bg-slate-50 border-slate-100"}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-slate-400">{icon}</span>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
      </div>
      <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{value}</p>
    </div>
  );
}

function CheckCircle2({ className, stroke = "currentColor" }: { className?: string, stroke?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}