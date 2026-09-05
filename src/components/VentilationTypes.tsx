import { useState, useMemo } from 'react';
import {
  Wind,
  Fan,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  RefreshCw,
  Zap,
  Activity,
  Target,
  Droplets,
  ArrowUp,
  Shuffle,
  MoveHorizontal,
  ArrowUpFromLine,
  Cog,
  CircleDot,
  X,
  Check,
  XCircle,
  Building2,
  Gauge,
  IndianRupee,
  BatteryCharging,
  Search,
  Filter,
} from 'lucide-react';
import { ventilationTypes, type VentilationType } from '../data/ventilationTypes';
import { useVentilationTheme as useTheme } from './VentilationGuide';

const iconMap: Record<string, any> = {
  Wind,
  Fan,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  RefreshCw,
  Zap,
  Activity,
  Target,
  Droplets,
  ArrowUp,
  Shuffle,
  MoveHorizontal,
  ArrowUpFromLine,
  Cog,
  CircleDot,
};

type CategoryFilter = 'All' | 'Natural' | 'Mechanical' | 'Hybrid';

export default function VentilationTypes() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selected, setSelected] = useState<VentilationType | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');

  const filtered = useMemo(() => {
    return ventilationTypes.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.shortDesc.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || v.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  const categories: CategoryFilter[] = ['All', 'Natural', 'Mechanical', 'Hybrid'];

  return (
    <>
      {/* Search and filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div
          className={`relative flex-1 rounded-xl ${
            isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'
          }`}
        >
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ventilation types..."
            className={`w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none ${
              isDark
                ? 'text-slate-100 placeholder:text-slate-500'
                : 'text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>

        <div
          className={`flex gap-1 rounded-xl p-1 ${
            isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'
          }`}
        >
          <Filter
            className={`ml-2 self-center h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
          />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                category === c
                  ? isDark
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((v) => {
          const Icon = iconMap[v.icon] ?? Wind;
          return (
            <button
              key={v.id}
              onClick={() => setSelected(v)}
              className={`group relative overflow-hidden rounded-2xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl ${
                isDark
                  ? 'bg-slate-900/60 ring-1 ring-slate-800 hover:ring-slate-700'
                  : 'bg-white ring-1 ring-slate-200 hover:ring-slate-300 hover:shadow-slate-200'
              }`}
            >
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${v.color} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
              />
              <div className="relative">
                <div
                  className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${v.color} shadow-lg`}
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{v.name}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      v.category === 'Natural'
                        ? isDark
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30'
                          : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : v.category === 'Mechanical'
                          ? isDark
                            ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30'
                            : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                          : isDark
                            ? 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/30'
                            : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
                    }`}
                  >
                    {v.category}
                  </span>
                </div>
                <p
                  className={`mt-2 line-clamp-2 text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {v.shortDesc}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-700/40 pt-3">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Gauge
                      className={`h-3 w-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}
                    />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {v.achRange}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isDark ? 'text-cyan-400' : 'text-cyan-600'
                    } group-hover:underline`}
                  >
                    Details →
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          className={`rounded-2xl p-12 text-center ${
            isDark ? 'bg-slate-900/40 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'
          }`}
        >
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            Koi ventilation type nahi mili. Search ya filter change karke dekhein.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <DetailModal type={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function DetailModal({
  type,
  onClose,
}: {
  type: VentilationType;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = iconMap[type.icon] ?? Wind;

  const efficiencyColor = {
    Low: 'text-red-400',
    Medium: 'text-amber-400',
    High: 'text-emerald-400',
    'Very High': 'text-cyan-400',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl sm:rounded-3xl ${
          isDark ? 'bg-slate-900 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 border-b backdrop-blur-xl ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90'
          }`}
        >
          <div className="flex items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${type.color} shadow-lg`}
              >
                <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold sm:text-2xl">{type.name}</h3>
                <p
                  className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {type.category} Ventilation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`rounded-lg p-2 transition-colors ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          {/* Description */}
          <div>
            <h4
              className={`mb-2 text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              Overview
            </h4>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {type.description}
            </p>
          </div>

          {/* How it works */}
          <div
            className={`rounded-2xl p-4 ${
              isDark ? 'bg-slate-800/50 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'
            }`}
          >
            <h4
              className={`mb-2 text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-cyan-400' : 'text-cyan-600'
              }`}
            >
              ⚙️ How It Works
            </h4>
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {type.howItWorks}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat
              label="Air Changes"
              value={type.achRange}
              icon={Gauge}
              isDark={isDark}
              color="cyan"
            />
            <MiniStat
              label="Efficiency"
              value={type.efficiency}
              icon={Activity}
              isDark={isDark}
              color="emerald"
              valueClass={efficiencyColor[type.efficiency]}
            />
            <MiniStat
              label="Cost"
              value={type.cost}
              icon={IndianRupee}
              isDark={isDark}
              color="amber"
            />
            <MiniStat
              label="Energy Use"
              value={type.energyUse}
              icon={BatteryCharging}
              isDark={isDark}
              color="violet"
            />
          </div>

          {/* Pros & Cons */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className={`rounded-2xl p-4 ${
                isDark
                  ? 'bg-emerald-500/5 ring-1 ring-emerald-500/20'
                  : 'bg-emerald-50 ring-1 ring-emerald-200'
              }`}
            >
              <h4
                className={`mb-3 flex items-center gap-2 text-sm font-bold ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}
              >
                <Check className="h-4 w-4" /> Advantages
              </h4>
              <ul className="space-y-2">
                {type.pros.map((p, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-xs ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        isDark ? 'bg-emerald-400' : 'bg-emerald-600'
                      }`}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                isDark
                  ? 'bg-rose-500/5 ring-1 ring-rose-500/20'
                  : 'bg-rose-50 ring-1 ring-rose-200'
              }`}
            >
              <h4
                className={`mb-3 flex items-center gap-2 text-sm font-bold ${
                  isDark ? 'text-rose-400' : 'text-rose-700'
                }`}
              >
                <XCircle className="h-4 w-4" /> Disadvantages
              </h4>
              <ul className="space-y-2">
                {type.cons.map((c, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-xs ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <span
                      className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                        isDark ? 'bg-rose-400' : 'bg-rose-600'
                      }`}
                    />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Applications */}
          <div>
            <h4
              className={`mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" /> Common Applications
            </h4>
            <div className="flex flex-wrap gap-2">
              {type.applications.map((a, i) => (
                <span
                  key={i}
                  className={`rounded-full px-3 py-1 text-xs ${
                    isDark
                      ? 'bg-slate-800 text-slate-300 ring-1 ring-slate-700'
                      : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
                  }`}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  isDark,
  color,
  valueClass,
}: {
  label: string;
  value: string;
  icon: any;
  isDark: boolean;
  color: 'cyan' | 'emerald' | 'amber' | 'violet';
  valueClass?: string;
}) {
  const colors = {
    cyan: isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600',
    emerald: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
    amber: isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
    violet: isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600',
  };
  return (
    <div
      className={`rounded-xl p-3 ${
        isDark ? 'bg-slate-800/50 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'
      }`}
    >
      <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        {label}
      </div>
      <div className={`mt-0.5 text-sm font-semibold ${valueClass || (isDark ? 'text-slate-100' : 'text-slate-900')}`}>
        {value}
      </div>
    </div>
  );
}
