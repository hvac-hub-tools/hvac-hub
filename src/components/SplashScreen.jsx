import { useEffect, useRef, useState } from "react";
import "./SplashScreen.css";

// Letter config: color class per letter of "ecofirst"
const LETTERS = [
  { char: "e", cls: "letter-green" },
  { char: "c", cls: "letter-green-light" },
  { char: "o", cls: "letter-green-light" },
  { char: "f", cls: "letter-blue" },
  { char: "i", cls: "letter-blue" },
  { char: "r", cls: "letter-blue" },
  { char: "s", cls: "letter-blue" },
  { char: "t", cls: "letter-blue" },
];

const BASE_DELAY = 0.3;   // seconds before first letter
const STAGGER    = 0.11;  // seconds between each letter

// Particle config — dark mode colors
const GREEN_COLORS_DARK = ["#4a9b5f", "#7dc47a", "#a8d8a8"];
const BLUE_COLORS_DARK  = ["#1a4b8c", "#2563b0", "#5b9bd5"];

// Particle config — light mode colors (slightly more saturated/visible)
const GREEN_COLORS_LIGHT = ["#2e7d46", "#4a9b5f", "#6dbf6b"];
const BLUE_COLORS_LIGHT  = ["#1a4b8c", "#1d5faa", "#3a7fc1"];

function generateParticles(count = 40, isDark = true) {
  const GREEN = isDark ? GREEN_COLORS_DARK : GREEN_COLORS_LIGHT;
  const BLUE  = isDark ? BLUE_COLORS_DARK  : BLUE_COLORS_LIGHT;
  return Array.from({ length: count }, (_, i) => {
    const isGreen = Math.random() > 0.5;
    const palette = isGreen ? GREEN : BLUE;
    const color   = palette[Math.floor(Math.random() * palette.length)];
    const size    = Math.random() * 5 + 2;
    return {
      id: i,
      left:     `${Math.random() * 100}%`,
      width:    `${size}px`,
      height:   `${size}px`,
      background: color,
      boxShadow:  `0 0 ${size * 2}px ${color}`,
      animationDuration:  `${Math.random() * 10 + 8}s`,
      animationDelay:     `${Math.random() * 6}s`,
    };
  });
}

// ─── Detect system color scheme ──────────────────────────────────────────────
function getColorScheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark"; // fallback
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SplashScreen({ onFinish, theme: colorScheme }) {
  // colorScheme prop: "dark" | "light" | undefined (auto-detect)
  const [scheme, setScheme] = useState(() => colorScheme || getColorScheme());
  const isDark = scheme === "dark";

  const [particles, setParticles] = useState(() =>
    generateParticles(40, scheme !== "light")
  );
  const [pulsedIdx, setPulsedIdx] = useState(new Set());
  const timersRef = useRef([]);

  // Listen for system theme changes (if no prop override)
  useEffect(() => {
    if (colorScheme) return; // prop takes priority
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const next = e.matches ? "dark" : "light";
      setScheme(next);
      setParticles(generateParticles(40, e.matches));
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [colorScheme]);

  // Sync if colorScheme prop changes at runtime
  useEffect(() => {
    if (!colorScheme) return;
    setScheme(colorScheme);
    setParticles(generateParticles(40, colorScheme !== "light"));
  }, [colorScheme]);

  // After each letter lands → switch to idle glow pulse
  useEffect(() => {
    LETTERS.forEach((_, i) => {
      const delay = (BASE_DELAY + i * STAGGER + 0.7) * 1000;
      const t = setTimeout(() => {
        setPulsedIdx(prev => new Set([...prev, i]));
      }, delay);
      timersRef.current.push(t);
    });

    if (onFinish) {
      const t = setTimeout(onFinish, 4500);
      timersRef.current.push(t);
    }

    return () => timersRef.current.forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div className={`sf-root sf-root--${scheme}`}>
      {/* ── Leaf watermarks ── */}
      <svg className="sf-leaf sf-leaf-1" viewBox="0 0 200 200" fill="none">
        <path d="M100 10 C140 10,190 50,190 100 C190 150,140 190,100 190 C60 190,10 150,10 100 C10 50,60 10,100 10Z" fill="#4a9b5f"/>
        <path d="M100 10 L100 190" stroke="#3a8a4f" strokeWidth="1.5"/>
        <path d="M100 50 L60 90"   stroke="#3a8a4f" strokeWidth="1"/>
        <path d="M100 70 L140 110" stroke="#3a8a4f" strokeWidth="1"/>
        <path d="M100 100 L55 130" stroke="#3a8a4f" strokeWidth="1"/>
        <path d="M100 120 L145 145" stroke="#3a8a4f" strokeWidth="1"/>
      </svg>
      <svg className="sf-leaf sf-leaf-2" viewBox="0 0 200 200" fill="none">
        <path d="M100 10 C140 10,190 50,190 100 C190 150,140 190,100 190 C60 190,10 150,10 100 C10 50,60 10,100 10Z" fill="#1a4b8c"/>
        <path d="M100 10 L100 190" stroke="#2563b0" strokeWidth="1.5"/>
      </svg>

      {/* ── Blueprint background ── */}
      <div className="sf-bp-canvas" />

      {/* ── Engineering SVG overlay ── */}
      <svg className="sf-eng-details" viewBox="0 0 1400 800">
        {/* Dimension lines left */}
        <line x1="60" y1="150" x2="60" y2="650" stroke="rgba(26,75,140,0.2)" strokeWidth="1"/>
        <line x1="55" y1="150" x2="65" y2="150" stroke="rgba(26,75,140,0.3)" strokeWidth="1"/>
        <line x1="55" y1="650" x2="65" y2="650" stroke="rgba(26,75,140,0.3)" strokeWidth="1"/>
        <text x="50" y="400" fill="rgba(26,75,140,0.25)" fontSize="9" fontFamily="'Exo 2',sans-serif" letterSpacing="1" transform="rotate(-90 50 400)">ELEVATION H=500mm</text>
        {/* Left circles */}
        <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(26,75,140,0.12)" strokeWidth="1" strokeDasharray="4 4"/>
        <circle cx="200" cy="200" r="50" fill="none" stroke="rgba(26,75,140,0.10)" strokeWidth="1"/>
        <line x1="120" y1="200" x2="280" y2="200" stroke="rgba(26,75,140,0.15)" strokeWidth="0.8"/>
        <line x1="200" y1="120" x2="200" y2="280" stroke="rgba(26,75,140,0.15)" strokeWidth="0.8"/>
        <text x="210" y="175" fill="rgba(26,75,140,0.25)" fontSize="8" fontFamily="'Exo 2',sans-serif">Ø160</text>
        {/* Right circles */}
        <circle cx="1200" cy="600" r="100" fill="none" stroke="rgba(74,155,95,0.10)" strokeWidth="1" strokeDasharray="6 3"/>
        <circle cx="1200" cy="600" r="60"  fill="none" stroke="rgba(74,155,95,0.08)" strokeWidth="1"/>
        <line x1="1100" y1="600" x2="1300" y2="600" stroke="rgba(74,155,95,0.12)" strokeWidth="0.8"/>
        <line x1="1200" y1="500" x2="1200" y2="700" stroke="rgba(74,155,95,0.12)" strokeWidth="0.8"/>
        <text x="1215" y="575" fill="rgba(74,155,95,0.25)" fontSize="8" fontFamily="'Exo 2',sans-serif">Ø120</text>
        {/* Top bar */}
        <line x1="200" y1="40" x2="1200" y2="40" stroke="rgba(26,75,140,0.2)" strokeWidth="1"/>
        <line x1="200" y1="35" x2="200"  y2="45" stroke="rgba(26,75,140,0.3)" strokeWidth="1"/>
        <line x1="700" y1="35" x2="700"  y2="45" stroke="rgba(26,75,140,0.3)" strokeWidth="1"/>
        <line x1="1200" y1="35" x2="1200" y2="45" stroke="rgba(26,75,140,0.3)" strokeWidth="1"/>
        <text x="680" y="30" fill="rgba(26,75,140,0.2)" fontSize="8" fontFamily="'Exo 2',sans-serif" textAnchor="middle" letterSpacing="2">SECTION A-A</text>
        {/* Bottom spec block */}
        <rect x="900" y="700" width="340" height="70" fill="none" stroke="rgba(26,75,140,0.15)" strokeWidth="1"/>
        <line x1="900" y1="720" x2="1240" y2="720" stroke="rgba(26,75,140,0.10)" strokeWidth="0.8"/>
        <text x="915" y="714" fill="rgba(26,75,140,0.25)" fontSize="8" fontFamily="'Exo 2',sans-serif" letterSpacing="1">ECOFIRST — SUSTAINABLE SYSTEMS</text>
        <text x="915" y="735" fill="rgba(26,75,140,0.20)" fontSize="7" fontFamily="'Exo 2',sans-serif">PROJ NO: ECO-2026-001 | REV: A</text>
        <text x="915" y="750" fill="rgba(26,75,140,0.20)" fontSize="7" fontFamily="'Exo 2',sans-serif">SCALE 1:100 | DRAWN: TATA ENG.</text>
        <text x="915" y="763" fill="rgba(26,75,140,0.20)" fontSize="7" fontFamily="'Exo 2',sans-serif">DATE: 2026-05-07</text>
        {/* Ripple ellipses */}
        <ellipse cx="700" cy="400" rx="280" ry="280" fill="none" stroke="rgba(26,75,140,0.05)" strokeWidth="2"/>
        <ellipse cx="700" cy="400" rx="320" ry="320" fill="none" stroke="rgba(26,75,140,0.04)" strokeWidth="1.5"/>
      </svg>

      {/* ── Scan line ── */}
      <div className="sf-scanline" />

      {/* ── Corner brackets ── */}
      <div className="sf-bracket sf-tl" />
      <div className="sf-bracket sf-tr" />
      <div className="sf-bracket sf-bl" />
      <div className="sf-bracket sf-br" />

      {/* ── Data readouts ── */}
      <div className="sf-readout sf-readout-tl">
        SYS INIT v2.6.0<br/>ECO MODULE ACTIVE<br/>STATUS: ONLINE
      </div>
      <div className="sf-readout sf-readout-tr">
        CARBON OFFSET: 98.2%<br/>ENERGY IDX: 0.04 kWh<br/>GREENmark: PLATINUM
      </div>
      <div className="sf-readout sf-readout-bl">
        TATA GROUP — EST. 1868<br/>ECOFIRST INITIATIVE<br/>ISO 14001:2015
      </div>
      <div className="sf-readout sf-readout-br">
        LAT 19.0760° N<br/>LONG 72.8777° E<br/>MUMBAI, INDIA
      </div>

      {/* ── Particles ── */}
      <div className="sf-particles">
        {particles.map(p => (
          <div key={p.id} className="sf-particle" style={{
            left:             p.left,
            width:            p.width,
            height:           p.height,
            background:       p.background,
            boxShadow:        p.boxShadow,
            animationDuration: p.animationDuration,
            animationDelay:   p.animationDelay,
          }} />
        ))}
      </div>

      {/* ── Outer ring ── */}
      <div className="sf-ring-outer" />

      {/* ── Main content ── */}
      <div className="sf-splash">
        <div className="sf-logo-wrap">

          {/* ecofirst — letter by letter */}
          <div className="sf-eco-text">
            {LETTERS.map(({ char, cls }, i) => {
              const delay     = BASE_DELAY + i * STAGGER;
              const isPulsed  = pulsedIdx.has(i);
              const pulseClass = isPulsed
                ? (i < 3 ? "sf-pulse-green" : "sf-pulse-blue")
                : "";
              return (
                <span
                  key={i}
                  className={`sf-letter sf-letter-drop sf-letter-glitch ${cls} ${pulseClass}`}
                  style={{
                    "--delay": `${delay}s`,
                    animationDelay: isPulsed ? undefined : `${delay}s`,
                    letterSpacing: i < 3 ? "-2px" : "-3px",
                    opacity: isPulsed ? 1 : undefined,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>

          {/* Swoosh lines */}
          <div className="sf-swoosh-wrap">
            <svg viewBox="0 0 500 40" fill="none">
              <path d="M0 30 Q150 5 500 25"  stroke="#8aa3b8" strokeWidth="2.5" opacity="0.7"/>
              <path d="M0 35 Q200 8 500 30"  stroke="#4a9b5f" strokeWidth="2"   opacity="0.8"/>
              <path d="M0 38 Q180 12 500 33" stroke="#2563b0" strokeWidth="1.5" opacity="0.5"/>
              <ellipse cx="250" cy="18" rx="10" ry="5" fill="none" stroke="#4a9b5f" strokeWidth="1.2" transform="rotate(-15 250 18)" opacity="0.7"/>
              <line x1="250" y1="13" x2="250" y2="23" stroke="#4a9b5f" strokeWidth="0.8" opacity="0.7"/>
            </svg>
          </div>

          {/* Tagline */}
          <div className="sf-tagline">sustainable &nbsp;by&nbsp; design</div>

          {/* Divider */}
          <div className="sf-divider" />

          {/* TATA badge */}
          <div className="sf-tata-wrap">
            <span className="sf-tata-a">A</span>
            <span className="sf-tata-logo">TATA</span>
            <span className="sf-tata-enterprise">Enterprise</span>
          </div>
        </div>

        {/* Loading bar */}
        <div className="sf-loader-wrap">
          <div className="sf-loader-label">Initializing systems</div>
          <div className="sf-loader-bar" />
        </div>
      </div>
    </div>
  );
}
