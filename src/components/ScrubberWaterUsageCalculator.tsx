// Scrubber Water Usage Calculator
// Note: This component uses Tailwind CSS utility classes for styling.
// Make sure Tailwind CSS is set up in this project (see integration notes).
import { useEffect, useMemo, useState } from "react";

type FlowUnit = "m3h" | "cfm";
type ScrubberMode = "wet" | "dry";
type InfoTab = "logic" | "standards";
type AppTheme = "light" | "dark";

type InputState = {
  mode: ScrubberMode;
  gasFlow: string;
  flowUnit: FlowUnit;
  liquidGasRatio: string;
  operatingHours: string;
  recirculation: string;
  evaporationLoss: string;
  blowdownLoss: string;
  driftLoss: string;
  waterRate: string;
  workingDays: string;
  dryInletTemp: string;
  dryOutletTemp: string;
  dryEvapEfficiency: string;
  dryProcessWaterLPH: string;
  dryWashdownLiters: string;
};

type WetPreset = {
  name: string;
  note: string;
  liquidGasRatio: number;
  recirculation: number;
  evaporationLoss: number;
  blowdownLoss: number;
  driftLoss: number;
};

type DryPreset = {
  name: string;
  note: string;
  inletTemp: number;
  outletTemp: number;
  evapEfficiency: number;
  processWaterLPH: number;
  washdownLiters: number;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  mode: ScrubberMode;
  dailyKL: number;
  makeupM3H: number;
  sprayM3H: number;
  inputLabel: string;
};

const CFM_TO_M3H = 1.69901082;
const STORAGE_KEY = "scrubber-water-inputs";
const HISTORY_KEY = "scrubber-water-history";

const defaultInputs: InputState = {
  mode: "wet",
  gasFlow: "12000",
  flowUnit: "m3h",
  liquidGasRatio: "1.4",
  operatingHours: "16",
  recirculation: "92",
  evaporationLoss: "1.2",
  blowdownLoss: "2.5",
  driftLoss: "0.2",
  waterRate: "80",
  workingDays: "26",
  dryInletTemp: "160",
  dryOutletTemp: "95",
  dryEvapEfficiency: "82",
  dryProcessWaterLPH: "0",
  dryWashdownLiters: "150",
};

const wetPresets: WetPreset[] = [
  {
    name: "Packed bed",
    note: "Fume or gas absorption",
    liquidGasRatio: 1.6,
    recirculation: 94,
    evaporationLoss: 1,
    blowdownLoss: 2,
    driftLoss: 0.15,
  },
  {
    name: "Dust scrubber",
    note: "Higher slurry purge",
    liquidGasRatio: 2.2,
    recirculation: 88,
    evaporationLoss: 1.5,
    blowdownLoss: 4,
    driftLoss: 0.25,
  },
  {
    name: "Light duty",
    note: "Small process vent",
    liquidGasRatio: 0.9,
    recirculation: 96,
    evaporationLoss: 0.8,
    blowdownLoss: 1.2,
    driftLoss: 0.1,
  },
];

const dryPresets: DryPreset[] = [
  {
    name: "True dry",
    note: "Bag filter or DSI, no continuous water",
    inletTemp: 90,
    outletTemp: 90,
    evapEfficiency: 80,
    processWaterLPH: 0,
    washdownLiters: 50,
  },
  {
    name: "Semi-dry absorber",
    note: "Slurry spray and evaporative cooling",
    inletTemp: 180,
    outletTemp: 95,
    evapEfficiency: 82,
    processWaterLPH: 120,
    washdownLiters: 150,
  },
  {
    name: "Hot gas conditioning",
    note: "Water injection before dry collector",
    inletTemp: 220,
    outletTemp: 120,
    evapEfficiency: 75,
    processWaterLPH: 0,
    washdownLiters: 200,
  },
];

// Reference notes shown on the "Standards & references" tab.
// These describe the typical/published ranges the built-in presets and
// default values are drawn from. They are planning guides, not a
// substitute for vendor data or a site-specific engineering study.
type ReferenceNote = {
  topic: string;
  typicalRange: string;
  source: string;
};

const wetReferenceNotes: ReferenceNote[] = [
  {
    topic: "Liquid-to-gas (L/G) ratio",
    typicalRange: "Packed bed / venturi: roughly 4-15 GPM per 1,000 ACFM (about 0.5-2.0 L/m3). Higher-loading dust scrubbers commonly run 1.5-3 L/m3.",
    source: "General air-pollution-control design practice (e.g. EPA Air Pollution Control Technology Fact Sheets, Perry's Chemical Engineers' Handbook, and standard wet-scrubber vendor guides). Convert GPM/1,000 CFM to L/m3 by multiplying by 0.134.",
  },
  {
    topic: "Recirculation rate",
    typicalRange: "88-96% of spray water is typically recirculated in a well-run packed tower or spray scrubber; the remainder leaves as evaporation, blowdown and drift.",
    source: "Common industrial wet-scrubber and cooling-water system operating practice; the same water-balance logic used in cooling tower design guides (e.g. CTI water balance references).",
  },
  {
    topic: "Evaporation loss",
    typicalRange: "Roughly 0.8-2% of circulated water per pass, driven mainly by hot inlet gas and the wet-bulb depression across the scrubber.",
    source: "Standard evaporative water-balance estimate, analogous to the approximately 1% evaporation loss per 7 degC of cooling used in cooling tower sizing (CTI / ASHRAE Fundamentals Handbook, HVAC Applications).",
  },
  {
    topic: "Blowdown / purge",
    typicalRange: "1-4% of circulated water, set to hold dissolved solids (TDS) or slurry solids within the scrubber's design limit.",
    source: "Water treatment cycles-of-concentration practice used across scrubbers and cooling towers; final value should follow the plant's water-quality/TDS target, not this default alone.",
  },
  {
    topic: "Drift / carryover",
    typicalRange: "Well-designed mist eliminators typically hold drift below 0.1-0.3% of circulated flow.",
    source: "Mist-eliminator manufacturer performance data and drift-test methods such as CTI ATC-105, which are also referenced for wet scrubbers with similar eliminator designs.",
  },
];

const dryReferenceNotes: ReferenceNote[] = [
  {
    topic: "Evaporation efficiency",
    typicalRange: "Semi-dry / spray-dryer absorbers typically achieve 70-85% evaporation efficiency; well-atomized systems can approach 90%.",
    source: "Spray-dryer-absorber and dry-scrubber design references (e.g. EPA APTI air pollution control course material and general dry FGD/DSI vendor design guides).",
  },
  {
    topic: "Latent heat of water",
    typicalRange: "2,257 kJ/kg is used to convert sensible heat removed from the gas into an equivalent evaporated water mass.",
    source: "Standard thermodynamic property of water at approximately 100 degC / atmospheric pressure (widely tabulated, e.g. ASHRAE Fundamentals Handbook, NIST/steam tables).",
  },
  {
    topic: "Process / slurry water",
    typicalRange: "0 L/h for a true dry system (bag filter or dry sorbent injection); 50-200 L/h is typical for semi-dry reagent slurry or humidification duty.",
    source: "General semi-dry absorber and dry sorbent injection (DSI) system design practice.",
  },
  {
    topic: "Washdown water",
    typicalRange: "50-200 L/day is a common planning allowance for manual floor and duct washdown, depending on housekeeping frequency and duct size.",
    source: "Typical industrial housekeeping practice; site-specific washdown schedules should override this default.",
  },
];

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readStoredInputs(): InputState {
  const stored = readStorage<Partial<InputState>>(STORAGE_KEY, {});
  return { ...defaultInputs, ...stored };
}

function readHistory(): HistoryItem[] {
  const stored = readStorage<HistoryItem[]>(HISTORY_KEY, []);
  return Array.isArray(stored) ? stored.slice(0, 5) : [];
}

function parsePositive(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatNumber(value: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

function calculate(inputs: InputState) {
  const gasFlowInput = parsePositive(inputs.gasFlow);
  const gasFlowM3H = inputs.flowUnit === "cfm" ? gasFlowInput * CFM_TO_M3H : gasFlowInput;
  const liquidGasRatio = parsePositive(inputs.liquidGasRatio);
  const operatingHours = clamp(parsePositive(inputs.operatingHours), 0, 24);
  const workingDays = clamp(parsePositive(inputs.workingDays), 0, 31);
  const recirculation = clamp(parsePositive(inputs.recirculation), 0, 100);
  const evaporationLoss = clamp(parsePositive(inputs.evaporationLoss), 0, 100);
  const blowdownLoss = clamp(parsePositive(inputs.blowdownLoss), 0, 100);
  const driftLoss = clamp(parsePositive(inputs.driftLoss), 0, 100);
  const waterRate = parsePositive(inputs.waterRate);
  const dryInletTemp = parsePositive(inputs.dryInletTemp);
  const dryOutletTemp = parsePositive(inputs.dryOutletTemp);
  const dryDeltaTemp = Math.max(dryInletTemp - dryOutletTemp, 0);
  const dryEvapEfficiency = clamp(parsePositive(inputs.dryEvapEfficiency), 1, 100);
  const dryProcessWaterLPH = parsePositive(inputs.dryProcessWaterLPH);
  const dryWashdownLiters = parsePositive(inputs.dryWashdownLiters);

  const sprayLPH = gasFlowM3H * liquidGasRatio;
  const sprayM3H = sprayLPH / 1000;
  const sprayLPM = sprayLPH / 60;

  const nonRecoveredLPH = sprayLPH * ((100 - recirculation) / 100);
  const evaporationLPH = sprayLPH * (evaporationLoss / 100);
  const blowdownLPH = sprayLPH * (blowdownLoss / 100);
  const driftLPH = sprayLPH * (driftLoss / 100);
  const makeupLPH = nonRecoveredLPH + evaporationLPH + blowdownLPH + driftLPH;
  const makeupM3H = makeupLPH / 1000;
  const dailyLiters = makeupLPH * operatingHours;
  const dailyKL = dailyLiters / 1000;
  const monthlyKL = dailyKL * workingDays;
  const annualKL = monthlyKL * 12;
  const dailyCost = dailyKL * waterRate;
  const monthlyCost = monthlyKL * waterRate;
  const onceThroughLiters = sprayLPH * operatingHours;
  const savedPercent = onceThroughLiters > 0 ? clamp((1 - dailyLiters / onceThroughLiters) * 100, 0, 100) : 0;
  const freshFraction = sprayLPH > 0 ? makeupLPH / sprayLPH : 0;

  const dryHeatLoadKJH = gasFlowM3H * 1.2 * dryDeltaTemp;
  const dryEvaporationLPH = dryHeatLoadKJH > 0 ? dryHeatLoadKJH / 2257 / (dryEvapEfficiency / 100) : 0;
  const dryHourlyLPH = dryEvaporationLPH + dryProcessWaterLPH;
  const dryWashdownLPH = operatingHours > 0 ? dryWashdownLiters / operatingHours : 0;
  const dryMakeupLPH = dryHourlyLPH + dryWashdownLPH;
  const dryMakeupM3H = dryMakeupLPH / 1000;
  const dryDailyLiters = dryHourlyLPH * operatingHours + dryWashdownLiters;
  const dryDailyKL = dryDailyLiters / 1000;
  const dryMonthlyKL = dryDailyKL * workingDays;
  const dryAnnualKL = dryMonthlyKL * 12;
  const dryDailyCost = dryDailyKL * waterRate;
  const dryMonthlyCost = dryMonthlyKL * waterRate;
  const dryEvaporationShare = dryHourlyLPH > 0 ? clamp((dryEvaporationLPH / dryHourlyLPH) * 100, 0, 100) : 0;
  const isWetMode = inputs.mode === "wet";

  return {
    activeAnnualKL: isWetMode ? annualKL : dryAnnualKL,
    activeDailyCost: isWetMode ? dailyCost : dryDailyCost,
    activeDailyKL: isWetMode ? dailyKL : dryDailyKL,
    activeDailyLiters: isWetMode ? dailyLiters : dryDailyLiters,
    activeMakeupM3H: isWetMode ? makeupM3H : dryMakeupM3H,
    activeMonthlyCost: isWetMode ? monthlyCost : dryMonthlyCost,
    activeMonthlyKL: isWetMode ? monthlyKL : dryMonthlyKL,
    annualKL,
    blowdownLPH,
    dailyCost,
    dailyKL,
    dailyLiters,
    dryAnnualKL,
    dryDailyCost,
    dryDailyKL,
    dryDailyLiters,
    dryDeltaTemp,
    dryEvapEfficiency,
    dryEvaporationLPH,
    dryEvaporationShare,
    dryHeatLoadKJH,
    dryHourlyLPH,
    dryInletTemp,
    dryMakeupLPH,
    dryMakeupM3H,
    dryMonthlyCost,
    dryMonthlyKL,
    dryOutletTemp,
    dryProcessWaterLPH,
    dryWashdownLiters,
    dryWashdownLPH,
    driftLPH,
    evaporationLPH,
    freshFraction,
    gasFlowM3H,
    makeupLPH,
    makeupM3H,
    monthlyCost,
    monthlyKL,
    nonRecoveredLPH,
    onceThroughLiters,
    operatingHours,
    savedPercent,
    sprayLPH,
    sprayLPM,
    sprayM3H,
    waterRate,
    workingDays,
  };
}

function NumberField({
  hint,
  label,
  max,
  min = "0",
  onChange,
  step = "0.1",
  suffix,
  value,
  isDark,
}: {
  hint?: string;
  label: string;
  max?: string;
  min?: string;
  onChange: (value: string) => void;
  step?: string;
  suffix?: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <label className="group block space-y-2">
      <span className={`flex items-center justify-between gap-3 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
        {label}
        {suffix ? (
          <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>{suffix}</span>
        ) : null}
      </span>
      <input
        className={`h-12 w-full rounded-2xl border px-4 text-base font-semibold outline-none transition duration-200 focus:ring-4 ${
          isDark
            ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-cyan-400 focus:ring-cyan-400/10"
            : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-300 focus:border-cyan-500 focus:ring-cyan-100"
        }`}
        inputMode="decimal"
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        step={step}
        style={{ colorScheme: isDark ? "dark" : "light" }}
        type="number"
        value={value}
      />
      {hint ? <span className={`block text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-slate-500"}`}>{hint}</span> : null}
    </label>
  );
}

function LogoMark({ isDark }: { isDark: boolean }) {
  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-[1.35rem] shadow-lg shadow-cyan-900/20 ${isDark ? "bg-cyan-400 text-slate-950" : "bg-slate-950 text-cyan-200"}`}>
      <svg className="h-7 w-7" fill="none" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M9 5h14v5c0 3.2-2.4 5.5-5.1 8.1C15.2 20.7 13 23 13 27h-4c0-5.5 3.1-8.7 5.9-11.4C17.2 13.4 19 11.7 19 10V9H9V5Z" fill="currentColor" />
        <path d="M20 19c2.2 2 3.8 4.2 3.8 8h-4c0-2.2-.8-3.6-2.2-5l2.4-3Z" fill="currentColor" opacity="0.72" />
      </svg>
    </div>
  );
}

function ScrubberIllustration({ fillPercent, isDark }: { fillPercent: number; isDark: boolean }) {
  const waterHeight = `${clamp(fillPercent, 8, 92)}%`;

  return (
    <div className="relative mx-auto hidden h-[440px] w-full max-w-[360px] items-center justify-center lg:flex" aria-hidden="true">
      <div className={`absolute inset-x-8 bottom-12 h-5 rounded-full blur-md ${isDark ? "bg-black/40" : "bg-cyan-950/10"}`} />
      <div
        className={`absolute left-1/2 top-10 h-[355px] w-36 -translate-x-1/2 overflow-hidden rounded-[4rem] border shadow-2xl shadow-cyan-900/10 backdrop-blur ${
          isDark ? "border-white/15 bg-white/5" : "border-cyan-900/20 bg-white/55"
        }`}
      >
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cyan-500 via-sky-300 to-cyan-100 transition-all duration-700 ease-out"
          style={{ height: waterHeight }}
        />
        <div className="animate-water-sheen absolute inset-x-0 bottom-0 h-20 bg-white/25" />
        <div className={`absolute left-1/2 top-12 h-44 w-20 -translate-x-1/2 rounded-full border ${isDark ? "border-white/25" : "border-white/60"}`} />
        <div className={`absolute left-1/2 top-20 h-2 w-24 -translate-x-1/2 rounded-full ${isDark ? "bg-cyan-300/40" : "bg-cyan-900/50"}`} />
        <div className={`absolute left-1/2 top-32 h-2 w-24 -translate-x-1/2 rounded-full ${isDark ? "bg-cyan-300/30" : "bg-cyan-900/40"}`} />
        <div className="spray-dot left-8 top-24" />
        <div className="spray-dot left-16 top-32 delay-150" />
        <div className="spray-dot right-8 top-28 delay-300" />
        <div className="spray-dot right-14 top-44 delay-500" />
      </div>
      <div className={`absolute left-5 top-36 h-10 w-32 rounded-l-full border-y border-l ${isDark ? "border-white/15 bg-white/5" : "border-cyan-900/20 bg-white/45"}`} />
      <div className={`absolute right-5 top-20 h-10 w-32 rounded-r-full border-y border-r ${isDark ? "border-white/15 bg-white/5" : "border-cyan-900/20 bg-white/45"}`} />
      <div className={`absolute bottom-6 left-1/2 h-16 w-48 -translate-x-1/2 rounded-t-[3rem] border ${isDark ? "border-white/15 bg-white/5" : "border-cyan-900/20 bg-white/50"}`} />
      <div className="animate-drift absolute right-8 top-6 h-20 w-20 rounded-full bg-cyan-300/30 blur-2xl" />
    </div>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <span className="text-sm text-cyan-50/70">{label}</span>
      <span className="text-right text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

const FLOW_UNIT_OPTIONS: { value: FlowUnit; label: string }[] = [
  { value: "m3h", label: "m3/h" },
  { value: "cfm", label: "CFM" },
];

// Custom dropdown for the flow-unit selector.
// A native <select> hands its open dropdown list to the OS/browser to
// render, which ignores our dark-mode text colors in some WebViews
// (e.g. inside the Capacitor app) and shows unreadable white-on-white
// text. Building the list ourselves keeps every pixel under our own
// theme-aware styling on every platform.
function UnitDropdown({
  isDark,
  onChange,
  value,
}: {
  isDark: boolean;
  onChange: (value: FlowUnit) => void;
  value: FlowUnit;
}) {
  const [open, setOpen] = useState(false);
  const selected = FLOW_UNIT_OPTIONS.find((option) => option.value === value) ?? FLOW_UNIT_OPTIONS[0];

  return (
    <div className="relative block space-y-2">
      <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Unit</span>
      <button
        className={`flex h-12 w-full items-center justify-between rounded-2xl border px-3 text-sm font-semibold outline-none transition duration-200 focus:ring-4 ${
          isDark
            ? "border-white/10 bg-white/5 text-white focus:border-cyan-400 focus:ring-cyan-400/10"
            : "border-slate-200 bg-white text-slate-950 focus:border-cyan-500 focus:ring-cyan-100"
        }`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {selected.label}
        <svg
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${isDark ? "text-slate-400" : "text-slate-500"}`}
          fill="none"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border shadow-xl ${
              isDark ? "border-white/10 bg-[#0b2035] shadow-black/40" : "border-slate-200 bg-white shadow-slate-900/10"
            }`}
          >
            {FLOW_UNIT_OPTIONS.map((option) => {
              const active = option.value === value;
              return (
                <button
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition duration-150 ${
                    active
                      ? isDark
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-slate-950 text-white"
                      : isDark
                        ? "text-slate-200 hover:bg-white/10"
                        : "text-slate-800 hover:bg-cyan-50"
                  }`}
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ScrubberWaterUsageCalculator({ theme = "light" }: { theme?: AppTheme }) {
  const isDark = theme === "dark";
  const [inputs, setInputs] = useState<InputState>(() => readStoredInputs());
  const [history, setHistory] = useState<HistoryItem[]>(() => readHistory());
  const [copied, setCopied] = useState(false);
  const [infoTab, setInfoTab] = useState<InfoTab>("logic");

  const calculation = useMemo(() => calculate(inputs), [inputs]);
  const isWetMode = inputs.mode === "wet";
  const loadPercent = isWetMode
    ? calculation.onceThroughLiters > 0
      ? (calculation.dailyLiters / calculation.onceThroughLiters) * 100
      : 0
    : calculation.dryEvaporationShare;
  const resultBadge = isWetMode
    ? `${formatNumber(calculation.savedPercent, 0)}% less than once-through`
    : calculation.dryHourlyLPH > 0
      ? `${formatNumber(calculation.dryEvaporationShare, 0)}% evaporative water`
      : "No continuous water";

  const issues = useMemo(() => {
    const messages: string[] = [];
    if (calculation.gasFlowM3H <= 0) messages.push("Enter a gas flow value.");
    if (isWetMode && calculation.sprayLPH <= 0) messages.push("L/G ratio must be greater than zero for a wet scrubber.");
    if (!isWetMode && calculation.dryInletTemp < calculation.dryOutletTemp) messages.push("In dry mode, inlet temperature must be higher than the outlet target.");
    if (!isWetMode && calculation.dryEvapEfficiency <= 0) messages.push("Add an evaporation efficiency value.");
    if (calculation.operatingHours <= 0) messages.push("Add operating hours.");
    if (isWetMode && calculation.freshFraction > 1) messages.push("Loss percentages are too high; makeup water exceeds the spray flow.");
    return messages;
  }, [calculation, isWetMode]);

  const summaryText = useMemo(() => {
    if (!isWetMode) {
      return [
        "Dry Scrubber Water Use Estimate",
        `Gas flow: ${formatNumber(calculation.gasFlowM3H, 0)} m3/h`,
        `Temperature drop: ${formatNumber(calculation.dryDeltaTemp, 1)} C`,
        `Evaporative/quench water: ${formatNumber(calculation.dryEvaporationLPH, 1)} L/h`,
        `Process/slurry water: ${formatNumber(calculation.dryProcessWaterLPH, 1)} L/h`,
        `Washdown water: ${formatNumber(calculation.dryWashdownLiters, 1)} L/day`,
        `Daily use: ${formatNumber(calculation.activeDailyKL, 2)} KL/day`,
        `Monthly use: ${formatNumber(calculation.activeMonthlyKL, 1)} KL/month`,
        `Estimated cost: Rs ${formatNumber(calculation.activeMonthlyCost, 0)}/month`,
      ].join("\n");
    }

    return [
      "Wet Scrubber Water Use Estimate",
      `Gas flow: ${formatNumber(calculation.gasFlowM3H, 0)} m3/h`,
      `Spray circulation: ${formatNumber(calculation.sprayM3H, 2)} m3/h (${formatNumber(calculation.sprayLPM, 1)} LPM)`,
      `Fresh makeup: ${formatNumber(calculation.makeupM3H, 2)} m3/h`,
      `Daily use: ${formatNumber(calculation.dailyKL, 2)} KL/day for ${formatNumber(calculation.operatingHours, 1)} hours`,
      `Monthly use: ${formatNumber(calculation.monthlyKL, 1)} KL/month`,
      `Estimated cost: Rs ${formatNumber(calculation.monthlyCost, 0)}/month`,
    ].join("\n");
  }, [calculation, isWetMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    }
  }, [inputs]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [history]);

  function updateInput<K extends keyof InputState>(key: K, value: InputState[K]) {
    setInputs((current) => ({ ...current, [key]: value }));
  }

  function applyWetPreset(preset: WetPreset) {
    setInputs((current) => ({
      ...current,
      mode: "wet",
      blowdownLoss: String(preset.blowdownLoss),
      driftLoss: String(preset.driftLoss),
      evaporationLoss: String(preset.evaporationLoss),
      liquidGasRatio: String(preset.liquidGasRatio),
      recirculation: String(preset.recirculation),
    }));
  }

  function applyDryPreset(preset: DryPreset) {
    setInputs((current) => ({
      ...current,
      mode: "dry",
      dryEvapEfficiency: String(preset.evapEfficiency),
      dryInletTemp: String(preset.inletTemp),
      dryOutletTemp: String(preset.outletTemp),
      dryProcessWaterLPH: String(preset.processWaterLPH),
      dryWashdownLiters: String(preset.washdownLiters),
    }));
  }

  function isWetPresetActive(preset: WetPreset) {
    return (
      parsePositive(inputs.liquidGasRatio) === preset.liquidGasRatio &&
      parsePositive(inputs.recirculation) === preset.recirculation &&
      parsePositive(inputs.evaporationLoss) === preset.evaporationLoss &&
      parsePositive(inputs.blowdownLoss) === preset.blowdownLoss &&
      parsePositive(inputs.driftLoss) === preset.driftLoss
    );
  }

  function isDryPresetActive(preset: DryPreset) {
    return (
      parsePositive(inputs.dryInletTemp) === preset.inletTemp &&
      parsePositive(inputs.dryOutletTemp) === preset.outletTemp &&
      parsePositive(inputs.dryEvapEfficiency) === preset.evapEfficiency &&
      parsePositive(inputs.dryProcessWaterLPH) === preset.processWaterLPH &&
      parsePositive(inputs.dryWashdownLiters) === preset.washdownLiters
    );
  }

  function resetInputs() {
    setInputs(defaultInputs);
  }

  async function copySummary() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  function saveRun() {
    const now = new Date();
    const item: HistoryItem = {
      createdAt: now.toISOString(),
      dailyKL: calculation.activeDailyKL,
      id: `${now.getTime()}`,
      inputLabel: isWetMode
        ? `Wet: ${formatNumber(calculation.gasFlowM3H, 0)} m3/h, ${inputs.liquidGasRatio || "0"} L/m3`
        : `Dry: ${formatNumber(calculation.gasFlowM3H, 0)} m3/h, ${formatNumber(calculation.dryDeltaTemp, 0)} C drop`,
      makeupM3H: calculation.activeMakeupM3H,
      mode: inputs.mode,
      sprayM3H: isWetMode ? calculation.sprayM3H : calculation.dryHourlyLPH / 1000,
    };
    setHistory((current) => [item, ...current].slice(0, 5));
  }

  function clearHistory() {
    setHistory([]);
  }

  const activeReferenceNotes = isWetMode ? wetReferenceNotes : dryReferenceNotes;

  return (
    <div
      className={`safe-shell relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8 ${
        isDark ? "bg-[#04121f] text-slate-100" : "bg-[#edf9fb] text-slate-950"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`animate-drift absolute -left-20 top-10 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-cyan-500/10" : "bg-cyan-200/55"}`} />
        <div className={`animate-drift-reverse absolute right-[-6rem] top-44 h-96 w-96 rounded-full blur-3xl ${isDark ? "bg-sky-500/10" : "bg-sky-300/40"}`} />
        <div className={`absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t to-transparent ${isDark ? "from-cyan-500/10" : "from-cyan-100/70"}`} />
      </div>

      <main className="relative mx-auto max-w-7xl">
        <header className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            <LogoMark isDark={isDark} />
            <div>
              <p className={`text-sm font-semibold uppercase tracking-[0.28em] ${isDark ? "text-cyan-300" : "text-cyan-800"}`}>ScrubCalc</p>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>React + Vite + Capacitor ready</p>
            </div>
          </div>
          <button
            className={`hidden rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur transition duration-200 sm:inline-flex ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400 hover:text-cyan-300"
                : "border-cyan-900/15 bg-white/60 text-slate-700 hover:border-cyan-500 hover:text-cyan-800"
            }`}
            onClick={resetInputs}
            type="button"
          >
            Reset defaults
          </button>
        </header>

        <section className="grid min-h-[calc(100vh-92px)] items-center gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-10">
          <div className="space-y-8">
            <div className="max-w-xl space-y-5">
              <p className={`text-sm font-semibold uppercase tracking-[0.34em] ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
                Wet and dry scrubber water calculation tool
              </p>
              <h1 className={`text-5xl font-black tracking-[-0.08em] sm:text-6xl lg:text-7xl ${isDark ? "text-white" : "text-slate-950"}`}>ScrubCalc</h1>
              <p className={`max-w-lg text-lg leading-8 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Calculate the spray loop and losses for a wet scrubber. For a dry or semi-dry scrubber, estimate gas cooling, slurry/process water and washdown water.
              </p>
            </div>

            <div className={`flex flex-col gap-3 text-sm sm:flex-row sm:items-center ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              <a
                className={`inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold shadow-xl shadow-cyan-950/15 transition duration-200 hover:-translate-y-0.5 ${
                  isDark ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300" : "bg-slate-950 text-white hover:bg-cyan-900"
                }`}
                href="#calculator"
              >
                Start calculation
              </a>
              <span className="leading-6">Wet mode uses the L/G ratio; dry mode estimates evaporation water from the temperature drop.</span>
            </div>

            <ScrubberIllustration fillPercent={loadPercent} isDark={isDark} />
          </div>

          <section
            className={`rounded-[2rem] border p-4 shadow-2xl shadow-cyan-950/10 backdrop-blur sm:p-6 ${
              isDark ? "border-white/10 bg-white/[0.04]" : "border-white/70 bg-white/85"
            }`}
            id="calculator"
          >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>Live calculator</p>
                <h2 className={`mt-2 text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
                  {isWetMode ? "Wet scrubber estimate" : "Dry scrubber estimate"}
                </h2>
              </div>
              <button
                className={`inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition duration-200 sm:hidden ${
                  isDark ? "border-white/10 text-slate-300 hover:border-cyan-400 hover:text-cyan-300" : "border-slate-200 text-slate-600 hover:border-cyan-400 hover:text-cyan-800"
                }`}
                onClick={resetInputs}
                type="button"
              >
                Reset defaults
              </button>
            </div>

            <div className={`mb-5 grid grid-cols-2 gap-2 rounded-2xl p-1 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
              <button
                className={`h-11 rounded-[0.9rem] text-sm font-bold transition duration-200 ${
                  isWetMode
                    ? isDark
                      ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/15"
                      : "bg-slate-950 text-white shadow-lg shadow-cyan-950/15"
                    : isDark
                      ? "text-slate-400 hover:text-cyan-300"
                      : "text-slate-600 hover:text-cyan-800"
                }`}
                onClick={() => updateInput("mode", "wet")}
                type="button"
              >
                Wet scrubber
              </button>
              <button
                className={`h-11 rounded-[0.9rem] text-sm font-bold transition duration-200 ${
                  !isWetMode
                    ? isDark
                      ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/15"
                      : "bg-slate-950 text-white shadow-lg shadow-cyan-950/15"
                    : isDark
                      ? "text-slate-400 hover:text-cyan-300"
                      : "text-slate-600 hover:text-cyan-800"
                }`}
                onClick={() => updateInput("mode", "dry")}
                type="button"
              >
                Dry / semi-dry
              </button>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {isWetMode
                ? wetPresets.map((preset) => {
                    const active = isWetPresetActive(preset);
                    return (
                      <button
                        className={`relative rounded-2xl border px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-900/10 ${
                          active
                            ? isDark
                              ? "border-cyan-300 bg-cyan-400 shadow-lg shadow-cyan-900/15"
                              : "border-slate-950 bg-slate-950 shadow-lg shadow-cyan-900/15"
                            : isDark
                              ? "border-white/10 bg-white/[0.03] hover:border-cyan-400/60"
                              : "border-slate-200 bg-white hover:border-cyan-400"
                        }`}
                        key={preset.name}
                        onClick={() => applyWetPreset(preset)}
                        type="button"
                      >
                        {active ? (
                          <span
                            className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
                              isDark ? "bg-slate-950 text-cyan-300" : "bg-cyan-300 text-slate-950"
                            }`}
                          >
                            &#10003;
                          </span>
                        ) : null}
                        <span
                          className={`block text-sm font-bold ${
                            active ? (isDark ? "text-slate-950" : "text-white") : isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {preset.name}
                        </span>
                        <span
                          className={`mt-1 block text-xs leading-5 ${
                            active ? (isDark ? "text-slate-900/70" : "text-cyan-100/80") : isDark ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          {preset.note}
                        </span>
                      </button>
                    );
                  })
                : dryPresets.map((preset) => {
                    const active = isDryPresetActive(preset);
                    return (
                      <button
                        className={`relative rounded-2xl border px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-900/10 ${
                          active
                            ? isDark
                              ? "border-cyan-300 bg-cyan-400 shadow-lg shadow-cyan-900/15"
                              : "border-slate-950 bg-slate-950 shadow-lg shadow-cyan-900/15"
                            : isDark
                              ? "border-white/10 bg-white/[0.03] hover:border-cyan-400/60"
                              : "border-slate-200 bg-white hover:border-cyan-400"
                        }`}
                        key={preset.name}
                        onClick={() => applyDryPreset(preset)}
                        type="button"
                      >
                        {active ? (
                          <span
                            className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
                              isDark ? "bg-slate-950 text-cyan-300" : "bg-cyan-300 text-slate-950"
                            }`}
                          >
                            &#10003;
                          </span>
                        ) : null}
                        <span
                          className={`block text-sm font-bold ${
                            active ? (isDark ? "text-slate-950" : "text-white") : isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {preset.name}
                        </span>
                        <span
                          className={`mt-1 block text-xs leading-5 ${
                            active ? (isDark ? "text-slate-900/70" : "text-cyan-100/80") : isDark ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          {preset.note}
                        </span>
                      </button>
                    );
                  })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid grid-cols-[1fr_112px] items-start gap-3 sm:col-span-2">
                <NumberField
                  hint="Actual exhaust or process gas flow. Choosing CFM automatically converts to m3/h."
                  label="Gas flow"
                  onChange={(value) => updateInput("gasFlow", value)}
                  step="1"
                  value={inputs.gasFlow}
                  isDark={isDark}
                />
                <UnitDropdown isDark={isDark} onChange={(value) => updateInput("flowUnit", value)} value={inputs.flowUnit} />
              </div>

              <NumberField
                hint="Daily plant running time."
                label="Operating hours"
                max="24"
                onChange={(value) => updateInput("operatingHours", value)}
                step="0.5"
                suffix="hr/day"
                value={inputs.operatingHours}
                isDark={isDark}
              />
              {isWetMode ? (
                <>
                  <NumberField
                    hint="Liters of scrubbing liquid per m3 of gas. To convert GPM/1,000 CFM to L/m3, multiply by 0.134."
                    label="L/G ratio"
                    onChange={(value) => updateInput("liquidGasRatio", value)}
                    suffix="L/m3"
                    value={inputs.liquidGasRatio}
                    isDark={isDark}
                  />
                  <NumberField
                    hint="Percentage of water reused back into the loop."
                    label="Recirculation"
                    max="100"
                    onChange={(value) => updateInput("recirculation", value)}
                    suffix="%"
                    value={inputs.recirculation}
                    isDark={isDark}
                  />
                  <NumberField
                    hint="Expected loss due to heat and gas saturation."
                    label="Evaporation loss"
                    max="100"
                    onChange={(value) => updateInput("evaporationLoss", value)}
                    suffix="%"
                    value={inputs.evaporationLoss}
                    isDark={isDark}
                  />
                  <NumberField
                    hint="Purge water for TDS/sludge control."
                    label="Blowdown / purge"
                    max="100"
                    onChange={(value) => updateInput("blowdownLoss", value)}
                    suffix="%"
                    value={inputs.blowdownLoss}
                    isDark={isDark}
                  />
                  <NumberField
                    hint="Carryover estimate after the mist eliminator."
                    label="Drift / carryover"
                    max="100"
                    onChange={(value) => updateInput("driftLoss", value)}
                    suffix="%"
                    value={inputs.driftLoss}
                    isDark={isDark}
                  />
                </>
              ) : (
                <>
                  <NumberField
                    hint="Gas temperature before the collector in a dry scrubber or gas conditioner."
                    label="Inlet gas temp"
                    onChange={(value) => updateInput("dryInletTemp", value)}
                    step="1"
                    suffix="C"
                    value={inputs.dryInletTemp}
                    isDark={isDark}
                  />
                  <NumberField
                    hint="Target outlet temperature. Keep equal to inlet for a true dry case."
                    label="Outlet target temp"
                    onChange={(value) => updateInput("dryOutletTemp", value)}
                    step="1"
                    suffix="C"
                    value={inputs.dryOutletTemp}
                    isDark={isDark}
                  />
                  <NumberField
                    hint="Effective evaporation efficiency of the nozzle/atomization."
                    label="Evaporation efficiency"
                    max="100"
                    onChange={(value) => updateInput("dryEvapEfficiency", value)}
                    suffix="%"
                    value={inputs.dryEvapEfficiency}
                    isDark={isDark}
                  />
                  <NumberField
                    hint="Semi-dry reagent slurry, humidification or conditioning water. Keep 0 for true dry."
                    label="Process / slurry water"
                    onChange={(value) => updateInput("dryProcessWaterLPH", value)}
                    step="1"
                    suffix="L/h"
                    value={inputs.dryProcessWaterLPH}
                    isDark={isDark}
                  />
                  <NumberField
                    hint="Daily manual cleaning, floor wash or duct wash water."
                    label="Washdown water"
                    onChange={(value) => updateInput("dryWashdownLiters", value)}
                    step="1"
                    suffix="L/day"
                    value={inputs.dryWashdownLiters}
                    isDark={isDark}
                  />
                </>
              )}
              <NumberField
                hint="Rs per KL. Cost estimate is optional."
                label="Water rate"
                onChange={(value) => updateInput("waterRate", value)}
                step="1"
                suffix="Rs/KL"
                value={inputs.waterRate}
                isDark={isDark}
              />
              <NumberField
                hint="For monthly usage and cost."
                label="Working days"
                max="31"
                onChange={(value) => updateInput("workingDays", value)}
                step="1"
                suffix="days"
                value={inputs.workingDays}
                isDark={isDark}
              />
            </div>

            {issues.length > 0 ? (
              <div
                className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${
                  isDark ? "border-amber-400/30 bg-amber-400/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-900"
                }`}
              >
                {issues.join(" ")}
              </div>
            ) : null}

            <div className="mt-6 rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/15">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
                {isWetMode ? "Estimated fresh makeup" : "Estimated water required"}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-4xl font-black tracking-[-0.05em] sm:text-5xl">{formatNumber(calculation.activeDailyKL, 2)} KL</p>
                  <p className="mt-1 text-sm text-cyan-50/70">per day at {formatNumber(calculation.operatingHours, 1)} operating hours</p>
                </div>
                <div className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                  {resultBadge}
                </div>
              </div>

              <div className="mt-5 grid gap-x-8 sm:grid-cols-2">
                {isWetMode ? (
                  <>
                    <ResultLine label="Spray circulation" value={`${formatNumber(calculation.sprayM3H, 2)} m3/h`} />
                    <ResultLine label="Spray flow" value={`${formatNumber(calculation.sprayLPM, 1)} LPM`} />
                    <ResultLine label="Fresh makeup" value={`${formatNumber(calculation.makeupM3H, 2)} m3/h`} />
                  </>
                ) : (
                  <>
                    <ResultLine label="Evaporation / quench" value={`${formatNumber(calculation.dryEvaporationLPH, 1)} L/h`} />
                    <ResultLine label="Process / slurry water" value={`${formatNumber(calculation.dryProcessWaterLPH, 1)} L/h`} />
                    <ResultLine label="Average makeup" value={`${formatNumber(calculation.dryMakeupM3H, 2)} m3/h`} />
                  </>
                )}
                <ResultLine label="Monthly water" value={`${formatNumber(calculation.activeMonthlyKL, 1)} KL`} />
                <ResultLine label="Monthly cost" value={`Rs ${formatNumber(calculation.activeMonthlyCost, 0)}`} />
                <ResultLine label="Annual water" value={`${formatNumber(calculation.activeAnnualKL, 0)} KL`} />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-100"
                  onClick={saveRun}
                  type="button"
                >
                  Save result
                </button>
                <button
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={typeof navigator === "undefined" || !navigator.clipboard}
                  onClick={copySummary}
                  type="button"
                >
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>
            </div>
          </section>
        </section>

        <section className="grid gap-6 pb-10 lg:grid-cols-[1fr_0.75fr]">
          <div
            className={`rounded-[2rem] border p-6 shadow-xl shadow-cyan-950/5 backdrop-blur ${
              isDark ? "border-white/10 bg-white/[0.04]" : "border-white/70 bg-white/75"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>Breakdown</p>
                <h2 className={`mt-2 text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
                  {infoTab === "logic" ? "Calculation logic" : "Standards & references"}
                </h2>
              </div>
              <div className={`flex gap-1 rounded-full p-1 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
                <button
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition duration-200 ${
                    infoTab === "logic"
                      ? isDark
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-slate-950 text-white"
                      : isDark
                        ? "text-slate-400 hover:text-cyan-300"
                        : "text-slate-600 hover:text-cyan-800"
                  }`}
                  onClick={() => setInfoTab("logic")}
                  type="button"
                >
                  Logic
                </button>
                <button
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition duration-200 ${
                    infoTab === "standards"
                      ? isDark
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-slate-950 text-white"
                      : isDark
                        ? "text-slate-400 hover:text-cyan-300"
                        : "text-slate-600 hover:text-cyan-800"
                  }`}
                  onClick={() => setInfoTab("standards")}
                  type="button"
                >
                  Standards
                </button>
              </div>
            </div>

            {infoTab === "logic" ? (
              <div className={`mt-5 space-y-4 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {isWetMode ? (
                  <>
                    <p>
                      Spray circulation = gas flow in m3/h x L/G ratio. Fresh makeup = circulation x (percent not recirculated + evaporation + blowdown + drift).
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>Non-recovered water</p>
                        <p>{formatNumber(calculation.nonRecoveredLPH, 1)} L/h</p>
                      </div>
                      <div className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>Evaporation</p>
                        <p>{formatNumber(calculation.evaporationLPH, 1)} L/h</p>
                      </div>
                      <div className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>Blowdown / purge</p>
                        <p>{formatNumber(calculation.blowdownLPH, 1)} L/h</p>
                      </div>
                      <div className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>Drift / carryover</p>
                        <p>{formatNumber(calculation.driftLPH, 1)} L/h</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      A dry scrubber usually does not use water continuously. In semi-dry or hot gas conditioning, water use = gas heat removal / latent heat of water / evaporation efficiency, plus process slurry and washdown.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>Temperature drop</p>
                        <p>{formatNumber(calculation.dryDeltaTemp, 1)} C</p>
                      </div>
                      <div className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>Heat removed</p>
                        <p>{formatNumber(calculation.dryHeatLoadKJH, 0)} kJ/h</p>
                      </div>
                      <div className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>Evaporative water</p>
                        <p>{formatNumber(calculation.dryEvaporationLPH, 1)} L/h</p>
                      </div>
                      <div className={`rounded-2xl p-4 ${isDark ? "bg-white/5" : "bg-cyan-50"}`}>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>Washdown average</p>
                        <p>{formatNumber(calculation.dryWashdownLPH, 1)} L/h</p>
                      </div>
                    </div>
                  </>
                )}
                <p className={`text-xs leading-6 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  This is a planning estimate. For final design, verify inlet gas temperature, humidity, contaminant load, sump volume, TDS limit, pump curve, atomization and vendor data.
                </p>
              </div>
            ) : (
              <div className={`mt-5 space-y-3 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                <p className={`text-xs leading-6 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  These are typical planning ranges the {isWetMode ? "wet scrubber" : "dry scrubber"} presets and defaults are drawn from, with the general source for each. They are a starting point, not a substitute for vendor data or a site-specific engineering study.
                </p>
                {activeReferenceNotes.map((note) => (
                  <div key={note.topic} className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-cyan-50/60"}`}>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>{note.topic}</p>
                    <p className="mt-1">{note.typicalRange}</p>
                    <p className={`mt-2 text-xs ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>Source: {note.source}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={`rounded-[2rem] border p-6 shadow-xl shadow-cyan-950/5 backdrop-blur ${
              isDark ? "border-white/10 bg-white/[0.04]" : "border-white/70 bg-white/75"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>Saved runs</p>
                <h2 className={`mt-2 text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>Local history</h2>
              </div>
              {history.length > 0 ? (
                <button
                  className={`text-sm font-semibold transition ${isDark ? "text-slate-400 hover:text-cyan-300" : "text-slate-500 hover:text-cyan-800"}`}
                  onClick={clearHistory}
                  type="button"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              {history.length === 0 ? (
                <p
                  className={`rounded-2xl border border-dashed p-4 text-sm leading-6 ${
                    isDark ? "border-cyan-400/20 bg-white/[0.03] text-slate-300" : "border-cyan-200 bg-cyan-50/70 text-slate-600"
                  }`}
                >
                  Press Save result. The last 5 estimates are stored in local storage on this device, so they will also be available offline in the Capacitor app.
                </p>
              ) : (
                history.map((item) => (
                  <div
                    className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"}`}
                    key={item.id}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className={`font-semibold ${isDark ? "text-white" : "text-slate-950"}`}>{formatNumber(item.dailyKL, 2)} KL/day</p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>{new Date(item.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.inputLabel}</p>
                    <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
                      {item.mode === "dry"
                        ? `Avg makeup ${formatNumber(item.makeupM3H, 2)} m3/h | Injection ${formatNumber(item.sprayM3H, 2)} m3/h`
                        : `Makeup ${formatNumber(item.makeupM3H, 2)} m3/h | Spray ${formatNumber(item.sprayM3H, 2)} m3/h`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ScrubberWaterUsageCalculator;