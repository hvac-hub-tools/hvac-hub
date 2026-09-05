// ============================================================
//  ComingSoon.jsx  —  Drop-in placeholder for React+Vite+Capacitor
//  Accepts { theme } prop from App.tsx ("dark" | "light")
//  TEMPORARY — remove this file and replace with your actual component
// ============================================================

import { useEffect, useState } from "react";

const TAGLINES = [
  "Something exciting is on its way",
  "Building something special for you",
  "Almost there, hang tight!",
];

export default function ComingSoon({ theme = "dark" }) {
  const isDark = theme === "dark";

  // ── Theme-matched colors (mirrors your App.tsx palette) ──
  const bg        = isDark ? "#0B1F3A" : "#F8FAFC";
  const cardBg    = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border    = isDark ? "rgba(255,255,255,0.1)"  : "#E2E8F0";
  const textPri   = isDark ? "#e2e8f0" : "#1E293B";
  const textSec   = isDark ? "#94a3b8" : "#64748B";
  const accent    = "#2DD4BF";   // your app's teal accent
  const boxShadow = isDark ? "none" : "0 4px 6px -1px rgba(0,0,0,0.1)";

  const [tick, setTick] = useState(0);
  const [dots, setDots] = useState(".");

  // Cycling tagline
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % TAGLINES.length), 2800);
    return () => clearInterval(id);
  }, []);

  // Animated dots
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      minHeight: "100%",
      padding: "40px 20px",
      backgroundColor: bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      color: textPri,
      gap: "0",
    }}>

      {/* ── Page title (matches ToolsHub style) ── */}
      <div style={{ width: "100%", maxWidth: 420, marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 5px", color: textPri }}>
          Coming Soon
        </h2>
        <p style={{ color: textSec, fontSize: "14px", margin: 0 }}>
          A new tool is being added to Master Toolkit
        </p>
      </div>

      {/* ── Main card (matches your tool card style) ── */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: "20px",
        padding: "32px 24px",
        position: "relative",
        overflow: "hidden",
        boxShadow,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        textAlign: "center",
      }}>

        {/* Decorative glow blob (same as your tool cards) */}
        <div style={{
          position: "absolute", top: "-30px", left: "-30px",
          width: "120px", height: "120px",
          background: `${accent}15`, borderRadius: "50%",
          filter: "blur(30px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-30px", right: "-30px",
          width: "100px", height: "100px",
          background: `${accent}10`, borderRadius: "50%",
          filter: "blur(25px)", pointerEvents: "none",
        }} />

        {/* Icon ring */}
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          border: `1.5px solid ${accent}55`,
          background: `${accent}12`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accent,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>

        {/* Heading */}
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 6px", color: textPri, letterSpacing: "-0.02em" }}>
            Under Construction{dots}
          </h3>
          {/* Animated tagline */}
          <p style={{
            fontSize: "13px", color: accent, margin: 0,
            fontStyle: "italic", fontWeight: 500,
            animation: "fadeSlide 0.45s ease",
            minHeight: "20px",
          }} key={tick}>
            {TAGLINES[tick]}
          </p>
        </div>

        {/* Description */}
        <p style={{
          fontSize: "13px", color: textSec, lineHeight: 1.65,
          margin: "0", maxWidth: "320px",
        }}>
          We're working on a new feature for the Master Toolkit.
          Check back soon — it'll be worth the wait!
        </p>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: "280px" }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginBottom: "6px",
          }}>
            <span style={{ fontSize: "11px", color: textSec, fontWeight: 600 }}>Progress</span>
            <span style={{ fontSize: "11px", color: accent, fontWeight: 700 }}>60%</span>
          </div>
          <div style={{
            height: "4px", borderRadius: "99px",
            background: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
            overflow: "hidden",
          }}>
            <div style={{
              width: "60%", height: "100%",
              background: `linear-gradient(90deg, ${accent}, #3B82F6)`,
              borderRadius: "99px",
            }} />
          </div>
        </div>

        {/* Badge row */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          {["New Feature", "In Development", "Master Toolkit"].map((tag) => (
            <span key={tag} style={{
              fontSize: "10px", fontWeight: 700,
              padding: "3px 10px", borderRadius: "20px",
              background: isDark ? "rgba(45,212,191,0.1)" : "#f0fdfa",
              border: `1px solid ${isDark ? "rgba(45,212,191,0.25)" : "#5eead4"}`,
              color: accent,
              letterSpacing: "0.04em",
            }}>{tag}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
}
