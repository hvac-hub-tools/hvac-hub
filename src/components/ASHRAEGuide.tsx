import { useState, useMemo } from 'react';
import { BookOpen, Gauge, Info, Search } from 'lucide-react';
import { ashrae621Table, generalNotes, itemSpecificNotes } from '../data/ashrae621';
import { recommendedACH } from '../data/ventilationTypes';
import { useVentilationTheme as useTheme } from './VentilationGuide';

export default function ASHRAEGuide() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');

  const filteredTable = useMemo(() => {
    if (!search.trim()) return ashrae621Table;
    const q = search.toLowerCase();
    return ashrae621Table
      .map((cat) => ({
        category: cat.category,
        entries: cat.entries.filter(
          (e) =>
            e.occupancy.toLowerCase().includes(q) ||
            cat.category.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.entries.length > 0);
  }, [search]);

  return (
    <div className="space-y-6 print-area">

      {/* Intro */}
      <div
        className={`rounded-2xl p-5 print:hidden ${
          isDark
            ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/5 ring-1 ring-cyan-500/20'
            : 'bg-gradient-to-br from-cyan-50 to-blue-50 ring-1 ring-cyan-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
            }`}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold">TABLE 6.2.2.1 — Minimum Ventilation Rates in Breathing Zone</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Based on ANSI/ASHRAE Addendum p to ANSI/ASHRAE Standard 62.1-2013. This table is not
              valid in isolation; it must be used in conjunction with the accompanying notes.
              Formula: Vbz = Rp × Pz + Ra × Az
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div
        className={`relative rounded-xl print:hidden ${
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
          placeholder="Search occupancy category (e.g. office, classroom, gym...)"
          className={`w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none ${
            isDark
              ? 'text-slate-100 placeholder:text-slate-500'
              : 'text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>

      {/* Main ASHRAE 62.1 Table */}
      <div
        className={`overflow-hidden rounded-2xl print:rounded-none print:ring-0 ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <div className={`border-b p-4 print:border-black ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <h3 className="text-center font-bold">
            TABLE 6.2.2.1 — Minimum Ventilation Rates in Breathing Zone
          </h3>
          <p className={`mt-0.5 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            (This table is not valid in isolation; it must be used in conjunction with the accompanying notes.)
          </p>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead>
              <tr className={isDark ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                <th className={`border px-2 py-2 text-left font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} rowSpan={2}>
                  Occupancy Category
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} colSpan={2}>
                  People Outdoor<br />Air Rate R<sub>p</sub>
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} colSpan={2}>
                  Area Outdoor<br />Air Rate R<sub>a</sub>
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} rowSpan={2}>
                  Notes
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} colSpan={3}>
                  Default Values
                </th>
                <th className={`border px-2 py-2 font-bold ${isDark ? 'border-slate-700' : 'border-slate-300'}`} rowSpan={2}>
                  Air<br />Class
                </th>
              </tr>
              <tr className={isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-600'}>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>cfm/<br />person</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>L/s·<br />person</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>cfm/ft²</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>L/s·m²</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                  #/1000 ft²<br />or #/100 m²
                </th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>cfm/<br />person</th>
                <th className={`border px-2 py-1.5 font-semibold ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>L/s·person</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'text-slate-200' : 'text-slate-800'}>
              {filteredTable.map((cat) => (
                <CategoryRows key={cat.category} category={cat.category} entries={cat.entries} isDark={isDark} />
              ))}
              {filteredTable.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No occupancy category found. Try a different search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* General Notes */}
      <div
        className={`rounded-2xl p-5 print:rounded-none print:ring-0 ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <h4 className={`mb-3 text-sm font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
          GENERAL NOTES FOR TABLE 6.2.2.1
        </h4>
        <ol className={`space-y-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {generalNotes.map((note, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-bold">{i + 1}</span>
              <span>{note}</span>
            </li>
          ))}
        </ol>

        <h4 className={`mb-3 mt-5 text-sm font-bold ${isDark ? 'text-violet-400' : 'text-violet-700'}`}>
          ITEM-SPECIFIC NOTES FOR TABLE 6.2.2.1
        </h4>
        <ul className={`space-y-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {itemSpecificNotes.map((n) => (
            <li key={n.code} className="flex gap-2">
              <span className="w-4 shrink-0 font-bold">{n.code}</span>
              <span>{n.note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ACH Reference (screen only) */}
      <div
        className={`overflow-hidden rounded-2xl print:hidden ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <div className={`border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Gauge className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className="font-bold">Recommended ACH by Space</h3>
          </div>
          <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Air Changes per Hour — how many times the room air is replaced in one hour
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedACH.map((r) => (
            <div
              key={r.space}
              className={`flex items-center justify-between rounded-xl p-3 ${
                isDark ? 'bg-slate-800/40 ring-1 ring-slate-800' : 'bg-slate-50 ring-1 ring-slate-200'
              }`}
            >
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{r.space}</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700/30">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${Math.min((r.ach / 30) * 100, 100)}%` }}
                  />
                </div>
                <span
                  className={`min-w-[3rem] text-right font-mono text-sm font-bold ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  {r.ach}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Formulas (screen only) */}
      <div
        className={`overflow-hidden rounded-2xl print:hidden ${
          isDark ? 'bg-slate-900/60 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'
        }`}
      >
        <div className={`border-b p-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <Info className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <h3 className="font-bold">Essential HVAC Formulas</h3>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <FormulaCard title="Breathing Zone Airflow" formula="Vbz = Rp × Pz + Ra × Az" description="Rp = people rate, Pz = people count, Ra = area rate, Az = zone area" isDark={isDark} color="cyan" />
          <FormulaCard title="CFM from ACH" formula="CFM = (Volume × ACH) / 60" description="Room volume in ft³, ACH = air changes per hour" isDark={isDark} color="violet" />
          <FormulaCard title="ACH from CFM" formula="ACH = (CFM × 60) / Volume" description="Convert CFM to air changes per hour" isDark={isDark} color="emerald" />
          <FormulaCard title="Duct Velocity" formula="Velocity (FPM) = CFM / Area" description="Area in ft², velocity in ft/min" isDark={isDark} color="amber" />
          <FormulaCard title="Heat Load (Sensible)" formula="Q = 1.08 × CFM × ΔT" description="Q in BTU/hr, ΔT in °F" isDark={isDark} color="rose" />
          <FormulaCard title="Unit Conversion" formula="1 CFM = 0.4719 L/s" description="CFM to L/s conversion factor" isDark={isDark} color="indigo" />
        </div>
      </div>

      {/* Copyright note */}
      <p className={`text-center text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        Reference: ANSI/ASHRAE Addendum p to ANSI/ASHRAE Standard 62.1-2013 — © ASHRAE (www.ashrae.org). For reference use only.
      </p>
    </div>
  );
}

function CategoryRows({
  category,
  entries,
  isDark,
}: {
  category: string;
  entries: {
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
  }[];
  isDark: boolean;
}) {
  const border = isDark ? 'border-slate-800' : 'border-slate-300';
  return (
    <>
      <tr className={isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}>
        <td
          colSpan={10}
          className={`border px-2 py-1.5 font-bold ${border} ${isDark ? 'text-cyan-300' : 'text-cyan-800'}`}
        >
          {category}
        </td>
      </tr>
      {entries.map((e) => (
        <tr
          key={e.occupancy}
          className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}
        >
          <td className={`border px-2 py-1.5 ${border}`}>{e.occupancy}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.rpCfm}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.rpLs}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.raCfm}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.raLs}</td>
          <td className={`border px-2 py-1.5 text-center font-semibold ${border} ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {e.notes || '—'}
          </td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.density}</td>
          <td className={`border px-2 py-1.5 text-center font-mono font-semibold ${border} ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {e.combinedCfm}
          </td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.combinedLs}</td>
          <td className={`border px-2 py-1.5 text-center font-mono ${border}`}>{e.airClass}</td>
        </tr>
      ))}
    </>
  );
}

function FormulaCard({
  title,
  formula,
  description,
  isDark,
  color,
}: {
  title: string;
  formula: string;
  description: string;
  isDark: boolean;
  color: string;
}) {
  const bgMap: Record<string, string> = {
    cyan: isDark ? 'bg-cyan-500/5 ring-cyan-500/20' : 'bg-cyan-50 ring-cyan-200',
    violet: isDark ? 'bg-violet-500/5 ring-violet-500/20' : 'bg-violet-50 ring-violet-200',
    emerald: isDark ? 'bg-emerald-500/5 ring-emerald-500/20' : 'bg-emerald-50 ring-emerald-200',
    amber: isDark ? 'bg-amber-500/5 ring-amber-500/20' : 'bg-amber-50 ring-amber-200',
    rose: isDark ? 'bg-rose-500/5 ring-rose-500/20' : 'bg-rose-50 ring-rose-200',
    indigo: isDark ? 'bg-indigo-500/5 ring-indigo-500/20' : 'bg-indigo-50 ring-indigo-200',
  };
  const textMap: Record<string, string> = {
    cyan: isDark ? 'text-cyan-300' : 'text-cyan-700',
    violet: isDark ? 'text-violet-300' : 'text-violet-700',
    emerald: isDark ? 'text-emerald-300' : 'text-emerald-700',
    amber: isDark ? 'text-amber-300' : 'text-amber-700',
    rose: isDark ? 'text-rose-300' : 'text-rose-700',
    indigo: isDark ? 'text-indigo-300' : 'text-indigo-700',
  };

  return (
    <div className={`rounded-xl p-3 ring-1 ${bgMap[color]}`}>
      <div className={`mb-1 text-xs font-semibold ${textMap[color]}`}>{title}</div>
      <div className={`font-mono text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formula}</div>
      <div className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</div>
    </div>
  );
}
