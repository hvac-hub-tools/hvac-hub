import { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown, Minus, Plus, Search, Check } from 'lucide-react';

/* ------------------------------- Card ------------------------------- */
export function Card({
  title, subtitle, icon, accent = 'sky', children, className, action,
}: {
  title: string; subtitle?: string; icon?: ReactNode; accent?: 'sky' | 'emerald' | 'slate' | 'violet';
  children: ReactNode; className?: string; action?: ReactNode;
}) {
  const accents: Record<string,string> = {
    sky: 'bg-sky-500/10 text-sky-600 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:ring-sky-800',
    emerald: 'bg-emerald-500/10 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-800',
    slate: 'bg-slate-500/10 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600',
    violet: 'bg-violet-500/10 text-violet-600 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-400 dark:ring-violet-800',
  };
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none', className)}>
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700">
        {icon && <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1', accents[accent])}>{icon}</span>}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="space-y-4 px-5 py-4">{children}</div>
    </section>
  );
}

/* ---------------------------- Number field — slider + direct type input with +/- ---------------------------- */
export function NumberField({
  label, value, onChange, min, max, step = 1, unit, hint, slider = true, inputWidth = 'w-20',
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string; hint?: string; slider?: boolean; inputWidth?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const [draft, setDraft] = useState<string>(String(Math.round(value*100)/100));
  const focused = useRef(false);
  useEffect(() => { if (!focused.current) setDraft(String(Math.round(value*100)/100)); }, [value]);
  const decimals = step < 1 ? (String(step).split('.')[1]?.length ?? 1) : 0;
  return (
    <label className="block">
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="pt-1 text-[13px] font-medium leading-tight text-slate-700 dark:text-slate-300">{label}</span>
        <span className="flex shrink-0 items-center gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-700">
          <button type="button" onClick={() => onChange(clamp(value - step))}
            className="flex h-8 w-7 items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="text" inputMode="decimal"
            value={draft}
            onFocus={() => { focused.current = true; }}
            onBlur={() => {
              focused.current = false;
              const v = parseFloat(draft);
              if (Number.isFinite(v)) { onChange(clamp(v)); setDraft(String(clamp(v))); }
              else setDraft(String(Math.round(value*100)/100));
            }}
            onChange={(e) => {
              const s = e.target.value;
              if (s === '' || s === '-' || s === '.' || /^-?\d*\.?\d*$/.test(s)) setDraft(s);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); }
              if (e.key === 'ArrowUp') { e.preventDefault(); onChange(clamp(value + step)); }
              if (e.key === 'ArrowDown') { e.preventDefault(); onChange(clamp(value - step)); }
            }}
            className={cn('h-8 border-x border-slate-200 bg-white text-center text-sm font-bold text-slate-800 outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white', inputWidth)}
          />
          <button type="button" onClick={() => onChange(clamp(value + step))}
            className="flex h-8 w-7 items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white">
            <Plus className="h-3.5 w-3.5" />
          </button>
          {unit && <span className="flex h-8 items-center border-l border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">{unit}</span>}
        </span>
      </div>
      {slider && (
        <input type="range" value={Math.min(max, Math.max(min, value))} min={min} max={max} step={step}
          onChange={(e) => { const v = parseFloat(e.target.value); onChange(v); setDraft(v.toFixed(decimals)); }}
          className="w-full accent-sky-600 dark:accent-sky-500" />
      )}
      {hint && <p className="mt-0.5 text-[11px] leading-snug text-slate-400 dark:text-slate-500">{hint}</p>}
    </label>
  );
}

/* ------------------------------ Custom Select (fixes invisible text) ------------------------------ */
export function SelectField({ label, value, options, onChange, hint }: {
  label: string; value: string; options: { value: string; label: string; hint?: string }[]; onChange: (v: string) => void; hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} className="block relative">
      <span className="mb-1 block text-[13px] font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:border-slate-500 dark:focus:border-sky-500 dark:focus:ring-sky-900/50">
        <span className="min-w-0 flex-1 truncate pr-2">{selected?.label ?? 'Select...'}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition dark:text-slate-500', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-800">
          <div className="max-h-72 overflow-y-auto p-1">
            {options.map(o => (
              <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn('flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition',
                  value === o.value
                    ? 'bg-sky-600 text-white shadow-sm dark:bg-sky-500'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700')}>
                <span className="pr-2">{o.label}</span>
                {value === o.value && <Check className="h-4 w-4 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
      {hint && <p className="mt-1 text-[11px] leading-snug text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

/* searchable select for climate — also fixed for dark mode */
export function SearchableSelect({ label, value, options, onChange, hint, placeholder }: {
  label: string; value: string;
  options: { value: string; label: string; group?: string }[];
  onChange: (v: string) => void; hint?: string; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  const filtered = q ? options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()) || (o.group||'').toLowerCase().includes(q.toLowerCase())) : options;
  const grouped: Record<string, typeof options> = {};
  filtered.forEach(o => { const g = o.group || 'Other'; (grouped[g] = grouped[g] || []).push(o); });
  return (
    <div ref={ref} className="block relative">
      <span className="mb-1 block text-[13px] font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-800 shadow-sm outline-none transition hover:border-slate-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:hover:border-slate-500">
        <span className="min-w-0 flex-1 truncate pr-2">{selected?.label ?? placeholder ?? 'Select...'}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition dark:text-slate-500', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-800">
          <div className="border-b border-slate-100 p-2 dark:border-slate-700">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 ring-1 ring-slate-200 dark:bg-slate-700 dark:ring-slate-600">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search city or country..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500" />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {Object.entries(grouped).map(([grp, opts]) => (
              <div key={grp}>
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{grp}</p>
                {opts.map(o => (
                  <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}
                    className={cn('flex w-full rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition',
                      value === o.value ? 'bg-sky-600 text-white shadow-sm dark:bg-sky-500' : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700')}>
                    <span className="flex-1 pr-2">{o.label}</span>
                    {value === o.value && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            ))}
            {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500">No matches found</p>}
          </div>
        </div>
      )}
      {hint && <p className="mt-1 text-[11px] leading-snug text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

/* -------------------------- Segmented control -------------------------- */
export function SegmentedControl<T extends string>({ options, value, onChange, accent = 'sky' }: {
  options: { value: T; label: string; hint?: string }[]; value: T; onChange: (v: T) => void; accent?: 'sky' | 'emerald';
}) {
  const active = accent === 'sky' ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30 dark:bg-sky-500' : 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 dark:bg-emerald-500';
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 dark:bg-slate-700 dark:ring-slate-600">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} title={o.hint}
          className={cn('flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition',
            value === o.value ? active : 'text-slate-600 hover:bg-white hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Stat box ------------------------------ */
export function StatBox({ label, value, unit, sub, accent = 'sky', big = false }: {
  label: string; value: string; unit?: string; sub?: string; accent?: 'sky' | 'emerald' | 'amber' | 'slate'; big?: boolean;
}) {
  const ring: Record<string,string> = {
    sky: 'ring-sky-200 bg-sky-50/60 dark:ring-sky-800 dark:bg-sky-950/40',
    emerald: 'ring-emerald-200 bg-emerald-50/60 dark:ring-emerald-800 dark:bg-emerald-950/40',
    amber: 'ring-amber-200 bg-amber-50/60 dark:ring-amber-800 dark:bg-amber-950/40',
    slate: 'ring-slate-200 bg-slate-50/60 dark:ring-slate-700 dark:bg-slate-700/50',
  };
  const text: Record<string,string> = {
    sky: 'text-sky-700 dark:text-sky-400',
    emerald: 'text-emerald-700 dark:text-emerald-400',
    amber: 'text-amber-700 dark:text-amber-400',
    slate: 'text-slate-700 dark:text-slate-200'
  };
  return (
    <div className={cn('rounded-xl px-4 py-3 ring-1', ring[accent])}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={cn('mt-0.5 font-bold tracking-tight', big ? 'text-3xl' : 'text-xl', text[accent])}>
        {value}{unit && <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{unit}</span>}
      </p>
      {sub && <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

/* ------------------------------ Badge ------------------------------ */
export function Badge({ children, tone = 'sky' }: { children: ReactNode; tone?: 'sky' | 'emerald' | 'amber' | 'red' | 'slate'; }) {
  const tones: Record<string,string> = {
    sky: 'bg-sky-100 text-sky-700 ring-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:ring-sky-800',
    emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:ring-emerald-800',
    amber: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:ring-amber-800',
    red: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-900/50 dark:text-red-300 dark:ring-red-800',
    slate: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600',
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1', tones[tone])}>{children}</span>;
}

/* ------------------------------ Condition banner — English only, with dark support ------------------------------ */
export function ConditionBanner({ rh }: { rh: number }) {
  let tone: 'good'|'warn'|'bad' = 'good';
  let title = ''; let emoji=''; let advice='';
  if (rh < 20) { tone='bad'; title='Extremely dry — health risk'; emoji='🏜️'; advice='Humidifier strongly recommended — target 40–55% RH'; }
  else if (rh < 30) { tone='warn'; title='Too dry — static, dry skin, cracked wood'; emoji='🌵'; advice='Consider a humidifier to reach 40–50%'; }
  else if (rh <= 60) { tone='good'; title='Ideal — perfect comfort range'; emoji='✨'; advice='No action needed — this is ideal (30–60% RH)'; }
  else if (rh <= 70) { tone='warn'; title='Humid — mould & condensation risk'; emoji='💧'; advice='Use a dehumidifier to reach 50–55%'; }
  else { tone='bad'; title='Very humid — mould & condensation risk'; emoji='🌧️'; advice='Dehumidifier strongly recommended!'; }
  const styles = tone==='good'
    ? 'bg-emerald-50 ring-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:ring-emerald-800 dark:text-emerald-200'
    : tone==='warn'
    ? 'bg-amber-50 ring-amber-200 text-amber-800 dark:bg-amber-950/50 dark:ring-amber-800 dark:text-amber-200'
    : 'bg-red-50 ring-red-200 text-red-700 dark:bg-red-950/40 dark:ring-red-800 dark:text-red-200';
  const dot = tone==='good' ? 'bg-emerald-500' : tone==='warn' ? 'bg-amber-500' : 'bg-red-500';
  const badgeStyle = tone==='good' ? 'bg-emerald-600 text-white ring-emerald-700' : tone==='warn' ? 'bg-amber-500 text-white ring-amber-600' : 'bg-red-600 text-white ring-red-700';
  return (
    <div className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1', styles)}>
      <span className="text-lg leading-none">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide opacity-70">
          <span className={cn('h-2 w-2 rounded-full animate-pulse', dot)} /> Current Condition — {rh}% RH
        </p>
        <p className="text-[12px] font-bold leading-tight">{title}</p>
        <p className="text-[11px] leading-tight opacity-80">{advice}</p>
      </div>
      <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ring-1', badgeStyle)}>
        {tone==='good' ? 'Good ✓' : tone==='warn' ? 'Attention' : 'Poor ✗'}
      </span>
    </div>
  );
}
