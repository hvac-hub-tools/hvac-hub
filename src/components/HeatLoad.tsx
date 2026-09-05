import { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ── Constants ────────────────────────────────────────────────
const SOLAR: any = { N:23, S:12, W:163, E:12, NE:12, SW:85, NW:138, SE:12 };
const WALL_ADD: any = { N:4,  S:16, W:12,  E:18, NE:10, SW:14, NW:6,  SE:18 };
const DIRS     = ["N","NE","E","SE","S","SW","W","NW"];
const M2FT2    = 10.7639;
const FT2M2    = 0.092903;

const SPACE_TYPES = [
  { v:"custom",    l:"Custom / Specify",       s:245, lt:205 },
  { v:"theatre",   l:"Theatre / Cinema",        s:210, lt:140 },
  { v:"school",    l:"Schools",                 s:215, lt:185 },
  { v:"apartment", l:"Apartments / Hotels",     s:215, lt:235 },
  { v:"shop",      l:"Shops / Malls",           s:215, lt:235 },
  { v:"office",    l:"Offices / Banks",         s:220, lt:280 },
  { v:"restaurant",l:"Restaurant",              s:240, lt:310 },
  { v:"factory_l", l:"Factory — Light Work",    s:245, lt:505 },
  { v:"dance",     l:"Dance Hall",              s:275, lt:575 },
  { v:"factory_m", l:"Factory — Moderate",      s:330, lt:670 },
  { v:"factory_h", l:"Factory — Heavy Work",    s:485, lt:965 },
];

const F2C   = (f: number) => +((f - 32) * 5 / 9).toFixed(2);
const C2F   = (c: number) => +(c * 9 / 5 + 32).toFixed(2);
const toNum = (v: any) => parseFloat(v) || 0;
const fmt   = (v: any, d = 1) => isFinite(v) && !isNaN(v) ? Number(v).toFixed(d) : "—";
const fmtI  = (v: any) => isFinite(v) && !isNaN(v) ? Math.round(v).toLocaleString("en-IN") : "—";

const DEF_PROJ    = { name:"My Project", addr:"", by:"", peak:"4:00 PM" };
const DEF_DESIGN: any = { oDBT:96.4, oRH:60, oWBT:84.54, oGr:157, iDBT:75.2, iRH:55, iWBT:64, iGr:71.7 };
const DEF_FACTORS: any = { uWall:0.35, uPart:0.35, uRoof:0.2, uCeil:0.2, uFloor:0.2, sg:0.3, tg:0.3, bf:0.12, adp:52, cfmP:5, cfmSF:0.06 };

const makeRoom = (id: number, name?: string): any => ({
  id, name: name || `Room ${id}`,
  spaceType:"custom", areaM2:100, ht:3.2, glHt:2.1,
  lpd:1.11, occ:10, eqpd:0.5, ps:245, pl:205,
  glass:{ N:0, S:0, W:0, E:0, NE:0, SW:0, NW:0, SE:0 },
  grossWall:{ N:0, S:0, W:0, E:0, NE:0, SW:0, NW:0, SE:0 },
  other:{ part:0, roof:0, ceil:0, floor:0 },
});

const DEF_SIM: any = { areaM2:100, ht:3, winSF:80, winDir:"W", wallSF:200, roofSF:0, occ:8, lpd:1, eqpd:0.5, oTemp:96.4, iTemp:75.2 };

// ── Calculate one room ───────────────────────────────────────
function calcRoom(rm: any, design: any, factors: any) {
  const d = design, f = factors;
  const A  = rm.areaM2 * M2FT2;
  const H  = rm.ht * 3.28084;
  const V  = A * H;
  const dT = d.oDBT - d.iDBT;
  const dG = d.oGr  - d.iGr;
  const CF = 1 - f.bf;
  const DR = CF * (d.iDBT - f.adp);
  const lW = rm.lpd * A;
  const eW = rm.eqpd * A;
  const oaCFM = rm.occ * f.cfmP + A * f.cfmSF;

  const sg: any = {}, nw: any = {}, wg: any = {};
  let solarS = 0, wallS = 0;
  DIRS.forEach(dir => {
    sg[dir]  = (rm.glass[dir]||0) * SOLAR[dir] * f.sg;
    solarS  += sg[dir];
    nw[dir]  = Math.max(0, (rm.grossWall[dir]||0) - (rm.glass[dir]||0));
    wg[dir]  = nw[dir] * (WALL_ADD[dir] + 13.8) * f.uWall;
    wallS   += wg[dir];
  });

  const totGlass = DIRS.reduce((s, dr) => s + (rm.glass[dr]||0), 0);
  const roofG    = (rm.other.roof||0) * (35 + 13.8) * f.uRoof;
  const glassTG  = totGlass * dT * f.tg;
  const partG    = (rm.other.part||0) * (dT - 5) * f.uPart;
  const ceilA    = (rm.other.ceil||0) > 0 ? rm.other.ceil : A;
  const floorA   = (rm.other.floor||0) > 0 ? rm.other.floor : A;
  const ceilG    = ceilA  * (dT - 5) * f.uCeil;
  const floorG   = floorA * (dT - 5) * f.uFloor;
  const pS       = rm.occ * rm.ps;
  const pL       = rm.occ * rm.pl;
  const lG       = lW * 3.41;
  const eG       = eW * 3.41;

  const stS = solarS+wallS+roofG+glassTG+partG+ceilG+floorG+pS+lG+eG;
  const stL = pL;
  const sfS = 0.10 * stS;
  const sfL = 0.05 * stL;
  const RSH = stS + sfS;
  const RLH = stL + sfL;

  const oaS_bf = 1.08 * f.bf * dT * oaCFM;
  const oaL_bf = 0.68 * f.bf * dG * oaCFM;
  const ERSH   = RSH + oaS_bf;
  const ERLH   = RLH + oaL_bf;
  const ERTH   = ERSH + ERLH;
  const ESHF   = ERTH > 0 ? ERSH / ERTH : 0;
  const SCFM   = DR > 0 ? ERSH / 1.08 / DR : 0;

  const oaS_cf = 1.08 * CF * dT * oaCFM;
  const oaL_cf = 0.68 * CF * dG * oaCFM;
  const tot    = ERTH + oaS_cf + oaL_cf;
  const otherG = 0.03 * tot;
  const GT     = tot + otherG;
  const TR     = GT / 12000;
  const HP     = TR * 1.25;
  const kW     = TR * 3.517;

  return {
    A,H,V,dT,dG,CF,DR,lW,eW,oaCFM,
    sg,nw,wg,solarS,wallS,
    roofG,glassTG,totGlass,partG,ceilG,floorG,
    pS,pL,lG,eG,
    stS,stL,sfS,sfL,RSH,RLH,
    oaS_bf,oaL_bf,ERSH,ERLH,ERTH,ESHF,
    SCFM,oaS_cf,oaL_cf,tot,otherG,GT,TR,HP,kW,
    TMBH:   GT / 1000,
    SMBH:   (ERSH + oaS_cf) / 1000,
    sqFTtr: TR > 0 ? A / TR   : 0,
    cfmSF:  A  > 0 ? SCFM / A : 0,
    cfmTR:  TR > 0 ? SCFM / TR : 0,
  };
}

// ═══════════════════════════════════════════════════════════
// PLATFORM DETECTION
// ═══════════════════════════════════════════════════════════
const isCapacitorAndroid = (): boolean => {
  try {
    const cap = (window as any).Capacitor;
    return !!(cap && cap.isNativePlatform && cap.isNativePlatform() && cap.getPlatform() === "android");
  } catch { return false; }
};

const isIOS = () => {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
};

// ─────────────────────────────────────────────────────────
// BROWSER DOWNLOAD — simple <a> tag with base64 dataUrl
// Same as reference PsychroPro code: saveImageBrowser()
// ─────────────────────────────────────────────────────────
function saveFileBrowser(dataUrl: string, fileName: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─────────────────────────────────────────────────────────
// ANDROID NATIVE SAVE — Capacitor Filesystem + Toast
// Same pattern as reference code: saveImageAndroid()
// ─────────────────────────────────────────────────────────
async function saveFileAndroid(
  dataUrl: string,
  fileName: string,
  onStatus: (msg: string) => void
): Promise<boolean> {
  try {
    // Use Capacitor plugins via window global (set by Capacitor runtime)
    // This avoids static/dynamic import — works at build time, runs only in native app
    const cap = (window as any).Capacitor;
    if (!cap) throw new Error("Not in Capacitor");

    const Plugins = (window as any).CapacitorPlugins || cap.Plugins || {};
    const Filesystem = Plugins.Filesystem || cap.Plugins?.Filesystem;
    const Toast      = Plugins.Toast      || cap.Plugins?.Toast;
    const Share      = Plugins.Share      || cap.Plugins?.Share;

    if (!Filesystem) throw new Error("Filesystem plugin not available");

    const base64Data = dataUrl.split(",")[1];
    if (!base64Data) throw new Error("Invalid data");
    onStatus("⏳ Saving to Downloads...");

    try {
      await Filesystem.writeFile({
        path: `Download/${fileName}`,
        data: base64Data,
        directory: "EXTERNAL_STORAGE",
        recursive: true,
      });
      if (Toast) await Toast.show({ text: `✅ Saved: ${fileName}`, duration: "long" });
      onStatus("✅ Saved to Downloads folder!");
      return true;
    } catch (_extErr) {
      // Fallback: Documents + Share
      const saved = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: "DOCUMENTS",
        recursive: true,
      });
      if (Share) {
        await Share.share({ title: "HeatLoad Report", url: saved.uri, dialogTitle: "Save File" });
        onStatus("✅ File ready — save from share dialog!");
      } else {
        onStatus("✅ Saved to Documents folder!");
      }
      return true;
    }
  } catch (err: any) {
    onStatus(`❌ Save failed: ${err?.message ?? "Unknown error"}`);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// STABLE INPUT COMPONENT
// ═══════════════════════════════════════════════════════════
type NumInputProps = {
  value: number;
  onCommit: (v: number) => void;
  step?: number | string;
  min?: number;
  max?: number;
  decimals?: number;
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
};

function NumInput({ value, onCommit, min, max, decimals, style, className, placeholder }: NumInputProps) {
  const [text, setText] = useState<string>(() => formatVal(value, decimals));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setText(formatVal(value, decimals));
    }
  }, [value, decimals]);

  function formatVal(v: number, d?: number) {
    if (v === undefined || v === null || isNaN(v)) return "";
    if (d !== undefined) return Number(v).toFixed(d);
    return String(v);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*\.?[0-9]*"
      value={text}
      placeholder={placeholder}
      className={className}
      style={style}
      onFocus={() => { focused.current = true; }}
      onBlur={() => {
        focused.current = false;
        const num = parseFloat(text);
        if (isNaN(num)) {
          onCommit(0);
          setText(formatVal(0, decimals));
        } else {
          let v = num;
          if (min !== undefined && v < min) v = min;
          if (max !== undefined && v > max) v = max;
          onCommit(v);
          setText(formatVal(v, decimals));
        }
      }}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || v === "-" || /^-?\d*\.?\d*$/.test(v)) {
          setText(v);
          if (v !== "" && v !== "-" && v !== "." && v !== "-.") {
            const num = parseFloat(v);
            if (!isNaN(num)) onCommit(num);
          }
        }
      }}
    />
  );
}

type TextInputProps = {
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
};
function TextInput({ value, onChange, style, placeholder }: TextInputProps) {
  return (
    <input
      type="text"
      value={value ?? ""}
      placeholder={placeholder}
      style={style}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function RRow({ label, value, unit, bold, C }: any) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.div}`}}>
      <span style={{fontSize:12,color:C.sub,flex:1,paddingRight:8,lineHeight:1.3}}>{label}</span>
      <span style={{fontSize:13,fontWeight:bold?600:400,color:C.text,textAlign:"right"}}>{value}</span>
      {unit!==undefined&&<span style={{fontSize:10,color:C.muted,minWidth:42,textAlign:"right"}}>{unit}</span>}
    </div>
  );
}

function Metric({ label, value, unit, acc, C, isDark }: any) {
  return (
    <div style={{background:acc?C.metricAcc:(isDark?"rgba(255,255,255,0.04)":"#F8FAFC"),border:`1px solid ${acc?C.metricB:C.cardB}`,borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
      <div style={{fontSize:10,color:C.sub,marginBottom:4,lineHeight:1.3}}>{label}</div>
      <div style={{fontSize:21,fontWeight:600,lineHeight:1,color:acc?C.blue:C.text}}>{value}</div>
      <div style={{fontSize:10,color:C.muted,marginTop:3}}>{unit}</div>
    </div>
  );
}

function Field({ label, suffix, note, children, C }: any) {
  const lbl = { display:"block", fontSize:11, fontWeight:600, color:C.sub, marginBottom:4, letterSpacing:"0.03em" };
  return (
    <div style={{marginBottom:10}}>
      {label && <span style={lbl}>{label}</span>}
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {children}
        {suffix && <span style={{fontSize:11,color:C.muted,flexShrink:0}}>{suffix}</span>}
      </div>
      {note && <div style={{fontSize:11,color:C.muted,marginTop:2}}>{note}</div>}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function HeatLoad({ theme = "light" }: { theme?: string }) {
  const isDark = theme === "dark";
  const C: any = {
    bg: isDark?"#0B1F3A":"#F8FAFC", card: isDark?"rgba(255,255,255,0.04)":"#ffffff",
    cardB: isDark?"rgba(255,255,255,0.1)":"#E2E8F0", hdBg: isDark?"#132F57":"#F8FAFC",
    text: isDark?"#e2e8f0":"#1E293B", sub: isDark?"#94a3b8":"#64748B",
    muted: isDark?"#475569":"#94a3b8", inp: isDark?"rgba(255,255,255,0.07)":"#ffffff",
    inpB: isDark?"rgba(255,255,255,0.15)":"#e2e8f0", div: isDark?"rgba(255,255,255,0.07)":"#E2E8F0",
    pillBg: isDark?"#132F57":"#E2E8F0", blue: "#2196F3",
    green: isDark?"#34d399":"#059669", greenBg: isDark?"rgba(16,185,129,0.1)":"#ECFDF5",
    greenB: isDark?"rgba(16,185,129,0.25)":"#6ee7b7",
    orange: isDark?"#fb923c":"#ea580c", orangeBg: isDark?"rgba(249,115,22,0.1)":"#FFF7ED",
    orangeB: isDark?"rgba(249,115,22,0.25)":"#fdba74",
    resBorder: isDark?"rgba(33,150,243,0.3)":"#93c5fd",
    metricAcc: isDark?"rgba(33,150,243,0.1)":"#DBEAFE",
    metricB: isDark?"rgba(33,150,243,0.25)":"#93c5fd",
    red: isDark?"#f87171":"#dc2626", redBg: isDark?"rgba(239,68,68,0.1)":"#FEF2F2",
    redB: isDark?"rgba(239,68,68,0.25)":"#fca5a5",
  };

  const [tempUnit, setTempUnit] = useState("F");
  const [areaMode, setAreaMode] = useState("m2");
  const [mode, setMode] = useState("excel");
  const [proj, setProj] = useState(DEF_PROJ);
  const [design, setDesign] = useState<any>(DEF_DESIGN);
  const [factors, setFactors] = useState<any>(DEF_FACTORS);
  const [sim, setSim] = useState<any>(DEF_SIM);

  // PDF Preview Modal state — mobile-friendly in-app overlay
  const [pdfHTML, setPdfHTML] = useState<string | null>(null);
  // Toast/Notice for download/share status on mobile
  const [notice, setNotice] = useState<string>("");

  const [nextId, setNextId] = useState(2);
  const [rooms, setRooms] = useState<any[]>([makeRoom(1, "Room 1")]);
  const [activeRoom, setActiveRoom] = useState(1);
  const [openSections, setOpenSections] = useState<any>({
    proj:false, design:true, factors:false,
  });
  const tog = (k: string) => setOpenSections((p: any) => ({ ...p, [k]: !p[k] }));

  const addRoom = () => {
    const id = nextId;
    setNextId(id + 1);
    setRooms(p => [...p, makeRoom(id, `Room ${id}`)]);
    setActiveRoom(id);
  };

  const duplicateRoom = (srcId: number) => {
    const src = rooms.find(r => r.id === srcId);
    if (!src) return;
    const id = nextId;
    setNextId(id + 1);
    const newRoom = JSON.parse(JSON.stringify(src));
    newRoom.id = id;
    newRoom.name = `${src.name} (Copy)`;
    setRooms(p => [...p, newRoom]);
    setActiveRoom(id);
  };

  const deleteRoom = (id: number) => {
    if (rooms.length <= 1) return;
    setRooms(p => p.filter(r => r.id !== id));
    if (activeRoom === id) {
      setActiveRoom(rooms.find(r => r.id !== id)?.id || rooms[0].id);
    }
  };

  const upRoom = useCallback((id: number, key: string, value: any) => {
    setRooms(prev => prev.map(r => {
      if (r.id !== id) return r;
      const nr = { ...r };
      if (key.startsWith("glass.")) {
        const dir = key.split(".")[1];
        nr.glass = { ...r.glass, [dir]: typeof value === "number" ? value : toNum(value) };
      } else if (key.startsWith("grossWall.")) {
        const dir = key.split(".")[1];
        nr.grossWall = { ...r.grossWall, [dir]: typeof value === "number" ? value : toNum(value) };
      } else if (key.startsWith("other.")) {
        const k = key.split(".")[1];
        nr.other = { ...r.other, [k]: typeof value === "number" ? value : toNum(value) };
      } else if (key === "spaceType") {
        nr.spaceType = value;
        const st = SPACE_TYPES.find(s => s.v === value);
        if (st && value !== "custom") { nr.ps = st.s; nr.pl = st.lt; }
      } else if (key === "name") {
        nr.name = value;
      } else {
        nr[key] = typeof value === "number" ? value : toNum(value);
      }
      return nr;
    }));
  }, []);

  const tDisp  = (f: number) => tempUnit==="C" ? F2C(f) : f;
  const tU     = tempUnit==="C" ? "°C" : "°F";

  const upDesign  = (k: string, v: any) => setDesign((p: any) => ({ ...p, [k]: typeof v === "number" ? v : toNum(v) }));
  const upDesignT = (k: string, v: any) => setDesign((p: any) => ({ ...p, [k]: tempUnit==="C" ? C2F(typeof v === "number" ? v : toNum(v)) : (typeof v === "number" ? v : toNum(v)) }));
  const upFactors = (k: string, v: any) => setFactors((p: any) => ({ ...p, [k]: typeof v === "number" ? v : toNum(v) }));

  const roomCalcs = useMemo(() => {
    return rooms.map(rm => ({ room: rm, calc: calcRoom(rm, design, factors) }));
  }, [rooms, design, factors]);

  const totals = useMemo(() => {
    const t: any = { areaM2:0, A:0, lW:0, eW:0, occ:0, oaCFM:0, stS:0, stL:0, GT:0, TR:0, SCFM:0, HP:0, kW:0 };
    roomCalcs.forEach(({room: rm, calc: c}: any) => {
      t.areaM2 += rm.areaM2; t.A += c.A; t.lW += c.lW; t.eW += c.eW;
      t.occ += rm.occ; t.oaCFM += c.oaCFM; t.stS += c.stS; t.stL += c.stL;
      t.GT += c.GT; t.TR += c.TR; t.SCFM += c.SCFM; t.HP += c.HP; t.kW += c.kW;
    });
    t.sqFTtr = t.TR > 0 ? t.A / t.TR : 0;
    t.cfmSF = t.A > 0 ? t.SCFM / t.A : 0;
    return t;
  }, [roomCalcs]);

  const activeRoomData = rooms.find(r => r.id === activeRoom) || rooms[0];
  const activeCalc = roomCalcs.find(rc => rc.room.id === activeRoom)?.calc || calcRoom(activeRoomData, design, factors);

  const simAreaM2 = sim.areaM2;
  const sc: any = useMemo(() => {
    const s = sim;
    const A = simAreaM2 * M2FT2;
    const dT = s.oTemp - s.iTemp;
    const dG = 85;
    const winG = (s.winSF||0)*SOLAR[s.winDir||"W"]*0.3;
    const wallG = (s.wallSF||0)*dT*0.35;
    const roofA = (s.roofSF||0)>0?s.roofSF:A;
    const roofG = roofA*(dT+15)*0.2;
    const glassT = (s.winSF||0)*dT*0.3;
    const envG = winG+wallG+roofG+glassT+A*(dT-5)*0.4;
    const pS = s.occ*245; const pL = s.occ*205;
    const lG = s.lpd*A*3.41; const eG = s.eqpd*A*3.41;
    const oaCFM = s.occ*5+A*0.06;
    const oaS = 1.08*0.12*dT*oaCFM; const oaL = 0.68*0.12*dG*oaCFM;
    const stS = (envG+pS+lG+eG)*1.1+oaS;
    const stL = pL*1.05+oaL;
    const ERTH = stS+stL;
    const DR = 0.88*(s.iTemp-52);
    const SCFM = DR>0?stS/(1.08*DR):0;
    const oaFull = 1.08*0.88*dT*oaCFM+0.68*0.88*dG*oaCFM;
    const GT = (ERTH+oaFull)*1.03;
    const TR = GT/12000;
    return { A,dT,envG,pS,pL,lG,eG,oaCFM,stS,stL,ERTH,SCFM,GT,TR,
      kW:TR*3.517, HP:TR*1.25, sqFTtr:TR>0?A/TR:0, cfmSF:A>0?SCFM/A:0 };
  }, [sim, simAreaM2]);

  // ─────────────────────────────────────────────────────────
  // NOTICE TOAST
  // ─────────────────────────────────────────────────────────
  const showNotice = (msg: string, ms = 4000) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), ms);
  };

  // ─────────────────────────────────────────────────────────
  // EXCEL DOWNLOAD — XLSX base64 dataUrl method
  // Exactly same as PsychroPro reference: saveFileBrowser(dataUrl, fileName)
  // Works on Android WebView, Chrome, Safari, Desktop — everywhere
  // ─────────────────────────────────────────────────────────
  const downloadXlsx = async (wb: any, XLSX: any, filename: string) => {
    const mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    showNotice("⏳ Preparing Excel file...", 60000);
    setTimeout(async () => {
      if (isCapacitorAndroid()) {
        // Native Android: save via Filesystem
        try {
          const b64 = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
          const dataUrl = `data:${mime};base64,${b64}`;
          await saveFileAndroid(dataUrl, filename, (msg: string) => showNotice(msg, 5000));
        } catch (e: any) { showNotice(`❌ ${e?.message}`, 5000); }
      } else {
        // Browser (including WebView): base64 dataUrl → <a download>
        // Exact same pattern as saveImageBrowser() in PsychroPro reference
        try {
          const b64 = XLSX.write(wb, { bookType: "xlsx", type: "base64" });
          const dataUrl = `data:${mime};base64,${b64}`;
          saveFileBrowser(dataUrl, filename);
          showNotice("✅ Excel downloaded! Check Downloads folder.", 4000);
        } catch (e: any) {
          showNotice(`❌ Download failed: ${e?.message}`, 5000);
        }
      }
    }, 60);
  };

  // ── Excel Export: full Carrier sheet ──
  const exportExcel = async () => {
    let XLSX: any;
    try { XLSX = await import("xlsx-js-style"); }
    catch { try { XLSX = await import("xlsx"); } catch { alert("Install xlsx-js-style or xlsx package"); return; } }

    const date = new Date().toLocaleDateString("en-IN");
    const TC = 53;
    const thin = { style:"thin", color:{rgb:"000000"} };
    const med = { style:"medium", color:{rgb:"000000"} };
    const border = { top:thin, bottom:thin, left:thin, right:thin };
    const thickBorder = { top:med, bottom:med, left:med, right:med };

    const S: any = {
      top: { font:{sz:10}, alignment:{horizontal:"center",vertical:"center"}, border:thickBorder },
      topLbl: { font:{sz:10}, alignment:{horizontal:"center",vertical:"center"}, border:thickBorder },
      logo: { font:{bold:true,sz:24,color:{rgb:"6AA84F"}}, alignment:{horizontal:"center",vertical:"center"}, border:thickBorder },
      orange: { fill:{fgColor:{rgb:"E46C0A"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:10}, alignment:{horizontal:"center",vertical:"center"}, border:thickBorder },
      blue: { fill:{fgColor:{rgb:"1F4E79"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:9}, alignment:{horizontal:"center",vertical:"center"}, border },
      greenHead: { fill:{fgColor:{rgb:"00B050"}}, font:{bold:true,color:{rgb:"000000"},sz:9}, alignment:{horizontal:"center",vertical:"center"}, border },
      miniHead: { font:{bold:true,sz:9}, alignment:{horizontal:"center",vertical:"center"}, border },
      miniVal: { font:{sz:9,color:{rgb:"C00000"}}, alignment:{horizontal:"center",vertical:"center"}, border },
      purple: { fill:{fgColor:{rgb:"842084"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:9}, alignment:{horizontal:"center",vertical:"center",wrapText:true}, border:thickBorder },
      purpleSmall: { fill:{fgColor:{rgb:"842084"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:8}, alignment:{horizontal:"center",vertical:"center",wrapText:true}, border:thickBorder },
      purpleVert: { fill:{fgColor:{rgb:"842084"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:8}, alignment:{horizontal:"center",vertical:"center",textRotation:90,wrapText:true}, border:thickBorder },
      spacer: { fill:{fgColor:{rgb:"EBF1DE"}}, font:{sz:8}, alignment:{horizontal:"center",vertical:"center"}, border },
      data: { font:{sz:9}, alignment:{horizontal:"center",vertical:"center"}, border },
      floor: { fill:{fgColor:{rgb:"B8CCE4"}}, font:{bold:true,sz:9}, alignment:{horizontal:"center",vertical:"center",wrapText:true}, border },
      roomYellow: { fill:{fgColor:{rgb:"FFFF00"}}, font:{sz:9}, alignment:{horizontal:"center",vertical:"center",wrapText:true}, border },
      roomGreen: { fill:{fgColor:{rgb:"D8E4BC"}}, font:{sz:9}, alignment:{horizontal:"center",vertical:"center",wrapText:true}, border },
      fresh: { fill:{fgColor:{rgb:"92D050"}}, font:{sz:9}, alignment:{horizontal:"center",vertical:"center"}, border },
      result: { fill:{fgColor:{rgb:"FFC000"}}, font:{bold:true,sz:9}, alignment:{horizontal:"center",vertical:"center"}, border },
      total: { font:{bold:true,sz:9}, alignment:{horizontal:"center",vertical:"center"}, border:thickBorder },
      totalRoom: { font:{bold:true,sz:9}, alignment:{horizontal:"center",vertical:"center"}, border:thickBorder },
    };

    const rows: any[][] = [];
    const merges: any[] = [];
    const cell = (v: any = "", s: any = S.data) => ({ v: v ?? "", t: typeof v === "number" ? "n" : "s", s });
    const newRow = (style = S.data) => Array.from({ length: TC }, () => cell("", style));
    const addRow = (style = S.data) => { rows.push(newRow(style)); return rows.length - 1; };
    const set = (r: number, c: number, v: any, s: any = S.data) => { rows[r][c] = cell(v, s); };
    const merge = (r1: number, c1: number, r2: number, c2: number, v: any, s: any) => {
      merges.push({ s:{r:r1,c:c1}, e:{r:r2,c:c2} });
      for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) set(r, c, "", s);
      set(r1, c1, v, s);
    };

    for (let i = 0; i < 6; i++) addRow(S.top);
    const meta = [
      ["Project", proj.name || "My Project", "Doc Number", ""],
      ["Area Of Project", proj.addr || "Sample Flat", "Revision", "R0"],
      ["Element Description", "Cooling Load Room Data Sheet", "Prepared by", proj.by || ""],
      ["", "", "Date", date],
      ["", "", "Checked by", ""],
      ["", "", "Date", date],
    ];
    meta.forEach((m, r) => {
      merge(r, 0, r, 8, m[0], S.topLbl);
      merge(r, 9, r, 28, m[1], S.top);
      merge(r, 29, r, 31, m[2], S.topLbl);
      merge(r, 32, r, 34, m[3], S.top);
    });
    merge(0, 35, 5, 38, "ecofirst", S.logo);
    merge(0, 39, 0, 52, "Operating Pannel", S.orange);
    merge(1, 39, 1, 43, "DESIGN CONDITIONS", S.blue);
    merge(1, 44, 1, 48, "U-factors:", S.greenHead);
    merge(1, 49, 1, 52, "Factors for Glass:", S.greenHead);
    ["British Unit","DBT","% RH","WBT","Gr/lb"].forEach((v, i) => set(2, 39 + i, v, S.miniHead));
    [["Outside",design.oDBT,design.oRH,design.oWBT,design.oGr],["Inside",design.iDBT,design.iRH,design.iWBT,design.iGr],["Difference",+(design.oDBT-design.iDBT).toFixed(1),"-",+(design.oWBT-design.iWBT).toFixed(1),+(design.oGr-design.iGr).toFixed(1)]].forEach((arr, i) => {
      arr.forEach((v, j) => set(3 + i, 39 + j, v, j === 0 ? S.miniHead : S.data));
    });
    [["Exposed Wall",factors.uWall,"Roof",factors.uRoof],["Partition Wall",factors.uPart,"Ceiling",factors.uCeil],["Other Partition",factors.uPart,"Floor",factors.uFloor]].forEach((arr, i) => {
      [44,45,46,47].forEach((c, j) => set(2 + i, c, arr[j], j % 2 ? S.miniVal : S.data));
    });
    [["Solar gain",factors.sg],["Transmn. Gain",factors.tg]].forEach((arr, i) => {
      merge(2 + i, 49, 2 + i, 50, arr[0], S.data);
      merge(2 + i, 51, 2 + i, 52, arr[1], S.miniVal);
    });
    merge(4, 49, 5, 52, "", S.data);
    merge(5, 44, 5, 48, "", S.data);

    const h1 = addRow(S.purple);
    const h2 = addRow(S.purple);
    const h3 = addRow(S.purple);

    const group = (c1: number, c2: number, label: string) => merge(h1, c1, h1, c2, label, S.purple);
    const rowSpan = (c: number, label: string, vert = false) => merge(h1, c, h3, c, label, vert ? S.purpleVert : S.purple);
    rowSpan(0, "Sr.No"); rowSpan(1, "Floor"); rowSpan(2, "Room Description");
    group(3, 4, "Floor Area");
    group(5, 6, "Slab To Slab Height");
    merge(h1, 7, h2, 7, "Glass Height", S.purple);
    group(8, 12, "Internal Loads");
    group(13, 20, "Wall Area (E20)");
    group(21, 28, "Hap Wall Area");
    group(29, 36, "Glass Area");
    merge(h1, 37, h2, 37, "Wall Partition", S.purple);
    merge(h1, 38, h2, 38, "Exposed Roof", S.purple);
    merge(h1, 39, h2, 39, "Floor Not Condition", S.purple);
    merge(h1, 40, h2, 40, "Ceiling Not Condition", S.purple);
    group(41, 43, "FRESH AIR");
    group(44, 45, "HEAT GAIN FROM");
    rowSpan(46, "Added Room FA Load in");
    rowSpan(47, "Total FA Load");
    rowSpan(48, "TR");
    rowSpan(49, "DCFM");
    rowSpan(50, "HP", true);
    rowSpan(51, "CFM/Sq.ft", true);
    rowSpan(52, "Sq.Ft/TR", true);

    ["Metre²","Feet²","Metre","Ft","Metre"].forEach((v, i) => set(h3, 3 + i, v, S.purpleSmall));
    merge(h2, 8, h2, 9, "Lighting Load", S.purpleSmall);
    merge(h2, 10, h2, 10, "Occupancy", S.purpleSmall);
    merge(h2, 11, h2, 12, "Eqpt Load", S.purpleSmall);
    ["Watt/Sq.ft","Watts","Nos","Watt/Sq.ft","Watts"].forEach((v, i) => set(h3, 8 + i, v, S.purpleSmall));
    DIRS.forEach((d, i) => { set(h2, 13 + i, d, S.purpleSmall); set(h3, 13 + i, "Ft²", S.purpleSmall); });
    DIRS.forEach((d, i) => { set(h2, 21 + i, d, S.purpleSmall); set(h3, 21 + i, "Ft²", S.purpleSmall); });
    DIRS.forEach((d, i) => { set(h2, 29 + i, d, S.purpleSmall); set(h3, 29 + i, "Ft²", S.purpleSmall); });
    ["Feet²","Feet²","Feet²","Feet²"].forEach((v, i) => set(h3, 37 + i, v, S.purpleSmall));
    ["CFM/persons","CFM/Sq.ft","Total Fresh Airflow With"].forEach((v, i) => merge(h2, 41 + i, h3, 41 + i, v, S.purpleSmall));
    merge(h2, 44, h2, 45, "Btu/hr", S.purpleSmall);
    set(h3, 44, "Sensible", S.purpleSmall);
    set(h3, 45, "Latent", S.purpleSmall);

    const sep = addRow(S.spacer);
    for (let c = 0; c < TC; c++) set(sep, c, "", S.spacer);

    const dataStart = rows.length;
    roomCalcs.forEach(({room: rm, calc: c}: any, idx: number) => {
      const r = addRow(S.data);
      const floorStyle = S.floor;
      set(r, 0, idx + 1, S.data);
      set(r, 1, idx === 0 ? (proj.addr || proj.name || "Sample Flat") : "", floorStyle);
      set(r, 2, rm.name, idx < 3 ? S.roomYellow : S.roomGreen);
      set(r, 3, +fmt(rm.areaM2, 1)); set(r, 4, +fmt(c.A, 0));
      set(r, 5, +fmt(rm.ht, 2)); set(r, 6, +fmt(c.H, 1)); set(r, 7, +fmt(rm.glHt, 2));
      set(r, 8, rm.lpd); set(r, 9, Math.round(c.lW)); set(r, 10, rm.occ); set(r, 11, rm.eqpd); set(r, 12, Math.round(c.eW));
      DIRS.forEach((d, i) => set(r, 13 + i, rm.grossWall[d] || 0));
      DIRS.forEach((d, i) => set(r, 21 + i, Math.round(c.nw[d] || 0)));
      DIRS.forEach((d, i) => set(r, 29 + i, rm.glass[d] || 0));
      set(r, 37, rm.other.part || 0);
      set(r, 38, rm.other.roof || 0);
      set(r, 39, Math.round(rm.other.floor || c.A));
      set(r, 40, Math.round(rm.other.ceil || c.A));
      set(r, 41, factors.cfmP, S.fresh); set(r, 42, factors.cfmSF, S.fresh); set(r, 43, Math.round(c.oaCFM), S.fresh);
      set(r, 44, rm.ps); set(r, 45, rm.pl);
      set(r, 46, ""); set(r, 47, "");
      set(r, 48, +fmt(c.TR, 2), S.result); set(r, 49, Math.round(c.SCFM), S.result); set(r, 50, +fmt(c.HP, 1), S.result);
      set(r, 51, +fmt(c.cfmSF, 2), S.result); set(r, 52, Math.round(c.sqFTtr), S.result);
    });
    const dataEnd = rows.length - 1;
    if (dataEnd >= dataStart) merge(dataStart, 1, dataEnd, 1, proj.addr || proj.name || "Sample Flat", S.floor);

    const totalRow = addRow(S.total);
    set(totalRow, 2, "Total", S.totalRoom);
    set(totalRow, 3, +fmt(totals.areaM2, 0), S.total); set(totalRow, 4, +fmt(totals.A, 0), S.total);
    set(totalRow, 5, +fmt(rooms.reduce((s, r) => s + r.ht, 0), 0), S.total);
    set(totalRow, 6, +fmt(roomCalcs.reduce((s: number, rc: any) => s + rc.calc.H, 0), 0), S.total);
    set(totalRow, 7, +fmt(rooms.reduce((s, r) => s + r.glHt, 0), 0), S.total);
    set(totalRow, 8, +fmt(rooms.reduce((s, r) => s + r.lpd, 0), 0), S.total);
    set(totalRow, 9, Math.round(totals.lW), S.total); set(totalRow, 10, totals.occ, S.total);
    set(totalRow, 11, +fmt(rooms.reduce((s, r) => s + r.eqpd, 0), 0), S.total); set(totalRow, 12, Math.round(totals.eW), S.total);
    set(totalRow, 39, Math.round(totals.A), S.total); set(totalRow, 40, Math.round(totals.A), S.total);
    set(totalRow, 41, "Total", S.total); set(totalRow, 43, Math.round(totals.oaCFM), S.total);
    set(totalRow, 46, "Total", S.total);
    set(totalRow, 48, +fmt(totals.TR, 2), S.result); set(totalRow, 49, Math.round(totals.SCFM), S.result);
    set(totalRow, 50, +fmt(totals.HP, 1), S.result); set(totalRow, 51, +fmt(totals.cfmSF, 2), S.result); set(totalRow, 52, Math.round(totals.sqFTtr), S.result);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!merges"] = merges;
    ws["!cols"] = [
      {wch:5},{wch:20},{wch:30},{wch:8},{wch:8},{wch:7},{wch:7},{wch:7},
      {wch:7},{wch:8},{wch:6},{wch:7},{wch:8},
      ...Array(24).fill({wch:5}),
      {wch:7},{wch:8},{wch:8},{wch:9},{wch:7},{wch:7},{wch:8},{wch:9},{wch:8},{wch:9},{wch:8},{wch:7},{wch:8},{wch:6},{wch:9},{wch:9},
    ];
    ws["!rows"] = rows.map((_, i) => ({ hpt: i < 6 ? 18 : i >= h1 && i <= h3 ? 34 : i === sep ? 12 : 18 }));
    ws["!freeze"] = { xSplit: 3, ySplit: dataStart, topLeftCell: "D" + (dataStart + 1), activePane: "bottomRight", state: "frozen" };
    ws["!pageSetup"] = { orientation:"landscape", fitToWidth:1, fitToHeight:0, paperSize:9 };
    ws["!margins"] = { left:0.2, right:0.2, top:0.25, bottom:0.25, header:0.1, footer:0.1 };

    XLSX.utils.book_append_sheet(wb, ws, "Cooling Load Sheet");
    await downloadXlsx(wb, XLSX, `HeatLoad_${proj.name.replace(/\s+/g,"_")}.xlsx`);
  };

  const exportSimpleExcel = async () => {
    let XLSX: any;
    try { XLSX = await import("xlsx"); } catch { alert("npm install xlsx"); return; }

    const date = new Date().toLocaleDateString("en-IN");
    const thin = { style:"thin", color:{rgb:"888888"} };
    const border = { top:thin, bottom:thin, left:thin, right:thin };
    const S: any = {
      title: { fill:{fgColor:{rgb:"1E3A5F"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:14}, alignment:{horizontal:"center"} },
      header: { fill:{fgColor:{rgb:"059669"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:10}, alignment:{horizontal:"center"}, border },
      val: { font:{sz:10}, alignment:{horizontal:"center"}, border },
      summary: { fill:{fgColor:{rgb:"ECFDF5"}}, font:{bold:true,sz:12,color:{rgb:"059669"}}, alignment:{horizontal:"center"}, border },
    };

    const aoa: any[] = [];
    const row = (arr: any[], st?: any) => arr.map(v => ({v:v??"",t:typeof v==="number"?"n":"s",s:st||S.val}));

    aoa.push(row(["🌡️ HEAT LOAD — SIMPLE METHOD (CARRIER)"], S.title));
    aoa.push([]);
    aoa.push(row(["PROJECT", proj.name, "DATE", date], S.header));
    aoa.push([]);
    aoa.push(row(["INPUTS"], { fill:{fgColor:{rgb:"374151"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:10}, alignment:{horizontal:"center"} }));
    aoa.push(row(["Floor Area m²", fmt(simAreaM2,2), "Floor Area ft²", fmt(sc.A,1)]));
    aoa.push(row([`Outside (${tU})`, fmt(tDisp(sim.oTemp),1), `Inside (${tU})`, fmt(tDisp(sim.iTemp),1)]));
    aoa.push(row(["Occupants", sim.occ, "ΔT °F", fmt(sc.dT,1)]));
    aoa.push([]);
    aoa.push(row(["HEAT GAIN (BTU/hr)"], { fill:{fgColor:{rgb:"DC2626"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:10}, alignment:{horizontal:"center"} }));
    aoa.push(row(["Envelope", Math.round(sc.envG)]));
    aoa.push(row(["People Sensible", Math.round(sc.pS)]));
    aoa.push(row(["People Latent", Math.round(sc.pL)]));
    aoa.push(row(["Lighting", Math.round(sc.lG)]));
    aoa.push(row(["Equipment", Math.round(sc.eG)]));
    aoa.push(row(["GRAND TOTAL", Math.round(sc.GT)], { fill:{fgColor:{rgb:"FEF3C7"}}, font:{bold:true,sz:11}, border }));
    aoa.push([]);
    aoa.push(row(["📋 SUMMARY"], { fill:{fgColor:{rgb:"059669"}}, font:{bold:true,color:{rgb:"FFFFFF"},sz:11}, alignment:{horizontal:"center"} }));
    aoa.push(row(["TR", fmt(sc.TR,2), "CFM", Math.round(sc.SCFM)], S.summary));
    aoa.push(row(["kW", fmt(sc.kW,2), "HP", fmt(sc.HP,2)], S.summary));
    aoa.push(row(["ft²/TR", Math.round(sc.sqFTtr)], S.summary));
    aoa.push([]);
    aoa.push(row(["CARRIER / ISHRAE Method • 10% Sensible • 5% Latent Safety"], { font:{sz:8,color:{rgb:"64748B"}}, alignment:{horizontal:"center"} }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{wch:22},{wch:14},{wch:16},{wch:14}];
    XLSX.utils.book_append_sheet(wb, ws, "Simple HeatLoad");
    await downloadXlsx(wb, XLSX, `HeatLoad_Simple_${proj.name.replace(/\s+/g,"_")}.xlsx`);
  };

  // ── PRINT styles ──
  const PRINT_STYLES = `
    @page{size:A3 landscape;margin:6mm}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
    body{background:#fff;color:#000;font-family:Arial,sans-serif;margin:0;padding:8px}
    .xl-top{display:grid;grid-template-columns:1.4fr 1.6fr 0.8fr 2.4fr;border:1.2px solid #333}
    .xl-top>div{border-right:1px solid #999;padding:4pt 6pt;font-size:8pt;line-height:1.5}
    .xl-top>div:last-child{border-right:none;padding:0}
    .xl-dctitle{background:#E65100;color:#fff;font-weight:bold;text-align:center;padding:3pt;font-size:9pt}
    .xl-dc{width:100%;border-collapse:collapse;font-size:8pt}
    .xl-dc td,.xl-dc th{border:0.5px solid #999;padding:2pt 4pt;text-align:center}
    .xl-dc th{background:#FFE082;font-weight:bold}
    .xl-dc td.uf{background:#E8F5E9}
    .xt{border-collapse:collapse;width:100%;font-size:7pt;margin-top:8pt;table-layout:fixed}
    .xt th{background:#7030A0;color:#fff!important;border:0.7px solid #333;padding:2pt;text-align:center;vertical-align:middle;font-size:7pt}
    .xt th.sub{background:#8E44AD;font-size:6.4pt}
    .xt td{border:0.5px solid #888;padding:2pt;text-align:center;font-size:7pt}
    .xt td.room{background:#FFF9C4;font-weight:bold;text-align:left;padding-left:4pt}
    .xt td.floor{background:#BDD7EE;font-weight:bold}
    .xt td.fresh{background:#C6EFCE;font-weight:600}
    .xt td.res{background:#FFC000;font-weight:bold}
    .xt tr.total td{background:#DDEBF7;font-weight:bold;border-top:1.5px solid #333}
    .xt tr.total td.res{background:#FFC000}
    .sum-title{background:#1565C0;color:#fff;font-weight:bold;text-align:center;padding:6pt;font-size:11pt;margin-top:14pt}
    .sum{display:grid;grid-template-columns:repeat(4,1fr);border:1.2px solid #333;border-top:none}
    .sum>div{border-right:1px solid #ccc;border-bottom:1px solid #ccc;padding:8pt;text-align:center;background:#fff}
    .sum>div:nth-child(4n){border-right:none}
    .sum-v{font-size:16pt;font-weight:bold;color:#1565C0;line-height:1.1}
    .sum-l{font-size:8pt;color:#555;margin-top:3pt}
    .foot{border-top:1px solid #333;padding-top:4pt;font-size:7pt;color:#555;text-align:center;margin-top:10pt}
    @media print {
      .no-print { display: none !important; }
    }
  `;

  const buildExcelPrintHTML = () => {
    const dataRows = roomCalcs.map(({room:rm,calc:c}: any, idx: number) => `
      <tr>
        <td>${idx+1}</td>
        <td class="floor">${proj.name.substring(0,12)}</td>
        <td class="room">${rm.name}</td>
        <td>${fmt(rm.areaM2,1)}</td><td>${fmt(c.A,0)}</td>
        <td>${fmt(rm.ht,2)}</td><td>${fmt(c.H,1)}</td><td>${fmt(rm.glHt,2)}</td>
        <td>${rm.lpd}</td><td>${fmt(c.lW,0)}</td><td>${rm.occ}</td><td>${rm.eqpd}</td><td>${fmt(c.eW,0)}</td>
        ${DIRS.map(d=>`<td>${rm.grossWall[d]||0}</td>`).join("")}
        ${DIRS.map(d=>`<td>${rm.glass[d]||0}</td>`).join("")}
        <td>${rm.other.part||0}</td><td>${rm.other.roof||0}</td>
        <td class="fresh">${factors.cfmP}</td><td class="fresh">${factors.cfmSF}</td><td class="fresh">${fmt(c.oaCFM,0)}</td>
        <td>${fmt(c.stS,0)}</td><td>${fmt(c.stL,0)}</td>
        <td class="res">${fmt(c.TR,1)}</td><td class="res">${fmtI(c.SCFM)}</td>
        <td class="res">${fmt(c.HP,1)}</td><td class="res">${fmt(c.cfmSF,1)}</td><td class="res">${fmtI(c.sqFTtr)}</td>
      </tr>
    `).join("");

    return `
    <div class="xl-top">
      <div><strong>Project:</strong> ${proj.name}<br/><strong>Area:</strong> ${proj.addr||"—"}<br/><strong>Element:</strong> Cooling Load Room Data Sheet</div>
      <div><strong>Prepared:</strong> ${proj.by||"—"}<br/><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}<br/><strong>Peak:</strong> ${proj.peak}</div>
      <div><strong>Doc No:</strong> —<br/><strong>Rev:</strong> R0<br/><strong>Rooms:</strong> ${rooms.length}</div>
      <div>
        <div class="xl-dctitle">DESIGN CONDITIONS & U-FACTORS</div>
        <table class="xl-dc">
          <tr><th></th><th>DBT</th><th>%RH</th><th>WBT</th><th>Gr/lb</th><th>U-Wall</th><th>Roof</th><th>Solar</th></tr>
          <tr><td>Out</td><td>${design.oDBT}</td><td>${design.oRH}</td><td>${design.oWBT}</td><td>${design.oGr}</td>
            <td class="uf" rowspan="3">${factors.uWall}</td><td class="uf" rowspan="3">${factors.uRoof}</td><td class="uf" rowspan="3">${factors.sg}</td></tr>
          <tr><td>In</td><td>${design.iDBT}</td><td>${design.iRH}</td><td>${design.iWBT}</td><td>${design.iGr}</td></tr>
          <tr><td>Diff</td><td>${fmt(design.oDBT-design.iDBT,1)}</td><td>-</td><td>${fmt(design.oWBT-design.iWBT,1)}</td><td>${fmt(design.oGr-design.iGr,1)}</td></tr>
        </table>
      </div>
    </div>
    <table class="xt">
      <thead>
        <tr>
          <th rowspan="2" style="width:3%">Sr</th><th rowspan="2" style="width:6%">Floor</th><th rowspan="2" style="width:10%">Room</th>
          <th colspan="2">Area</th><th colspan="2">Slab Ht</th><th rowspan="2">GlHt</th>
          <th colspan="5">Internal Loads</th><th colspan="8">Wall Area</th><th colspan="8">Glass Area</th>
          <th rowspan="2">Part</th><th rowspan="2">Roof</th><th colspan="3">Fresh Air</th><th colspan="2">Heat Gain</th>
          <th rowspan="2">TR</th><th rowspan="2">DCFM</th><th rowspan="2">HP</th><th rowspan="2">CFM/ft²</th><th rowspan="2">ft²/TR</th>
        </tr>
        <tr>
          <th class="sub">m²</th><th class="sub">ft²</th><th class="sub">m</th><th class="sub">ft</th>
          <th class="sub">W/ft²</th><th class="sub">W</th><th class="sub">Occ</th><th class="sub">W/ft²</th><th class="sub">W</th>
          ${DIRS.map(d=>`<th class="sub">${d}</th>`).join("")}
          ${DIRS.map(d=>`<th class="sub">${d}</th>`).join("")}
          <th class="sub">CFM/p</th><th class="sub">CFM/ft²</th><th class="sub">TotOA</th>
          <th class="sub">Sens</th><th class="sub">Lat</th>
        </tr>
      </thead>
      <tbody>
        ${dataRows}
        <tr class="total">
          <td></td><td></td><td>Total</td>
          <td>${fmt(totals.areaM2,0)}</td><td>${fmt(totals.A,0)}</td>
          <td></td><td></td><td></td>
          <td></td><td>${fmt(totals.lW,0)}</td><td>${totals.occ}</td><td></td><td>${fmt(totals.eW,0)}</td>
          ${DIRS.map(()=>`<td></td>`).join("")}
          ${DIRS.map(()=>`<td></td>`).join("")}
          <td></td><td></td>
          <td class="fresh"></td><td class="fresh"></td><td class="fresh">${fmt(totals.oaCFM,0)}</td>
          <td>${fmt(totals.stS,0)}</td><td>${fmt(totals.stL,0)}</td>
          <td class="res">${fmt(totals.TR,1)}</td><td class="res">${fmtI(totals.SCFM)}</td>
          <td class="res">${fmt(totals.HP,1)}</td><td class="res">${fmt(totals.cfmSF,1)}</td><td class="res">${fmtI(totals.sqFTtr)}</td>
        </tr>
      </tbody>
    </table>
    <div class="sum-title">SUMMARY — ${rooms.length} Room(s)</div>
    <div class="sum">
      <div><div class="sum-v">${fmt(totals.TR,2)}</div><div class="sum-l">Total TR</div></div>
      <div><div class="sum-v">${fmtI(totals.SCFM)}</div><div class="sum-l">Total CFM</div></div>
      <div><div class="sum-v">${fmt(totals.HP,2)}</div><div class="sum-l">Total HP</div></div>
      <div><div class="sum-v">${fmt(totals.kW,2)}</div><div class="sum-l">Total kW</div></div>
      <div><div class="sum-v">${fmtI(totals.GT)}</div><div class="sum-l">Total BTU/hr</div></div>
      <div><div class="sum-v">${fmtI(totals.sqFTtr)}</div><div class="sum-l">ft²/TR</div></div>
      <div><div class="sum-v">${fmt(totals.cfmSF,3)}</div><div class="sum-l">CFM/ft²</div></div>
      <div><div class="sum-v">${rooms.length}</div><div class="sum-l">Total Rooms</div></div>
    </div>
    <div class="foot">CARRIER / ISHRAE Method · HeatLoad Calculator</div>`;
  };

  const buildSimplePrintHTML = () => {
    return `
      <div class="sum-title">SIMPLE METHOD — Heat Load</div>
      <div class="sum" style="grid-template-columns:repeat(3,1fr)">
        <div><div class="sum-v">${fmt(sc.TR,2)}</div><div class="sum-l">Total TR</div></div>
        <div><div class="sum-v">${fmtI(sc.SCFM)}</div><div class="sum-l">Total CFM</div></div>
        <div><div class="sum-v">${fmt(sc.kW,2)}</div><div class="sum-l">Total kW</div></div>
        <div><div class="sum-v">${fmt(sc.HP,2)}</div><div class="sum-l">Total HP</div></div>
        <div><div class="sum-v">${fmtI(sc.GT)}</div><div class="sum-l">Total BTU/hr</div></div>
        <div><div class="sum-v">${fmtI(sc.sqFTtr)}</div><div class="sum-l">ft²/TR</div></div>
      </div>
      <div class="foot">CARRIER / ISHRAE Method · Simple HeatLoad Calculator</div>
    `;
  };

  // ─────────────────────────────────────────────────────────
  // 📄 PDF MODAL — open in-app (no new window/tab)
  // ─────────────────────────────────────────────────────────
  const doPrint = () => {
    const html = mode==="excel" ? buildExcelPrintHTML() : buildSimplePrintHTML();
    const fullHTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>HeatLoad PDF</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>${PRINT_STYLES}</style></head><body>${html}</body></html>`;
    setPdfHTML(fullHTML);
  };

  // Back button closes modal (history sentinel trick)
  useEffect(() => {
    if (pdfHTML) {
      const handler = () => { setPdfHTML(null); };
      window.history.pushState({ pdfModal: true }, "");
      window.addEventListener("popstate", handler);
      return () => { window.removeEventListener("popstate", handler); };
    }
  }, [pdfHTML]);

  const closePdfModal = () => {
    if (window.history.state?.pdfModal) {
      window.history.back(); // triggers popstate → setPdfHTML(null)
    } else {
      setPdfHTML(null);
    }
  };

  // 🖨️ Print from modal — Desktop: iframe.print(), Mobile: use saveFileBrowser
  const printFromModal = () => {
    const iframe = document.getElementById("pdf-preview-iframe") as HTMLIFrameElement | null;
    if (!iframe?.contentWindow) return;
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (_) {
      window.print();
    }
  };

  // PDF download — real .pdf file, saved with the same base64 dataUrl pattern
  // used by your reference app for Android/Browser compatibility.
  const downloadPdf = async () => {
    showNotice("⏳ Preparing PDF file...", 60000);
    setTimeout(async () => {
      try {
        const { jsPDF } = await import("jspdf");
        const autoTableModule: any = await import("jspdf-autotable");
        const autoTable = autoTableModule.default || autoTableModule;
        const isFull = mode === "excel";
        const doc = new jsPDF({
          orientation: isFull ? "landscape" : "portrait",
          unit: "mm",
          format: isFull ? "a3" : "a4",
        });
        const filename = `HeatLoad_${mode}_${proj.name.replace(/\s+/g, "_")}.pdf`;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Heat Load Calculator", 14, 16);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Project: ${proj.name || "My Project"}`, 14, 23);
        doc.text(`Prepared By: ${proj.by || "-"}`, 14, 28);
        doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 14, 33);

        if (isFull) {
          doc.text(`Rooms: ${rooms.length} | Peak: ${proj.peak}`, 14, 38);
          doc.text(
            `Design: Outside ${design.oDBT}F DBT / ${design.oRH}%RH, Inside ${design.iDBT}F DBT / ${design.iRH}%RH`,
            14,
            43,
          );

          autoTable(doc, {
            startY: 49,
            head: [["#", "Room", "Area m2", "Area ft2", "Occ", "OA CFM", "Sensible", "Latent", "TR", "CFM", "HP", "kW", "ft2/TR"]],
            body: roomCalcs.map(({ room: r, calc: c }: any, i: number) => [
              i + 1,
              r.name,
              fmt(r.areaM2, 1),
              fmt(c.A, 0),
              r.occ,
              fmt(c.oaCFM, 0),
              fmt(c.stS, 0),
              fmt(c.stL, 0),
              fmt(c.TR, 2),
              fmtI(c.SCFM),
              fmt(c.HP, 1),
              fmt(c.kW, 1),
              fmtI(c.sqFTtr),
            ]),
            foot: [[
              "", "TOTAL", fmt(totals.areaM2, 1), fmt(totals.A, 0), totals.occ,
              fmt(totals.oaCFM, 0), fmt(totals.stS, 0), fmt(totals.stL, 0),
              fmt(totals.TR, 2), fmtI(totals.SCFM), fmt(totals.HP, 1), fmt(totals.kW, 1), fmtI(totals.sqFTtr),
            ]],
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [33, 150, 243], textColor: 255 },
            footStyles: { fillColor: [255, 192, 0], textColor: 20, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [245, 248, 252] },
            margin: { left: 14, right: 14 },
          });
        } else {
          autoTable(doc, {
            startY: 42,
            head: [["Input", "Value", "Input", "Value"]],
            body: [
              ["Floor Area", `${fmt(simAreaM2, 2)} m2`, "Floor Area", `${fmt(sc.A, 1)} ft2`],
              ["Outside", `${fmt(tDisp(sim.oTemp), 1)} ${tU}`, "Inside", `${fmt(tDisp(sim.iTemp), 1)} ${tU}`],
              ["Occupants", sim.occ, "Delta T", `${fmt(sc.dT, 1)} F`],
              ["Window", `${sim.winSF} ft2`, "Wall", `${sim.wallSF} ft2`],
            ],
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [33, 150, 243] },
          });

          autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [["Result", "Value"]],
            body: [
              ["Total Cooling", `${fmt(sc.TR, 2)} TR`],
              ["Supply Air", `${fmtI(sc.SCFM)} CFM`],
              ["Power", `${fmt(sc.kW, 2)} kW`],
              ["HP", `${fmt(sc.HP, 2)} HP`],
              ["Grand Total", `${fmtI(sc.GT)} BTU/hr`],
              ["ft2/TR", fmtI(sc.sqFTtr)],
            ],
            styles: { fontSize: 12, cellPadding: 4 },
            headStyles: { fillColor: [5, 150, 105] },
          });
        }

        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i += 1) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text("CARRIER / ISHRAE Method - HeatLoad Calculator", 14, doc.internal.pageSize.height - 8);
          doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 35, doc.internal.pageSize.height - 8);
        }

        const dataUrl = doc.output("datauristring");
        if (isCapacitorAndroid()) {
          await saveFileAndroid(dataUrl, filename, (msg: string) => showNotice(msg, 5000));
        } else {
          saveFileBrowser(dataUrl, filename);
          showNotice("✅ PDF downloaded! Check Downloads folder.", 5000);
        }
      } catch (e: any) {
        showNotice(`❌ PDF failed: ${e?.message ?? "Unknown error"}`, 6000);
      }
    }, 60);
  };

  // ── Styles ──
  const card: React.CSSProperties = { background:C.card, border:`1px solid ${C.cardB}`, borderRadius:20, overflow:"hidden", marginBottom:12, boxShadow:isDark?"none":"0 2px 8px rgba(0,0,0,0.05)" };
  const hdStyle = (o: boolean): React.CSSProperties => ({ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:C.hdBg, cursor:"pointer", borderBottom:o?`1px solid ${C.cardB}`:"none" });
  const inpStyle = (sm = false): React.CSSProperties => ({ padding:"8px 10px", fontSize:13, borderRadius:10, border:`1px solid ${C.inpB}`, background:C.inp, color:C.text, outline:"none", width:sm?100:"100%", boxSizing:"border-box" });
  const sel: React.CSSProperties = { padding:"8px 10px", fontSize:13, borderRadius:10, border:`1px solid ${C.inpB}`, background:C.inp, color:C.text, outline:"none", width:"100%", boxSizing:"border-box" };
  const pill = (a: boolean): React.CSSProperties => ({ padding:"5px 13px", borderRadius:9, border:"none", cursor:"pointer", fontSize:12, fontWeight:a?600:500, background:a?(isDark?"rgba(255,255,255,0.12)":"#ffffff"):"transparent", color:a?C.text:C.sub, boxShadow:a?(isDark?"0 1px 4px rgba(0,0,0,0.3)":"0 1px 4px rgba(0,0,0,0.1)"):"none" });
  const lbl: React.CSSProperties = { display:"block", fontSize:11, fontWeight:600, color:C.sub, marginBottom:4, letterSpacing:"0.03em" };
  const stitle: React.CSSProperties = { fontSize:10.5, fontWeight:700, color:C.sub, letterSpacing:"0.06em", textTransform:"uppercase", margin:"0 0 8px" };
  const divider: React.CSSProperties = { height:1, background:C.div, margin:"10px 0" };
  const g2: React.CSSProperties = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" };
  const g3: React.CSSProperties = { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:10 };
  const g4: React.CSSProperties = { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 };

  const rm = activeRoomData;
  const ec = activeCalc;
  const tempDisp = (f: number) => tempUnit==="C" ? F2C(f) : f;

  return (
    <div style={{padding:"20px 16px 40px",color:C.text,background:C.bg,minHeight:"100vh"}}>

      <div style={{marginBottom:14}}>
        <h1 style={{margin:0,fontSize:20,fontWeight:700,color:C.text,display:"flex",alignItems:"center",gap:8}}>🌡️ Heat Load Calculator</h1>
        <p style={{margin:"3px 0 0",fontSize:12,color:C.sub}}>HVAC Cooling Load — CARRIER / ISHRAE Method</p>
      </div>

      {/* Toggles + Buttons */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:12,fontWeight:600,color:C.sub}}>Temp</span>
            <div style={{display:"flex",background:C.pillBg,borderRadius:10,padding:3,gap:2}}>
              {["F","C"].map(u=>(<button key={u} style={pill(tempUnit===u)} onClick={()=>setTempUnit(u)}>°{u}</button>))}
            </div>
          </div>
          <div style={{display:"flex",background:C.pillBg,borderRadius:10,padding:3,gap:2}}>
            {[{v:"m2",l:"m²"},{v:"ft2",l:"ft²"}].map(o=>(<button key={o.v} style={pill(areaMode===o.v)} onClick={()=>setAreaMode(o.v)}>{o.l}</button>))}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button onClick={doPrint} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",background:isDark?"rgba(255,255,255,0.07)":"#F1F5F9",border:`1px solid ${C.cardB}`,color:C.text}}>🖨️ Print</button>
          <button onClick={mode==="excel"?exportExcel:exportSimpleExcel} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",background:C.greenBg,border:`1px solid ${C.greenB}`,color:C.green}}>📊 Excel</button>
          <button onClick={downloadPdf} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",background:C.orangeBg,border:`1px solid ${C.orangeB}`,color:C.orange}}>📄 PDF</button>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{display:"flex",background:isDark?"rgba(255,255,255,0.04)":"#E2E8F0",borderRadius:14,padding:4,gap:4,marginBottom:16,border:`1px solid ${C.cardB}`}}>
        {[{k:"excel",l:"Option 1 — Excel / CARRIER"},{k:"simple",l:"Option 2 — Simple"}].map(({k,l})=>(
          <button key={k} onClick={()=>setMode(k)} style={{flex:1,padding:"9px 4px",borderRadius:11,border:"none",cursor:"pointer",fontSize:12.5,fontWeight:mode===k?600:500,background:mode===k?(isDark?"rgba(255,255,255,0.1)":"#ffffff"):"transparent",color:mode===k?C.text:C.sub,boxShadow:mode===k?(isDark?"0 1px 5px rgba(0,0,0,0.3)":"0 1px 6px rgba(0,0,0,0.1)"):"none"}}>{l}</button>
        ))}
      </div>

      {mode==="excel" && (<>

        {/* ── ROOM TABS ── */}
        <div style={{...card,padding:"10px 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>🏠 Rooms ({rooms.length})</span>
            <button onClick={addRoom} style={{
              padding:"7px 14px",borderRadius:10,border:"none",cursor:"pointer",
              fontSize:12,fontWeight:600,background:C.blue,color:"#fff",
              display:"flex",alignItems:"center",gap:5,
            }}>➕ Add Room</button>
          </div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
            {rooms.map(r => (
              <div key={r.id} onClick={()=>setActiveRoom(r.id)} style={{
                padding:"8px 14px",borderRadius:12,cursor:"pointer",
                border:`1.5px solid ${activeRoom===r.id?C.blue:C.cardB}`,
                background:activeRoom===r.id?(isDark?"rgba(33,150,243,0.15)":"#DBEAFE"):C.card,
                color:activeRoom===r.id?C.blue:C.text,
                fontSize:12,fontWeight:activeRoom===r.id?600:400,
                whiteSpace:"nowrap",flexShrink:0,position:"relative",
                display:"flex",alignItems:"center",gap:8,
              }}>
                <span>{r.name}</span>
                <span style={{fontSize:10,color:C.muted}}>
                  {(() => { const c = roomCalcs.find(rc=>rc.room.id===r.id)?.calc; return c ? `${fmt(c.TR,1)} TR` : ""; })()}
                </span>
                {rooms.length > 1 && (
                  <span onClick={(e)=>{e.stopPropagation();deleteRoom(r.id);}} style={{
                    fontSize:14,color:C.red,cursor:"pointer",marginLeft:4,lineHeight:1,fontWeight:700,
                  }}>×</span>
                )}
              </div>
            ))}
          </div>
          <div style={{marginTop:8,display:"flex",gap:8}}>
            <button onClick={()=>duplicateRoom(activeRoom)} style={{
              padding:"5px 12px",borderRadius:8,border:`1px solid ${C.cardB}`,cursor:"pointer",
              fontSize:11,fontWeight:500,background:C.card,color:C.sub,
            }}>📋 Duplicate "{rm.name}"</button>
          </div>
        </div>

        {/* Project Info */}
        <div style={card}>
          <div style={hdStyle(openSections.proj)} onClick={()=>tog("proj")}>
            <span style={{fontSize:13,fontWeight:600}}>📋 Project Information</span>
            <span style={{fontSize:11,color:C.sub,transform:openSections.proj?"rotate(180deg)":"none",transition:"0.2s"}}>▾</span>
          </div>
          {openSections.proj && (
            <div style={{padding:"14px 16px"}}><div style={g2}>
              <Field label="Project Name" C={C}><TextInput value={proj.name} onChange={v=>setProj(p=>({...p,name:v}))} style={inpStyle()} /></Field>
              <Field label="Address" C={C}><TextInput value={proj.addr} onChange={v=>setProj(p=>({...p,addr:v}))} style={inpStyle()} /></Field>
              <Field label="Prepared By" C={C}><TextInput value={proj.by} onChange={v=>setProj(p=>({...p,by:v}))} style={inpStyle()} /></Field>
              <Field label="Peak Load At" C={C}><TextInput value={proj.peak} onChange={v=>setProj(p=>({...p,peak:v}))} style={inpStyle()} /></Field>
            </div></div>
          )}
        </div>

        {/* Design Conditions */}
        <div style={card}>
          <div style={hdStyle(openSections.design)} onClick={()=>tog("design")}>
            <span style={{fontSize:13,fontWeight:600}}>🌤️ Design Conditions</span>
            <span style={{fontSize:11,color:C.sub,transform:openSections.design?"rotate(180deg)":"none",transition:"0.2s"}}>▾</span>
          </div>
          {openSections.design && (
            <div style={{padding:"14px 16px"}}><div style={g2}>
              <div>
                <p style={stitle}>Outside</p>
                <Field label={`DBT (${tU})`} C={C}><NumInput value={tempDisp(design.oDBT)} onCommit={v=>upDesignT("oDBT",v)} style={inpStyle(true)} /></Field>
                <Field label="RH (%)" C={C}><NumInput value={design.oRH} onCommit={v=>upDesign("oRH",v)} style={inpStyle(true)} /></Field>
                <Field label={`WBT (${tU})`} C={C}><NumInput value={tempDisp(design.oWBT)} onCommit={v=>upDesignT("oWBT",v)} style={inpStyle(true)} /></Field>
                <Field label="Gr/lb" C={C}><NumInput value={design.oGr} onCommit={v=>upDesign("oGr",v)} style={inpStyle(true)} /></Field>
              </div>
              <div>
                <p style={stitle}>Inside</p>
                <Field label={`DBT (${tU})`} C={C}><NumInput value={tempDisp(design.iDBT)} onCommit={v=>upDesignT("iDBT",v)} style={inpStyle(true)} /></Field>
                <Field label="RH (%)" C={C}><NumInput value={design.iRH} onCommit={v=>upDesign("iRH",v)} style={inpStyle(true)} /></Field>
                <Field label={`WBT (${tU})`} C={C}><NumInput value={tempDisp(design.iWBT)} onCommit={v=>upDesignT("iWBT",v)} style={inpStyle(true)} /></Field>
                <Field label="Gr/lb" C={C}><NumInput value={design.iGr} onCommit={v=>upDesign("iGr",v)} style={inpStyle(true)} /></Field>
              </div>
            </div></div>
          )}
        </div>

        {/* U-Factors */}
        <div style={card}>
          <div style={hdStyle(openSections.factors)} onClick={()=>tog("factors")}>
            <span style={{fontSize:13,fontWeight:600}}>⚙️ U-Factors & Glass Parameters</span>
            <span style={{fontSize:11,color:C.sub,transform:openSections.factors?"rotate(180deg)":"none",transition:"0.2s"}}>▾</span>
          </div>
          {openSections.factors && (
            <div style={{padding:"14px 16px"}}><div style={g2}>
              <div>
                <p style={stitle}>U-Factors</p>
                {[["Exposed Walls","uWall"],["Partition","uPart"],["Roof","uRoof"],["Ceiling","uCeil"],["Floor","uFloor"]].map(([l,k])=>(
                  <Field key={k} label={l} C={C}><NumInput value={factors[k]} onCommit={v=>upFactors(k,v)} style={inpStyle(true)} /></Field>
                ))}
              </div>
              <div>
                <p style={stitle}>Glass & Air</p>
                <Field label="Solar Factor" C={C}><NumInput value={factors.sg} onCommit={v=>upFactors("sg",v)} style={inpStyle(true)} /></Field>
                <Field label="Trans. Factor" C={C}><NumInput value={factors.tg} onCommit={v=>upFactors("tg",v)} style={inpStyle(true)} /></Field>
                <Field label="Bypass Factor" C={C}><NumInput value={factors.bf} onCommit={v=>upFactors("bf",v)} style={inpStyle(true)} /></Field>
                <Field label={`ADP (${tU})`} C={C}><NumInput value={tempDisp(factors.adp)} onCommit={v=>upFactors("adp", tempUnit==="C"?C2F(v):v)} style={inpStyle(true)} /></Field>
                <Field label="OA CFM/Person" C={C}><NumInput value={factors.cfmP} onCommit={v=>upFactors("cfmP",v)} style={inpStyle(true)} /></Field>
                <Field label="OA CFM/ft²" C={C}><NumInput value={factors.cfmSF} onCommit={v=>upFactors("cfmSF",v)} style={inpStyle(true)} /></Field>
              </div>
            </div></div>
          )}
        </div>

        {/* Active Room Data */}
        <div style={{...card,border:`2px solid ${C.blue}`}}>
          <div style={{padding:"12px 16px",background:isDark?"rgba(33,150,243,0.1)":"#DBEAFE",borderBottom:`1px solid ${C.cardB}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:14,fontWeight:700,color:C.blue}}>🏠 {rm.name} — Room Data</span>
            <span style={{fontSize:11,color:C.sub}}>{fmt(rm.areaM2,1)} m² | {fmt(ec.A,0)} ft²</span>
          </div>
          <div style={{padding:"14px 16px"}}>
            <Field label="Room Name" C={C}><TextInput value={rm.name} onChange={v=>upRoom(rm.id,"name",v)} style={inpStyle()} /></Field>
            <div style={g2}>
              <Field label={`Floor Area (${areaMode==="ft2"?"ft²":"m²"})`} C={C}>
                <NumInput
                  value={areaMode==="ft2" ? rm.areaM2*M2FT2 : rm.areaM2}
                  onCommit={v=>upRoom(rm.id,"areaM2", areaMode==="ft2" ? v*FT2M2 : v)}
                  style={inpStyle(true)}
                />
              </Field>
              <Field label="Slab Height (m)" note={`= ${fmt(ec.H,2)} ft`} C={C}>
                <NumInput value={rm.ht} onCommit={v=>upRoom(rm.id,"ht",v)} style={inpStyle(true)} />
              </Field>
              <Field label="Glass Height (m)" C={C}><NumInput value={rm.glHt} onCommit={v=>upRoom(rm.id,"glHt",v)} style={inpStyle(true)} /></Field>
              <Field label="Occupants" C={C}><NumInput value={rm.occ} onCommit={v=>upRoom(rm.id,"occ",v)} style={inpStyle(true)} min={0} /></Field>
              <Field label="Lighting (W/ft²)" C={C}><NumInput value={rm.lpd} onCommit={v=>upRoom(rm.id,"lpd",v)} style={inpStyle(true)} /></Field>
              <Field label="Equipment (W/ft²)" C={C}><NumInput value={rm.eqpd} onCommit={v=>upRoom(rm.id,"eqpd",v)} style={inpStyle(true)} /></Field>
            </div>
            <div style={{marginBottom:10}}>
              <span style={lbl}>Space Type</span>
              <select style={sel} value={rm.spaceType} onChange={e=>upRoom(rm.id,"spaceType",e.target.value)}>
                {SPACE_TYPES.map(s=>(<option key={s.v} value={s.v}>{s.l} — {s.s}S/{s.lt}L</option>))}
              </select>
            </div>
            <div style={g2}>
              <Field label="People Sensible" suffix="BTU/hr·p" C={C}><NumInput value={rm.ps} onCommit={v=>upRoom(rm.id,"ps",v)} style={inpStyle(true)} /></Field>
              <Field label="People Latent" suffix="BTU/hr·p" C={C}><NumInput value={rm.pl} onCommit={v=>upRoom(rm.id,"pl",v)} style={inpStyle(true)} /></Field>
            </div>

            <div style={divider} />
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <p style={{...stitle,margin:0}}>🪟 Glass Areas (ft²)</p>
              <span style={{fontSize:11,color:C.muted}}>Total: {fmtI(ec.totGlass)} ft²</span>
            </div>
            <div style={g4}>
              {DIRS.map(dir=>(
                <div key={dir} style={{textAlign:"center"}}>
                  <label style={{...lbl,textAlign:"center"}}>{dir} <span style={{fontSize:10,color:C.muted}}>×{SOLAR[dir]}</span></label>
                  <NumInput value={rm.glass[dir]||0} onCommit={v=>upRoom(rm.id,`glass.${dir}`,v)} style={{...inpStyle(),textAlign:"center"}} min={0} />
                </div>
              ))}
            </div>

            <div style={divider} />
            <p style={{...stitle,margin:"0 0 8px"}}>🧱 Gross Wall Areas (ft²)</p>
            <div style={g4}>
              {DIRS.map(dir=>(
                <div key={dir} style={{textAlign:"center"}}>
                  <label style={{...lbl,textAlign:"center"}}>{dir} <span style={{fontSize:10,color:C.muted}}>net:{fmtI(ec.nw[dir])}</span></label>
                  <NumInput value={rm.grossWall[dir]||0} onCommit={v=>upRoom(rm.id,`grossWall.${dir}`,v)} style={{...inpStyle(),textAlign:"center"}} min={0} />
                </div>
              ))}
            </div>

            <div style={divider} />
            <p style={{...stitle,margin:"0 0 8px"}}>📐 Other Areas (ft²)</p>
            <div style={g2}>
              <Field label="Partition" C={C}><NumInput value={rm.other.part} onCommit={v=>upRoom(rm.id,"other.part",v)} style={inpStyle(true)} min={0} /></Field>
              <Field label="Roof" C={C}><NumInput value={rm.other.roof} onCommit={v=>upRoom(rm.id,"other.roof",v)} style={inpStyle(true)} min={0} /></Field>
              <Field label="Ceiling" C={C}><NumInput value={rm.other.ceil} onCommit={v=>upRoom(rm.id,"other.ceil",v)} style={inpStyle(true)} min={0} /></Field>
              <Field label="Floor" C={C}><NumInput value={rm.other.floor} onCommit={v=>upRoom(rm.id,"other.floor",v)} style={inpStyle(true)} min={0} /></Field>
            </div>
          </div>
        </div>

        <div style={{background:isDark?"rgba(33,150,243,0.06)":"#EFF6FF",border:`2px solid ${C.resBorder}`,borderRadius:20,padding:"16px 14px",marginTop:16}}>
          <h2 style={{margin:"0 0 12px",fontSize:15,fontWeight:600,color:C.blue}}>📊 {rm.name} — Results</h2>
          <div style={g3}>
            <Metric label="Cooling Load" value={fmt(ec.TR,2)} unit="TR" acc C={C} isDark={isDark} />
            <Metric label="Supply Air" value={fmtI(ec.SCFM)} unit="CFM" C={C} isDark={isDark} />
            <Metric label="Power" value={fmt(ec.kW,2)} unit="kW" C={C} isDark={isDark} />
          </div>
          <details style={{marginTop:10}}>
            <summary style={{cursor:"pointer",fontSize:13,color:C.sub,userSelect:"none",marginBottom:10}}>Show breakdown ▾</summary>
            <RRow label="Solar Gain" value={fmtI(ec.solarS)} unit="BTU/hr" bold C={C} />
            <RRow label="Wall Transmission" value={fmtI(ec.wallS)} unit="BTU/hr" C={C} />
            <RRow label="People (S+L)" value={fmtI(ec.pS+ec.pL)} unit="BTU/hr" C={C} />
            <RRow label="Lighting + Equipment" value={fmtI(ec.lG+ec.eG)} unit="BTU/hr" C={C} />
            <RRow label="Grand Total" value={fmtI(ec.GT)} unit="BTU/hr" bold C={C} />
            <RRow label="ESHF" value={fmt(ec.ESHF,3)} C={C} />
            <RRow label="OA CFM" value={fmt(ec.oaCFM,1)} unit="CFM" C={C} />
          </details>
        </div>

        {rooms.length > 1 && (
          <div style={{...card,marginTop:16}}>
            <div style={{padding:"12px 16px",background:C.hdBg,borderBottom:`1px solid ${C.cardB}`}}>
              <span style={{fontSize:13,fontWeight:600}}>📋 All Rooms Overview</span>
            </div>
            <div style={{padding:"10px 12px",overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{background:isDark?"rgba(255,255,255,0.05)":"#F1F5F9"}}>
                    <th style={{padding:"8px 6px",textAlign:"left",color:C.sub,fontWeight:600,borderBottom:`1px solid ${C.div}`}}>#</th>
                    <th style={{padding:"8px 6px",textAlign:"left",color:C.sub,fontWeight:600,borderBottom:`1px solid ${C.div}`}}>Room</th>
                    <th style={{padding:"8px 6px",textAlign:"right",color:C.sub,fontWeight:600,borderBottom:`1px solid ${C.div}`}}>Area ft²</th>
                    <th style={{padding:"8px 6px",textAlign:"right",color:C.sub,fontWeight:600,borderBottom:`1px solid ${C.div}`}}>TR</th>
                    <th style={{padding:"8px 6px",textAlign:"right",color:C.sub,fontWeight:600,borderBottom:`1px solid ${C.div}`}}>CFM</th>
                    <th style={{padding:"8px 6px",textAlign:"right",color:C.sub,fontWeight:600,borderBottom:`1px solid ${C.div}`}}>HP</th>
                    <th style={{padding:"8px 6px",textAlign:"right",color:C.sub,fontWeight:600,borderBottom:`1px solid ${C.div}`}}>kW</th>
                    <th style={{padding:"8px 6px",textAlign:"center",color:C.sub,fontWeight:600,borderBottom:`1px solid ${C.div}`}}></th>
                  </tr>
                </thead>
                <tbody>
                  {roomCalcs.map(({room:r,calc:c}: any, i: number) => (
                    <tr key={r.id} style={{background:r.id===activeRoom?(isDark?"rgba(33,150,243,0.08)":"#EFF6FF"):"transparent",cursor:"pointer"}} onClick={()=>setActiveRoom(r.id)}>
                      <td style={{padding:"6px",borderBottom:`1px solid ${C.div}`,color:C.text}}>{i+1}</td>
                      <td style={{padding:"6px",borderBottom:`1px solid ${C.div}`,color:C.text,fontWeight:r.id===activeRoom?600:400}}>{r.name}</td>
                      <td style={{padding:"6px",borderBottom:`1px solid ${C.div}`,textAlign:"right",color:C.text}}>{fmt(c.A,0)}</td>
                      <td style={{padding:"6px",borderBottom:`1px solid ${C.div}`,textAlign:"right",color:C.blue,fontWeight:600}}>{fmt(c.TR,2)}</td>
                      <td style={{padding:"6px",borderBottom:`1px solid ${C.div}`,textAlign:"right",color:C.text}}>{fmtI(c.SCFM)}</td>
                      <td style={{padding:"6px",borderBottom:`1px solid ${C.div}`,textAlign:"right",color:C.text}}>{fmt(c.HP,1)}</td>
                      <td style={{padding:"6px",borderBottom:`1px solid ${C.div}`,textAlign:"right",color:C.text}}>{fmt(c.kW,1)}</td>
                      <td style={{padding:"6px",borderBottom:`1px solid ${C.div}`,textAlign:"center"}}>
                        {rooms.length>1&&<span onClick={e=>{e.stopPropagation();deleteRoom(r.id);}} style={{color:C.red,cursor:"pointer",fontSize:14,fontWeight:700}}>×</span>}
                      </td>
                    </tr>
                  ))}
                  <tr style={{background:isDark?"rgba(255,255,255,0.06)":"#F1F5F9",fontWeight:700}}>
                    <td style={{padding:"8px 6px",borderTop:`2px solid ${C.blue}`}} colSpan={2}>TOTAL ({rooms.length} rooms)</td>
                    <td style={{padding:"8px 6px",borderTop:`2px solid ${C.blue}`,textAlign:"right"}}>{fmt(totals.A,0)}</td>
                    <td style={{padding:"8px 6px",borderTop:`2px solid ${C.blue}`,textAlign:"right",color:C.blue}}>{fmt(totals.TR,2)}</td>
                    <td style={{padding:"8px 6px",borderTop:`2px solid ${C.blue}`,textAlign:"right"}}>{fmtI(totals.SCFM)}</td>
                    <td style={{padding:"8px 6px",borderTop:`2px solid ${C.blue}`,textAlign:"right"}}>{fmt(totals.HP,1)}</td>
                    <td style={{padding:"8px 6px",borderTop:`2px solid ${C.blue}`,textAlign:"right"}}>{fmt(totals.kW,1)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </>)}

      {mode==="simple" && (<>
        <div style={card}>
          <div style={{padding:"12px 16px",background:C.hdBg,borderBottom:`1px solid ${C.cardB}`}}>
            <span style={{fontSize:13,fontWeight:600}}>🏠 Room Basics</span>
          </div>
          <div style={{padding:"14px 16px"}}>
            <div style={g2}>
              <Field label={`Floor Area (${areaMode==="ft2"?"ft²":"m²"})`} C={C}>
                <NumInput
                  value={areaMode==="ft2" ? simAreaM2*M2FT2 : simAreaM2}
                  onCommit={v=>setSim((p: any) => ({...p, areaM2: areaMode==="ft2" ? v*FT2M2 : v}))}
                  style={inpStyle(true)}
                />
              </Field>
              <Field label="Height (m)" C={C}><NumInput value={sim.ht} onCommit={v=>setSim((p: any) => ({...p,ht:v}))} style={inpStyle(true)} /></Field>
              <Field label="Occupants" C={C}><NumInput value={sim.occ} onCommit={v=>setSim((p: any) => ({...p,occ:v}))} style={inpStyle(true)} min={0} /></Field>
              <Field label="Lighting W/ft²" C={C}><NumInput value={sim.lpd} onCommit={v=>setSim((p: any) => ({...p,lpd:v}))} style={inpStyle(true)} /></Field>
              <Field label="Equipment W/ft²" C={C}><NumInput value={sim.eqpd} onCommit={v=>setSim((p: any) => ({...p,eqpd:v}))} style={inpStyle(true)} /></Field>
              <Field label={`Outside (${tU})`} C={C}><NumInput value={tempDisp(sim.oTemp)} onCommit={v=>setSim((p: any) => ({...p,oTemp: tempUnit==="C"?C2F(v):v}))} style={inpStyle(true)} /></Field>
              <Field label={`Inside (${tU})`} C={C}><NumInput value={tempDisp(sim.iTemp)} onCommit={v=>setSim((p: any) => ({...p,iTemp: tempUnit==="C"?C2F(v):v}))} style={inpStyle(true)} /></Field>
              <Field label="Window ft²" C={C}><NumInput value={sim.winSF} onCommit={v=>setSim((p: any) => ({...p,winSF:v}))} style={inpStyle(true)} min={0} /></Field>
              <Field label="Wall ft²" C={C}><NumInput value={sim.wallSF} onCommit={v=>setSim((p: any) => ({...p,wallSF:v}))} style={inpStyle(true)} min={0} /></Field>
              <Field label="Roof ft²" C={C}><NumInput value={sim.roofSF} onCommit={v=>setSim((p: any) => ({...p,roofSF:v}))} style={inpStyle(true)} min={0} /></Field>
            </div>
          </div>
        </div>
        <div style={{background:isDark?"rgba(33,150,243,0.06)":"#EFF6FF",border:`2px solid ${C.resBorder}`,borderRadius:20,padding:"16px 14px",marginTop:16}}>
          <h2 style={{margin:"0 0 16px",fontSize:15,fontWeight:600,color:C.blue}}>📊 Quick Results</h2>
          <div style={g3}>
            <Metric label="Cooling Load" value={fmt(sc.TR,2)} unit="TR" acc C={C} isDark={isDark} />
            <Metric label="Supply Air" value={fmtI(sc.SCFM)} unit="CFM" C={C} isDark={isDark} />
            <Metric label="Power" value={fmt(sc.kW,2)} unit="kW" C={C} isDark={isDark} />
          </div>
        </div>
      </>)}

      {/* Final summary */}
      <div style={{
        background:isDark?"rgba(33,150,243,0.08)":"#EFF6FF",
        border:`2px solid ${C.blue}`,borderRadius:20,padding:"18px 18px",marginTop:24,
      }}>
        <h2 style={{margin:"0 0 14px",fontSize:16,fontWeight:700,color:C.blue,textAlign:"center"}}>
          📋 FINAL SUMMARY {mode==="excel" ? `— ${rooms.length} Room(s)` : "— Simple Method"}
        </h2>
        {mode==="excel" ? (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
            <Metric label="Total Cooling" value={fmt(totals.TR,2)} unit="TR" acc C={C} isDark={isDark} />
            <Metric label="Total Supply Air" value={fmtI(totals.SCFM)} unit="CFM" C={C} isDark={isDark} />
            <Metric label="Total Power" value={fmt(totals.kW,2)} unit="kW" C={C} isDark={isDark} />
            <Metric label="Total HP" value={fmt(totals.HP,2)} unit="HP" C={C} isDark={isDark} />
            <Metric label="Grand Total" value={fmtI(totals.GT)} unit="BTU/hr" C={C} isDark={isDark} />
            <Metric label="Total Area" value={`${fmt(totals.areaM2,0)} m²`} unit={`${fmt(totals.A,0)} ft²`} C={C} isDark={isDark} />
            <Metric label="ft² / TR" value={fmtI(totals.sqFTtr)} unit="rule of thumb" C={C} isDark={isDark} />
            <Metric label="Rooms" value={rooms.length} unit="nos" C={C} isDark={isDark} />
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
            <Metric label="Cooling Load" value={fmt(sc.TR,2)} unit="TR" acc C={C} isDark={isDark} />
            <Metric label="Supply Air" value={fmtI(sc.SCFM)} unit="CFM" C={C} isDark={isDark} />
            <Metric label="Power" value={fmt(sc.kW,2)} unit="kW" C={C} isDark={isDark} />
            <Metric label="HP" value={fmt(sc.HP,2)} unit="HP" C={C} isDark={isDark} />
            <Metric label="Grand Total" value={fmtI(sc.GT)} unit="BTU/hr" C={C} isDark={isDark} />
            <Metric label="ft² / TR" value={fmtI(sc.sqFTtr)} unit="rule of thumb" C={C} isDark={isDark} />
          </div>
        )}
      </div>

      <p style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:16,lineHeight:1.5}}>
        CARRIER / ISHRAE method · Safety: 10% sensible, 5% latent · OA per ASHRAE 62.1
      </p>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 📄 PDF PREVIEW MODAL — fully mobile-friendly            */}
      {/* ═══════════════════════════════════════════════════════ */}
      {pdfHTML && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position:"fixed", inset:0, zIndex:9999,
            background:"rgba(0,0,0,0.75)",
            display:"flex", flexDirection:"column",
            paddingTop:"env(safe-area-inset-top, 0)",
            paddingBottom:"env(safe-area-inset-bottom, 0)",
          }}
        >
          {/* ── Top bar ── */}
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"10px 10px", background:"#1E293B", color:"#fff",
            boxShadow:"0 2px 10px rgba(0,0,0,0.4)", flexShrink:0, gap:6,
          }}>
            {/* Close — big & prominent */}
            <button
              onClick={closePdfModal}
              style={{
                display:"flex", alignItems:"center", gap:4,
                padding:"10px 16px", borderRadius:10, border:"none",
                background:"#DC2626", color:"#fff", fontSize:15, fontWeight:700,
                cursor:"pointer", flexShrink:0, minHeight:44,
              }}
            >
              ✕ Back
            </button>

            <span style={{fontSize:12, fontWeight:600, opacity:0.85, textAlign:"center", flex:1}}>📄 Print Preview</span>

            <div style={{display:"flex", gap:6, flexShrink:0}}>
              {/* Print / Open */}
              <button
                onClick={printFromModal}
                style={{
                  padding:"10px 12px", borderRadius:10, border:"none",
                  background:"#2196F3", color:"#fff", fontSize:13, fontWeight:600,
                  cursor:"pointer", minHeight:44,
                }}
              >
                🖨️ Print
              </button>
              {/* Save as PDF */}
              <button
                onClick={downloadPdf}
                style={{
                  padding:"10px 12px", borderRadius:10, border:"none",
                  background:"#059669", color:"#fff", fontSize:13, fontWeight:600,
                  cursor:"pointer", minHeight:44,
                }}
              >
                💾 PDF
              </button>
            </div>
          </div>

          {/* ── Mobile tip banner ── */}
          <div style={{
            padding:"7px 12px",
            background: isIOS() ? "#FEF3C7" : "#EFF6FF",
            color: isIOS() ? "#78350F" : "#1D4ED8",
            fontSize:11.5, textAlign:"center", flexShrink:0, lineHeight:1.5,
          }}>
            {isIOS()
              ? <>💡 Tap <b>🖨️ Print</b> → Share → <b>"Save to Files"</b> for PDF</>
              : isCapacitorAndroid()
                ? <>📱 Tap <b>💾 PDF</b> — file saves to <b>Downloads</b> folder automatically</>
                : <>💡 Tap <b>💾 PDF</b> to download the actual PDF file</>
            }
          </div>

          {/* ── Preview iframe ── */}
          <iframe
            id="pdf-preview-iframe"
            title="PDF Preview"
            srcDoc={pdfHTML}
            style={{
              flex:1, width:"100%", border:"none", background:"#fff",
              minHeight:0,
            }}
          />
        </div>
      )}

      {/* Toast / Notice */}
      {notice && (
        <div style={{
          position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          background:"#1E293B", color:"#fff", padding:"10px 18px", borderRadius:12,
          fontSize:13, fontWeight:500, boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
          zIndex:10000, maxWidth:"90vw", textAlign:"center",
        }}>
          {notice}
        </div>
      )}
    </div>
  );
}
