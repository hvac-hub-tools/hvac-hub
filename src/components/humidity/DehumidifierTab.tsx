import { useMemo, useState } from 'react';
import { Ruler, Thermometer, Droplets, RefreshCw, CloudRain, Target, ShieldAlert, Sparkles, Maximize2 } from 'lucide-react';
import { Card, NumberField, SelectField, SegmentedControl, StatBox, Badge, SearchableSelect, ConditionBanner } from './ui';
import { Gauge, CapacityScale } from './Gauge';
import { LoadBreakdown, RecommendationCard, NotesList, CopyReport } from './Results';
import { calculateDehumidifier, DehumidifierInput } from '../../lib/humidity/sizing';
import { DEHUMIDIFIER_CLASSES, ROOM_TYPES, ACTIVITY_LEVELS, SEEPAGE_LEVELS, CLIMATE_PRESETS } from '../../lib/humidity/constants';
import { Units, DimUnit, dimUnitToM, mToDimUnit, fmt, cToDisplay, displayToC, tempUnit, m2ToDisplay, displayToM2, litresToPints } from '../../lib/humidity/format';

const DEFAULTS: DehumidifierInput = {
  lengthM: 4, widthM: 4, heightM: 3, ach: 1.5,
  indoorTempC: 27, indoorRH: 82, targetRH: 55,
  outsideTempC: 27, outsideRH: 88,
  occupants: 2, occupancyHours: 12, activityLevel: 'light',
  showersPerDay: 2, cookingMealsPerDay: 1, dryingClothesHours: 2,
  plantsCount: 0, aquariumLiters: 0, seepage: 'none',
};

export default function DehumidifierTab({ units }: { units: Units }) {
  const [input, setInput] = useState<DehumidifierInput>(DEFAULTS);
  const [presetId, setPresetId] = useState('goa-monsoon');
  const [roomType, setRoomType] = useState('hotel');
  const [dimUnit, setDimUnit] = useState<DimUnit>('m');
  const [sizeMode, setSizeMode] = useState<'dimensions'|'area'>('dimensions');
  // for area mode, keep internal area in m²
  const [areaM2, setAreaM2] = useState(16);

  const set = <K extends keyof DehumidifierInput>(k: K, v: DehumidifierInput[K]) => setInput(s => ({ ...s, [k]: v }));

  // sync dimensions when switching between modes
  const handleAreaChange = (v: number) => {
    const m2 = displayToM2(v, units);
    setAreaM2(m2);
    // derive length/width to keep volume consistent — assume square room for internal calc
    const side = Math.sqrt(Math.max(0.5, m2));
    set('lengthM', side);
    set('widthM', side);
  };
  const handleDimChange = (field: 'lengthM'|'widthM'|'heightM', displayVal: number) => {
    const m = dimUnitToM(displayVal, dimUnit);
    set(field, Math.max(0.05, m));
  };

  const result = useMemo(() => calculateDehumidifier(input), [input]);
  const cls = DEHUMIDIFIER_CLASSES[ (() => {
    const rated = result.ratedLDay;
    const idx = DEHUMIDIFIER_CLASSES.findIndex(c => rated <= c.maxLDay);
    return idx === -1 ? DEHUMIDIFIER_CLASSES.length-1 : idx;
  })() ];
  const roomLabel = ROOM_TYPES.find(r=>r.id===roomType)?.label ?? 'Custom';

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = CLIMATE_PRESETS.find(c=>c.id===id);
    if (p && p.id!=='custom') { set('outsideTempC', p.tempC); set('outsideRH', p.rh); }
  };
  const onRoomType = (id: string) => {
    setRoomType(id);
    const rt = ROOM_TYPES.find(r=>r.id===id);
    if (rt) set('ach', rt.ach);
  };
  const onAchChange = (v:number)=>{ set('ach', v); setRoomType('custom'); };
  const reset = () => { setInput(DEFAULTS); setPresetId('goa-monsoon'); setRoomType('hotel'); setDimUnit('m'); setSizeMode('dimensions'); setAreaM2(16); };

  // dim conversions for display
  const lDisp = mToDimUnit(input.lengthM, dimUnit);
  const wDisp = mToDimUnit(input.widthM, dimUnit);
  const hDisp = mToDimUnit(input.heightM, dimUnit);
  // ranges per dimUnit
  const dimRange = (unit: DimUnit) => {
    if (unit==='mm') return { min: 500, max: 20000, step: 10 };
    if (unit==='cm') return { min: 50, max: 2000, step: 1 };
    if (unit==='m') return { min: 0.5, max: 60, step: 0.1 };
    if (unit==='ft') return { min: 1, max: 200, step: 0.5 };
    return { min: 12, max: 2400, step: 1 }; // in
  };
  const hRange = (unit: DimUnit) => {
    if (unit==='mm') return { min: 1000, max: 6000, step: 10 };
    if (unit==='cm') return { min: 100, max: 600, step: 1 };
    if (unit==='m') return { min: 1, max: 15, step: 0.1 };
    if (unit==='ft') return { min: 3, max: 50, step: 0.25 };
    return { min: 36, max: 600, step: 1 };
  };

  const areaDisplay = m2ToDisplay(areaM2, units);
  const areaUnit = units==='metric' ? 'm²' : 'sq ft';
  const lDayUnit = units==='imperial' ? 'pints' : 'L';
  const totalDisplay = units==='imperial' ? litresToPints(result.totalLoadKgDay) : result.totalLoadKgDay;
  const requiredDisplay = units==='imperial' ? litresToPints(result.requiredOperatingLDay) : result.requiredOperatingLDay;
  const ratedDisplay = units==='imperial' ? litresToPints(result.ratedLDay) : result.ratedLDay;

  const report = [
    'DEHUMIDIFIER SIZING REPORT (ClimateRight — Worldwide)',
    '---------------------------------------------------',
    `Room type: ${roomLabel} | Mode: ${sizeMode==='area' ? `Direct area ${fmt(areaDisplay,1)} ${areaUnit}` : `${fmt(lDisp, dimUnit==='m'?1:0)} × ${fmt(wDisp, dimUnit==='m'?1:0)} ${dimUnit} × ${fmt(hDisp, dimUnit==='m'?1:0)} ${dimUnit}` } | Height ${fmt(hDisp,1)} ${dimUnit}`,
    `Volume ${fmt(result.volumeM3,1)} m³ | Floor area ${fmt(m2ToDisplay(result.areaM2, units),1)} ${areaUnit}`,
    `Conditions: indoor ${fmt(cToDisplay(input.indoorTempC, units),1)}${tempUnit(units)} / ${input.indoorRH}% RH → target ${input.targetRH}% RH`,
    `Outside air: ${fmt(cToDisplay(input.outsideTempC, units),1)}${tempUnit(units)} / ${input.outsideRH}% RH`,
    `Room type ACH: ${input.ach}`,
    '',
    'Moisture load breakdown:',
    ...result.loads.filter(l=>l.kgDay>0).map(l=>`  - ${l.label}: ${fmt(l.kgDay,2)} kg/day`),
    `Total load: ${fmt(result.totalLoadKgDay,2)} kg/day`,
    `Required operating: ${fmt(result.requiredOperatingLDay,1)} L/day`,
    `Rated @30°C/80%RH: ${fmt(result.ratedLDay,1)} L/day → ${cls.label} for ${roomLabel}`,
    `Rule-of-thumb: ${fmt(result.ruleOfThumbLDay,1)} L/day`,
  ].join('\n');

  const climateOptions = CLIMATE_PRESETS.map(c=>({
    value: c.id,
    label: `${c.city} — ${c.season} (${c.tempC}°C / ${c.rh}% RH)`,
    group: c.region
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-6">
        {/* Room details with mm + direct area */}
        <Card
          title="Room details"
          subtitle={`For ${roomLabel} — dimensions & ventilation`}
          icon={<Ruler className="h-4 w-4" />}
          action={
            <span className="hidden sm:flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:ring-sky-800">
              <Maximize2 className="h-3 w-3" /> {fmt(m2ToDisplay(result.areaM2, units),1)} {areaUnit} · {fmt(result.volumeM3,1)} m³
            </span>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            <div className="flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
              {(['dimensions','area'] as const).map(m=>(
                <button key={m} onClick={()=>setSizeMode(m)}
                  className={`rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${sizeMode===m ? 'bg-sky-600 text-white shadow' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'}`}>
                  {m==='dimensions' ? 'L × W × H' : 'Direct area (m² / sq ft)'}
                </button>
              ))}
            </div>
            {sizeMode==='dimensions' && (
              <div className="flex rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
                {(['mm','cm','m','ft','in'] as DimUnit[]).map(u=>(
                  <button key={u} onClick={()=>setDimUnit(u)}
                    className={`rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition ${dimUnit===u ? 'bg-white text-slate-900 shadow ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>

          {sizeMode==='dimensions' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Room / Selection type" value={roomType}
                options={ROOM_TYPES.map(r=>({ value:r.id, label:r.label }))} onChange={onRoomType}
                hint={ROOM_TYPES.find(r=>r.id===roomType)?.hint} />
              <NumberField label="Air changes / hour (ACH)" value={input.ach} onChange={onAchChange} min={0.1} max={8} step={0.1} unit="ACH"
                hint="Hotel with HVAC: 1–2.5 · Sealed basement: 0.4" />
              <NumberField label={`Length`} value={lDisp} onChange={v=>handleDimChange('lengthM', v)} {...dimRange(dimUnit)} unit={dimUnit} />
              <NumberField label={`Width`} value={wDisp} onChange={v=>handleDimChange('widthM', v)} {...dimRange(dimUnit)} unit={dimUnit} />
              <NumberField label={`Height (ceiling)`} value={hDisp} onChange={v=>handleDimChange('heightM', v)} {...hRange(dimUnit)} unit={dimUnit} />
              <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200 sm:col-span-2 flex items-center justify-between dark:bg-slate-900/60 dark:ring-slate-700">
                <div>
                  <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Space summary — {roomLabel}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Volume {fmt(result.volumeM3,1)} m³ · Floor {fmt(m2ToDisplay(result.areaM2, units),1)} {areaUnit} · {fmt(hDisp,1)} {dimUnit} height</p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400">{dimUnit} mode</span>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Room / Selection type" value={roomType}
                options={ROOM_TYPES.map(r=>({ value:r.id, label:r.label }))} onChange={onRoomType}
                hint={ROOM_TYPES.find(r=>r.id===roomType)?.hint} />
              <NumberField label="Air changes / hour (ACH)" value={input.ach} onChange={onAchChange} min={0.1} max={8} step={0.1} unit="ACH" />
              <NumberField label={`Floor area — direct input`} value={areaDisplay} onChange={handleAreaChange} min={1} max={units==='metric'?5000:54000} step={units==='metric'?1:10} unit={areaUnit}
                hint="If you already know the carpet area, enter it directly — no need for L×W" />
              <NumberField label={`Height (ceiling)`} value={hDisp} onChange={v=>handleDimChange('heightM', v)} {...hRange(dimUnit)} unit={dimUnit} />
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1 ring-1 ring-slate-200 sm:col-span-2 dark:bg-slate-900/60 dark:ring-slate-700">
                {(['mm','cm','m','ft','in'] as DimUnit[]).map(u=>(
                  <button key={u} onClick={()=>setDimUnit(u)}
                    className={`flex-1 rounded-lg py-1.5 text-[13px] font-semibold ${dimUnit===u ? 'bg-white shadow ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>{u} height</button>
                ))}
              </div>
              <div className="rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200 sm:col-span-2 dark:bg-emerald-500/10 dark:ring-emerald-800">
                <p className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-400">Direct area mode — {fmt(areaDisplay,1)} {areaUnit} × {fmt(hDisp,1)} {dimUnit} height</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-500">Volume {fmt(result.volumeM3,1)} m³ — used for moisture load calculation</p>
              </div>
            </div>
          )}
        </Card>

        <Card title="Indoor & outdoor conditions" subtitle="Target humidity + worldwide outside air" icon={<Thermometer className="h-4 w-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="Indoor temperature" value={cToDisplay(input.indoorTempC, units)} onChange={v=>set('indoorTempC', displayToC(v, units))}
              min={units==='metric'?5:41} max={units==='metric'?40:104} step={0.5} unit={tempUnit(units)} />
            <div className="space-y-2">
              <NumberField label="Current indoor RH" value={input.indoorRH} onChange={v=>set('indoorRH', v)} min={10} max={100} step={1} unit="%" />
              <ConditionBanner rh={input.indoorRH} />
            </div>
            <NumberField label="Target RH (setpoint)" value={input.targetRH} onChange={v=>set('targetRH', v)} min={20} max={70} step={1} unit="%"
              hint="ASHRAE comfort: 30–60% · Mould control ≤55%" />
            <div className="flex items-end">
              <div className="w-full rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:ring-slate-700">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Selected room</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{roomLabel} · {input.ach} ACH</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{ROOM_TYPES.find(r=>r.id===roomType)?.hint}</p>
              </div>
            </div>
            <div className="sm:col-span-2">
              <SearchableSelect label="Outside / ventilation air — worldwide climate (search city)"
                value={presetId} options={climateOptions} onChange={applyPreset}
                hint="Coastal humid air is the biggest load. Works worldwide — pick your city or choose Custom"
                placeholder="Search Goa, Dubai, Singapore, London..." />
            </div>
            <NumberField label="Outside temperature" value={cToDisplay(input.outsideTempC, units)} onChange={v=>set('outsideTempC', displayToC(v, units))}
              min={units==='metric'?-10:14} max={units==='metric'?50:122} step={0.5} unit={tempUnit(units)} />
            <NumberField label="Outside RH" value={input.outsideRH} onChange={v=>set('outsideRH', v)} min={5} max={100} step={1} unit="%" />
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
            <StatBox label="Dew point" value={fmt(result.dewPointC,1)} unit="°C" accent="slate" />
            <StatBox label="Moisture now" value={fmt(result.wCurrent,1)} unit="g/kg" accent="slate" />
            <StatBox label="Moisture target" value={fmt(result.wTarget,1)} unit="g/kg" accent="slate" />
          </div>
        </Card>

        <Card title="Moisture sources" subtitle={`For ${roomLabel} + daily activities`} icon={<Droplets className="h-4 w-4" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField label="People in room" value={input.occupants} onChange={v=>set('occupants', v)} min={0} max={50} step={1} unit="no." />
            <NumberField label="Hours occupied / day" value={input.occupancyHours} onChange={v=>set('occupancyHours', v)} min={1} max={24} step={1} unit="h" />
            <div className="sm:col-span-2">
              <p className="mb-1 text-[13px] font-medium text-slate-700 dark:text-slate-300">Occupant activity</p>
              <SegmentedControl options={ACTIVITY_LEVELS.map(a=>({ value:a.id, label:a.label, hint:a.hint }))} value={input.activityLevel} onChange={v=>set('activityLevel', v)} />
            </div>
            <NumberField label="Showers / baths / day" value={input.showersPerDay} onChange={v=>set('showersPerDay', v)} min={0} max={10} step={1} unit="no." hint="~0.25 kg each" />
            <NumberField label="Meals cooked / day" value={input.cookingMealsPerDay} onChange={v=>set('cookingMealsPerDay', v)} min={0} max={6} step={1} unit="no." hint="~0.3 kg each" />
            <NumberField label="Clothes drying indoors" value={input.dryingClothesHours} onChange={v=>set('dryingClothesHours', v)} min={0} max={24} step={1} unit="h/day" hint="~0.15 kg/h" />
            <NumberField label="Potted plants" value={input.plantsCount} onChange={v=>set('plantsCount', v)} min={0} max={100} step={1} unit="no." />
            <NumberField label="Open aquarium" value={input.aquariumLiters} onChange={v=>set('aquariumLiters', v)} min={0} max={1000} step={10} unit="L" />
            <div>
              <p className="mb-1 text-[13px] font-medium text-slate-700 dark:text-slate-300">Damp walls / seepage</p>
              <SegmentedControl options={SEEPAGE_LEVELS.map(s=>({ value:s.id, label:s.label, hint:s.hint }))} value={input.seepage} onChange={v=>set('seepage', v)} />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button onClick={reset} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200">
              <RefreshCw className="h-3.5 w-3.5" /> Reset to Goa monsoon example
            </button>
          </div>
        </Card>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100"><Target className="h-4 w-4 text-sky-600 dark:text-sky-400" /> Sizing result</h3>
            <Badge tone={result.needsDehumidification ? 'amber' : 'emerald'}>{result.needsDehumidification ? 'Dehumidify' : 'At / below target'}</Badge>
          </div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Selection for — <span className="text-sky-700 dark:text-sky-400">{roomLabel}</span> · {fmt(m2ToDisplay(result.areaM2, units),1)} {areaUnit}</p>
          {!result.needsDehumidification && (
            <div className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-medium leading-snug text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-800">
              Current RH at/below target — no dehumidification needed right now. Keep monsoon outside air to plan.
            </div>
          )}
          <Gauge value={ratedDisplay} max={Math.max(60, ratedDisplay*1.25)} accent="#0284c7" label="Required rated capacity" unit={lDayUnit} sub="quoted at 30°C / 80% RH (manufacturer rating)" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <StatBox label="Total moisture load" value={fmt(totalDisplay,1)} unit={lDayUnit} sub={`from ${result.loads.filter(l=>l.kgDay>0).length} sources`} />
            <StatBox label="Operating capacity" value={fmt(requiredDisplay,1)} unit={lDayUnit} sub={`at ${fmt(cToDisplay(input.indoorTempC, units),0)}${tempUnit(units)} — incl. 25% safety`} />
          </div>
          <div className="mt-4">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><ShieldAlert className="h-3.5 w-3.5" /> Capacity scale</p>
            <CapacityScale segments={DEHUMIDIFIER_CLASSES.map(c=>{ const raw=c.maxLDay===Infinity?DEHUMIDIFIER_CLASSES[6].maxLDay:c.maxLDay; const max=units==='imperial'?litresToPints(raw):raw; return { label:c.maxLDay===Infinity?`${Math.round(max)}+`:`${Math.round(max)}`, max }; })} value={ratedDisplay} markerLabel={`Your requirement ≈ ${fmt(ratedDisplay,1)} ${lDayUnit} → ${cls.label}`} accent="#0284c7" unit={units==='imperial'?'pints/day':'L/day'} />
          </div>
        </div>

        <RecommendationCard title={`Recommended dehumidifier — ${roomLabel}`} badge="Best match" badgeTone="sky"
          coverage={`Covers ~${cls.coverageM2} · ${cls.label}`} typical={cls.typical} notes={cls.notes} accent="#0284c7"
          items={[
            `For ${roomLabel} (${fmt(m2ToDisplay(result.areaM2, units),1)} ${areaUnit}): choose ≥ ${fmt(ratedDisplay,1)} ${lDayUnit} @30°C/80% RH`,
            `At ${fmt(cToDisplay(input.indoorTempC, units),0)}${tempUnit(units)} capacity → ~${Math.round(result.capacityFactor*100)}% of rating`,
            result.loadPerM2 > 0.2 ? 'High load per m² — consider 2 smaller units for even coverage' : 'Single portable unit is adequate'
          ]} />

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><CloudRain className="h-3.5 w-3.5" /> Where the moisture comes from</p>
          <LoadBreakdown loads={result.loads} total={result.totalLoadKgDay} units={units} lDayUnit={lDayUnit} />
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:ring-slate-700">
            Rule-of-thumb ({result.ruleOfThumbLabel}): ~{fmt(units==='imperial'?litresToPints(result.ruleOfThumbLDay):result.ruleOfThumbLDay,1)} {lDayUnit}. Your calc = <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.round((result.totalLoadKgDay/Math.max(result.ruleOfThumbLDay,0.1))*100)}%</span> of that.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400"><Sparkles className="h-3.5 w-3.5" /> Engineer's notes</p>
          <NotesList notes={[
            { text: `Ratings @30°C/80% RH. At ${fmt(cToDisplay(input.indoorTempC, units),0)}${tempUnit(units)} unit gives ~${Math.round(result.capacityFactor*100)}% of rating — size on rated figure.` },
            result.capacityFactor < 0.5 ? { text: 'Below ~15°C coils may frost — use desiccant (silica-gel) dehumidifier.', tone: 'warn' as const } : { text: 'Keep doors/windows closed and 15–30 cm wall clearance for best airflow.' },
            { text: 'Continuous drainage (hose to drain) is essential for 24×7 monsoon duty.' },
            { text: `For ${roomLabel} with AC: AC removes some moisture; dehumidifier covers ventilation + sources.` },
          ]} />
        </div>
        <CopyReport text={report} />
      </aside>
    </div>
  );
}
