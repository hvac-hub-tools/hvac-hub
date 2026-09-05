import { Globe, MapPin, Layers, CheckCircle2, Clock, Search } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
//  WORLD CATALOG — "In Development" Preview Page
//  Daikin VRV Sizer jaisa style: header card, animated network diagram,
//  feature chips, progress bar aur 3-step roadmap.
//  Usage: <WorldCatalog theme={theme} />
// ─────────────────────────────────────────────────────────────────────────────

interface WorldCatalogProps {
  theme: "dark" | "light" | string;
}

const ACCENT = "#2DD4BF"; // teal — World Catalog brand color

export default function WorldCatalog({ theme }: WorldCatalogProps) {
  const isDark = theme === "dark";

  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "white";
  const cardBorder = isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0";
  const subText = isDark ? "#94a3b8" : "#64748B";
  const textColor = isDark ? "white" : "#1E293B";

  const chips = ["Global Brands", "50+ Countries", "Live Pricing", "Datasheets", "Compare Tool"];

  return (
    <div style={{ padding: "20px 16px 40px", color: textColor, maxWidth: "460px", margin: "0 auto" }}>
      {/* ── HEADER CARD ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
          background: cardBg,
          border: cardBorder,
          borderRadius: "18px",
          padding: "18px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "46px",
            height: "46px",
            minWidth: "46px",
            borderRadius: "13px",
            background: isDark ? "rgba(45,212,191,0.12)" : "#ccfbf1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Globe size={24} color={ACCENT} style={{ animation: "spinSlow 14s linear infinite" }} />
        </div>
        <div>
          <div style={{ fontSize: "19px", fontWeight: 800, marginBottom: "4px" }}>World Catalog</div>
          <div style={{ fontSize: "13px", color: subText, lineHeight: 1.5 }}>
            Global HVAC equipment &amp; brand catalogue — search, compare &amp; specify from one place
          </div>
        </div>
      </div>

      {/* ── DIAGRAM PREVIEW CARD ── */}
      <div
        style={{
          position: "relative",
          background: isDark
            ? "linear-gradient(180deg, rgba(45,212,191,0.06), rgba(45,212,191,0.01))"
            : "linear-gradient(180deg, #f0fdfa, #ffffff)",
          border: cardBorder,
          borderRadius: "20px",
          padding: "16px",
          marginBottom: "16px",
          overflow: "hidden",
        }}
      >
        {/* top badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              fontWeight: 700,
              color: ACCENT,
              background: isDark ? "rgba(45,212,191,0.1)" : "white",
              border: `1px solid ${isDark ? "rgba(45,212,191,0.3)" : "#99f6e4"}`,
              padding: "4px 10px",
              borderRadius: "20px",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
            WORLD CATALOG
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            {["BRANDS", "PRODUCTS"].map((t) => (
              <span
                key={t}
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#8B5CF6",
                  background: isDark ? "rgba(139,92,246,0.1)" : "#f5f3ff",
                  border: `1px solid ${isDark ? "rgba(139,92,246,0.3)" : "#ddd6fe"}`,
                  padding: "3px 8px",
                  borderRadius: "20px",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* animated diagram */}
        <svg viewBox="0 0 320 190" style={{ width: "100%", height: "auto", display: "block" }}>
          {/* connecting lines: center -> each category box */}
          {[
            { x: 70, y: 40 },
            { x: 250, y: 30 },
            { x: 250, y: 100 },
            { x: 70, y: 150 },
          ].map((pos, i) => (
            <g key={i}>
              <line
                x1="160" y1="95" x2={pos.x} y2={pos.y}
                stroke={ACCENT} strokeWidth="1.5" strokeDasharray="4 4"
                opacity={isDark ? 0.35 : 0.45}
              />
              <circle r="3" fill={ACCENT}>
                <animateMotion
                  dur={`${2.4 + i * 0.4}s`}
                  repeatCount="indefinite"
                  path={`M160,95 L${pos.x},${pos.y}`}
                />
              </circle>
            </g>
          ))}

          {/* center node: globe */}
          <g>
            <circle cx="160" cy="95" r="26" fill={isDark ? "#0f2942" : "white"} stroke={ACCENT} strokeWidth="2" />
            <text x="160" y="99" textAnchor="middle" fontSize="18">🌍</text>
          </g>
          <text x="160" y="132" textAnchor="middle" fontSize="9" fill={subText} fontWeight="700">GLOBAL CATALOG</text>

          {/* category nodes */}
          {[
            { x: 70, y: 40, label: "Chillers" },
            { x: 250, y: 30, label: "VRV/VRF" },
            { x: 250, y: 100, label: "AHU" },
            { x: 70, y: 150, label: "Pumps" },
          ].map((n, i) => (
            <g key={i}>
              <rect
                x={n.x - 32} y={n.y - 13} width="64" height="26" rx="8"
                fill={isDark ? "rgba(139,92,246,0.08)" : "#f5f3ff"}
                stroke="#8B5CF6" strokeWidth="1"
              />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fill="#8B5CF6" fontWeight="700">
                {n.label}
              </text>
            </g>
          ))}
        </svg>

        {/* legend */}
        <div style={{ display: "flex", gap: "16px", fontSize: "10px", color: subText, marginTop: "4px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "14px", height: "0", borderTop: `2px dashed ${ACCENT}` }} /> Live data sync
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "3px", background: "#8B5CF6", display: "inline-block" }} /> Product category
          </span>
        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "17px", fontWeight: 800, marginBottom: "6px" }}>Full Catalog Access.</div>
        <div style={{ fontSize: "13px", color: subText, lineHeight: 1.6 }}>
          Browse a structured tree — <b style={{ color: textColor }}>Global Brands → Categories → Products</b> — with
          search, filters &amp; side-by-side comparison, all inside one tool for the whole HVAC industry.
        </div>
      </div>

      {/* ── FEATURE CHIPS ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {chips.map((c) => (
          <span
            key={c}
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: ACCENT,
              background: isDark ? "rgba(45,212,191,0.08)" : "#f0fdfa",
              border: `1px solid ${isDark ? "rgba(45,212,191,0.25)" : "#99f6e4"}`,
              padding: "5px 12px",
              borderRadius: "20px",
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* ── DEVELOPMENT PROGRESS ── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: subText }}>Development Progress</span>
          <span style={{ fontSize: "13px", fontWeight: 800, color: ACCENT }}>20%</span>
        </div>
        <div
          style={{
            height: "6px", borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
            overflow: "hidden", marginBottom: "8px",
          }}
        >
          <div
            style={{
              height: "100%", width: "20%", borderRadius: "10px",
              background: `linear-gradient(90deg, ${ACCENT}, #8B5CF6)`,
              animation: "growBar 1.4s ease-out",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: 700 }}>
          <span style={{ color: ACCENT }}>Research</span>
          <span style={{ color: subText }}>Data Sourcing</span>
          <span style={{ color: subText }}>Build</span>
          <span style={{ color: subText }}>Testing</span>
          <span style={{ color: subText }}>Release</span>
        </div>
      </div>

      {/* ── 3-STEP ROADMAP ── */}
      <div style={{ fontSize: "12px", fontWeight: 800, color: subText, letterSpacing: "0.5px", marginBottom: "10px" }}>
        3-STEP ROADMAP
      </div>

      <RoadmapStep
        isDark={isDark}
        accent={ACCENT}
        status="IN PROGRESS"
        active
        icon={<Search size={16} />}
        title="Data Collection"
        desc="Gathering equipment specs, pricing & datasheets from global manufacturers."
      />
      <RoadmapStep
        isDark={isDark}
        accent={ACCENT}
        status="UPCOMING"
        icon={<Layers size={16} />}
        title="Platform Integration"
        desc="Building search, filters & comparison tools right inside the app."
      />
      <RoadmapStep
        isDark={isDark}
        accent={ACCENT}
        status="UPCOMING"
        icon={<MapPin size={16} />}
        title="Public Release"
        desc="Launching World Catalog for every HVAC Master Toolkit user."
        last
      />

      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes growBar {
          from { width: 0%; }
          to   { width: 20%; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ROADMAP STEP ROW
// ─────────────────────────────────────────────────────────────────────────────
function RoadmapStep({ isDark, accent, status, icon, title, desc, active, last }: any) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "14px",
        marginBottom: last ? 0 : "10px",
        borderRadius: "16px",
        background: active
          ? (isDark ? "rgba(45,212,191,0.08)" : "#f0fdfa")
          : (isDark ? "rgba(255,255,255,0.03)" : "white"),
        border: active
          ? `1px solid ${isDark ? "rgba(45,212,191,0.3)" : "#99f6e4"}`
          : (isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0"),
        opacity: active ? 1 : 0.75,
      }}
    >
      <div
        style={{
          width: "34px", height: "34px", minWidth: "34px", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: active ? accent : (isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"),
          color: active ? "white" : (isDark ? "#94a3b8" : "#64748B"),
          position: "relative",
        }}
      >
        {active ? (
          <span style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `2px solid ${accent}`, animation: "pulseDot 1.8s ease-in-out infinite" }} />
        ) : null}
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          {active ? (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "9px", fontWeight: 800, color: accent, background: isDark ? "rgba(45,212,191,0.12)" : "#ccfbf1", padding: "2px 7px", borderRadius: "20px" }}>
              <CheckCircle2 size={10} /> {status}
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "9px", fontWeight: 800, color: isDark ? "#94a3b8" : "#64748B", background: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", padding: "2px 7px", borderRadius: "20px" }}>
              <Clock size={10} /> {status}
            </span>
          )}
        </div>
        <div style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "2px" }}>{title}</div>
        <div style={{ fontSize: "11.5px", color: isDark ? "#94a3b8" : "#64748B", lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}