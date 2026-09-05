// ============================================================
//  DaikinVRVComingSoon.jsx
//  Updated Coming Soon — Full VRV Selection Tool preview
//  Supports dark + light mode via { theme } prop from App.tsx
//  TEMPORARY — replace with actual tool when ready
// ============================================================

import { useEffect, useState } from "react";
import {
  Wind, GitBranch, Activity, Zap, Shield,
  ChevronRight, Layers, LayoutGrid, CheckCircle2, Clock
} from "lucide-react";

// ── 3-Step workflow (mirrors the screenshot) ──
const STEPS = [
  { num: "01", title: "System Structure",      desc: "Select ODU model, add IDU units & define REFNET branch layout.",         color: "#06B6D4", done: true  },
  { num: "02", title: "Refrigerant Pipe Calc", desc: "Auto pipe diameter selection for liquid & suction lines per branch.",     color: "#8B5CF6", done: false },
  { num: "03", title: "System Calculation",    desc: "Capacity correction, piping loss & final compliance validation.",         color: "#10B981", done: false },
];

// ── Full feature list ──
const FEATURES = [
  { icon: <LayoutGrid  size={15} />, color: "#06B6D4", title: "Visual System Diagram",       desc: "Interactive ODU → REFNET → IDU tree diagram, just like Daikin's own selection software." },
  { icon: <GitBranch   size={15} />, color: "#8B5CF6", title: "REFNET Joint Sizing",         desc: "FQZHN-01C / 02C / 03C joint selection with branch pipe auto-sizing." },
  { icon: <Activity    size={15} />, color: "#F59E0B", title: "Pipe Diameter Selection",     desc: "Liquid & suction line Ø from Daikin Engineering Data — VRV-IV & VRV-5 tables." },
  { icon: <Layers      size={15} />, color: "#EF4444", title: "Length & Level Validation",   desc: "Max equivalent length, first branch height diff & total level difference checks." },
  { icon: <Zap         size={15} />, color: "#10B981", title: "Capacity Correction Factors", desc: "Auto correction for pipe length & level difference on each IDU." },
  { icon: <Shield      size={15} />, color: "#EC4899", title: "Compliance & BOQ Export",     desc: "Flags out-of-range values & exports pipe schedule for BOQ submission." },
];

const SERIES_TAGS = ["VRV-IV", "VRV-5", "R-410A", "R-32", "REFNET", "FQZHN"];

// ── Mini animated pipe diagram ──
function PipeDiagram({ isDark }) {
  return (
    <svg viewBox="0 0 340 110" style={{ width: "100%", opacity: isDark ? 0.6 : 0.38 }} fill="none">
      <style>{`
        @keyframes liqFlow { from{stroke-dashoffset:240}to{stroke-dashoffset:0} }
        @keyframes sucFlow { from{stroke-dashoffset:240}to{stroke-dashoffset:0} }
        .liq2{animation:liqFlow 3s linear infinite;}
        .suc2{animation:sucFlow 2.4s linear infinite reverse;}
      `}</style>

      {/* ODU */}
      <rect x="2" y="36" width="52" height="38" rx="7"
        fill={isDark?"rgba(6,182,212,0.14)":"rgba(6,182,212,0.09)"}
        stroke="#06B6D4" strokeWidth="1.3"/>
      <text x="28" y="51" textAnchor="middle" fill="#06B6D4" fontSize="6.5" fontWeight="800">ODU</text>
      <text x="28" y="63" textAnchor="middle" fill="#06B6D4" fontSize="5.2">VRV-IV/5</text>

      {/* Main trunk — liquid */}
      <path d="M54 46 H145" stroke="#06B6D4" strokeWidth="2.2" strokeDasharray="14 6" className="liq2" strokeLinecap="round"/>
      {/* Main trunk — suction */}
      <path d="M54 64 H145" stroke="#8B5CF6" strokeWidth="2.2" strokeDasharray="14 6" className="suc2" strokeLinecap="round"/>

      {/* REFNET-1 */}
      <circle cx="145" cy="46" r="5" fill="#06B6D4" opacity="0.9"/>
      <circle cx="145" cy="64" r="5" fill="#8B5CF6" opacity="0.9"/>
      <text x="145" y="38" textAnchor="middle" fill="#06B6D4" fontSize="5" fontWeight="700">FQZHN</text>

      {/* Branch top */}
      <path d="M150 46 H200 V22" stroke="#06B6D4" strokeWidth="1.6" strokeDasharray="9 5" className="liq2" strokeLinecap="round"/>
      <path d="M150 64 H200 V88" stroke="#8B5CF6" strokeWidth="1.6" strokeDasharray="9 5" className="suc2" strokeLinecap="round"/>

      {/* REFNET-2 top */}
      <circle cx="200" cy="22" r="4" fill="#06B6D4" opacity="0.8"/>
      <circle cx="200" cy="88" r="4" fill="#8B5CF6" opacity="0.8"/>

      {/* Branch top IDUs */}
      <path d="M204 22 H250" stroke="#06B6D4" strokeWidth="1.4" strokeDasharray="7 4" className="liq2" strokeLinecap="round"/>
      <path d="M204 88 H250" stroke="#8B5CF6" strokeWidth="1.4" strokeDasharray="7 4" className="suc2" strokeLinecap="round"/>
      <path d="M204 22 H230 V10" stroke="#06B6D4" strokeWidth="1.2" strokeDasharray="6 4" className="liq2" strokeLinecap="round"/>

      {/* IDU boxes */}
      {[
        [252, 14, "IDU-1"], [252, 48, "IDU-2"],
        [252, 80, "IDU-3"], [300, 14, "IDU-4"],
      ].map(([x,y,label]) => (
        <g key={label}>
          <rect x={x} y={y} width="36" height="20" rx="5"
            fill={isDark?"rgba(139,92,246,0.13)":"rgba(139,92,246,0.08)"}
            stroke="#8B5CF6" strokeWidth="1"/>
          <text x={x+18} y={y+13} textAnchor="middle" fill="#8B5CF6" fontSize="5.5" fontWeight="700">{label}</text>
        </g>
      ))}

      {/* Pipe size labels */}
      <text x="96" y="42" textAnchor="middle" fill="#06B6D4" fontSize="5">Ø19.1/Ø9.53</text>
      <text x="222" y="18" textAnchor="middle" fill="#06B6D4" fontSize="4.5">Ø12.7/Ø6.35</text>

      {/* Legend */}
      <line x1="2" y1="106" x2="18" y2="106" stroke="#06B6D4" strokeWidth="1.8" strokeDasharray="5 3"/>
      <text x="22" y="109" fill="#06B6D4" fontSize="6">Liquid line</text>
      <line x1="82" y1="106" x2="98" y2="106" stroke="#8B5CF6" strokeWidth="1.8" strokeDasharray="5 3"/>
      <text x="102" y="109" fill="#8B5CF6" fontSize="6">Suction line</text>
      <circle cx="170" cy="106" r="3.5" fill="#06B6D4" opacity="0.85"/>
      <text x="177" y="109" fill="#94a3b8" fontSize="6">REFNET joint</text>
    </svg>
  );
}

export default function DaikinVRVComingSoon({ theme = "dark" }) {
  const isDark = theme === "dark";

  const bg      = isDark ? "#0B1F3A" : "#F8FAFC";
  const cardBg  = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border  = isDark ? "rgba(255,255,255,0.09)" : "#E2E8F0";
  const textPri = isDark ? "#e2e8f0" : "#1E293B";
  const textSec = isDark ? "#94a3b8" : "#64748B";
  const shadow  = isDark ? "none" : "0 4px 20px rgba(0,0,0,0.08)";
  const featBg  = isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC";
  const featBdr = isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0";
  const accentA = "#06B6D4";
  const accentB = "#8B5CF6";

  const [dots, setDots]       = useState(".");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setProgress(35), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight:"100%", padding:"28px 20px 48px", backgroundColor:bg, fontFamily:"'Inter',sans-serif", color:textPri }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"5px" }}>
          <div style={{ width:"30px", height:"30px", borderRadius:"9px", background:`${accentA}20`, border:`1px solid ${accentA}45`, display:"flex", alignItems:"center", justifyContent:"center", color:accentA }}>
            <Wind size={16}/>
          </div>
          <h2 style={{ fontSize:"22px", fontWeight:800, margin:0, color:textPri, letterSpacing:"-0.02em" }}>
            Daikin VRV Sizer
          </h2>
        </div>
        <p style={{ color:textSec, fontSize:"13px", margin:"0 0 0 40px" }}>
          Full VRV-IV &amp; VRV-5 selection tool — system diagram, pipe sizing &amp; compliance
        </p>
      </div>

      {/* ── Hero Card ── */}
      <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:"22px", padding:"22px 18px 20px", position:"relative", overflow:"hidden", boxShadow:shadow, marginBottom:"16px" }}>
        <div style={{ position:"absolute", top:"-50px", left:"-50px", width:"200px", height:"200px", background:`${accentA}12`, borderRadius:"50%", filter:"blur(55px)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"-40px", right:"-40px", width:"160px", height:"160px", background:`${accentB}10`, borderRadius:"50%", filter:"blur(45px)", pointerEvents:"none" }}/>

        {/* Top badges row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"7px", background:isDark?"rgba(6,182,212,0.1)":"#ecfeff", border:`1px solid ${accentA}35`, borderRadius:"10px", padding:"5px 12px" }}>
            <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:accentA, boxShadow:`0 0 8px ${accentA}` }}/>
            <span style={{ fontSize:"11px", fontWeight:800, color:accentA, letterSpacing:"0.06em" }}>DAIKIN VRV</span>
          </div>
          <div style={{ display:"flex", gap:"6px" }}>
            <span style={{ fontSize:"9px", fontWeight:700, padding:"3px 9px", borderRadius:"7px", color:accentB, background:isDark?"rgba(139,92,246,0.1)":"#f5f3ff", border:`1px solid ${isDark?"rgba(139,92,246,0.3)":"#c4b5fd"}` }}>VRV-IV</span>
            <span style={{ fontSize:"9px", fontWeight:700, padding:"3px 9px", borderRadius:"7px", color:accentB, background:isDark?"rgba(139,92,246,0.1)":"#f5f3ff", border:`1px solid ${isDark?"rgba(139,92,246,0.3)":"#c4b5fd"}` }}>VRV-5</span>
          </div>
        </div>

        {/* Pipe diagram */}
        <div style={{ marginBottom:"16px" }}>
          <PipeDiagram isDark={isDark}/>
        </div>

        {/* Title */}
        <h3 style={{ fontSize:"18px", fontWeight:800, margin:"0 0 6px", color:textPri, letterSpacing:"-0.02em" }}>
          Full Selection Tool{dots}
        </h3>
        <p style={{ fontSize:"12px", color:textSec, lineHeight:1.65, margin:"0 0 16px", maxWidth:"340px" }}>
          Visual system diagram with <strong style={{ color:accentA }}>ODU → REFNET → IDU</strong> tree,
          auto pipe sizing, length/level validation &amp; capacity correction —
          all in one tool for <strong style={{ color:textPri }}>VRV-IV &amp; VRV-5</strong>.
        </p>

        {/* Tags */}
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"18px" }}>
          {SERIES_TAGS.map(tag => (
            <span key={tag} style={{ fontSize:"9px", fontWeight:700, padding:"2px 9px", borderRadius:"20px", letterSpacing:"0.04em", background:isDark?"rgba(6,182,212,0.1)":"#ecfeff", border:`1px solid ${isDark?"rgba(6,182,212,0.25)":"#a5f3fc"}`, color:accentA }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom:"4px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"7px" }}>
            <span style={{ fontSize:"11px", color:textSec, fontWeight:600 }}>Development Progress</span>
            <span style={{ fontSize:"11px", fontWeight:800, color:accentA }}>{progress}%</span>
          </div>
          <div style={{ height:"5px", borderRadius:"99px", background:isDark?"rgba(255,255,255,0.07)":"#E2E8F0", overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:"99px", width:`${progress}%`, background:`linear-gradient(90deg,${accentA},${accentB})`, transition:"width 1.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:`0 0 10px ${accentA}55` }}/>
          </div>
          {/* Stage labels */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"5px" }}>
            {["Design","Core Logic","System Diagram","Testing","Release"].map((s,i) => (
              <span key={s} style={{ fontSize:"8px", color: i < 2 ? accentA : (isDark?"#1e3a5f":"#CBD5E1"), fontWeight: i < 2 ? 700 : 500 }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3-Step Workflow ── */}
      <p style={{ fontSize:"11px", fontWeight:700, color:textSec, textTransform:"uppercase", letterSpacing:"0.09em", margin:"0 0 11px" }}>3-Step Workflow</p>
      <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"16px" }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ background: s.done ? (isDark?`rgba(6,182,212,0.07)`:"#ecfeff") : (isDark?"rgba(255,255,255,0.02)":"#ffffff"), border:`1px solid ${s.done ? (isDark?`rgba(6,182,212,0.25)`:accentA+"44") : (isDark?"rgba(255,255,255,0.06)":"#E2E8F0")}`, borderRadius:"14px", padding:"13px 15px", display:"flex", alignItems:"flex-start", gap:"13px", boxShadow:isDark?"none":"0 2px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ flexShrink:0, width:"36px", height:"36px", borderRadius:"10px", background:`${s.color}18`, border:`1px solid ${s.color}35`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {s.done
                ? <CheckCircle2 size={18} color={s.color}/>
                : <Clock size={18} color={s.color} opacity={0.6}/>
              }
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"3px" }}>
                <span style={{ fontSize:"9px", fontWeight:800, color:s.color, letterSpacing:"0.06em" }}>STEP {s.num}</span>
                {s.done && <span style={{ fontSize:"8px", fontWeight:700, color:s.color, background:`${s.color}18`, border:`1px solid ${s.color}30`, padding:"1px 7px", borderRadius:"10px" }}>IN PROGRESS</span>}
              </div>
              <div style={{ fontSize:"12px", fontWeight:700, color:textPri, marginBottom:"2px" }}>{s.title}</div>
              <div style={{ fontSize:"10px", color:textSec, lineHeight:1.55 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Full Feature List ── */}
      <p style={{ fontSize:"11px", fontWeight:700, color:textSec, textTransform:"uppercase", letterSpacing:"0.09em", margin:"0 0 11px" }}>What's Inside</p>
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ background:featBg, border:`1px solid ${featBdr}`, borderRadius:"13px", padding:"12px 14px", display:"flex", alignItems:"flex-start", gap:"12px", boxShadow:isDark?"none":"0 2px 5px rgba(0,0,0,0.04)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:"-12px", left:"-12px", width:"50px", height:"50px", background:`${f.color}10`, borderRadius:"50%", filter:"blur(14px)", pointerEvents:"none" }}/>
            <div style={{ flexShrink:0, width:"34px", height:"34px", borderRadius:"10px", background:`${f.color}18`, border:`1px solid ${f.color}35`, display:"flex", alignItems:"center", justifyContent:"center", color:f.color }}>
              {f.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:"12px", fontWeight:700, color:textPri, marginBottom:"2px" }}>{f.title}</div>
              <div style={{ fontSize:"10px", color:textSec, lineHeight:1.55 }}>{f.desc}</div>
            </div>
            <ChevronRight size={12} style={{ color:isDark?"#1e3a5f":"#CBD5E1", flexShrink:0, marginTop:"4px" }}/>
          </div>
        ))}
      </div>

      {/* ── Disclaimer note ── */}
      <div style={{ marginTop:"16px", borderRadius:"14px", padding:"12px 15px", background:isDark?"rgba(6,182,212,0.06)":"#ecfeff", border:`1px solid ${isDark?"rgba(6,182,212,0.15)":"#a5f3fc"}`, display:"flex", gap:"10px", alignItems:"flex-start" }}>
        <Wind size={14} style={{ color:accentA, flexShrink:0, marginTop:"2px" }}/>
        <p style={{ fontSize:"11px", color:textSec, lineHeight:1.6, margin:0 }}>
          Pipe data sourced from <strong style={{ color:textPri }}>Daikin VRV Engineering Data Book (VRV-IV &amp; VRV-5)</strong>.
          Always verify final selection with official <strong style={{ color:textPri }}>Daikin Selection Software (DSS)</strong> before BOQ submission.
        </p>
      </div>
    </div>
  );
}
