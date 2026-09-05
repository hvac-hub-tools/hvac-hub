// @ts-nocheck
import { useState, useEffect, createContext, useContext } from "react";

const KF = `
@keyframes fanSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes pressPulse{ 0%,100%{opacity:.2} 50%{opacity:.6} }
@keyframes airSlide  { 0%{opacity:0;transform:translateY(-6px)} 15%{opacity:.9} 85%{opacity:.85} 100%{opacity:0;transform:translateY(170px)} }
@keyframes cardIn    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
* { box-sizing:border-box; }
input[type=number]::-webkit-inner-spin-button { opacity:.4 }
select { -webkit-appearance:none; appearance:none; }
::-webkit-scrollbar { width:4px }
::-webkit-scrollbar-thumb { background:rgba(100,150,200,.3); border-radius:4px }
`;

const DARK = {
  bg:'#060D1A', sf:'#0D1B2E', card:'#112038', bdr:'#1A2E4A',
  inp:'rgba(255,255,255,.045)', inpBdr:'#1A2E4A', inpTxt:'#E8EDF5',
  tx:'#E8EDF5', txS:'#8FA8BF', txM:'#3D5570',
  resBg:'rgba(255,255,255,.028)', togBg:'rgba(255,255,255,.06)',
  svgBg:'#040A15', svgFloor:'#1A2E4A', sh:'none', isDk:true,
};
const LITE = {
  bg:'#EDF2F7', sf:'#FFFFFF', card:'#FFFFFF', bdr:'#CAD9E8',
  inp:'#FFFFFF', inpBdr:'#B8CCD8', inpTxt:'#1A2840',
  tx:'#1A2840', txS:'#3A5268', txM:'#8AAFC6',
  resBg:'rgba(26,40,64,.04)', togBg:'rgba(26,40,64,.08)',
  svgBg:'#E2EBF6', svgFloor:'#C0D4E4', sh:'0 1px 4px rgba(0,0,0,.1)', isDk:false,
};
const A = { blue:'#3B9EDB', teal:'#00B8A9', orange:'#F59542', purple:'#8B7FF0', red:'#E55757', green:'#27C77A' };
const CFM_CONV = 2118.88;

const TC = createContext(DARK);
const useT = () => useContext(TC);

function sniffDark() {
  const h=document.documentElement,b=document.body;
  return h.classList.contains('dark')||b.classList.contains('dark')||
    h.getAttribute('data-theme')==='dark'||b.getAttribute('data-theme')==='dark'||
    h.getAttribute('data-color-scheme')==='dark'||b.getAttribute('data-color-scheme')==='dark'||
    h.getAttribute('data-bs-theme')==='dark';
}

// ─── CITY CLIMATE DATA ────────────────────────────────────────────────────────
// Sources:
//   Summer DBT  → ASHRAE Fundamentals 2021, Ch.14, Table 1 (0.4% design condition)
//   Winter DBT  → ASHRAE Fundamentals 2021, Ch.14, Table 1 (99.6% design condition)
//   Shaft Ts    → NBC 2016 Part 8 / ASHRAE default: 23–25°C conditioned space
//   Design ΔP   → NBC 2016 Cl.3.2.6.4 minimum 50 Pa; 68 Pa typical for tall bldgs
// All temperatures converted to Kelvin: K = °C + 273.15
const CITIES = [
  // ── INDIA ──
  { id:'mumbai',    name:'Mumbai',      country:'India',
    sum_To:308,  sum_Ts:303, sum_dPb:68.2,   // 35°C summer, 30°C shaft
    win_To:294,  win_Ts:299, win_dPb:50,      // 21°C winter, 26°C shaft
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'delhi',     name:'Delhi / NCR', country:'India',
    sum_To:315,  sum_Ts:303, sum_dPb:68.2,   // 42°C
    win_To:278,  win_Ts:296, win_dPb:50,      // 5°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'bengaluru', name:'Bengaluru',   country:'India',
    sum_To:306,  sum_Ts:301, sum_dPb:68.2,   // 33°C
    win_To:289,  win_Ts:296, win_dPb:50,      // 16°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'chennai',   name:'Chennai',     country:'India',
    sum_To:311,  sum_Ts:303, sum_dPb:68.2,   // 38°C
    win_To:297,  win_Ts:300, win_dPb:50,      // 24°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'kolkata',   name:'Kolkata',     country:'India',
    sum_To:313,  sum_Ts:303, sum_dPb:68.2,   // 40°C
    win_To:283,  win_Ts:296, win_dPb:50,      // 10°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'hyderabad', name:'Hyderabad',   country:'India',
    sum_To:313,  sum_Ts:303, sum_dPb:68.2,   // 40°C
    win_To:284,  win_Ts:296, win_dPb:50,      // 11°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'pune',      name:'Pune',        country:'India',
    sum_To:313,  sum_Ts:303, sum_dPb:68.2,   // 40°C
    win_To:284,  win_Ts:296, win_dPb:50,      // 11°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'ahmedabad', name:'Ahmedabad',   country:'India',
    sum_To:316,  sum_Ts:303, sum_dPb:68.2,   // 43°C
    win_To:279,  win_Ts:296, win_dPb:50,      // 6°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'jaipur',    name:'Jaipur',      country:'India',
    sum_To:317,  sum_Ts:303, sum_dPb:68.2,   // 44°C
    win_To:277,  win_Ts:296, win_dPb:50,      // 4°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'surat',     name:'Surat',       country:'India',
    sum_To:314,  sum_Ts:303, sum_dPb:68.2,   // 41°C
    win_To:289,  win_Ts:297, win_dPb:50,      // 16°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'lucknow',   name:'Lucknow',     country:'India',
    sum_To:316,  sum_Ts:303, sum_dPb:68.2,   // 43°C
    win_To:276,  win_Ts:296, win_dPb:50,      // 3°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'nagpur',    name:'Nagpur',      country:'India',
    sum_To:318,  sum_Ts:303, sum_dPb:68.2,   // 45°C
    win_To:281,  win_Ts:296, win_dPb:50,      // 8°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'bhopal',    name:'Bhopal',      country:'India',
    sum_To:316,  sum_Ts:303, sum_dPb:68.2,   // 43°C
    win_To:279,  win_Ts:296, win_dPb:50,      // 6°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'indore',    name:'Indore',      country:'India',
    sum_To:316,  sum_Ts:303, sum_dPb:68.2,   // 43°C
    win_To:280,  win_Ts:296, win_dPb:50,      // 7°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'kochi',     name:'Kochi',       country:'India',
    sum_To:308,  sum_Ts:303, sum_dPb:68.2,   // 35°C
    win_To:297,  win_Ts:300, win_dPb:50,      // 24°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  { id:'chandigarh',name:'Chandigarh',  country:'India',
    sum_To:315,  sum_Ts:303, sum_dPb:68.2,   // 42°C
    win_To:275,  win_Ts:296, win_dPb:50,      // 2°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NBC 2016' },
  // ── UAE / MIDDLE EAST ──
  { id:'dubai',     name:'Dubai',       country:'UAE',
    sum_To:319,  sum_Ts:296, sum_dPb:68.2,   // 46°C
    win_To:292,  win_Ts:296, win_dPb:50,      // 19°C
    ref:'ASHRAE 2021 Ch.14 Table-1' },
  { id:'abudhabi',  name:'Abu Dhabi',   country:'UAE',
    sum_To:320,  sum_Ts:296, sum_dPb:68.2,   // 47°C
    win_To:291,  win_Ts:296, win_dPb:50,      // 18°C
    ref:'ASHRAE 2021 Ch.14 Table-1' },
  { id:'riyadh',    name:'Riyadh',      country:'Saudi Arabia',
    sum_To:320,  sum_Ts:296, sum_dPb:68.2,   // 47°C
    win_To:281,  win_Ts:296, win_dPb:50,      // 8°C
    ref:'ASHRAE 2021 Ch.14 Table-1' },
  // ── SINGAPORE / SE ASIA ──
  { id:'singapore', name:'Singapore',   country:'Singapore',
    sum_To:307,  sum_Ts:299, sum_dPb:60,     // 34°C
    win_To:304,  win_Ts:299, win_dPb:50,      // 31°C (no real winter)
    ref:'ASHRAE 2021 Ch.14 Table-1 · BCA SS553' },
  { id:'kualalumpur',name:'Kuala Lumpur',country:'Malaysia',
    sum_To:307,  sum_Ts:299, sum_dPb:60,
    win_To:304,  win_Ts:299, win_dPb:50,
    ref:'ASHRAE 2021 Ch.14 Table-1' },
  // ── UK / EUROPE ──
  { id:'london',    name:'London',      country:'UK',
    sum_To:302,  sum_Ts:294, sum_dPb:60,     // 29°C summer
    win_To:269,  win_Ts:294, win_dPb:50,      // -4°C winter
    ref:'ASHRAE 2021 Ch.14 · CIBSE Guide A · BS EN 12101' },
  { id:'manchester',name:'Manchester',  country:'UK',
    sum_To:299,  sum_Ts:294, sum_dPb:60,
    win_To:267,  win_Ts:294, win_dPb:50,
    ref:'ASHRAE 2021 Ch.14 · CIBSE Guide A · BS EN 12101' },
  // ── USA ──
  { id:'newyork',   name:'New York',    country:'USA',
    sum_To:306,  sum_Ts:297, sum_dPb:68.2,
    win_To:262,  win_Ts:294, win_dPb:50,      // -11°C winter
    ref:'ASHRAE 2021 Ch.14 Table-1 · NFPA 92' },
  { id:'chicago',   name:'Chicago',     country:'USA',
    sum_To:306,  sum_Ts:297, sum_dPb:68.2,
    win_To:256,  win_Ts:294, win_dPb:50,      // -17°C
    ref:'ASHRAE 2021 Ch.14 Table-1 · NFPA 92' },
  { id:'losangeles',name:'Los Angeles', country:'USA',
    sum_To:309,  sum_Ts:297, sum_dPb:68.2,
    win_To:283,  win_Ts:297, win_dPb:50,
    ref:'ASHRAE 2021 Ch.14 Table-1 · NFPA 92' },
  // ── AUSTRALIA ──
  { id:'sydney',    name:'Sydney',      country:'Australia',
    sum_To:310,  sum_Ts:297, sum_dPb:68.2,
    win_To:280,  win_Ts:294, win_dPb:50,
    ref:'ASHRAE 2021 Ch.14 · AS 1668.1' },
  { id:'melbourne', name:'Melbourne',   country:'Australia',
    sum_To:313,  sum_Ts:297, sum_dPb:68.2,
    win_To:275,  win_Ts:294, win_dPb:50,
    ref:'ASHRAE 2021 Ch.14 · AS 1668.1' },
  { id:'custom',    name:'Custom / Manual', country:'',
    sum_To:308,  sum_Ts:303, sum_dPb:68.2,
    win_To:291,  win_Ts:296, win_dPb:50,
    ref:'' },
];

// Group cities by country
const COUNTRIES = [...new Set(CITIES.filter(c=>c.id!=='custom').map(c=>c.country))];

// ─── Velocity Table (BS 12101 / ASHRAE) ──────────────────────────────────────
function getDoorVelocity(openDoors) {
  if (openDoors===0) return 0.75;
  if (openDoors===1) return 2.0;
  return 0.75;
}

// ─── CALCULATION ENGINE ───────────────────────────────────────────────────────
function stairSimple({ dW=1.2,dH=2.4,isDouble=false,floors=10,openDoors=2,P=50,gapMm=3,safety=10 }) {
  const crack=isDouble?2*(2*dW+dH):2*(dW+dH);
  const AEd=crack*(gapMm/1000); const closed=Math.max(0,floors-openDoors); const AE=AEd*closed;
  const Q1=0.83*AE*Math.sqrt(P)*(1+safety/100);
  const Q2=dW*dH*(isDouble?2:1)*openDoors*.75*(1+safety/100); const Q=Q1+Q2;
  return { crack:+crack.toFixed(3),AEd:+AEd.toFixed(5),closed,AE:+AE.toFixed(4),
    Q1:+Q1.toFixed(3),Q2:+Q2.toFixed(3),Q:+Q.toFixed(3),
    cfm:Math.round(Q*CFM_CONV),cfmFloor:Math.round(Q*CFM_CONV/floors) };
}

function liftSimple({ dW=1.2,dH=2.3,floors=56,lifts=1,openDoors=1,P=50,gapMm=3,tVent=.36,safety=10 }) {
  const crack=2*(2*dW+dH); const AEd=crack*(gapMm/1000); const closed=(floors-openDoors)*lifts;
  const total=AEd*closed+tVent;
  const Q1=.83*total*Math.sqrt(P)*(1+safety/100); const Q2=dW*dH*openDoors*.75*(1+safety/100); const Q=Q1+Q2;
  return { crack:+crack.toFixed(3),AEd:+AEd.toFixed(5),closed,total:+total.toFixed(4),
    Q1:+Q1.toFixed(3),Q2:+Q2.toFixed(3),Q:+Q.toFixed(3),cfm:Math.round(Q*CFM_CONV) };
}

function calcStairStackSeason({ sPerim,bPerim,fH,floors,To,Ts,dPb,wSb,wBo,dW,dH,isDouble,cpf,openDoors }) {
  const Alsb=sPerim*fH; const Albo=bPerim*fH;
  const doorCrack=isDouble?(2*dW+dH)*2:(dW+dH)*2;
  const Adsb=doorCrack*0.002*cpf;
  const Asb=Alsb*wSb+Adsb; const Abo=Albo*wBo;
  const B=3460*(1/To-1/Ts); const y=floors*fH;
  const se=(B*y)/(1+Math.pow(Asb/Abo,2));
  const dPt=dPb+se;
  const dPb_abs=Math.abs(dPb),dPt_abs=Math.abs(dPt);
  let Ql=0;
  if (Math.abs(dPt_abs-dPb_abs)>0.001) {
    Ql=0.559*floors*Asb*((Math.pow(dPt_abs,1.5)-Math.pow(dPb_abs,1.5))/(dPt_abs-dPb_abs));
  } else { Ql=0.559*floors*Asb*Math.sqrt(dPb_abs); }
  const vel=getDoorVelocity(openDoors);
  const Qod=dW*dH*(isDouble?2:1)*openDoors*vel;
  const Qt=Ql+Qod; const Q_safe=Qt*1.10; const cfm=Math.round(Q_safe*CFM_CONV);
  return { B:+B.toFixed(5),se:+se.toFixed(3),dPt:+dPt.toFixed(3),
    Alsb:+Alsb.toFixed(2),Albo:+Albo.toFixed(2),
    Adsb:+Adsb.toFixed(5),Asb:+Asb.toFixed(6),Abo:+Abo.toFixed(5),vel:+vel.toFixed(2),
    Ql:+Ql.toFixed(4),Qod:+Qod.toFixed(4),Qt:+Qt.toFixed(4),Q_safe:+Q_safe.toFixed(4),
    cfm,season:B<0?'Summer':'Winter' };
}

function stairStack({ sPerim=21,bPerim=334,fH=3,floors=33,
  To_s=308,Ts_s=303,dPb_s=68.2,To_w=291.3,Ts_w=296.3,dPb_w=50,
  wSb=0.00011,wBo=0.00017,dW=1.2,dH=2.4,isDouble=false,cpf=1,openDoors=2 }) {
  const summer=calcStairStackSeason({sPerim,bPerim,fH,floors,To:To_s,Ts:Ts_s,dPb:dPb_s,wSb,wBo,dW,dH,isDouble,cpf,openDoors});
  const winter=calcStairStackSeason({sPerim,bPerim,fH,floors,To:To_w,Ts:Ts_w,dPb:dPb_w,wSb,wBo,dW,dH,isDouble,cpf,openDoors});
  const recommended=summer.cfm>=winter.cfm?'summer':'winter';
  const rec=recommended==='summer'?summer:winter;
  return { summer,winter,recommended,rec };
}

function calcLiftStackSeason({ lwPerim,bPerim,fH,floors,lifts,To,Ts,dPb,wLw,wBo,dW,dH,nDoors }) {
  const Alsb=lwPerim*fH; const Albo=bPerim*fH;
  const Adsb=(2/1000)*(dW*2+dH*3)*nDoors;
  const Asb=(Alsb*wLw+Adsb)*lifts; const Abo=Albo*wBo;
  const B=3460*(1/To-1/Ts); const y=floors*fH;
  const se=(B*y)/(1+Math.pow(Asb/Abo,2)); const dPt=dPb+se;
  const dPb_abs=Math.abs(dPb),dPt_abs=Math.abs(dPt);
  let Qt=0;
  if (Math.abs(dPt_abs-dPb_abs)>0.001) {
    Qt=0.559*floors*Asb*((Math.pow(dPt_abs,1.5)-Math.pow(dPb_abs,1.5))/(dPt_abs-dPb_abs));
  } else { Qt=0.559*floors*Asb*Math.sqrt(dPb_abs); }
  const Q_safe=Qt*1.10; const cfm=Math.round(Q_safe*CFM_CONV);
  return { B:+B.toFixed(5),se:+se.toFixed(3),dPt:+dPt.toFixed(3),
    Alsb:+Alsb.toFixed(2),Albo:+Albo.toFixed(2),
    Adsb:+Adsb.toFixed(5),Asb:+Asb.toFixed(6),Abo:+Abo.toFixed(5),
    Qt:+Qt.toFixed(4),Q_safe:+Q_safe.toFixed(4),cfm,season:B<0?'Summer':'Winter' };
}

function liftStack({ lwPerim=13,bPerim=334,fH=3,floors=33,lifts=1,
  To_s=308,Ts_s=303,dPb_s=67.1,To_w=291.33,Ts_w=296.33,dPb_w=50,
  wLw=0.00084,wBo=0.00017,dW=1,dH=2.1,nDoors=1 }) {
  const summer=calcLiftStackSeason({lwPerim,bPerim,fH,floors,lifts,To:To_s,Ts:Ts_s,dPb:dPb_s,wLw,wBo,dW,dH,nDoors});
  const winter=calcLiftStackSeason({lwPerim,bPerim,fH,floors,lifts,To:To_w,Ts:Ts_w,dPb:dPb_w,wLw,wBo,dW,dH,nDoors});
  const recommended=summer.cfm>=winter.cfm?'summer':'winter';
  const rec=recommended==='summer'?summer:winter;
  return { summer,winter,recommended,rec };
}

function calcLobby({ area=35.5,perim=41,h=3.5,reqP=30,wLeak=0.00011,fLeak=0.000052,
  nSvc=2,wSvc=.9,nApt=6,wApt=1.25,nSt=1,wSt=1.25,nLift=3,wLift=1.25,
  odW=1.25,odH=2.4,nOpen=1,sf=1.5 }) {
  const dl=(w,hh,n)=>2*(w+hh)*.002*n;
  const wA=perim*h*wLeak,fA=area*2*fLeak;
  const lSvc=dl(wSvc,2.4,nSvc),lApt=dl(wApt,2.4,nApt),lSt=dl(wSt,2.4,nSt),lLift=dl(wLift,2.4,nLift);
  const total=wA+fA+lSvc+lApt+lSt+lLift; const totalSf=total*sf;
  const Qp=.83*totalSf*Math.sqrt(Math.max(reqP,1)); const Qo=odW*odH*nOpen*.75; const Q=Qp+Qo;
  return { wA:+wA.toFixed(5),fA:+fA.toFixed(5),lSvc:+lSvc.toFixed(5),lApt:+lApt.toFixed(5),
    lSt:+lSt.toFixed(5),lLift:+lLift.toFixed(5),total:+total.toFixed(5),totalSf:+totalSf.toFixed(5),
    Qp:+Qp.toFixed(3),Qo:+Qo.toFixed(3),Q:+Q.toFixed(3),cfm:Math.round(Q*CFM_CONV) };
}

// ─── UI Primitives ─────────────────────────────────────────────────────────────
function NumIn({ label, val, set, unit, step=0.1, min=0, note, disabled=false }) {
  const C=useT(); const [f,sf]=useState(false);
  return (
    <div style={{marginBottom:11}}>
      <div style={{fontSize:9,color:C.txS,textTransform:'uppercase',letterSpacing:'.09em',fontWeight:600,marginBottom:4}}>{label}</div>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <input type="number" value={val} step={step} min={min} disabled={disabled}
          onChange={e=>set(parseFloat(e.target.value)||0)}
          onFocus={()=>sf(true)} onBlur={()=>sf(false)}
          style={{flex:1,minWidth:0,width:'100%',padding:'7px 10px',background:disabled?C.togBg:C.inp,
            border:`1px solid ${f&&!disabled?A.blue:C.inpBdr}`,
            borderRadius:7,color:disabled?C.txM:C.inpTxt,fontSize:13,outline:'none',transition:'border .15s',
            boxShadow:f&&!disabled?`0 0 0 2px ${A.blue}25`:'none',opacity:disabled?.6:1}}/>
        {unit&&<span style={{color:C.txM,fontSize:9,minWidth:28,textAlign:'right'}}>{unit}</span>}
      </div>
      {note&&<div style={{fontSize:8.5,color:C.txM,marginTop:3}}>{note}</div>}
    </div>
  );
}

function SelIn({ label, val, set, opts }) {
  const C=useT();
  return (
    <div style={{marginBottom:11}}>
      <div style={{fontSize:9,color:C.txS,textTransform:'uppercase',letterSpacing:'.09em',fontWeight:600,marginBottom:4}}>{label}</div>
      <select value={val} onChange={e=>set(parseFloat(e.target.value))}
        style={{width:'100%',padding:'7px 10px',background:C.isDk?C.card:C.inp,
          border:`1px solid ${C.inpBdr}`,borderRadius:7,color:C.tx,fontSize:11,outline:'none',cursor:'pointer'}}>
        {opts.map(o=><option key={o.v} value={o.v} style={{background:C.isDk?'#0D1B2E':'#fff',color:C.isDk?'#E8EDF5':'#1A2840'}}>{o.l}</option>)}
      </select>
    </div>
  );
}

function ResCard({ label, val, unit, hi, xl }) {
  const C=useT();
  return (
    <div style={{background:hi?`${A.blue}0D`:C.resBg,border:`1px solid ${hi?A.blue+'40':C.bdr}`,
      borderRadius:8,padding:'8px 11px',marginBottom:6}}>
      <div style={{fontSize:8,color:C.txM,textTransform:'uppercase',letterSpacing:'.09em',marginBottom:2}}>{label}</div>
      <div style={{display:'flex',alignItems:'baseline',gap:5}}>
        <span style={{color:hi?A.blue:C.tx,fontSize:xl?22:14,fontWeight:xl?800:600,fontVariantNumeric:'tabular-nums'}}>
          {typeof val==='number'?val.toLocaleString():val}
        </span>
        {unit&&<span style={{color:C.txM,fontSize:8}}>{unit}</span>}
      </div>
    </div>
  );
}

function SecHdr({ label, accent=A.blue }) {
  return <div style={{fontSize:9,color:accent,textTransform:'uppercase',letterSpacing:'.1em',fontWeight:700,
    marginBottom:8,marginTop:4,borderLeft:`2px solid ${accent}`,paddingLeft:7}}>{label}</div>;
}

function TabBar({ tabs, active, set }) {
  const C=useT();
  return (
    <div style={{display:'flex',background:C.togBg,borderRadius:9,padding:3,marginBottom:14}}>
      {tabs.map((t,i)=>(
        <button key={i} onClick={()=>set(i)}
          style={{flex:1,padding:'6px 6px',background:active===i?A.blue:'transparent',border:'none',
            borderRadius:7,color:active===i?'#fff':C.txS,fontSize:10,fontWeight:active===i?700:400,
            cursor:'pointer',transition:'all .18s'}}>
          {t}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, val, set }) {
  const C=useT();
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11}}>
      <span style={{fontSize:11,color:C.txS}}>{label}</span>
      <div onClick={()=>set(!val)}
        style={{width:36,height:20,borderRadius:10,background:val?A.blue:C.bdr,cursor:'pointer',
          position:'relative',transition:'background .2s',flexShrink:0}}>
        <div style={{position:'absolute',top:3,left:val?17:3,width:14,height:14,
          borderRadius:7,background:'#fff',transition:'left .2s'}}/>
      </div>
    </div>
  );
}

function ScrHdr({ title, sub, onBack, accent=A.blue }) {
  const C=useT();
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'13px 14px 9px',
      borderBottom:`1px solid ${C.bdr}`,flexShrink:0,background:C.sf,boxShadow:C.sh}}>
      <button onClick={onBack}
        style={{width:30,height:30,borderRadius:8,background:C.togBg,border:`1px solid ${C.bdr}`,
          color:C.tx,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:C.tx}}>{title}</div>
        <div style={{fontSize:8.5,color:accent,textTransform:'uppercase',letterSpacing:'.07em'}}>{sub}</div>
      </div>
    </div>
  );
}

function NoteBox({ children }) {
  const C=useT();
  return (
    <div style={{background:C.isDk?C.sf:C.bg,borderRadius:9,padding:'9px 11px',marginTop:10,
      border:`1px solid ${C.bdr}`,fontSize:9.5,color:C.txS,lineHeight:1.8}}>
      {children}
    </div>
  );
}

// ─── City Selector Component ──────────────────────────────────────────────────
function CitySelector({ onSelect, selectedId, accent=A.blue }) {
  const C=useT();
  const [country,setCountry]=useState('India');
  const citiesInCountry=CITIES.filter(c=>c.country===country||c.id==='custom');

  return (
    <div style={{background:C.card,border:`1px solid ${accent}35`,borderRadius:12,
      padding:'12px 13px',marginBottom:14}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <div style={{width:6,height:6,borderRadius:'50%',background:accent}}/>
        <span style={{fontSize:10,color:accent,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em'}}>
          📍 City / Location Auto-Fill
        </span>
      </div>

      {/* Country tabs */}
      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
        {COUNTRIES.map(c=>(
          <button key={c} onClick={()=>setCountry(c)}
            style={{padding:'3px 10px',background:country===c?accent:`${accent}15`,
              border:`1px solid ${country===c?accent:accent+'30'}`,borderRadius:8,
              color:country===c?'#fff':C.txS,fontSize:9,fontWeight:country===c?700:400,
              cursor:'pointer',transition:'all .15s'}}>
            {c}
          </button>
        ))}
      </div>

      {/* City buttons */}
      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
        {citiesInCountry.map(city=>(
          <button key={city.id} onClick={()=>onSelect(city)}
            style={{padding:'5px 12px',
              background:selectedId===city.id?accent:city.id==='custom'?`${A.orange}15`:`${accent}10`,
              border:`1px solid ${selectedId===city.id?accent:city.id==='custom'?A.orange+'40':accent+'25'}`,
              borderRadius:8,color:selectedId===city.id?'#fff':city.id==='custom'?A.orange:C.tx,
              fontSize:10,fontWeight:selectedId===city.id?700:400,
              cursor:'pointer',transition:'all .15s'}}>
            {city.name}
          </button>
        ))}
      </div>

      {/* Reference note for selected city */}
      {selectedId && selectedId!=='custom' && (()=>{
        const city=CITIES.find(c=>c.id===selectedId);
        if(!city) return null;
        const toC=k=>Math.round(k-273.15);
        return (
          <div style={{background:C.isDk?'rgba(255,255,255,.04)':'rgba(0,0,0,.03)',
            borderRadius:8,padding:'9px 11px',border:`1px solid ${C.bdr}`}}>
            <div style={{fontSize:8.5,color:accent,fontWeight:700,marginBottom:5,textTransform:'uppercase',letterSpacing:'.06em'}}>
              📋 {city.name} — Design Data Reference
            </div>
            <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:4}}>
              {[
                {l:'☀️ Summer Outside',   v:`${city.sum_To} K (${toC(city.sum_To)}°C)`},
                {l:'❄️ Winter Outside',   v:`${city.win_To} K (${toC(city.win_To)}°C)`},
                {l:'☀️ Summer Shaft Ts', v:`${city.sum_Ts} K (${toC(city.sum_Ts)}°C)`},
                {l:'❄️ Winter Shaft Ts', v:`${city.win_Ts} K (${toC(city.win_Ts)}°C)`},
                {l:'☀️ Design ΔP (bot)', v:`${city.sum_dPb} Pa`},
                {l:'❄️ Design ΔP (bot)', v:`${city.win_dPb} Pa`},
              ].map(({l,v})=>(
                <div key={l} style={{marginBottom:3}}>
                  <div style={{fontSize:7.5,color:C.txM}}>{l}</div>
                  <div style={{fontSize:9.5,color:C.tx,fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:7,paddingTop:6,borderTop:`1px solid ${C.bdr}`,
              fontSize:8,color:C.txM,lineHeight:1.7}}>
              <span style={{color:accent,fontWeight:700}}>Source: </span>{city.ref}<br/>
              Summer DBT = 0.4% design condition · Winter DBT = 99.6% design condition<br/>
              Shaft Ts = conditioned space assumption · Min ΔP per NBC 2016 Cl.3.2.6.4
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Season Compare ───────────────────────────────────────────────────────────
function SeasonCompare({ summer, winter, recommended, accent=A.blue }) {
  const C=useT();
  const isRec=(s)=>recommended===s;
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:8,marginBottom:8}}>
        {[{key:'summer',label:'☀️ Summer',data:summer},{key:'winter',label:'❄️ Winter',data:winter}].map(({key,label,data})=>(
          <div key={key} style={{
            background:isRec(key)?`${accent}18`:C.resBg,
            border:`2px solid ${isRec(key)?accent:C.bdr}`,
            borderRadius:10,padding:'10px 10px',position:'relative'}}>
            {isRec(key)&&(
              <div style={{position:'absolute',top:-9,left:'50%',transform:'translateX(-50%)',
                background:accent,color:'#fff',fontSize:7.5,fontWeight:800,padding:'2px 8px',
                borderRadius:8,letterSpacing:'.06em',whiteSpace:'nowrap'}}>
                ★ RECOMMENDED
              </div>
            )}
            <div style={{fontSize:9.5,color:accent,fontWeight:700,marginBottom:6}}>{label}</div>
            <div style={{fontSize:8,color:C.txM,marginBottom:2}}>ΔP at Top</div>
            <div style={{fontSize:12,fontWeight:700,color:C.tx,marginBottom:4}}>{data.dPt} Pa</div>
            <div style={{fontSize:8,color:C.txM,marginBottom:2}}>Stack Effect</div>
            <div style={{fontSize:11,fontWeight:600,color:data.se<0?A.orange:A.teal,marginBottom:4}}>
              {data.se>0?'+':''}{data.se} Pa
            </div>
            <div style={{fontSize:8,color:C.txM,marginBottom:2}}>Season</div>
            <div style={{fontSize:10,color:C.txS,marginBottom:6}}>{data.season}</div>
            <div style={{borderTop:`1px solid ${C.bdr}`,paddingTop:6,marginTop:4}}>
              <div style={{fontSize:8,color:C.txM,marginBottom:2}}>Required Airflow</div>
              <div style={{fontSize:16,fontWeight:800,color:isRec(key)?accent:C.tx}}>{data.cfm.toLocaleString()}</div>
              <div style={{fontSize:8,color:C.txM}}>CFM (incl. 10% safety)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Building Animation ───────────────────────────────────────────────────────
function BuildingAnim({ type='stair', P=50, floors=10, cfm=0 }) {
  const C=useT();
  const [tick,setTick]=useState(0);
  useEffect(()=>{const iv=setInterval(()=>setTick(t=>(t+1)%120),50);return()=>clearInterval(iv);},[]);
  const pc=P>=50?A.blue:P>=30?A.orange:A.red;
  const nF=Math.min(Math.max(floors,4),12); // SVG drawing cap at 12 — info bar shows actual
  const W=290,H=295,SX=22,SW=62,BX=92,BW=155,TOP=40,BOT=18;
  const fH=(H-TOP-BOT)/nF, fireF=Math.floor(nF/2), blocked=P>=20;
  const fcx=SX+SW/2, fcy=TOP-15;
  const spd=P>45?'.4s':P>25?'.85s':'1.5s';
  const bldgFill=C.isDk?'rgba(8,18,32,.92)':'rgba(215,228,244,.96)';
  return (
    <div style={{borderRadius:10,overflow:'hidden',background:C.svgBg,border:`1px solid ${C.bdr}`}}>
      <div style={{display:'flex',gap:8,padding:'7px 12px',
        background:C.isDk?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)',
        borderBottom:`1px solid ${C.bdr}`,flexWrap:'wrap'}}>
        {[{l:'CFM',v:cfm.toLocaleString(),c:pc},{l:'ΔP',v:`${P} Pa`,c:pc},
          {l:'Floors',v:floors,c:C.txS}, // ← actual floors shown here
          {l:'Fan',v:P>0?'Running':'Off',c:P>0?A.green:A.red},
          {l:'Smoke',v:blocked?'Blocked':'Risk',c:blocked?A.green:A.red}]
          .map(({l,v,c})=>(
            <div key={l} style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:48}}>
              <span style={{fontSize:7.5,color:C.txM,textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</span>
              <span style={{fontSize:10,fontWeight:700,color:c}}>{v}</span>
            </div>
          ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',display:'block'}}>
        <defs>
          <linearGradient id={`sg${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pc} stopOpacity=".35"/>
            <stop offset="100%" stopColor={pc} stopOpacity=".06"/>
          </linearGradient>
        </defs>
        <text x={SX+SW/2} y={12} textAnchor="middle" fill={pc} fontSize={7} fontWeight="700" letterSpacing="1.2">
          {type==='stair'?'STAIRWELL':'LIFT SHAFT'}
        </text>
        <text x={BX+BW/2} y={12} textAnchor="middle" fill={C.txM} fontSize={7} fontWeight="600" letterSpacing="1.2">BUILDING</text>
        <rect x={SX} y={TOP} width={SW} height={H-TOP-BOT} fill={`url(#sg${type})`} stroke={pc+'45'} strokeWidth=".8" rx="2"/>
        <rect x={SX} y={TOP} width={SW} height={H-TOP-BOT} fill={pc+'06'} rx="2"
          style={{animation:'pressPulse 2.2s ease-in-out infinite'}}/>
        <rect x={BX} y={TOP} width={BW} height={H-TOP-BOT} fill={bldgFill} stroke={C.svgFloor} strokeWidth=".7" rx="2"/>
        {Array.from({length:nF}).map((_,i)=>{
          const fy=TOP+(i+1)*fH,isF=i===fireF;
          return (<g key={i}>
            <line x1={SX} y1={fy} x2={BX+BW} y2={fy} stroke={isF?A.red+'58':C.svgFloor} strokeWidth={isF?1:.5}/>
            <rect x={SX+SW-9} y={fy-fH*.55} width={8} height={fH*.48} fill="none" stroke={pc+'72'} strokeWidth=".8" rx="1"/>
            {isF&&<>
              <rect x={BX} y={fy-fH+1} width={BW} height={fH-1} fill={A.red+'12'} rx="1"/>
              <text x={BX+BW/2} y={fy-fH/2+4} textAnchor="middle" fill={A.red} fontSize={8} fontWeight="700">🔥 FIRE FLOOR</text>
            </>}
            {isF&&!blocked&&[0,1,2].map(j=>{
              const py=fy-((tick+j*40)%120)/120*(fH-4)-2;
              return <circle key={j} cx={BX+25+j*36} cy={py} r={2+j*.5} fill={C.isDk?'#667':'#99A'} opacity={.4}/>;
            })}
          </g>);
        })}
        <circle cx={fcx} cy={fcy} r={12} fill={C.svgBg} stroke={pc+'58'} strokeWidth="1"/>
        <g transform={`translate(${fcx},${fcy})`} style={{animation:`fanSpin ${spd} linear infinite`,transformOrigin:'0 0'}}>
          {[0,72,144,216,288].map(a=>{const r1=a*Math.PI/180,r2=(a+36)*Math.PI/180;
            return <path key={a} d={`M0,0 L${7*Math.cos(r1)},${7*Math.sin(r1)} L${9*Math.cos(r2)},${9*Math.sin(r2)} Z`} fill={pc+'C5'}/>;})}</g>
        <circle cx={fcx} cy={fcy} r={2} fill={C.svgBg}/>
        <text x={fcx} y={fcy-17} textAnchor="middle" fill={pc} fontSize={6.5} fontWeight="700">SUPPLY</text>
        {[0,1].map(i=>{
          const prog=((tick+i*55)%110)/110,ay=fcy+14+prog*(H-TOP-BOT-14),op=prog<.1?prog*10:prog>.85?(1-prog)/.15:1;
          return (<g key={i} opacity={op*.85}>
            <line x1={fcx} y1={ay} x2={fcx} y2={ay+8} stroke={pc} strokeWidth={1.4} strokeLinecap="round"/>
            <polygon points={`${fcx},${ay+11} ${fcx-3.5},${ay+5} ${fcx+3.5},${ay+5}`} fill={pc}/>
          </g>);
        })}
        <rect x={BX+BW-50} y={TOP+8} width={45} height={32}
          fill={C.isDk?'rgba(0,0,0,.5)':'rgba(255,255,255,.8)'} stroke={pc+'48'} strokeWidth=".8" rx={5}/>
        <text x={BX+BW-27} y={TOP+20} textAnchor="middle" fill={C.txM} fontSize={6}>ΔP</text>
        <text x={BX+BW-27} y={TOP+34} textAnchor="middle" fill={pc} fontSize={14} fontWeight="800">{P}</text>
        <text x={BX+BW-10} y={TOP+34} fill={pc} fontSize={7}>Pa</text>
      </svg>
    </div>
  );
}

function LobbyAnim({ P=30, cfm=0 }) {
  const C=useT();
  const [tick,setTick]=useState(0);
  useEffect(()=>{const iv=setInterval(()=>setTick(t=>(t+1)%100),50);return()=>clearInterval(iv);},[]);
  const pc=P>=30?A.teal:P>=20?A.orange:A.red;
  const W=290,H=180,LX=60,LY=28,LW=120,LH=95,fcx=LX+LW/2,fcy=LY-16;
  return (
    <div style={{borderRadius:10,overflow:'hidden',background:C.svgBg,border:`1px solid ${C.bdr}`}}>
      <div style={{display:'flex',gap:8,padding:'7px 12px',
        background:C.isDk?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)',
        borderBottom:`1px solid ${C.bdr}`,flexWrap:'wrap'}}>
        {[{l:'CFM',v:cfm.toLocaleString(),c:pc},{l:'Lobby ΔP',v:`${P} Pa`,c:pc},{l:'Min Req.',v:'30 Pa',c:C.txS},{l:'Status',v:P>=30?'Compliant':'Low',c:P>=30?A.green:A.red}]
          .map(({l,v,c})=>(
            <div key={l} style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:54}}>
              <span style={{fontSize:7.5,color:C.txM,textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</span>
              <span style={{fontSize:10,fontWeight:700,color:c}}>{v}</span>
            </div>))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',display:'block'}}>
        <text x={W/2} y={11} textAnchor="middle" fill={pc} fontSize={6.5} fontWeight="700" letterSpacing="1.2">LOBBY PRESSURIZATION — NFPA 92A</text>
        <rect x={LX} y={LY} width={LW} height={LH} fill={pc+'12'} stroke={pc} strokeWidth="1.2" rx={4}/>
        <circle cx={fcx} cy={fcy} r={10} fill={C.svgBg} stroke={pc+'58'} strokeWidth="1"/>
        <g transform={`translate(${fcx},${fcy})`} style={{animation:'fanSpin .8s linear infinite',transformOrigin:'0 0'}}>
          {[0,72,144,216,288].map(a=>{const r1=a*Math.PI/180,r2=(a+36)*Math.PI/180;return<path key={a} d={`M0,0 L${6*Math.cos(r1)},${6*Math.sin(r1)} L${8*Math.cos(r2)},${8*Math.sin(r2)} Z`} fill={pc+'C5'}/>;})}</g>
        <circle cx={fcx} cy={fcy} r={2} fill={C.svgBg}/>
        {[0,1].map(i=>{const prog=((tick+i*50)%100)/100,ay=fcy+11+prog*34,op=prog<.1?prog*10:prog>.85?(1-prog)/.15:1;
          return(<g key={i} opacity={op*.8}><line x1={fcx} y1={ay} x2={fcx} y2={ay+7} stroke={pc} strokeWidth={1.2} strokeLinecap="round"/><polygon points={`${fcx},${ay+9} ${fcx-3},${ay+4} ${fcx+3},${ay+4}`} fill={pc}/></g>);})}
        <text x={LX+LW/2} y={LY+45} textAnchor="middle" fill={pc} fontSize={10} fontWeight="700">LIFT LOBBY</text>
        <text x={LX+LW/2} y={LY+60} textAnchor="middle" fill={C.txS} fontSize={8}>{P} Pa</text>
        <rect x={LX-9} y={LY+30} width={7} height={20} fill="none" stroke={A.purple} strokeWidth="1" rx={1}/>
        {[LY+15,LY+45,LY+72].map((dy,i)=><rect key={i} x={LX+LW+2} y={dy} width={7} height={17} fill="none" stroke={A.orange} strokeWidth="1" rx={1}/>)}
        {[LX+10,LX+45,LX+80].map((dx,i)=><rect key={i} x={dx} y={LY+LH+2} width={22} height={6} fill="none" stroke={A.blue} strokeWidth="1" rx={1}/>)}
      </svg>
    </div>
  );
}

function Gauge({ val, max, label, ok, col }) {
  const C=useT();
  const pct=Math.min(Math.max(val/max,0),1),ang=-150+pct*300;
  const nx=60+42*Math.cos((ang-90)*Math.PI/180),ny=65+42*Math.sin((ang-90)*Math.PI/180);
  const c=ok?(col||A.green):A.red;
  return (
    <div style={{background:C.card,borderRadius:11,padding:'10px 8px',border:`1px solid ${ok?c+'40':A.red+'38'}`,textAlign:'center',boxShadow:C.sh}}>
      <div style={{fontSize:8,color:C.txS,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>{label}</div>
      <svg viewBox="0 0 120 80" style={{width:105,height:72,margin:'0 auto',display:'block'}}>
        <path d="M12,65 A52,52 0 0,1 108,65" fill="none" stroke={C.bdr} strokeWidth={9} strokeLinecap="round"/>
        {pct>.01&&<path d="M12,65 A52,52 0 0,1 108,65" fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" strokeDasharray={`${pct*163} 163`}/>}
        <line x1={60} y1={65} x2={nx} y2={ny} stroke={c} strokeWidth={2.2} strokeLinecap="round"/>
        <circle cx={60} cy={65} r={5} fill={C.card} stroke={c} strokeWidth={1.5}/>
        <text x={60} y={52} textAnchor="middle" fill={c} fontSize={19} fontWeight="800">{val}</text>
        <text x={60} y={63} textAnchor="middle" fill={C.txM} fontSize={7}>Pa</text>
      </svg>
      <div style={{fontSize:10,color:c,fontWeight:700,marginTop:2}}>{ok?'✓ OK':'✗ FAIL'}</div>
    </div>
  );
}

function AnimSectionHdr({ label, accent, extra }) {
  const C=useT();
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'10px 0 8px',marginTop:4,borderTop:`1px solid ${C.bdr}`}}>
      <div style={{display:'flex',alignItems:'center',gap:7}}>
        <div style={{width:3,height:14,background:accent,borderRadius:2}}/>
        <span style={{fontSize:9.5,color:accent,textTransform:'uppercase',letterSpacing:'.1em',fontWeight:700}}>{label}</span>
      </div>
      {extra&&<span style={{fontSize:9,color:C.txM}}>{extra}</span>}
    </div>
  );
}

// ─── Staircase Screen ─────────────────────────────────────────────────────────
function StaircaseScreen({ onBack }) {
  const C=useT();
  const [tab,setTab]=useState(0);
  const [dW,setDW]=useState(1.2),[dH,setDH]=useState(2.4),[isDbl,setDbl]=useState(false);
  const [floors,setFloors]=useState(10),[openD,setOpenD]=useState(2),[P,setP]=useState(50);
  const [gapMm,setGap]=useState(3),[safety,setSafety]=useState(10);
  const [sPerim,setSPerim]=useState(21),[bPerim,setBPerim]=useState(334),[fH,setFH]=useState(3);
  const [wSb,setWSb]=useState(0.00011),[wBo,setWBo]=useState(0.00017);
  const [sFloors,setSFloors]=useState(33);
  const [isDblSt,setDblSt]=useState(false),[cpf,setCpf]=useState(1);
  const [sOpenD,setSOpenD]=useState(2);
  const [sDW,setSDW]=useState(1.2),[sDH,setSDH]=useState(2.4);
  const [To_s,setTo_s]=useState(308),[Ts_s,setTs_s]=useState(303),[dPb_s,setDPb_s]=useState(68.2);
  const [To_w,setTo_w]=useState(291.3),[Ts_w,setTs_w]=useState(296.3),[dPb_w,setDPb_w]=useState(50);
  const [cityId,setCityId]=useState('mumbai');

  function applyCity(city) {
    setCityId(city.id);
    if(city.id==='custom') return; // manual entry
    setTo_s(city.sum_To); setTs_s(city.sum_Ts); setDPb_s(city.sum_dPb);
    setTo_w(city.win_To); setTs_w(city.win_Ts); setDPb_w(city.win_dPb);
  }

  const r1=stairSimple({dW,dH,isDouble:isDbl,floors,openDoors:openD,P,gapMm,safety});
  const r2=stairStack({sPerim,bPerim,fH,floors:sFloors,To_s,Ts_s,dPb_s,To_w,Ts_w,dPb_w,
    wSb,wBo,dW:sDW,dH:sDH,isDouble:isDblSt,cpf,openDoors:sOpenD});
  const res=tab===0?r1:{cfm:r2.rec?.cfm||0};
  const animP=tab===0?P:Math.round(r2.rec?.dPt||50);

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:C.bg,overflow:'hidden'}}>
      <ScrHdr title="Staircase Pressurization" sub="NBC 2016 · NFPA 92 · ASHRAE Ch.53" onBack={onBack} accent={A.blue}/>
      <div style={{flex:1,overflow:'auto',padding:'10px 14px 24px'}}>
        <TabBar tabs={['Simple Method (NBC/NFPA)','With Stack Effect (ASHRAE)']} active={tab} set={setTab}/>

        {tab===0?(
          <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:12}}>
            <div>
              <SecHdr label="Door Parameters" accent={A.blue}/>
              <NumIn label="Door Width" val={dW} set={setDW} unit="m" step={.05}/>
              <NumIn label="Door Height" val={dH} set={setDH} unit="m" step={.05}/>
              <Toggle label="Double Leaf Door" val={isDbl} set={setDbl}/>
              <SecHdr label="Building" accent={A.blue}/>
              <NumIn label="No. of Floors" val={floors} set={setFloors} step={1} min={2}/>
              <NumIn label="Open Doors (fire+gnd)" val={openD} set={setOpenD} step={1} min={1}/>
              <NumIn label="Door Gap" val={gapMm} set={setGap} unit="mm" step={.5}/>
              <NumIn label="Design Pressure (ΔP)" val={P} set={setP} unit="Pa" step={5} min={8}/>
              <NumIn label="Safety Margin" val={safety} set={setSafety} unit="%" step={5}/>
            </div>
            <div>
              <SecHdr label="Results" accent={A.blue}/>
              <ResCard label="Crack Length / Door" val={r1.crack} unit="m"/>
              <ResCard label="Leakage Area / Door" val={r1.AEd} unit="m²"/>
              <ResCard label="Closed Doors" val={r1.closed} unit="nos."/>
              <ResCard label="Total AE" val={r1.AE} unit="m²"/>
              <ResCard label="Q1 — Closed Leakage" val={r1.Q1} unit="m³/s"/>
              <ResCard label="Q2 — Open Door Flow" val={r1.Q2} unit="m³/s"/>
              <ResCard label="Total Q (with safety)" val={r1.Q} unit="m³/s"/>
              <ResCard label="Total Required Airflow" val={r1.cfm} unit="CFM" hi xl/>
              <ResCard label="Per Floor" val={r1.cfmFloor} unit="CFM/floor" hi/>
              <NoteBox>
                <strong style={{color:C.tx}}>NBC 2016 / NFPA 92:</strong><br/>
                Q₁ = 0.83 × AE × P^0.5 (closed leakage)<br/>
                Q₂ = A_door × n_open × 0.75 m/s (open door)
              </NoteBox>
            </div>
          </div>
        ):(
          <div>
            {/* City Selector */}
            <CitySelector onSelect={applyCity} selectedId={cityId} accent={A.blue}/>

            <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:12,marginBottom:4}}>
              <div>
                <SecHdr label="Geometry" accent={A.blue}/>
                <NumIn label="Staircase Perimeter" val={sPerim} set={setSPerim} unit="m"/>
                <NumIn label="Building Perimeter" val={bPerim} set={setBPerim} unit="m"/>
                <NumIn label="Floor Height" val={fH} set={setFH} unit="m" step={.1}/>
                <NumIn label="No. of Floors" val={sFloors} set={setSFloors} step={1}/>
                <SecHdr label="Door (per Floor)" accent={A.blue}/>
                <NumIn label="Door Width" val={sDW} set={setSDW} unit="m" step={.05}/>
                <NumIn label="Door Height" val={sDH} set={setSDH} unit="m" step={.05}/>
                <Toggle label="Double Leaf Door" val={isDblSt} set={setDblSt}/>
                <NumIn label="Closed Doors per Floor" val={cpf} set={setCpf} step={1} min={1}/>
                <NumIn label="Open Doors (fire+gnd)" val={sOpenD} set={setSOpenD} step={1} min={0}/>
                <SecHdr label="Leakage (ASHRAE Table 1)" accent={A.blue}/>
                <SelIn label="Stairwell Walls" val={wSb} set={setWSb} opts={[
                  {v:.000014,l:'Tight (1.4×10⁻⁵)'},{v:.00011,l:'Average (1.1×10⁻⁴)'},{v:.00035,l:'Loose (3.5×10⁻⁴)'}]}/>
                <SelIn label="Exterior Walls" val={wBo} set={setWBo} opts={[
                  {v:.00005,l:'Tight (5×10⁻⁵)'},{v:.00017,l:'Average (1.7×10⁻⁴)'},
                  {v:.00035,l:'Loose (3.5×10⁻⁴)'},{v:.0012,l:'Very Loose (1.2×10⁻³)'}]}/>
              </div>
              <div>
                <SecHdr label="☀️ Summer Condition" accent={A.orange}/>
                <NumIn label="Outside Temp To" val={To_s} set={v=>{setTo_s(v);setCityId('custom');}} unit="K" step={1} note="Summer: high outside temp"/>
                <NumIn label="Shaft Temp Ts" val={Ts_s} set={v=>{setTs_s(v);setCityId('custom');}} unit="K" step={1} note="e.g. 303 K = 30°C"/>
                <NumIn label="Design Pressure ΔPsbb" val={dPb_s} set={v=>{setDPb_s(v);setCityId('custom');}} unit="Pa" step={1} note="Min 50 Pa per NBC 2016"/>
                <SecHdr label="❄️ Winter Condition" accent={A.blue}/>
                <NumIn label="Outside Temp To" val={To_w} set={v=>{setTo_w(v);setCityId('custom');}} unit="K" step={1} note="Winter: low outside temp"/>
                <NumIn label="Shaft Temp Ts" val={Ts_w} set={v=>{setTs_w(v);setCityId('custom');}} unit="K" step={1} note="e.g. 296.3 K = 23°C"/>
                <NumIn label="Design Pressure ΔPsbb" val={dPb_w} set={v=>{setDPb_w(v);setCityId('custom');}} unit="Pa" step={1} note="Min 50 Pa per NBC 2016"/>
              </div>
            </div>

            <SecHdr label="Summer vs Winter — Both Results" accent={A.blue}/>
            {r2.rec&&<SeasonCompare summer={r2.summer} winter={r2.winter} recommended={r2.recommended} accent={A.blue}/>}

            {r2.rec&&(
              <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:10}}>
                <div>
                  <SecHdr label="Stack Parameters" accent={A.blue}/>
                  <ResCard label="Stack Factor B" val={r2.rec.B} unit="Pa/m"/>
                  <ResCard label="Stack Effect (se)" val={r2.rec.se} unit="Pa"/>
                  <ResCard label="ΔP at Top (ΔPsbt)" val={r2.rec.dPt} unit="Pa"/>
                  <ResCard label="Season" val={r2.rec.season}/>
                  <SecHdr label="Leakage Areas" accent={A.blue}/>
                  <ResCard label="Alsb (Stair Wall)" val={r2.rec.Alsb} unit="m²/fl"/>
                  <ResCard label="Adsb (Door Gap)" val={r2.rec.Adsb} unit="m²/fl"/>
                  <ResCard label="Asb (Total Stair→Bldg)" val={r2.rec.Asb} unit="m²/fl"/>
                  <ResCard label="Abo (Bldg→Outside)" val={r2.rec.Abo} unit="m²/fl"/>
                </div>
                <div>
                  <SecHdr label="Airflow Results" accent={A.blue}/>
                  <ResCard label="Ql — Leakage Airflow" val={r2.rec.Ql} unit="m³/s"/>
                  <ResCard label="Qod — Open Door Flow" val={r2.rec.Qod} unit="m³/s"/>
                  <ResCard label={`Door Velocity (${sOpenD} open)`} val={r2.rec.vel} unit="m/s"/>
                  <ResCard label="Qt Total" val={r2.rec.Qt} unit="m³/s"/>
                  <ResCard label="Qt + 10% Safety" val={r2.rec.Q_safe} unit="m³/s"/>
                  <ResCard label="✅ Recommended CFM" val={r2.rec.cfm} unit="CFM" hi xl/>
                  <NoteBox>
                    <strong style={{color:C.tx}}>ASHRAE Ch.53 Formula:</strong><br/>
                    se = B×H / (1+(Asb/Abo)²)<br/>
                    Qt = 0.559×n×Asb×((|dPt|^1.5−|dPb|^1.5)/(|dPt|−|dPb|))<br/>
                    Total = (Ql + Qod) × 1.10<br/>
                    <span style={{color:A.orange}}>Max(Summer, Winter) recommended</span>
                  </NoteBox>
                </div>
              </div>
            )}
          </div>
        )}

        <AnimSectionHdr label="Live System Visualization" accent={A.blue}
          extra={`${res.cfm?.toLocaleString()} CFM · ${animP} Pa`}/>
        <BuildingAnim type="stair" P={animP} floors={tab===0?floors:sFloors} cfm={res.cfm||0}/>
      </div>
    </div>
  );
}

// ─── Lift Well Screen ─────────────────────────────────────────────────────────
function LiftWellScreen({ onBack }) {
  const C=useT();
  const [tab,setTab]=useState(0);
  const [dW,setDW]=useState(1.2),[dH,setDH]=useState(2.3),[floors,setFloors]=useState(56);
  const [lifts,setLifts]=useState(1),[openD,setOpenD]=useState(1),[P,setP]=useState(50);
  const [gapMm,setGap]=useState(3),[tVent,setTVent]=useState(.36),[safety,setSafety]=useState(10);
  const [lwPerim,setLwPerim]=useState(13),[bPerim,setBPerim]=useState(334),[fH,setFH]=useState(3);
  const [sFloors,setSFloors]=useState(33),[sLifts,setSLifts]=useState(1);
  const [wLw,setWLw]=useState(.00084),[wBo,setWBo]=useState(.00017);
  const [lDW,setLDW]=useState(1),[lDH,setLDH]=useState(2.1),[nDoors,setNDoors]=useState(1);
  const [To_s,setTo_s]=useState(308),[Ts_s,setTs_s]=useState(303),[dPb_s,setDPb_s]=useState(67.1);
  const [To_w,setTo_w]=useState(291.33),[Ts_w,setTs_w]=useState(296.33),[dPb_w,setDPb_w]=useState(50);
  const [cityId,setCityId]=useState('mumbai');

  function applyCity(city) {
    setCityId(city.id);
    if(city.id==='custom') return;
    setTo_s(city.sum_To); setTs_s(city.sum_Ts); setDPb_s(city.sum_dPb);
    setTo_w(city.win_To); setTs_w(city.win_Ts); setDPb_w(city.win_dPb);
  }

  const r1=liftSimple({dW,dH,floors,lifts,openDoors:openD,P,gapMm,tVent,safety});
  const r2=liftStack({lwPerim,bPerim,fH,floors:sFloors,lifts:sLifts,
    To_s,Ts_s,dPb_s,To_w,Ts_w,dPb_w,wLw,wBo,dW:lDW,dH:lDH,nDoors});
  const res=tab===0?r1:{cfm:r2.rec?.cfm||0};
  const animP=tab===0?P:Math.round(r2.rec?.dPt||50);

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:C.bg,overflow:'hidden'}}>
      <ScrHdr title="Lift Well Pressurization" sub="NBC 2016 · NFPA 92 · ASHRAE Ch.53" onBack={onBack} accent={A.purple}/>
      <div style={{flex:1,overflow:'auto',padding:'10px 14px 24px'}}>
        <TabBar tabs={['Simple Method (NBC/NFPA)','With Stack Effect (ASHRAE)']} active={tab} set={setTab}/>

        {tab===0?(
          <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:12}}>
            <div>
              <SecHdr label="Lift Door (Double Leaf)" accent={A.purple}/>
              <NumIn label="Panel Width (each)" val={dW} set={setDW} unit="m" step={.05} note="Total = 2 × panel width"/>
              <NumIn label="Door Height" val={dH} set={setDH} unit="m" step={.05}/>
              <SecHdr label="Lift Well" accent={A.purple}/>
              <NumIn label="No. of Floors" val={floors} set={setFloors} step={1} min={2}/>
              <NumIn label="No. of Lifts" val={lifts} set={setLifts} step={1} min={1}/>
              <NumIn label="Open Lift Doors" val={openD} set={setOpenD} step={1} min={0}/>
              <NumIn label="Door Gap" val={gapMm} set={setGap} unit="mm" step={.5}/>
              <NumIn label="Design Pressure" val={P} set={setP} unit="Pa" step={5} min={8}/>
              <NumIn label="Terrace Vent Area" val={tVent} set={setTVent} unit="m²" step={.01}/>
              <NumIn label="Safety Margin" val={safety} set={setSafety} unit="%" step={5}/>
            </div>
            <div>
              <SecHdr label="Results" accent={A.purple}/>
              <ResCard label="Crack Length / Door" val={r1.crack} unit="m"/>
              <ResCard label="Leakage Area / Door" val={r1.AEd} unit="m²"/>
              <ResCard label="Closed Doors (all lifts)" val={r1.closed} unit="nos."/>
              <ResCard label="Total AE (incl. vent)" val={r1.total} unit="m²"/>
              <ResCard label="Q1 — Closed Leakage" val={r1.Q1} unit="m³/s"/>
              <ResCard label="Q2 — Open Door Flow" val={r1.Q2} unit="m³/s"/>
              <ResCard label="Total Q (with safety)" val={r1.Q} unit="m³/s"/>
              <ResCard label="Total Required Airflow" val={r1.cfm} unit="CFM" hi xl/>
              <NoteBox>
                <strong style={{color:C.tx}}>Formula:</strong><br/>
                Crack = 2×(2W+H) — double leaf door<br/>
                Q₁ = 0.83 × AE × P^0.5<br/>
                Terrace vent area included in AE
              </NoteBox>
            </div>
          </div>
        ):(
          <div>
            {/* City Selector */}
            <CitySelector onSelect={applyCity} selectedId={cityId} accent={A.purple}/>

            <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:12,marginBottom:4}}>
              <div>
                <SecHdr label="Lift Well Geometry" accent={A.purple}/>
                <NumIn label="Lift Well Perimeter" val={lwPerim} set={setLwPerim} unit="m" note="Inner perimeter of shaft"/>
                <NumIn label="Building Perimeter" val={bPerim} set={setBPerim} unit="m"/>
                <NumIn label="Floor Height" val={fH} set={setFH} unit="m" step={.1}/>
                <NumIn label="No. of Floors" val={sFloors} set={setSFloors} step={1}/>
                <NumIn label="No. of Lifts" val={sLifts} set={setSLifts} step={1} min={1}/>
                <SecHdr label="Lift Door" accent={A.purple}/>
                <NumIn label="Door Width (single panel)" val={lDW} set={setLDW} unit="m" step={.05}/>
                <NumIn label="Door Height" val={lDH} set={setLDH} unit="m" step={.05}/>
                <NumIn label="No. of Doors per Floor" val={nDoors} set={setNDoors} step={1} min={1}/>
                <SecHdr label="Leakage (ASHRAE)" accent={A.purple}/>
                <SelIn label="Lift Well Walls" val={wLw} set={setWLw} opts={[
                  {v:.00018,l:'Tight (1.8×10⁻⁴)'},{v:.00084,l:'Average (8.4×10⁻⁴)'},{v:.0018,l:'Loose (1.8×10⁻³)'}]}/>
                <SelIn label="Exterior Walls" val={wBo} set={setWBo} opts={[
                  {v:.00005,l:'Tight (5×10⁻⁵)'},{v:.00017,l:'Average (1.7×10⁻⁴)'},{v:.00035,l:'Loose (3.5×10⁻⁴)'}]}/>
              </div>
              <div>
                <SecHdr label="☀️ Summer Condition" accent={A.orange}/>
                <NumIn label="Outside Temp To" val={To_s} set={v=>{setTo_s(v);setCityId('custom');}} unit="K" step={1} note="Summer: high outside temp"/>
                <NumIn label="Shaft Temp Ts" val={Ts_s} set={v=>{setTs_s(v);setCityId('custom');}} unit="K" step={1} note="e.g. 303 K = 30°C"/>
                <NumIn label="Design Pressure ΔPsbb" val={dPb_s} set={v=>{setDPb_s(v);setCityId('custom');}} unit="Pa" step={1} note="Min 50 Pa per NBC 2016"/>
                <SecHdr label="❄️ Winter Condition" accent={A.blue}/>
                <NumIn label="Outside Temp To" val={To_w} set={v=>{setTo_w(v);setCityId('custom');}} unit="K" step={1} note="Winter: low outside temp"/>
                <NumIn label="Shaft Temp Ts" val={Ts_w} set={v=>{setTs_w(v);setCityId('custom');}} unit="K" step={1} note="e.g. 296.3 K = 23°C"/>
                <NumIn label="Design Pressure ΔPsbb" val={dPb_w} set={v=>{setDPb_w(v);setCityId('custom');}} unit="Pa" step={1} note="Min 50 Pa per NBC 2016"/>
              </div>
            </div>

            <SecHdr label="Summer vs Winter — Both Results" accent={A.purple}/>
            {r2.rec&&<SeasonCompare summer={r2.summer} winter={r2.winter} recommended={r2.recommended} accent={A.purple}/>}

            {r2.rec&&(
              <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:10}}>
                <div>
                  <SecHdr label="Stack Parameters" accent={A.purple}/>
                  <ResCard label="Stack Factor B" val={r2.rec.B} unit="Pa/m"/>
                  <ResCard label="Stack Effect (se)" val={r2.rec.se} unit="Pa"/>
                  <ResCard label="ΔP at Top (ΔPsbt)" val={r2.rec.dPt} unit="Pa"/>
                  <ResCard label="Season" val={r2.rec.season}/>
                  <SecHdr label="Leakage Areas" accent={A.purple}/>
                  <ResCard label="Alsb (LW Wall)" val={r2.rec.Alsb} unit="m²/fl"/>
                  <ResCard label="Adsb (Door Gap)" val={r2.rec.Adsb} unit="m²/fl"/>
                  <ResCard label="Asb (LW→Bldg)" val={r2.rec.Asb} unit="m²/fl"/>
                  <ResCard label="Abo (Bldg→Outside)" val={r2.rec.Abo} unit="m²/fl"/>
                </div>
                <div>
                  <SecHdr label="Airflow Results" accent={A.purple}/>
                  <ResCard label="Qt — Total Leakage" val={r2.rec.Qt} unit="m³/s"/>
                  <ResCard label="Qt + 10% Safety" val={r2.rec.Q_safe} unit="m³/s"/>
                  <ResCard label="✅ Recommended CFM" val={r2.rec.cfm} unit="CFM" hi xl/>
                  <NoteBox>
                    <strong style={{color:C.tx}}>ASHRAE Ch.53 Lift Well:</strong><br/>
                    Adsb = (2/1000)×(2W+3H)×nDoors<br/>
                    se = B×H / (1+(Asb/Abo)²)<br/>
                    Qt = 0.559×n×Asb×((|dPt|^1.5−|dPb|^1.5)/(|dPt|−|dPb|))<br/>
                    Total = Qt × 1.10 (lift door closed in fire)<br/>
                    <span style={{color:A.orange}}>Max(Summer, Winter) recommended</span>
                  </NoteBox>
                </div>
              </div>
            )}
          </div>
        )}

        <AnimSectionHdr label="Live System Visualization" accent={A.purple}
          extra={`${res.cfm?.toLocaleString()} CFM · ${animP} Pa`}/>
        <BuildingAnim type="lift" P={animP} floors={tab===0?floors:sFloors} cfm={res.cfm||0}/>
      </div>
    </div>
  );
}

// ─── Lobby Screen ─────────────────────────────────────────────────────────────
function LobbyScreen({ onBack }) {
  const C=useT();
  const [area,setArea]=useState(35.5),[perim,setPerim]=useState(41);
  const [h,setH]=useState(3.5),[reqP,setReqP]=useState(30);
  const [wLeak,setWLeak]=useState(.00011),[fLeak,setFLeak]=useState(.000052);
  const [nSvc,setNSvc]=useState(2),[wSvc,setWSvc]=useState(.9);
  const [nApt,setNApt]=useState(6),[wApt,setWApt]=useState(1.25);
  const [nSt,setNSt]=useState(1),[wSt,setWSt]=useState(1.25);
  const [nLift,setNLift]=useState(3),[wLift,setWLift]=useState(1.25);
  const [nOpen,setNOpen]=useState(1),[odW,setOdW]=useState(1.25),[odH,setOdH]=useState(2.4);
  const [sf,setSf]=useState(1.5);
  const r=calcLobby({area,perim,h,reqP,wLeak,fLeak,nSvc,wSvc,nApt,wApt,nSt,wSt,nLift,wLift,odW,odH,nOpen,sf});
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:C.bg,overflow:'hidden'}}>
      <ScrHdr title="Lobby / Vestibule" sub="NFPA 92A · NBC 2016" onBack={onBack} accent={A.teal}/>
      <div style={{flex:1,overflow:'auto',padding:'10px 14px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:12}}>
          <div>
            <SecHdr label="Lobby Geometry" accent={A.teal}/>
            <NumIn label="Floor Area" val={area} set={setArea} unit="m²" step={.5}/>
            <NumIn label="Perimeter" val={perim} set={setPerim} unit="m" step={.5}/>
            <NumIn label="Height" val={h} set={setH} unit="m" step={.1}/>
            <NumIn label="Required Pressure" val={reqP} set={setReqP} unit="Pa" step={5} min={8}/>
            <SecHdr label="Leakage (NFPA 92)" accent={A.teal}/>
            <SelIn label="Wall Tightness" val={wLeak} set={setWLeak} opts={[
              {v:.000014,l:'Tight (1.4×10⁻⁵)'},{v:.00011,l:'Average (1.1×10⁻⁴)'},{v:.00035,l:'Loose (3.5×10⁻⁴)'}]}/>
            <SelIn label="Floor / Ceiling" val={fLeak} set={setFLeak} opts={[
              {v:.0000066,l:'Tight (6.6×10⁻⁶)'},{v:.000052,l:'Average (5.2×10⁻⁵)'},{v:.00017,l:'Loose (1.7×10⁻⁴)'}]}/>
            <SecHdr label="Lobby Doors (2mm gap)" accent={A.teal}/>
            <NumIn label="Service Area Doors" val={nSvc} set={setNSvc} step={1} unit="nos"/>
            <NumIn label="Apartment Doors" val={nApt} set={setNApt} step={1} unit="nos"/>
            <NumIn label="Staircase Doors" val={nSt} set={setNSt} step={1} unit="nos"/>
            <NumIn label="Lift Well Doors" val={nLift} set={setNLift} step={1} unit="nos"/>
            <SecHdr label="Open Door Condition" accent={A.teal}/>
            <NumIn label="No. of Open Doors" val={nOpen} set={setNOpen} step={1} min={0}/>
            <NumIn label="Open Door Width" val={odW} set={setOdW} unit="m" step={.05}/>
            <NumIn label="Open Door Height" val={odH} set={setOdH} unit="m" step={.05}/>
            <NumIn label="Safety Factor" val={sf} set={setSf} step={.1} min={1}/>
          </div>
          <div>
            <SecHdr label="Leakage Breakdown" accent={A.teal}/>
            <ResCard label="Wall Leakage" val={r.wA} unit="m²"/>
            <ResCard label="Floor + Ceiling" val={r.fA} unit="m²"/>
            <ResCard label="Service Doors" val={r.lSvc} unit="m²"/>
            <ResCard label="Apartment Doors" val={r.lApt} unit="m²"/>
            <ResCard label="Staircase Doors" val={r.lSt} unit="m²"/>
            <ResCard label="Lift Doors" val={r.lLift} unit="m²"/>
            <ResCard label="Total Leakage AE" val={r.total} unit="m²"/>
            <ResCard label={`With Safety Factor (×${sf})`} val={r.totalSf} unit="m²"/>
            <SecHdr label="Airflow" accent={A.teal}/>
            <ResCard label="Q — Pressure Flow" val={r.Qp} unit="m³/s"/>
            <ResCard label="Q — Open Door Flow" val={r.Qo} unit="m³/s"/>
            <ResCard label="Total Q" val={r.Q} unit="m³/s"/>
            <ResCard label="Total Required Airflow" val={r.cfm} unit="CFM" hi xl/>
            <NoteBox>
              <span style={{color:A.teal}}>NFPA 92A:</span> ≥30 Pa lobby (closed)<br/>
              ≥8 Pa open | 0.75 m/s door velocity<br/>
              Safety factor 1.5 per NFPA 92A §7.3
            </NoteBox>
          </div>
        </div>
        <AnimSectionHdr label="Live Lobby Visualization" accent={A.teal} extra={`${r.cfm.toLocaleString()} CFM · ${reqP} Pa`}/>
        <LobbyAnim P={reqP} cfm={r.cfm}/>
      </div>
    </div>
  );
}

// ─── Pressure Diff Screen ──────────────────────────────────────────────────────
function PressureDiffScreen({ onBack }) {
  const C=useT();
  const [cP,setCP]=useState(50),[oP,setOP]=useState(8),[vel,setVel]=useState(.75),[maxP,setMaxP]=useState(80);
  const checks=[
    {l:'Min Pressure — Closed',req:'≥ 50 Pa',ok:cP>=50},
    {l:'Max Pressure — Closed',req:`≤ ${maxP} Pa`,ok:cP<=maxP},
    {l:'Min Pressure — Open',req:'≥ 8 Pa',ok:oP>=8},
    {l:'Min Door Velocity',req:'≥ 0.75 m/s',ok:vel>=.75},
  ];
  const allOk=checks.every(c=>c.ok);
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:C.bg,overflow:'hidden'}}>
      <ScrHdr title="Pressure Differential Check" sub="NBC 2016 · NFPA 92 Compliance" onBack={onBack} accent={A.orange}/>
      <div style={{flex:1,overflow:'auto',padding:'13px 14px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:11,marginBottom:14}}>
          <Gauge val={cP} max={100} label="Doors Closed" ok={cP>=50&&cP<=maxP} col={A.blue}/>
          <Gauge val={oP} max={50} label="Doors Open" ok={oP>=8} col={A.teal}/>
        </div>
        <div style={{padding:'10px 13px',background:allOk?`${A.green}0E`:C.card,borderRadius:9,
          border:`1px solid ${allOk?A.green+'45':A.orange+'45'}`,marginBottom:14,boxShadow:C.sh}}>
          <div style={{fontSize:12,fontWeight:700,color:allOk?A.green:A.orange}}>
            {allOk?'✓ Meets NBC 2016 / NFPA 92':'⚠ Review Parameters Below'}
          </div>
          <div style={{fontSize:9,color:C.txS,marginTop:2}}>
            {allOk?'All pressure & velocity criteria satisfied.':'Some criteria need attention.'}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:12}}>
          <div>
            <SecHdr label="Measured Values" accent={A.orange}/>
            <NumIn label="Pressure — Closed" val={cP} set={setCP} unit="Pa" step={1} min={0}/>
            <NumIn label="Pressure — Open" val={oP} set={setOP} unit="Pa" step={1} min={0}/>
            <NumIn label="Max Pressure Limit" val={maxP} set={setMaxP} unit="Pa" step={5} note="Door force limit"/>
            <NumIn label="Door Velocity" val={vel} set={setVel} unit="m/s" step={.05} min={0}/>
            <NoteBox>
              <span style={{color:A.orange}}>Max pressure guide:</span><br/>
              Single leaf (1.2m wide): ~80 Pa<br/>
              Double leaf door: ~60 Pa<br/>
              NBC door force limit: 133 N
            </NoteBox>
          </div>
          <div>
            <SecHdr label="Compliance Checks" accent={A.orange}/>
            {checks.map((c,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                padding:'9px 11px',background:C.card,borderRadius:8,marginBottom:7,
                border:`1px solid ${c.ok?A.green+'25':A.red+'32'}`,boxShadow:C.sh}}>
                <div>
                  <div style={{fontSize:11,color:C.tx,marginBottom:2}}>{c.l}</div>
                  <div style={{fontSize:9,color:C.txM}}>{c.req}</div>
                </div>
                <span style={{fontSize:16}}>{c.ok?'✅':'❌'}</span>
              </div>
            ))}
            <NoteBox>
              <span style={{color:A.orange}}>NBC 2016 / NFPA 92:</span><br/>
              Staircase: 50 Pa (closed), 8 Pa (open)<br/>
              Lift Lobby: 30–50 Pa (closed)<br/>
              Lift Well: 50 Pa (closed)<br/>
              Max: 80 Pa (prevents door jamming)
            </NoteBox>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onSelect }) {
  const C=useT();
  const MODS=[
    {id:'staircase',title:'Staircase Pressurization',desc:'Calculate supply air for pressurized staircases as per NBC 2016 & NFPA 92.',icon:'🏗️',col:A.blue,badge:'NBC 2016'},
    {id:'liftwell', title:'Lift Well Pressurization',desc:'Lift shaft leakage area & required fan CFM for smoke control.',icon:'⬆️',col:A.purple,badge:'ASHRAE Ch.53'},
    {id:'lobby',    title:'Lobby / Vestibule',desc:'Lobby pressurization with door open/closed condition analysis.',icon:'🚪',col:A.teal,badge:'NFPA 92A'},
    {id:'pressure', title:'Pressure Differential',desc:'Verify 50 Pa (closed) & 8 Pa (open) differential per NBC 2016.',icon:'⚡',col:A.orange,badge:'Compliance'},
  ];
  return (
    <div style={{padding:'20px 16px',minHeight:'100vh'}}>
      <div style={{display:'flex',alignItems:'center',gap:13,marginBottom:16}}>
        <div style={{width:44,height:44,borderRadius:12,
          background:`linear-gradient(135deg,${A.blue},${A.purple})`,
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🔥</div>
        <div>
          <div style={{fontSize:17,fontWeight:800,color:C.tx,letterSpacing:'-.02em'}}>Fire Pressurization</div>
          <div style={{fontSize:10,color:C.txM,marginTop:1}}>MEP Engineering Calculator</div>
        </div>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:7,padding:'9px 12px',background:C.card,
        borderRadius:10,border:`1px solid ${C.bdr}`,marginBottom:18,boxShadow:C.sh}}>
        {['NBC 2016','NFPA 92','ASHRAE Ch.53','BS 12101'].map(s=>(
          <span key={s} style={{padding:'2px 8px',background:`${A.blue}18`,borderRadius:7,fontSize:9,color:A.blue,fontWeight:700}}>{s}</span>
        ))}
      </div>
      <div style={{fontSize:9,color:C.txM,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:11}}>CALCULATION MODULES</div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {MODS.map((m,i)=>(
          <button key={m.id} onClick={()=>onSelect(m.id)}
            style={{display:'flex',alignItems:'center',gap:12,padding:'13px 13px',
              background:`${m.col}0D`,border:`1px solid ${m.col}35`,borderRadius:12,
              cursor:'pointer',textAlign:'left',animation:`cardIn ${.1+i*.07}s ease-out both`,
              transition:'all .18s',boxShadow:C.sh}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${m.col}1A`;e.currentTarget.style.borderColor=`${m.col}65`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${m.col}0D`;e.currentTarget.style.borderColor=`${m.col}35`;}}>
            <div style={{width:44,height:44,borderRadius:10,background:`${m.col}20`,border:`1px solid ${m.col}45`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:21,flexShrink:0}}>{m.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:C.tx,marginBottom:2}}>{m.title}</div>
              <div style={{fontSize:10,color:C.txS,lineHeight:1.4}}>{m.desc}</div>
            </div>
            <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
              <span style={{fontSize:8,color:m.col,fontWeight:700,padding:'2px 7px',background:`${m.col}18`,borderRadius:9}}>{m.badge}</span>
              <span style={{color:C.txM,fontSize:15}}>›</span>
            </div>
          </button>
        ))}
      </div>
      <div style={{marginTop:20,textAlign:'center',fontSize:9,color:C.txM,lineHeight:2}}>
        Fire Safety Smoke Control Systems<br/>For professional MEP / HVAC use
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App({ darkMode: forceDark }: { darkMode?: boolean } = {}) {
  const [autoDark,setAutoDark]=useState(sniffDark);
  const [screen,setScreen]=useState('home');
  useEffect(()=>{
    const s=document.createElement('style'); s.id='firepressanim'; s.textContent=KF;
    if(!document.getElementById('firepressanim')) document.head.appendChild(s);
    return()=>document.getElementById('firepressanim')?.remove();
  },[]);
  useEffect(()=>{
    if(forceDark!==undefined) return;
    const check=()=>setAutoDark(sniffDark());
    const obs=new MutationObserver(check);
    obs.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-theme','data-color-scheme','data-bs-theme']});
    obs.observe(document.body,{attributes:true,attributeFilter:['class','data-theme','data-color-scheme']});
    return()=>obs.disconnect();
  },[forceDark]);
  const isDark=forceDark!==undefined?forceDark:autoDark;
  const palette=isDark?DARK:LITE;
  return (
    <TC.Provider value={palette}>
      <div style={{minHeight:'100vh',background:palette.bg,color:palette.tx,
        fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
        transition:'background .25s,color .25s'}}>
        {screen==='home'     &&<Dashboard onSelect={setScreen}/>}
        {screen==='staircase'&&<StaircaseScreen  onBack={()=>setScreen('home')}/>}
        {screen==='liftwell' &&<LiftWellScreen   onBack={()=>setScreen('home')}/>}
        {screen==='lobby'    &&<LobbyScreen      onBack={()=>setScreen('home')}/>}
        {screen==='pressure' &&<PressureDiffScreen onBack={()=>setScreen('home')}/>}
      </div>
    </TC.Provider>
  );
}
