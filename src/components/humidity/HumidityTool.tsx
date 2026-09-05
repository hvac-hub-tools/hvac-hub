import { useState } from 'react';
import { SegmentedControl } from './ui';
import { Units } from '../../lib/humidity/format';
import DehumidifierTab from './DehumidifierTab';
import HumidifierTab from './HumidifierTab';
import InfoTab from './InfoTab';

type Tab = 'dehumidifier' | 'humidifier' | 'info';

/**
 * Entry point for the Humidity Sizing tool.
 * Mount this from App.tsx the same way other tools (PsychrometricCalculator,
 * HeatLoad, etc.) are mounted — see integration notes for the exact wiring.
 */
export default function HumidityTool({ theme = 'light' }: { theme?: 'dark' | 'light' }) {
  const [tab, setTab] = useState<Tab>('dehumidifier');
  const [units, setUnits] = useState<Units>('metric');

  // App.tsx tracks theme itself (via useTheme) and never relies on Tailwind's
  // `dark:` variant anywhere else — it just threads an isDark boolean through
  // inline styles. This module was built using Tailwind's `dark:` classes
  // instead, which only respond to a `dark` class somewhere up the DOM tree
  // (with darkMode: 'class' in tailwind.config). App.tsx already passes
  // `theme` in as a prop, so we just apply that class locally here — every
  // `dark:` class inside this subtree will then follow the app's real
  // day/night toggle instead of doing nothing (or following the OS scheme).
  return (
    <div className={theme === 'dark' ? 'dark' : undefined}>
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Humidity Sizing Tool
          </h1>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Dehumidifier &amp; humidifier capacity calculator
          </p>
        </div>
        <div className="w-full sm:w-56">
          <SegmentedControl
            options={[
              { value: 'metric', label: 'Metric' },
              { value: 'imperial', label: 'Imperial' },
            ]}
            value={units}
            onChange={setUnits}
          />
        </div>
      </div>

      <SegmentedControl
        options={[
          { value: 'dehumidifier', label: 'Dehumidifier' },
          { value: 'humidifier', label: 'Humidifier' },
          { value: 'info', label: 'How it works' },
        ]}
        value={tab}
        onChange={setTab}
        accent="sky"
      />

      {tab === 'dehumidifier' && <DehumidifierTab units={units} />}
      {tab === 'humidifier' && <HumidifierTab units={units} />}
      {tab === 'info' && <InfoTab />}
    </div>
    </div>
  );
}
