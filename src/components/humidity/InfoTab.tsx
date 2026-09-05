import {
  BookOpen, Calculator, Droplets, Wind, Snowflake, ThermometerSun, Lightbulb, ShieldCheck, Ruler, FileText,
} from 'lucide-react';
import { Card, Badge } from './ui';

function Formula({ title, body, desc }: { title: string; body: string; desc: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-700/40">
      <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-1.5 overflow-x-auto rounded-lg bg-white px-3 py-2 font-mono text-[13px] font-semibold text-sky-800 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-sky-300 dark:ring-slate-600">
        {body}
      </p>
      <p className="mt-1.5 text-[12px] leading-snug text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
  );
}

export default function InfoTab() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card title="How humidifier & dehumidifier sizing works" icon={<BookOpen className="h-4 w-4" />} accent="violet">
        <div className="space-y-3 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            A dehumidifier or humidifier must add or remove water at the same average rate that moisture enters or
            leaves the room — this is called a <strong className="text-slate-800 dark:text-slate-100">steady-state moisture balance</strong>.
            Size too small and the unit runs 24/7 without ever reaching your setpoint; size too big and you waste money
            on capacity (and energy) you don't need.
          </p>
          <p>
            The engine behind this app uses standard psychrometrics (the physics of moist air): relative humidity (RH)
            alone isn't enough — we convert it to the <em>humidity ratio</em> (grams of water per kg of dry air, g/kg)
            so that ventilation, people and sources can be added up in consistent units.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge tone="sky">ASHRAE 55 comfort (30–60% RH)</Badge>
            <Badge tone="emerald">AHAM DH-1 rating standard</Badge>
            <Badge tone="amber">EN 810 / ISHRAE rating @ 30°C · 80% RH</Badge>
          </div>
        </div>
      </Card>

      <Card
        title="The calculations used"
        subtitle="Transparent, engineering-standard formulas — every result in the tool comes from these"
        icon={<Calculator className="h-4 w-4" />}
        accent="violet"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Formula
            title="1 · Saturation vapour pressure (Magnus)"
            body="es = 610.94 · e^(17.625·T / (243.04 + T))"
            desc="Vapour pressure of saturated air at temperature T (°C). Basis of all psychrometric conversions."
          />
          <Formula
            title="2 · Humidity ratio"
            body="W = 0.622 · e / (P − e)"
            desc="kg water per kg dry air. e = es × RH/100, P = 101.325 kPa. This is the 'absolute' moisture content."
          />
          <Formula
            title="3 · Dehumidifier ventilation load"
            body="Q = ρ · V · ACH · (W_out − W_target) · 24"
            desc="Moisture entering with humid outside air. ρ = 1.2 kg/m³, V = room volume, ACH = air changes/hour. Only counts when outside air is wetter than the target."
          />
          <Formula
            title="4 · Total dehumidifier capacity"
            body="C = (Σ sources) × 1.25 ÷ derating(T)"
            desc="Sum of ventilation, people, showers, cooking, laundry, plants, seepage. Safety factor 1.25. Derating converts to the 30°C/80% RH manufacturer rating."
          />
          <Formula
            title="5 · Humidifier ventilation loss"
            body="Q = ρ · V · ACH · (W_target − W_out)"
            desc="Moisture that dry outside air steals from the room, per hour. This is the main driver of humidifier size in dry conditions."
          />
          <Formula
            title="6 · Initial conditioning charge"
            body="M = ρ · V · (W_target − W_current) × k"
            desc="Water needed for the first fill — raising the room from current to target RH. k = 1.1–1.35 for absorption by wood, drywall, carpets."
          />
        </div>
      </Card>

      <Card
        title="Dehumidifier capacity vs. temperature"
        subtitle="Why a '20 L/day' unit won't give 20 L/day in a cool room"
        icon={<ThermometerSun className="h-4 w-4" />}
        accent="violet"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-500">
                <th className="py-2 pr-3">Room temperature</th>
                <th className="py-2 pr-3">30°C</th>
                <th className="py-2 pr-3">27°C</th>
                <th className="py-2 pr-3">24°C</th>
                <th className="py-2 pr-3">21°C</th>
                <th className="py-2 pr-3">18°C</th>
                <th className="py-2 pr-3">15°C</th>
                <th className="py-2 pr-3">12°C</th>
                <th className="py-2">10°C</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <td className="py-2 pr-3 font-medium text-slate-600 dark:text-slate-300">% of rated capacity</td>
                <td className="py-2 pr-3 font-bold text-emerald-600 dark:text-emerald-400">100%</td>
                <td className="py-2 pr-3 font-semibold text-emerald-600 dark:text-emerald-400">95%</td>
                <td className="py-2 pr-3 font-semibold text-emerald-600 dark:text-emerald-400">88%</td>
                <td className="py-2 pr-3 font-semibold text-amber-600 dark:text-amber-400">80%</td>
                <td className="py-2 pr-3 font-semibold text-amber-600 dark:text-amber-400">70%</td>
                <td className="py-2 pr-3 font-semibold text-amber-600 dark:text-amber-400">58%</td>
                <td className="py-2 pr-3 font-semibold text-red-600 dark:text-red-400">45%</td>
                <td className="py-2 font-semibold text-red-600 dark:text-red-400">35%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[12px] leading-snug text-slate-500 dark:text-slate-400">
          <strong className="text-slate-700 dark:text-slate-200">Why?</strong> A compressor dehumidifier works by condensing moisture on
          cold coils. The colder the room, the less water the air can give up — and below ~10°C the coils frost over.
          For cold rooms use a <strong className="text-slate-700 dark:text-slate-200">desiccant</strong> (silica-gel) dehumidifier instead.
        </p>
      </Card>

      <Card
        title="Typical moisture emission rates (reference data)"
        subtitle="Values built into the tool — widely published engineering figures"
        icon={<Droplets className="h-4 w-4" />}
        accent="violet"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Person (resting / sleeping)', '40 g/h'],
            ['Person (light activity)', '60 g/h'],
            ['Person (moderate / gym)', '90–140 g/h'],
            ['One shower', '~250 g per shower'],
            ['Cooking one meal', '~300 g'],
            ['Clothes drying indoors', '150 g/h'],
            ['Potted plant', '6 g/h'],
            ['Open aquarium', '20 g/h per 100 L'],
            ['Light wall seepage', '80 g/day per m² floor'],
            ['Heavy seepage / flooding', '400 g/day per m² floor'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-slate-200 dark:bg-slate-700/50 dark:ring-slate-600">
              <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">{k}</span>
              <span className="ml-2 whitespace-nowrap text-[12px] font-bold text-sky-700 dark:text-sky-400">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          title="When you need a DEHUMIDIFIER"
          subtitle="Coastal, tropical & monsoon climates"
          icon={<Wind className="h-4 w-4" />}
          accent="sky"
        >
          <ul className="space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
            {[
              'Indoor RH stays above 60–70% for days (monsoon, coastal or tropical air).',
              'Mould spots on walls, musty smell, damp clothes in wardrobes.',
              'Condensation on windows, tiles and AC grilles in the morning.',
              'Rooms with AC: AC cools but doesn’t always control humidity below ~60%.',
              'Basements, hotel rooms, server rooms, stores and water-damaged spaces.',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl bg-sky-50 px-3 py-2.5 text-[12px] leading-snug text-sky-800 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-800">
            <strong>Example:</strong> A 20–30 m² hotel room in a humid coastal monsoon typically needs a 16–20 L/day unit (rated @
            30°C/80%). Run it with continuous drainage and keep doors closed.
          </div>
        </Card>

        <Card
          title="When you need a HUMIDIFIER"
          subtitle="Dry winters, desert air & over-cooled AC rooms"
          icon={<Wind className="h-4 w-4" />}
          accent="emerald"
        >
          <ul className="space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
            {[
              'Indoor RH drops below 30% in winter (cold or desert climates).',
              'Static shocks, dry skin, itchy eyes, bloody noses, cracked lips.',
              'Wooden furniture and floors shrinking; musical instruments going out of tune.',
              'Heaters and some ACs bake moisture out of the air.',
              'Asthma/allergy sufferers — very dry air irritates airways.',
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <Droplets className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5 text-[12px] leading-snug text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800">
            <strong>Tip:</strong> Ultrasonic units are quiet & cheap but need RO/distilled water; evaporative units
            self-regulate and are maintenance-friendly. Target 40–55% RH.
          </div>
        </Card>
      </div>

      <Card
        title="Placement & operation tips"
        subtitle="Get the most out of your unit"
        icon={<Lightbulb className="h-4 w-4" />}
        accent="violet"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Keep doors & windows closed', 'The unit is fighting outside air otherwise — especially in monsoon or humid weather.'],
            ['15–30 cm wall clearance', 'Dehumidifiers need airflow on all sides; don’t push them into corners.'],
            ['Centre of the room, off the floor', 'Humidifiers: place 60–90 cm above the floor; moisture is heavier in cool air.'],
            ['Continuous drainage', 'For 24/7 duty, run a hose to a floor drain instead of emptying tanks.'],
            ['Clean filters monthly', 'Clogged filters cut airflow and capacity by 20–30%.'],
            ['Use a hygrometer', 'Verify actual RH — don’t rely on the unit’s own (often inaccurate) reading.'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-slate-200 dark:bg-slate-700/50 dark:ring-slate-600">
              <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{k}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-slate-400">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Standards & disclaimer" icon={<ShieldCheck className="h-4 w-4" />} accent="violet">
        <div className="space-y-2 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
          <p className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <strong className="text-slate-700 dark:text-slate-200">References:</strong> ASHRAE Handbook — Fundamentals (psychrometrics),
              ASHRAE Standard 55 (thermal comfort), ASHRAE 62.1 (ventilation), AHAM DH-1 (dehumidifier rating), EN 810
              (European dehumidifier rating), international practice.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>
              <strong className="text-slate-700 dark:text-slate-200">Accuracy:</strong> Results are engineering estimates for selection
              purposes (±15% worldwide). Always confirm the final unit with the manufacturer's performance data at your operating
              conditions, and involve an HVAC consultant for commercial/industrial installations.
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
