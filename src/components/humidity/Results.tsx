import { useState } from 'react';
import { Check, Copy, Info, AlertTriangle, Wind, Droplets, Flame, Shirt, Sprout, Waves, Building2, Users } from 'lucide-react';
import { cn } from '../../utils/cn';
import { LoadItem } from '../../lib/humidity/sizing';
import { fmt, Units } from '../../lib/humidity/format';

const LOAD_ICONS: Record<string, React.ReactNode> = {
  ventilation: <Wind className="h-3.5 w-3.5" />,
  people: <Users className="h-3.5 w-3.5" />,
  showers: <Droplets className="h-3.5 w-3.5" />,
  cooking: <Flame className="h-3.5 w-3.5" />,
  laundry: <Shirt className="h-3.5 w-3.5" />,
  plants: <Sprout className="h-3.5 w-3.5" />,
  aquarium: <Waves className="h-3.5 w-3.5" />,
  seepage: <Building2 className="h-3.5 w-3.5" />,
};

export function LoadBreakdown({ loads, total, units, lDayUnit }: { loads: LoadItem[]; total: number; units: Units; lDayUnit: string }) {
  const visible = loads.filter((l) => l.kgDay > 0.01).sort((a, b) => b.kgDay - a.kgDay);
  const max = Math.max(...visible.map((l) => l.kgDay), 0.001);
  if (visible.length === 0) return <p className="text-xs text-slate-400 dark:text-slate-500">No significant moisture sources detected.</p>;
  return (
    <div className="space-y-2.5">
      {visible.map((l) => {
        const pct = (l.kgDay / max) * 100;
        const share = total > 0 ? (l.kgDay / total) * 100 : 0;
        return (
          <div key={l.id} title={l.detail}>
            <div className="mb-0.5 flex items-center justify-between gap-2 text-[12px]">
              <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                <span style={{ color: l.color }}>{LOAD_ICONS[l.id]}</span>
                {l.label}
              </span>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                {fmt(units === 'imperial' ? l.kgDay / 0.473176 : l.kgDay, 1)} {lDayUnit}
                <span className="ml-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">({Math.round(share)}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: l.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RecommendationCard({ title, badge, badgeTone, coverage, typical, notes, accent = '#0284c7', items }: {
  title: string; badge: string; badgeTone: 'sky' | 'emerald' | 'amber' | 'red' | 'slate'; coverage: string; typical: string; notes: string; accent?: string; items?: string[];
}) {
  const tones: Record<string,string> = {
    sky: 'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:ring-sky-800',
    emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-800',
    amber: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-800',
    red: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-900/40 dark:text-red-300 dark:ring-red-800',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600',
  };
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700" style={{ boxShadow: `0 4px 24px -8px ${accent}33` }}>
      <div className="px-4 py-3 text-white" style={{ background: `linear-gradient(120deg, ${accent}, ${accent}cc)` }}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight text-white">{title}</h3>
          <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1', tones[badgeTone])}>{badge}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-white/90">{coverage}</p>
      </div>
      <div className="space-y-2.5 px-4 py-3.5">
        <p className="text-[12px] leading-snug text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-700 dark:text-slate-200">Typical units: </span>{typical}</p>
        <p className="text-[12px] leading-snug text-slate-500 dark:text-slate-400">{notes}</p>
        {items && items.length > 0 && (
          <ul className="space-y-1 border-t border-slate-100 pt-2.5 dark:border-slate-700">
            {items.map((it) => (
              <li key={it} className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />{it}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function NotesList({ notes }: { notes: { text: string; tone?: 'info' | 'warn' }[] }) {
  return (
    <ul className="space-y-2">
      {notes.map((n,i)=>(
        <li key={i} className={cn('flex items-start gap-2 rounded-xl px-3 py-2 text-[12px] leading-snug ring-1',
          n.tone==='warn' ? 'bg-amber-50/70 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800' : 'bg-slate-50 text-slate-600 ring-slate-200 dark:bg-slate-700/50 dark:text-slate-300 dark:ring-slate-600')}>
          {n.tone==='warn' ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> : <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500 dark:text-sky-400" />}
          {n.text}
        </li>
      ))}
    </ul>
  );
}

export function CopyReport({ text, label = 'Copy calculation report' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000);} catch{} }}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:bg-sky-950/50 dark:hover:text-sky-300">
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Report copied!' : label}
    </button>
  );
}
