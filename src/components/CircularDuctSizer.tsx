import React, { useState, useEffect } from 'react';
import {
  calculateVelocityPressure,
  calculateFrictionLoss,
  calculateReynoldsNumber,
  calculateFrictionFactor
} from '../utils/ductCalculations';

interface Props {
  theme?: 'dark' | 'light';
}

const CircularDuctSizer: React.FC<Props> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';

  const [cfm, setCfm] = useState<string>('1000');
  const [diameter, setDiameter] = useState<string>('12');
  const [frictionLossInput, setFrictionLossInput] = useState<string>('0.08');
  const [velocityInput, setVelocityInput] = useState<string>('1500');
  const [mode, setMode] = useState<'analyze' | 'findDiameter'>('analyze');
  const [findBy, setFindBy] = useState<'friction' | 'velocity'>('friction');
  
  const [results, setResults] = useState<{
    velocity: number;
    velocityPressure: number;
    frictionLoss: number;
    flowArea: number;
    reynoldsNumber: number;
    frictionFactor: number;
    calculatedDiameter?: number;
  } | null>(null);

  useEffect(() => {
    calculate();
  }, [cfm, diameter, frictionLossInput, velocityInput, mode, findBy]);

  const calculate = () => {
    const cfmVal = parseFloat(cfm);
    
    if (mode === 'analyze') {
      const diaVal = parseFloat(diameter);
      if (isNaN(cfmVal) || isNaN(diaVal) || cfmVal <= 0 || diaVal <= 0) {
        setResults(null);
        return;
      }
      
      const flowArea = Math.PI * Math.pow(diaVal / 24, 2);
      const velocity = cfmVal / flowArea;
      const velocityPressure = calculateVelocityPressure(velocity);
      const frictionLoss = calculateFrictionLoss(velocity, diaVal);
      const reynoldsNumber = calculateReynoldsNumber(velocity, diaVal);
      const frictionFactor = calculateFrictionFactor(reynoldsNumber, diaVal);
      
      setResults({ velocity, velocityPressure, frictionLoss, flowArea, reynoldsNumber, frictionFactor });
    } else {
      if (findBy === 'friction') {
        const fl = parseFloat(frictionLossInput);
        if (isNaN(cfmVal) || isNaN(fl) || cfmVal <= 0 || fl <= 0) { setResults(null); return; }
        
        const calculatedDiameter = Math.pow((0.109136 * Math.pow(cfmVal, 1.9)) / fl, 1 / 5.02);
        const flowArea = Math.PI * Math.pow(calculatedDiameter / 24, 2);
        const velocity = cfmVal / flowArea;
        const velocityPressure = calculateVelocityPressure(velocity);
        const reynoldsNumber = calculateReynoldsNumber(velocity, calculatedDiameter);
        const frictionFactor = calculateFrictionFactor(reynoldsNumber, calculatedDiameter);
        
        setResults({ velocity, velocityPressure, frictionLoss: fl, flowArea, reynoldsNumber, frictionFactor, calculatedDiameter });
      } else {
        const vel = parseFloat(velocityInput);
        if (isNaN(cfmVal) || isNaN(vel) || cfmVal <= 0 || vel <= 0) { setResults(null); return; }
        
        const flowArea = cfmVal / vel;
        const calculatedDiameter = 2 * Math.sqrt(flowArea / Math.PI) * 12;
        const velocityPressure = calculateVelocityPressure(vel);
        const frictionLoss = calculateFrictionLoss(vel, calculatedDiameter);
        const reynoldsNumber = calculateReynoldsNumber(vel, calculatedDiameter);
        const frictionFactor = calculateFrictionFactor(reynoldsNumber, calculatedDiameter);
        
        setResults({ velocity: vel, velocityPressure, frictionLoss, flowArea, reynoldsNumber, frictionFactor, calculatedDiameter });
      }
    }
  };

  const getStandardSize = (size: number): number => {
    const standards = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 48, 52, 56, 60];
    let closest = standards[0];
    let minDiff = Math.abs(size - closest);
    for (const s of standards) {
      if (Math.abs(size - s) < minDiff) { minDiff = Math.abs(size - s); closest = s; }
    }
    return closest;
  };

  // ─── Theme-aware style helpers ───────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block',
    color: isDark ? '#93C5FD' : '#2563EB',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '14px',
    color: isDark ? 'white' : '#1E293B',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: isDark ? '#1E3A5F' : '#F8FAFC',
    border: isDark ? '1px solid #334D6E' : '1px solid #CBD5E1',
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '16px',
    color: isDark ? 'white' : '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    WebkitTextFillColor: isDark ? 'white' : '#0F172A',
  };

  const modeBtn = (active: boolean, accent: 'blue' | 'green'): React.CSSProperties => {
    const colors = {
      blue: { active: '#2563EB', shadow: 'rgba(37,99,235,0.35)' },
      green: { active: '#059669', shadow: 'rgba(5,150,105,0.35)' },
    };
    return {
      flex: 1,
      padding: '10px 8px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      background: active ? colors[accent].active : (isDark ? '#1E3A5F' : '#F1F5F9'),
      color: active ? 'white' : (isDark ? '#94A3B8' : '#64748B'),
      boxShadow: active ? `0 4px 12px ${colors[accent].shadow}` : 'none',
    };
  };

  const resultCard = (bg: string, border: string): React.CSSProperties => ({
    background: isDark ? bg : `${border}10`,
    border: isDark ? `1px solid ${border}40` : `1px solid ${border}30`,
    borderRadius: '14px',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  });

  return (
    <div style={{ padding: '4px 0' }}>

      {/* ── Mode Selection ── */}
      <div style={cardStyle}>
        <label style={labelStyle}>Calculation Mode</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setMode('analyze')} style={modeBtn(mode === 'analyze', 'blue')}>
            📊 Full Analysis
          </button>
          <button onClick={() => setMode('findDiameter')} style={modeBtn(mode === 'findDiameter', 'blue')}>
            📐 Find Diameter
          </button>
        </div>
      </div>

      {/* ── Find By (only in findDiameter mode) ── */}
      {mode === 'findDiameter' && (
        <div style={cardStyle}>
          <label style={labelStyle}>Find Diameter Using</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setFindBy('friction')} style={modeBtn(findBy === 'friction', 'green')}>
              📉 Friction Loss
            </button>
            <button onClick={() => setFindBy('velocity')} style={modeBtn(findBy === 'velocity', 'green')}>
              💨 Velocity
            </button>
          </div>
        </div>
      )}

      {/* ── Input Fields ── */}
      <div style={cardStyle}>
        <h3 style={headingStyle}>📥 Input Values</h3>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Flow Rate (CFM)</label>
          <input
            type="number"
            value={cfm}
            onChange={(e) => setCfm(e.target.value)}
            placeholder="Enter CFM"
            style={inputStyle}
          />
        </div>

        {mode === 'analyze' ? (
          <div>
            <label style={labelStyle}>Duct Diameter (inches)</label>
            <input
              type="number"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="Enter diameter"
              style={inputStyle}
            />
          </div>
        ) : findBy === 'friction' ? (
          <div>
            <label style={labelStyle}>Friction Loss (in. w.g. per 100 ft)</label>
            <input
              type="number"
              step="0.01"
              value={frictionLossInput}
              onChange={(e) => setFrictionLossInput(e.target.value)}
              placeholder="e.g., 0.08"
              style={inputStyle}
            />
          </div>
        ) : (
          <div>
            <label style={labelStyle}>Velocity (ft/min)</label>
            <input
              type="number"
              value={velocityInput}
              onChange={(e) => setVelocityInput(e.target.value)}
              placeholder="e.g., 1500"
              style={inputStyle}
            />
          </div>
        )}
      </div>

      {/* ── Calculated Diameter Result ── */}
      {mode === 'findDiameter' && results?.calculatedDiameter && (
        <div style={{
          background: isDark ? 'rgba(5,150,105,0.12)' : '#ECFDF5',
          border: isDark ? '1px solid rgba(5,150,105,0.35)' : '1px solid #6EE7B7',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '12px',
        }}>
          <h3 style={{ ...headingStyle, color: isDark ? '#34D399' : '#059669' }}>✅ Calculated Diameter</h3>
          <div style={{
            background: isDark ? 'rgba(5,150,105,0.15)' : 'white',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '12px', color: isDark ? '#6EE7B7' : '#059669', marginBottom: '4px' }}>Required Diameter</div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: isDark ? 'white' : '#1E293B' }}>
              {results.calculatedDiameter.toFixed(2)}"
            </div>
            <div style={{ fontSize: '13px', color: isDark ? '#34D399' : '#059669', marginTop: '6px' }}>
              Standard Size: {getStandardSize(results.calculatedDiameter)}"
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {results && (
        <div style={cardStyle}>
          <h3 style={headingStyle}>📊 Analysis Results</h3>

          {/* Velocity */}
          <div style={resultCard('rgba(37,99,235,0.12)', '#3B82F6')}>
            <div>
              <div style={{ fontSize: '12px', color: isDark ? '#93C5FD' : '#2563EB', marginBottom: '2px' }}>Air Velocity</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: isDark ? 'white' : '#1E293B' }}>
                {results.velocity.toFixed(0)} ft/min
              </div>
            </div>
            <span style={{ fontSize: '28px' }}>💨</span>
          </div>

          {/* Velocity Pressure */}
          <div style={resultCard('rgba(124,58,237,0.12)', '#8B5CF6')}>
            <div>
              <div style={{ fontSize: '12px', color: isDark ? '#C4B5FD' : '#7C3AED', marginBottom: '2px' }}>Velocity Pressure</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: isDark ? 'white' : '#1E293B' }}>
                {results.velocityPressure.toFixed(4)} in. w.g.
              </div>
            </div>
            <span style={{ fontSize: '28px' }}>📊</span>
          </div>

          {/* Friction Loss */}
          <div style={resultCard('rgba(234,88,12,0.12)', '#F97316')}>
            <div>
              <div style={{ fontSize: '12px', color: isDark ? '#FDBA74' : '#EA580C', marginBottom: '2px' }}>Friction Loss (per 100 ft)</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: isDark ? 'white' : '#1E293B' }}>
                {results.frictionLoss.toFixed(4)} in. w.g.
              </div>
            </div>
            <span style={{ fontSize: '28px' }}>📉</span>
          </div>

          {/* Flow Area */}
          <div style={resultCard('rgba(6,182,212,0.12)', '#06B6D4')}>
            <div>
              <div style={{ fontSize: '12px', color: isDark ? '#67E8F9' : '#0891B2', marginBottom: '2px' }}>Flow Area</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: isDark ? 'white' : '#1E293B' }}>
                {results.flowArea.toFixed(4)} ft²
              </div>
            </div>
            <span style={{ fontSize: '28px' }}>📐</span>
          </div>

          {/* Reynolds Number */}
          <div style={{ ...resultCard('rgba(236,72,153,0.12)', '#EC4899'), marginBottom: 0 }}>
            <div>
              <div style={{ fontSize: '12px', color: isDark ? '#F9A8D4' : '#DB2777', marginBottom: '2px' }}>Reynolds Number</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: isDark ? 'white' : '#1E293B' }}>
                {results.reynoldsNumber.toFixed(0)}
              </div>
            </div>
            <span style={{ fontSize: '28px' }}>🔢</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircularDuctSizer;