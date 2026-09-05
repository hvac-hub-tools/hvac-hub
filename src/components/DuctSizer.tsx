import React, { useState, useEffect } from 'react';
import {
  calculateDuctSide,
  calculateDuctSideFromVelocity,
  calculateDeFromFrictionLoss,
  calculateDeFromVelocity,
  calculateAllResults,
  roundToStandardSize,
  DuctResults
} from '../utils/ductCalculations';
import CircularDuctSizer from './CircularDuctSizer';
import ReferenceGuide from './ReferenceGuide';

type DuctType = 'rectangular' | 'circular';
type CalculationMode = 'findSide' | 'fullAnalysis';
type KnownParameter = 'frictionLoss' | 'velocity';

interface DuctSizerProps {
  theme?: string;
}

const DuctSizer: React.FC<DuctSizerProps> = ({ theme }) => {
  const [ductType, setDuctType] = useState<DuctType>('rectangular');
  const [mode, setMode] = useState<CalculationMode>('findSide');
  const [knownParam, setKnownParam] = useState<KnownParameter>('frictionLoss');
  
  const [cfm, setCfm] = useState<string>('1000');
  const [frictionLoss, setFrictionLoss] = useState<string>('0.08');
  const [velocity, setVelocity] = useState<string>('1500');
  const [knownSide, setKnownSide] = useState<string>('12');
  const [ductWidth, setDuctWidth] = useState<string>('24');
  const [ductHeight, setDuctHeight] = useState<string>('12');
  
  const [results, setResults] = useState<DuctResults | null>(null);
  const [calculatedSide, setCalculatedSide] = useState<number | null>(null);
  const [equivalentDiameter, setEquivalentDiameter] = useState<number | null>(null);
  const [standardSize, setStandardSize] = useState<number | null>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (ductType === 'rectangular') {
      if (mode === 'findSide') {
        calculateFindSide();
      } else {
        calculateFullAnalysis();
      }
    }
  }, [ductType, mode, knownParam, cfm, frictionLoss, velocity, knownSide, ductWidth, ductHeight]);

  const calculateFindSide = () => {
    const cfmVal = parseFloat(cfm);
    const knownSideVal = parseFloat(knownSide);
    if (isNaN(cfmVal) || isNaN(knownSideVal) || cfmVal <= 0 || knownSideVal <= 0) {
      setCalculatedSide(null); setEquivalentDiameter(null); setStandardSize(null); setResults(null);
      return;
    }
    let unknownSide: number;
    let de: number;
    if (knownParam === 'frictionLoss') {
      const flVal = parseFloat(frictionLoss);
      if (isNaN(flVal) || flVal <= 0) { setCalculatedSide(null); return; }
      de = calculateDeFromFrictionLoss(cfmVal, flVal);
      unknownSide = calculateDuctSide(cfmVal, flVal, knownSideVal, true);
    } else {
      const velVal = parseFloat(velocity);
      if (isNaN(velVal) || velVal <= 0) { setCalculatedSide(null); return; }
      de = calculateDeFromVelocity(cfmVal, velVal);
      unknownSide = calculateDuctSideFromVelocity(cfmVal, velVal, knownSideVal);
    }
    setCalculatedSide(unknownSide);
    setEquivalentDiameter(de);
    setStandardSize(roundToStandardSize(unknownSide));
    if (unknownSide > 0) {
      const fullResults = calculateAllResults(cfmVal, knownSideVal, unknownSide);
      setResults(fullResults);
    }
  };

  const calculateFullAnalysis = () => {
    const cfmVal = parseFloat(cfm);
    const widthVal = parseFloat(ductWidth);
    const heightVal = parseFloat(ductHeight);
    if (isNaN(cfmVal) || isNaN(widthVal) || isNaN(heightVal) || cfmVal <= 0 || widthVal <= 0 || heightVal <= 0) {
      setResults(null); return;
    }
    const fullResults = calculateAllResults(cfmVal, widthVal, heightVal);
    setResults(fullResults);
    setEquivalentDiameter(fullResults.equivalentDiameter);
  };

  // ─── Shared input style (Tailwind class string) ──────────────────────────────
  const inputCls = `w-full border rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
      : 'bg-white text-slate-900 border-slate-200 placeholder-slate-400'
  }`;

  return (
    <div className={`min-h-screen p-4 pb-20 transition-colors duration-300 ${isDark ? 'bg-[#0B1F3A]' : 'bg-slate-50'}`}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-3 shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>HVAC Duct Sizer Pro</h1>
          <p className={`${isDark ? 'text-blue-300' : 'text-blue-600'} text-sm mt-1 font-medium`}>Professional Duct Sizing Calculator</p>
        </div>

        {/* Duct Type */}
        <div className={`rounded-2xl p-4 mb-4 border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <label className={`${isDark ? 'text-blue-300' : 'text-slate-700'} text-sm font-semibold mb-3 block`}>Duct Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setDuctType('rectangular')} className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              ductType === 'rectangular'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
              <span className="text-lg">▭</span> Rectangular
            </button>
            <button onClick={() => setDuctType('circular')} className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              ductType === 'circular'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
              <span className="text-lg">○</span> Circular
            </button>
          </div>
        </div>

        {/* ✅ FIX: theme prop pass kiya */}
        {ductType === 'circular' && <CircularDuctSizer theme={theme === 'dark' ? 'dark' : 'light'} />}

        {ductType === 'rectangular' && (
          <>
            {/* Calculation Mode */}
            <div className={`rounded-2xl p-4 mb-4 border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <label className={`${isDark ? 'text-blue-300' : 'text-slate-700'} text-sm font-semibold mb-3 block`}>Calculation Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMode('findSide')} className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  mode === 'findSide'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>📐 Find Duct Side</button>
                <button onClick={() => setMode('fullAnalysis')} className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  mode === 'fullAnalysis'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>📊 Full Analysis</button>
              </div>
            </div>

            {mode === 'findSide' && (
              <>
                {/* Known Parameter */}
                <div className={`rounded-2xl p-4 mb-4 border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <label className={`${isDark ? 'text-blue-300' : 'text-slate-700'} text-sm font-semibold mb-3 block`}>Select Known Parameter</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setKnownParam('frictionLoss')} className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      knownParam === 'frictionLoss'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>📉 Friction Loss</button>
                    <button onClick={() => setKnownParam('velocity')} className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      knownParam === 'velocity'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                        : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}>💨 Velocity</button>
                  </div>
                </div>

                {/* Inputs */}
                <div className={`rounded-2xl p-4 mb-4 border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h3 className={`${isDark ? 'text-white' : 'text-slate-800'} font-bold mb-4 flex items-center gap-2`}>
                    <span className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-600">📥</span>
                    Input Values
                  </h3>
                  <div className="mb-4">
                    <label className={`${isDark ? 'text-blue-300' : 'text-slate-600'} text-xs font-bold mb-2 block uppercase tracking-wider`}>Flow Rate (CFM)</label>
                    <div className="relative">
                      <input type="number" value={cfm} onChange={(e) => setCfm(e.target.value)} className={`${inputCls} pr-16`} />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CFM</span>
                    </div>
                  </div>
                  {knownParam === 'frictionLoss' ? (
                    <div className="mb-4">
                      <label className={`${isDark ? 'text-blue-300' : 'text-slate-600'} text-xs font-bold mb-2 block uppercase tracking-wider`}>Friction Loss</label>
                      <div className="relative">
                        <input type="number" step="0.01" value={frictionLoss} onChange={(e) => setFrictionLoss(e.target.value)} className={`${inputCls} pr-24`} />
                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>in. w.g.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <label className={`${isDark ? 'text-blue-300' : 'text-slate-600'} text-xs font-bold mb-2 block uppercase tracking-wider`}>Velocity</label>
                      <div className="relative">
                        <input type="number" value={velocity} onChange={(e) => setVelocity(e.target.value)} className={`${inputCls} pr-20`} />
                        <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ft/min</span>
                      </div>
                    </div>
                  )}
                  <div className="mb-2">
                    <label className={`${isDark ? 'text-blue-300' : 'text-slate-600'} text-xs font-bold mb-2 block uppercase tracking-wider`}>Known Duct Side</label>
                    <div className="relative">
                      <input type="number" value={knownSide} onChange={(e) => setKnownSide(e.target.value)} className={`${inputCls} pr-20`} />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>inches</span>
                    </div>
                  </div>
                </div>

                {/* Calculated Result */}
                {calculatedSide !== null && calculatedSide > 0 && (
                  <div className={`rounded-2xl p-4 mb-4 border transition-all ${isDark ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200 shadow-sm'}`}>
                    <h3 className={`${isDark ? 'text-green-300' : 'text-green-800'} font-bold mb-4 flex items-center gap-2`}>
                      <span className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center text-green-600">✅</span>
                      Calculated Duct Size
                    </h3>
                    <div className={`${isDark ? 'bg-green-800/30 border-green-600/30' : 'bg-white border-green-100'} rounded-xl p-4 mb-4 text-center border shadow-sm`}>
                      <div className={`${isDark ? 'text-green-300' : 'text-green-600'} text-xs font-bold uppercase tracking-widest mb-1`}>Required Dimensions</div>
                      <div className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'} my-2`}>
                        {parseFloat(knownSide).toFixed(0)}" × {calculatedSide.toFixed(1)}"
                      </div>
                      <div className="inline-block bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full mt-2 shadow-sm">
                        Standard: {parseFloat(knownSide).toFixed(0)}" × {standardSize}"
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-800/50 border-slate-600/50' : 'bg-white border-slate-200'}`}>
                        <div className={`${isDark ? 'text-blue-300' : 'text-slate-500'} text-xs font-bold`}>Equiv. Diameter</div>
                        <div className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold text-lg`}>{equivalentDiameter?.toFixed(2)}"</div>
                      </div>
                      <div className={`rounded-xl p-3 border ${isDark ? 'bg-slate-800/50 border-slate-600/50' : 'bg-white border-slate-200'}`}>
                        <div className={`${isDark ? 'text-blue-300' : 'text-slate-500'} text-xs font-bold`}>Flow Area</div>
                        <div className={`${isDark ? 'text-white' : 'text-slate-900'} font-bold text-lg`}>{results?.flowArea.toFixed(3)} ft²</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Full Analysis Inputs */}
            {mode === 'fullAnalysis' && (
              <div className={`rounded-2xl p-4 mb-4 border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`${isDark ? 'text-white' : 'text-slate-800'} font-bold mb-4 flex items-center gap-2`}>
                  <span className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-600">📥</span>
                  Input Values
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={`${isDark ? 'text-blue-300' : 'text-slate-600'} text-xs font-bold mb-2 block uppercase tracking-wider`}>Flow Rate (CFM)</label>
                    <div className="relative">
                      <input type="number" value={cfm} onChange={(e) => setCfm(e.target.value)} className={`${inputCls} pr-16`} />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CFM</span>
                    </div>
                  </div>
                  <div>
                    <label className={`${isDark ? 'text-blue-300' : 'text-slate-600'} text-xs font-bold mb-2 block uppercase tracking-wider`}>Duct Width</label>
                    <div className="relative">
                      <input type="number" value={ductWidth} onChange={(e) => setDuctWidth(e.target.value)} className={`${inputCls} pr-20`} />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>inches</span>
                    </div>
                  </div>
                  <div>
                    <label className={`${isDark ? 'text-blue-300' : 'text-slate-600'} text-xs font-bold mb-2 block uppercase tracking-wider`}>Duct Height</label>
                    <div className="relative">
                      <input type="number" value={ductHeight} onChange={(e) => setDuctHeight(e.target.value)} className={`${inputCls} pr-20`} />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>inches</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {results && (
              <div className={`rounded-2xl p-4 mb-4 border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-md'}`}>
                <h3 className={`${isDark ? 'text-white' : 'text-slate-800'} font-bold mb-4 flex items-center gap-2`}>
                  <span className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-600">📊</span>
                  Complete Analysis
                </h3>
                <div className="space-y-3">
                  <ResultRow label="Air Velocity" value={results.velocity.toFixed(0)} unit="ft/min" icon="💨" color="blue" isDark={isDark} />
                  <ResultRow label="Velocity Pressure" value={results.velocityPressure.toFixed(4)} unit="in. w.g." icon="📊" color="purple" isDark={isDark} />
                  <ResultRow label="Friction Loss" value={results.frictionLoss.toFixed(4)} unit="in. w.g." icon="📉" color="orange" isDark={isDark} />
                  <ResultRow label="Equivalent Diameter" value={results.equivalentDiameter.toFixed(2)} unit="inches" icon="⭕" color="green" isDark={isDark} />
                  <ResultRow label="Flow Area" value={results.flowArea.toFixed(4)} unit="ft²" icon="📐" color="cyan" isDark={isDark} />
                  <ResultRow label="Reynolds Number" value={results.reynoldsNumber.toFixed(0)} unit="" icon="🔢" color="pink" isDark={isDark} />
                  <ResultRow label="Friction Factor" value={results.frictionFactor.toFixed(5)} unit="" icon="⚡" color="yellow" isDark={isDark} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Formula Reference */}
        <div className={`rounded-2xl p-4 border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className={`${isDark ? 'text-white' : 'text-slate-800'} font-bold mb-3 flex items-center gap-2`}>
            <span className="w-8 h-8 bg-slate-600/20 rounded-lg flex items-center justify-center text-slate-600">📚</span>
            Formulas & Standards
          </h3>
          <div className={`text-xs space-y-2 rounded-xl p-4 ${isDark ? 'text-slate-300 bg-slate-900/50' : 'text-slate-700 bg-slate-50 border border-slate-100'}`}>
            <p><span className="text-blue-600 font-bold">Equiv. Diameter:</span> De = 1.30 × (W×H)^0.625 / (W+H)^0.25</p>
            <p><span className="text-blue-600 font-bold">Velocity:</span> V = CFM / Area (ft/min)</p>
            <p><span className="text-blue-600 font-bold">Velocity Pressure:</span> Pv = (V/4005)² in. w.g.</p>
            <p><span className="text-blue-600 font-bold">Friction Loss:</span> Darcy-Weisbach + Colebrook-White</p>
            <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} mt-2 pt-2`}>
              <p className="text-slate-500 font-medium italic">✓ Based on ASHRAE Fundamentals</p>
              <p className="text-slate-500 font-medium italic">✓ Galvanized steel roughness: 0.0003 ft</p>
            </div>
          </div>
        </div>

        <ReferenceGuide isDark={theme === 'dark'} />

        <div className="text-center mt-6 text-slate-500 text-xs font-medium">
          <p>HVAC Duct Sizer Pro</p>
          <p>Calculations based on ASHRAE standards</p>
        </div>
      </div>
    </div>
  );
};

const ResultRow = ({ label, value, unit, icon, color, isDark }: any) => {
  const colorMap: any = {
    blue:   isDark ? "from-blue-900/40 to-blue-800/20 border-blue-700/30"     : "from-blue-50 to-white border-blue-100 shadow-sm",
    purple: isDark ? "from-purple-900/40 to-purple-800/20 border-purple-700/30" : "from-purple-50 to-white border-purple-100 shadow-sm",
    orange: isDark ? "from-orange-900/40 to-orange-800/20 border-orange-700/30" : "from-orange-50 to-white border-orange-100 shadow-sm",
    green:  isDark ? "from-green-900/40 to-green-800/20 border-green-700/30"   : "from-green-50 to-white border-green-100 shadow-sm",
    cyan:   isDark ? "from-cyan-900/40 to-cyan-800/20 border-cyan-700/30"     : "from-cyan-50 to-white border-cyan-100 shadow-sm",
    pink:   isDark ? "from-pink-900/40 to-pink-800/20 border-pink-700/30"     : "from-pink-50 to-white border-pink-100 shadow-sm",
    yellow: isDark ? "from-yellow-900/40 to-yellow-800/20 border-yellow-700/30" : "from-yellow-50 to-white border-yellow-100 shadow-sm",
  };
  const iconBgMap: any = {
    blue: "bg-blue-600", purple: "bg-purple-600", orange: "bg-orange-600",
    green: "bg-green-600", cyan: "bg-cyan-600", pink: "bg-pink-600", yellow: "bg-yellow-600",
  };
  return (
    <div className={`bg-gradient-to-r ${colorMap[color]} rounded-xl p-4 flex justify-between items-center border transition-all`}>
      <div>
        <div className={`${isDark ? 'text-blue-300' : 'text-slate-600'} text-xs font-bold uppercase tracking-tight`}>{label}</div>
        <div className={`${isDark ? 'text-white' : 'text-slate-900'} font-black text-xl`}>
          {value} <span className="text-xs font-bold opacity-60 ml-1">{unit}</span>
        </div>
      </div>
      <div className={`w-10 h-10 ${iconBgMap[color]} bg-opacity-10 rounded-lg flex items-center justify-center text-xl`}>{icon}</div>
    </div>
  );
};

export default DuctSizer;