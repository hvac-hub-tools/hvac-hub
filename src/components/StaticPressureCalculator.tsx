import React, { useState, useMemo } from "react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import * as XLSX from "xlsx-js-style";

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap";

// ─── Unit Conversions (base: in.wg) ──────────────────────────────────────────
const toPa = (v) => v * 249.089;
const toMM = (v) => v * 25.4;
const fmtP = (v) => ({
  pa: toPa(v).toFixed(2),
  mm: toMM(v).toFixed(3),
  inwg: Math.abs(v).toFixed(4),
});
const inWgFromPa = (pa) => pa / 249.089;

// ─── Equivalent Diameter formulas (ASHRAE) ───────────────────────────────────
function rectEquivDia(w, h) {
  return (1.3 * Math.pow(w * h, 0.625)) / Math.pow(w + h, 0.25);
}
function ovalEquivDia(w, h) {
  const a = Math.max(w, h),
    b = Math.min(w, h);
  const A = (Math.PI * b * b) / 4 + b * (a - b);
  const P = Math.PI * b + 2 * (a - b);
  return (4 * A) / P;
}

// ─── Cross-section Area (ft²) ─────────────────────────────────────────────────
function ductArea(ductType, p) {
  if (ductType === "round") return Math.PI * Math.pow(p.diameter / 24, 2);
  if (ductType === "rectangular") return (p.width * p.height) / 144;
  const a = Math.max(p.width, p.height),
    b = Math.min(p.width, p.height);
  return ((Math.PI * b * b) / 4 + b * (a - b)) / 144;
}

// ─── Friction rate (in.wg / 100 ft) — ASHRAE power-law ───────────────────────
const ROUGHNESS = { sheet_metal: 1.0, flexible: 1.5, fiberglass: 1.25 };
function frictionRate(cfm, de, material) {
  return (
    (0.109136 * Math.pow(cfm, 1.9)) /
    Math.pow(de, 5.02) *
    (ROUGHNESS[material] ?? 1)
  );
}

// ─── Velocity Pressure ────────────────────────────────────────────────────────
const vp = (vel) => Math.pow(vel / 4005, 2);

// ─── Fitting C-Coefficients (ASHRAE) ─────────────────────────────────────────
const FITTING_C = {
  "90° Smooth Elbow (Rect)": { c: 0.127, note: "r/W≈0.75, H/W≈0.58" },
  "45° Smooth Elbow (Rect)": { c: 0.076, note: "K×0.6 of 90° Cp" },
  "90° Mitered Elbow (Rect)": { c: 1.2, note: "No turning vanes" },
  "90° Mitered + Vanes": { c: 0.15, note: "With turning vanes" },
  "90° Elbow (Round)": { c: 0.15, note: "Smooth radius" },
  "45° Elbow (Round)": { c: 0.07, note: "Smooth radius" },
  "Transition SA (Rect→Rect)": { c: 0.07, note: "θ=60°, A0/A1=0.5" },
  "Transition RA (Rect→Rect)": { c: 0.37, note: "θ=60°, A0/A1=0.5" },
  "Transition (Rect→Round)": { c: 0.04, note: "Gradual" },
  "Transition (Round→Round)": { c: 0.06, note: "Gradual" },
  "Y-Piece Diverging": { c: 0.23, note: "Ab/Ac=0.5" },
  "Y-Piece Converging": { c: 0.3, note: "Ab/Ac=0.5" },
  "T-Piece Diverging": { c: 0.73, note: "Ab/Ac≈0.9" },
  "T-Piece Converging": { c: 0.5, note: "Main branch" },
  "Y-Piece Branch 90°": { c: 0.9, note: "Branch to main" },
  "Reducer (gradual)": { c: 0.05, note: "" },
  "Damper (open)": { c: 0.1, note: "" },
  "Register / Grille": { c: 0.05, note: "" },
};

// ─── ISP Components (Pa) ─────────────────────────────────────────────────────
const ISP_MAP = {
  "Mixing Box": { min: 15, max: 40, def: 25 },
  "Pre-Filter (Coarse)": { min: 25, max: 75, def: 40 },
  "Fine Filter (HEPA)": { min: 80, max: 200, def: 120 },
  "Electrostatic Filter": { min: 40, max: 120, def: 60 },
  "Cooling Coil (DX)": { min: 40, max: 120, def: 75 },
  "Cooling Coil (CHW)": { min: 50, max: 150, def: 90 },
  "Heat Exchanger": { min: 30, max: 100, def: 60 },
  "Electric Heater": { min: 10, max: 40, def: 20 },
  Humidifier: { min: 15, max: 50, def: 25 },
  "UV Light Assembly": { min: 5, max: 20, def: 10 },
  "HRV / ERV Core": { min: 50, max: 120, def: 75 },
  "Pulley / Belt Blockage": { min: 10, max: 30, def: 15 },
};

// ─── ADP / Equipment (Pa) ────────────────────────────────────────────────────
const ADP_MAP = {
  "Square Diffuser": { def: 10 },
  "Linear Grille (SA)": { def: 10 },
  "Linear Grille (RA)": { def: 8 },
  "Slot Diffuser (SA)": { def: 17 },
  "Slot Diffuser (RA)": { def: 12 },
  "VCD (open)": { def: 26 },
  "Backdraft Damper": { def: 45 },
  "Wire Mesh": { def: 20 },
  "Custom (enter Pa)": { def: 10 },
};

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── THEME COLORS ─────────────────────────────────────────────────────────────
function getThemeColors(theme) {
  const isDark = theme === "dark";
  return {
    isDark,
    bg: isDark ? "#030810" : "#F0F4F8",
    cardBg: isDark ? "#0b1626" : "#FFFFFF",
    cardBorder: isDark ? "#1e3a5f" : "#CBD5E1",
    inputBg: isDark ? "#040c18" : "#F8FAFC",
    inputBorder: isDark ? "#1e3a5f" : "#CBD5E1",
    text: isDark ? "#e2e8f0" : "#1E293B",
    textMuted: isDark ? "#94a3b8" : "#64748B",
    textDim: isDark ? "#64748b" : "#94A3B8",
    accent: "#0ea5e9",
    accent2: "#38bdf8",
    rowBg: isDark ? "#040c18" : "#F8FAFC",
    rowBorder: isDark ? "#1a2e4a" : "#E2E8F0",
    headerGrad: isDark
      ? "linear-gradient(135deg,#0ea5e9,#0369a1)"
      : "linear-gradient(135deg,#0ea5e9,#0284c7)",
    resultBg: isDark ? "#060e1c" : "#EFF6FF",
    formulaBg: isDark ? "#040c18" : "#F8FAFC",
    formulaBorder: isDark ? "#1e3a5f" : "#BFDBFE",
  };
}

// ─── Reusable UI Primitives ────────────────────────────────────────────────────
const Label = ({ children, color }) => (
  <div
    style={{
      fontSize: "0.75rem",
      fontWeight: 700,
      color,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginBottom: "0.35rem",
      fontFamily: "'Rajdhani', sans-serif",
    }}
  >
    {children}
  </div>
);

const SecTitle = ({ icon, text, color }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem" }}
  >
    <span style={{ fontSize: "1rem" }}>{icon}</span>
    <span
      style={{
        fontSize: "0.875rem",
        fontWeight: 700,
        color,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      {text}
    </span>
  </div>
);

function NumInput({ value, onChange, unit, min = 0, step = "1", tc, bg, border }) {
  return (
    <div
      style={{
        display: "flex",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "8px",
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          flex: 1,
          minWidth: 0,
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "0.65rem 0.5rem",
          fontSize: "0.9375rem",
          color: tc || "#38bdf8",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          boxSizing: "border-box",
        }}
      />
      {unit && (
        <span
          style={{
            padding: "0 0.5rem",
            fontSize: "0.75rem",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {unit}
        </span>
      )}
    </div>
  );
}

function Sel({ value, onChange, options, bg, border, tc }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "8px",
        padding: "0.65rem 0.5rem",
        fontSize: "0.875rem",
        color: tc || "#94a3b8",
        outline: "none",
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 600,
      }}
    >
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}

function Card({ children, accentBorder, bg, border }) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${accentBorder || border}`,
        borderRadius: "12px",
        padding: "1rem",
        marginBottom: "0.9rem",
        boxSizing: "border-box",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

const XBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "transparent",
      border: "none",
      color: "#ef4444",
      cursor: "pointer",
      fontSize: "1rem",
      padding: "0.15rem 0.3rem",
      lineHeight: 1,
      flexShrink: 0,
    }}
  >
    ✕
  </button>
);

const AddBtn = ({ onClick, color = "#38bdf8", label = "+ Add" }) => (
  <button
    onClick={onClick}
    style={{
      background: "transparent",
      border: `1.5px solid ${color}`,
      borderRadius: "8px",
      color,
      padding: "0.4rem 0.9rem",
      fontSize: "0.8125rem",
      cursor: "pointer",
      fontFamily: "'Rajdhani', sans-serif",
      fontWeight: 700,
      letterSpacing: "0.06em",
      flexShrink: 0,
    }}
  >
    {label}
  </button>
);

// ─── Pressure Result Block ────────────────────────────────────────────────────
function PressureBlock({ label, inwg, color = "#38bdf8", bg, border }) {
  const p = fmtP(inwg);
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "10px",
        padding: "0.85rem 1rem",
        marginBottom: "0.6rem",
        boxSizing: "border-box",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.55rem",
          fontWeight: 700,
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        {label}
      </div>
      {[
        ["Pascals (Pa)", p.pa, "1.25rem", 800],
        ["mm WG", p.mm, "1rem", 700],
        ["in.wg", p.inwg, "0.875rem", 600],
      ].map(([lbl, val, sz, fw], i) => (
        <div
          key={lbl}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: i < 2 ? "0.3rem" : 0,
            gap: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              color: "#64748b",
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {lbl}
          </span>
          <span
            style={{
              fontSize: sz,
              fontWeight: fw,
              color:
                i === 0 ? color : `${color}${i === 1 ? "cc" : "aa"}`,
              fontFamily: "'JetBrains Mono', monospace",
              wordBreak: "break-all",
            }}
          >
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Duct Row ─────────────────────────────────────────────────────────────────
function DuctRow({ d, onChange, onRemove, detail, T }) {
  const isRound = d.ductType === "round";

  return (
    <div
      style={{
        background: T.rowBg,
        border: `1px solid ${T.rowBorder}`,
        borderRadius: "10px",
        padding: "0.9rem",
        marginBottom: "0.75rem",
        boxSizing: "border-box",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.6rem",
          gap: "0.5rem",
        }}
      >
        <input
          value={d.name}
          onChange={(e) => onChange("name", e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            color: T.accent2,
            fontSize: "0.9375rem",
            fontWeight: 700,
            outline: "none",
            fontFamily: "'Rajdhani', sans-serif",
            flex: 1,
            minWidth: 0,
            letterSpacing: "0.05em",
          }}
        />
        <XBtn onClick={onRemove} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          marginBottom: "0.7rem",
          width: "100%",
        }}
      >
        {[
          ["round", "⭕ Round"],
          ["rectangular", "▬ Rect"],
          ["oval", "⬯ Oval"],
        ].map(([t, lbl]) => (
          <button
            key={t}
            onClick={() => onChange("ductType", t)}
            style={{
              flex: 1,
              padding: "0.4rem 0.2rem",
              fontSize: "0.8125rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 700,
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: "0.03em",
              background: d.ductType === t ? "#0ea5e9" : "transparent",
              border: `1.5px solid ${
                d.ductType === t ? "#0ea5e9" : T.cardBorder
              }`,
              color: d.ductType === t ? "#fff" : T.textMuted,
              minWidth: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.55rem",
          width: "100%",
        }}
      >
        {isRound ? (
          <div style={{ width: "100%" }}>
            <Label color={T.textMuted}>Diameter (in)</Label>
            <NumInput
              value={d.diameter}
              onChange={(v) => onChange("diameter", v)}
              unit="in"
              min={4}
              bg={T.inputBg}
              border={T.inputBorder}
              tc={T.accent2}
            />
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Label color={T.textMuted}>Width (in)</Label>
              <NumInput
                value={d.width}
                onChange={(v) => onChange("width", v)}
                unit="in"
                min={4}
                bg={T.inputBg}
                border={T.inputBorder}
                tc={T.accent2}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Label color={T.textMuted}>Height (in)</Label>
              <NumInput
                value={d.height}
                onChange={(v) => onChange("height", v)}
                unit="in"
                min={4}
                bg={T.inputBg}
                border={T.inputBorder}
                tc={T.accent2}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label color={T.textMuted}>Length (ft)</Label>
            <NumInput
              value={d.length}
              onChange={(v) => onChange("length", v)}
              unit="ft"
              min={1}
              bg={T.inputBg}
              border={T.inputBorder}
              tc={T.accent2}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Label color={T.textMuted}>CFM</Label>
            <NumInput
              value={d.cfm}
              onChange={(v) => onChange("cfm", v)}
              unit="CFM"
              min={50}
              step="50"
              bg={T.inputBg}
              border={T.inputBorder}
              tc={T.accent2}
            />
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <Label color={T.textMuted}>Material</Label>
          <Sel
            value={d.material}
            onChange={(v) => onChange("material", v)}
            options={[
              { value: "sheet_metal", label: "Sheet Metal" },
              { value: "flexible", label: "Flexible Duct" },
              { value: "fiberglass", label: "Fiberglass BD" },
            ]}
            bg={T.inputBg}
            border={T.inputBorder}
            tc={T.text}
          />
        </div>
      </div>

      {detail && (
        <div
          style={{
            marginTop: "0.65rem",
            paddingTop: "0.55rem",
            borderTop: `1px solid ${T.rowBorder}`,
            width: "100%",
          }}
        >
          {[
            ["De (Equiv. Dia)", `${(detail.de || 0).toFixed(1)}"`, T.text],
            ["Fr (/100 ft)", `${(detail.fr || 0).toFixed(4)}"`, T.accent2],
            ["Duct Loss", `${(detail.loss || 0).toFixed(4)}" wg`, "#f59e0b"],
            ["Velocity", `${Math.round(detail.vel || 0)} fpm`, "#a78bfa"],
            [
              "Velocity Press",
              `${(detail.vpVal || 0).toFixed(5)}" wg`,
              "#22c55e",
            ],
          ].map(([k, v, c]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "0.3rem",
                marginBottom: "0.3rem",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: T.textMuted,
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {k}
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: c,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  wordBreak: "break-all",
                  textAlign: "right",
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function StaticPressureCalculator({ theme = "dark" }) {
  const T = getThemeColors(theme);

  const [ducts, setDucts] = useState([
    {
      id: uid(),
      name: "Supply Main",
      ductType: "rectangular",
      width: 24,
      height: 14,
      diameter: 12,
      length: 40,
      cfm: 2100,
      material: "sheet_metal",
    },
    {
      id: uid(),
      name: "Return Main",
      ductType: "rectangular",
      width: 24,
      height: 14,
      diameter: 14,
      length: 30,
      cfm: 2100,
      material: "sheet_metal",
    },
  ]);
  const [fittings, setFittings] = useState([
    { id: uid(), type: "90° Smooth Elbow (Rect)", qty: 4 },
    { id: uid(), type: "T-Piece Diverging", qty: 2 },
  ]);
  const [adp, setAdp] = useState([
    { id: uid(), type: "Square Diffuser", pa: 10 },
    { id: uid(), type: "VCD (open)", pa: 26 },
  ]);
  const [isp, setIsp] = useState([
    { id: uid(), type: "Mixing Box", pa: 25 },
    { id: uid(), type: "Pre-Filter (Coarse)", pa: 40 },
    { id: uid(), type: "Fine Filter (HEPA)", pa: 120 },
    { id: uid(), type: "Cooling Coil (DX)", pa: 75 },
    { id: uid(), type: "Pulley / Belt Blockage", pa: 15 },
  ]);
  const [fanCFM, setFanCFM] = useState(2100);
  const [fanEff, setFanEff] = useState(70);
  const [motorEff, setMotorEff] = useState(90);
  const [sf, setSf] = useState(10);
  const [projectName, setProjectName] = useState("BANQUET AHU");

  // ─── Download status state ──────────────────────────────────────────────────
  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");

  const addDuct = () =>
    setDucts((p) => [
      ...p,
      {
        id: uid(),
        name: "New Run",
        ductType: "rectangular",
        width: 12,
        height: 10,
        diameter: 10,
        length: 20,
        cfm: 800,
        material: "sheet_metal",
      },
    ]);
  const upDuct = (id, k, v) =>
    setDucts((p) => p.map((d) => (d.id === id ? { ...d, [k]: v } : d)));
  const rmDuct = (id) => setDucts((p) => p.filter((d) => d.id !== id));

  const addFit = () =>
    setFittings((p) => [
      ...p,
      { id: uid(), type: "90° Elbow (Round)", qty: 1 },
    ]);
  const upFit = (id, k, v) =>
    setFittings((p) => p.map((f) => (f.id === id ? { ...f, [k]: v } : f)));
  const rmFit = (id) => setFittings((p) => p.filter((f) => f.id !== id));

  const addAdp = () =>
    setAdp((p) => [...p, { id: uid(), type: "Square Diffuser", pa: 10 }]);
  const upAdp = (id, k, v) =>
    setAdp((p) => p.map((a) => (a.id === id ? { ...a, [k]: v } : a)));
  const rmAdp = (id) => setAdp((p) => p.filter((a) => a.id !== id));

  const addIsp = () =>
    setIsp((p) => [
      ...p,
      { id: uid(), type: "Pre-Filter (Coarse)", pa: 40 },
    ]);
  const upIsp = (id, k, v) =>
    setIsp((p) => p.map((i) => (i.id === id ? { ...i, [k]: v } : i)));
  const rmIsp = (id) => setIsp((p) => p.filter((i) => i.id !== id));

  // ─── Core Calc ─────────────────────────────────────────────────────────────
  const R = useMemo(() => {
    const ductDetails = ducts.map((d) => {
      const de =
        d.ductType === "round"
          ? d.diameter
          : d.ductType === "rectangular"
          ? rectEquivDia(d.width, d.height)
          : ovalEquivDia(d.width, d.height);
      const area = ductArea(d.ductType, d);
      const vel = d.cfm / area;
      const vpVal = vp(vel);
      const fr = frictionRate(d.cfm, de, d.material);
      const loss = (fr * d.length) / 100;
      return { ...d, de, vel, vpVal, fr, loss, area };
    });

    const ductLoss = ductDetails.reduce((s, d) => s + d.loss, 0);
    const critVP = ductDetails.reduce((m, d) => Math.max(m, d.vpVal), 0);
    const fitLoss = fittings.reduce(
      (s, f) =>
        s + (FITTING_C[f.type]?.c ?? 0.1) * critVP * Number(f.qty),
      0
    );
    const adpLoss = adp.reduce((s, a) => s + inWgFromPa(Number(a.pa)), 0);
    const ESP_raw = ductLoss + fitLoss + adpLoss;
    const ESP = ESP_raw * (1 + sf / 100);
    const ISP = isp.reduce((s, i) => s + inWgFromPa(Number(i.pa)), 0);
    const TSP = ESP + ISP;
    const TP = TSP + critVP;
    const fanBkw = (fanCFM * TSP) / (8536 * (fanEff / 100));
    const motorKw = (fanBkw * (1 + sf / 100)) / (motorEff / 100);
    const motorHP = motorKw / 0.746;

    let rating = "✅ Excellent",
      rColor = "#22c55e";
    if (TSP > 2.5) {
      rating = "🔴 Critical";
      rColor = "#ef4444";
    } else if (TSP > 1.8) {
      rating = "🟠 High";
      rColor = "#f97316";
    } else if (TSP > 1.2) {
      rating = "🟡 Moderate";
      rColor = "#eab308";
    } else if (TSP > 0.6) {
      rating = "🟢 Good";
      rColor = "#84cc16";
    }

    return {
      ductDetails,
      ductLoss,
      fitLoss,
      adpLoss,
      ESP_raw,
      ESP,
      ISP,
      TSP,
      TP,
      critVP,
      fanBkw,
      motorKw,
      motorHP,
      rating,
      rColor,
    };
  }, [ducts, fittings, adp, isp, fanCFM, fanEff, motorEff, sf]);

  const monoVal = (color, size = "0.9375rem") => ({
    fontSize: size,
    fontWeight: 700,
    color,
    fontFamily: "'JetBrains Mono', monospace",
    wordBreak: "break-all",
  });

  const metaLabel = {
    fontSize: "0.8125rem",
    color: T.textMuted,
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 600,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // HTML GENERATOR (shared between web & mobile)
  // ─────────────────────────────────────────────────────────────────────────
  const buildExcelHtml = () => {
    const HEADER_BG = "#FFFF00";
    const TITLE_COLOR = "#C00000";
    const SUBHEAD_BG = "#D9D9D9";
    const TOTAL_BG = "#FFF2CC";

    const td = `style="border:1px solid #000; padding:4px 6px; font-size:11px; font-family:Calibri,Arial,sans-serif; text-align:center; vertical-align:middle;"`;
    const tdL = `style="border:1px solid #000; padding:4px 6px; font-size:11px; font-family:Calibri,Arial,sans-serif; text-align:left; vertical-align:middle;"`;
    const tdR = `style="border:1px solid #000; padding:4px 6px; font-size:11px; font-family:Calibri,Arial,sans-serif; text-align:right; vertical-align:middle; font-weight:bold;"`;
    const th = `style="border:1px solid #000; padding:6px; font-size:11px; font-family:Calibri,Arial,sans-serif; text-align:center; font-weight:bold; background:${HEADER_BG}; vertical-align:middle;"`;
    const subTd = `style="border:1px solid #000; padding:4px 6px; font-size:11px; font-family:Calibri,Arial,sans-serif; text-align:left; font-weight:bold; background:${SUBHEAD_BG};"`;

    let rows = "";
    let sno = 0;

    rows += `<tr><td colspan="14" ${subTd}>Supply / Duct System (External)</td></tr>`;

    ducts.forEach((d) => {
      const det = R.ductDetails.find((x) => x.id === d.id);
      sno++;
      rows += `<tr>
        <td ${td}>${sno}</td>
        <td ${tdL}>${d.name}</td>
        <td ${td}>${d.ductType !== "round" ? d.width : "-"}</td>
        <td ${td}>${d.ductType !== "round" ? d.height : "-"}</td>
        <td ${td}>${d.ductType === "round" ? d.diameter : "-"}</td>
        <td ${td}>${(det?.area || 0).toFixed(4)}</td>
        <td ${td}>${(det?.de || 0).toFixed(2)}</td>
        <td ${td}>${d.cfm}</td>
        <td ${td}>${Math.round(det?.vel || 0)}</td>
        <td ${td}>${(det?.vpVal || 0).toFixed(5)}</td>
        <td ${td}>${(det?.fr || 0).toFixed(4)}</td>
        <td ${td}>${d.length}</td>
        <td ${td}>${(det?.loss || 0).toFixed(4)}</td>
        <td ${tdR}>${toPa(det?.loss || 0).toFixed(2)}</td>
      </tr>`;
    });

    if (fittings.length > 0) {
      rows += `<tr><td colspan="14" ${subTd}>Fittings &amp; Transitions</td></tr>`;
      fittings.forEach((f) => {
        const c = FITTING_C[f.type]?.c ?? 0.1;
        const loss = c * R.critVP * Number(f.qty);
        sno++;
        rows += `<tr>
          <td ${td}>${sno}</td>
          <td ${tdL}>${f.type}</td>
          <td ${td} colspan="4">Co coefficient = ${c}</td>
          <td ${td}>-</td>
          <td ${td}>-</td>
          <td ${td}>${R.critVP.toFixed(5)}</td>
          <td ${td}>${c}</td>
          <td ${td}>${f.qty}</td>
          <td ${td}>${loss.toFixed(4)}</td>
          <td ${tdR}>${toPa(loss).toFixed(2)}</td>
        </tr>`;
      });
    }

    if (adp.length > 0) {
      rows += `<tr><td colspan="14" ${subTd}>ADP &amp; Air Terminal Equipment</td></tr>`;
      adp.forEach((a) => {
        const loss = inWgFromPa(Number(a.pa));
        sno++;
        rows += `<tr>
          <td ${td}>${sno}</td>
          <td ${tdL}>${a.type}</td>
          <td ${td} colspan="8">Air Terminal / Equipment</td>
          <td ${td}>-</td>
          <td ${td}>${loss.toFixed(4)}</td>
          <td ${tdR}>${Number(a.pa).toFixed(2)}</td>
        </tr>`;
      });
    }

    rows += `<tr>
      <td colspan="12" ${tdR} style="background:${SUBHEAD_BG};border:1px solid #000;padding:6px;font-family:Calibri;font-size:11px;text-align:right;font-weight:bold;">Sub Total (Pa)</td>
      <td colspan="2" ${tdR} style="background:${SUBHEAD_BG};">${toPa(R.ESP_raw).toFixed(0)}</td>
    </tr>
    <tr>
      <td colspan="12" ${tdR} style="background:${SUBHEAD_BG};border:1px solid #000;padding:6px;font-family:Calibri;font-size:11px;text-align:right;font-weight:bold;">Safety Factor (${sf}%)</td>
      <td colspan="2" ${tdR} style="background:${SUBHEAD_BG};">${toPa(R.ESP - R.ESP_raw).toFixed(0)}</td>
    </tr>
    <tr>
      <td colspan="12" ${tdR} style="background:${TOTAL_BG};color:${TITLE_COLOR};border:1px solid #000;padding:6px;font-family:Calibri;font-size:12px;text-align:right;font-weight:bold;">GRAND TOTAL ESP (Pa)</td>
      <td colspan="2" ${tdR} style="background:${TOTAL_BG};color:${TITLE_COLOR};font-size:12px;">${toPa(R.ESP).toFixed(0)}</td>
    </tr>`;

    let ispRows = "";
    isp.forEach((it, idx) => {
      ispRows += `<tr>
        <td ${td}>${idx + 1}</td>
        <td ${tdL}>${it.type}</td>
        <td ${td}>${it.pa}</td>
        <td ${td}>${inWgFromPa(Number(it.pa)).toFixed(4)}</td>
      </tr>`;
    });
    ispRows += `<tr>
      <td colspan="2" ${tdR} style="background:${TOTAL_BG};color:${TITLE_COLOR};">ISP Total</td>
      <td ${tdR} style="background:${TOTAL_BG};color:${TITLE_COLOR};">${toPa(R.ISP).toFixed(0)}</td>
      <td ${tdR} style="background:${TOTAL_BG};color:${TITLE_COLOR};">${R.ISP.toFixed(4)}</td>
    </tr>`;

    return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<!--[if gte mso 9]>
<xml>
  <x:ExcelWorkbook>
    <x:ExcelWorksheets>
      <x:ExcelWorksheet>
        <x:Name>ESP Calculation</x:Name>
        <x:WorksheetOptions>
          <x:DisplayGridlines/>
          <x:Print><x:ValidPrinterInfo/><x:PaperSizeIndex>9</x:PaperSizeIndex></x:Print>
        </x:WorksheetOptions>
      </x:ExcelWorksheet>
    </x:ExcelWorksheets>
  </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>body { font-family: Calibri, Arial, sans-serif; } table { border-collapse: collapse; }</style>
</head>
<body>
  <div style="font-size:11px;margin-bottom:8px;">
    <div><b>Prepared by-</b> ____________________</div>
    <div><b>Checked by-</b>  ____________________</div>
  </div>
  <h1 style="text-align:center;color:${TITLE_COLOR};font-size:18px;margin:8px 0 4px;font-family:Calibri;">EXTERNAL STATIC PRESSURE CALCULATION</h1>
  <h2 style="text-align:center;color:${TITLE_COLOR};font-size:14px;margin:0 0 12px;font-family:Calibri;">${fanCFM} CFM (${projectName})</h2>
  <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%;">
    <thead>
      <tr>
        <th ${th}>S.No.</th><th ${th}>Description</th><th ${th}>W (in)</th><th ${th}>H (in)</th>
        <th ${th}>Dia (in)</th><th ${th}>Area (sq.ft)</th><th ${th}>De (in)</th>
        <th ${th}>Flow (CFM)</th><th ${th}>Velocity (fpm)</th><th ${th}>Velocity Head (in.wg)</th>
        <th ${th}>Co / Fr</th><th ${th}>Len / Qty</th><th ${th}>Loss (in.wg)</th>
        <th ${th}>Total Pressure Drop (Pa)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <h3 style="color:${TITLE_COLOR};font-size:13px;margin:18px 0 6px;font-family:Calibri;">INTERNAL STATIC PRESSURE (ISP) COMPONENTS</h3>
  <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:60%;">
    <thead>
      <tr>
        <th ${th}>S.No.</th><th ${th}>Component</th>
        <th ${th}>Pressure Drop (Pa)</th><th ${th}>Pressure Drop (in.wg)</th>
      </tr>
    </thead>
    <tbody>${ispRows}</tbody>
  </table>
  <h3 style="color:${TITLE_COLOR};font-size:13px;margin:18px 0 6px;font-family:Calibri;">FINAL SUMMARY</h3>
  <table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:50%;">
    <tbody>
      <tr><td ${tdL} style="background:${SUBHEAD_BG};font-weight:bold;">ESP (Pa)</td><td ${tdR}>${toPa(R.ESP).toFixed(0)}</td></tr>
      <tr><td ${tdL} style="background:${SUBHEAD_BG};font-weight:bold;">ISP (Pa)</td><td ${tdR}>${toPa(R.ISP).toFixed(0)}</td></tr>
      <tr style="background:${TOTAL_BG};"><td ${tdL} style="color:${TITLE_COLOR};font-weight:bold;">TSP = ESP + ISP (Pa)</td><td ${tdR} style="color:${TITLE_COLOR};">${toPa(R.TSP).toFixed(0)}</td></tr>
      <tr><td ${tdL} style="background:${SUBHEAD_BG};font-weight:bold;">TSP (in.wg)</td><td ${tdR}>${R.TSP.toFixed(4)}</td></tr>
      <tr><td ${tdL} style="background:${SUBHEAD_BG};font-weight:bold;">Fan Brake kW</td><td ${tdR}>${R.fanBkw.toFixed(3)} kW</td></tr>
      <tr><td ${tdL} style="background:${SUBHEAD_BG};font-weight:bold;">Motor Power</td><td ${tdR}>${R.motorKw.toFixed(3)} kW / ${R.motorHP.toFixed(2)} HP</td></tr>
      <tr><td ${tdL} style="background:${SUBHEAD_BG};font-weight:bold;">Fan Efficiency</td><td ${tdR}>${fanEff} %</td></tr>
      <tr><td ${tdL} style="background:${SUBHEAD_BG};font-weight:bold;">Motor Efficiency</td><td ${tdR}>${motorEff} %</td></tr>
    </tbody>
  </table>
  <div style="margin-top:14px;font-size:10px;font-family:Calibri;line-height:1.5;">
    <b>Note-</b><br/>
    1) Pressure drop across duct fittings has been taken from Ashrae duct design chapter.<br/>
    2) Pressure drop across fire damper has been taken from Ashrae duct design chapter.<br/>
    3) Pressure drop across volume control damper has been taken from Ashrae duct design chapter.<br/>
    4) Pressure drop across all air terminal devices has been taken as per Cosmos catalogue.<br/>
    5) Pressure drop across Back-Draft Damper has been taken as per Cosmos catalogue.<br/>
    6) Pressure across flexible connection has been assumed 10 Pa.
  </div>
</body>
</html>`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CSV GENERATOR — Mobile pe properly khulta hai kisi bhi Excel app mein
  // ─────────────────────────────────────────────────────────────────────────
  const buildCSV = () => {
    const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [];

    rows.push([q("ESP / ISP / TSP CALCULATION REPORT")]);
    rows.push([q("Project"), q(projectName), q("CFM"), q(fanCFM)]);
    rows.push([]);

    // ── DUCT SECTION ──
    rows.push([
      q("S.No"), q("Description"), q("W (in)"), q("H (in)"), q("Dia (in)"),
      q("Area (sqft)"), q("De (in)"), q("CFM"), q("Velocity (fpm)"),
      q("VP (in.wg)"), q("Fr (/100ft)"), q("Length (ft)"),
      q("Duct Loss (in.wg)"), q("Pressure Drop (Pa)"),
    ]);

    R.ductDetails.forEach((d, i) => {
      rows.push([
        q(i + 1), q(d.name),
        q(d.ductType !== "round" ? d.width : "-"),
        q(d.ductType !== "round" ? d.height : "-"),
        q(d.ductType === "round" ? d.diameter : "-"),
        q(d.area.toFixed(4)), q(d.de.toFixed(2)), q(d.cfm),
        q(Math.round(d.vel)), q(d.vpVal.toFixed(5)),
        q(d.fr.toFixed(4)), q(d.length),
        q(d.loss.toFixed(4)), q(toPa(d.loss).toFixed(2)),
      ]);
    });

    rows.push([]);
    rows.push([q("── FITTINGS & TRANSITIONS ──")]);
    rows.push([q("S.No"), q("Fitting Type"), q("Co Coeff"), q("Qty"), q("Loss (in.wg)"), q("Loss (Pa)")]);
    fittings.forEach((f, i) => {
      const c = FITTING_C[f.type]?.c ?? 0.1;
      const loss = c * R.critVP * Number(f.qty);
      rows.push([q(i + 1), q(f.type), q(c), q(f.qty), q(loss.toFixed(4)), q(toPa(loss).toFixed(2))]);
    });

    rows.push([]);
    rows.push([q("── ADP & EQUIPMENT ──")]);
    rows.push([q("S.No"), q("Equipment"), q("Loss (Pa)"), q("Loss (in.wg)")]);
    adp.forEach((a, i) => {
      rows.push([q(i + 1), q(a.type), q(a.pa), q(inWgFromPa(Number(a.pa)).toFixed(4))]);
    });

    rows.push([]);
    rows.push([q("── ISP COMPONENTS ──")]);
    rows.push([q("S.No"), q("Component"), q("Pressure Drop (Pa)"), q("Pressure Drop (in.wg)")]);
    isp.forEach((it, i) => {
      rows.push([q(i + 1), q(it.type), q(it.pa), q(inWgFromPa(Number(it.pa)).toFixed(4))]);
    });

    rows.push([]);
    rows.push([q("── FINAL SUMMARY ──")]);
    rows.push([q("Parameter"), q("Value (Pa)"), q("Value (in.wg)")]);
    rows.push([q("ESP (with Safety Factor)"), q(toPa(R.ESP).toFixed(0)), q(R.ESP.toFixed(4))]);
    rows.push([q("ISP (Internal)"),           q(toPa(R.ISP).toFixed(0)), q(R.ISP.toFixed(4))]);
    rows.push([q("TSP = ESP + ISP"),          q(toPa(R.TSP).toFixed(0)), q(R.TSP.toFixed(4))]);
    rows.push([q("Safety Factor"),            q(sf + "%"), q("")]);
    rows.push([q("Fan Efficiency"),           q(fanEff + "%"), q("")]);
    rows.push([q("Motor Efficiency"),         q(motorEff + "%"), q("")]);
    rows.push([q("Fan Brake Power"),          q(R.fanBkw.toFixed(3) + " kW"), q("")]);
    rows.push([q("Motor Power"),              q(R.motorKw.toFixed(3) + " kW"), q(R.motorHP.toFixed(2) + " HP")]);

    return rows.map(r => r.join(",")).join("\r\n");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SHEETJS (xlsx-js-style) BUILDER — Colors + Formatting with styles
  // ─────────────────────────────────────────────────────────────────────────
  const buildXLSX = () => {
    const wb = XLSX.utils.book_new();

    // ── Style definitions ──────────────────────────────────────────────────
    const border = {
      top:    { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left:   { style: "thin", color: { rgb: "000000" } },
      right:  { style: "thin", color: { rgb: "000000" } },
    };

    const S = {
      redTitle: {
        font: { bold: true, color: { rgb: "C00000" }, sz: 16, name: "Calibri" },
        alignment: { horizontal: "center", vertical: "center" },
      },
      redSubtitle: {
        font: { bold: true, color: { rgb: "C00000" }, sz: 13, name: "Calibri" },
        alignment: { horizontal: "center", vertical: "center" },
      },
      redSection: {
        font: { bold: true, color: { rgb: "C00000" }, sz: 12, name: "Calibri" },
        alignment: { horizontal: "left", vertical: "center" },
      },
      yellowHdr: {
        font: { bold: true, sz: 11, name: "Calibri" },
        fill: { patternType: "solid", fgColor: { rgb: "FFFF00" } },
        border,
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
      },
      grayHdr: {
        font: { bold: true, sz: 11, name: "Calibri" },
        fill: { patternType: "solid", fgColor: { rgb: "D9D9D9" } },
        border,
        alignment: { horizontal: "left", vertical: "center" },
      },
      grayHdrR: {
        font: { bold: true, sz: 11, name: "Calibri" },
        fill: { patternType: "solid", fgColor: { rgb: "D9D9D9" } },
        border,
        alignment: { horizontal: "right", vertical: "center" },
      },
      totalStyle: {
        font: { bold: true, color: { rgb: "C00000" }, sz: 12, name: "Calibri" },
        fill: { patternType: "solid", fgColor: { rgb: "FFF2CC" } },
        border,
        alignment: { horizontal: "right", vertical: "center" },
      },
      totalStyleL: {
        font: { bold: true, color: { rgb: "C00000" }, sz: 12, name: "Calibri" },
        fill: { patternType: "solid", fgColor: { rgb: "FFF2CC" } },
        border,
        alignment: { horizontal: "left", vertical: "center" },
      },
      cell: {
        font: { sz: 11, name: "Calibri" },
        border,
        alignment: { horizontal: "center", vertical: "center" },
      },
      cellL: {
        font: { sz: 11, name: "Calibri" },
        border,
        alignment: { horizontal: "left", vertical: "center" },
      },
      cellR: {
        font: { bold: true, sz: 11, name: "Calibri" },
        border,
        alignment: { horizontal: "right", vertical: "center" },
      },
      empty: { font: { sz: 11 } },
    };

    // Helper: cell with value + style
    const C = (v, s) => ({ v, s, t: typeof v === "number" ? "n" : "s" });
    const E = () => C("", S.empty);
    const NCOLS = 14;
    const emptyRow = () => Array(NCOLS).fill(null).map(() => E());

    const wsData = [];
    const merges = [];

    const addMerge = (r, cs, ce) => merges.push({ s: { r, c: cs }, e: { r, c: ce } });

    let r = 0;

    // ── Row 0-1: Prepared / Checked ──
    wsData.push([C("Prepared by- ____________________", S.empty), ...Array(NCOLS-1).fill(null).map(() => E())]);
    r++;
    wsData.push([C("Checked by-  ____________________", S.empty), ...Array(NCOLS-1).fill(null).map(() => E())]);
    r++;
    wsData.push(emptyRow()); r++;

    // ── Title ──
    wsData.push([C("EXTERNAL STATIC PRESSURE CALCULATION", S.redTitle), ...Array(NCOLS-1).fill(null).map(() => E())]);
    addMerge(r, 0, NCOLS-1); r++;

    wsData.push([C(`${fanCFM} CFM (${projectName})`, S.redSubtitle), ...Array(NCOLS-1).fill(null).map(() => E())]);
    addMerge(r, 0, NCOLS-1); r++;

    wsData.push(emptyRow()); r++;

    // ── Column Headers ──
    const headers = [
      "S.No.", "Description", "W (in)", "H (in)", "Dia (in)",
      "Area (sq.ft)", "De (in)", "Flow (CFM)", "Velocity (fpm)",
      "Velocity Head (in.wg)", "Co / Fr", "Len / Qty",
      "Loss (in.wg)", "Total Pressure Drop (Pa)",
    ];
    wsData.push(headers.map(h => C(h, S.yellowHdr)));
    r++;

    // ── Duct Sub-header ──
    wsData.push([C("Supply / Duct System (External)", S.grayHdr), ...Array(NCOLS-1).fill(null).map(() => C("", S.grayHdr))]);
    addMerge(r, 0, NCOLS-1); r++;

    let sno = 0;
    R.ductDetails.forEach(d => {
      sno++;
      wsData.push([
        C(sno, S.cell),
        C(d.name, S.cellL),
        C(d.ductType !== "round" ? d.width : "-", S.cell),
        C(d.ductType !== "round" ? d.height : "-", S.cell),
        C(d.ductType === "round" ? d.diameter : "-", S.cell),
        C(parseFloat(d.area.toFixed(4)), S.cell),
        C(parseFloat(d.de.toFixed(2)), S.cell),
        C(d.cfm, S.cell),
        C(Math.round(d.vel), S.cell),
        C(parseFloat(d.vpVal.toFixed(5)), S.cell),
        C(parseFloat(d.fr.toFixed(4)), S.cell),
        C(d.length, S.cell),
        C(parseFloat(d.loss.toFixed(4)), S.cell),
        C(parseFloat(toPa(d.loss).toFixed(2)), S.cellR),
      ]);
      r++;
    });

    // ── Fittings ──
    if (fittings.length > 0) {
      wsData.push([C("Fittings & Transitions", S.grayHdr), ...Array(NCOLS-1).fill(null).map(() => C("", S.grayHdr))]);
      addMerge(r, 0, NCOLS-1); r++;
      fittings.forEach(f => {
        const co = FITTING_C[f.type]?.c ?? 0.1;
        const loss = co * R.critVP * Number(f.qty);
        sno++;
        wsData.push([
          C(sno, S.cell),
          C(f.type, S.cellL),
          C(`Co coefficient = ${co}`, S.cell),
          C("", S.cell), C("", S.cell), C("", S.cell),
          C("-", S.cell), C("-", S.cell),
          C(parseFloat(R.critVP.toFixed(5)), S.cell),
          C(co, S.cell),
          C(Number(f.qty), S.cell),
          C(parseFloat(loss.toFixed(4)), S.cell),
          C(parseFloat(toPa(loss).toFixed(2)), S.cellR),
          C("", S.cell),
        ]);
        r++;
      });
    }

    // ── ADP ──
    if (adp.length > 0) {
      wsData.push([C("ADP & Air Terminal Equipment", S.grayHdr), ...Array(NCOLS-1).fill(null).map(() => C("", S.grayHdr))]);
      addMerge(r, 0, NCOLS-1); r++;
      adp.forEach(a => {
        const loss = inWgFromPa(Number(a.pa));
        sno++;
        wsData.push([
          C(sno, S.cell),
          C(a.type, S.cellL),
          C("Air Terminal / Equipment", S.cell),
          C("", S.cell), C("", S.cell), C("", S.cell),
          C("", S.cell), C("", S.cell), C("", S.cell), C("", S.cell),
          C("-", S.cell),
          C(parseFloat(loss.toFixed(4)), S.cell),
          C(parseFloat(Number(a.pa).toFixed(2)), S.cellR),
          C("", S.cell),
        ]);
        r++;
      });
    }

    // ── Sub Total ──
    wsData.push([
      ...Array(12).fill(null).map(() => C("", S.grayHdr)),
      C("Sub Total (Pa)", S.grayHdrR),
      C(parseFloat(toPa(R.ESP_raw).toFixed(0)), S.cellR),
    ]);
    r++;

    // ── Safety Factor ──
    wsData.push([
      ...Array(12).fill(null).map(() => C("", S.grayHdr)),
      C(`Safety Factor (${sf}%)`, S.grayHdrR),
      C(parseFloat(toPa(R.ESP - R.ESP_raw).toFixed(0)), S.cellR),
    ]);
    r++;

    // ── Grand Total ──
    wsData.push([
      ...Array(12).fill(null).map(() => C("", S.totalStyle)),
      C("GRAND TOTAL ESP (Pa)", S.totalStyle),
      C(parseFloat(toPa(R.ESP).toFixed(0)), S.totalStyle),
    ]);
    r++;

    wsData.push(emptyRow()); r++;

    // ── ISP Section ──
    wsData.push([C("INTERNAL STATIC PRESSURE (ISP) COMPONENTS", S.redSection), ...Array(NCOLS-1).fill(null).map(() => E())]);
    addMerge(r, 0, NCOLS-1); r++;

    wsData.push([
      C("S.No.", S.yellowHdr),
      C("Component", S.yellowHdr),
      C("Pressure Drop (Pa)", S.yellowHdr),
      C("Pressure Drop (in.wg)", S.yellowHdr),
      ...Array(NCOLS-4).fill(null).map(() => E()),
    ]);
    r++;

    isp.forEach((it, idx) => {
      wsData.push([
        C(idx + 1, S.cell),
        C(it.type, S.cellL),
        C(Number(it.pa), S.cell),
        C(parseFloat(inWgFromPa(Number(it.pa)).toFixed(4)), S.cell),
        ...Array(NCOLS-4).fill(null).map(() => E()),
      ]);
      r++;
    });

    // ISP Total
    wsData.push([
      C("", S.totalStyle),
      C("ISP Total", S.totalStyleL),
      C(parseFloat(toPa(R.ISP).toFixed(0)), S.totalStyle),
      C(parseFloat(R.ISP.toFixed(4)), S.totalStyle),
      ...Array(NCOLS-4).fill(null).map(() => E()),
    ]);
    r++;

    wsData.push(emptyRow()); r++;

    // ── Final Summary ──
    wsData.push([C("FINAL SUMMARY", S.redSection), ...Array(NCOLS-1).fill(null).map(() => E())]);
    addMerge(r, 0, NCOLS-1); r++;

    const summaryRows = [
      ["ESP (Pa)",              parseFloat(toPa(R.ESP).toFixed(0)),   false],
      ["ISP (Pa)",              parseFloat(toPa(R.ISP).toFixed(0)),   false],
      ["TSP = ESP + ISP (Pa)",  parseFloat(toPa(R.TSP).toFixed(0)),   true ],
      ["TSP (in.wg)",           parseFloat(R.TSP.toFixed(4)),         false],
      ["Fan Brake kW",          parseFloat(R.fanBkw.toFixed(3)),      false],
      ["Motor Power (kW)",      parseFloat(R.motorKw.toFixed(3)),     false],
      ["Motor Power (HP)",      parseFloat(R.motorHP.toFixed(2)),     false],
      ["Fan Efficiency",        fanEff + " %",                        false],
      ["Motor Efficiency",      motorEff + " %",                      false],
    ];

    summaryRows.forEach(([label, val, isTotal]) => {
      wsData.push([
        C(label, isTotal ? S.totalStyleL : S.grayHdr),
        C(val,   isTotal ? S.totalStyle  : S.cellR),
        ...Array(NCOLS-2).fill(null).map(() => E()),
      ]);
      r++;
    });

    wsData.push(emptyRow()); r++;

    // ── Notes Section ──
    const noteStyle = {
      font: { sz: 10, name: "Calibri" },
      alignment: { horizontal: "left", vertical: "center", wrapText: true },
    };
    const noteBoldStyle = {
      font: { bold: true, sz: 10, name: "Calibri" },
      alignment: { horizontal: "left", vertical: "center" },
    };

    wsData.push([C("Note-", noteBoldStyle), ...Array(NCOLS-1).fill(null).map(() => E())]);
    addMerge(r, 0, NCOLS-1); r++;

    const notes = [
      "1) Pressure drop across duct fittings has been taken from ASHRAE duct design chapter.",
      "2) Pressure drop across fire damper has been taken from ASHRAE duct design chapter.",
      "3) Pressure drop across volume control damper has been taken from ASHRAE duct design chapter.",
      "4) Pressure drop across all air terminal devices has been taken as per Cosmos catalogue.",
      "5) Pressure drop across Back-Draft Damper has been taken as per Cosmos catalogue.",
      "6) Pressure across flexible connection has been assumed 10 Pa.",
    ];

    notes.forEach(note => {
      wsData.push([C(note, noteStyle), ...Array(NCOLS-1).fill(null).map(() => E())]);
      addMerge(r, 0, NCOLS-1); r++;
    });

    // ── Build worksheet ──
    const ws = XLSX.utils.aoa_to_sheet(
      wsData.map(row => row.map(cell => (cell ? cell.v : "")))
    );

    // Apply styles cell by cell
    wsData.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        if (!cell) return;
        const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
        if (!ws[addr]) ws[addr] = {};
        ws[addr].v = cell.v;
        ws[addr].t = cell.t || "s";
        if (cell.s) ws[addr].s = cell.s;
      });
    });

    ws["!merges"] = merges;

    // Column widths
    ws["!cols"] = [
      { wch: 6 },  { wch: 24 }, { wch: 7 },  { wch: 7 },
      { wch: 8 },  { wch: 11 }, { wch: 8 },  { wch: 9 },
      { wch: 14 }, { wch: 20 }, { wch: 8 },  { wch: 9 },
      { wch: 13 }, { wch: 22 },
    ];

    // Row heights
    ws["!rows"] = wsData.map((_, i) => {
      if (i === 3 || i === 4) return { hpt: 28 }; // title rows taller
      return { hpt: 20 };
    });

    XLSX.utils.book_append_sheet(wb, ws, "ESP Calculation");
    return wb;
  };
  // ─────────────────────────────────────────────────────────────────────────
  // EXCEL EXPORT
  // PC/Web  → purana HTML .xls (colors, formatting bilkul same)
  // Android → SheetJS .xlsx (mobile Excel/WPS pe sahi dikhega)
  // ─────────────────────────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    setDownloading(true);
    setDownloadMsg("");

    try {
      if (Capacitor.isNativePlatform()) {
        // ── ANDROID — SheetJS .xlsx — mobile Excel app mein sahi dikhega ────
        const wb = buildXLSX();
        const fileName = `ESP_${fanCFM}CFM_${projectName.replace(/\s+/g, "_")}.xlsx`;
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "base64" });

        await Filesystem.writeFile({
          path: fileName,
          data: wbout,
          directory: Directory.Cache,
          recursive: true,
        });

        const uriResult = await Filesystem.getUri({
          directory: Directory.Cache,
          path: fileName,
        });

        await Share.share({
          title: "ESP Calculation — " + projectName,
          text: fileName,
          url: uriResult.uri,
          dialogTitle: "Save or share the Excel file.",
        });

        setDownloadMsg("✅ ESP Report Generated & Downloaded Successfully.");
      } else {
        // ── WEB / PC — purana HTML .xls format (bilkul pehle jaisa) ─────────
        const html = buildExcelHtml();
        const fileName = `ESP_${fanCFM}CFM_${projectName.replace(/\s+/g, "_")}.xls`;
        const blob = new Blob(["\ufeff", html], {
          type: "application/vnd.ms-excel;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDownloadMsg("✅ Downloading Excel File!");
      }
    } catch (err) {
      console.error("Export error:", err);
      setDownloadMsg(`❌ Error: ${err?.message || "Export fail hua."}`);
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadMsg(""), 6000);
    }
  };

  return (
    <>
      <link href={FONT_LINK} rel="stylesheet" />
      <div
        style={{
          background: T.bg,
          minHeight: "100vh",
          padding: "1rem 0.75rem 1.5rem",
          fontFamily: "'Rajdhani', sans-serif",
          color: T.text,
          transition: "background 0.3s, color 0.3s",
          boxSizing: "border-box",
          overflowX: "hidden",
          width: "100%",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto 1.1rem",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {/* Row 1: Logo + Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  background: T.headerGrad,
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1.4rem",
                  flexShrink: 0,
                }}
              >
                🌀
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: T.isDark ? "#f0f9ff" : "#0F172A",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "'Rajdhani', sans-serif",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  ESP / ISP / TSP Calc
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: T.textMuted,
                    fontWeight: 600,
                  }}
                >
                  ASHRAE · Rect · Round · Flat Oval · Pa · mm · in.wg
                </p>
              </div>
            </div>

            {/* Row 2: Excel Download Button */}
            <button
              onClick={handleExportExcel}
              disabled={downloading}
              title="Download as Excel (.xls)"
              style={{
                width: "100%",
                background: downloading
                  ? "linear-gradient(135deg,#15803d,#166534)"
                  : "linear-gradient(135deg,#16a34a,#15803d)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                padding: "0.6rem 1rem",
                fontSize: "0.95rem",
                cursor: downloading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                opacity: downloading ? 0.8 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {downloading ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      animation: "spin 1s linear infinite",
                    }}
                  >
                    ⏳
                  </span>
                  <span style={{ fontSize: "0.85rem", letterSpacing: "0.08em" }}>
                    GENERATING...
                  </span>
                </>
              ) : (
                <>
                  📊
                  <span
                    style={{ fontSize: "0.85rem", letterSpacing: "0.08em" }}
                  >
                    DOWNLOAD EXCEL REPORT
                  </span>
                </>
              )}
            </button>

            {/* Download status message */}
            {downloadMsg !== "" && (
              <div
                style={{
                  background: downloadMsg.startsWith("✅")
                    ? T.isDark
                      ? "#052e16"
                      : "#dcfce7"
                    : T.isDark
                    ? "#2d0a0a"
                    : "#fee2e2",
                  border: `1px solid ${
                    downloadMsg.startsWith("✅") ? "#16a34a" : "#ef4444"
                  }`,
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  color: downloadMsg.startsWith("✅") ? "#16a34a" : "#ef4444",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {downloadMsg}
              </div>
            )}
          </div>

          <div
            style={{
              height: "2px",
              background: "linear-gradient(90deg,#0ea5e9,transparent)",
              marginTop: "0.75rem",
            }}
          />
        </div>

        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          {/* PROJECT NAME */}
          <Card bg={T.cardBg} border={T.cardBorder}>
            <Label color={T.textMuted}>
              Project / AHU Name (for Excel header)
            </Label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. BANQUET AHU"
              style={{
                width: "100%",
                background: T.inputBg,
                border: `1px solid ${T.inputBorder}`,
                borderRadius: "8px",
                padding: "0.65rem 0.75rem",
                fontSize: "0.95rem",
                color: T.accent2,
                outline: "none",
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                boxSizing: "border-box",
              }}
            />
          </Card>

          {/* DUCT RUNS */}
          <Card bg={T.cardBg} border={T.cardBorder}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.85rem",
                gap: "0.5rem",
              }}
            >
              <SecTitle icon="🔧" text="Duct Runs (ESP)" color={T.text} />
              <AddBtn onClick={addDuct} />
            </div>
            {ducts.map((d) => (
              <DuctRow
                key={d.id}
                d={d}
                onChange={(k, v) => upDuct(d.id, k, v)}
                onRemove={() => rmDuct(d.id)}
                detail={R.ductDetails.find((x) => x.id === d.id)}
                T={T}
              />
            ))}
          </Card>

          {/* FITTINGS */}
          <Card bg={T.cardBg} border={T.cardBorder}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.85rem",
                gap: "0.5rem",
              }}
            >
              <SecTitle
                icon="🔩"
                text="Fittings & Transitions"
                color={T.text}
              />
              <AddBtn onClick={addFit} color="#a78bfa" />
            </div>
            <p style={{ ...metaLabel, marginBottom: "0.6rem" }}>
              Critical VP:{" "}
              <span
                style={{
                  color: "#22c55e",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {R.critVP.toFixed(5)}" wg
              </span>{" "}
              — Loss = Co × VP × Qty
            </p>
            {fittings.map((f) => (
              <div
                key={f.id}
                style={{
                  background: T.rowBg,
                  border: `1px solid ${T.rowBorder}`,
                  borderRadius: "10px",
                  padding: "0.85rem",
                  marginBottom: "0.65rem",
                  boxSizing: "border-box",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.45rem",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ ...metaLabel }}>Fitting Type</span>
                  <XBtn onClick={() => rmFit(f.id)} />
                </div>
                <Sel
                  value={f.type}
                  onChange={(v) => upFit(f.id, "type", v)}
                  options={Object.keys(FITTING_C)}
                  bg={T.inputBg}
                  border={T.inputBorder}
                  tc={T.text}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0.5rem",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: T.textDim,
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 600,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    Co={FITTING_C[f.type]?.c} · {FITTING_C[f.type]?.note}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ ...metaLabel }}>Qty:</span>
                    <input
                      type="number"
                      value={f.qty}
                      min="1"
                      onChange={(e) =>
                        upFit(f.id, "qty", Number(e.target.value))
                      }
                      style={{
                        width: "60px",
                        background: T.inputBg,
                        border: `1px solid ${T.inputBorder}`,
                        borderRadius: "6px",
                        padding: "0.4rem 0.5rem",
                        fontSize: "0.9375rem",
                        color: "#a78bfa",
                        outline: "none",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </Card>

          {/* ADP */}
          <Card
            bg={T.cardBg}
            border={T.cardBorder}
            accentBorder={T.isDark ? "#0d2b1a" : "#BBF7D0"}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.85rem",
                gap: "0.5rem",
              }}
            >
              <SecTitle icon="🏠" text="ADP & Equipment (Pa)" color={T.text} />
              <AddBtn onClick={addAdp} color="#22c55e" />
            </div>
            {adp.map((a) => (
              <div
                key={a.id}
                style={{
                  background: T.rowBg,
                  border: `1px solid ${T.rowBorder}`,
                  borderRadius: "10px",
                  padding: "0.85rem",
                  marginBottom: "0.65rem",
                  boxSizing: "border-box",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.45rem",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ ...metaLabel }}>Equipment</span>
                  <XBtn onClick={() => rmAdp(a.id)} />
                </div>
                <Sel
                  value={a.type}
                  onChange={(v) => {
                    upAdp(a.id, "type", v);
                    upAdp(a.id, "pa", ADP_MAP[v]?.def ?? 10);
                  }}
                  options={Object.keys(ADP_MAP)}
                  bg={T.inputBg}
                  border={T.inputBorder}
                  tc={T.text}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0.5rem",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ ...metaLabel, flexShrink: 0 }}>
                    Pressure (Pa)
                  </span>
                  <input
                    type="number"
                    value={a.pa}
                    min="0"
                    step="0.5"
                    onChange={(e) => upAdp(a.id, "pa", e.target.value)}
                    style={{
                      width: "90px",
                      background: T.inputBg,
                      border: `1px solid ${T.inputBorder}`,
                      borderRadius: "6px",
                      padding: "0.4rem 0.5rem",
                      fontSize: "0.9375rem",
                      color: "#22c55e",
                      outline: "none",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            ))}
          </Card>

          {/* ISP */}
          <Card
            bg={T.cardBg}
            border={T.cardBorder}
            accentBorder={T.isDark ? "#1e1b4b" : "#C7D2FE"}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.85rem",
                gap: "0.5rem",
              }}
            >
              <SecTitle icon="🧩" text="ISP Components (Pa)" color={T.text} />
              <AddBtn onClick={addIsp} color="#818cf8" />
            </div>
            {isp.map((i) => (
              <div
                key={i.id}
                style={{
                  background: T.rowBg,
                  border: `1px solid ${T.rowBorder}`,
                  borderRadius: "10px",
                  padding: "0.85rem",
                  marginBottom: "0.65rem",
                  boxSizing: "border-box",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.45rem",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ ...metaLabel }}>Component</span>
                  <XBtn onClick={() => rmIsp(i.id)} />
                </div>
                <Sel
                  value={i.type}
                  onChange={(v) => {
                    upIsp(i.id, "type", v);
                    upIsp(i.id, "pa", ISP_MAP[v]?.def ?? 50);
                  }}
                  options={Object.keys(ISP_MAP)}
                  bg={T.inputBg}
                  border={T.inputBorder}
                  tc={T.text}
                />
                {ISP_MAP[i.type] && (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: T.textDim,
                      marginTop: "0.25rem",
                      fontWeight: 600,
                    }}
                  >
                    Range: {ISP_MAP[i.type].min}–{ISP_MAP[i.type].max} Pa
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0.5rem",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ ...metaLabel, flexShrink: 0 }}>
                    Pressure (Pa)
                  </span>
                  <input
                    type="number"
                    value={i.pa}
                    min="0"
                    step="1"
                    onChange={(e) => upIsp(i.id, "pa", e.target.value)}
                    style={{
                      width: "90px",
                      background: T.inputBg,
                      border: `1px solid ${T.inputBorder}`,
                      borderRadius: "6px",
                      padding: "0.4rem 0.5rem",
                      fontSize: "0.9375rem",
                      color: "#818cf8",
                      outline: "none",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            ))}
          </Card>

          {/* FAN & MOTOR */}
          <Card
            bg={T.cardBg}
            border={T.cardBorder}
            accentBorder={T.isDark ? "#1a1a0a" : "#FEF9C3"}
          >
            <SecTitle icon="⚡" text="Fan & Motor" color={T.text} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                width: "100%",
              }}
            >
              {[
                {
                  label: "System CFM",
                  val: fanCFM,
                  set: setFanCFM,
                  unit: "CFM",
                  min: 100,
                  step: "50",
                },
                {
                  label: "Safety Factor",
                  val: sf,
                  set: setSf,
                  unit: "%",
                  min: 0,
                  step: "1",
                },
                {
                  label: "Fan Efficiency",
                  val: fanEff,
                  set: setFanEff,
                  unit: "%",
                  min: 30,
                  step: "1",
                },
                {
                  label: "Motor Efficiency",
                  val: motorEff,
                  set: setMotorEff,
                  unit: "%",
                  min: 50,
                  step: "1",
                },
              ].map(({ label, val, set, unit, min, step }) => (
                <div key={label} style={{ width: "100%" }}>
                  <Label color={T.textMuted}>{label}</Label>
                  <NumInput
                    value={val}
                    onChange={set}
                    unit={unit}
                    min={min}
                    step={step}
                    bg={T.inputBg}
                    border={T.inputBorder}
                    tc="#f59e0b"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* RESULTS */}
          <div
            style={{
              background: T.resultBg,
              border: `2px solid ${R.rColor}44`,
              borderRadius: "14px",
              padding: "1.1rem",
              marginBottom: "1rem",
              boxSizing: "border-box",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.1rem",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: T.text,
                }}
              >
                📊 Results
              </span>
              <span
                style={{
                  background: `${R.rColor}22`,
                  border: `1px solid ${R.rColor}`,
                  borderRadius: "20px",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.875rem",
                  color: R.rColor,
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                  flexShrink: 0,
                }}
              >
                {R.rating}
              </span>
            </div>

            {/* ESP Breakdown */}
            <div style={{ marginBottom: "1rem" }}>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: T.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "0.55rem",
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                ESP Breakdown
              </p>

              {[
                ["Duct Friction", "#0ea5e9", R.ductLoss],
                ["Fittings", "#a78bfa", R.fitLoss],
                ["ADP / Equip", "#22c55e", R.adpLoss],
              ].map(([l, c, v]) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: T.formulaBg,
                    borderRadius: "8px",
                    padding: "0.5rem 0.75rem",
                    marginBottom: "0.4rem",
                    gap: "0.5rem",
                    boxSizing: "border-box",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: T.textMuted,
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {l}
                  </span>
                  <div style={{ textAlign: "right", minWidth: 0 }}>
                    <span style={{ ...monoVal(c, "0.9375rem") }}>
                      {v.toFixed(4)}"
                    </span>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: T.textDim,
                        marginLeft: "0.4rem",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {toPa(v).toFixed(1)} Pa
                    </span>
                  </div>
                </div>
              ))}

              {R.ESP_raw > 0 && (
                <div
                  style={{
                    display: "flex",
                    height: "5px",
                    borderRadius: "3px",
                    overflow: "hidden",
                    background: T.formulaBg,
                    marginTop: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: `${(R.ductLoss / R.ESP_raw) * 100}%`,
                      background: "#0ea5e9",
                    }}
                  />
                  <div
                    style={{
                      width: `${(R.fitLoss / R.ESP_raw) * 100}%`,
                      background: "#a78bfa",
                    }}
                  />
                  <div
                    style={{
                      width: `${(R.adpLoss / R.ESP_raw) * 100}%`,
                      background: "#22c55e",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Pressure blocks */}
            <div style={{ marginBottom: "1rem" }}>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: T.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "0.55rem",
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                Pressure Results
              </p>
              <PressureBlock
                label={`ESP  (×${(1 + sf / 100).toFixed(2)} Safety Factor)`}
                inwg={R.ESP}
                color="#38bdf8"
                bg={T.formulaBg}
                border={T.formulaBorder}
              />
              <PressureBlock
                label="ISP  (Internal Static Pressure)"
                inwg={R.ISP}
                color="#818cf8"
                bg={T.formulaBg}
                border={T.formulaBorder}
              />
              <PressureBlock
                label="TSP  = ESP + ISP"
                inwg={R.TSP}
                color={R.rColor}
                bg={T.formulaBg}
                border={`${R.rColor}44`}
              />
            </div>

            {/* Formula trace */}
            <div
              style={{
                background: T.formulaBg,
                border: `1px solid ${T.formulaBorder}`,
                borderRadius: "10px",
                padding: "0.9rem 1rem",
                marginBottom: "0.85rem",
                boxSizing: "border-box",
                width: "100%",
                overflow: "hidden",
              }}
            >
              {[
                [
                  "ESP raw",
                  `${R.ESP_raw.toFixed(4)}"  (${toPa(R.ESP_raw).toFixed(1)} Pa)`,
                  "#38bdf8",
                ],
                [
                  `ESP + SF (${(1 + sf / 100).toFixed(2)}×)`,
                  `${R.ESP.toFixed(4)}"`,
                  "#38bdf8",
                ],
                [
                  "ISP",
                  `${R.ISP.toFixed(4)}"  (${toPa(R.ISP).toFixed(1)} Pa)`,
                  "#818cf8",
                ],
                ["TSP = ESP + ISP", `${R.TSP.toFixed(4)}"`, R.rColor],
                ["TP = TSP + VP", `${R.TP.toFixed(4)}"`, "#f59e0b"],
              ].map(([k, v, c]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    paddingBottom: "0.4rem",
                    marginBottom: "0.4rem",
                    borderBottom: `1px solid ${T.cardBorder}`,
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: T.textMuted,
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {k}
                  </span>
                  <span
                    style={{ ...monoVal(c, "0.875rem"), textAlign: "right" }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {/* Fan Power */}
            <div
              style={{
                background: T.formulaBg,
                border: `1px solid ${T.formulaBorder}`,
                borderRadius: "10px",
                padding: "0.9rem 1rem",
                boxSizing: "border-box",
                width: "100%",
                overflow: "hidden",
              }}
            >
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: T.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: "0.6rem",
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                Fan Power
              </p>
              {[
                [
                  "Formula (BkW)",
                  "[CFM × TSP] / [8536 × η_fan]",
                  T.textDim,
                ],
                ["Fan Brake kW", `${R.fanBkw.toFixed(3)} kW`, "#f59e0b"],
                ["Formula (Motor)", "BkW × SF / η_motor", T.textDim],
                [
                  "Motor Power",
                  `${R.motorKw.toFixed(3)} kW  /  ${R.motorHP.toFixed(2)} HP`,
                  "#fb923c",
                ],
              ].map(([k, v, c]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    paddingBottom: "0.4rem",
                    marginBottom: "0.4rem",
                    borderBottom: `1px solid ${T.cardBorder}`,
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: T.textDim,
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {k}
                  </span>
                  <span
                    style={{ ...monoVal(c, "0.875rem"), textAlign: "right" }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {R.TSP > 1.5 && (
              <div
                style={{
                  marginTop: "0.85rem",
                  background: T.isDark ? "#180a04" : "#FFF7ED",
                  border: "1px solid #f9731640",
                  borderRadius: "8px",
                  padding: "0.65rem 0.9rem",
                  fontSize: "0.875rem",
                  color: "#fb923c",
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 600,
                  boxSizing: "border-box",
                }}
              >
                ⚠️ High TSP — upsize duct sections, reduce fittings, or use
                VFD-driven fan.
              </div>
            )}
          </div>

          <p
            style={{
              textAlign: "center",
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: T.textDim,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
            }}
          >
            ASHRAE Fundamentals 2021 · ESP=Duct+Fittings+ADP · ISP=Internal ·
            TSP=ESP+ISP
          </p>
        </div>

        {/* CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}