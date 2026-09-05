import { useEffect, useMemo, useState } from "react";

type PipeData = {
  size: string;
  od: number;
  id: number;
  wall: number;
  weight: number;
};

type FluidProps = {
  temp: number;
  density: number;
  mu: number;
  cp: number;
};

type PipeSizerProps = {
  theme: "dark" | "light"; // <-- Changed to match your app.tsx
};

const PIPE_DATABASE: Record<string, PipeData[]> = {
  "Sch 40 Steel": [
    { size: "½\"", od: 0.84, id: 0.622, wall: 0.109, weight: 0.851 },
    { size: "¾\"", od: 1.05, id: 0.824, wall: 0.113, weight: 1.131 },
    { size: "1\"", od: 1.315, id: 1.049, wall: 0.133, weight: 1.679 },
    { size: "1¼\"", od: 1.66, id: 1.38, wall: 0.14, weight: 2.273 },
    { size: "1½\"", od: 1.9, id: 1.61, wall: 0.145, weight: 2.718 },
    { size: "2\"", od: 2.375, id: 2.067, wall: 0.154, weight: 3.653 },
    { size: "2½\"", od: 2.875, id: 2.469, wall: 0.203, weight: 5.793 },
    { size: "3\"", od: 3.5, id: 3.068, wall: 0.216, weight: 7.576 },
    { size: "3½\"", od: 4.0, id: 3.548, wall: 0.226, weight: 9.109 },
    { size: "4\"", od: 4.5, id: 4.026, wall: 0.237, weight: 10.79 },
    { size: "5\"", od: 5.563, id: 5.047, wall: 0.258, weight: 14.62 },
    { size: "6\"", od: 6.625, id: 6.065, wall: 0.28, weight: 18.97 },
    { size: "8\"", od: 8.625, id: 7.981, wall: 0.322, weight: 28.55 },
    { size: "10\"", od: 10.75, id: 10.02, wall: 0.365, weight: 40.48 },
    { size: "12\"", od: 12.75, id: 11.938, wall: 0.406, weight: 53.52 },
    { size: "14\"", od: 14.0, id: 13.124, wall: 0.438, weight: 63.5 },
    { size: "16\"", od: 16.0, id: 15.0, wall: 0.5, weight: 82.77 },
    { size: "18\"", od: 18.0, id: 16.876, wall: 0.562, weight: 104.7 },
    { size: "20\"", od: 20.0, id: 18.812, wall: 0.594, weight: 123.1 },
    { size: "24\"", od: 24.0, id: 22.624, wall: 0.688, weight: 171.3 },
  ],
  "Sch 80 Steel": [
    { size: "½\"", od: 0.84, id: 0.546, wall: 0.147, weight: 1.088 },
    { size: "¾\"", od: 1.05, id: 0.742, wall: 0.154, weight: 1.474 },
    { size: "1\"", od: 1.315, id: 0.957, wall: 0.179, weight: 2.172 },
    { size: "1¼\"", od: 1.66, id: 1.278, wall: 0.191, weight: 2.997 },
    { size: "1½\"", od: 1.9, id: 1.5, wall: 0.2, weight: 3.631 },
    { size: "2\"", od: 2.375, id: 1.939, wall: 0.218, weight: 5.022 },
    { size: "2½\"", od: 2.875, id: 2.323, wall: 0.276, weight: 7.661 },
    { size: "3\"", od: 3.5, id: 2.9, wall: 0.3, weight: 10.25 },
    { size: "4\"", od: 4.5, id: 3.826, wall: 0.337, weight: 14.98 },
    { size: "5\"", od: 5.563, id: 4.813, wall: 0.375, weight: 20.78 },
    { size: "6\"", od: 6.625, id: 5.761, wall: 0.432, weight: 28.57 },
    { size: "8\"", od: 8.625, id: 7.625, wall: 0.5, weight: 43.39 },
    { size: "10\"", od: 10.75, id: 9.562, wall: 0.594, weight: 64.43 },
    { size: "12\"", od: 12.75, id: 11.374, wall: 0.688, weight: 88.63 },
  ],
  "Copper Type L": [
    { size: "½\"", od: 0.625, id: 0.545, wall: 0.04, weight: 0.285 },
    { size: "¾\"", od: 0.875, id: 0.785, wall: 0.045, weight: 0.455 },
    { size: "1\"", od: 1.125, id: 1.025, wall: 0.05, weight: 0.655 },
    { size: "1¼\"", od: 1.375, id: 1.265, wall: 0.055, weight: 0.884 },
    { size: "1½\"", od: 1.625, id: 1.505, wall: 0.06, weight: 1.14 },
    { size: "2\"", od: 2.125, id: 1.985, wall: 0.07, weight: 1.75 },
    { size: "2½\"", od: 2.625, id: 2.465, wall: 0.08, weight: 2.48 },
    { size: "3\"", od: 3.125, id: 2.945, wall: 0.09, weight: 3.33 },
    { size: "4\"", od: 4.125, id: 3.905, wall: 0.11, weight: 5.38 },
  ],
};

const FLUID_TABLE: FluidProps[] = [
  { temp: 40, density: 62.43, mu: 3.229e-5, cp: 1.004 },
  { temp: 50, density: 62.41, mu: 2.735e-5, cp: 1.002 },
  { temp: 60, density: 62.37, mu: 2.359e-5, cp: 1.000 },
  { temp: 70, density: 62.30, mu: 2.05e-5, cp: 0.998 },
  { temp: 80, density: 62.22, mu: 1.799e-5, cp: 0.997 },
  { temp: 90, density: 62.11, mu: 1.595e-5, cp: 0.996 },
  { temp: 100, density: 61.99, mu: 1.424e-5, cp: 0.995 },
  { temp: 120, density: 61.71, mu: 1.164e-5, cp: 0.994 },
  { temp: 140, density: 61.39, mu: 0.981e-5, cp: 0.994 },
  { temp: 180, density: 60.58, mu: 0.734e-5, cp: 0.996 },
];

const CHILLED_DATA = {
  four: [
    { size: "½\"", mm:12, gpm:2, tr24:0.7, tr267:0.7, v:1.9 },
    { size: "¾\"", mm:20, gpm:4, tr24:1.6, tr267:1.4, v:2.3 },
    { size: "1\"", mm:25, gpm:7, tr24:3.1, tr267:2.7, v:2.7 },
    { size: "1¼\"", mm:32, gpm:15, tr24:6.4, tr267:5.7, v:3.3 },
    { size: "1½\"", mm:40, gpm:23, tr24:9.7, tr267:8.6, v:3.7 },
    { size: "2\"", mm:50, gpm:45, tr24:19, tr267:17, v:4.4 },
    { size: "2½\"", mm:65, gpm:73, tr24:30, tr267:27, v:4.9 },
    { size: "3\"", mm:80, gpm:130, tr24:54, tr267:48, v:5.7 },
    { size: "4\"", mm:100, gpm:268, tr24:112, tr267:99, v:6.8 },
  ],
  five: [
    { size: "½\"", mm:12, gpm:2, tr24:0.8, tr267:0.7, v:2.1 },
    { size: "¾\"", mm:20, gpm:4, tr24:1.8, tr267:1.6, v:2.6 },
    { size: "1\"", mm:25, gpm:8, tr24:3.5, tr267:3.1, v:3.1 },
    { size: "1¼\"", mm:32, gpm:17, tr24:7, tr267:6, v:3.7 },
    { size: "1½\"", mm:40, gpm:26, tr24:11, tr267:10, v:4.1 },
    { size: "2\"", mm:50, gpm:51, tr24:21, tr267:19, v:4.9 },
    { size: "2½\"", mm:65, gpm:82, tr24:34, tr267:30, v:5.5 },
    { size: "3\"", mm:80, gpm:147, tr24:61, tr267:54, v:6.4 },
    { size: "4\"", mm:100, gpm:301, tr24:125, tr267:112, v:7.6 },
  ],
  vel: [
    { size: "5\"", mm:125, gpm:499, tr24:208, tr267:185, f:4.2 },
    { size: "6\"", mm:150, gpm:721, tr24:300, tr267:267, f:3.3 },
    { size: "8\"", mm:200, gpm:1248, tr24:520, tr267:462, f:2.4 },
    { size: "10\"", mm:250, gpm:1967, tr24:820, tr267:729, f:1.8 },
    { size: "12\"", mm:300, gpm:2818, tr24:1174, tr267:1044, f:1.5 },
    { size: "14\"", mm:350, gpm:3436, tr24:1432, tr267:1273, f:1.3 },
    { size: "16\"", mm:400, gpm:4552, tr24:1897, tr267:1686, f:1.1 },
    { size: "18\"", mm:450, gpm:5824, tr24:2427, tr267:2157, f:1.0 },
    { size: "20\"", mm:500, gpm:7253, tr24:3022, tr267:2686, f:0.8 },
    { size: "24\"", mm:600, gpm:10593, tr24:4414, tr267:3923, f:0.7 },
    { size: "28\"", mm:700, gpm:14533, tr24:6056, tr267:5383, f:0.6 },
    { size: "30\"", mm:750, gpm:16745, tr24:6977, tr267:6202, f:0.5 },
  ]
};

const CONDENSER_DATA = {
  four: [
    { size: "½\"", mm:12, gpm:1, tr3:0.4, tr35:0.3, v:1.6 },
    { size: "¾\"", mm:20, gpm:3, tr3:0.9, tr35:0.8, v:2.1 },
    { size: "1\"", mm:25, gpm:6, tr3:2, tr35:1.7, v:2.4 },
    { size: "1¼\"", mm:32, gpm:11, tr3:3.7, tr35:3.2, v:2.8 },
    { size: "1½\"", mm:40, gpm:17, tr3:5.8, tr35:5, v:3.0 },
    { size: "2\"", mm:50, gpm:34, tr3:11, tr35:9.7, v:3.5 },
    { size: "2½\"", mm:65, gpm:63, tr3:21, tr35:18, v:4.2 },
    { size: "3\"", mm:80, gpm:97, tr3:32, tr35:28, v:4.6 },
    { size: "4\"", mm:100, gpm:200, tr3:67, tr35:57, v:5.4 },
    { size: "5\"", mm:125, gpm:365, tr3:122, tr35:104, v:6.2 },
    { size: "6\"", mm:150, gpm:580, tr3:193, tr35:166, v:6.9 },
  ],
  five: [
    { size: "½\"", mm:12, gpm:1, tr3:0.4, tr35:0.3, v:1.9 },
    { size: "¾\"", mm:20, gpm:3, tr3:1.1, tr35:0.9, v:2.3 },
    { size: "1\"", mm:25, gpm:7, tr3:2.3, tr35:1.9, v:2.8 },
    { size: "1¼\"", mm:32, gpm:12, tr3:4.2, tr35:3.6, v:2.9 },
    { size: "1½\"", mm:40, gpm:19, tr3:6.3, tr35:5.4, v:3.5 },
    { size: "2\"", mm:50, gpm:38, tr3:13, tr35:11, v:4.0 },
    { size: "2½\"", mm:65, gpm:70, tr3:23, tr35:20, v:4.7 },
    { size: "3\"", mm:80, gpm:115, tr3:38, tr35:33, v:5.0 },
    { size: "4\"", mm:100, gpm:225, tr3:75, tr35:64, v:5.9 },
    { size: "5\"", mm:125, gpm:400, tr3:133, tr35:114, v:7.2 },
    { size: "6\"", mm:150, gpm:650, tr3:217, tr35:186, v:7.8 },
  ],
  vel: [
    { size: "8\"", mm:200, gpm:1275, tr3:425, tr35:364, f:4.1 },
    { size: "10\"", mm:250, gpm:1950, tr3:650, tr35:557, f:3.35 },
    { size: "12\"", mm:300, gpm:2800, tr3:933, tr35:800, f:2.61 },
    { size: "14\"", mm:350, gpm:3450, tr3:1150, tr35:986, f:2.35 },
    { size: "16\"", mm:400, gpm:4400, tr3:1467, tr35:1257, f:2.05 },
    { size: "18\"", mm:450, gpm:5700, tr3:1900, tr35:1629, f:1.7 },
    { size: "20\"", mm:500, gpm:7000, tr3:2333, tr35:2000, f:1.56 },
    { size: "24\"", mm:600, gpm:10000, tr3:3333, tr35:2857, f:1.35 },
  ]
};

export default function PipeSizer({ theme }: PipeSizerProps) {
  // Convert your theme string to boolean for internal use
  const dark = theme === "dark";

  const [tab, setTab] = useState<"mcquay" | "chart">("mcquay");

  // McQuay state
  const [pipeType, setPipeType] = useState("Sch 40 Steel");
  const [pipeSize, setPipeSize] = useState("½\"");
  const [fluidTemp, setFluidTemp] = useState(50);
  const [gpm, setGpm] = useState(1.4);
  const [manualGpm, setManualGpm] = useState("1.4");

  useEffect(() => {
    setManualGpm(gpm.toString());
  }, [gpm]);

  const handleManualGpmChange = (val: string) => {
    setManualGpm(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setGpm(num);
    }
  };

  // Chart state
  const [chartType, setChartType] = useState<"chilled" | "condenser">("chilled");
  const [chartGpm, setChartGpm] = useState(45);
  const [criteria, setCriteria] = useState<"4" | "5" | "vel">("4");

  const pipe = useMemo(() => {
    return PIPE_DATABASE[pipeType].find(p => p.size === pipeSize) || PIPE_DATABASE[pipeType][0];
  }, [pipeType, pipeSize]);

  const fluid = useMemo(() => FLUID_TABLE.find(f => f.temp === fluidTemp) || FLUID_TABLE[1], [fluidTemp]);

  const mcQuayCalc = useMemo(() => {
    const ID = pipe.id;
    const OD = pipe.od;
    const area_in2 = Math.PI * ID * ID / 4;
    const cross_in2 = Math.PI * (OD*OD - ID*ID) / 4;
    const I = Math.PI * (Math.pow(OD,4) - Math.pow(ID,4)) / 64;
    const Z = I / (OD/2);
    const rg = Math.sqrt(I / cross_in2);
    const velocity = gpm / (2.448 * ID * ID);
    const Dft = ID / 12;
    const rho_slug = fluid.density / 32.174;
    const Re = rho_slug * velocity * Dft / fluid.mu;
    const epsilon = pipeType.includes("Steel") ? 0.00015 : 0.000005;
    const relRough = epsilon / Dft;
    const f = Re < 2300 ? 64/Re : 0.25 / Math.pow(Math.log10(relRough/3.7 + 5.74/Math.pow(Re,0.9)), 2);
    const hf100 = f * (100/Dft) * (velocity*velocity/(2*32.2));
    const elbow = 2.0 * velocity*velocity/(2*32.2);
    const weightFluid = (area_in2/144) * fluid.density;
    const energyFactor = fluid.density * fluid.cp * 60 / 7.48052;

    return {
      outsideDiameter: OD,
      wallThickness: pipe.wall,
      insideDiameter: ID,
      insideArea: area_in2,
      crossArea: cross_in2,
      sectionModulus: Z,
      momentInertia: I,
      radiusGyration: rg,
      weightPipe: pipe.weight,
      weightTotal: pipe.weight + weightFluid,
      density: fluid.density,
      viscosity: fluid.mu * 32.174 * 3600,
      specificHeat: fluid.cp,
      energyFactor,
      velocity,
      reynolds: Re,
      friction: f,
      headLoss: hf100,
      elbowLoss: elbow,
    };
  }, [pipe, gpm, fluid, pipeType]);

  const pipeValidation = useMemo(() => {
    const nominalSize = parseFloat(pipeSize.replace(/[^\d.]/g, '')) || 0;
    const isSmallPipe = nominalSize <= 2;
    const velocity = mcQuayCalc.velocity;
    const headLoss = mcQuayCalc.headLoss;

    let status: "pass" | "fail" | "warning" = "pass";
    let message = "";
    let reason = "";

    if (isSmallPipe) {
      if (velocity > 4) {
        status = "fail";
        message = "REJECTED - Velocity Too High";
        reason = `Pipe ≤ 2": Velocity ${velocity.toFixed(2)} fps exceeds 4 fps limit`;
      } else if (velocity > 3.5) {
        status = "warning";
        message = "WARNING - Near Limit";
        reason = `Pipe ≤ 2": Velocity ${velocity.toFixed(2)} fps approaching 4 fps`;
      } else {
        message = "ACCEPTABLE - Good Design";
        reason = `Pipe ≤ 2": Velocity ${velocity.toFixed(2)} fps ≤ 4 fps ✓`;
      }
    } else {
      if (headLoss > 4) {
        status = "fail";
        message = "REJECTED - Friction Too High";
        reason = `Pipe > 2": Head loss ${headLoss.toFixed(2)} ft/100ft exceeds 4 ft/100ft limit`;
      } else if (headLoss > 3.5) {
        status = "warning";
        message = "WARNING - Near Limit";
        reason = `Pipe > 2": Head loss ${headLoss.toFixed(2)} ft/100ft approaching 4 ft/100ft`;
      } else {
        message = "ACCEPTABLE - Good Design";
        reason = `Pipe > 2": Head loss ${headLoss.toFixed(2)} ft/100ft ≤ 4 ft/100ft ✓`;
      }
    }

    return { status, message, reason, isSmallPipe, velocity, headLoss };
  }, [pipeSize, mcQuayCalc.velocity, mcQuayCalc.headLoss]);

  const chartResult = useMemo(() => {
    const data = chartType === "chilled" ? CHILLED_DATA : CONDENSER_DATA;
    const fourMatch = data.four.find(r => r.gpm >= chartGpm);
    const fiveMatch = data.five.find(r => r.gpm >= chartGpm);
    const velMatch = data.vel.find(r => r.gpm >= chartGpm);

    let bestMatch = fourMatch || fiveMatch || velMatch || data.four[data.four.length-1];
    let bestCriteria = "4";

    if (fourMatch && fourMatch.gpm >= chartGpm) {
      bestMatch = fourMatch;
      bestCriteria = "4";
    } else if (fiveMatch && fiveMatch.gpm >= chartGpm) {
      bestMatch = fiveMatch;
      bestCriteria = "5";
    } else if (velMatch) {
      bestMatch = velMatch;
      bestCriteria = "vel";
    }

    const list = criteria === "4" ? data.four : criteria === "5" ? data.five : data.vel;
    const found = list.find(r => r.gpm >= chartGpm) || list[list.length-1];

    return {
      ...found,
      autoBest: bestMatch,
      autoCriteria: bestCriteria,
      isAutoBetter: bestMatch.size !== found.size || bestCriteria !== criteria
    };
  }, [chartType, chartGpm, criteria]);

  return (
    <div className={`min-h-screen w-full font-[Outfit] transition-colors duration-500 ${dark ? "bg-[#050816] text-white" : "bg-[#f6f7fb] text-slate-900"}`}>
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className={`absolute inset-0 ${dark ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent"}`} />
        <div className="absolute top-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      {/* Header */}
      
<header 
  className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/10" 
  style={{paddingTop: 'env(safe-area-inset-top)'}}
>
  <div className={`mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 h-[60px] sm:h-[68px] flex items-center justify-between ${dark ? "bg-[#050816]/70" : "bg-white/70"}`}>
    
    {/* LEFT: Logo */}
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 blur opacity-70" />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 8h6M4 12h10M4 16h4M14 8h6M18 4v8M20 14c0 3-2.5 5-5 5s-5-2-5-5 2.5-5 5-5c1.5 0 2.8.6 3.7 1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <div className="hidden lg:block">
        <h1 className="text-[17px] font-semibold leading-tight tracking-wide">HVAC PipeSizer Pro</h1>
        <p className={`text-[11px] ${dark ? "text-white/60" : "text-slate-500"}`}>ASHRAE Standards • Fluid Dynamics</p>
      </div>
    </div>

    {/* CENTER: McQuay/L&T buttons */}
    <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full p-1 ${dark ? "bg-white/5 border border-white/10" : "bg-slate-900/5 border border-slate-900/10"}`}>
      {[
        {id:"mcquay", label:"Hydronic pipe Sizer", short:"McQuay"},
        {id:"chart", label:"Friction Loss Chart", short:"L&T"}
      ].map(t => (
        <button key={t.id} onClick={()=>setTab(t.id as any)} className={`px-3 py-1.5 text-[12px] sm:text-[13px] font-medium rounded-full transition-all whitespace-nowrap ${tab===t.id ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20" : dark ? "text-white/70 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>
          <span className="hidden md:inline">{t.label}</span>
          <span className="md:hidden">{t.short}</span>
        </button>
      ))}
    </div>

    {/* RIGHT: Empty space for app.tsx bell + theme controls */}
    <div className="w-11" />

  </div>
</header>

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-[110px] sm:pt-[88px] pb-24">
        {tab === "mcquay" ? (
          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
            {/* Controls */}
            <div className={`rounded-[28px] border ${dark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200"} backdrop-blur-2xl shadow-2xl shadow-black/5 p-6 lg:p-7 h-fit xl:sticky xl:top-[88px]`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-semibold tracking-tight">Hydronic PipeSizer</h2>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${dark ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>Darcy Engine & Colebrook v2</span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={`text-[12px] font-medium mb-1.5 block ${dark ? "text-white/70" : "text-slate-600"}`}>Pipe Material</label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.keys(PIPE_DATABASE).map(pt => (
                      <button key={pt} onClick={()=>{setPipeType(pt); setPipeSize(PIPE_DATABASE[pt][0].size);}} className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all text-[14px] ${pipeType===pt ? "bg-gradient-to-r from-violet-600/20 to-cyan-500/20 border-violet-500/50 text-violet-600 dark:text-violet-300" : dark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[12px] font-medium mb-1.5 block ${dark ? "text-white/70" : "text-slate-600"}`}>Pipe Size</label>
                    <select value={pipeSize} onChange={e=>setPipeSize(e.target.value)} className={`w-full px-3.5 py-2.5 rounded-xl border text-[14px] font-medium outline-none focus:ring-2 focus:ring-violet-500/50 transition ${dark ? "bg-[#0b1020] border-white/10" : "bg-white border-slate-300"}`}>
                      {PIPE_DATABASE[pipeType].map(p => <option key={p.size} value={p.size}>{p.size}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`text-[12px] font-medium mb-1.5 block ${dark ? "text-white/70" : "text-slate-600"}`}>Fluid Temp</label>
                    <select value={fluidTemp} onChange={e=>setFluidTemp(Number(e.target.value))} className={`w-full px-3.5 py-2.5 rounded-xl border text-[14px] font-medium outline-none focus:ring-2 focus:ring-violet-500/50 transition ${dark ? "bg-[#0b1020] border-white/10" : "bg-white border-slate-300"}`}>
                      {FLUID_TABLE.map(f => <option key={f.temp} value={f.temp}>{f.temp}°F Water</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-[12px] font-medium ${dark ? "text-white/70" : "text-slate-600"}`}>Flow Rate</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={manualGpm}
                        onChange={(e) => handleManualGpmChange(e.target.value)}
                        className={`w-20 px-2 py-1 rounded text-[13px] font-mono border text-right focus:outline-none focus:ring-1 focus:ring-violet-500 ${dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-300 text-slate-900"}`}
                      />
                      <span className="text-[12px] font-medium opacity-60">USgpm</span>
                    </div>
                  </div>
                  <input type="range" min="0.5" max="500" step="0.1" value={gpm} onChange={e=>setGpm(Number(e.target.value))} className="w-full accent-violet-600" />
                  <div className="mt-2 flex gap-2">
                    {[1.4, 5, 15, 45, 100].map(v=>(
                      <button key={v} onClick={()=>setGpm(v)} className={`px-2.5 py-1 rounded-lg text-[11px] border transition ${dark ? "border-white/10 hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"}`}>{v}</button>
                    ))}
                  </div>
                </div>

                <div className={`rounded-2xl p-4 border ${dark ? "bg-cyan-500/5 border-cyan-500/20" : "bg-cyan-50 border-cyan-200"}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    </div>
                    <div>
                      <p className="text-[12px] font-medium leading-snug">Darcy-Weisbach with Colebrook-White</p>
                      <p className={`text-[11px] mt-0.5 ${dark ? "text-white/60" : "text-slate-600"}`}>Based on standard Darcy-Weisbach & Colebrook-White equations. Includes roughness, Reynolds number, and fitting losses.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-5">
              {/* Validation Alert */}
              <div className={`rounded-[20px] border-2 p-4 backdrop-blur-xl ${
                pipeValidation.status === "pass"
                  ? dark ? "bg-emerald-500/10 border-emerald-500/40" : "bg-emerald-50 border-emerald-300"
                  : pipeValidation.status === "warning"
                  ? dark ? "bg-amber-500/10 border-amber-500/40" : "bg-amber-50 border-amber-300"
                  : dark ? "bg-red-500/10 border-red-500/40" : "bg-red-50 border-red-300"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-8 w-8 rounded-xl grid place-items-center flex-shrink-0 ${
                    pipeValidation.status === "pass" ? "bg-emerald-500/20 text-emerald-500" :
                    pipeValidation.status === "warning" ? "bg-amber-500/20 text-amber-500" :
                    "bg-red-500/20 text-red-500"
                  }`}>
                    {pipeValidation.status === "pass" ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    ) : pipeValidation.status === "warning" ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-[15px] font-bold ${
                        pipeValidation.status === "pass" ? "text-emerald-600 dark:text-emerald-400" :
                        pipeValidation.status === "warning" ? "text-amber-600 dark:text-amber-400" :
                        "text-red-600 dark:text-red-400"
                      }`}>{pipeValidation.message}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        pipeValidation.isSmallPipe
                          ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
                          : "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30"
                      }`}>
                        {pipeValidation.isSmallPipe ? "≤ 2\" PIPE" : "> 2\" PIPE"}
                      </span>
                    </div>
                    <p className={`text-[13px] mt-1 ${dark ? "text-white/80" : "text-slate-700"}`}>{pipeValidation.reason}</p>
                    <div className={`mt-2.5 pt-2.5 border-t ${dark ? "border-white/10" : "border-slate-200"} flex flex-wrap gap-x-4 gap-y-1 text-[11px]`}>
                      <span className={dark ? "text-white/60" : "text-slate-600"}><strong>Condition 1:</strong> Pipe ≤ 2" → Velocity ≤ 4 FPS</span>
                      <span className={dark ? "text-white/60" : "text-slate-600"}><strong>Condition 2:</strong> Pipe {'>'} 2" → Friction ≤ 4 ft/100ft</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top bar */}
              <div className={`rounded-[24px] border overflow-hidden ${dark ? "bg-[#0b1020]/80 border-white/10" : "bg-white border-slate-200"} backdrop-blur-xl shadow-xl`}>
                <div className={`flex items-center gap-4 px-5 py-3 border-b ${dark ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${gpm > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                    <span className="text-[13px] font-medium">{pipeType}</span>
                  </div>
                  <div className={`h-4 w-px ${dark ? "bg-white/10" : "bg-slate-300"}`} />
                  <span className="text-[13px]">{pipeSize}</span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-[13px] font-medium">{fluidTemp}°F Water</span>
                    <span className="text-[18px] font-mono font-semibold text-violet-500">{gpm.toFixed(1)}</span>
                    <span className="text-[12px] opacity-70">USgpm</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                  <div className="p-5 sm:p-6">
                    <h3 className={`text-[11px] uppercase tracking-widest font-semibold mb-4 ${dark ? "text-white/50" : "text-slate-500"}`}>Pipe Geometry</h3>
                    <div className="space-y-2.5 font-mono text-[13px]">
                      {[
                        ["Outside Diameter", mcQuayCalc.outsideDiameter.toFixed(3), "in"],
                        ["Wall Thickness", mcQuayCalc.wallThickness.toFixed(3), "in"],
                        ["Inside Diameter", mcQuayCalc.insideDiameter.toFixed(3), "in"],
                        ["Inside Area", mcQuayCalc.insideArea.toFixed(3), "in²", true],
                        ["Cross Section Area", mcQuayCalc.crossArea.toFixed(4), "in²", true],
                        ["Section Modulus", mcQuayCalc.sectionModulus.toFixed(5), "in³", true],
                        ["Moment of Inertia", mcQuayCalc.momentInertia.toFixed(4), "in⁴", true],
                        ["Radius Gyration", mcQuayCalc.radiusGyration.toFixed(4), "in", true],
                        ["Weight of Pipe", mcQuayCalc.weightPipe.toFixed(3), "lb/ft"],
                        ["Weight Pipe + Fluid", mcQuayCalc.weightTotal.toFixed(3), "lb/ft"],
                      ].map(([label, val, unit, red]) => (
                        <div key={label as string} className="flex justify-between items-baseline">
                          <span className={`${dark ? "text-white/70" : "text-slate-600"} font-[Outfit] text-[13px]`}>{label}</span>
                          <span className={`tabular-nums ${red ? "text-rose-500 dark:text-rose-400" : "text-violet-600 dark:text-violet-300"} font-medium`}>{val} <span className={`text-[11px] ${dark ? "text-white/50" : "text-slate-500"}`}>{unit}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className={`text-[11px] uppercase tracking-widest font-semibold mb-4 ${dark ? "text-white/50" : "text-slate-500"}`}>Fluid Dynamics</h3>
                    <div className="space-y-2.5 font-mono text-[13px]">
                      {[
                        ["Fluid density", mcQuayCalc.density.toFixed(3), "lb/ft³"],
                        ["Fluid viscosity", mcQuayCalc.viscosity.toFixed(4), "lb/ft·h"],
                        ["Specific Heat", mcQuayCalc.specificHeat.toFixed(3), "Btu/lb·°F"],
                        ["Energy factor", mcQuayCalc.energyFactor.toFixed(1), "Btu/h·°F·gpm"],
                      ].map(([l,v,u])=>(
                        <div key={l as string} className="flex justify-between">
                          <span className={`${dark ? "text-white/70" : "text-slate-600"} font-[Outfit]`}>{l}</span>
                          <span className="tabular-nums">{v} <span className={`text-[11px] ${dark ? "text-white/50" : "text-slate-500"}`}>{u}</span></span>
                        </div>
                      ))}
                      <div className={`h-px my-3 ${dark ? "bg-white/10" : "bg-slate-200"}`} />
                      {[
                        ["Fluid velocity", mcQuayCalc.velocity.toFixed(2), "ft/s", "text-cyan-500"],
                        ["Reynolds Number", Math.round(mcQuayCalc.reynolds).toLocaleString(), "", "text-cyan-500"],
                        ["Friction factor", mcQuayCalc.friction.toFixed(5), "", "text-amber-500"],
                        ["Head Loss", mcQuayCalc.headLoss.toFixed(3), "ft/100ft", "text-amber-500"],
                        ["Elbow loss", mcQuayCalc.elbowLoss.toFixed(3), "ft", "text-sky-500"],
                      ].map(([l,v,u,c])=>(
                        <div key={l as string} className="flex justify-between items-baseline">
                          <span className={`${dark ? "text-white/70" : "text-slate-600"} font-[Outfit]`}>{l}</span>
                          <span className={`tabular-nums font-semibold ${c}`}>{v} <span className={`text-[11px] font-normal ${dark ? "text-white/50" : "text-slate-500"}`}>{u}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {label:"Velocity", value: mcQuayCalc.velocity.toFixed(2), unit:"ft/s", good: mcQuayCalc.velocity>=2 && mcQuayCalc.velocity<=8, icon:"M13 10V3L4 14h7v7l9-11h-7z"},
                  {label:"Head Loss", value: mcQuayCalc.headLoss.toFixed(2), unit:"ft/100ft", good: mcQuayCalc.headLoss<=4, icon:"M19 14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4M12 3v12M8 7l4-4 4 4"},
                  {label:"Reynolds", value: (mcQuayCalc.reynolds/1000).toFixed(1)+"k", unit: mcQuayCalc.reynolds>4000?"Turbulent":"Laminar", good: mcQuayCalc.reynolds>4000, icon:"M3 15c4 0 4-6 8-6s4 6 8 6"},
                ].map(card => (
                  <div key={card.label} className={`relative overflow-hidden rounded-[22px] border p-5 ${dark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200"} backdrop-blur-xl`}>
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-2xl" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-[11px] uppercase tracking-wide font-medium ${dark ? "text-white/60" : "text-slate-500"}`}>{card.label}</p>
                        <p className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight">{card.value}</p>
                        <p className={`text-[12px] mt-1 ${dark ? "text-white/60" : "text-slate-500"}`}>{card.unit}</p>
                      </div>
                      <div className={`h-9 w-9 grid place-items-center rounded-xl ${card.good ? "bg-emerald-500/15 text-emerald-500" : "bg-amber-500/15 text-amber-500"}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={card.icon}/></svg>
                      </div>
                    </div>
                    <div className={`mt-3 h-1.5 w-full rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-slate-200"}`}>
                      <div className={`h-full rounded-full transition-all ${card.good ? "bg-emerald-500" : "bg-amber-500"}`} style={{width: card.label==="Velocity"? Math.min(100, mcQuayCalc.velocity/8*100)+"%" : card.label==="Head Loss"? Math.min(100, (4-mcQuayCalc.headLoss)/4*100+20)+"%" : "75%"}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
            {/* Controls */}
            <div className={`rounded-[28px] border ${dark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200"} backdrop-blur-2xl shadow-2xl p-6 lg:p-7 h-fit xl:sticky xl:top-[88px]`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[22px] font-semibold tracking-tight">Standard Quick Sizer</h2>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${dark ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>IS-STD</span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={`text-[12px] font-medium mb-1.5 block ${dark ? "text-white/70" : "text-slate-600"}`}>System Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {id:"chilled", label:"Chilled Water", color:"from-sky-600 to-cyan-500"},
                      {id:"condenser", label:"Condenser", color:"from-rose-600 to-orange-500"}
                    ].map(t => (
                      <button key={t.id} onClick={()=>setChartType(t.id as any)} className={`relative overflow-hidden rounded-xl border p-3 text-left transition-all ${chartType===t.id ? "border-transparent" : dark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-50"}`}>
                        {chartType===t.id && <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-15`} />}
                        <div className="relative">
                          <p className="text-[13px] font-medium">{t.label}</p>
                          <p className={`text-[11px] mt-0.5 ${dark ? "text-white/60" : "text-slate-500"}`}>{t.id==="chilled"?"2.4-2.67 gpm/TR":"3-3.5 gpm/TR"}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-[12px] font-medium ${dark ? "text-white/70" : "text-slate-600"}`}>Design Flow</label>
                    <span className="text-[12px] font-mono px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300">{chartGpm} USgpm</span>
                  </div>
                  <input type="range" min="1" max={chartType==="chilled"?2000:3000} step="1" value={chartGpm} onChange={e=>setChartGpm(Number(e.target.value))} className="w-full accent-amber-600" />
                  <input type="number" value={chartGpm} onChange={e=>setChartGpm(Number(e.target.value))} className={`mt-2 w-full px-3.5 py-2.5 rounded-xl border text-[14px] font-mono outline-none focus:ring-2 focus:ring-amber-500/50 ${dark ? "bg-[#0b1020] border-white/10" : "bg-white border-slate-300"}`} />
                </div>

                <div>
                  <label className={`text-[12px] font-medium mb-1.5 block ${dark ? "text-white/70" : "text-slate-600"}`}>Sizing Criteria</label>
                  <div className="space-y-2">
                    {[
                      {id:"4", label:"4 ft/100ft", desc:"Standard, ≤4\" (chilled) ≤6\" (cond)"},
                      {id:"5", label:"5 ft/100ft", desc:"Higher loss allowed"},
                      {id:"vel", label:"8 fps max", desc:"Velocity controlled ≥5\""},
                    ].map(c => (
                      <button key={c.id} onClick={()=>setCriteria(c.id as any)} className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all ${criteria===c.id ? "bg-amber-500/10 border-amber-500/50" : dark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[13px] font-medium">{c.label}</p>
                            <p className={`text-[11px] ${dark ? "text-white/60" : "text-slate-500"}`}>{c.desc}</p>
                          </div>
                          <div className={`h-4 w-4 rounded-full border-2 grid place-items-center ${criteria===c.id ? "border-amber-500" : dark ? "border-white/20" : "border-slate-300"}`}>
                            {criteria===c.id && <div className="h-2 w-2 rounded-full bg-amber-500" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Best Suggestion */}
                {chartResult.isAutoBetter && (
                  <div className={`rounded-xl p-3 border ${dark ? "bg-sky-500/10 border-sky-500/30" : "bg-sky-50 border-sky-200"}`}>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-500"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M18.4 18.4l2.83 2.83M2 12h4M18 12h4M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-semibold text-sky-600 dark:text-sky-400">Auto-Optimized Suggestion</p>
                        <p className={`text-[11px] mt-0.5 ${dark ? "text-white/70" : "text-slate-600"}`}>
                          For {chartGpm} GPM, best is <strong>{chartResult.autoBest.size}</strong> at {chartResult.autoCriteria === "4" ? "4" : chartResult.autoCriteria === "5" ? "5" : "8 fps"} criteria
                        </p>
                        <button
                          onClick={() => setCriteria(chartResult.autoCriteria as any)}
                          className="mt-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 transition"
                        >
                          Use {chartResult.autoCriteria === "4" ? "4 ft/100ft" : chartResult.autoCriteria === "5" ? "5 ft/100ft" : "8 fps"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Result card */}
                <div className={`rounded-2xl p-4 border-2 ${dark ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30" : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300"} relative overflow-hidden`}>
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <p className={`text-[11px] uppercase tracking-wide font-semibold ${dark ? "text-amber-300" : "text-amber-700"}`}>Recommended Size</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${dark ? "bg-amber-500/20 text-amber-300" : "bg-amber-200 text-amber-800"}`}>
                        {criteria === "4" ? "4 ft/100ft" : criteria === "5" ? "5 ft/100ft" : "8 FPS"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-[42px] font-bold leading-none tracking-tight">{chartResult.size}</span>
                      <span className={`text-[13px] ${dark ? "text-white/70" : "text-slate-600"}`}>{chartResult.mm} mm</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className={`rounded-xl p-2 ${dark ? "bg-black/20" : "bg-white/60"}`}>
                        <p className="text-[10px] opacity-70">Max Flow</p>
                        <p className="text-[15px] font-semibold">{chartResult.gpm}</p>
                      </div>
                      <div className={`rounded-xl p-2 ${dark ? "bg-black/20" : "bg-white/60"}`}>
                        <p className="text-[10px] opacity-70">{criteria==="vel"?"Friction":"Velocity"}</p>
                        <p className="text-[15px] font-semibold">{criteria==="vel"? (chartResult as any).f : (chartResult as any).v}</p>
                      </div>
                      <div className={`rounded-xl p-2 ${dark ? "bg-black/20" : "bg-white/60"}`}>
                        <p className="text-[10px] opacity-70">TR</p>
                        <p className="text-[15px] font-semibold">{chartType==="chilled"? (chartResult as any).tr24 : (chartResult as any).tr3}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Display */}
            <div className="space-y-5">
              <div className={`rounded-[28px] border overflow-hidden ${dark ? "bg-[#0b1020]/60 border-white/10" : "bg-white border-slate-200"} backdrop-blur-xl shadow-xl`}>
                {/* L&T Header */}
                <div className="bg-[#f7b500] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-black grid place-items-center">
                        <span className="text-[#f7b500] font-black text-[20px] leading-none">MEP</span>
                      </div>
                      <div>
                        <h3 className="text-black font-bold text-[15px] leading-tight">HYDRONIC PIPE SELECTION TABLE</h3>
                        <p className="text-black/70 text-[11px] font-medium">Standard Friction & Velocity Sizing Criteria</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-black/70">STD-HVAC-PIPE-{chartType==="chilled"?"001":"002"}</p>
                      <div className={`inline-block px-2.5 py-1 rounded text-[12px] font-bold text-white ${chartType==="chilled"?"bg-[#4a3d9c]":"bg-[#c41e3a]"}`}>{chartType==="chilled"?"Chilled water pipe sizing":"Condenser water pipe sizing"}</div>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className={`${dark ? "bg-white/5" : "bg-slate-50"} border-y ${dark ? "border-white/10" : "border-slate-200"}`}>
                        <th colSpan={2} className="px-3 py-2 text-left font-semibold">Pipe Size</th>
                        <th rowSpan={2} className="px-3 py-2 text-center font-semibold border-x border-inherit">Max Flow<br/>US gpm</th>
                        <th colSpan={2} className="px-3 py-2 text-center font-semibold border-x border-inherit">Ton of Refrigeration</th>
                        <th colSpan={2} className="px-3 py-2 text-center font-semibold">Velocity</th>
                      </tr>
                      <tr className={`${dark ? "bg-white/[0.02]" : "bg-slate-50/50"} border-b ${dark ? "border-white/10" : "border-slate-200"} text-[11px]`}>
                        <th className="px-3 py-1.5 font-medium">inches</th>
                        <th className="px-3 py-1.5 font-medium border-r border-inherit">mm</th>
                        <th className="px-2 py-1.5 font-medium">{chartType==="chilled"?"2.4 gpm/TR":"3 gpm/TR"}</th>
                        <th className="px-2 py-1.5 font-medium border-r border-inherit">{chartType==="chilled"?"2.67 gpm/TR":"3.5 gpm/TR"}</th>
                        <th className="px-2 py-1.5 font-medium">fps</th>
                        <th className="px-2 py-1.5 font-medium">m/s</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const data = chartType==="chilled"?CHILLED_DATA:CONDENSER_DATA;
                        const sections = [
                          {title: `Selection Based on Frictional Loss of 4 ft of Water / 100 ft (Pipe dia ≤ ${chartType==="chilled"?4:6} inches)`, rows: data.four},
                          {title: `Selection Based on Frictional Loss of 5 ft of Water / 100 ft (Pipe dia ≤ ${chartType==="chilled"?4:6} inches)`, rows: data.five},
                          {title: `Selection Based on Water Velocity Restricted to 8 fps (2.4 m/s) (Pipe dia ≥ ${chartType==="chilled"?5:8} inches)`, rows: data.vel, isVel:true},
                        ];
                        return sections.map((sec, si) => (
                          <>
                            <tr key={`h${si}`}>
                              <td colSpan={7} className="bg-[#f7b500] px-3 py-1.5 text-black font-bold text-[11px]">{sec.title}</td>
                            </tr>
                            {sec.rows.map((r, i) => {
                              const isActive = r.size===chartResult.size && (
                                (criteria==="4" && si===0) || (criteria==="5" && si===1) || (criteria==="vel" && si===2)
                              );
                              return (
                                <tr key={r.size+i} className={`border-b ${dark ? "border-white/5 hover:bg-white/[0.03]" : "border-slate-100 hover:bg-slate-50"} transition ${isActive ? (dark?"!bg-amber-500/15":"!bg-amber-100") : ""}`}>
                                  <td className="px-3 py-1.5 font-mono font-medium">{r.size}</td>
                                  <td className="px-3 py-1.5 font-mono border-r border-inherit">{r.mm}</td>
                                  <td className={`px-3 py-1.5 text-center font-mono font-semibold ${isActive?"text-amber-600 dark:text-amber-300":""}`}>{r.gpm}</td>
                                  <td className="px-2 py-1.5 text-center font-mono">{chartType==="chilled"?(r as any).tr24:(r as any).tr3}</td>
                                  <td className="px-2 py-1.5 text-center font-mono border-r border-inherit">{chartType==="chilled"?(r as any).tr267:(r as any).tr35}</td>
                                  <td className="px-2 py-1.5 text-center font-mono">{sec.isVel?"-":(r as any).v}</td>
                                  <td className="px-2 py-1.5 text-center font-mono text-[11px] opacity-70">{sec.isVel?"-":((r as any).v*0.3048).toFixed(1)}</td>
                                </tr>
                              );
                            })}
                          </>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <div className="bg-[#f7b500] px-4 py-1.5 text-right">
                  <span className="text-black text-[10px] font-semibold italic">Created by 'MAVENS'</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {label:"Design Standard", value:"ASHRAE 90.1", sub:"Max 4 ft/100ft"},
                  {label:"Velocity Limit", value:"2-8 fps", sub:"Erosion control"},
                  {label:"Pipe Material", value:"Sch 40 Steel", sub:"L&T EDRC"},
                ].map(i=>(
                  <div key={i.label} className={`rounded-2xl border p-4 ${dark ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200"}`}>
                    <p className={`text-[11px] ${dark ? "text-white/60" : "text-slate-500"}`}>{i.label}</p>
                    <p className="text-[18px] font-semibold mt-1">{i.value}</p>
                    <p className={`text-[11px] mt-0.5 ${dark ? "text-white/50" : "text-slate-500"}`}>{i.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile tab switch */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 sm:hidden">
          <div className={`flex items-center gap-1 rounded-full p-1 shadow-2xl backdrop-blur-2xl border ${dark ? "bg-[#0b1020]/90 border-white/20" : "bg-white/90 border-slate-200"}`}>
            <button onClick={()=>setTab("mcquay")} className={`px-4 py-2 rounded-full text-[13px] font-medium transition ${tab==="mcquay" ? "bg-violet-600 text-white" : ""}`}>McQuay</button>
            <button onClick={()=>setTab("chart")} className={`px-4 py-2 rounded-full text-[13px] font-medium transition ${tab==="chart" ? "bg-amber-500 text-black" : ""}`}>L&T Chart</button>
          </div>
        </div>
      </main>

      <footer className={`border-t ${dark ? "border-white/5" : "border-slate-200"} py-6 mt-12`}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className={`text-[12px] ${dark ? "text-white/50" : "text-slate-500"}`}>© 2026 HVAC Hub • Built for MEP Engineers</p>
          <div className="flex items-center gap-4 text-[12px]">
            <span className={dark ? "text-white/60" : "text-slate-600"}>ASHRAE Fundamentals</span>
            <span className={`h-1 w-1 rounded-full ${dark ? "bg-white/20" : "bg-slate-300"}`} />
            <span className={dark ? "text-white/60" : "text-slate-600"}>Fluid Dynamics Engine</span>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        * { font-variant-ligatures: common-ligatures; }
        html { scrollbar-gutter: stable; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${dark ? '#334155' : '#cbd5e1'}; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: ${dark ? '#475569' : '#94a3b8'}; }
        input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 999px; background: ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #06b6d4); border: 2px solid ${dark ? '#050816' : 'white'}; box-shadow: 0 2px 6px rgba(124,58,237,0.4); cursor: pointer; }
      `}</style>
    </div>
  );
}