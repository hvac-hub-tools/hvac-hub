import { useState, useCallback } from "react";

// ============================================================
//  ANDROID CAPACITOR DOWNLOAD — Dynamic import so browser
//  mein bhi kaam kare aur Capacitor app mein bhi
// ============================================================
const isCapacitorAndroid = (): boolean => {
  try {
    const cap = (window as any).Capacitor;
    return !!(cap && cap.isNativePlatform && cap.isNativePlatform() && cap.getPlatform() === "android");
  } catch {
    return false;
  }
};

async function saveImageAndroid(
  dataUrl: string,
  fileName: string,
  onStatus: (msg: string) => void
): Promise<boolean> {
  try {
    // Dynamic import — Capacitor plugins
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const { Toast }                 = await import("@capacitor/toast");

    const base64Data = dataUrl.split(",")[1];
    if (!base64Data) throw new Error("Invalid image data");

    onStatus("⏳ Saving to Downloads...");

    // Android SDK ≤ 29 — ExternalStorage/Download mein directly save
    // Android SDK 30+  — MediaStore ke zariye bhi ho sakta hai, lekin
    //                     ExternalStorage Documents directory safest hai
    try {
      await Filesystem.writeFile({
        path: `Download/${fileName}`,
        data: base64Data,
        directory: Directory.ExternalStorage,
        recursive: true,
      });
      await Toast.show({ text: `✅ Saved to Downloads: ${fileName}`, duration: "long" });
      onStatus("✅ Saved to Downloads folder!");
      return true;
    } catch (extErr) {
      // Fallback: Documents directory mein save karo + Share karo
      console.warn("ExternalStorage failed, trying Documents:", extErr);

      const { Share } = await import("@capacitor/share");
      const saved = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });

      // Share dialog se user khud Gallery ya Downloads mein save kar sakta hai
      await Share.share({
        title:       "PsychroPro Chart",
        text:        "Psychrometric Properties Report",
        url:         saved.uri,
        dialogTitle: "Save or Share Chart PNG",
      });

      onStatus("✅ File ready — Save from share dialog!");
      return true;
    }
  } catch (err: any) {
    console.error("Android save error:", err);
    onStatus(`❌ Save failed: ${err?.message ?? "Unknown error"}`);
    return false;
  }
}

// Browser fallback — purana <a> tag method
function saveImageBrowser(dataUrl: string, fileName: string): void {
  const a       = document.createElement("a");
  a.href        = dataUrl;
  a.download    = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ============================================================
//  UNIT CONVERSIONS
// ============================================================
const toC = (f: number) => (f - 32) * 5 / 9;
const toF = (c: number) => c * 9 / 5 + 32;

// ============================================================
//  PSYCHROMETRIC ENGINE  — ASHRAE 2017 Fundamentals Ch.1
// ============================================================
const PSYCHRO = {
  Psat(Tc: number) {
    const T = Tc + 273.15;
    if (Tc >= 0) {
      return Math.exp(
        -5.8002206e3 / T + 1.3914993
        - 4.8640239e-2 * T + 4.1764768e-5 * T * T
        - 1.4452093e-8 * T * T * T + 6.5459673 * Math.log(T)
      );
    } else {
      return Math.exp(
        -5.6745359e3 / T + 6.3925247
        - 9.677843e-3 * T + 6.2215701e-7 * T * T
        + 2.0747825e-9 * T * T * T - 9.484024e-13 * T * T * T * T
        + 4.1635019 * Math.log(T)
      );
    }
  },
  Tsat(Ps_pa: number) {
    let lo = -60, hi = 200;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (this.Psat(mid) < Ps_pa) lo = mid; else hi = mid;
      if (hi - lo < 1e-7) break;
    }
    return (lo + hi) / 2;
  },
  W_from_Pw(Pw: number, P: number) {
    if (Pw >= P) Pw = P * 0.9999;
    return 0.621945 * Pw / (P - Pw);
  },
  Pw_from_W(W: number, P: number) { return W * P / (0.621945 + W); },
  W_from_RH(Tdb: number, RH: number, P: number) {
    const Pw = (RH / 100) * this.Psat(Tdb);
    return this.W_from_Pw(Pw, P);
  },
  RH_from_W(Tdb: number, W: number, P: number) {
    return Math.min(100, Math.max(0, this.Pw_from_W(W, P) / this.Psat(Tdb) * 100));
  },
  Tdp(W: number, P: number) { return this.Tsat(this.Pw_from_W(W, P)); },
  W_from_Twb(Tdb: number, Twb: number, P: number) {
    const Wswb = this.W_from_RH(Twb, 100, P);
    if (Tdb >= 0) {
      return ((2501 - 2.381 * Twb) * Wswb - 1.006 * (Tdb - Twb))
        / (2501 + 1.805 * Tdb - 4.186 * Twb);
    } else {
      return ((2830 - 0.24 * Twb) * Wswb - 1.006 * (Tdb - Twb))
        / (2830 + 1.86 * Tdb - 2.1 * Twb);
    }
  },
  Twb(Tdb: number, W: number, P: number) {
    let twb = Tdb - 1;
    for (let i = 0; i < 200; i++) {
      const Wc   = this.W_from_Twb(Tdb, twb, P);
      const err  = Wc - W;
      const dt   = 1e-5;
      const dWdT = (this.W_from_Twb(Tdb, twb + dt, P) - Wc) / dt;
      if (Math.abs(dWdT) < 1e-15) break;
      const step = err / dWdT;
      twb -= step;
      twb  = Math.max(-60, Math.min(Tdb, twb));
      if (Math.abs(step) < 1e-9) break;
    }
    return twb;
  },
  h(Tdb: number, W: number) { return 1.006 * Tdb + W * (2501 + 1.86 * Tdb); },
  W_from_h(Tdb: number, h: number) { return (h - 1.006 * Tdb) / (2501 + 1.86 * Tdb); },
  v(Tdb: number, W: number, P: number) {
    return 0.287055 * (Tdb + 273.15) * (1 + 1.607858 * W) / (P / 1000);
  },
  Tdb_from_v_W(v: number, W: number, P: number) {
    return (v * P / 1000) / (0.287055 * (1 + 1.607858 * W)) - 273.15;
  },
  W_from_v_Tdb(v: number, Tdb: number, P: number) {
    return ((v * P / 1000) / (0.287055 * (Tdb + 273.15)) - 1) / 1.607858;
  },
};

// ============================================================
//  UNIVERSAL 2-PARAMETER SOLVER
// ============================================================
function solve(known: any, P: number) {
  const W_in = known.W != null ? known.W / 1000 : null;
  const { Tdb, Twb, Tdp, RH, h, v } = known;
  let tdb: any = null, W: any = null;
  try {
    if (Tdb != null) {
      tdb = Tdb;
      if      (RH   != null) W = PSYCHRO.W_from_RH(tdb, RH, P);
      else if (W_in != null) W = W_in;
      else if (Twb  != null) W = Math.max(0, PSYCHRO.W_from_Twb(tdb, Twb, P));
      else if (Tdp  != null) W = PSYCHRO.W_from_RH(Tdp, 100, P);
      else if (h    != null) W = Math.max(0, PSYCHRO.W_from_h(tdb, h));
      else if (v    != null) W = Math.max(0, PSYCHRO.W_from_v_Tdb(v, tdb, P));
    } else if (Twb != null) {
      if (RH != null) {
        let lo = Twb, hi = 100;
        for (let i = 0; i < 150; i++) {
          const mid = (lo + hi) / 2;
          const w1  = Math.max(0, PSYCHRO.W_from_Twb(mid, Twb, P));
          const w2  = PSYCHRO.W_from_RH(mid, RH, P);
          if (w1 > w2) hi = mid; else lo = mid;
          if (hi - lo < 1e-8) break;
        }
        tdb = (lo + hi) / 2;
        W   = Math.max(0, PSYCHRO.W_from_Twb(tdb, Twb, P));
      } else if (W_in != null) {
        W   = W_in;
        const Wswb = PSYCHRO.W_from_RH(Twb, 100, P);
        tdb = Twb >= 0
          ? Twb + ((2501 - 2.381 * Twb) * (Wswb - W) - 4.186 * Twb * (Wswb - W)) / (1.006 + 1.805 * W)
          : Twb + ((2830 - 0.24  * Twb) * (Wswb - W) - 2.1   * Twb * (Wswb - W)) / (1.006 + 1.86  * W);
      } else if (Tdp != null) {
        W   = PSYCHRO.W_from_RH(Tdp, 100, P);
        const Wswb = PSYCHRO.W_from_RH(Twb, 100, P);
        tdb = Twb >= 0
          ? Twb + ((2501 - 2.381 * Twb) * (Wswb - W) - 4.186 * Twb * (Wswb - W)) / (1.006 + 1.805 * W)
          : Twb + ((2830 - 0.24  * Twb) * (Wswb - W) - 2.1   * Twb * (Wswb - W)) / (1.006 + 1.86  * W);
      } else if (h != null) {
        let lo = Twb, hi = 150;
        for (let i = 0; i < 150; i++) {
          const mid = (lo + hi) / 2;
          const wm  = Math.max(0, PSYCHRO.W_from_Twb(mid, Twb, P));
          if (PSYCHRO.h(mid, wm) < h) lo = mid; else hi = mid;
          if (hi - lo < 1e-8) break;
        }
        tdb = (lo + hi) / 2;
        W   = Math.max(0, PSYCHRO.W_from_Twb(tdb, Twb, P));
      }
    } else if (Tdp != null) {
      W = PSYCHRO.W_from_RH(Tdp, 100, P);
      if      (RH != null) { const Psat_tdb = PSYCHRO.Pw_from_W(W, P) / (RH / 100); tdb = PSYCHRO.Tsat(Psat_tdb); }
      else if (h  != null) tdb = (h - 2501 * W) / (1.006 + 1.86 * W);
      else if (v  != null) tdb = PSYCHRO.Tdb_from_v_W(v, W, P);
      else                 tdb = Tdp;
    } else if (RH != null) {
      if (W_in != null) {
        W   = W_in;
        const Psat_tdb = PSYCHRO.Pw_from_W(W, P) / (RH / 100);
        tdb = PSYCHRO.Tsat(Psat_tdb);
      } else if (h != null) {
        let lo = -40, hi = 200;
        for (let i = 0; i < 150; i++) {
          const mid = (lo + hi) / 2;
          const wm  = PSYCHRO.W_from_RH(mid, RH, P);
          if (PSYCHRO.h(mid, wm) < h) lo = mid; else hi = mid;
          if (hi - lo < 1e-8) break;
        }
        tdb = (lo + hi) / 2;
        W   = PSYCHRO.W_from_RH(tdb, RH, P);
      } else if (v != null) {
        let lo = -40, hi = 200;
        for (let i = 0; i < 150; i++) {
          const mid = (lo + hi) / 2;
          const wm  = PSYCHRO.W_from_RH(mid, RH, P);
          if (PSYCHRO.v(mid, wm, P) < v) lo = mid; else hi = mid;
          if (hi - lo < 1e-8) break;
        }
        tdb = (lo + hi) / 2;
        W   = PSYCHRO.W_from_RH(tdb, RH, P);
      }
    } else if (W_in != null) {
      W = W_in;
      if      (h != null) tdb = (h - 2501 * W) / (1.006 + 1.86 * W);
      else if (v != null) tdb = PSYCHRO.Tdb_from_v_W(v, W, P);
    } else if (h != null && v != null) {
      let lo = -40, hi = 200;
      for (let i = 0; i < 150; i++) {
        const mid = (lo + hi) / 2;
        const wm  = Math.max(0, PSYCHRO.W_from_v_Tdb(v, mid, P));
        if (PSYCHRO.h(mid, wm) < h) lo = mid; else hi = mid;
        if (hi - lo < 1e-8) break;
      }
      tdb = (lo + hi) / 2;
      W   = Math.max(0, PSYCHRO.W_from_v_Tdb(v, tdb, P));
    }

    if (tdb == null || W == null || isNaN(tdb) || isNaN(W)) return null;
    W = Math.max(0, W);
    const Wsat = PSYCHRO.W_from_RH(tdb, 100, P);
    if (W > Wsat * 1.0005) return null;

    const rh   = PSYCHRO.RH_from_W(tdb, W, P);
    const twb  = PSYCHRO.Twb(tdb, W, P);
    const tdp  = PSYCHRO.Tdp(W, P);
    const enth = PSYCHRO.h(tdb, W);
    const vol  = PSYCHRO.v(tdb, W, P);
    const Pvap = PSYCHRO.Pw_from_W(W, P);
    const Psat = PSYCHRO.Psat(tdb);

    return {
      Tdb:      +tdb.toFixed(3),
      Twb:      +twb.toFixed(3),
      Tdp:      +tdp.toFixed(3),
      RH:       +rh.toFixed(2),
      W_gkg:    +(W * 1000).toFixed(4),
      W_raw:    W,
      h:        +enth.toFixed(3),
      v:        +vol.toFixed(5),
      rho:      +(1 / vol).toFixed(4),
      Psat:     +(Psat / 1000).toFixed(4),
      Pvap:     +(Pvap / 1000).toFixed(4),
      degSat:   +((W / Wsat) * 100).toFixed(2),
      Wsat_gkg: +(Wsat * 1000).toFixed(3),
    };
  } catch { return null; }
}

// ============================================================
//  PSYCHROMETRIC CHART
// ============================================================
function PsychroChart({ result, P = 101325, theme = "dark", tempUnit = "C" }: any) {
  const isDark = theme === "dark";
  const C = {
    bg1:       isDark ? "#0d1117" : "#F8FBFF",
    bg2:       isDark ? "#090e1a" : "#EEF4FF",
    grid:      isDark ? "#111d33" : "#DBEAFE",
    wb:        isDark ? "#1e3a5f" : "#93C5FD",
    enth:      isDark ? "#2d1f06" : "#FDE68A",
    rhLine:    isDark ? "#1d4ed8" : "#2563EB",
    rhSat:     isDark ? "#0ea5e9" : "#0284C7",
    rhLabel:   isDark ? "#3b82f6" : "#1D4ED8",
    rhSatLbl:  isDark ? "#38bdf8" : "#0369A1",
    axis:      isDark ? "#334155" : "#94A3B8",
    tick:      isDark ? "#475569" : "#64748B",
    tickTxt:   isDark ? "#64748b" : "#374151",
    axisLbl:   isDark ? "#475569" : "#374151",
    watermark: isDark ? "#334155" : "#CBD5E1",
    ptBox:     isDark ? "#0f172a" : "#FFFFFF",
    ptBoxTxt:  isDark ? "#94a3b8" : "#475569",
  };
  const SW = 700, SH = 500;
  const ML = 56, MR = 16, MT = 24, MB = 50;
  const CW = SW - ML - MR, CH = SH - MT - MB;
  const Tmin = -10, Tmax = 55;
  const Wmin = 0,   Wmax = 0.034;
  const tx = (T: number)  => ML + ((T - Tmin) / (Tmax - Tmin)) * CW;
  const ty = (Wv: number) => MT + CH - ((Wv - Wmin) / (Wmax - Wmin)) * CH;
  const tArr: number[] = [];
  for (let t = Tmin; t <= Tmax; t += 0.4) tArr.push(t);

  return (
    <svg viewBox={`0 0 ${SW} ${SH}`}
      style={{ width: "100%", height: "auto", display: "block", borderRadius: "8px" }}
      xmlns="http://www.w3.org/2000/svg" id="psychro-svg">
      <defs>
        <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C.bg1} />
          <stop offset="100%" stopColor={C.bg2} />
        </linearGradient>
        <filter id="ptglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="cc"><rect x={ML} y={MT} width={CW} height={CH} /></clipPath>
      </defs>
      <rect width={SW} height={SH} fill="url(#bg2)" rx="10" />
      {[-10,-5,0,5,10,15,20,25,30,35,40,45,50,55].map(t => (
        <line key={t} x1={tx(t)} y1={MT} x2={tx(t)} y2={MT + CH} stroke={C.grid} strokeWidth="1" />
      ))}
      {[0,4,8,12,16,20,24,28,32].map(w => (
        <line key={w} x1={ML} y1={ty(w / 1000)} x2={ML + CW} y2={ty(w / 1000)} stroke={C.grid} strokeWidth="1" />
      ))}
      <g clipPath="url(#cc)">
        {[0,5,10,15,20,25,30].map(wb => {
          const pts = tArr.map(t => {
            if (t < wb) return null;
            const w = Math.max(0, PSYCHRO.W_from_Twb(t, wb, P));
            if (w > Wmax) return null;
            return `${tx(t).toFixed(1)},${ty(w).toFixed(1)}`;
          }).filter(Boolean);
          if (pts.length < 2) return null;
          return <polyline key={`wb${wb}`} points={pts.join(" ")} fill="none" stroke={C.wb} strokeWidth="0.7" strokeDasharray="4,4" />;
        })}
        {[10,20,30,40,50,60,70,80,90,100,110,120].map(hv => {
          const pts = tArr.map(t => {
            const w = (hv - 1.006 * t) / (2501 + 1.86 * t);
            if (w < 0 || w > Wmax) return null;
            return `${tx(t).toFixed(1)},${ty(w).toFixed(1)}`;
          }).filter(Boolean);
          if (pts.length < 2) return null;
          return <polyline key={`h${hv}`} points={pts.join(" ")} fill="none" stroke={C.enth} strokeWidth="0.8" strokeDasharray="2,5" />;
        })}
        {[10,20,30,40,50,60,70,80,90,100].map(rh => {
          const pts = tArr.map(t => {
            const w = PSYCHRO.W_from_RH(t, rh, P);
            if (w < 0 || w > Wmax) return null;
            return `${tx(t).toFixed(1)},${ty(w).toFixed(1)}`;
          }).filter(Boolean);
          if (pts.length < 2) return null;
          return <polyline key={`rh${rh}`} points={pts.join(" ")} fill="none"
            stroke={rh === 100 ? C.rhSat : C.rhLine}
            strokeWidth={rh === 100 ? 1.8 : 0.9} opacity={rh === 100 ? 1 : 0.7} />;
        })}
        {[20,40,60,80,100].map(rh => {
          const lT = Tmin + (rh === 100 ? 6 : 4 + (rh / 100) * (Tmax - Tmin) * 0.5);
          const w  = PSYCHRO.W_from_RH(lT, rh, P);
          if (w < 0 || w > Wmax) return null;
          return <text key={`rl${rh}`} x={tx(lT)} y={ty(w) - 4}
            fill={rh === 100 ? C.rhSatLbl : C.rhLabel} fontSize="9" textAnchor="middle"
            fontWeight={rh === 100 ? "bold" : "normal"}>{rh}%</text>;
        })}
      </g>
      <line x1={ML} y1={MT}      x2={ML}      y2={MT + CH} stroke={C.axis} strokeWidth="1.5" />
      <line x1={ML} y1={MT + CH} x2={ML + CW} y2={MT + CH} stroke={C.axis} strokeWidth="1.5" />
      {[-10,-5,0,5,10,15,20,25,30,35,40,45,50,55].map(t => (
        <g key={t}>
          <line x1={tx(t)} y1={MT + CH} x2={tx(t)} y2={MT + CH + 5} stroke={C.tick} strokeWidth="1" />
          <text x={tx(t)} y={MT + CH + 16} fill={C.tickTxt} fontSize="9.5" textAnchor="middle">{t}</text>
        </g>
      ))}
      {[0,4,8,12,16,20,24,28,32].map(w => (
        <g key={w}>
          <line x1={ML} y1={ty(w / 1000)} x2={ML - 5} y2={ty(w / 1000)} stroke={C.tick} strokeWidth="1" />
          <text x={ML - 8} y={ty(w / 1000) + 3.5} fill={C.tickTxt} fontSize="9.5" textAnchor="end">{w}</text>
        </g>
      ))}
      <text x={ML + CW / 2} y={SH - 4} fill={C.axisLbl} fontSize="11" textAnchor="middle">Dry Bulb Temperature (°C)</text>
      <text x={14} y={MT + CH / 2} fill={C.axisLbl} fontSize="11" textAnchor="middle"
        transform={`rotate(-90,14,${MT + CH / 2})`}>Humidity Ratio (g/kg d.a.)</text>
      <text x={ML + CW - 2} y={MT + 14} fill={C.watermark} fontSize="9" textAnchor="end" fontStyle="italic">
        ASHRAE Psychrometric Chart · {(P / 1000).toFixed(2)} kPa
      </text>
      {result && (() => {
        const px = tx(result.Tdb), py = ty(result.W_raw);
        const inB = result.W_raw >= Wmin && result.W_raw <= Wmax * 1.05
          && result.Tdb >= Tmin && result.Tdb <= Tmax;
        if (!inB) return (
          <text x={ML + CW / 2} y={MT + CH / 2} fill="#f97316" fontSize="11" textAnchor="middle">
            Point outside chart range — Tdb={result.Tdb}°C W={result.W_gkg} g/kg
          </text>
        );
        const tempLabel = tempUnit === "F"
          ? `${toF(result.Tdb).toFixed(1)}°F (${result.Tdb}°C)`
          : `${result.Tdb}°C | ${result.RH}% RH`;
        return (
          <g filter="url(#ptglow)">
            <line x1={ML} y1={py} x2={px} y2={py} stroke="#f97316" strokeWidth="1" strokeDasharray="5,4" opacity="0.75" />
            <line x1={px} y1={MT + CH} x2={px} y2={py} stroke="#f97316" strokeWidth="1" strokeDasharray="5,4" opacity="0.75" />
            <circle cx={px} cy={py} r={12} fill="none" stroke="#f97316" strokeWidth="1.5" opacity="0.25" />
            <circle cx={px} cy={py} r={6}  fill="#f97316" opacity="0.92" />
            <circle cx={px} cy={py} r={2.5} fill="#fff" />
            <rect x={px + 14} y={py - 46} width={130} height={44} rx={6} fill={C.ptBox} stroke="#f97316" strokeWidth="0.9" opacity="0.97" />
            <text x={px + 79} y={py - 32} fill="#f97316" fontSize="9" textAnchor="middle" fontWeight="bold">{tempLabel}</text>
            <text x={px + 79} y={py - 20} fill={C.ptBoxTxt} fontSize="8.5" textAnchor="middle">
              {tempUnit === "F" ? `${result.RH}% RH` : ""}
            </text>
            <text x={px + 79} y={py - 8} fill={C.ptBoxTxt} fontSize="8.5" textAnchor="middle">
              W={result.W_gkg} g/kg | h={result.h} kJ/kg
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ============================================================
//  FIELD & OUTPUT DEFINITIONS
// ============================================================
const FIELDS = [
  { key: "Tdb", label: "Dry Bulb Temp",     icon: "🌡️", isTemp: true,  min_c: -20, max_c: 150, step: 0.1 },
  { key: "Twb", label: "Wet Bulb Temp",     icon: "💧", isTemp: true,  min_c: -20, max_c: 150, step: 0.1 },
  { key: "Tdp", label: "Dew Point",         icon: "❄️", isTemp: true,  min_c: -60, max_c: 100, step: 0.1 },
  { key: "RH",  label: "Relative Humidity", icon: "☁️", isTemp: false, unit: "%",     min_c: 0,   max_c: 100, step: 0.5 },
  { key: "W",   label: "Humidity Ratio",    icon: "⚖️", isTemp: false, unit: "g/kg",  min_c: 0,   max_c: 50,  step: 0.01 },
  { key: "h",   label: "Enthalpy",          icon: "🔥", isTemp: false, unit: "kJ/kg", min_c: -20, max_c: 500, step: 0.5 },
];

const OUTPUTS = [
  { key: "Tdb",      label: "Dry Bulb Temperature",  isTemp: true,  unit: "°C",         color: "#f97316" },
  { key: "Twb",      label: "Wet Bulb Temperature",  isTemp: true,  unit: "°C",         color: "#38bdf8" },
  { key: "Tdp",      label: "Dew Point Temperature", isTemp: true,  unit: "°C",         color: "#818cf8" },
  { key: "RH",       label: "Relative Humidity",     isTemp: false, unit: "%",          color: "#34d399" },
  { key: "W_gkg",    label: "Humidity Ratio",        isTemp: false, unit: "g/kg d.a.",  color: "#fbbf24" },
  { key: "h",        label: "Enthalpy",              isTemp: false, unit: "kJ/kg d.a.", color: "#f472b6" },
  { key: "v",        label: "Specific Volume",       isTemp: false, unit: "m³/kg d.a.", color: "#a78bfa" },
  { key: "rho",      label: "Air Density",           isTemp: false, unit: "kg/m³",      color: "#6ee7b7" },
  { key: "Psat",     label: "Saturation Pressure",   isTemp: false, unit: "kPa",        color: "#fb923c" },
  { key: "Pvap",     label: "Vapour Pressure",       isTemp: false, unit: "kPa",        color: "#f9a8d4" },
  { key: "degSat",   label: "Degree of Saturation",  isTemp: false, unit: "%",          color: "#7dd3fc" },
  { key: "Wsat_gkg", label: "Sat. Hum. Ratio @ Tdb", isTemp: false, unit: "g/kg",       color: "#86efac" },
];

// ============================================================
//  THEME COLORS
// ============================================================
function getT(theme: string) {
  const d = theme === "dark";
  return {
    rootBg:        d ? "linear-gradient(160deg,#080d1a,#0d1117)" : "linear-gradient(160deg,#F0F4F8,#E8EDF3)",
    hdrBg:         d ? "linear-gradient(90deg,#0c1428,#0f172a,#0c1428)" : "linear-gradient(90deg,#FFFFFF,#F8FAFC,#FFFFFF)",
    hdrBdr:        d ? "#1e293b" : "#E2E8F0",
    tabsBdr:       d ? "#1e293b" : "#E2E8F0",
    cardBg:        d ? "rgba(15,23,42,0.85)"  : "rgba(255,255,255,0.95)",
    cardBdr:       d ? "#1e293b"              : "#E2E8F0",
    text:          d ? "#e2e8f0"  : "#1E293B",
    textMuted:     d ? "#64748b"  : "#64748B",
    textDim:       d ? "#475569"  : "#94A3B8",
    inputBg:       d ? "rgba(15,23,42,0.8)"           : "#F8FAFC",
    inputBdr:      d ? "#334155"                       : "#CBD5E1",
    inputBgA:      d ? "rgba(56,189,248,0.08)"         : "rgba(56,189,248,0.06)",
    inputBdrA:     "#38bdf8",
    inputColor:    d ? "#e2e8f0"  : "#1E293B",
    inputColorI:   d ? "#4b5563"  : "#94A3B8",
    fbBgA:         d ? "rgba(56,189,248,0.05)"   : "rgba(56,189,248,0.06)",
    fbBgI:         d ? "rgba(30,41,59,0.4)"       : "rgba(241,245,249,0.8)",
    fbBdrA:        "#38bdf8",
    fbBdrI:        d ? "#1e293b" : "#E2E8F0",
    tabColorI:     d ? "#475569" : "#94A3B8",
    slColor:       d ? "#475569" : "#94A3B8",
    altInputBg:    d ? "rgba(15,23,42,0.8)" : "#F8FAFC",
    altInputBdr:   d ? "#334155" : "#CBD5E1",
    heatBg:        d ? "rgba(249,115,22,0.06)" : "rgba(249,115,22,0.05)",
    heatBdr:       "#f9731633",
    guideBg:       d ? "rgba(30,41,59,0.5)"   : "#F1F5F9",
    guideInnerBg:  d ? "rgba(56,189,248,0.05)": "rgba(56,189,248,0.05)",
    guideInnerBdr: d ? "#38bdf822"            : "#BAE6FD",
    errBg:         d ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)",
    errBdr:        "#ef4444",
    errColor:      d ? "#fca5a5" : "#DC2626",
    btnSecBg:      d ? "rgba(30,41,59,0.9)" : "#F1F5F9",
    btnSecColor:   d ? "#fff" : "#1E293B",
    shadow:        d ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
    unitToggleBg:     d ? "rgba(15,23,42,0.8)"  : "#F1F5F9",
    unitToggleBdr:    d ? "#334155"             : "#CBD5E1",
    unitToggleSelBg:  "linear-gradient(135deg,#0ea5e9,#6366f1)",
    unitToggleSelC:   "#fff",
    unitToggleInC:    d ? "#475569" : "#94A3B8",
    unitBannerBg:     d ? "rgba(56,189,248,0.05)" : "rgba(56,189,248,0.04)",
    unitBannerBdr:    d ? "#1e293b" : "#E2E8F0",
    modalBg:          d ? "#0f172a" : "#FFFFFF",
    modalOverlay:     "rgba(0,0,0,0.75)",
    modalBdr:         d ? "#1e293b" : "#E2E8F0",
  };
}

// ============================================================
//  CANVAS HELPER
// ============================================================
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ============================================================
//  CANVAS CHART DRAW
// ============================================================
function drawChartOnCanvas(
  ctx: CanvasRenderingContext2D,
  result: any,
  P: number,
  tempUnit: "C" | "F",
  theme: string,
  ox: number, oy: number, CW: number, CH: number
) {
  const d    = theme === "dark";
  const Tmin = -10, Tmax = 55, Wmin = 0, Wmax = 0.034;
  const tx   = (T: number)  => ox + ((T - Tmin) / (Tmax - Tmin)) * CW;
  const ty   = (Wv: number) => oy + CH - ((Wv - Wmin) / (Wmax - Wmin)) * CH;
  const tArr: number[] = [];
  for (let t = Tmin; t <= Tmax; t += 0.5) tArr.push(t);

  // BG
  const bg = ctx.createLinearGradient(ox, oy, ox, oy + CH);
  bg.addColorStop(0, d ? "#0d1117" : "#F8FBFF");
  bg.addColorStop(1, d ? "#090e1a" : "#EEF4FF");
  ctx.fillStyle = bg;
  ctx.fillRect(ox - 56, oy, CW + 56 + 16, CH + 50);

  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, CW, CH);
  ctx.clip();

  // Vertical grid
  [-10,-5,0,5,10,15,20,25,30,35,40,45,50,55].forEach(t => {
    ctx.beginPath();
    ctx.strokeStyle = d ? "#111d33" : "#DBEAFE";
    ctx.lineWidth = 1;
    ctx.moveTo(tx(t), oy); ctx.lineTo(tx(t), oy + CH); ctx.stroke();
  });
  // Horizontal grid
  [0,4,8,12,16,20,24,28,32].forEach(w => {
    ctx.beginPath();
    ctx.strokeStyle = d ? "#111d33" : "#DBEAFE";
    ctx.lineWidth = 1;
    ctx.moveTo(ox, ty(w/1000)); ctx.lineTo(ox + CW, ty(w/1000)); ctx.stroke();
  });

  // RH curves
  [10,20,30,40,50,60,70,80,90,100].forEach(rh => {
    ctx.beginPath();
    ctx.strokeStyle = rh === 100 ? (d ? "#0ea5e9" : "#0284C7") : (d ? "#1d4ed8" : "#2563EB");
    ctx.lineWidth   = rh === 100 ? 2 : 1;
    ctx.globalAlpha = rh === 100 ? 1 : 0.6;
    let first = true;
    tArr.forEach(t => {
      const w = PSYCHRO.W_from_RH(t, rh, P);
      if (w < 0 || w > Wmax) return;
      first ? ctx.moveTo(tx(t), ty(w)) : ctx.lineTo(tx(t), ty(w));
      first = false;
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // RH labels
  [20,40,60,80,100].forEach(rh => {
    const lT = -5 + (rh / 100) * 30;
    const w  = PSYCHRO.W_from_RH(lT, rh, P);
    if (w < 0 || w > Wmax) return;
    ctx.fillStyle  = rh === 100 ? (d ? "#38bdf8" : "#0369A1") : (d ? "#3b82f6" : "#1D4ED8");
    ctx.font       = "bold 10px sans-serif";
    ctx.fillText(`${rh}%`, tx(lT) - 10, ty(w) - 4);
  });

  // Wet bulb lines
  [0,5,10,15,20,25,30].forEach(wb => {
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = d ? "#1e3a5f" : "#93C5FD";
    ctx.lineWidth   = 0.8;
    let first = true;
    tArr.forEach(t => {
      if (t < wb) return;
      const w = Math.max(0, PSYCHRO.W_from_Twb(t, wb, P));
      if (w > Wmax) return;
      first ? ctx.moveTo(tx(t), ty(w)) : ctx.lineTo(tx(t), ty(w));
      first = false;
    });
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // State point
  if (result) {
    const px = tx(result.Tdb);
    const py = ty(result.W_raw);
    const inB = result.W_raw >= Wmin && result.W_raw <= Wmax * 1.05
             && result.Tdb  >= Tmin  && result.Tdb  <= Tmax;
    if (inB) {
      ctx.beginPath();
      ctx.strokeStyle = "#f97316"; ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]); ctx.globalAlpha = 0.75;
      ctx.moveTo(ox, py); ctx.lineTo(px, py);
      ctx.moveTo(px, oy + CH); ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#f97316"; ctx.fill();
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
      const lx = px + 12, ly = py - 50;
      ctx.fillStyle = d ? "#0f172a" : "#fff";
      ctx.strokeStyle = "#f97316"; ctx.lineWidth = 1;
      roundRect(ctx, lx, ly, 145, 46, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#f97316"; ctx.font = "bold 10px sans-serif";
      const lbl = tempUnit === "F"
        ? `${toF(result.Tdb).toFixed(1)}F  ${result.RH}% RH`
        : `${result.Tdb}C  ${result.RH}% RH`;
      ctx.fillText(lbl, lx + 6, ly + 14);
      ctx.fillStyle = d ? "#94a3b8" : "#475569"; ctx.font = "9px sans-serif";
      ctx.fillText(`W=${result.W_gkg} g/kg`, lx + 6, ly + 28);
      ctx.fillText(`h=${result.h} kJ/kg`,    lx + 6, ly + 40);
    }
  }
  ctx.restore();

  // Axes
  ctx.strokeStyle = d ? "#334155" : "#94A3B8"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ox, oy); ctx.lineTo(ox, oy + CH);
  ctx.moveTo(ox, oy + CH); ctx.lineTo(ox + CW, oy + CH);
  ctx.stroke();

  // X ticks
  [-10,-5,0,5,10,15,20,25,30,35,40,45,50,55].forEach(t => {
    ctx.strokeStyle = d ? "#475569" : "#64748B"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx(t), oy + CH); ctx.lineTo(tx(t), oy + CH + 5); ctx.stroke();
    ctx.fillStyle = d ? "#64748b" : "#374151"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(String(t), tx(t), oy + CH + 16);
  });

  // Y ticks
  [0,4,8,12,16,20,24,28,32].forEach(w => {
    ctx.strokeStyle = d ? "#475569" : "#64748B"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox, ty(w/1000)); ctx.lineTo(ox - 5, ty(w/1000)); ctx.stroke();
    ctx.fillStyle = d ? "#64748b" : "#374151"; ctx.font = "10px sans-serif"; ctx.textAlign = "right";
    ctx.fillText(String(w), ox - 8, ty(w/1000) + 4);
  });

  ctx.fillStyle = d ? "#475569" : "#374151"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
  ctx.fillText("Dry Bulb Temperature (°C)", ox + CW / 2, oy + CH + 34);
  ctx.save();
  ctx.translate(ox - 46, oy + CH / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillText("Humidity Ratio (g/kg d.a.)", 0, 0); ctx.restore();

  ctx.fillStyle = d ? "#334155" : "#CBD5E1"; ctx.font = "9px sans-serif"; ctx.textAlign = "right";
  ctx.fillText(`ASHRAE Psychrometric Chart · ${(P/1000).toFixed(2)} kPa`, ox + CW - 4, oy + 14);
  ctx.textAlign = "left";
}

// ============================================================
//  PNG GENERATOR
// ============================================================
function generatePNG(
  result: any, P: number, tempUnit: "C"|"F", theme: string,
  mode: "chart"|"values"|"both"
): string {
  const d        = theme === "dark";
  const PAD      = 20;
  const CW_INNER = 680, CH_INNER = 420;
  const CHART_FULL_W = CW_INNER + 56 + 16;
  const CHART_FULL_H = CH_INNER + 50 + 30;
  const ROW_H    = 40;
  const COLS     = 2;
  const ROWS     = 6;
  const HEAT_H   = 100;
  const VAL_H    = result ? (PAD + 26 + ROWS * ROW_H + PAD + HEAT_H + PAD + 20) : 0;
  const imgW     = 800;
  let   imgH     = 0;
  if (mode === "chart")  imgH = CHART_FULL_H;
  if (mode === "values") imgH = VAL_H + PAD;
  if (mode === "both")   imgH = CHART_FULL_H + VAL_H;

  const canvas      = document.createElement("canvas");
  canvas.width      = imgW;
  canvas.height     = imgH;
  const ctx         = canvas.getContext("2d")!;

  const bg = ctx.createLinearGradient(0, 0, 0, imgH);
  bg.addColorStop(0, d ? "#0d1117" : "#F8FBFF");
  bg.addColorStop(1, d ? "#090e1a" : "#EEF4FF");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, imgW, imgH);

  if (mode === "chart" || mode === "both") {
    drawChartOnCanvas(ctx, result, P, tempUnit, theme, 56, 20, CW_INNER, CH_INNER);
  }

  if (result && (mode === "values" || mode === "both")) {
    let y = mode === "both" ? CHART_FULL_H + PAD : PAD;
    ctx.fillStyle = "#38bdf8"; ctx.font = "bold 13px monospace"; ctx.textAlign = "left";
    ctx.fillText("PSYCHROMETRIC PROPERTIES  —  ASHRAE 2017", PAD, y + 16); y += 30;

    const outputs = [
      { label: "Dry Bulb Temp",     val: tempUnit==="F" ? `${result.Tdb}C / ${toF(result.Tdb).toFixed(1)}F` : `${result.Tdb} °C`,  color: "#f97316" },
      { label: "Wet Bulb Temp",     val: tempUnit==="F" ? `${result.Twb}C / ${toF(result.Twb).toFixed(1)}F` : `${result.Twb} °C`,  color: "#38bdf8" },
      { label: "Dew Point",         val: tempUnit==="F" ? `${result.Tdp}C / ${toF(result.Tdp).toFixed(1)}F` : `${result.Tdp} °C`,  color: "#818cf8" },
      { label: "Relative Humidity", val: `${result.RH} %`,            color: "#34d399" },
      { label: "Humidity Ratio",    val: `${result.W_gkg} g/kg`,      color: "#fbbf24" },
      { label: "Enthalpy",          val: `${result.h} kJ/kg`,         color: "#f472b6" },
      { label: "Specific Volume",   val: `${result.v} m3/kg`,         color: "#a78bfa" },
      { label: "Air Density",       val: `${result.rho} kg/m3`,       color: "#6ee7b7" },
      { label: "Sat. Pressure",     val: `${result.Psat} kPa`,        color: "#fb923c" },
      { label: "Vapour Pressure",   val: `${result.Pvap} kPa`,        color: "#f9a8d4" },
      { label: "Degree of Sat.",    val: `${result.degSat} %`,        color: "#7dd3fc" },
      { label: "Sat. Hum. Ratio",   val: `${result.Wsat_gkg} g/kg`,   color: "#86efac" },
    ];

    const colW = (imgW - PAD * 2) / COLS;
    outputs.forEach((o, i) => {
      const col = i % COLS, row = Math.floor(i / COLS);
      const x = PAD + col * colW, cy = y + row * ROW_H;
      ctx.fillStyle = d ? "#0f172a" : "#FFFFFF";
      roundRect(ctx, x + 2, cy, colW - 8, ROW_H - 5, 7); ctx.fill();
      ctx.fillStyle = o.color;
      roundRect(ctx, x + 2, cy, 4, ROW_H - 5, 3); ctx.fill();
      ctx.fillStyle = d ? "#64748b" : "#94A3B8"; ctx.font = "9px monospace"; ctx.textAlign = "left";
      ctx.fillText(o.label.toUpperCase(), x + 12, cy + 13);
      ctx.fillStyle = o.color; ctx.font = "bold 14px monospace";
      ctx.fillText(o.val, x + 12, cy + 30);
    });

    y += ROWS * ROW_H + PAD;
    ctx.fillStyle = d ? "#1a0a00" : "#fff7ed";
    ctx.strokeStyle = "#f97316"; ctx.lineWidth = 1;
    roundRect(ctx, PAD, y, imgW - PAD * 2, HEAT_H, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f97316"; roundRect(ctx, PAD, y, 4, HEAT_H, 4); ctx.fill();
    ctx.fillStyle = "#f97316"; ctx.font = "bold 11px monospace"; ctx.textAlign = "left";
    ctx.fillText("HEAT LOAD MULTIPLIERS", PAD + 14, y + 20);
    [
      [`Sensible  (dT=1C / 1 m3/s):`,   `${(1.006 * result.rho * 1000).toFixed(0)} W/(m3/s.C)`],
      [`Latent    (dW=1g/kg / 1 m3/s):`, `${(2501 * result.rho).toFixed(0)} W/(m3/s.g/kg)`],
      [`Total     (dh=1kJ/kg / 1 m3/s):`,`${(result.rho * 1000).toFixed(0)} W/(m3/s.kJ/kg)`],
    ].forEach(([lbl, val], i) => {
      const hy = y + 38 + i * 22;
      ctx.fillStyle = d ? "#94a3b8" : "#64748B"; ctx.font = "10px monospace";
      ctx.fillText(lbl, PAD + 14, hy);
      ctx.fillStyle = "#fb923c"; ctx.font = "bold 10px monospace";
      ctx.fillText(val, PAD + 310, hy);
    });

    y += HEAT_H + 10;
    ctx.fillStyle = d ? "#334155" : "#CBD5E1"; ctx.font = "9px monospace"; ctx.textAlign = "left";
    ctx.fillText(
      `PsychroPro · ASHRAE 2017 · ${(P/1000).toFixed(2)} kPa · ${new Date().toLocaleString()}`,
      PAD, y + 14
    );
  } else {
    ctx.fillStyle = d ? "#334155" : "#CBD5E1"; ctx.font = "9px monospace"; ctx.textAlign = "left";
    ctx.fillText(`PsychroPro · ASHRAE 2017 · ${(P/1000).toFixed(2)} kPa`, PAD, imgH - 6);
  }

  return canvas.toDataURL("image/png");
}

// ============================================================
//  EXPORT MODAL
// ============================================================
function ExportModal({ isOpen, onClose, result, P, tempUnit, theme, initialMode = "both" }: {
  isOpen: boolean; onClose: () => void; result: any;
  P: number; tempUnit: "C"|"F"; theme: string;
  initialMode?: "chart"|"values"|"both";
}) {
  const T = getT(theme);
  const d = theme === "dark";
  const [loading,    setLoading]    = useState(false);
  const [statusMsg,  setStatusMsg]  = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode,       setMode]       = useState<"chart"|"values"|"both">(initialMode);

  const doGenerate = (m: "chart"|"values"|"both") => {
    try { return generatePNG(result, P, tempUnit, theme, m); } catch { return null; }
  };

  const handlePreview = () => {
    setLoading(true); setStatusMsg("Generating preview...");
    setTimeout(() => {
      const url = doGenerate(mode);
      if (url) { setPreviewUrl(url); setStatusMsg(""); }
      else      { setStatusMsg("❌ Preview failed — try again"); }
      setLoading(false);
    }, 50);
  };

  // ── MAIN DOWNLOAD HANDLER — Android + Browser dono ──────
  const handleDownload = () => {
    setLoading(true);
    setStatusMsg("Preparing PNG...");

    setTimeout(async () => {
      const url      = previewUrl || doGenerate(mode);
      const fileName = `PsychroPro_${mode}_${Date.now()}.png`;

      if (!url) {
        setStatusMsg("❌ Failed to generate image");
        setLoading(false);
        return;
      }

      if (isCapacitorAndroid()) {
        // ── Android native path ──────────────────────────
        const ok = await saveImageAndroid(url, fileName, setStatusMsg);
        if (ok) {
          setTimeout(() => { setStatusMsg(""); setPreviewUrl(null); onClose(); }, 3000);
        }
      } else {
        // ── Browser / PC path ────────────────────────────
        saveImageBrowser(url, fileName);
        setStatusMsg("✅ Download started! Check Downloads folder.");
        setTimeout(() => { setStatusMsg(""); setPreviewUrl(null); onClose(); }, 3000);
      }

      setLoading(false);
    }, 50);
  };

  const handleClose = () => { setPreviewUrl(null); setStatusMsg(""); onClose(); };

  if (!isOpen) return null;

  const modeBtn = (m: "chart"|"values"|"both", label: string) => (
    <button key={m}
      onClick={() => { setMode(m); setPreviewUrl(null); setStatusMsg(""); }}
      style={{
        flex: 1, padding: "9px 4px",
        background: mode === m ? "linear-gradient(135deg,#0ea5e9,#6366f1)" : (d ? "#1e293b" : "#F1F5F9"),
        border: mode === m ? "none" : `1px solid ${T.modalBdr}`,
        borderRadius: "8px", cursor: "pointer",
        color: mode === m ? "#fff" : (d ? "#94a3b8" : "#64748B"),
        fontSize: "11px", fontWeight: "700", fontFamily: "inherit", transition: "all 0.2s",
      }}
    >{label}</button>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: T.modalOverlay,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={handleClose}>
      <div style={{
        width: "100%", maxWidth: "600px",
        background: T.modalBg,
        border: `1px solid ${T.modalBdr}`,
        borderTopLeftRadius: "20px", borderTopRightRadius: "20px",
        padding: "20px 18px 32px",
        maxHeight: "92vh", overflowY: "auto",
      }} onClick={(e) => e.stopPropagation()}>

        {/* Handle bar */}
        <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: d ? "#334155" : "#CBD5E1", margin: "0 auto 16px" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#38bdf8" }}>🖼️ Download as PNG</div>
          <button onClick={handleClose} style={{
            background: d ? "#1e293b" : "#F1F5F9", border: "none", borderRadius: "8px",
            color: d ? "#94a3b8" : "#64748B", fontSize: "18px", width: "34px", height: "34px", cursor: "pointer",
          }}>✕</button>
        </div>

        {/* Android info banner */}
        {isCapacitorAndroid() && (
          <div style={{
            padding: "8px 12px", borderRadius: "8px", marginBottom: "12px",
            background: "rgba(52,211,153,0.08)", border: "1px solid #34d39933",
            color: "#34d399", fontSize: "10.5px",
          }}>
            📱 Android detected — file will save to <strong>Downloads</strong> folder automatically.
          </div>
        )}

        {/* Mode selector */}
        <div style={{ marginBottom: "14px" }}>
          <div style={{ fontSize: "9px", color: d ? "#475569" : "#94A3B8", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
            What to download?
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {modeBtn("chart",  "📊 Chart Only")}
            {modeBtn("values", "📋 Values Only")}
            {modeBtn("both",   "📁 Chart + Values")}
          </div>
        </div>

        {/* Values warning */}
        {mode !== "chart" && !result && (
          <div style={{ padding: "8px 12px", borderRadius: "8px", marginBottom: "12px", background: "rgba(249,115,22,0.08)", border: "1px solid #f9731633", color: "#fb923c", fontSize: "11px" }}>
            ⚠️ Calculate first to include values in the image.
          </div>
        )}

        {/* Preview area */}
        {!previewUrl ? (
          <div style={{
            background: d ? "#080d1a" : "#F8FAFC", border: `1px solid ${T.modalBdr}`,
            borderRadius: "10px", padding: "24px", marginBottom: "14px",
            textAlign: "center", color: d ? "#475569" : "#94A3B8", fontSize: "12px",
          }}>
            {loading ? "⏳ Generating..." : "Tap Preview to see the image first"}
          </div>
        ) : (
          <div style={{ marginBottom: "14px", borderRadius: "10px", overflow: "hidden", border: `1px solid ${T.modalBdr}` }}>
            <img src={previewUrl} alt="Preview" style={{ width: "100%", display: "block" }} />
          </div>
        )}

        {/* Status */}
        {statusMsg && (
          <div style={{
            padding: "8px 12px", borderRadius: "8px", marginBottom: "12px",
            background: statusMsg.startsWith("✅") ? "rgba(52,211,153,0.1)" : statusMsg.startsWith("❌") ? "rgba(239,68,68,0.08)" : "rgba(56,189,248,0.1)",
            border: `1px solid ${statusMsg.startsWith("✅") ? "#34d39933" : statusMsg.startsWith("❌") ? "#ef444433" : "#38bdf822"}`,
            color: statusMsg.startsWith("✅") ? "#34d399" : statusMsg.startsWith("❌") ? "#fca5a5" : "#38bdf8",
            fontSize: "11px", textAlign: "center",
          }}>{statusMsg}</div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {!previewUrl && (
            <button onClick={handlePreview} disabled={loading} style={{
              width: "100%", padding: "13px",
              background: d ? "#1e293b" : "#F1F5F9",
              border: `1px solid #38bdf8`, borderRadius: "12px",
              cursor: "pointer", color: "#38bdf8",
              fontSize: "13px", fontWeight: "700", fontFamily: "inherit",
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? "⏳ Generating..." : "👁️ Preview Image"}
            </button>
          )}
          <button onClick={handleDownload} disabled={loading} style={{
            width: "100%", padding: "13px",
            background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
            border: "none", borderRadius: "12px",
            cursor: "pointer", color: "#fff",
            fontSize: "13px", fontWeight: "700", fontFamily: "inherit",
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "⏳ Saving..." : isCapacitorAndroid() ? "💾 Save to Downloads" : "⬇️ Download PNG"}
          </button>
          <button onClick={handleClose} style={{
            width: "100%", padding: "13px",
            background: d ? "#1e293b" : "#F1F5F9",
            border: `1px solid ${T.modalBdr}`, borderRadius: "12px",
            cursor: "pointer", color: d ? "#e2e8f0" : "#1E293B",
            fontSize: "13px", fontWeight: "600", fontFamily: "inherit",
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function PsychrometricTool({ theme = "dark" }: { theme?: string }) {
  const T = getT(theme);
  const d = theme === "dark";

  const [vals,     setVals]     = useState<any>({ Tdb: "", Twb: "", Tdp: "", RH: "", W: "", h: "" });
  const [active,   setActive]   = useState<any>({ Tdb: false, Twb: false, Tdp: false, RH: false, W: false, h: false });
  const [result,   setResult]   = useState<any>(null);
  const [error,    setError]    = useState("");
  const [altitude, setAlt]      = useState(0);
  const [P,        setP]        = useState(101325);
  const [tab,      setTab]      = useState("calc");
  const [tempUnit, setTempUnit] = useState<"C"|"F">("C");

  const [exportOpen,     setExportOpen]     = useState(false);
  const [exportInitMode, setExportInitMode] = useState<"chart"|"values"|"both">("both");

  const openExport = (m: "chart"|"values"|"both" = "both") => {
    setExportInitMode(m); setExportOpen(true);
  };

  const fieldUnit = (f: any) => f.isTemp ? (tempUnit === "F" ? "°F" : "°C") : (f.unit ?? "");

  const inputToC = (key: string, rawVal: string) => {
    const n = parseFloat(rawVal);
    if (isNaN(n)) return NaN;
    const f = FIELDS.find(ff => ff.key === key);
    return (f?.isTemp && tempUnit === "F") ? toC(n) : n;
  };

  const handleUnitSwitch = (newUnit: "C"|"F") => {
    if (newUnit === tempUnit) return;
    setVals((prev: any) => {
      const next = { ...prev };
      FIELDS.forEach(f => {
        if (f.isTemp && prev[f.key] !== "") {
          const n = parseFloat(prev[f.key]);
          if (!isNaN(n)) next[f.key] = newUnit === "F" ? toF(n).toFixed(1) : toC(n).toFixed(1);
        }
      });
      return next;
    });
    setTempUnit(newUnit);
    setResult(null);
    setError("");
  };

  const handleAlt = (v: any) => {
    const a = parseFloat(v) || 0;
    setAlt(a);
    setP(Math.round(101325 * Math.pow(1 - 2.2577e-5 * a, 5.2559)));
  };

  const toggleField = (key: string) => {
    const cnt = Object.values(active).filter(Boolean).length;
    if (!active[key] && cnt >= 2) return;
    setActive((p: any) => ({ ...p, [key]: !p[key] }));
    if (active[key]) setVals((p: any) => ({ ...p, [key]: "" }));
    setResult(null); setError("");
  };

  const calculate = useCallback(() => {
    const aKeys = Object.entries(active).filter(([, v]) => v).map(([k]) => k);
    if (aKeys.length < 2) { setError("Select exactly 2 parameters."); return; }
    const known: any = {};
    for (const k of aKeys) {
      const cVal = inputToC(k, vals[k]);
      if (isNaN(cVal)) { setError(`Enter a value for "${FIELDS.find(f => f.key === k)?.label}".`); return; }
      known[k] = cVal;
    }
    if (known.RH  != null && (known.RH < 0 || known.RH > 100)) { setError("RH must be 0–100%."); return; }
    if (known.Twb != null && known.Tdb != null && known.Twb > known.Tdb + 0.01) { setError("Wet Bulb ≤ Dry Bulb always."); return; }
    if (known.Tdp != null && known.Tdb != null && known.Tdp > known.Tdb + 0.01) { setError("Dew Point ≤ Dry Bulb always."); return; }
    if (known.Twb != null && known.Tdp != null && known.Tdp > known.Twb + 0.01) { setError("Dew Point ≤ Wet Bulb always."); return; }
    const res = solve(known, P);
    if (!res) { setError("Cannot solve — inputs are physically inconsistent or outside valid range."); setResult(null); }
    else       { setError(""); setResult(res); }
  }, [vals, active, P, tempUnit]);

  const reset = () => {
    setVals({ Tdb: "", Twb: "", Tdp: "", RH: "", W: "", h: "" });
    setActive({ Tdb: false, Twb: false, Tdp: false, RH: false, W: false, h: false });
    setResult(null); setError("");
  };

  const btnPrimary: any = {
    padding: "11px 22px", borderRadius: "8px", border: "none", cursor: "pointer",
    fontSize: "11px", fontFamily: "inherit", fontWeight: "700",
    letterSpacing: "1.5px", textTransform: "uppercase",
    background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "#fff",
  };
  const btnSec: any = {
    padding: "11px 22px", borderRadius: "8px", border: `1px solid ${T.cardBdr}`, cursor: "pointer",
    fontSize: "11px", fontFamily: "inherit", fontWeight: "700",
    letterSpacing: "1.5px", textTransform: "uppercase",
    background: T.btnSecBg, color: T.btnSecColor,
  };
  const exportBtn: any = {
    padding: "9px 13px", borderRadius: "8px", border: `1px solid ${T.cardBdr}`, cursor: "pointer",
    fontSize: "10px", fontFamily: "inherit", fontWeight: "700",
    background: T.btnSecBg, color: T.btnSecColor,
    whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "5px",
  };

  return (
    <div style={{ minHeight: "100vh", background: T.rootBg, color: T.text, fontFamily: "'JetBrains Mono','Fira Code',monospace", transition: "background 0.3s, color 0.3s" }}>

      <ExportModal
        isOpen={exportOpen} onClose={() => setExportOpen(false)}
        result={result} P={P} tempUnit={tempUnit} theme={theme}
        initialMode={exportInitMode}
      />

      {/* HEADER */}
      <div style={{ background: T.hdrBg, borderBottom: `1px solid ${T.hdrBdr}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", boxShadow: T.shadow }}>
        <div style={{ fontSize: "26px" }}>🌬️</div>
        <div>
          <div style={{ fontSize: "17px", fontWeight: "700", background: "linear-gradient(90deg,#38bdf8,#818cf8,#f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PsychroPro Calculator
          </div>
          <div style={{ fontSize: "9px", color: T.textDim, letterSpacing: "2px", textTransform: "uppercase" }}>
            ASHRAE 2017 Fundamentals · °C / °F Input Support
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", padding: "10px 18px 0", borderBottom: `1px solid ${T.tabsBdr}`, background: T.cardBg }}>
        {[["calc","Calculator"],["chart","Chart"],["guide","Guide"]].map(([id,l]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "8px 18px", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase",
            fontWeight: tab === id ? "700" : "400",
            color: tab === id ? "#38bdf8" : T.tabColorI,
            background: "none", border: "none",
            borderBottom: tab === id ? "2px solid #38bdf8" : "2px solid transparent",
            cursor: "pointer", transition: "all 0.2s",
          }}>{l}</button>
        ))}
      </div>

      {/* BODY */}
      <div style={{ padding: "14px", maxWidth: "740px", margin: "0 auto" }}>

        {/* ── CALCULATOR TAB ── */}
        {tab === "calc" && <>

          {/* Temp unit toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", marginBottom: "14px", background: T.unitBannerBg, border: `1px solid ${T.unitBannerBdr}`, borderRadius: "10px", boxShadow: T.shadow }}>
            <span style={{ fontSize: "18px" }}>🌡️</span>
            <span style={{ fontSize: "9.5px", color: T.textMuted, letterSpacing: "1.5px", textTransform: "uppercase", flex: 1 }}>Temperature Input Unit</span>
            <div style={{ display: "flex", borderRadius: "8px", overflow: "hidden", border: `1px solid ${T.unitToggleBdr}` }}>
              {(["C","F"] as const).map(u => (
                <button key={u} onClick={() => handleUnitSwitch(u)} style={{
                  padding: "8px 16px", fontSize: "12px", fontFamily: "inherit", fontWeight: "700",
                  cursor: "pointer", border: "none", transition: "all 0.2s",
                  background: tempUnit === u ? T.unitToggleSelBg : T.unitToggleBg,
                  color:      tempUnit === u ? T.unitToggleSelC  : T.unitToggleInC,
                }}>°{u} {u === "C" ? "Celsius" : "Fahrenheit"}</button>
              ))}
            </div>
          </div>

          {/* Location / Pressure */}
          <div style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: "12px", padding: "14px", marginBottom: "14px", boxShadow: T.shadow }}>
            <div style={{ fontSize: "9.5px", color: T.slColor, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>📍 Location / Atmospheric Pressure</div>
            <div style={{ display: "flex", gap: "12px" }}>
              {([["Altitude (m)", altitude, handleAlt], ["Pressure (Pa)", P, (v: any) => setP(parseFloat(v) || 101325)]] as any[]).map(([l,v,fn]) => (
                <div key={l} style={{ flex: 1 }}>
                  <div style={{ fontSize: "8.5px", color: T.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>{l}</div>
                  <input style={{ flex: 1, background: T.altInputBg, border: `1px solid ${T.altInputBdr}`, borderRadius: "6px", color: T.text, fontSize: "13px", fontFamily: "inherit", padding: "7px 9px", outline: "none", width: "100%", boxSizing: "border-box" as any }}
                    type="number" value={v} onChange={(e: any) => fn(e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Input Parameters */}
          <div style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: "12px", padding: "14px", marginBottom: "14px", boxShadow: T.shadow }}>
            <div style={{ fontSize: "9.5px", color: T.slColor, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>📥 Input Parameters</div>
            <div style={{ fontSize: "10px", color: "#f97316", marginBottom: "10px", padding: "6px 10px", background: "rgba(249,115,22,0.06)", borderRadius: "6px", border: "1px solid #f9731622" }}>
              ✅ Tick any <strong>2</strong> checkboxes → enter values → Calculate
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px" }}>
              {FIELDS.map(f => {
                const a      = active[f.key];
                const minVal = f.isTemp && tempUnit === "F" ? toF(f.min_c).toFixed(0) : f.min_c;
                const maxVal = f.isTemp && tempUnit === "F" ? toF(f.max_c).toFixed(0) : f.max_c;
                return (
                  <div key={f.key} onClick={() => toggleField(f.key)} style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "9px 10px",
                    borderRadius: "8px",
                    border: `1px solid ${a ? T.fbBdrA : T.fbBdrI}`,
                    background: a ? T.fbBgA : T.fbBgI,
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <input type="checkbox" style={{ width: "15px", height: "15px", accentColor: "#38bdf8", cursor: "pointer", flexShrink: 0, pointerEvents: "none" }} readOnly checked={a} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "8.5px", color: T.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>
                        {f.icon} {f.label}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <input
                          style={{ width: "100%", background: a ? T.inputBgA : T.inputBg, border: `1px solid ${a ? T.inputBdrA : T.inputBdr}`, borderRadius: "5px", color: a ? T.text : T.inputColorI, fontSize: "14px", fontFamily: "inherit", padding: "4px 6px", outline: "none", transition: "all 0.2s" }}
                          type="number" min={minVal} max={maxVal} step={f.step}
                          value={vals[f.key]} placeholder={a ? "Enter value" : "—"}
                          disabled={!a}
                          onClick={(e: any) => e.stopPropagation()}
                          onChange={(e: any) => setVals((p: any) => ({ ...p, [f.key]: e.target.value }))}
                        />
                        <span style={{ fontSize: "9px", color: T.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>{fieldUnit(f)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "8px", background: T.errBg, border: `1px solid ${T.errBdr}`, color: T.errColor, fontSize: "11px" }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
              <button onClick={calculate} style={btnPrimary}>⚡ Calculate</button>
              <button onClick={reset}     style={btnSec}>↺ Reset</button>
              {result && <button onClick={() => setTab("chart")} style={btnSec}>📊 View Chart</button>}
            </div>
          </div>

          {/* Results */}
          {result && (
            <div style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: "12px", padding: "14px", marginBottom: "14px", boxShadow: T.shadow }}>
              <div style={{ fontSize: "9.5px", color: T.slColor, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>📤 All Psychrometric Properties</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px" }}>
                {OUTPUTS.map(o => (
                  <div key={o.key} style={{ background: d ? "rgba(15,23,42,0.85)" : "#FFFFFF", borderLeft: `3px solid ${o.color}`, border: `1px solid ${o.color}22`, borderRadius: "8px", padding: "9px 11px", boxShadow: T.shadow }}>
                    <div style={{ fontSize: "8.5px", color: T.textMuted, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "3px" }}>{o.label}</div>
                    {o.isTemp && tempUnit === "F" ? (
                      <div>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: o.color }}>{(result as any)[o.key]}°C</span>
                        <span style={{ fontSize: "11px", color: T.textMuted, margin: "0 4px" }}>/</span>
                        <span style={{ fontSize: "14px", fontWeight: "700", color: o.color }}>{toF((result as any)[o.key]).toFixed(1)}°F</span>
                      </div>
                    ) : (
                      <div>
                        <span style={{ fontSize: "17px", fontWeight: "700", color: o.color }}>{(result as any)[o.key]}</span>
                        <span style={{ fontSize: "9.5px", color: T.textDim, marginLeft: "4px" }}>{o.unit}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Heat load box */}
              <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", background: T.heatBg, border: `1px solid ${T.heatBdr}`, borderLeft: "4px solid #f97316" }}>
                <div style={{ fontSize: "9.5px", color: "#f97316", letterSpacing: "1.5px", marginBottom: "8px" }}>🔥 HEAT LOAD MULTIPLIERS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "10.5px", color: T.textMuted }}>
                  <span>Sensible (ΔT=1°C / 1 m³/s):</span>
                  <span style={{ color: "#fb923c", fontWeight: "700" }}>{(1.006 * result.rho * 1000).toFixed(0)} W/(m³/s·°C)</span>
                  <span>Latent (ΔW=1 g/kg / 1 m³/s):</span>
                  <span style={{ color: "#fb923c", fontWeight: "700" }}>{(2501 * result.rho).toFixed(0)} W/(m³/s·g/kg)</span>
                  <span>Total (Δh=1 kJ/kg / 1 m³/s):</span>
                  <span style={{ color: "#fb923c", fontWeight: "700" }}>{(result.rho * 1000).toFixed(0)} W/(m³/s·kJ/kg)</span>
                </div>
              </div>

              {/* Export buttons */}
              <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={() => openExport("chart")} style={{ ...exportBtn }}>📊 Chart</button>
                <button onClick={() => openExport("values")} style={{ ...exportBtn, borderColor: "#38bdf8", color: "#38bdf8", background: "rgba(56,189,248,0.08)" }}>📋 Values</button>
                <button onClick={() => openExport("both")} style={{ ...exportBtn, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", border: "none", color: "#fff" }}>📁 Both</button>
              </div>
            </div>
          )}
        </>}

        {/* ── CHART TAB ── */}
        {tab === "chart" && (
          <div style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: "12px", padding: "14px", marginBottom: "14px", boxShadow: T.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ fontSize: "9.5px", color: T.slColor, letterSpacing: "2px", textTransform: "uppercase" }}>📊 Psychrometric Chart</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button onClick={() => openExport("chart")}  style={{ ...exportBtn }}>📊 Chart</button>
                <button onClick={() => openExport("values")} disabled={!result} style={{ ...exportBtn, opacity: result ? 1 : 0.4, borderColor: result ? "#38bdf8" : T.cardBdr, color: result ? "#38bdf8" : T.textDim }}>📋 Values</button>
                <button onClick={() => openExport("both")}   style={{ ...exportBtn, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", border: "none", color: "#fff" }}>📁 Both</button>
              </div>
            </div>
            {!result && (
              <div style={{ fontSize: "11px", color: "#f97316", marginBottom: "10px", padding: "8px 12px", background: "rgba(249,115,22,0.06)", borderRadius: "6px" }}>
                Calculate first → then state point appears on chart.
              </div>
            )}
            <PsychroChart result={result} P={P} theme={theme} tempUnit={tempUnit} />
            {result && (
              <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {([
                  ["DBT", tempUnit==="F" ? `${result.Tdb}°C / ${toF(result.Tdb).toFixed(1)}°F` : `${result.Tdb}°C`, "#f97316"],
                  ["WBT", tempUnit==="F" ? `${result.Twb}°C / ${toF(result.Twb).toFixed(1)}°F` : `${result.Twb}°C`, "#38bdf8"],
                  ["DPT", tempUnit==="F" ? `${result.Tdp}°C / ${toF(result.Tdp).toFixed(1)}°F` : `${result.Tdp}°C`, "#818cf8"],
                  ["RH",  `${result.RH}%`,        "#34d399"],
                  ["W",   `${result.W_gkg} g/kg`, "#fbbf24"],
                  ["h",   `${result.h} kJ/kg`,    "#f472b6"],
                ] as any[]).map(([l,v,c]) => (
                  <div key={l} style={{ padding: "5px 12px", borderRadius: "20px", background: d ? "rgba(15,23,42,0.9)" : "#F1F5F9", border: `1px solid ${c}44`, fontSize: "10.5px", color: c }}>
                    <strong>{l}:</strong> {v}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── GUIDE TAB ── */}
        {tab === "guide" && (
          <div style={{ background: T.cardBg, border: `1px solid ${T.cardBdr}`, borderRadius: "12px", padding: "14px", marginBottom: "14px", boxShadow: T.shadow }}>
            <div style={{ fontSize: "9.5px", color: T.slColor, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>📖 User Guide</div>

            <div style={{ color: "#38bdf8", fontWeight: "700", fontSize: "12px", marginBottom: "6px" }}>📱 Android Download</div>
            <div style={{ fontSize: "10.5px", color: T.textMuted, lineHeight: "1.9", marginBottom: "14px", padding: "10px", borderRadius: "8px", background: T.guideInnerBg, border: `1px solid ${T.guideInnerBdr}` }}>
              • File automatically saves to <strong style={{ color: "#38bdf8" }}>Downloads</strong> folder.<br />
              • Open <strong>Files</strong> app → Internal Storage → Download → find <code>PsychroPro_*.png</code>.<br />
              • If Downloads fails, a <strong>Share dialog</strong> opens — tap "Save to Files" or "Gallery".<br />
              • Make sure app has <strong>Storage permission</strong> (Settings → Apps → PsychroPro → Permissions).
            </div>

            <div style={{ color: "#38bdf8", fontWeight: "700", fontSize: "12px", marginBottom: "6px" }}>🌡️ Temperature Unit Toggle</div>
            <div style={{ fontSize: "10.5px", color: T.textMuted, lineHeight: "1.9", marginBottom: "14px", padding: "10px", borderRadius: "8px", background: T.guideInnerBg, border: `1px solid ${T.guideInnerBdr}` }}>
              Use the <strong style={{ color: "#38bdf8" }}>°C / °F toggle</strong> at the top of the Calculator tab.<br />
              • Conversion happens automatically — entered values update instantly.<br />
              • Results show <strong>both °C and °F</strong> for all temperature outputs.<br />
              • Chart always plots in °C (ASHRAE standard).
            </div>

            <div style={{ color: "#38bdf8", fontWeight: "700", fontSize: "12px", marginBottom: "4px" }}>🔹 Supported Input Combinations</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px", padding: "10px", borderRadius: "8px", background: T.guideBg, marginBottom: "12px", fontSize: "10.5px" }}>
              {["Tdb + RH","Tdb + W","Tdb + Twb","Tdb + Tdp","Tdb + h","Tdb + v",
                "Twb + RH","Twb + W","Twb + Tdp","Twb + h",
                "Tdp + RH","Tdp + h","Tdp + v",
                "RH + W","RH + h","RH + v",
                "W + h","W + v","h + v"].map(c => (
                <div key={c} style={{ color: "#34d399" }}>✓ {c}</div>
              ))}
            </div>

            <div style={{ padding: "10px", borderRadius: "8px", background: T.guideInnerBg, border: `1px solid ${T.guideInnerBdr}`, fontSize: "10.5px" }}>
              <div style={{ color: "#38bdf8", fontWeight: "700", marginBottom: "6px" }}>📊 Heat Load Keys</div>
              <div style={{ color: T.textMuted }}>W (g/kg) → latent heat</div>
              <div style={{ color: T.textMuted }}>h (kJ/kg) → total heat</div>
              <div style={{ color: T.textMuted }}>ρ (kg/m³) → mass flow calculations</div>
              <div style={{ color: T.textMuted }}>v (m³/kg) → duct / fan sizing</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}