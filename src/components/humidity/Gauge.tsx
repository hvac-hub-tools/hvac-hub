import { cn } from '../../utils/cn';

function polarPoint(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

export function Gauge({ value, max, accent = '#0284c7', label, unit, sub }: {
  value: number; max: number; accent?: string; label: string; unit: string; sub?: string;
}) {
  const cx=110; const cy=100; const r=84;
  const safeMax=Math.max(max,1);
  const pct=Math.min(100, Math.max(0, (value/safeMax)*100));
  const semi=`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`;
  const ticks=[0,20,40,60,80,100];
  const over=pct>=99.5;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 118" className="w-full max-w-[260px]">
        <path d={semi} fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth={16} strokeLinecap="round" pathLength={100} />
        <path d={semi} fill="none" stroke={accent} strokeWidth={16} strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100-pct} style={{transition:'stroke-dashoffset 0.5s ease'}}/>
        {ticks.map(t=>{
          const deg=180-(t/100)*180;
          const p1=polarPoint(cx,cy,r-12,deg); const p2=polarPoint(cx,cy,r-20,deg); const lbl=polarPoint(cx,cy,r-30,deg);
          return (
            <g key={t}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeWidth={1.5} />
              <text x={lbl.x} y={lbl.y+3} textAnchor="middle" fontSize={8.5} fill="#94a3b8" fontWeight={600}>{Math.round((t/100)*safeMax)}</text>
            </g>
          );
        })}
      </svg>
      <div className="-mt-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-3xl font-extrabold tracking-tight" style={{ color: over ? '#dc2626' : accent }}>
          {Math.round(value)}<span className="ml-1 text-base font-semibold text-slate-500 dark:text-slate-400">{unit}</span>
        </p>
        {sub && <p className="mt-0.5 text-[11px] leading-snug text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
      {over && <p className="mt-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-800">Requirement exceeds scale — see recommended class below</p>}
    </div>
  );
}

export function CapacityScale({ segments, value, markerLabel, accent='#0284c7', unit }: {
  segments:{ label:string; max:number }[]; value:number; markerLabel:string; accent?:string; unit:string;
}) {
  const total=segments[segments.length-1].max;
  const pos=Math.min(100,(value/total)*100);
  return (
    <div className={cn('relative pt-6')}>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-700 dark:ring-slate-600">
        {segments.map((s,i)=>{
          const from=i===0?0:(segments[i-1].max/total)*100;
          const to=(s.max/total)*100;
          return <div key={i} className="absolute top-0 h-full border-r border-white/60 last:border-0 dark:border-slate-700" style={{left:`${from}%`, width:`${to-from}%`, backgroundColor: i%2===0 ? '#bae6fd' : '#7dd3fc'}} />
        })}
        <div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md transition-all duration-500 dark:border-slate-800" style={{left:`${pos}%`, backgroundColor: accent}}/>
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
        {segments.map((s,i)=><span key={i} className={i===0?'text-left':'text-right'}>{s.label}</span>)}
      </div>
      <p className="mt-1 text-center text-[11px] font-semibold" style={{color: accent}}>{markerLabel}</p>
      <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">Scale in {unit}</p>
    </div>
  );
}
