import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Snowflake,
  Gauge,
  Settings2,
  Layers3,
  RotateCcw,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Droplets,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "../utils/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Data tables — gas_charging_for_vrv.xlsx ke anusar
// ─────────────────────────────────────────────────────────────────────────────
const PIPE_SIZES = [
  { label: '6.4mm  /  1/4"', factor: 0.022 },
  { label: '9.5mm  /  3/8"', factor: 0.059 },
  { label: '12.7mm /  1/2"', factor: 0.120 },
  { label: '15.9mm /  5/8"', factor: 0.180 },
  { label: '19.1mm /  3/4"', factor: 0.260 },
  { label: '22.2mm /  7/8"', factor: 0.370 },
];

const ODU_HP_ROWS = [
  { label: "5 HP", factor: 0, desc: "Small single-zone system" },
  { label: "8 – 12 HP", factor: 0.5, desc: "Compact multi-zone" },
  { label: "14 – 22 HP", factor: 1.0, desc: "Mid-range commercial" },
  { label: "24 – 30 HP", factor: 1.5, desc: "Large commercial" },
  { label: "32 – 38 HP", factor: 2.0, desc: "Extra large" },
  { label: "40 – 48 HP", factor: 2.5, desc: "Industrial scale" },
  { label: "50 – 54 HP", factor: 3.0, desc: "Maximum capacity" },
];

const INDOOR_CAP_ROWS = [
  { label: "5 – 54 HP, up to 100%", factor: 0, desc: "Standard load" },
  { label: "5 – 54 HP, 100 – 120%", factor: 0.5, desc: "Slight over-diversity" },
  { label: "5 – 32 HP, 120 – 130%", factor: 0.5, desc: "Higher diversity" },
  { label: "34 – 54 HP, 120 – 130%", factor: 1.0, desc: "Max over-diversity" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens
// ─────────────────────────────────────────────────────────────────────────────
const tokens = {
  // Brand
  brand: "from-sky-500 via-blue-500 to-indigo-600",
  brandGlow: "shadow-blue-500/30",

  // Page
  pageBg: "bg-gradient-to-br from-slate-50 via-white to-blue-50",
  darkPageBg: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",

  // Card surface
  card: "bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-xl shadow-slate-900/5",
  darkCard: "bg-slate-900/70 backdrop-blur-xl border-slate-700/50 shadow-2xl shadow-black/30",

  // Section header
  sectionTitle: "text-slate-900",
  darkSectionTitle: "text-white",
  sectionSub: "text-slate-500",
  darkSectionSub: "text-slate-400",

  // Table
  tableBg: "bg-white",
  darkTableBg: "bg-slate-900/50",
  tableHead: "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border-slate-200",
  darkTableHead: "bg-gradient-to-r from-slate-800 to-slate-800/80 text-slate-200 border-slate-700",
  tableRow: "border-slate-200 hover:bg-slate-50/70",
  darkTableRow: "border-slate-800 hover:bg-slate-800/40",
  labelBg: "bg-slate-50 text-slate-700",
  darkLabelBg: "bg-slate-800/60 text-slate-300",
  formulaBg: "bg-white text-slate-600",
  darkFormulaBg: "bg-slate-900/40 text-slate-400",

  // Input
  input: "bg-emerald-50 border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
  darkInput: "bg-emerald-950/40 border-emerald-700/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-emerald-100",

  // Buttons
  selectIdle: "bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50",
  darkSelectIdle: "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-emerald-500/60 hover:bg-emerald-950/30",
  selectActive: "bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30",

  // Total card
  totalCard: "bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 border-amber-300 shadow-xl shadow-amber-500/10",
  darkTotalCard: "bg-gradient-to-br from-amber-950/40 via-yellow-950/30 to-amber-950/40 border-amber-700/50 shadow-xl shadow-amber-500/10",

  // Sub-total
  subtotal: "bg-blue-50 text-blue-700 border-blue-200",
  darkSubtotal: "bg-blue-950/40 text-blue-300 border-blue-800/50",
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────
function SectionCard({
  index,
  title,
  subtitle,
  icon: Icon,
  accent,
  isDark,
  children,
}: {
  index: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  accent: string;
  isDark: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: parseFloat(index) * 0.1 }}
      className={cn(
        "rounded-2xl border overflow-hidden",
        isDark ? tokens.darkCard : tokens.card
      )}
    >
      {/* Section header */}
      <div
        className={cn(
          "relative px-5 py-4 border-b flex items-center gap-3 overflow-hidden",
          isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200/60 bg-gradient-to-r from-white to-slate-50/50"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 opacity-[0.04]",
            accent
          )}
        />
        <div
          className={cn(
            "relative w-10 h-10 rounded-xl flex items-center justify-center shadow-md",
            accent
          )}
        >
          <Icon className="text-white" size={18} />
        </div>
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200/70 text-slate-600"
              )}
            >
              Part {index}
            </span>
            <h3 className={cn("text-base font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>
              {title}
            </h3>
          </div>
          <p className={cn("text-xs mt-0.5 truncate", isDark ? "text-slate-400" : "text-slate-500")}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function SelectButton({
  active,
  onClick,
  label,
  desc,
  factor,
  isDark,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc?: string;
  factor: number;
  isDark: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 group",
        active
          ? tokens.selectActive
          : isDark
          ? tokens.darkSelectIdle
          : tokens.selectIdle
      )}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all",
          active
            ? "bg-white/20 ring-2 ring-white/40"
            : isDark
            ? "bg-slate-700 group-hover:bg-slate-600"
            : "bg-slate-100 group-hover:bg-slate-200"
        )}
      >
        {active ? (
          <Check size={12} className="text-white" strokeWidth={3} />
        ) : (
          <div className={cn("w-2 h-2 rounded-full", isDark ? "bg-slate-500" : "bg-slate-400")} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-semibold", active ? "text-white" : isDark ? "text-slate-200" : "text-slate-800")}>
          {label}
        </div>
        {desc && (
          <div className={cn("text-[11px] mt-0.5 truncate", active ? "text-white/80" : isDark ? "text-slate-500" : "text-slate-500")}>
            {desc}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider", active ? "text-white/70" : isDark ? "text-slate-500" : "text-slate-400")}>
          Factor
        </span>
        <span className={cn("text-sm font-bold tabular-nums", active ? "text-white" : isDark ? "text-slate-200" : "text-slate-700")}>
          ×{factor.toFixed(1)}
        </span>
      </div>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  theme?: "dark" | "light" | string;
}

export default function VRFExtraGasSection({ theme }: Props) {
  const isDark = theme === "dark";

  const [pipes, setPipes] = useState([0, 0, 0, 0, 0, 0]);
  const [selectedHP, setSelectedHP] = useState(-1);
  const [selectedCap, setSelectedCap] = useState(-1);

  const updatePipe = useCallback((i: number, val: string) => {
    setPipes((prev) => {
      const next = [...prev];
      next[i] = Math.max(0, parseFloat(val) || 0);
      return next;
    });
  }, []);

  const toggleHP = useCallback((i: number) => setSelectedHP((p) => (p === i ? -1 : i)), []);
  const toggleCap = useCallback((i: number) => setSelectedCap((p) => (p === i ? -1 : i)), []);

  const reset = useCallback(() => {
    setPipes([0, 0, 0, 0, 0, 0]);
    setSelectedHP(-1);
    setSelectedCap(-1);
  }, []);

  // Calculations
  const pipeQtys = useMemo(() => pipes.map((m, i) => m * PIPE_SIZES[i].factor), [pipes]);
  const sub1 = useMemo(() => pipeQtys.reduce((a, b) => a + b, 0), [pipeQtys]);
  const sub2 = selectedHP >= 0 ? ODU_HP_ROWS[selectedHP].factor : 0;
  const sub3 = selectedCap >= 0 ? INDOOR_CAP_ROWS[selectedCap].factor : 0;
  const grandTotal = sub1 + sub2 + sub3;
  const totalPipeMeters = pipes.reduce((a, b) => a + b, 0);

  const accent1 = "bg-gradient-to-br from-sky-400 to-blue-600";
  const accent2 = "bg-gradient-to-br from-violet-400 to-purple-600";
  const accent3 = "bg-gradient-to-br from-rose-400 to-pink-600";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        "min-h-screen w-full transition-colors duration-500",
        isDark ? tokens.darkPageBg : tokens.pageBg
      )}
    >
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30",
            isDark ? "bg-blue-500/20" : "bg-blue-300/40"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30",
            isDark ? "bg-purple-500/20" : "bg-purple-300/40"
          )}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium mb-4">
            <Sparkles size={12} />
            Professional HVAC Calculator
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br", tokens.brand, tokens.brandGlow)}>
              <Snowflake className="text-white" size={24} strokeWidth={2.5} />
            </div>
          </div>

          <h1 className={cn("text-3xl sm:text-4xl font-bold tracking-tight mb-2", isDark ? "text-white" : "text-slate-900")}>
            VRF Refrigerant Charging
          </h1>
          <p className={cn("text-sm sm:text-base max-w-xl mx-auto", isDark ? "text-slate-400" : "text-slate-600")}>
            Calculate additional R-410A gas charge for Variable Refrigerant Flow systems
          </p>
        </motion.div>

        {/* ── HOW TO USE ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={cn(
            "rounded-2xl border px-5 py-3.5 mb-5 flex items-start gap-3",
            isDark
              ? "bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-slate-900/60 border-cyan-700/40"
              : "bg-gradient-to-r from-cyan-50 via-sky-50 to-white border-cyan-200/70 shadow-sm"
          )}
        >
          <div className={cn(
            "mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
            isDark ? "bg-cyan-500/20" : "bg-cyan-100"
          )}>
            <Info size={14} className={isDark ? "text-cyan-400" : "text-cyan-600"} />
          </div>
          <p className={cn("text-sm leading-relaxed", isDark ? "text-slate-300" : "text-slate-700")}>
            <span className={cn("font-bold", isDark ? "text-cyan-400" : "text-cyan-700")}>How to use: </span>
            Enter liquid pipe lengths in meters (green cells), select your ODU HP range and capacity percentage, then view the total additional refrigerant required.
          </p>
        </motion.div>

        {/* ── LEGEND ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "rounded-2xl border p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3",
            isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/80 border-slate-200/60 shadow-sm"
          )}
        >
          {[
            { color: "from-emerald-400 to-green-500", label: "Input", desc: "Enter your value" },
            { color: "from-slate-300 to-slate-400", label: "Constant", desc: "Pre-defined factor" },
            { color: "from-amber-400 to-yellow-500", label: "Total", desc: "Final result" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex-shrink-0", item.color)} />
              <div className="min-w-0">
                <div className={cn("text-xs font-semibold", isDark ? "text-slate-200" : "text-slate-800")}>
                  {item.label}
                </div>
                <div className={cn("text-[11px]", isDark ? "text-slate-500" : "text-slate-500")}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── PART 1: PIPE SIZES ───────────────────────────────────────── */}
        <div className="mb-6">
          <SectionCard
            index="1"
            title="Liquid Pipe Length"
            subtitle="Enter length in meters for each pipe size"
            icon={Droplets}
            accent={accent1}
            isDark={isDark}
          >
            {/* Stat strip */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                Total pipe length
              </div>
              <div className={cn("text-sm font-bold tabular-nums", isDark ? "text-sky-400" : "text-blue-600")}>
                {totalPipeMeters.toFixed(2)} m
              </div>
            </div>

            <div className="space-y-2">
              {PIPE_SIZES.map((ps, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={cn(
                    "grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border transition-all",
                    isDark
                      ? "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                      : "bg-slate-50/50 border-slate-200/60 hover:border-slate-300"
                  )}
                >
                  {/* Size label */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2">
                    <div className={cn("w-2 h-8 rounded-full bg-gradient-to-b", accent1)} />
                    <div>
                      <div className={cn("text-sm font-semibold tabular-nums", isDark ? "text-white" : "text-slate-900")}>
                        {ps.label}
                      </div>
                      <div className={cn("text-[10px] uppercase tracking-wider", isDark ? "text-slate-500" : "text-slate-400")}>
                        Pipe
                      </div>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="col-span-4 sm:col-span-4">
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={pipes[i] === 0 ? "" : pipes[i]}
                        placeholder="0.00"
                        onChange={(e) => updatePipe(i, e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 pr-8 rounded-lg border-2 outline-none transition-all text-sm font-semibold tabular-nums text-right",
                          isDark
                            ? "bg-emerald-950/30 border-emerald-700/50 text-emerald-100 placeholder:text-emerald-700/50 focus:border-emerald-500 focus:bg-emerald-950/50"
                            : "bg-emerald-50 border-emerald-200 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:bg-white"
                        )}
                      />
                      <span className={cn("absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold", isDark ? "text-emerald-500/70" : "text-emerald-600")}>
                        m
                      </span>
                    </div>
                  </div>

                  {/* Factor */}
                  <div className="col-span-1 sm:col-span-2 text-center">
                    <div className={cn("text-[10px] uppercase tracking-wider mb-0.5", isDark ? "text-slate-500" : "text-slate-400")}>
                      Factor
                    </div>
                    <div className={cn("text-xs font-mono font-bold tabular-nums", isDark ? "text-slate-400" : "text-slate-600")}>
                      {ps.factor.toFixed(3)}
                    </div>
                  </div>

                  {/* Result */}
                  <div className="col-span-2 sm:col-span-2 text-right">
                    <div className={cn("text-[10px] uppercase tracking-wider mb-0.5", isDark ? "text-slate-500" : "text-slate-400")}>
                      kg
                    </div>
                    <motion.div
                      key={pipeQtys[i]}
                      initial={{ scale: 0.9, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn("text-sm font-bold tabular-nums", isDark ? "text-sky-300" : "text-blue-700")}
                    >
                      {pipeQtys[i].toFixed(3)}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sub-total 1 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "mt-4 rounded-xl border-2 p-4 flex items-center justify-between",
                isDark ? "bg-blue-950/30 border-blue-800/60" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", isDark ? "bg-blue-900/50" : "bg-blue-100")}>
                  <Layers3 size={16} className={isDark ? "text-blue-300" : "text-blue-600"} />
                </div>
                <div>
                  <div className={cn("text-[11px] font-bold uppercase tracking-wider", isDark ? "text-blue-400" : "text-blue-700")}>
                    Sub Total 1
                  </div>
                  <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
                    From pipe calculations
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-2xl font-bold tabular-nums", isDark ? "text-blue-300" : "text-blue-700")}>
                  {sub1.toFixed(3)}
                </div>
                <div className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-blue-500/70" : "text-blue-600/70")}>
                  KG
                </div>
              </div>
            </motion.div>
          </SectionCard>
        </div>

        {/* ── PART 2: ODU HP ───────────────────────────────────────────── */}
        <div className="mb-6">
          <SectionCard
            index="2"
            title="ODU HP Selection"
            subtitle="Click the matching horsepower range for your outdoor unit"
            icon={Gauge}
            accent={accent2}
            isDark={isDark}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {ODU_HP_ROWS.map((row, i) => (
                <SelectButton
                  key={i}
                  active={selectedHP === i}
                  onClick={() => toggleHP(i)}
                  label={row.label}
                  desc={row.desc}
                  factor={row.factor}
                  isDark={isDark}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "mt-4 rounded-xl border-2 p-4 flex items-center justify-between",
                isDark ? "bg-blue-950/30 border-blue-800/60" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", isDark ? "bg-blue-900/50" : "bg-blue-100")}>
                  <Settings2 size={16} className={isDark ? "text-blue-300" : "text-blue-600"} />
                </div>
                <div>
                  <div className={cn("text-[11px] font-bold uppercase tracking-wider", isDark ? "text-blue-400" : "text-blue-700")}>
                    Sub Total 2
                  </div>
                  <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
                    From ODU HP
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-2xl font-bold tabular-nums", isDark ? "text-blue-300" : "text-blue-700")}>
                  {sub2.toFixed(1)}
                </div>
                <div className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-blue-500/70" : "text-blue-600/70")}>
                  KG
                </div>
              </div>
            </motion.div>
          </SectionCard>
        </div>

        {/* ── PART 3: INDOOR CAPACITY ──────────────────────────────────── */}
        <div className="mb-6">
          <SectionCard
            index="3"
            title="Indoor Connected Capacity"
            subtitle="Select based on your diversity / load percentage"
            icon={Zap}
            accent={accent3}
            isDark={isDark}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {INDOOR_CAP_ROWS.map((row, i) => (
                <SelectButton
                  key={i}
                  active={selectedCap === i}
                  onClick={() => toggleCap(i)}
                  label={row.label}
                  desc={row.desc}
                  factor={row.factor}
                  isDark={isDark}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "mt-4 rounded-xl border-2 p-4 flex items-center justify-between",
                isDark ? "bg-blue-950/30 border-blue-800/60" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", isDark ? "bg-blue-900/50" : "bg-blue-100")}>
                  <ChevronRight size={16} className={isDark ? "text-blue-300" : "text-blue-600"} />
                </div>
                <div>
                  <div className={cn("text-[11px] font-bold uppercase tracking-wider", isDark ? "text-blue-400" : "text-blue-700")}>
                    Sub Total 3
                  </div>
                  <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
                    From indoor capacity
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-2xl font-bold tabular-nums", isDark ? "text-blue-300" : "text-blue-700")}>
                  {sub3.toFixed(1)}
                </div>
                <div className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "text-blue-500/70" : "text-blue-600/70")}>
                  KG
                </div>
              </div>
            </motion.div>
          </SectionCard>
        </div>

        {/* ── GRAND TOTAL ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "relative rounded-2xl border-2 p-6 overflow-hidden",
            isDark ? tokens.darkTotalCard : tokens.totalCard
          )}
        >
          {/* Background decoration */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/20 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className={isDark ? "text-amber-400" : "text-amber-600"} />
                <span className={cn("text-[11px] font-bold uppercase tracking-wider", isDark ? "text-amber-400" : "text-amber-700")}>
                  Final Result
                </span>
              </div>
              <h2 className={cn("text-lg sm:text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                Total Additional Refrigerant Quantity
              </h2>
              <div className={cn("flex items-center gap-2 mt-2 text-xs flex-wrap", isDark ? "text-amber-200/70" : "text-amber-900/70")}>
                <span className="font-mono">({sub1.toFixed(3)})</span>
                <span>+</span>
                <span className="font-mono">({sub2.toFixed(1)})</span>
                <span>+</span>
                <span className="font-mono">({sub3.toFixed(1)})</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ArrowRight className={isDark ? "text-amber-400/40" : "text-amber-700/40"} size={20} />
              <div className="text-right">
                <motion.div
                  key={grandTotal}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "text-5xl sm:text-6xl font-black tabular-nums leading-none tracking-tight",
                    "bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 bg-clip-text text-transparent"
                  )}
                >
                  {grandTotal.toFixed(2)}
                </motion.div>
                <div className={cn("text-sm font-bold uppercase tracking-wider mt-1", isDark ? "text-amber-400" : "text-amber-700")}>
                  Kilograms
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── ACTIONS ──────────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className={cn("flex items-start gap-2 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <p className="italic">
              Note: Use Refrigerant R-410A of Dupont or Honeywell make for optimal performance.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={reset}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all shadow-sm",
              isDark
                ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            <RotateCcw size={14} />
            Reset All Values
          </motion.button>
        </div>
      </div>
    </div>
  );
}
