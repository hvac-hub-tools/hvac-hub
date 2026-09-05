import { useMemo, useState } from 'react';
import { Ruler, Thermometer, Droplets, RefreshCw, CloudSun, Timer, Sparkles, Maximize2 } from 'lucide-react';
import { Card, NumberField, SelectField, SegmentedControl, StatBox, Badge, SearchableSelect, ConditionBanner } from './ui';
import { Gauge } from './Gauge';
import { RecommendationCard, NotesList, CopyReport } from './Results';
import { calculateHumidifier, HumidifierInput } from '../../lib/humidity/sizing';
import { HUMIDIFIER_CLASSES, ROOM_TYPES, ABSORPTION_LEVELS, CLIMATE_PRESETS } from '../../lib/humidity/constants';
import { Units, DimUnit, dimUnitToM, mToDimUnit, fmt, cToDisplay, displayToC, tempUnit, m2ToDisplay, displayToM2, litresToGallons, smallCapacityLabel } from '../../lib/humidity/format';

const DEFAULTS: HumidifierInput = {
  lengthM: 4, widthM: 4, heightM: 3, ach: 0.8,
  indoorTempC: 22, currentRH: 25, targetRH: 50,
  outsideTempC: 11, outsideRH: 45,
  occupants: 2, occupancyHours: 12, absorption: 'medium',
};

export default function HumidifierTab({ units }: { units: Units }) {
  const [input, setInput] = useState<HumidifierInput>(DEFAULTS);
  const [presetId, setPresetId] = useState('delhi-winter');
  const [roomType, setRoomType] = useState('bedroom');
  const [dimUnit, setDimUnit] = useState<DimUnit>('m');
  const [sizeMode, setSizeMode] = useState<'dimensions'|'area'>('dimensions');
  const [areaM2, setAreaM2] = useState(16);

  const set = <K extends keyof HumidifierInput>(k: K, v: HumidifierInput[K]) => setInput(s=>({ ...s, [k]: v }));

  const handleAreaChange = (v:number) => {
    const m2 = displayToM2(v, units);
    setAreaM2(m2);
    const side = Math.sqrt(Math.max(0.5, m2));
    set('lengthM', side); set('widthM', side);
  };
  const handleDimChange = (field:'lengthM'|'widthM'|'heightM', displayVal:number) => {
    set(field, Math.max(0.05, dimUnitToM(displayVal, dimUnit)));
  };

  const result = useMemo(()=>calculateHumidifier(input),[input]);
  const cls = HUMIDIFIER_CLASSES[ (()=>{ const r=result.requiredOutputMLh; const idx=HUMIDIFIER_CLASSES.findIndex(c=>r<=c.maxMLh); return idx===-1?HUMIDIFIER_CLASSES.length-1:idx; })() ];
  const roomLabel = ROOM_TYPES.find(r=>r.id===roomType)?.label ?? 'Custom';
  const classOutputMLh = Math.min(cls.maxMLh, Math.max(result.requiredOutputMLh, 200));
  const runHoursPerDay = result.dailyNeedL>0 ? (result.dailyNeedL*1000)/classOutputMLh : 0;
  const initHours = result.initChargeKg>0 ? (result.initChargeKg*1000)/classOutputMLh : 0;

  const applyPreset = (id:string)=>{ setPresetId(id); const p=CLIMATE_PRESETS.find(c=>c.id===id); if(p && p.id!=='custom'){ set('outsideTempC', p.tempC); set('outsideRH', p.rh); } };
  const onRoomType = (id:string)=>{ setRoomType(id); const rt=ROOM_TYPES.find(r=>r.id===id); if(rt) set('ach', rt.ach); };
  const onAchChange = (v:number)=>{ set('ach', v); setRoomType('custom'); };
  const reset = ()=>{ setInput(DEFAULTS); setPresetId('delhi-winter'); setRoomType('bedroom'); setDimUnit('m'); setSizeMode('dimensions'); setAreaM2(16); };

  const lDisp = mToDimUnit(input.lengthM, dimUnit);
  const wDisp = mToDimUnit(input.widthM, dimUnit);
  const hDisp = mToDimUnit(input.heightM, dimUnit);
  const dimRange = (u:DimUnit)=> u==='mm'?{min:500,max:20000,step:10}:u==='cm'?{min:50,max:2000,step:1}:u==='m'?{min:0.5,max:60,step:0.1}:u==='ft'?{min:1,max:200,step:0.5}:{min:12,max:2400,step:1};
  const hRange = (u:DimUnit)=> u==='mm'?{min:1000,max:6000,step:10}:u==='cm'?{min:100,max:600,step:1}:u==='m'?{min:1,max:15,step:0.1}:u==='ft'?{min:3,max:50,step:0.25}:{min:36,max:600,step:1};
  const areaDisplay = m2ToDisplay(areaM2, units);
  const areaUnit = units==='metric'?'m²':'sq ft';

  const report = [
    'HUMIDIFIER SIZING REPORT (ClimateRight — Worldwide)',
    '--------------------------------------------------',
    `Room type: ${roomLabel} | ${sizeMode==='area'?`Area ${fmt(areaDisplay,1)} ${areaUnit}`:`${fmt(lDisp,1)}×${fmt(wDisp,1)} ${dimUnit} × ${fmt(hDisp,1)} ${dimUnit}`} | Volume ${fmt(result.volumeM3,1)} m³`,
    `Conditions: indoor ${fmt(cToDisplay(input.indoorTempC, units),1)}${tempUnit(units)} / ${input.currentRH}% → target ${input.targetRH}%`,
    `Outside: ${fmt(cToDisplay(input.outsideTempC, units),1)}${tempUnit(units)} / ${input.outsideRH}%`,
    `Vent loss: ${fmt(result.ventLossKgH*1000,0)} g/h | People gain: ${fmt(result.peopleGainKgH*1000,0)} g/h | Net: ${fmt(result.netKgH*1000,0)} g/h`,
    `Required: ${fmt(result.requiredOutputMLh,0)} mL/h (${fmt(result.dailyNeedL,2)} L/day)`,
    `Class: ${cls.label} (${cls.types}) for ${roomLabel}`,
  ].join('\n');
  const climateOptions = CLIMATE_PRESETS.map(c=>({ value:c.id, label:`${c.city} — ${c.season} (${c.tempC}°C / ${c.rh}% RH)`, group:c.region }));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-6">
        <Card title="Room details" subtitle={`For ${roomLabel} — dimensions & ventilation`} icon={<Ruler className="h-4 w-4" />} accent="emerald"
          action={<span className="hidden sm:flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-800"><Maximize2 className="h-3 w-3" /> {fmt(m2ToDisplay(result.areaM2, units),1)} {areaUnit} · {fmt(result.volumeM3,1)} m³</span>}>
          <div className="flex flex-wrap gap-1.5">
            <div className="flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
              {(['dimensions','area'] as const).map(m=>(
                <button key={m} onClick={()=>setSizeMode(m)} className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold ${sizeMode===m?'bg-emerald-600 text-white shadow':'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'}`}>
                  {m==='dimensions'?'L × W × H':'Direct area (m² / sq ft)'}
                </button>
              ))}
            </div>
            {sizeMode==='dimensions' && (
              <div className="flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
                {(['mm','cm','m','ft','in'] as DimUnit[]).map(u=>(
                  <button key={u} onClick={()=>setDimUnit(u)} className={`rounded-lg px-2.5 py-1.5 text-[13px] font-semibold ${dimUnit===u?'bg-white shadow ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600':'text-slate-500 dark:text-slate-400 dark:hover:text-slate-200'}`}>{u}</button>
                ))}
              </div>
            )}
          </div>
          {sizeMode==='dimensions' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Room / Selection type" value={roomType} options={ROOM_TYPES.map(r=>({value:r.id,label:r.label}))} onChange={onRoomType} hint={ROOM_TYPES.find(r=>r.id===roomType)?.hint} />
              <NumberField label="Air changes / hour (ACH)" value={input.ach} onChange={onAchChange} min={0.1} max={8} step={0.1} unit="ACH" hint="Dry outside air = main humidifier load" />
              <NumberField label="Length" value={lDisp} onChange={v=>handleDimChange('lengthM',v)} {...dimRange(dimUnit)} unit={dimUnit} />
              <NumberField label="Width" value={wDisp} onChange={v=>handleDimChange('widthM',v)} {...dimRange(dimUnit)} unit={dimUnit} />
              <NumberField label="Height (ceiling)" value={hDisp} onChange={v=>handleDimChange('heightM',v)} {...hRange(dimUnit)} unit={dimUnit} />
              <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 sm:col-span-2 flex items-center justify-between dark:bg-slate-900/60 dark:ring-slate-700">
                <div><p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Space — {roomLabel}</p><p className="text-xs text-slate-500 dark:text-slate-400">Volume {fmt(result.volumeM3,1)} m³ · Floor {fmt(m2ToDisplay(result.areaM2, units),1)} {areaUnit}</p></div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">{dimUnit} mode</span>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Room / Selection type" value={roomType} options={ROOM_TYPES.map(r=>({value:r.id,label:r.label}))} onChange={onRoomType} hint={ROOM_TYPES.find(r=>r.id===roomType)?.hint} />
              <NumberField label="Air changes / hour (ACH)" value={input.ach} onChange={onAchChange} min={0.1} max={8} step={0.1} unit="ACH" />
              <NumberField label="Floor area — direct input" value={areaDisplay} onChange={handleAreaChange} min={1} max={units==='metric'?5000:54000} step={units==='metric'?1:10} unit={areaUnit} hint="Carpet area directly — no L×W needed" />
              <NumberField label="Height (ceiling)" value={hDisp} onChange={v=>handleDimChange('heightM',v)} {...hRange(dimUnit)} unit={dimUnit} />
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 sm:col-span-2 dark:bg-slate-900/60 dark:ring-slate-700">
                {(['mm','cm','m','ft','in'] as DimUnit[]).map(u=>(
                  <button key={u} onClick={()=>setDimUnit(u)} className={`flex-1 rounded-lg py-1.5 text-[13px] font-semibold ${dimUnit===u?'bg-white shadow ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600':'text-slate-500 dark:text-slate-400'}`}>{u} height</button>
                ))}
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200 sm:col-span-2 dark:bg-emerald-500/10 dark:ring-emerald-800">
                <p className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-400">Direct area — {fmt(areaDisplay,1)} {areaUnit} × {fmt(hDisp,1)} {dimUnit}</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-500">Volume {fmt(result.volumeM3,1)} m³ — used for calculation</p>
              </div>
            </div>
          )}
        </Card>

        <Card title="Indoor & outdoor conditions" subtitle="Current dryness + worldwide outside air" icon={<Thermometer className="h-4 w-4" />} accent="emerald">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Indoor temperature" value={cToDisplay(input.indoorTempC, units)} onChange={v=>set('indoorTempC', displayToC(v, units))} min={units==='metric'?5:41} max={units==='metric'?40:104} step={0.5} unit={tempUnit(units)} />
            <div className="space-y-2">
              <NumberField label="Current indoor RH" value={input.currentRH} onChange={v=>set('currentRH', v)} min={5} max={100} step={1} unit="%" hint="Dry winters / dry AC rooms often <30%" />
              <ConditionBanner rh={input.currentRH} />
            </div>
            <NumberField label="Target RH" value={input.targetRH} onChange={v=>set('targetRH', v)} min={20} max={70} step={1} unit="%" hint="Ideal 40–55% for comfort & wood" />
            <div className="flex items-end">
              <div className="w-full rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Selected room</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{roomLabel} · {input.ach} ACH</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{ROOM_TYPES.find(r=>r.id===roomType)?.hint}</p>
              </div>
            </div>
            <div className="sm:col-span-2">
              <SearchableSelect label="Outside / ventilation air — worldwide climate" value={presetId} options={climateOptions} onChange={applyPreset} hint="Delhi winter & desert air are classic humidifier cases — works worldwide" placeholder="Search city..." />
            </div>
            <NumberField label="Outside temperature" value={cToDisplay(input.outsideTempC, units)} onChange={v=>set('outsideTempC', displayToC(v, units))} min={units==='metric'?-10:14} max={units==='metric'?50:122} step={0.5} unit={tempUnit(units)} />
            <NumberField label="Outside RH" value={input.outsideRH} onChange={v=>set('outsideRH', v)} min={5} max={100} step={1} unit="%" />
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
            <StatBox label="Moisture now" value={fmt(result.wCurrent,1)} unit="g/kg" accent="slate" />
            <StatBox label="Moisture target" value={fmt(result.wTarget,1)} unit="g/kg" accent="slate" />
            <StatBox label="Outside air" value={fmt(result.wOutside,1)} unit="g/kg" accent="slate" />
          </div>
        </Card>

        <Card title="Space usage & finishes" subtitle={`For ${roomLabel} — occupants & furnishing`} icon={<Droplets className="h-4 w-4" />} accent="emerald">
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="People in room" value={input.occupants} onChange={v=>set('occupants', v)} min={0} max={50} step={1} unit="no." hint="Breathing adds ~40 g/h each" />
            <NumberField label="Hours occupied / day" value={input.occupancyHours} onChange={v=>set('occupancyHours', v)} min={1} max={24} step={1} unit="h" />
            <div className="sm:col-span-2">
              <p className="mb-1 text-[13px] font-medium text-slate-700 dark:text-slate-300">Furnishing / absorption</p>
              <SegmentedControl options={ABSORPTION_LEVELS.map(a=>({ value:a.id, label:a.label, hint:a.hint }))} value={input.absorption} onChange={v=>set('absorption', v)} accent="emerald" />
              <p className="mt-1 text-[11px] text-slate-400">Wood, drywall, carpets & books soak humidity — adds to initial charge.</p>
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button onClick={reset} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200">
              <RefreshCw className="h-3.5 w-3.5" /> Reset to Delhi-winter example
            </button>
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"><CloudSun className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Sizing result</h3>
            <Badge tone={result.netKgH>0.005?'amber':'emerald'}>{result.netKgH>0.005?'Humidify':'No need'}</Badge>
          </div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Selection for — <span className="text-emerald-700 dark:text-emerald-400">{roomLabel}</span> · {fmt(m2ToDisplay(result.areaM2, units),1)} {areaUnit}</p>
          {result.netKgH <= 0.005 && (
            <div className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-medium leading-snug text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-800">
              Ventilation air not drier than target — no humidification needed for this setup.
            </div>
          )}
          <Gauge value={result.requiredOutputMLh} max={Math.max(500, result.requiredOutputMLh*1.3)} accent="#059669" label="Required humidifier output" unit={units==='imperial'?'oz/h':'mL/h'} sub="steady-state output to hold target RH" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <StatBox label="Daily water need" value={fmt(result.dailyNeedL,2)} unit="L/day" sub={units==='imperial'?`≈ ${fmt(litresToGallons(result.dailyNeedL),2)} gal/day`:undefined} accent="emerald" />
            <StatBox label="Ventilation loss" value={fmt(result.ventLossKgH*1000,0)} unit="g/h" sub={`people add ${fmt(result.peopleGainKgH*1000,0)} g/h back`} accent="slate" />
          </div>
          <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
            <div className="flex items-start gap-2 text-[12px] text-slate-600 dark:text-slate-400">
              <Timer className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>A {smallCapacityLabel(classOutputMLh, units)} unit runs ≈ <span className="font-bold text-slate-800 dark:text-slate-100">{fmt(runHoursPerDay,1)} h/day</span> to maintain target{runHoursPerDay>20?' (near-continuous — consider one class larger)':''}.</span>
            </div>
            <div className="flex items-start gap-2 text-[12px] text-slate-600 dark:text-slate-400">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>Initial conditioning: ≈ <span className="font-bold text-slate-800 dark:text-slate-100">{fmt(initHours,1)} h</span> to raise room from {input.currentRH}% → {input.targetRH}% RH (first fill).</span>
            </div>
          </div>
        </div>

        <RecommendationCard title={`Recommended humidifier — ${roomLabel}`} badge="Best match" badgeTone="emerald"
          coverage={`Covers ~${cls.coverageM2} · ${cls.label}`} typical={cls.types} notes={cls.notes} accent="#059669"
          items={[
            `For ${roomLabel} (${fmt(m2ToDisplay(result.areaM2, units),1)} ${areaUnit}): needs ${smallCapacityLabel(result.requiredOutputMLh, units)} (≈ ${fmt(result.dailyNeedL,2)} L/day)`,
            result.requiredOutputMLh>700 ? 'Large output — consider steam humidifier or two units' : 'Ultrasonic or evaporative — ultrasonic is quieter',
            'Use distilled/RO water with ultrasonic to avoid white dust',
            'Keep humidistat 40–55% RH to prevent over-humidification',
          ]} />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Engineer's notes</p>
          <NotesList notes={[
            { text: 'Sizing driven by ventilation loss (ρ·V·ACH·ΔW). Sealing windows lowers ACH and humidifier size.' },
            result.targetWarn ? { text: result.targetWarn, tone: 'warn' as const } : { text: 'Target 40–55% RH protects wood, instruments & prevents static.' },
            { text: 'Heating lowers RH even at constant moisture — cold dry outside air is the culprit in winters.' },
          ]} />
        </div>
        <CopyReport text={report} />
      </aside>
    </div>
  );
}
