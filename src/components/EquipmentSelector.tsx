import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Play,
  Pause,
  Maximize,
  Clipboard,
  Check,
  Sliders,
  Scale,
  Zap,
  Link,
  ChevronDown,
  ChevronUp,
  Calculator,
  ArrowRightLeft,
  HelpCircle,
  Map,
  Compass,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
//  1. STANDARD HVAC MODEL DATABASE WITH METADATA DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════

export interface EquipmentModel {
  model: string;
  type?: string;
  l: number;
  w: number;
  h: number;
  volt?: string;
  fla?: number;
  db?: string | number;
  [key: string]: any;
}

export interface InputMode {
  key: string;
  label: string;
  field: string;
}

export interface EquipmentCategory {
  label: string;
  icon: string;
  color: string;
  inputModes: InputMode[];
  models: EquipmentModel[];
}

export const MODEL_DATABASE: Record<string, EquipmentCategory> = {
  cooling_tower: {
    label: "Cooling Tower", icon: "🏗️", color: "#0ea5e9",
    inputModes: [
      { key: "tr", label: "TR", field: "cap_tr" },
      { key: "gpm", label: "GPM", field: "gpm" },
      { key: "m3h", label: "m³/hr", field: "m3h" },
    ],
    models: [
      { model: "CT-050", type: "Induced Draft Counterflow – FRP", cap_tr: 50, gpm: 150, m3h: 34, ewt: 38, lwt: 32, wbt: 27, fan_kw: 3.7, fan_dia: 1220, fans: 1, cells: 1, l: 2400, w: 2100, h: 2750, wt_dry: 1800, wt_op: 3200, wt_basin_full: 4100, wt_shipping: 1650, basin_l: 700, inlet_dn: "DN80", outlet_dn: "DN80", makeup_dn: "DN25", blowdown: "DN25", drift: "0.002%", evap: "1.0%", db: "60", volt: "415/3/50", fla: 8 },
      { model: "CT-075", type: "Induced Draft Counterflow – FRP", cap_tr: 75, gpm: 225, m3h: 51, ewt: 38, lwt: 32, wbt: 27, fan_kw: 5.5, fan_dia: 1370, fans: 1, cells: 1, l: 2700, w: 2300, h: 2900, wt_dry: 2400, wt_op: 4200, wt_basin_full: 5400, wt_shipping: 2200, basin_l: 950, inlet_dn: "DN100", outlet_dn: "DN100", makeup_dn: "DN25", blowdown: "DN25", drift: "0.002%", evap: "1.0%", db: "61", volt: "415/3/50", fla: 12 },
      { model: "CT-100", type: "Induced Draft Counterflow – FRP", cap_tr: 100, gpm: 300, m3h: 68, ewt: 38, lwt: 32, wbt: 27, fan_kw: 7.5, fan_dia: 1520, fans: 1, cells: 1, l: 3000, w: 2600, h: 3100, wt_dry: 3100, wt_op: 5500, wt_basin_full: 7000, wt_shipping: 2850, basin_l: 1200, inlet_dn: "DN125", outlet_dn: "DN125", makeup_dn: "DN32", blowdown: "DN32", drift: "0.002%", evap: "1.0%", db: "62", volt: "415/3/50", fla: 16 },
      { model: "CT-150", type: "Induced Draft Counterflow – FRP", cap_tr: 150, gpm: 450, m3h: 102, ewt: 38, lwt: 32, wbt: 27, fan_kw: 11, fan_dia: 1830, fans: 1, cells: 1, l: 3600, w: 3000, h: 3400, wt_dry: 4200, wt_op: 7800, wt_shipping: 3900, wt_basin_full: 9800, basin_l: 1700, inlet_dn: "DN150", outlet_dn: "DN150", makeup_dn: "DN32", blowdown: "DN32", drift: "0.002%", evap: "1.0%", db: "63", volt: "415/3/50", fla: 23 },
      { model: "CT-200", type: "Induced Draft Counterflow – FRP", cap_tr: 200, gpm: 600, m3h: 136, ewt: 38, lwt: 32, wbt: 27, fan_kw: 15, fan_dia: 2130, fans: 1, cells: 1, l: 4200, w: 3600, h: 3750, wt_dry: 5600, wt_op: 10500, wt_shipping: 5200, wt_basin_full: 13200, basin_l: 2200, inlet_dn: "DN200", outlet_dn: "DN200", makeup_dn: "DN40", blowdown: "DN40", drift: "0.002%", evap: "1.0%", db: "64", volt: "415/3/50", fla: 31 },
      { model: "CT-250", type: "Induced Draft Crossflow – FRP", cap_tr: 250, gpm: 750, m3h: 170, ewt: 38, lwt: 32, wbt: 27, fan_kw: 18.5, fan_dia: 2440, fans: 1, cells: 1, l: 4800, w: 3900, h: 4000, wt_dry: 7000, wt_op: 13200, wt_shipping: 6500, wt_basin_full: 16500, basin_l: 2600, inlet_dn: "DN200", outlet_dn: "DN200", makeup_dn: "DN40", blowdown: "DN40", drift: "0.002%", evap: "1.0%", db: "65", volt: "415/3/50", fla: 38 },
      { model: "CT-300", type: "Induced Draft Crossflow – FRP", cap_tr: 300, gpm: 900, m3h: 204, ewt: 38, lwt: 32, wbt: 27, fan_kw: 22, fan_dia: 2440, fans: 2, cells: 1, l: 5400, w: 4200, h: 4200, wt_dry: 8500, wt_op: 16000, wt_shipping: 7800, wt_basin_full: 20000, basin_l: 3100, inlet_dn: "DN250", outlet_dn: "DN250", makeup_dn: "DN50", blowdown: "DN50", drift: "0.002%", evap: "1.0%", db: "65", volt: "415/3/50", fla: 46 },
      { model: "CT-400", type: "Induced Draft Crossflow – FRP", cap_tr: 400, gpm: 1200, m3h: 272, ewt: 38, lwt: 32, wbt: 27, fan_kw: 30, fan_dia: 2740, fans: 2, cells: 1, l: 6000, w: 4800, h: 4500, wt_dry: 11000, wt_op: 20000, wt_shipping: 10200, wt_basin_full: 25500, basin_l: 4000, inlet_dn: "DN300", outlet_dn: "DN300", makeup_dn: "DN50", blowdown: "DN50", drift: "0.002%", evap: "1.0%", db: "66", volt: "415/3/50", fla: 60 },
      { model: "CT-500", type: "Induced Draft Crossflow – FRP", cap_tr: 500, gpm: 1500, m3h: 340, ewt: 38, lwt: 32, wbt: 27, fan_kw: 37, fan_dia: 3050, fans: 2, cells: 1, l: 7200, w: 5400, h: 4800, wt_dry: 14000, wt_op: 25000, wt_shipping: 13000, wt_basin_full: 32000, basin_l: 5000, inlet_dn: "DN300", outlet_dn: "DN300", makeup_dn: "DN65", blowdown: "DN65", drift: "0.002%", evap: "1.0%", db: "67", volt: "415/3/50", fla: 75 },
      { model: "CT-600", type: "Forced Draft Crossflow – MS+FRP", cap_tr: 600, gpm: 1800, m3h: 408, ewt: 38, lwt: 32, wbt: 27, fan_kw: 45, fan_dia: 3050, fans: 2, cells: 2, l: 8400, w: 5400, h: 5000, wt_dry: 18000, wt_op: 32000, wt_shipping: 16500, wt_basin_full: 41000, basin_l: 6000, inlet_dn: "DN350", outlet_dn: "DN350", makeup_dn: "DN65", blowdown: "DN65", drift: "0.002%", evap: "1.0%", db: "67", volt: "415/3/50", fla: 90 },
      { model: "CT-800", type: "Forced Draft Crossflow – MS+FRP", cap_tr: 800, gpm: 2400, m3h: 545, ewt: 38, lwt: 32, wbt: 27, fan_kw: 55, fan_dia: 3660, fans: 2, cells: 2, l: 9600, w: 6000, h: 5400, wt_dry: 23000, wt_op: 42000, wt_shipping: 21000, wt_basin_full: 54000, basin_l: 8000, inlet_dn: "DN400", outlet_dn: "DN400", makeup_dn: "DN80", blowdown: "DN80", drift: "0.002%", evap: "1.0%", db: "68", volt: "415/3/50", fla: 112 },
      { model: "CT-1000", type: "Forced Draft Crossflow – MS+FRP", cap_tr: 1000, gpm: 3000, m3h: 680, ewt: 38, lwt: 32, wbt: 27, fan_kw: 75, fan_dia: 3660, fans: 4, cells: 2, l: 12000, w: 6000, h: 5800, wt_dry: 30000, wt_op: 55000, wt_shipping: 27500, wt_basin_full: 70000, basin_l: 10000, inlet_dn: "DN450", outlet_dn: "DN450", makeup_dn: "DN80", blowdown: "DN80", drift: "0.002%", evap: "1.0%", db: "69", volt: "415/3/50", fla: 145 },
    ],
  },
  chiller_wc: {
    label: "Chiller – Water Cooled", icon: "❄️", color: "#6366f1",
    inputModes: [
      { key: "tr", label: "TR", field: "cap_tr" },
      { key: "kw", label: "kW", field: "cap_kw" },
      { key: "chw_gpm", label: "CHW GPM", field: "chw_flow_gpm" },
      { key: "cdw_gpm", label: "CDW GPM", field: "cdw_flow_gpm" },
    ],
    models: [
      { model: "WCC-070", cap_tr: 70, cap_kw: 246, cop: 6.2, kw_tr: 0.54, chw_flow_gpm: 168, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 210, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Twin-Screw", l: 2450, w: 900, h: 1750, wt_dry: 2400, wt_op: 3100, wt_ship: 2800, wt_refrig: 85, chw_dn: "DN80", cdw_dn: "DN100", drain: "DN32", volt: "415/3/50", fla: 95, mca: 100, mocp: 125, db: "75" },
      { model: "WCC-100", cap_tr: 100, cap_kw: 352, cop: 6.2, kw_tr: 0.54, chw_flow_gpm: 240, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 300, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Twin-Screw", l: 2650, w: 950, h: 1800, wt_dry: 3000, wt_op: 3800, wt_ship: 3400, wt_refrig: 110, chw_dn: "DN100", cdw_dn: "DN125", drain: "DN32", volt: "415/3/50", fla: 130, mca: 140, mocp: 160, db: "76" },
      { model: "WCC-150", cap_tr: 150, cap_kw: 528, cop: 6.3, kw_tr: 0.53, chw_flow_gpm: 360, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 450, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Twin-Screw", l: 2950, w: 1000, h: 1850, wt_dry: 3900, wt_op: 5000, wt_ship: 4500, wt_refrig: 145, chw_dn: "DN125", cdw_dn: "DN150", drain: "DN32", volt: "415/3/50", fla: 190, mca: 205, mocp: 250, db: "77" },
      { model: "WCC-200", cap_tr: 200, cap_kw: 703, cop: 6.3, kw_tr: 0.53, chw_flow_gpm: 480, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 600, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Twin-Screw", l: 3250, w: 1050, h: 1900, wt_dry: 5200, wt_op: 6500, wt_ship: 5800, wt_refrig: 190, chw_dn: "DN150", cdw_dn: "DN200", drain: "DN40", volt: "415/3/50", fla: 250, mca: 265, mocp: 315, db: "78" },
      { model: "WCC-250", cap_tr: 250, cap_kw: 879, cop: 6.4, kw_tr: 0.52, chw_flow_gpm: 600, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 750, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Twin-Screw", l: 3600, w: 1100, h: 1950, wt_dry: 6200, wt_op: 7800, wt_ship: 7000, wt_refrig: 230, chw_dn: "DN150", cdw_dn: "DN200", drain: "DN40", volt: "415/3/50", fla: 310, mca: 330, mocp: 400, db: "79" },
      { model: "WCC-300", cap_tr: 300, cap_kw: 1055, cop: 6.4, kw_tr: 0.52, chw_flow_gpm: 720, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 900, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Twin-Screw", l: 3900, w: 1150, h: 2000, wt_dry: 7400, wt_op: 9200, wt_ship: 8200, wt_refrig: 280, chw_dn: "DN200", cdw_dn: "DN250", drain: "DN40", volt: "415/3/50", fla: 370, mca: 395, mocp: 500, db: "79" },
      { model: "WCC-400", cap_tr: 400, cap_kw: 1407, cop: 6.5, kw_tr: 0.51, chw_flow_gpm: 960, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 1200, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Twin-Screw", l: 4500, w: 1250, h: 2100, wt_dry: 10000, wt_op: 12500, wt_ship: 11000, wt_refrig: 370, chw_dn: "DN200", cdw_dn: "DN250", drain: "DN50", volt: "415/3/50", fla: 490, mca: 520, mocp: 630, db: "80" },
      { model: "WCC-500", cap_tr: 500, cap_kw: 1758, cop: 6.5, kw_tr: 0.51, chw_flow_gpm: 1200, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 1500, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Centrifugal", l: 5200, w: 1500, h: 2300, wt_dry: 13500, wt_op: 17000, wt_ship: 15000, wt_refrig: 480, chw_dn: "DN250", cdw_dn: "DN300", drain: "DN50", volt: "415/3/50", fla: 610, mca: 645, mocp: 800, db: "81" },
      { model: "WCC-600", cap_tr: 600, cap_kw: 2110, cop: 6.6, kw_tr: 0.50, chw_flow_gpm: 1440, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 1800, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Centrifugal", l: 5800, w: 1600, h: 2400, wt_dry: 16500, wt_op: 20500, wt_ship: 18000, wt_refrig: 580, chw_dn: "DN300", cdw_dn: "DN350", drain: "DN50", volt: "415/3/50", fla: 725, mca: 770, mocp: 1000, db: "82" },
      { model: "WCC-800", cap_tr: 800, cap_kw: 2814, cop: 6.7, kw_tr: 0.49, chw_flow_gpm: 1920, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 2400, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Centrifugal", l: 6800, w: 1800, h: 2600, wt_dry: 22000, wt_op: 27500, wt_ship: 24000, wt_refrig: 780, chw_dn: "DN350", cdw_dn: "DN400", drain: "DN65", volt: "415/3/50", fla: 960, mca: 1010, mocp: 1250, db: "83" },
      { model: "WCC-1000", cap_tr: 1000, cap_kw: 3517, cop: 6.7, kw_tr: 0.49, chw_flow_gpm: 2400, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 3000, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-134a", comp: "Centrifugal", l: 7500, w: 2000, h: 2800, wt_dry: 27000, wt_op: 34000, wt_ship: 30000, wt_refrig: 980, chw_dn: "DN400", cdw_dn: "DN500", drain: "DN65", volt: "415/3/50", fla: 1200, mca: 1260, mocp: 1600, db: "84" },
      { model: "WCC-1200", cap_tr: 1200, cap_kw: 4220, cop: 6.8, kw_tr: 0.48, chw_flow_gpm: 2880, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 3600, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-1234ze", comp: "Mag-Bearing Cent.", l: 8000, w: 2100, h: 2900, wt_dry: 32000, wt_op: 40000, wt_ship: 35500, wt_refrig: 1100, chw_dn: "DN450", cdw_dn: "DN500", drain: "DN65", volt: "415/3/50", fla: 1440, mca: 1510, mocp: 1600, db: "84" },
      { model: "WCC-1500", cap_tr: 1500, cap_kw: 5276, cop: 6.8, kw_tr: 0.48, chw_flow_gpm: 3600, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 4500, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-1234ze", comp: "Mag-Bearing Cent.", l: 8800, w: 2200, h: 3000, wt_dry: 39000, wt_op: 49000, wt_ship: 43000, wt_refrig: 1350, chw_dn: "DN500", cdw_dn: "DN600", drain: "DN80", volt: "6.6kV/3/50", fla: 520, mca: 545, mocp: 630, db: "85" },
      { model: "WCC-2000", cap_tr: 2000, cap_kw: 7034, cop: 6.9, kw_tr: 0.47, chw_flow_gpm: 4800, chw_ewt: 12, chw_lwt: 7, cdw_flow_gpm: 6000, cdw_ewt: 30, cdw_lwt: 35, refrig: "R-1234ze", comp: "Mag-Bearing Cent.", l: 10200, w: 2500, h: 3200, wt_dry: 52000, wt_op: 65000, wt_ship: 57000, wt_refrig: 1800, chw_dn: "DN600", cdw_dn: "DN700", drain: "DN80", volt: "6.6kV/3/50", fla: 690, mca: 725, mocp: 800, db: "86" },
    ],
  },
  chiller_ac: {
    label: "Chiller – Air Cooled", icon: "🌡️", color: "#8b5cf6",
    inputModes: [
      { key: "tr", label: "TR", field: "cap_tr" },
      { key: "kw", label: "kW", field: "cap_kw" },
      { key: "chw_gpm", label: "CHW GPM", field: "chw_flow_gpm" },
    ],
    models: [
      { model: "ACC-050", cap_tr: 50, cap_kw: 176, cop: 3.2, kw_tr: 1.10, chw_flow_gpm: 120, chw_ewt: 12, chw_lwt: 7, refrig: "R-410A", comp: "Scroll", l: 3800, w: 2200, h: 2000, wt_dry: 1900, wt_op: 2400, wt_ship: 2100, wt_refrig: 42, chw_dn: "DN100", drain: "DN32", fans: 4, fan_kw: 1.5, volt: "415/3/50", fla: 90, mca: 100, mocp: 125, db: "78" },
      { model: "ACC-080", cap_tr: 80, cap_kw: 281, cop: 3.2, kw_tr: 1.10, chw_flow_gpm: 192, chw_ewt: 12, chw_lwt: 7, refrig: "R-410A", comp: "Scroll", l: 5400, w: 2200, h: 2100, wt_dry: 2800, wt_op: 3500, wt_ship: 3100, wt_refrig: 68, chw_dn: "DN125", drain: "DN32", fans: 6, fan_kw: 1.5, volt: "415/3/50", fla: 142, mca: 155, mocp: 200, db: "79" },
      { model: "ACC-100", cap_tr: 100, cap_kw: 352, cop: 3.15, kw_tr: 1.12, chw_flow_gpm: 240, chw_ewt: 12, chw_lwt: 7, refrig: "R-410A", comp: "Screw", l: 6200, w: 2300, h: 2200, wt_dry: 3500, wt_op: 4400, wt_ship: 3900, wt_refrig: 88, chw_dn: "DN125", drain: "DN32", fans: 8, fan_kw: 2.2, volt: "415/3/50", fla: 175, mca: 190, mocp: 250, db: "80" },
      { model: "ACC-150", cap_tr: 150, cap_kw: 527, cop: 3.1, kw_tr: 1.13, chw_flow_gpm: 360, chw_ewt: 12, chw_lwt: 7, refrig: "R-410A", comp: "Screw", l: 8500, w: 2300, h: 2300, wt_dry: 4800, wt_op: 6000, wt_ship: 5300, wt_refrig: 130, chw_dn: "DN150", drain: "DN40", fans: 10, fan_kw: 2.2, volt: "415/3/50", fla: 262, mca: 280, mocp: 350, db: "81" },
      { model: "ACC-200", cap_tr: 200, cap_kw: 703, cop: 3.0, kw_tr: 1.17, chw_flow_gpm: 480, chw_ewt: 12, chw_lwt: 7, refrig: "R-134a", comp: "Screw", l: 10200, w: 2400, h: 2400, wt_dry: 6300, wt_op: 7900, wt_ship: 7000, wt_refrig: 175, chw_dn: "DN200", drain: "DN40", fans: 12, fan_kw: 3.0, volt: "415/3/50", fla: 345, mca: 370, mocp: 450, db: "82" },
      { model: "ACC-250", cap_tr: 250, cap_kw: 879, cop: 3.0, kw_tr: 1.17, chw_flow_gpm: 600, chw_ewt: 12, chw_lwt: 7, refrig: "R-134a", comp: "Screw", l: 12000, w: 2500, h: 2500, wt_dry: 7900, wt_op: 9900, wt_ship: 8700, wt_refrig: 215, chw_dn: "DN200", drain: "DN40", fans: 14, fan_kw: 3.0, volt: "415/3/50", fla: 430, mca: 460, mocp: 560, db: "83" },
      { model: "ACC-300", cap_tr: 300, cap_kw: 1055, cop: 2.95, kw_tr: 1.19, chw_flow_gpm: 720, chw_ewt: 12, chw_lwt: 7, refrig: "R-134a", comp: "Screw", l: 14000, w: 2600, h: 2600, wt_dry: 9500, wt_op: 11900, wt_ship: 10500, wt_refrig: 260, chw_dn: "DN250", drain: "DN50", fans: 16, fan_kw: 3.7, volt: "415/3/50", fla: 510, mca: 545, mocp: 630, db: "84" },
      { model: "ACC-350", cap_tr: 350, cap_kw: 1231, cop: 2.95, kw_tr: 1.19, chw_flow_gpm: 840, chw_ewt: 12, chw_lwt: 7, refrig: "R-134a", comp: "Screw", l: 16000, w: 2700, h: 2700, wt_dry: 11200, wt_op: 14000, wt_ship: 12300, wt_refrig: 300, chw_dn: "DN250", drain: "DN50", fans: 18, fan_kw: 4.0, volt: "415/3/50", fla: 595, mca: 630, mocp: 800, db: "84" },
    ],
  },
  ahu: {
    label: "Air Handling Unit (AHU)", icon: "💨", color: "#10b981",
    inputModes: [
      { key: "cfm", label: "CFM", field: "cfm" },
      { key: "m3h", label: "m³/hr", field: "cms" },
      { key: "tr", label: "TR", field: "cc_tr" },
    ],
    models: [
      { model: "AHU-2000", cfm: 2000, cms: 3400, cc_kw: 22, cc_tr: 6.3, hc_kw: 8, chw_gpm: 13, chw_ewt: 7, chw_lwt: 14, esp_pa: 300, fan_kw: 2.2, fan_rpm: 960, l: 1800, w: 700, h: 900, wt_empty: 210, wt_ship: 240, wt_op: 280, wt_full_coil: 310, chw_dn: "DN32", drain: "DN32", duct_s: "500×400", duct_r: "600×500", filter: "G4+F7", volt: "415/3/50", fla: 6, db: "62" },
      { model: "AHU-4000", cfm: 4000, cms: 6800, cc_kw: 44, cc_tr: 12.5, hc_kw: 15, chw_gpm: 26, chw_ewt: 7, chw_lwt: 14, esp_pa: 350, fan_kw: 4.0, fan_rpm: 960, l: 2200, w: 900, h: 1100, wt_empty: 380, wt_ship: 430, wt_op: 480, wt_full_coil: 530, chw_dn: "DN40", drain: "DN32", duct_s: "700×600", duct_r: "800×700", filter: "G4+F7", volt: "415/3/50", fla: 10, db: "63" },
      { model: "AHU-6000", cfm: 6000, cms: 10200, cc_kw: 66, cc_tr: 18.8, hc_kw: 22, chw_gpm: 40, chw_ewt: 7, chw_lwt: 14, esp_pa: 400, fan_kw: 5.5, fan_rpm: 960, l: 2600, w: 1000, h: 1250, wt_empty: 540, wt_ship: 610, wt_op: 680, wt_full_coil: 750, chw_dn: "DN50", drain: "DN32", duct_s: "900×700", duct_r: "1000×800", filter: "G4+F7", volt: "415/3/50", fla: 14, db: "64" },
      { model: "AHU-8000", cfm: 8000, cms: 13600, cc_kw: 88, cc_tr: 25.0, hc_kw: 30, chw_gpm: 53, chw_ewt: 7, chw_lwt: 14, esp_pa: 450, fan_kw: 7.5, fan_rpm: 960, l: 3000, w: 1100, h: 1350, wt_empty: 710, wt_ship: 800, wt_op: 880, wt_full_coil: 970, chw_dn: "DN65", drain: "DN40", duct_s: "1100×800", duct_r: "1200×900", filter: "G4+F7", volt: "415/3/50", fla: 18, db: "65" },
      { model: "AHU-10000", cfm: 10000, cms: 17000, cc_kw: 110, cc_tr: 31.3, hc_kw: 37, chw_gpm: 66, chw_ewt: 7, chw_lwt: 14, esp_pa: 500, fan_kw: 11, fan_rpm: 960, l: 3400, w: 1200, h: 1500, wt_empty: 890, wt_ship: 1000, wt_op: 1100, wt_full_coil: 1210, chw_dn: "DN65", drain: "DN40", duct_s: "1300×900", duct_r: "1400×1000", filter: "G4+F7", volt: "415/3/50", fla: 24, db: "66" },
      { model: "AHU-12000", cfm: 12000, cms: 20400, cc_kw: 132, cc_tr: 37.5, hc_kw: 44, chw_gpm: 79, chw_ewt: 7, chw_lwt: 14, esp_pa: 500, fan_kw: 15, fan_rpm: 720, l: 3800, w: 1300, h: 1600, wt_empty: 1080, wt_ship: 1220, wt_op: 1350, wt_full_coil: 1490, chw_dn: "DN80", drain: "DN40", duct_s: "1400×1000", duct_r: "1500×1100", filter: "G4+F7", volt: "415/3/50", fla: 30, db: "67" },
      { model: "AHU-15000", cfm: 15000, cms: 25500, cc_kw: 165, cc_tr: 46.9, hc_kw: 55, chw_gpm: 99, chw_ewt: 7, chw_lwt: 14, esp_pa: 600, fan_kw: 18.5, fan_rpm: 720, l: 4200, w: 1400, h: 1750, wt_empty: 1340, wt_ship: 1510, wt_op: 1650, wt_full_coil: 1820, chw_dn: "DN80", drain: "DN50", duct_s: "1600×1100", duct_r: "1800×1200", filter: "G4+F7", volt: "415/3/50", fla: 38, db: "68" },
      { model: "AHU-20000", cfm: 20000, cms: 34000, cc_kw: 220, cc_tr: 62.5, hc_kw: 75, chw_gpm: 132, chw_ewt: 7, chw_lwt: 14, esp_pa: 650, fan_kw: 22, fan_rpm: 720, l: 5000, w: 1500, h: 1900, wt_empty: 1700, wt_ship: 1910, wt_op: 2100, wt_full_coil: 2310, chw_dn: "DN100", drain: "DN50", duct_s: "1800×1300", duct_r: "2000×1400", filter: "G4+F7", volt: "415/3/50", fla: 46, db: "69" },
      { model: "AHU-30000", cfm: 30000, cms: 51000, cc_kw: 330, cc_tr: 93.8, hc_kw: 110, chw_gpm: 198, chw_ewt: 7, chw_lwt: 14, esp_pa: 700, fan_kw: 37, fan_rpm: 720, l: 6200, w: 1800, h: 2100, wt_empty: 2600, wt_ship: 2920, wt_op: 3200, wt_full_coil: 3530, chw_dn: "DN125", drain: "DN65", duct_s: "2200×1600", duct_r: "2400×1800", filter: "G4+F7", volt: "415/3/50", fla: 72, db: "70" },
      { model: "AHU-40000", cfm: 40000, cms: 68000, cc_kw: 440, cc_tr: 125, hc_kw: 150, chw_gpm: 264, chw_ewt: 7, chw_lwt: 14, esp_pa: 750, fan_kw: 55, fan_rpm: 720, l: 7500, w: 2000, h: 2300, wt_empty: 3700, wt_ship: 4150, wt_op: 4500, wt_full_coil: 4960, chw_dn: "DN150", drain: "DN65", duct_s: "2600×1900", duct_r: "2800×2000", filter: "G4+F7", volt: "415/3/50", fla: 106, db: "71" },
    ],
  },
  tfa: {
    label: "TFA (Treated Fresh Air)", icon: "🌿", color: "#06b6d4",
    inputModes: [
      { key: "cfm", label: "CFM", field: "cfm" },
      { key: "m3h", label: "m³/hr", field: "cms" },
      { key: "tr", label: "TR", field: "cc_tr" },
    ],
    models: [
      { model: "TFA-1000", cfm: 1000, cms: 1700, cc_kw: 22, cc_tr: 6.3, dh_kw: 15, chw_gpm: 13, chw_ewt: 7, chw_lwt: 14, sat: "14°C DB / 95% RH", esp_pa: 150, fan_kw: 1.5, fan_rpm: 1450, l: 1500, w: 650, h: 850, wt_empty: 180, wt_ship: 205, wt_op: 220, wt_full_coil: 245, chw_dn: "DN32", drain: "DN32", duct_s: "400×300", filter: "G4+F7", volt: "415/3/50", fla: 5, db: "58" },
      { model: "TFA-2000", cfm: 2000, cms: 3400, cc_kw: 44, cc_tr: 12.5, dh_kw: 28, chw_gpm: 26, chw_ewt: 7, chw_lwt: 14, sat: "14°C DB / 95% RH", esp_pa: 200, fan_kw: 2.2, fan_rpm: 1450, l: 1800, w: 750, h: 950, wt_empty: 260, wt_ship: 295, wt_op: 320, wt_full_coil: 355, chw_dn: "DN40", drain: "DN32", duct_s: "500×400", filter: "G4+F7", volt: "415/3/50", fla: 6.5, db: "59" },
      { model: "TFA-3000", cfm: 3000, cms: 5100, cc_kw: 66, cc_tr: 18.8, dh_kw: 42, chw_gpm: 40, chw_ewt: 7, chw_lwt: 14, sat: "14°C DB / 95% RH", esp_pa: 250, fan_kw: 3.0, fan_rpm: 1450, l: 2100, w: 850, h: 1050, wt_empty: 360, wt_ship: 408, wt_op: 440, wt_full_coil: 490, chw_dn: "DN50", drain: "DN32", duct_s: "600×500", filter: "G4+F7", volt: "415/3/50", fla: 8, db: "60" },
      { model: "TFA-5000", cfm: 5000, cms: 8500, cc_kw: 110, cc_tr: 31.3, dh_kw: 70, chw_gpm: 66, chw_ewt: 7, chw_lwt: 14, sat: "14°C DB / 95% RH", esp_pa: 300, fan_kw: 5.5, fan_rpm: 960, l: 2800, w: 1000, h: 1200, wt_empty: 555, wt_ship: 627, wt_op: 680, wt_full_coil: 752, chw_dn: "DN65", drain: "DN40", duct_s: "800×600", filter: "G4+F7", volt: "415/3/50", fla: 14, db: "62" },
      { model: "TFA-8000", cfm: 8000, cms: 13600, cc_kw: 176, cc_tr: 50.0, dh_kw: 110, chw_gpm: 106, chw_ewt: 7, chw_lwt: 14, sat: "14°C DB / 95% RH", esp_pa: 350, fan_kw: 7.5, fan_rpm: 960, l: 3400, w: 1100, h: 1350, wt_empty: 780, wt_ship: 882, wt_op: 950, wt_full_coil: 1052, chw_dn: "DN80", drain: "DN40", duct_s: "1000×750", filter: "G4+F7", volt: "415/3/50", fla: 18, db: "63" },
      { model: "TFA-10000", cfm: 10000, cms: 17000, cc_kw: 220, cc_tr: 62.5, dh_kw: 140, chw_gpm: 132, chw_ewt: 7, chw_lwt: 14, sat: "14°C DB / 95% RH", esp_pa: 400, fan_kw: 11, fan_rpm: 960, l: 3800, w: 1200, h: 1450, wt_empty: 990, wt_ship: 1118, wt_op: 1200, wt_full_coil: 1330, chw_dn: "DN100", drain: "DN50", duct_s: "1200×900", filter: "G4+F7", volt: "415/3/50", fla: 24, db: "64" },
    ],
  },
  hru: {
    label: "HRU (Heat Recovery Unit)", icon: "♻️", color: "#f59e0b",
    inputModes: [
      { key: "cfm", label: "CFM", field: "cfm" },
      { key: "m3h", label: "m³/hr", field: "cms" },
      { key: "tr", label: "TR (saved)", field: "saved_tr" },
    ],
    models: [
      { model: "HRU-500", cfm: 500, cms: 850, saved_tr: 1.0, eff: "75% Sensible", type: "Plate – Cross-flow", energy_kw: 3.5, esp_pa: 150, fan_kw: 0.37, fan_rpm: 1450, l: 800, w: 650, h: 650, wt_empty: 72, wt_ship: 82, wt_op: 85, wt_full: 88, filter: "G4", volt: "230/1/50", fla: 3, db: "42" },
      { model: "HRU-1000", cfm: 1000, cms: 1700, saved_tr: 2.0, eff: "75% Sensible", type: "Plate – Cross-flow", energy_kw: 7, esp_pa: 150, fan_kw: 0.55, fan_rpm: 1450, l: 1000, w: 800, h: 750, wt_empty: 110, wt_ship: 124, wt_op: 130, wt_full: 136, filter: "G4", volt: "230/1/50", fla: 4, db: "44" },
      { model: "HRU-2000", cfm: 2000, cms: 3400, saved_tr: 4.0, eff: "78% Total", type: "Rotary Wheel – Hygroscopic", energy_kw: 14, esp_pa: 200, fan_kw: 1.1, fan_rpm: 1450, l: 1200, w: 1000, h: 900, wt_empty: 185, wt_ship: 208, wt_op: 220, wt_full: 232, filter: "G4", volt: "415/3/50", fla: 4, db: "48" },
      { model: "HRU-4000", cfm: 4000, cms: 6800, saved_tr: 8.0, eff: "80% Total", type: "Rotary Wheel – Hygroscopic", energy_kw: 28, esp_pa: 250, fan_kw: 2.2, fan_rpm: 1450, l: 1600, w: 1300, h: 1100, wt_empty: 320, wt_ship: 361, wt_op: 380, wt_full: 400, filter: "G4", volt: "415/3/50", fla: 6, db: "52" },
      { model: "HRU-6000", cfm: 6000, cms: 10200, saved_tr: 12.0, eff: "82% Total", type: "Rotary Wheel – Hygroscopic", energy_kw: 42, esp_pa: 300, fan_kw: 3.7, fan_rpm: 960, l: 2000, w: 1500, h: 1300, wt_empty: 495, wt_ship: 558, wt_op: 580, wt_full: 610, filter: "G4+F7", volt: "415/3/50", fla: 9, db: "54" },
      { model: "HRU-10000", cfm: 10000, cms: 17000, saved_tr: 20.0, eff: "82% Total", type: "Rotary Wheel – Hygroscopic", energy_kw: 70, esp_pa: 350, fan_kw: 7.5, fan_rpm: 960, l: 2600, w: 1900, h: 1650, wt_empty: 810, wt_ship: 913, wt_op: 950, wt_full: 998, filter: "G4+F7", volt: "415/3/50", fla: 18, db: "56" },
      { model: "HRU-15000", cfm: 15000, cms: 25500, saved_tr: 30.0, eff: "82% Total", type: "Rotary Wheel – Hygroscopic", energy_kw: 105, esp_pa: 400, fan_kw: 11, fan_rpm: 960, l: 3200, w: 2200, h: 2000, wt_empty: 1200, wt_ship: 1353, wt_op: 1400, wt_full: 1470, filter: "G4+F7", volt: "415/3/50", fla: 24, db: "58" },
    ],
  },
  pump_chw: {
    label: "CHW Pump", icon: "🔄", color: "#fb8c00",
    inputModes: [
      { key: "gpm", label: "GPM", field: "gpm" },
      { key: "m3h", label: "m³/hr", field: "m3h" },
    ],
    models: [
      { model: "END-40/125", type: "End Suction – Close Coupled", gpm: 50, m3h: 11.4, head_m: 12, head_ft: 39, kw: 1.5, rpm: 1450, eff: 68, impeller: 125, casing: "Cast Iron", seal: "Mechanical Single", suc_dn: "DN50", dis_dn: "DN40", l: 550, w: 280, h: 420, wt_bare: 52, wt_motor: 18, wt_total: 68, wt_op: 72, volt: "415/3/50", fla: 4, db: "58" },
      { model: "END-50/160", type: "End Suction – Close Coupled", gpm: 100, m3h: 22.7, head_m: 18, head_ft: 59, kw: 3.0, rpm: 1450, eff: 72, impeller: 160, casing: "Cast Iron", seal: "Mechanical Single", suc_dn: "DN65", dis_dn: "DN50", l: 650, w: 320, h: 480, wt_bare: 72, wt_motor: 26, wt_total: 95, wt_op: 102, volt: "415/3/50", fla: 7, db: "59" },
      { model: "END-65/200", type: "End Suction – Base Mounted", gpm: 200, m3h: 45.5, head_m: 25, head_ft: 82, kw: 7.5, rpm: 1450, eff: 75, impeller: 200, casing: "Cast Iron", seal: "Mechanical Single", suc_dn: "DN80", dis_dn: "DN65", l: 800, w: 380, h: 560, wt_bare: 108, wt_motor: 38, wt_total: 145, wt_op: 155, volt: "415/3/50", fla: 16, db: "61" },
      { model: "END-80/250", type: "End Suction – Base Mounted", gpm: 350, m3h: 79.5, head_m: 32, head_ft: 105, kw: 18.5, rpm: 1450, eff: 78, impeller: 250, casing: "Cast Iron", seal: "Mechanical Single", suc_dn: "DN100", dis_dn: "DN80", l: 1000, w: 450, h: 660, wt_bare: 168, wt_motor: 65, wt_total: 230, wt_op: 246, volt: "415/3/50", fla: 38, db: "63" },
      { model: "END-100/315", type: "End Suction – Base Mounted", gpm: 600, m3h: 136, head_m: 40, head_ft: 131, kw: 37, rpm: 1450, eff: 80, impeller: 315, casing: "Cast Iron", seal: "Mechanical Single", suc_dn: "DN125", dis_dn: "DN100", l: 1200, w: 560, h: 800, wt_bare: 280, wt_motor: 102, wt_total: 380, wt_op: 407, volt: "415/3/50", fla: 72, db: "66" },
      { model: "SPL-125/315", type: "Split Case – Double Suction", gpm: 1000, m3h: 227, head_m: 45, head_ft: 148, kw: 75, rpm: 1450, eff: 82, impeller: 315, casing: "Cast Steel", seal: "Mechanical Double", suc_dn: "DN150", dis_dn: "DN125", l: 1800, w: 700, h: 950, wt_bare: 520, wt_motor: 200, wt_total: 720, wt_op: 770, volt: "415/3/50", fla: 145, db: "70" },
      { model: "SPL-150/400", type: "Split Case – Double Suction", gpm: 1500, m3h: 341, head_m: 50, head_ft: 164, kw: 132, rpm: 1450, eff: 83, impeller: 400, casing: "Cast Steel", seal: "Mechanical Double", suc_dn: "DN200", dis_dn: "DN150", l: 2100, w: 820, h: 1100, wt_bare: 780, wt_motor: 320, wt_total: 1100, wt_op: 1175, volt: "415/3/50", fla: 255, db: "72" },
      { model: "SPL-200/450", type: "Split Case – Double Suction", gpm: 2400, m3h: 545, head_m: 55, head_ft: 180, kw: 220, rpm: 960, eff: 84, impeller: 450, casing: "Cast Steel", seal: "Mechanical Double", suc_dn: "DN250", dis_dn: "DN200", l: 2500, w: 950, h: 1250, wt_bare: 1180, wt_motor: 470, wt_total: 1650, wt_op: 1765, volt: "415/3/50", fla: 425, db: "74" },
    ],
  },
  exhaust_fan: {
    label: "Exhaust Fan", icon: "🌀", color: "#ef4444",
    inputModes: [
      { key: "cfm", label: "CFM", field: "cfm" },
      { key: "m3h", label: "m³/hr", field: "cms" },
    ],
    models: [
      { model: "ACF-300", type: "Propeller Axial – Wall Mount", cfm: 300, cms: 510, sp_pa: 100, kw: 0.12, rpm: 1450, dia: 300, l: 380, w: 380, h: 200, wt_bare: 8, wt_motor: 4, wt_total: 12, wt_op: 12, filter: "—", volt: "230/1/50", fla: 1.2, db: "42" },
      { model: "ACF-500", type: "Propeller Axial – Duct Inline", cfm: 500, cms: 850, sp_pa: 150, kw: 0.18, rpm: 1450, dia: 400, l: 480, w: 480, h: 220, wt_bare: 12, wt_motor: 6, wt_total: 18, wt_op: 18, filter: "—", volt: "230/1/50", fla: 1.6, db: "44" },
      { model: "BCF-800", type: "Centrifugal – Direct Drive", cfm: 800, cms: 1360, sp_pa: 200, kw: 0.37, rpm: 1450, dia: 450, l: 550, w: 550, h: 380, wt_bare: 20, wt_motor: 10, wt_total: 30, wt_op: 30, filter: "—", volt: "230/1/50", fla: 3, db: "52" },
      { model: "BCF-1500", type: "Centrifugal – Direct Drive", cfm: 1500, cms: 2550, sp_pa: 250, kw: 0.55, rpm: 1450, dia: 500, l: 650, w: 650, h: 450, wt_bare: 32, wt_motor: 16, wt_total: 48, wt_op: 48, filter: "—", volt: "230/1/50", fla: 4, db: "54" },
      { model: "BCF-3000", type: "Centrifugal – Belt Drive", cfm: 3000, cms: 5100, sp_pa: 300, kw: 1.5, rpm: 960, dia: 630, l: 850, w: 850, h: 600, wt_bare: 60, wt_motor: 35, wt_total: 95, wt_op: 95, filter: "—", volt: "415/3/50", fla: 4, db: "58" },
      { model: "BCF-5000", type: "Centrifugal – Belt Drive", cfm: 5000, cms: 8500, sp_pa: 350, kw: 2.2, rpm: 960, dia: 710, l: 1000, w: 1000, h: 700, wt_bare: 88, wt_motor: 52, wt_total: 140, wt_op: 140, filter: "G4", volt: "415/3/50", fla: 6, db: "60" },
      { model: "BCF-8000", type: "Centrifugal – Belt Drive", cfm: 8000, cms: 13600, sp_pa: 400, kw: 4.0, rpm: 960, dia: 800, l: 1200, w: 1200, h: 850, wt_bare: 138, wt_motor: 82, wt_total: 220, wt_op: 220, filter: "G4", volt: "415/3/50", fla: 10, db: "63" },
      { model: "BCF-12000", type: "Centrifugal – Belt Drive", cfm: 12000, cms: 20400, sp_pa: 450, kw: 5.5, rpm: 720, dia: 1000, l: 1450, w: 1450, h: 1000, wt_bare: 218, wt_motor: 122, wt_total: 340, wt_op: 340, filter: "G4", volt: "415/3/50", fla: 14, db: "65" },
      { model: "BCF-20000", type: "Centrifugal – Belt Drive", cfm: 20000, cms: 34000, sp_pa: 500, kw: 11, rpm: 720, dia: 1250, l: 1800, w: 1800, h: 1200, wt_bare: 375, wt_motor: 205, wt_total: 580, wt_op: 580, filter: "G4", volt: "415/3/50", fla: 24, db: "68" },
      { model: "AXF-30000", type: "Axial Flow – Bifurcated Duct", cfm: 30000, cms: 51000, sp_pa: 300, kw: 15, rpm: 720, dia: 1600, l: 2000, w: 2000, h: 1400, wt_bare: 480, wt_motor: 300, wt_total: 780, wt_op: 780, filter: "G4", volt: "415/3/50", fla: 32, db: "72" },
    ],
  },
  fresh_air_fan: {
    label: "Fresh Air Fan (FAF)", icon: "💨", color: "#22c55e",
    inputModes: [
      { key: "cfm", label: "CFM", field: "cfm" },
      { key: "m3h", label: "m³/hr", field: "cms" },
    ],
    models: [
      { model: "FAF-500", type: "Centrifugal – Direct Drive – DIDW", cfm: 500, cms: 850, sp_pa: 200, kw: 0.37, rpm: 1450, dia: 400, l: 580, w: 580, h: 420, wt_bare: 25, wt_motor: 10, wt_total: 35, wt_op: 35, filter: "G4", volt: "415/3/50", fla: 1.5, db: "48" },
      { model: "FAF-1000", type: "Centrifugal – Direct Drive – DIDW", cfm: 1000, cms: 1700, sp_pa: 250, kw: 0.55, rpm: 1450, dia: 450, l: 680, w: 680, h: 500, wt_bare: 36, wt_motor: 16, wt_total: 52, wt_op: 52, filter: "G4", volt: "415/3/50", fla: 2, db: "50" },
      { model: "FAF-2000", type: "Centrifugal – Belt Drive – DIDW", cfm: 2000, cms: 3400, sp_pa: 300, kw: 1.1, rpm: 1450, dia: 560, l: 820, w: 820, h: 620, wt_bare: 62, wt_motor: 28, wt_total: 90, wt_op: 90, filter: "G4", volt: "415/3/50", fla: 3.5, db: "54" },
      { model: "FAF-4000", type: "Centrifugal – Belt Drive – DIDW", cfm: 4000, cms: 6800, sp_pa: 350, kw: 2.2, rpm: 960, dia: 710, l: 1050, w: 1050, h: 760, wt_bare: 105, wt_motor: 50, wt_total: 155, wt_op: 155, filter: "G4", volt: "415/3/50", fla: 6, db: "57" },
      { model: "FAF-6000", type: "Centrifugal – Belt Drive – DIDW", cfm: 6000, cms: 10200, sp_pa: 400, kw: 3.7, rpm: 960, dia: 800, l: 1250, w: 1250, h: 880, wt_bare: 160, wt_motor: 70, wt_total: 230, wt_op: 230, filter: "G4+F7", volt: "415/3/50", fla: 9, db: "60" },
      { model: "FAF-10000", type: "Centrifugal – Belt Drive – DIDW", cfm: 10000, cms: 17000, sp_pa: 500, kw: 7.5, rpm: 720, dia: 1000, l: 1600, w: 1600, h: 1100, wt_bare: 280, wt_motor: 120, wt_total: 400, wt_op: 400, filter: "G4+F7", volt: "415/3/50", fla: 18, db: "63" },
      { model: "FAF-15000", type: "Centrifugal – Belt Drive – DIDW", cfm: 15000, cms: 25500, sp_pa: 600, kw: 11, rpm: 720, dia: 1250, l: 1950, w: 1950, h: 1350, wt_bare: 440, wt_motor: 180, wt_total: 620, wt_op: 620, filter: "G4+F7", volt: "415/3/50", fla: 24, db: "66" },
      { model: "FAF-20000", type: "Centrifugal – Belt Drive – DIDW", cfm: 20000, cms: 34000, sp_pa: 700, kw: 15, rpm: 720, dia: 1400, l: 2300, w: 2300, h: 1550, wt_bare: 620, wt_motor: 260, wt_total: 880, wt_op: 880, filter: "G4+F7", volt: "415/3/50", fla: 32, db: "68" },
    ],
  },
  fcu: {
    label: "FCU (Fan Coil Unit)", icon: "🌬️", color: "#a78bfa",
    inputModes: [
      { key: "tr", label: "TR", field: "cap_tr" },
      { key: "kw", label: "kW", field: "cap_kw" },
      { key: "cfm", label: "CFM", field: "cfm" },
    ],
    models: [
      { model: "FCU-200", cap_tr: 0.5, cap_kw: 1.76, cfm: 200, chw_gpm: 1.1, rows: 2, type: "Horizontal – Concealed Ceiling", l: 610, w: 188, h: 500, wt_unit: 10, wt_motor: 2, wt_total: 12, wt_op: 13, chw_dn: "DN15", drain: "DN20", volt: "230/1/50", fla: 0.5, db: "34" },
      { model: "FCU-300", cap_tr: 0.75, cap_kw: 2.64, cfm: 300, chw_gpm: 1.6, rows: 2, type: "Horizontal – Concealed Ceiling", l: 730, w: 188, h: 500, wt_unit: 12, wt_motor: 2, wt_total: 14, wt_op: 15, chw_dn: "DN15", drain: "DN20", volt: "230/1/50", fla: 0.6, db: "36" },
      { model: "FCU-400", cap_tr: 1.0, cap_kw: 3.52, cfm: 400, chw_gpm: 2.1, rows: 3, type: "Horizontal – Concealed Ceiling", l: 890, w: 200, h: 520, wt_unit: 14, wt_motor: 3, wt_total: 17, wt_op: 18, chw_dn: "DN20", drain: "DN20", volt: "230/1/50", fla: 0.8, db: "38" },
      { model: "FCU-600", cap_tr: 1.5, cap_kw: 5.28, cfm: 600, chw_gpm: 3.2, rows: 3, type: "Horizontal – Concealed Ceiling", l: 1070, w: 200, h: 520, wt_unit: 17, wt_motor: 4, wt_total: 21, wt_op: 22, chw_dn: "DN20", drain: "DN20", volt: "230/1/50", fla: 1.0, db: "40" },
      { model: "FCU-800", cap_tr: 2.0, cap_kw: 7.03, cfm: 800, chw_gpm: 4.2, rows: 4, type: "Horizontal – Concealed Ceiling", l: 1200, w: 220, h: 560, wt_unit: 20, wt_motor: 6, wt_total: 26, wt_op: 28, chw_dn: "DN25", drain: "DN25", volt: "230/1/50", fla: 1.2, db: "42" },
      { model: "FCU-1200", cap_tr: 3.0, cap_kw: 10.55, cfm: 1200, chw_gpm: 6.3, rows: 4, type: "Vertical – Cassette / Floor Mount", l: 1400, w: 220, h: 580, wt_unit: 26, wt_motor: 8, wt_total: 34, wt_op: 36, chw_dn: "DN25", drain: "DN25", volt: "230/1/50", fla: 1.8, db: "44" },
      { model: "FCU-1600", cap_tr: 4.0, cap_kw: 14.07, cfm: 1600, chw_gpm: 8.5, rows: 4, type: "Vertical – Cassette / Floor Mount", l: 1600, w: 250, h: 620, wt_unit: 33, wt_motor: 11, wt_total: 44, wt_op: 47, chw_dn: "DN32", drain: "DN32", volt: "230/1/50", fla: 2.5, db: "46" },
      { model: "FCU-2000", cap_tr: 5.0, cap_kw: 17.58, cfm: 2000, chw_gpm: 10.6, rows: 4, type: "Vertical – Cassette / Floor Mount", l: 1800, w: 250, h: 650, wt_unit: 41, wt_motor: 13, wt_total: 54, wt_op: 58, chw_dn: "DN32", drain: "DN32", volt: "415/3/50", fla: 3.2, db: "48" },
    ],
  },
  // ═══════════════════════════════════════════════════════════════════
  //  NEW: JET FAN (Car Park Ventilation) — LJB & LJC II Series
  // ═══════════════════════════════════════════════════════════════════
  jet_fan: {
    label: "Jet Fan (Car Park)", icon: "🚗", color: "#f43f5e",
    inputModes: [
      { key: "thrust", label: "Thrust (N)", field: "thrust_n" },
      { key: "cfm", label: "CFM", field: "cfm" },
      { key: "m3h", label: "m³/hr", field: "m3h" },
    ],
    models: [
      { model: "LJB-315-LS", type: "Axial Induced Jet Fan – Unidirectional", series: "LJB", fan_size: 315, thrust_n: 14, cfm: 1325, m3h: 2250, outlet_vel: 8.0, kw: 0.11, rpm: 1450, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral Inlet & Outlet", casing: "Galvanized Steel", blade: "Aerofoil Aluminium Alloy", l: 1125, w: 415, h: 415, wt_total: 28, wt_op: 28, wt_ship: 32, mount_type: "Ceiling Bracket / Hanger Rod", application: "Car Park – Normal Ventilation", cert: "AMCA / CE", volt: "415/3/50", fla: 0.5, db: "38" },
      { model: "LJB-315-HS", type: "Axial Induced Jet Fan – Unidirectional", series: "LJB", fan_size: 315, thrust_n: 28, cfm: 2650, m3h: 4500, outlet_vel: 16.0, kw: 0.75, rpm: 2850, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral Inlet & Outlet", casing: "Galvanized Steel", blade: "Aerofoil Aluminium Alloy", l: 1125, w: 415, h: 415, wt_total: 30, wt_op: 30, wt_ship: 34, mount_type: "Ceiling Bracket / Hanger Rod", application: "Car Park – Normal Ventilation", cert: "AMCA / CE", volt: "415/3/50", fla: 2.0, db: "54" },
      { model: "LJB-355-LS", type: "Axial Induced Jet Fan – Unidirectional", series: "LJB", fan_size: 355, thrust_n: 20, cfm: 1906, m3h: 3240, outlet_vel: 9.1, kw: 0.20, rpm: 1450, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral Inlet & Outlet", casing: "Galvanized Steel", blade: "Aerofoil Aluminium Alloy", l: 1225, w: 455, h: 455, wt_total: 35, wt_op: 35, wt_ship: 40, mount_type: "Ceiling Bracket / Hanger Rod", application: "Car Park – Normal Ventilation", cert: "AMCA / CE", volt: "415/3/50", fla: 0.8, db: "43" },
      { model: "LJB-355-HS", type: "Axial Induced Jet Fan – Unidirectional", series: "LJB", fan_size: 355, thrust_n: 40, cfm: 3812, m3h: 6480, outlet_vel: 18.2, kw: 1.5, rpm: 2850, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral Inlet & Outlet", casing: "Galvanized Steel", blade: "Aerofoil Aluminium Alloy", l: 1225, w: 455, h: 455, wt_total: 38, wt_op: 38, wt_ship: 43, mount_type: "Ceiling Bracket / Hanger Rod", application: "Car Park – Normal Ventilation", cert: "AMCA / CE", volt: "415/3/50", fla: 3.5, db: "58" },
      { model: "LJB-400-LS", type: "Axial Induced Jet Fan – Unidirectional", series: "LJB", fan_size: 400, thrust_n: 30, cfm: 2648, m3h: 4500, outlet_vel: 10.0, kw: 0.60, rpm: 1450, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral Inlet & Outlet", casing: "Galvanized Steel", blade: "Aerofoil Aluminium Alloy", l: 1394, w: 510, h: 510, wt_total: 48, wt_op: 48, wt_ship: 55, mount_type: "Ceiling Bracket / Hanger Rod", application: "Car Park – Normal & Smoke", cert: "AMCA / CE", volt: "415/3/50", fla: 1.8, db: "44" },
      { model: "LJB-400-HS", type: "Axial Induced Jet Fan – Unidirectional", series: "LJB", fan_size: 400, thrust_n: 60, cfm: 5297, m3h: 9000, outlet_vel: 20.0, kw: 3.6, rpm: 2850, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral Inlet & Outlet", casing: "Galvanized Steel", blade: "Aerofoil Aluminium Alloy", l: 1394, w: 510, h: 510, wt_total: 52, wt_op: 52, wt_ship: 60, mount_type: "Ceiling Bracket / Hanger Rod", application: "Car Park – Normal & Smoke", cert: "AMCA / CE", volt: "415/3/50", fla: 7.5, db: "60" },
      { model: "LJB-450-LS", type: "Axial Induced Jet Fan – Unidirectional", series: "LJB", fan_size: 450, thrust_n: 42, cfm: 3531, m3h: 6000, outlet_vel: 10.5, kw: 0.60, rpm: 1450, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral Inlet & Outlet", casing: "Galvanized Steel", blade: "Aerofoil Aluminium Alloy", l: 1510, w: 560, h: 560, wt_total: 58, wt_op: 58, wt_ship: 66, mount_type: "Ceiling Bracket / Hanger Rod", application: "Car Park – Normal & Smoke", cert: "AMCA / CE", volt: "415/3/50", fla: 1.8, db: "46" },
      { model: "LJB-450-HS", type: "Axial Induced Jet Fan – Unidirectional", series: "LJB", fan_size: 450, thrust_n: 84, cfm: 7063, m3h: 12000, outlet_vel: 21.0, kw: 3.6, rpm: 2850, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral Inlet & Outlet", casing: "Galvanized Steel", blade: "Aerofoil Aluminium Alloy", l: 1510, w: 560, h: 560, wt_total: 62, wt_op: 62, wt_ship: 70, mount_type: "Ceiling Bracket / Hanger Rod", application: "Car Park – Normal & Smoke", cert: "AMCA / CE", volt: "415/3/50", fla: 7.5, db: "62" },
      // LJC II Series — Centrifugal Low-Profile
      { model: "LJC-II-50", type: "Centrifugal Induced Jet Fan – Low Profile", series: "LJC II", fan_size: 50, thrust_n: 20, cfm: 1766, m3h: 3000, outlet_vel: 9.5, kw: 0.37, rpm: 1450, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral", casing: "Galvanized Steel", blade: "Backward Curved Centrifugal", l: 1200, w: 600, h: 300, wt_total: 45, wt_op: 45, wt_ship: 52, mount_type: "Ceiling Flush Mount", application: "Low Headroom Car Park", cert: "AMCA / CE / EN 12101-3", volt: "415/3/50", fla: 1.2, db: "45" },
      { model: "LJC-II-63", type: "Centrifugal Induced Jet Fan – Low Profile", series: "LJC II", fan_size: 63, thrust_n: 32, cfm: 2648, m3h: 4500, outlet_vel: 11.5, kw: 0.75, rpm: 1450, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral", casing: "Galvanized Steel", blade: "Backward Curved Centrifugal", l: 1400, w: 700, h: 340, wt_total: 58, wt_op: 58, wt_ship: 66, mount_type: "Ceiling Flush Mount", application: "Low Headroom Car Park", cert: "AMCA / CE / EN 12101-3", volt: "415/3/50", fla: 2.0, db: "48" },
      { model: "LJC-II-80", type: "Centrifugal Induced Jet Fan – Low Profile", series: "LJC II", fan_size: 80, thrust_n: 50, cfm: 3825, m3h: 6500, outlet_vel: 14.0, kw: 1.5, rpm: 1450, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral", casing: "Galvanized Steel", blade: "Backward Curved Centrifugal", l: 1600, w: 800, h: 380, wt_total: 75, wt_op: 75, wt_ship: 85, mount_type: "Ceiling Flush Mount", application: "Low Headroom Car Park", cert: "AMCA / CE / EN 12101-3", volt: "415/3/50", fla: 3.5, db: "52" },
      { model: "LJC-II-100", type: "Centrifugal Induced Jet Fan – Low Profile", series: "LJC II", fan_size: 100, thrust_n: 72, cfm: 5297, m3h: 9000, outlet_vel: 17.0, kw: 2.2, rpm: 1450, phase: "3Ph", hz: 50, insulation: "Class F", ip_rating: "IP55", motor_type: "TENV", temp_rating: "General: −20°C to +55°C", silencer: "Integral", casing: "Galvanized Steel", blade: "Backward Curved Centrifugal", l: 1800, w: 900, h: 420, wt_total: 95, wt_op: 95, wt_ship: 108, mount_type: "Ceiling Flush Mount", application: "Low Headroom Car Park", cert: "AMCA / CE / EN 12101-3", volt: "415/3/50", fla: 5.0, db: "55" },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════
//  2. MODEL SELECTION & SEARCH LOGIC
// ═══════════════════════════════════════════════════════════════════

export function findModel(eqKey: string, value: string, modeKey: string): EquipmentModel | null {
  const eq = MODEL_DATABASE[eqKey];
  const numVal = parseFloat(value);
  if (!eq || isNaN(numVal) || numVal <= 0) return null;
  const modeObj = eq.inputModes.find((m: InputMode) => m.key === modeKey);
  if (!modeObj) return null;
  const field = modeObj.field;
  const sorted = [...eq.models].sort((a: EquipmentModel, b: EquipmentModel) => (a[field] ?? 0) - (b[field] ?? 0));
  for (const m of sorted) {
    if ((m[field] ?? 0) >= numVal * 0.95) return m;
  }
  return sorted[sorted.length - 1];
}

export interface SpecificationRow {
  label: string;
  value: any;
  unit?: string;
  category: "Performance" | "Dimensions" | "Weights" | "Electrical" | "Connections";
}

export function buildSpecRows(eqKey: string, m: EquipmentModel | null): SpecificationRow[] {
  if (!m) return [];
  const r = (label: string, value: any, unit = "", category: "Performance" | "Dimensions" | "Weights" | "Electrical" | "Connections" = "Performance"): SpecificationRow => ({ label, value: value ?? "—", unit, category });
  const DIM = [r("Length (L)", m.l, "mm", "Dimensions"), r("Width (W)", m.w, "mm", "Dimensions"), r("Height (H)", m.h, "mm", "Dimensions")];
  const ELEC = [r("Voltage / Phase / Frequency", m.volt, "", "Electrical"), r("Full Load Ampere (FLA)", m.fla, "A", "Electrical"), r("Sound Pressure Level", m.db, "dB(A)", "Electrical")];
  const specific: Record<string, SpecificationRow[]> = {
    cooling_tower: [r("Model Number", m.model, "", "Performance"), r("Tower Type", m.type, "", "Performance"), r("Cooling Capacity", m.cap_tr, "TR", "Performance"), r("Water Flow Rate (GPM)", m.gpm, "GPM", "Performance"), r("Water Flow Rate (m³/hr)", m.m3h, "m³/hr", "Performance"), r("Entering Water Temp (EWT)", m.ewt, "°C", "Performance"), r("Leaving Water Temp (LWT)", m.lwt, "°C", "Performance"), r("Wet Bulb Temp (Design WBT)", m.wbt, "°C", "Performance"), r("Range (EWT − LWT)", Number(m.ewt) - Number(m.lwt), "°C", "Performance"), r("Approach (LWT − WBT)", Number(m.lwt) - Number(m.wbt), "°C", "Performance"), r("Fan Motor Power", m.fan_kw, "kW", "Performance"), r("Fan Diameter", m.fan_dia, "mm", "Dimensions"), r("Number of Fans", m.fans, "Qty", "Performance"), r("Number of Cells", m.cells, "Qty", "Performance"), r("Drift Loss", m.drift, "", "Performance"), r("Evaporation Loss", m.evap, "", "Performance"), r("Basin Volume (Water Content)", m.basin_l, "Liters", "Connections"), r("Hot Water Inlet Pipe Size", m.inlet_dn, "", "Connections"), r("Cold Water Outlet Pipe Size", m.outlet_dn, "", "Connections"), r("Makeup Water Connection", m.makeup_dn, "", "Connections"), r("Blowdown Connection", m.blowdown, "", "Connections"), r("Dry Weight (Empty)", m.wt_dry, "kg", "Weights"), r("Operating Weight (Full Basin)", m.wt_op, "kg", "Weights"), r("Basin Full Weight", m.wt_basin_full, "kg", "Weights"), r("Shipping / Transport Weight", m.wt_shipping, "kg", "Weights"), ...DIM, ...ELEC],
    chiller_wc: [r("Model Number", m.model, "", "Performance"), r("Cooling Capacity", `${m.cap_tr} TR / ${m.cap_kw} kW`, "", "Performance"), r("COP (Rated)", m.cop, "", "Performance"), r("Energy Efficiency (IKW/TR)", m.kw_tr, "kW/TR", "Performance"), r("Compressor Type", m.comp, "", "Performance"), r("Refrigerant Type", m.refrig, "", "Performance"), r("CHW Flow Rate", m.chw_flow_gpm, "GPM", "Performance"), r("CHW Entering Water Temp", m.chw_ewt, "°C", "Performance"), r("CHW Leaving Water Temp", m.chw_lwt, "°C", "Performance"), r("CHW Temp Differential", Number(m.chw_ewt) - Number(m.chw_lwt), "°C", "Performance"), r("CDW Flow Rate", m.cdw_flow_gpm, "GPM", "Performance"), r("CDW Entering Water Temp", m.cdw_ewt, "°C", "Performance"), r("CDW Leaving Water Temp", m.cdw_lwt, "°C", "Performance"), r("CHW Pipe Connection", m.chw_dn, "", "Connections"), r("CDW Pipe Connection", m.cdw_dn, "", "Connections"), r("Drain Connection", m.drain, "", "Connections"), r("MCA (Min Circuit Ampacity)", m.mca, "A", "Electrical"), r("MOCP (Max Overcurrent Prot.)", m.mocp, "A", "Electrical"), r("Dry Weight (Bare Machine)", m.wt_dry, "kg", "Weights"), r("Operating Weight (With Refrig.)", m.wt_op, "kg", "Weights"), r("Shipping Weight", m.wt_ship, "kg", "Weights"), r("Refrigerant Charge Weight", m.wt_refrig, "kg", "Weights"), ...DIM, ...ELEC],
    chiller_ac: [r("Model Number", m.model, "", "Performance"), r("Cooling Capacity", `${m.cap_tr} TR / ${m.cap_kw} kW`, "", "Performance"), r("COP (Rated)", m.cop, "", "Performance"), r("Energy Efficiency (IKW/TR)", m.kw_tr, "kW/TR", "Performance"), r("Compressor Type", m.comp, "", "Performance"), r("Refrigerant Type", m.refrig, "", "Performance"), r("CHW Flow Rate", m.chw_flow_gpm, "GPM", "Performance"), r("CHW Entering Water Temp", m.chw_ewt, "°C", "Performance"), r("CHW Leaving Water Temp", m.chw_lwt, "°C", "Performance"), r("Number of Condenser Fans", m.fans, "Qty", "Performance"), r("Condenser Fan Motor Power", m.fan_kw, "kW", "Performance"), r("CHW Pipe Connection", m.chw_dn, "", "Connections"), r("Drain Connection", m.drain, "", "Connections"), r("MCA (Min Circuit Ampacity)", m.mca, "A", "Electrical"), r("MOCP (Max Overcurrent Prot.)", m.mocp, "A", "Electrical"), r("Dry Weight (Bare Machine)", m.wt_dry, "kg", "Weights"), r("Operating Weight (With Refrig.)", m.wt_op, "kg", "Weights"), r("Shipping Weight", m.wt_ship, "kg", "Weights"), r("Refrigerant Charge Weight", m.wt_refrig, "kg", "Weights"), ...DIM, ...ELEC],
    ahu: [r("Model Number", m.model, "", "Performance"), r("Airflow CFM", m.cfm, "CFM", "Performance"), r("Airflow Cubic Meter/Hr", m.cms, "m³/hr", "Performance"), r("Cooling Coil Capacity", `${m.cc_kw} kW / ${m.cc_tr} TR`, "", "Performance"), r("Heating Coil Capacity", m.hc_kw, "kW", "Performance"), r("CHW Flow Rate", m.chw_gpm, "GPM", "Performance"), r("CHW Entering Water Temp", m.chw_ewt, "°C", "Performance"), r("CHW Leaving Water Temp", m.chw_lwt, "°C", "Performance"), r("External Static Pressure", m.esp_pa, "Pa", "Performance"), r("Fan Motor Power", m.fan_kw, "kW", "Performance"), r("Fan Speed", m.fan_rpm, "RPM", "Performance"), r("Filter Grade", m.filter, "", "Performance"), r("CHW Pipe Connection", m.chw_dn, "", "Connections"), r("Drain Pan Connection", m.drain, "", "Connections"), r("Supply Duct Size", m.duct_s, "mm", "Connections"), r("Return Duct Size", m.duct_r, "mm", "Connections"), r("Empty Weight (No Coils/Fill)", m.wt_empty, "kg", "Weights"), r("Shipping / Transport Weight", m.wt_ship, "kg", "Weights"), r("Operating Weight", m.wt_op, "kg", "Weights"), r("Weight (Coils Full of Water)", m.wt_full_coil, "kg", "Weights"), ...DIM, ...ELEC],
    tfa: [r("Model Number", m.model, "", "Performance"), r("Fresh Air Flow", m.cfm, "CFM", "Performance"), r("Fresh Air Flow (m³/hr)", m.cms, "m³/hr", "Performance"), r("Cooling Coil Capacity", `${m.cc_kw} kW / ${m.cc_tr} TR`, "", "Performance"), r("Dehumidification Capacity", m.dh_kw, "kW", "Performance"), r("CHW Flow Rate", m.chw_gpm, "GPM", "Performance"), r("CHW Entering Water Temp", m.chw_ewt, "°C", "Performance"), r("CHW Leaving Water Temp", m.chw_lwt, "°C", "Performance"), r("Supply Air Condition (SAT)", m.sat, "", "Performance"), r("External Static Pressure", m.esp_pa, "Pa", "Performance"), r("Fan Motor Power", m.fan_kw, "kW", "Performance"), r("Fan Speed", m.fan_rpm, "RPM", "Performance"), r("Filter Grade", m.filter, "", "Performance"), r("CHW Pipe Connection", m.chw_dn, "", "Connections"), r("Drain Connection", m.drain, "", "Connections"), r("Supply Duct Size", m.duct_s, "mm", "Connections"), r("Empty Weight (No Coils/Fill)", m.wt_empty, "kg", "Weights"), r("Shipping / Transport Weight", m.wt_ship, "kg", "Weights"), r("Operating Weight", m.wt_op, "kg", "Weights"), r("Weight (Coils Full of Water)", m.wt_full_coil, "kg", "Weights"), ...DIM, ...ELEC],
    hru: [r("Model Number", m.model, "", "Performance"), r("Airflow CFM", m.cfm, "CFM", "Performance"), r("Airflow Cubic Meter/Hr", m.cms, "m³/hr", "Performance"), r("Saved Capacity", m.saved_tr, "TR", "Performance"), r("Heat Recovery Type", m.type, "", "Performance"), r("Heat Recovery Effectiveness", m.eff, "", "Performance"), r("Estimated Energy Saved", m.energy_kw, "kW", "Performance"), r("External Static Pressure", m.esp_pa, "Pa", "Performance"), r("Fan Motor Power", m.fan_kw, "kW", "Performance"), r("Fan Speed", m.fan_rpm, "RPM", "Performance"), r("Filter Grade", m.filter, "", "Performance"), r("Bare Unit Weight", m.wt_empty || m.wt_bare, "kg", "Weights"), r("Shipping Weight", m.wt_ship, "kg", "Weights"), r("Operating Weight", m.wt_op, "kg", "Weights"), r("Weight (Frame + Wheel + Motor)", m.wt_full, "kg", "Weights"), ...DIM, ...ELEC],
    pump_chw: [r("Model Number", m.model, "", "Performance"), r("Pump Type", m.type, "", "Performance"), r("Flow Rate (GPM)", m.gpm, "GPM", "Performance"), r("Flow Rate (m³/hr)", m.m3h, "m³/hr", "Performance"), r("Total Dynamic Head", m.head_m, "m", "Performance"), r("Total Dynamic Head (Feet)", m.head_ft, "ft", "Performance"), r("Motor Power", m.kw, "kW", "Performance"), r("Pump Speed", m.rpm, "RPM", "Performance"), r("Efficiency at BEP", m.eff, "%", "Performance"), r("Impeller Diameter", m.impeller, "mm", "Dimensions"), r("Casing Material", m.casing, "", "Performance"), r("Mechanical Seal Type", m.seal, "", "Performance"), r("Suction Connection", m.suc_dn, "", "Connections"), r("Discharge Connection", m.dis_dn, "", "Connections"), r("Bare Pump Weight (No Motor)", m.wt_bare, "kg", "Weights"), r("Motor Weight", m.wt_motor, "kg", "Weights"), r("Total Assembled Weight", m.wt_total, "kg", "Weights"), r("Operating Weight (With Fluid)", m.wt_op, "kg", "Weights"), ...DIM, ...ELEC],
    exhaust_fan: [r("Model Number", m.model, "", "Performance"), r("Fan Type", m.type, "", "Performance"), r("Airflow CFM", m.cfm, "CFM", "Performance"), r("Airflow Cubic Meter/Hr", m.cms, "m³/hr", "Performance"), r("Static Pressure", m.sp_pa, "Pa", "Performance"), r("Fan Motor Power", m.kw, "kW", "Performance"), r("Fan Speed", m.rpm, "RPM", "Performance"), r("Fan Diameter", m.dia, "mm", "Dimensions"), r("Filter Grade", m.filter, "", "Performance"), r("Bare Fan Weight (No Motor)", m.wt_bare, "kg", "Weights"), r("Motor Weight", m.wt_motor, "kg", "Weights"), r("Total Assembled Weight", m.wt_total, "kg", "Weights"), r("Operating Weight", m.wt_op, "kg", "Weights"), ...DIM, ...ELEC],
    fresh_air_fan: [r("Model Number", m.model, "", "Performance"), r("Fan Type", m.type, "", "Performance"), r("Airflow CFM", m.cfm, "CFM", "Performance"), r("Airflow Cubic Meter/Hr", m.cms, "m³/hr", "Performance"), r("Static Pressure", m.sp_pa, "Pa", "Performance"), r("Fan Motor Power", m.kw, "kW", "Performance"), r("Fan Speed", m.rpm, "RPM", "Performance"), r("Fan Diameter", m.dia, "mm", "Dimensions"), r("Filter Grade", m.filter, "", "Performance"), r("Bare Fan Weight (No Motor)", m.wt_bare, "kg", "Weights"), r("Motor Weight", m.wt_motor, "kg", "Weights"), r("Total Assembled Weight", m.wt_total, "kg", "Weights"), r("Operating Weight", m.wt_op, "kg", "Weights"), ...DIM, ...ELEC],
    fcu: [r("Model Number", m.model, "", "Performance"), r("FCU Type", m.type, "", "Performance"), r("Cooling Capacity", `${m.cap_tr} TR / ${m.cap_kw} kW`, "", "Performance"), r("Airflow CFM", m.cfm, "CFM", "Performance"), r("Coil Rows", m.rows, "Rows", "Performance"), r("CHW Flow Rate", m.chw_gpm, "GPM", "Performance"), r("CHW Pipe Connection", m.chw_dn, "", "Connections"), r("Drain Pipe Connection", m.drain, "", "Connections"), r("Unit Weight (No Motor)", m.wt_unit, "kg", "Weights"), r("Motor Weight", m.wt_motor, "kg", "Weights"), r("Total Assembled Weight", m.wt_total, "kg", "Weights"), r("Operating Weight", m.wt_op, "kg", "Weights"), ...DIM, ...ELEC],
    // ── NEW: Jet Fan spec rows ──
    jet_fan: [
      r("Model Number", m.model, "", "Performance"),
      r("Jet Fan Type", m.type, "", "Performance"),
      r("Product Series", m.series, "", "Performance"),
      r("Fan Size", m.fan_size, "mm", "Performance"),
      r("Thrust Force", m.thrust_n, "N", "Performance"),
      r("Airflow (CFM)", m.cfm, "CFM", "Performance"),
      r("Airflow (m³/hr)", m.m3h, "m³/hr", "Performance"),
      r("Outlet Velocity", m.outlet_vel, "m/s", "Performance"),
      r("Installed Motor Power", m.kw, "kW", "Performance"),
      r("Motor Speed", m.rpm, "RPM", "Performance"),
      r("Phase / Frequency", `${m.phase} / ${m.hz} Hz`, "", "Electrical"),
      r("Motor Insulation Class", m.insulation, "", "Electrical"),
      r("IP Protection Rating", m.ip_rating, "", "Electrical"),
      r("Motor Enclosure Type", m.motor_type, "", "Electrical"),
      r("Operating Temp Range", m.temp_rating, "", "Performance"),
      r("Silencer Configuration", m.silencer, "", "Performance"),
      r("Casing Material", m.casing, "", "Performance"),
      r("Blade / Impeller Type", m.blade, "", "Performance"),
      r("Mounting Method", m.mount_type, "", "Connections"),
      r("Application", m.application, "", "Performance"),
      r("Certification", m.cert, "", "Performance"),
      r("Total Fan Weight", m.wt_total, "kg", "Weights"),
      r("Operating Weight", m.wt_op, "kg", "Weights"),
      r("Shipping Weight", m.wt_ship, "kg", "Weights"),
      ...DIM,
      ...ELEC,
    ],
  };
  const list = specific[eqKey] || [];
  const seenLabels = new Set<string>();
  const uniqueList: SpecificationRow[] = [];
  for (const row of list) {
    const key = `${row.label.trim().toLowerCase()}_${row.value}_${row.unit}`;
    if (!seenLabels.has(key)) { seenLabels.add(key); uniqueList.push(row); }
  }
  return uniqueList;
}

export const DISCLAIMER = `IMPORTANT DISCLAIMER & LEGAL NOTICE

1. REFERENCE DATA ONLY: All data, dimensions, weights, capacities, electrical parameters, thrust values, airflow ratings, and specifications shown in this tool are indicative/reference values based on typical industry-standard equipment. These are NOT guaranteed manufacturer specifications.

2. NO WARRANTY: This tool makes no warranty — express or implied — as to the accuracy, completeness, or fitness of the data for any particular purpose, including but not limited to chillers, cooling towers, AHUs, pumps, fans, FCUs, jet fans, or any other HVAC/MEP equipment listed herein.

3. ALWAYS VERIFY: Before finalizing any design, procurement, or construction document, the engineer of record MUST obtain and verify actual data sheets directly from the equipment manufacturer or authorized supplier. This includes verifying jet fan thrust calculations, CFD analysis results, and smoke ventilation compliance per local fire codes.

4. NOT A SUBSTITUTE: This tool does not replace engineering judgment, professional design calculations, or official manufacturer submittals. It is intended only as a preliminary selection/reference aid for HVAC system sizing and equipment comparison.

5. SITE CONDITIONS: Performance data is based on standard AHRI / ASHRAE / BIS / EN design conditions. Actual performance will vary with ambient temperature, altitude, fouling factors, part-load operation, duct/piping layout, car park geometry, and local utility conditions.

6. WEIGHT & STRUCTURAL: Foundation design, structural loading, ceiling mounting (including jet fan bracket/hanger loads), and equipment installation must be verified by a licensed structural engineer using confirmed manufacturer data.

7. ELECTRICAL: Electrical connection design must be verified per IS/IEC standards by a licensed electrical engineer using confirmed manufacturer's nameplate and wiring data. Jet fan installations must comply with fire-rated cable and emergency power requirements.

8. VENTILATION & FIRE SAFETY: Jet fan sizing for car park ventilation and smoke extraction must comply with local fire codes, NBC (National Building Code), NFPA 502, BS 7346, EN 12101-3, and any applicable regional standards. CO monitoring, smoke detection integration, and emergency mode operation must be designed by qualified fire safety engineers.

9. REFRIGERANT: Refrigerant types shown are typical; actual selection depends on environmental regulations, GWP restrictions, and local availability.

10. LIABILITY: The developer of this tool accepts no liability whatsoever for any loss, damage, or claim arising from the use of or reliance upon the data herein.

11. PROFESSIONAL RESPONSIBILITY: The responsibility for correct equipment selection and design remains solely with the qualified HVAC/MEP engineer of record for the project.

© Reference Tool — For Preliminary Engineering Use Only`;

// ═══════════════════════════════════════════════════════════════════
//  3. GAD BLUEPRINT COMPONENT
// ═══════════════════════════════════════════════════════════════════

export type BlueprintStyle = "classic" | "tech_dark" | "architect_light";

interface GADBlueprintProps {
  eqKey: string;
  model: EquipmentModel | null;
  color: string;
  isDark: boolean;
}

function GADBlueprint({ eqKey, model, color, isDark }: GADBlueprintProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [bpStyle, setBpStyle] = useState<BlueprintStyle>("classic");
  const [showGrid, setShowGrid] = useState(true);
  const [animateFlow, setAnimateFlow] = useState(true);

  useEffect(() => {
    if (!isDark && bpStyle === "classic") setBpStyle("architect_light");
    if (isDark && bpStyle === "architect_light") setBpStyle("classic");
  }, [isDark]);

  useEffect(() => { resetView(); }, [eqKey, model]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const fitToView = () => { setZoom(1.15); setPan({ x: 0, y: 15 }); };

  const handleMouseDown = (e: React.MouseEvent) => { if ((e.target as HTMLElement).closest("button")) return; setIsDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging) return; setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = (e: React.TouchEvent) => { if ((e.target as HTMLElement).closest("button")) return; if (e.touches.length === 1) { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y }); } };
  const handleTouchMove = (e: React.TouchEvent) => { if (!isDragging) return; if (e.touches.length === 1) setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }); };
  const handleTouchEnd = () => setIsDragging(false);

  if (!model) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 border-2 border-dashed rounded-2xl min-h-[300px] ${isDark ? "border-slate-700/50 bg-slate-900/10" : "border-slate-300 bg-slate-50"}`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 text-3xl animate-pulse ${isDark ? "bg-slate-800/80" : "bg-slate-200"}`}>📐</div>
        <h4 className={`text-base font-semibold tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>GENERAL ARRANGEMENT BLUEPRINT</h4>
        <p className={`text-xs mt-1 text-center max-w-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Enter equipment capacity to automatically render interactive technical drawing blueprint.</p>
      </div>
    );
  }

  const getThemeColors = () => {
    switch (bpStyle) {
      case "tech_dark": return { bg: "#080c14", grid: "#111827", line: "#334155", drawing: color, text: "#f1f5f9", textMuted: "#64748b", dimension: "#f59e0b", border: "#1e293b" };
      case "architect_light": return { bg: "#f8fafc", grid: "#cbd5e180", line: "#cbd5e1", drawing: color, text: "#0f172a", textMuted: "#64748b", dimension: "#d97706", border: "#e2e8f0" };
      case "classic":
      default: return { bg: "#0d1e3d", grid: "rgba(255,255,255,0.05)", line: "#1e3a8a", drawing: "#38bdf8", text: "#ffffff", textMuted: "#93c5fd", dimension: "#fbbf24", border: "#1e40af" };
    }
  };

  const colors = getThemeColors();
  const labelStyle = { fill: colors.text, fontSize: "10px", fontWeight: "bold", fontFamily: "system-ui, sans-serif" };
  const subLabelStyle = { fill: colors.textMuted, fontSize: "8.5px", fontFamily: "system-ui, sans-serif" };
  const dimStyle = { fill: colors.dimension, fontSize: "9px", fontWeight: "600" as const, fontFamily: "monospace" };
  const textOutline = { stroke: colors.bg, strokeWidth: "3px", paintOrder: "stroke", strokeLinejoin: "round" as const };

  const btnBase = `p-1.5 rounded-lg border transition-all cursor-pointer`;
  const btnOff = isDark ? "bg-slate-800 border-slate-700/60 text-slate-400 hover:bg-slate-700" : "bg-white border-slate-300 text-slate-500 hover:bg-slate-100";

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border ${isDark ? "bg-slate-900/20 border-slate-800" : "bg-white border-slate-200"}`}>
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center justify-between p-3 gap-2 border-b z-10 ${isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-sky-400" />
          <span className={`text-xs font-semibold tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}>1. GAD DRAWING PANEL</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`flex rounded-lg p-0.5 border mr-1.5 ${isDark ? "bg-slate-800 border-slate-700/60" : "bg-slate-200 border-slate-300"}`}>
            <button onClick={() => setBpStyle("classic")} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${bpStyle === "classic" ? "bg-sky-500 text-white shadow-sm" : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>Classic</button>
            <button onClick={() => setBpStyle("tech_dark")} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${bpStyle === "tech_dark" ? "bg-slate-700 text-white shadow-sm" : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>Charcoal</button>
            <button onClick={() => setBpStyle("architect_light")} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${bpStyle === "architect_light" ? "bg-slate-200 text-slate-800 shadow-sm" : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>Paper</button>
          </div>
          <button onClick={() => setShowGrid(!showGrid)} className={`${btnBase} ${showGrid ? "bg-slate-700 border-slate-600 text-sky-400" : btnOff}`} title="Grid Lines"><Grid className="w-3.5 h-3.5" /></button>
          <button onClick={() => setAnimateFlow(!animateFlow)} className={`${btnBase} ${animateFlow ? "bg-slate-700 border-slate-600 text-green-400" : btnOff}`} title="Animations">{animateFlow ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</button>
          <div className="h-5 w-[1px] bg-slate-300/40 mx-1"></div>
          <button onClick={handleZoomIn} className={`${btnBase} ${btnOff}`}><ZoomIn className="w-3.5 h-3.5" /></button>
          <button onClick={handleZoomOut} className={`${btnBase} ${btnOff}`}><ZoomOut className="w-3.5 h-3.5" /></button>
          <button onClick={fitToView} className={`${btnBase} ${btnOff}`}><Maximize className="w-3.5 h-3.5" /></button>
          <button onClick={resetView} className={`${btnBase} ${btnOff}`}><RotateCcw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden select-none touch-none min-h-[350px] cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: colors.bg }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {showGrid && (<div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(${colors.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${colors.grid} 1.5px, transparent 1.5px)`, backgroundSize: "24px 24px", opacity: 0.95 }} />)}
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out origin-center" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <div className="w-[450px] h-[340px] p-2 flex items-center justify-center relative">

            {eqKey === "cooling_tower" && (
              <svg viewBox="0 0 400 330" className="w-full h-full">
                <rect x="80" y="55" width="240" height="210" rx="10" fill="transparent" stroke={colors.drawing} strokeWidth="2.5" />
                <ellipse cx="200" cy="55" rx="80" ry="18" fill={`${colors.drawing}15`} stroke={colors.drawing} strokeWidth="2" />
                <circle cx="200" cy="55" r="8" fill={colors.drawing} />
                {animateFlow && (<path d="M 160 55 C 180 52, 190 58, 200 55 C 210 52, 220 58, 240 55" stroke={colors.drawing} strokeWidth="1.5" strokeDasharray="3,3"><animateTransform attributeName="transform" type="rotate" from="0 200 55" to="360 200 55" dur="1.5s" repeatCount="indefinite" /></path>)}
                <text x="200" y="47" textAnchor="middle" style={labelStyle} {...textOutline}>FAN Ø{model.fan_dia}mm — {model.fan_kw}kW ×{model.fans}</text>
                <rect x="95" y="85" width="210" height="75" fill={`${colors.drawing}05`} stroke={colors.drawing} strokeWidth="1.2" strokeDasharray="4,4" />
                {[0, 1, 2, 3, 4, 5, 6].map(idx => (<line key={idx} x1="95" y1={92 + idx * 10} x2="305" y2={92 + idx * 10} stroke={colors.drawing} strokeWidth="0.8" opacity="0.3" />))}
                <text x="200" y="125" textAnchor="middle" style={subLabelStyle} {...textOutline}>HONEYCOMB FILL MEDIA / ELIMINATOR</text>
                <line x1="95" y1="82" x2="305" y2="82" stroke={colors.drawing} strokeWidth="2" />
                {[120, 155, 190, 225, 260, 295].map(x => (<line key={x} x1={x} y1="82" x2={x} y2="88" stroke={colors.drawing} strokeWidth="1.5" />))}
                <rect x="80" y="235" width="240" height="32" fill={`${colors.drawing}25`} stroke={colors.drawing} strokeWidth="2" />
                <text x="200" y="254" textAnchor="middle" style={labelStyle} {...textOutline}>COLD WATER BASIN ({model.basin_l} L)</text>
                {animateFlow && (<g opacity="0.6">{[110, 130, 150, 170, 190, 210, 230, 250, 270, 290].map((x, i) => (<circle key={i} cx={x} cy={95} r="1.5" fill="#38bdf8"><animate attributeName="cy" values="90;230" dur={`${1.2 + (i % 3) * 0.2}s`} repeatCount="indefinite" /><animate attributeName="opacity" values="1;0" dur={`${1.2 + (i % 3) * 0.2}s`} repeatCount="indefinite" /></circle>))}</g>)}
                <line x1="200" y1="55" x2="200" y2="12" stroke="#ef4444" strokeWidth="3" /><polygon points="195,15 205,15 200,8" fill="#ef4444" />
                <text x="210" y="22" style={{ fill: "#ef4444", fontSize: "8px", fontWeight: "bold" }} {...textOutline}>EWT {model.ewt}°C (INLET {model.inlet_dn})</text>
                <line x1="320" y1="251" x2="375" y2="251" stroke="#38bdf8" strokeWidth="3" /><polygon points="368,246 378,251 368,256" fill="#38bdf8" />
                {animateFlow && (<circle cx="340" cy="251" r="2" fill="#fff"><animate attributeName="cx" values="320;370" dur="1.2s" repeatCount="indefinite" /></circle>)}
                <text x="375" y="242" textAnchor="end" style={{ fill: "#38bdf8", fontSize: "8px", fontWeight: "bold" }} {...textOutline}>LWT {model.lwt}°C (OUTLET {model.outlet_dn})</text>
                <line x1="80" y1="242" x2="25" y2="242" stroke="#60a5fa" strokeWidth="2" /><text x="20" y="238" textAnchor="end" style={{ fill: "#60a5fa", fontSize: "8px" }} {...textOutline}>MAKEUP {model.makeup_dn}</text>
                <line x1="80" y1="260" x2="25" y2="260" stroke="#fbbf24" strokeWidth="2" /><text x="20" y="256" textAnchor="end" style={{ fill: "#fbbf24", fontSize: "8px" }} {...textOutline}>BLOWDOWN {model.blowdown}</text>
                <line x1="80" y1="295" x2="320" y2="295" stroke={colors.dimension} strokeWidth="1" strokeDasharray="3,3" />
                <line x1="80" y1="290" x2="80" y2="300" stroke={colors.dimension} strokeWidth="1.5" /><line x1="320" y1="290" x2="320" y2="300" stroke={colors.dimension} strokeWidth="1.5" />
                <polygon points="88,292 80,295 88,298" fill={colors.dimension} /><polygon points="312,292 320,295 312,298" fill={colors.dimension} />
                <text x="200" y="310" textAnchor="middle" style={dimStyle} {...textOutline}>L = {model.l} mm</text>
                <line x1="45" y1="55" x2="45" y2="267" stroke={colors.dimension} strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="55" x2="50" y2="55" stroke={colors.dimension} strokeWidth="1.5" /><line x1="40" y1="267" x2="50" y2="267" stroke={colors.dimension} strokeWidth="1.5" />
                <polygon points="42,63 45,55 48,63" fill={colors.dimension} /><polygon points="42,259 45,267 48,259" fill={colors.dimension} />
                <text x="34" y="161" textAnchor="middle" style={dimStyle} transform="rotate(-90,34,161)" {...textOutline}>H = {model.h} mm</text>
              </svg>
            )}

            {(eqKey === "chiller_wc" || eqKey === "chiller_ac") && (
              <svg viewBox="0 0 420 340" className="w-full h-full">
                <rect x="35" y="30" width="350" height="55" rx="10" fill={`${colors.drawing}10`} stroke={colors.drawing} strokeWidth="2.2" />
                <text x="210" y="52" textAnchor="middle" style={labelStyle} {...textOutline}>CONDENSER SECTION</text>
                <text x="210" y="65" textAnchor="middle" style={subLabelStyle} {...textOutline}>{eqKey === "chiller_wc" ? `Water-Cooled Shell-Tube | ${model.cdw_dn}` : `Air-Cooled Coil | Fans: ${model.fans} × ${model.fan_kw}kW`}</text>
                {eqKey === "chiller_wc" && (<g><line x1="80" y1="30" x2="80" y2="5" stroke="#f97316" strokeWidth="3" /><polygon points="75,20 85,20 80,26" fill="#f97316" /><text x="65" y="14" style={{ fill: "#f97316", fontSize: "8px", fontWeight: "600" }} {...textOutline}>CDW IN ({model.cdw_ewt}°C)</text><line x1="340" y1="30" x2="340" y2="5" stroke="#ef4444" strokeWidth="3" /><polygon points="335,12 345,12 340,4" fill="#ef4444" /><text x="350" y="14" style={{ fill: "#ef4444", fontSize: "8px", fontWeight: "600" }} {...textOutline}>CDW OUT ({model.cdw_lwt}°C)</text>{animateFlow && (<g><circle cx="80" cy="18" r="1.5" fill="#fff"><animate attributeName="cy" values="5;30" dur="1s" repeatCount="indefinite" /></circle><circle cx="340" cy="18" r="1.5" fill="#fff"><animate attributeName="cy" values="30;5" dur="1s" repeatCount="indefinite" /></circle></g>)}</g>)}
                <circle cx="210" cy="165" r="50" fill={`${colors.drawing}20`} stroke={colors.drawing} strokeWidth="2.5" />
                <circle cx="210" cy="165" r="32" fill={`${colors.drawing}35`} stroke={colors.drawing} strokeWidth="1.5" />
                <text x="210" y="160" textAnchor="middle" style={{ ...labelStyle, fill: "#fff" }} {...textOutline}>{model.comp}</text>
                <text x="210" y="172" textAnchor="middle" style={subLabelStyle} {...textOutline}>COMPRESSOR</text>
                {animateFlow && (<g>{[0, 60, 120, 180, 240, 300].map(deg => { const rad = (deg * Math.PI) / 180; return (<line key={deg} x1={210 + 12 * Math.cos(rad)} y1={165 + 12 * Math.sin(rad)} x2={210 + 28 * Math.cos(rad)} y2={165 + 28 * Math.sin(rad)} stroke="#fff" strokeWidth="1.5" opacity="0.6"><animateTransform attributeName="transform" type="rotate" from="0 210 165" to="360 210 165" dur="3s" repeatCount="indefinite" /></line>); })}</g>)}
                <line x1="210" y1="85" x2="210" y2="115" stroke="#fbbf24" strokeWidth="2.5" />
                <line x1="210" y1="215" x2="210" y2="250" stroke="#38bdf8" strokeWidth="2.5" />
                <rect x="185" y="210" width="50" height="15" rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="210" y="221" textAnchor="middle" style={{ fill: "#000", fontSize: "8.5px", fontWeight: "bold" }}>EXV VALVES</text>
                <rect x="35" y="250" width="350" height="55" rx="10" fill={`${colors.drawing}10`} stroke="#38bdf8" strokeWidth="2.2" />
                <text x="210" y="272" textAnchor="middle" style={{ ...labelStyle, fill: "#38bdf8" }} {...textOutline}>EVAPORATOR (CHW SIDE)</text>
                <text x="210" y="285" textAnchor="middle" style={subLabelStyle} {...textOutline}>Refrig: {model.refrig} | CHW Pipe: {model.chw_dn} | Flow: {model.chw_flow_gpm} GPM</text>
                <line x1="80" y1="305" x2="80" y2="330" stroke="#60a5fa" strokeWidth="3" /><polygon points="75,320 85,320 80,326" fill="#60a5fa" /><text x="65" y="322" style={{ fill: "#60a5fa", fontSize: "8px", fontWeight: "600" }} {...textOutline}>CHW IN ({model.chw_ewt}°C)</text>
                <line x1="340" y1="305" x2="340" y2="330" stroke="#0ea5e9" strokeWidth="3" /><polygon points="335,312 345,312 340,306" fill="#0ea5e9" /><text x="350" y="322" style={{ fill: "#0ea5e9", fontSize: "8px", fontWeight: "600" }} {...textOutline}>CHW OUT ({model.chw_lwt}°C)</text>
                {animateFlow && (<g><circle cx="80" cy="315" r="1.5" fill="#fff"><animate attributeName="cy" values="305;330" dur="1s" repeatCount="indefinite" /></circle><circle cx="340" cy="315" r="1.5" fill="#fff"><animate attributeName="cy" values="330;305" dur="1s" repeatCount="indefinite" /></circle></g>)}
                <text x="210" y="340" textAnchor="middle" style={dimStyle} {...textOutline}>L = {model.l} mm | W = {model.w} mm | H = {model.h} mm</text>
              </svg>
            )}

            {(eqKey === "ahu" || eqKey === "tfa") && (
              <svg viewBox="0 0 420 285" className="w-full h-full">
                <rect x="25" y="55" width="370" height="160" rx="8" fill={`${colors.drawing}10`} stroke={colors.drawing} strokeWidth="2.5" />
                <rect x="5" y="78" width="20" height="114" rx="3" fill={`${colors.textMuted}20`} stroke={colors.textMuted} strokeWidth="1.5" />
                <path d="M 5 95 L 25 95 M 5 115 L 25 115 M 5 135 L 25 135 M 5 155 L 25 155 M 5 175 L 25 175" stroke={colors.textMuted} strokeWidth="1" />
                <text x="15" y="72" textAnchor="middle" style={subLabelStyle} {...textOutline}>DAMPER</text>
                <rect x="45" y="63" width="30" height="144" rx="2" fill={`${colors.drawing}15`} stroke={colors.drawing} strokeWidth="1.5" />
                {[70, 85, 100, 115, 130, 145, 160, 175, 190, 200].map(y => (<line key={y} x1="45" y1={y} x2="75" y2={y} stroke={colors.drawing} strokeWidth="0.8" opacity="0.4" />))}
                <text x="60" y="218" textAnchor="middle" style={{ fill: colors.drawing, fontSize: "7px", fontWeight: "600" }} {...textOutline}>FILTER</text>
                <rect x="95" y="63" width="60" height="144" rx="2" fill="#38bdf812" stroke="#38bdf8" strokeWidth="1.5" />
                {[75, 90, 105, 120, 135, 150, 165, 180, 195].map(y => (<line key={y} x1="95" y1={y} x2="155" y2={y} stroke="#38bdf8" strokeWidth="1" opacity="0.5" />))}
                <text x="125" y="218" textAnchor="middle" style={{ fill: "#38bdf8", fontSize: "7px", fontWeight: "600" }} {...textOutline}>COOL COIL</text>
                <line x1="115" y1="63" x2="115" y2="35" stroke="#38bdf8" strokeWidth="2.5" /><polygon points="110,43 120,43 115,36" fill="#38bdf8" />
                <text x="115" y="30" textAnchor="middle" style={{ fill: "#38bdf8", fontSize: "7.5px" }} {...textOutline}>OUT {model.chw_dn}</text>
                <line x1="135" y1="207" x2="135" y2="235" stroke="#0ea5e9" strokeWidth="2.5" /><polygon points="130,225 140,225 135,232" fill="#0ea5e9" />
                <text x="135" y="244" textAnchor="middle" style={{ fill: "#0ea5e9", fontSize: "7.5px" }} {...textOutline}>IN {model.chw_dn}</text>
                <rect x="175" y="63" width="35" height="144" rx="2" fill="#f9731610" stroke="#f97316" strokeWidth="1.5" />
                {[80, 110, 140, 170, 200].map(y => (<line key={y} x1="175" y1={y} x2="210" y2={y} stroke="#f97316" strokeWidth="0.8" opacity="0.5" />))}
                <text x="192" y="218" textAnchor="middle" style={{ fill: "#f97316", fontSize: "7px", fontWeight: "600" }} {...textOutline}>{eqKey === "ahu" ? "HTG COIL" : "DEHUM COIL"}</text>
                <rect x="230" y="63" width="105" height="144" rx="4" fill={`${colors.drawing}10`} stroke={colors.drawing} strokeWidth="1.5" />
                <circle cx="282" cy="135" r="45" fill={`${colors.drawing}15`} stroke={colors.drawing} strokeWidth="1.5" />
                <circle cx="282" cy="135" r="12" fill={colors.drawing} />
                {animateFlow && (<g>{[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = (a * Math.PI) / 180; return (<line key={a} x1={282 + 12 * Math.cos(r)} y1={135 + 12 * Math.sin(r)} x2={282 + 42 * Math.cos(r)} y2={135 + 42 * Math.sin(r)} stroke={colors.drawing} strokeWidth="2" opacity="0.8"><animateTransform attributeName="transform" type="rotate" from="0 282 135" to="360 282 135" dur="1s" repeatCount="indefinite" /></line>); })}</g>)}
                <text x="282" y="218" textAnchor="middle" style={{ fill: colors.drawing, fontSize: "7px", fontWeight: "600" }} {...textOutline}>BLOWER ({model.fan_kw}kW)</text>
                <rect x="395" y="78" width="20" height="114" rx="3" fill={`${colors.drawing}40`} stroke={colors.drawing} strokeWidth="1.8" />
                <text x="405" y="72" textAnchor="middle" style={subLabelStyle} {...textOutline}>SUPPLY</text>
                <text x="210" y="260" textAnchor="middle" style={dimStyle} {...textOutline}>L = {model.l} mm | W = {model.w} mm | H = {model.h} mm</text>
              </svg>
            )}

            {eqKey === "hru" && (
              <svg viewBox="0 0 400 300" className="w-full h-full">
                <rect x="50" y="40" width="300" height="180" rx="12" fill={`${colors.drawing}10`} stroke={colors.drawing} strokeWidth="2.5" />
                <circle cx="200" cy="130" r="68" fill={`${colors.drawing}15`} stroke={colors.drawing} strokeWidth="2" strokeDasharray="4,4" />
                <circle cx="200" cy="130" r="18" fill={`${colors.drawing}40`} stroke={colors.drawing} strokeWidth="1.5" />
                {animateFlow && (<g>{[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => { const r = (a * Math.PI) / 180; return (<line key={a} x1={200 + 18 * Math.cos(r)} y1={130 + 18 * Math.sin(r)} x2={200 + 66 * Math.cos(r)} y2={130 + 66 * Math.sin(r)} stroke={colors.drawing} strokeWidth="1.5" opacity="0.6"><animateTransform attributeName="transform" type="rotate" from="0 200 130" to="360 200 130" dur="6s" repeatCount="indefinite" /></line>); })}</g>)}
                <text x="200" y="126" textAnchor="middle" style={{ ...labelStyle, fill: "#fff" }} {...textOutline}>THERMAL</text>
                <text x="200" y="139" textAnchor="middle" style={{ ...labelStyle, fill: "#fff" }} {...textOutline}>WHEEL</text>
                <path d="M 20 80 Q 200 60, 380 80" fill="none" stroke="#22c55e" strokeWidth="2.5" /><polygon points="370,75 380,80 370,85" fill="#22c55e" />
                <text x="20" y="68" style={{ fill: "#22c55e", fontSize: "8px", fontWeight: "600" }} {...textOutline}>FRESH AIR IN</text>
                <text x="380" y="68" textAnchor="end" style={{ fill: "#a78bfa", fontSize: "8px", fontWeight: "600" }} {...textOutline}>SUPPLY AIR OUT</text>
                <path d="M 20 180 Q 200 200, 380 180" fill="none" stroke="#38bdf8" strokeWidth="2.5" /><polygon points="370,175 380,180 370,185" fill="#ef4444" />
                <text x="20" y="194" style={{ fill: "#38bdf8", fontSize: "8px", fontWeight: "600" }} {...textOutline}>EXHAUST IN</text>
                <text x="380" y="194" textAnchor="end" style={{ fill: "#ef4444", fontSize: "8px", fontWeight: "600" }} {...textOutline}>EXHAUST OUT</text>
                {animateFlow && (<g><circle r="2" fill="#22c55e"><animateMotion path="M 20 80 Q 200 60, 380 80" dur="2s" repeatCount="indefinite" /></circle><circle r="2" fill="#38bdf8"><animateMotion path="M 20 180 Q 200 200, 380 180" dur="2s" repeatCount="indefinite" /></circle></g>)}
                <text x="200" y="254" textAnchor="middle" style={dimStyle} {...textOutline}>L = {model.l} mm | W = {model.w} mm | H = {model.h} mm</text>
              </svg>
            )}

            {eqKey === "pump_chw" && (
              <svg viewBox="0 0 400 300" className="w-full h-full">
                <rect x="25" y="200" width="350" height="20" rx="4" fill={`${colors.drawing}30`} stroke={colors.drawing} strokeWidth="2" />
                <line x1="65" y1="220" x2="65" y2="240" stroke={colors.drawing} strokeWidth="4" /><line x1="335" y1="220" x2="335" y2="240" stroke={colors.drawing} strokeWidth="4" />
                <rect x="205" y="130" width="135" height="70" rx="5" fill={`${colors.drawing}15`} stroke={colors.drawing} strokeWidth="2" />
                <rect x="340" y="145" width="20" height="40" rx="3" fill={`${colors.drawing}30`} stroke={colors.drawing} strokeWidth="1.5" />
                <text x="272" y="155" textAnchor="middle" style={labelStyle} {...textOutline}>ELECTRIC MOTOR</text>
                <text x="272" y="168" textAnchor="middle" style={subLabelStyle} {...textOutline}>{model.kw} kW | {model.rpm} rpm</text>
                <text x="272" y="180" textAnchor="middle" style={subLabelStyle} {...textOutline}>{model.volt}</text>
                <rect x="175" y="150" width="30" height="30" rx="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                <text x="190" y="168" textAnchor="middle" style={{ fill: "#000", fontSize: "8px", fontWeight: "bold" }}>CPLG</text>
                <circle cx="105" cy="155" r="55" fill={`${colors.drawing}15`} stroke={colors.drawing} strokeWidth="2.5" />
                <circle cx="105" cy="155" r="32" fill={`${colors.drawing}35`} stroke={colors.drawing} strokeWidth="1.5" />
                {animateFlow && (<g>{[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = (a * Math.PI) / 180; return (<line key={a} x1={105 + 10 * Math.cos(r)} y1={155 + 10 * Math.sin(r)} x2={105 + 28 * Math.cos(r)} y2={155 + 28 * Math.sin(r)} stroke="#fff" strokeWidth="1.5" opacity="0.6"><animateTransform attributeName="transform" type="rotate" from="0 105 155" to="360 105 155" dur="1s" repeatCount="indefinite" /></line>); })}</g>)}
                <rect x="160" y="152" width="15" height="26" rx="1.5" fill={colors.textMuted} opacity="0.8" />
                <text x="167.5" y="168" textAnchor="middle" style={{ fill: "#fff", fontSize: "6.5px" }} {...textOutline}>SEAL</text>
                <line x1="25" y1="155" x2="50" y2="155" stroke="#38bdf8" strokeWidth="5" /><polygon points="30,150 40,155 30,160" fill="#38bdf8" />
                <text x="25" y="145" style={{ fill: "#38bdf8", fontSize: "8px", fontWeight: "600" }} {...textOutline}>SUCTION ({model.suc_dn})</text>
                <line x1="105" y1="100" x2="105" y2="55" stroke="#ef4444" strokeWidth="5" /><polygon points="100,75 110,75 105,65" fill="#ef4444" />
                <text x="115" y="65" style={{ fill: "#ef4444", fontSize: "8px", fontWeight: "600" }} {...textOutline}>DISCH ({model.dis_dn})</text>
                <text x="115" y="77" style={subLabelStyle} {...textOutline}>TDH: {model.head_m}m ({model.head_ft}ft)</text>
                {animateFlow && (<g><circle cx="35" cy="155" r="2.5" fill="#fff"><animate attributeName="cx" values="10;50" dur="1.2s" repeatCount="indefinite" /></circle><circle cx="105" cy="85" r="2.5" fill="#fff"><animate attributeName="cy" values="100;60" dur="1s" repeatCount="indefinite" /></circle></g>)}
                <text x="200" y="260" textAnchor="middle" style={dimStyle} {...textOutline}>Base L = {model.l} mm | Impeller Ø = {model.impeller} mm</text>
              </svg>
            )}

            {(eqKey === "exhaust_fan" || eqKey === "fresh_air_fan" || eqKey === "fcu") && (
              <svg viewBox="0 0 400 290" className="w-full h-full">
                <rect x="40" y="45" width="320" height="185" rx="12" fill={`${colors.drawing}10`} stroke={colors.drawing} strokeWidth="2.5" />
                <circle cx="200" cy="137" r="70" fill={`${colors.drawing}15`} stroke={colors.drawing} strokeWidth="1.5" strokeDasharray="3,3" />
                <circle cx="200" cy="137" r="18" fill={`${colors.drawing}40`} stroke={colors.drawing} strokeWidth="1.5" />
                {animateFlow && (<g>{[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = (a * Math.PI) / 180; return (<line key={a} x1={200 + 18 * Math.cos(r)} y1={137 + 18 * Math.sin(r)} x2={200 + 64 * Math.cos(r)} y2={137 + 64 * Math.sin(r)} stroke={colors.drawing} strokeWidth="2" opacity="0.8"><animateTransform attributeName="transform" type="rotate" from="0 200 137" to="360 200 137" dur="1s" repeatCount="indefinite" /></line>); })}</g>)}
                {eqKey === "fcu" && (<g><rect x="60" y="55" width="40" height="165" rx="2" fill="#38bdf812" stroke="#38bdf8" strokeWidth="1.5" />{[65, 85, 105, 125, 145, 165, 185, 205].map(y => (<line key={y} x1="60" y1={y} x2="100" y2={y} stroke="#38bdf8" strokeWidth="1" opacity="0.5" />))}<text x="80" y="215" textAnchor="middle" style={{ fill: "#38bdf8", fontSize: "6.5px", fontWeight: "600" }} {...textOutline}>COIL</text><line x1="80" y1="55" x2="80" y2="25" stroke="#38bdf8" strokeWidth="2" /><polygon points="75,35 85,35 80,29" fill="#38bdf8" /><text x="80" y="20" textAnchor="middle" style={{ fill: "#38bdf8", fontSize: "7px" }} {...textOutline}>CHW IN {model.chw_dn}</text><line x1="200" y1="230" x2="200" y2="255" stroke="#60a5fa" strokeWidth="2" /><circle cx="200" cy="255" r="2" fill="#60a5fa" /><text x="210" y="254" style={{ fill: "#60a5fa", fontSize: "7px" }} {...textOutline}>DRAIN {model.drain}</text></g>)}
                <line x1="40" y1="137" x2="8" y2="137" stroke="#38bdf8" strokeWidth="3" /><polygon points="10,132 20,137 10,142" fill="#38bdf8" />
                <text x="15" y="125" style={{ fill: "#38bdf8", fontSize: "8px", fontWeight: "600" }} {...textOutline}>AIR INLET</text>
                <line x1="360" y1="137" x2="392" y2="137" stroke={colors.drawing} strokeWidth="3" /><polygon points="383,132 393,137 383,142" fill={colors.drawing} />
                <text x="385" y="125" textAnchor="end" style={{ fill: colors.drawing, fontSize: "8px", fontWeight: "600" }} {...textOutline}>AIR DISCHARGE</text>
                <text x="200" y="133" textAnchor="middle" style={{ ...labelStyle, fill: "#fff" }} {...textOutline}>{eqKey === "fcu" ? "FCU BLOWER" : "FAN ROTOR"}</text>
                <text x="200" y="146" textAnchor="middle" style={subLabelStyle} {...textOutline}>{eqKey === "fcu" ? `${model.cfm} CFM` : `Ø${model.dia}mm Impeller`}</text>
                <text x="200" y="264" textAnchor="middle" style={dimStyle} {...textOutline}>L = {model.l} mm | W = {model.w} mm | H = {model.h} mm</text>
              </svg>
            )}

            {/* ── NEW: JET FAN GAD BLUEPRINT ── */}
            {eqKey === "jet_fan" && (
              <svg viewBox="0 0 440 310" className="w-full h-full">
                {/* Ceiling line */}
                <line x1="10" y1="30" x2="430" y2="30" stroke={colors.textMuted} strokeWidth="3" strokeDasharray="8,4" />
                <text x="220" y="22" textAnchor="middle" style={{ fill: colors.textMuted, fontSize: "8px", fontWeight: "bold" }} {...textOutline}>▼ CAR PARK CEILING SLAB ▼</text>

                {/* Hanger rods */}
                <line x1="120" y1="30" x2="120" y2="65" stroke={colors.textMuted} strokeWidth="2.5" />
                <line x1="320" y1="30" x2="320" y2="65" stroke={colors.textMuted} strokeWidth="2.5" />
                <rect x="115" y="62" width="10" height="6" rx="1" fill={colors.textMuted} />
                <rect x="315" y="62" width="10" height="6" rx="1" fill={colors.textMuted} />
                <text x="110" y="50" textAnchor="end" style={{ fill: colors.textMuted, fontSize: "7px" }} {...textOutline}>HANGER ROD</text>

                {/* Silencer — Inlet */}
                <rect x="30" y="70" width="70" height="70" rx="6" fill={`${colors.drawing}08`} stroke={colors.drawing} strokeWidth="1.5" strokeDasharray="4,3" />
                {[80, 90, 100, 110, 120, 130].map(y => (<line key={y} x1="35" y1={y} x2="95" y2={y} stroke={colors.drawing} strokeWidth="0.7" opacity="0.3" />))}
                <text x="65" y="155" textAnchor="middle" style={{ fill: colors.drawing, fontSize: "7px", fontWeight: "600" }} {...textOutline}>INLET SILENCER</text>

                {/* Main cylindrical body */}
                <rect x="100" y="68" width="240" height="74" rx="37" fill={`${colors.drawing}15`} stroke={colors.drawing} strokeWidth="2.5" />
                {/* Internal hub/motor */}
                <circle cx="220" cy="105" r="22" fill={`${colors.drawing}35`} stroke={colors.drawing} strokeWidth="1.5" />
                <circle cx="220" cy="105" r="8" fill={colors.drawing} />
                {/* Blade animation */}
                {animateFlow && (<g>{[0, 60, 120, 180, 240, 300].map(a => { const rad = (a * Math.PI) / 180; return (<line key={a} x1={220 + 8 * Math.cos(rad)} y1={105 + 8 * Math.sin(rad)} x2={220 + 20 * Math.cos(rad)} y2={105 + 20 * Math.sin(rad)} stroke="#fff" strokeWidth="2" opacity="0.7"><animateTransform attributeName="transform" type="rotate" from="0 220 105" to="360 220 105" dur="0.6s" repeatCount="indefinite" /></line>); })}</g>)}
                <text x="220" y="102" textAnchor="middle" style={{ ...labelStyle, fill: "#fff", fontSize: "8px" }} {...textOutline}>MOTOR</text>
                <text x="220" y="113" textAnchor="middle" style={{ fill: "#93c5fd", fontSize: "7px" }} {...textOutline}>{model.kw} kW</text>

                {/* Silencer — Outlet */}
                <rect x="340" y="70" width="70" height="70" rx="6" fill={`${colors.drawing}08`} stroke={colors.drawing} strokeWidth="1.5" strokeDasharray="4,3" />
                {[80, 90, 100, 110, 120, 130].map(y => (<line key={y} x1="345" y1={y} x2="405" y2={y} stroke={colors.drawing} strokeWidth="0.7" opacity="0.3" />))}
                <text x="375" y="155" textAnchor="middle" style={{ fill: colors.drawing, fontSize: "7px", fontWeight: "600" }} {...textOutline}>OUTLET SILENCER</text>

                {/* Airflow arrows — inlet */}
                <line x1="5" y1="105" x2="30" y2="105" stroke="#38bdf8" strokeWidth="3" />
                <polygon points="22,100 30,105 22,110" fill="#38bdf8" />
                <text x="5" y="92" style={{ fill: "#38bdf8", fontSize: "8px", fontWeight: "600" }} {...textOutline}>AIR IN</text>

                {/* Airflow arrows — outlet with thrust */}
                <line x1="410" y1="105" x2="435" y2="105" stroke="#f43f5e" strokeWidth="3" />
                <polygon points="428,100 436,105 428,110" fill="#f43f5e" />
                <text x="435" y="92" textAnchor="end" style={{ fill: "#f43f5e", fontSize: "8px", fontWeight: "600" }} {...textOutline}>THRUST</text>
                <text x="435" y="120" textAnchor="end" style={{ fill: "#fbbf24", fontSize: "9px", fontWeight: "bold" }} {...textOutline}>{model.thrust_n} N</text>

                {/* Animated airflow particles */}
                {animateFlow && (<g>
                  {[0, 1, 2, 3, 4].map(i => (
                    <circle key={i} r="2" fill="#38bdf8" opacity="0.7">
                      <animate attributeName="cx" values={`5;435`} dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                      <animate attributeName="cy" values={`${100 + i * 3};${100 + i * 3}`} dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.1" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </g>)}

                {/* Velocity label */}
                <text x="220" y="165" textAnchor="middle" style={{ fill: "#22c55e", fontSize: "8px", fontWeight: "bold" }} {...textOutline}>Outlet Velocity: {model.outlet_vel} m/s | {model.cfm} CFM ({model.m3h} m³/hr)</text>

                {/* Dimension lines */}
                {/* Length */}
                <line x1="30" y1="185" x2="410" y2="185" stroke={colors.dimension} strokeWidth="1" strokeDasharray="3,3" />
                <line x1="30" y1="180" x2="30" y2="190" stroke={colors.dimension} strokeWidth="1.5" />
                <line x1="410" y1="180" x2="410" y2="190" stroke={colors.dimension} strokeWidth="1.5" />
                <polygon points="38,182 30,185 38,188" fill={colors.dimension} />
                <polygon points="402,182 410,185 402,188" fill={colors.dimension} />
                <text x="220" y="198" textAnchor="middle" style={dimStyle} {...textOutline}>L = {model.l} mm</text>

                {/* Width / Diameter */}
                <line x1="15" y1="68" x2="15" y2="142" stroke={colors.dimension} strokeWidth="1" strokeDasharray="3,3" />
                <line x1="10" y1="68" x2="20" y2="68" stroke={colors.dimension} strokeWidth="1.5" />
                <line x1="10" y1="142" x2="20" y2="142" stroke={colors.dimension} strokeWidth="1.5" />
                <polygon points="12,76 15,68 18,76" fill={colors.dimension} />
                <polygon points="12,134 15,142 18,134" fill={colors.dimension} />
                <text x="8" y="108" textAnchor="middle" style={dimStyle} transform="rotate(-90,8,108)" {...textOutline}>Ø{model.w} mm</text>

                {/* Series & model badge */}
                <rect x="140" y="215" width="160" height="30" rx="6" fill={`${colors.drawing}15`} stroke={colors.drawing} strokeWidth="1.5" />
                <text x="220" y="230" textAnchor="middle" style={{ fill: colors.text, fontSize: "8px", fontWeight: "bold" }} {...textOutline}>{model.series} Series | Size {model.fan_size}</text>
                <text x="220" y="240" textAnchor="middle" style={{ fill: colors.textMuted, fontSize: "7px" }} {...textOutline}>{model.mount_type}</text>

                {/* IP & Insulation label */}
                <text x="220" y="260" textAnchor="middle" style={{ fill: colors.textMuted, fontSize: "7px" }} {...textOutline}>{model.ip_rating} | {model.insulation} | {model.motor_type}</text>

                {/* Overall dim summary */}
                <text x="220" y="280" textAnchor="middle" style={dimStyle} {...textOutline}>L = {model.l} mm | W = {model.w} mm | H = {model.h} mm | Wt = {model.wt_total} kg</text>
              </svg>
            )}

          </div>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md rounded-lg p-2.5 border border-slate-800 shadow-xl max-w-[240px] pointer-events-auto">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-200 tracking-wide uppercase">{model.model}</span>
          </div>
          <div className="space-y-1 text-[10px]">
            <p className="text-slate-400 font-medium">Type: <span className="text-slate-300 font-semibold">{model.type ? model.type.split("–")[0].trim() : "Standard"}</span></p>
            <p className="text-slate-400 font-medium">Dimensions: <span className="text-slate-300 font-semibold font-mono">{model.l} × {model.w} × {model.h} <span className="text-[8px]">mm</span></span></p>
            <p className="text-slate-400 font-medium">Operating Weight: <span className="text-amber-400 font-bold font-mono">{model.wt_op || model.wt_total || "—"} <span className="text-[8px] font-sans">kg</span></span></p>
            {eqKey === "jet_fan" && (<p className="text-slate-400 font-medium">Thrust: <span className="text-rose-400 font-bold font-mono">{model.thrust_n} <span className="text-[8px] font-sans">N</span></span></p>)}
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <div className="bg-slate-950/85 backdrop-blur p-1 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
            <span>Drag / Pinch to Zoom Blueprint</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  4. TECHNICAL SPECS COMPONENT — isDark prop added
// ═══════════════════════════════════════════════════════════════════

interface TechnicalSpecsProps {
  eqKey: string;
  model: EquipmentModel | null;
  isDark: boolean;
}

function TechnicalSpecs({ eqKey, model, isDark }: TechnicalSpecsProps) {
  const [copied, setCopied] = useState(false);
  const [compareModelKey, setCompareModelKey] = useState<string>("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({ Performance: true, Dimensions: true, Weights: true, Electrical: true, Connections: true });

  if (!model) return null;

  const currentCategoryModels = MODEL_DATABASE[eqKey]?.models || [];
  const specRows = buildSpecRows(eqKey, model);
  const categories: Record<string, SpecificationRow[]> = { Performance: [], Dimensions: [], Weights: [], Electrical: [], Connections: [] };
  specRows.forEach(row => { if (categories[row.category]) categories[row.category].push(row); else categories.Performance.push(row); });

  const catConfig: Record<string, { label: string; icon: React.ReactNode; color: string; border: string }> = {
    Performance: { label: "Performance & Capacity", icon: <Zap className="w-4 h-4" />, color: isDark ? "text-amber-400 bg-amber-500/10" : "text-amber-700 bg-amber-100", border: isDark ? "border-amber-500/20" : "border-amber-300" },
    Dimensions: { label: "Physical Dimensions", icon: <Maximize className="w-4 h-4" />, color: isDark ? "text-sky-400 bg-sky-500/10" : "text-sky-700 bg-sky-100", border: isDark ? "border-sky-500/20" : "border-sky-300" },
    Weights: { label: "Weights & Structural", icon: <Scale className="w-4 h-4" />, color: isDark ? "text-purple-400 bg-purple-500/10" : "text-purple-700 bg-purple-100", border: isDark ? "border-purple-500/20" : "border-purple-300" },
    Electrical: { label: "Electrical & Acoustic", icon: <Sliders className="w-4 h-4" />, color: isDark ? "text-rose-400 bg-rose-500/10" : "text-rose-700 bg-rose-100", border: isDark ? "border-rose-500/20" : "border-rose-300" },
    Connections: { label: "Piping & Connections", icon: <Link className="w-4 h-4" />, color: isDark ? "text-green-400 bg-green-500/10" : "text-green-700 bg-green-100", border: isDark ? "border-green-500/20" : "border-green-300" },
  };

  const toggleCat = (catName: string) => setExpandedCats(prev => ({ ...prev, [catName]: !prev[catName] }));

  const handleCopySpecs = () => {
    let text = `📋 HVAC EQUIPMENT DATASHEET: ${model.model}\nEquipment Type: ${MODEL_DATABASE[eqKey]?.label}\n─────────────────────────────────────────\n`;
    Object.entries(categories).forEach(([catName, rows]) => {
      if (rows.length === 0) return;
      text += `\n[ ${catConfig[catName].label.toUpperCase()} ]\n`;
      rows.forEach(row => { text += `• ${row.label}: ${row.value} ${row.unit || ""}\n`; });
    });
    text += `\nGenerated via HVAC Master toolkit.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const comparedModel = currentCategoryModels.find(m => m.model === compareModelKey) || null;
  const comparedSpecs = comparedModel ? buildSpecRows(eqKey, comparedModel) : [];

  const cardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200";
  const cardBg2 = isDark ? "bg-slate-900/40 border-slate-800" : "bg-slate-50 border-slate-200";
  const textPrimary = isDark ? "text-slate-200" : "text-slate-800";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";
  const sectionBg = isDark ? "bg-slate-900/30 border-slate-800" : "bg-white border-slate-200";
  const sectionHeaderBg = isDark ? "bg-slate-900/60 border-slate-800 hover:bg-slate-900/85" : "bg-slate-50 border-slate-200 hover:bg-slate-100";
  const rowEven = isDark ? "bg-slate-950/5" : "bg-slate-50/50";
  const rowOdd = isDark ? "bg-slate-900/5" : "bg-white";
  const rowHover = isDark ? "hover:bg-slate-900/20" : "hover:bg-sky-50/50";
  const valueBadge = isDark ? "bg-sky-500/10 text-sky-400 border-sky-500/15" : "bg-sky-100 text-sky-700 border-sky-200";
  const unitBadge = isDark ? "text-sky-500/80 bg-sky-500/5 border-sky-500/5" : "text-sky-600 bg-sky-50 border-sky-100";
  const compareSelectedBadge = isDark ? "bg-sky-500/10 text-sky-400 border-sky-500/10" : "bg-sky-100 text-sky-700 border-sky-200";
  const compareOtherBadge = isDark ? "bg-purple-500/10 text-purple-400 border-purple-500/10" : "bg-purple-100 text-purple-700 border-purple-200";
  const selectBg = isDark ? "bg-slate-950 border-slate-850 text-slate-200" : "bg-white border-slate-300 text-slate-800";
  const compareHeaderBg = isDark ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-200 border-slate-300 text-slate-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border ${cardBg}`}>
        <div className="space-y-1">
          <h4 className={`text-sm font-bold tracking-wide uppercase flex items-center gap-1.5 ${textPrimary}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            2. Specifications Datasheet
          </h4>
          <p className={`text-xs ${textSecondary}`}>Technical specification parameters organized for engineering review.</p>
        </div>
        <button onClick={handleCopySpecs} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${isDark ? "bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-700/60" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"}`}>
          {copied ? (<><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-500">Copied!</span></>) : (<><Clipboard className="w-3.5 h-3.5 text-sky-400" /><span>Copy Datasheet</span></>)}
        </button>
      </div>

      {/* Comparer */}
      <div className={`rounded-2xl p-4 border space-y-3 ${cardBg2}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h5 className={`text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 ${textPrimary}`}>⚖️ Field Model Comparer</h5>
            <p className={`text-[11px] ${textMuted}`}>Select any other model from the list to compare specifications side-by-side.</p>
          </div>
          <select value={compareModelKey} onChange={(e) => setCompareModelKey(e.target.value)} className={`border rounded-xl px-3 py-2 text-xs font-semibold outline-none min-w-[160px] cursor-pointer ${selectBg} focus:border-sky-500/50`}>
            <option value="">-- Choose Compare Model --</option>
            {currentCategoryModels.filter(m => m.model !== model.model).map(m => (<option key={m.model} value={m.model}>Compare: {m.model}</option>))}
          </select>
        </div>
        {comparedModel && (
          <div className={`grid grid-cols-3 gap-2 p-2.5 rounded-lg border text-[11px] font-bold ${compareHeaderBg}`}>
            <div className={textSecondary}>PARAMETER</div>
            <div className="text-sky-500">{model.model} (Selected)</div>
            <div className="text-purple-500">{comparedModel.model} (Compare)</div>
          </div>
        )}
      </div>

      {/* Category sections */}
      <div className="space-y-4">
        {Object.entries(categories).map(([catName, rows]) => {
          if (rows.length === 0) return null;
          const conf = catConfig[catName];
          const isExpanded = expandedCats[catName];
          return (
            <div key={catName} className={`rounded-2xl border overflow-hidden shadow-sm ${sectionBg}`}>
              <button onClick={() => toggleCat(catName)} className={`w-full flex items-center justify-between p-3.5 border-b transition-all text-left cursor-pointer ${sectionHeaderBg}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg border ${conf.color} ${conf.border}`}>{conf.icon}</div>
                  <div>
                    <h5 className={`text-xs font-bold tracking-wider uppercase ${textPrimary}`}>{conf.label}</h5>
                    <p className={`text-[10px] ${textMuted}`}>{rows.length} specification parameters available</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className={`w-4 h-4 ${textSecondary}`} /> : <ChevronDown className={`w-4 h-4 ${textSecondary}`} />}
              </button>
              {isExpanded && (
                <div className={`divide-y ${isDark ? "divide-slate-800/40" : "divide-slate-100"}`}>
                  {rows.map((row, i) => {
                    const compRow = comparedSpecs.find(cs => cs.label === row.label);
                    return (
                      <div key={i} className={`p-3 text-[12px] md:text-sm transition-all ${i % 2 === 0 ? rowEven : rowOdd} ${rowHover}`}>
                        {comparedModel ? (
                          <div className="grid grid-cols-3 gap-2 items-center">
                            <span className={`font-medium leading-snug ${textSecondary}`}>{row.label}</span>
                            <div className="flex items-center gap-1">
                              <span className={`px-2 py-0.5 rounded border text-xs font-bold font-mono ${compareSelectedBadge}`}>{String(row.value)}</span>
                              {row.unit && <span className={`text-[10px] font-medium ${textMuted}`}>{row.unit}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              {compRow ? (<><span className={`px-2 py-0.5 rounded border text-xs font-bold font-mono ${compareOtherBadge}`}>{String(compRow.value)}</span>{compRow.unit && <span className={`text-[10px] font-medium ${textMuted}`}>{compRow.unit}</span>}</>) : (<span className={`font-mono ${textMuted}`}>—</span>)}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <span className={`font-semibold leading-relaxed max-w-[50%] ${textPrimary}`}>{row.label}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-black font-mono tracking-wide shadow-inner ${valueBadge}`}>{String(row.value)}</span>
                              {row.unit && (<span className={`text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${unitBadge}`}>{row.unit}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  5. QUICK CONVERTER AND CALC — isDark prop added
// ═══════════════════════════════════════════════════════════════════

interface QuickConverterProps { isDark: boolean; }

function QuickConverterAndCalc({ isDark }: QuickConverterProps) {
  const [tr, setTr] = useState("100");
  const [kw, setKw] = useState("351.7");
  const [gpm, setGpm] = useState("240");
  const [m3h, setM3h] = useState("54.5");
  const [cfm, setCfm] = useState("4000");
  const [m3hAir, setM3hAir] = useState("6796");
  const [estTr, setEstTr] = useState("100");
  const [deltaT, setDeltaT] = useState("5");
  const [fluidType, setFluidType] = useState<"chw" | "cdw">("chw");

  const handleTrChange = (val: string) => { setTr(val); const n = parseFloat(val); if (!isNaN(n)) setKw((n * 3.51685).toFixed(1)); else setKw(""); };
  const handleKwChange = (val: string) => { setKw(val); const n = parseFloat(val); if (!isNaN(n)) setTr((n / 3.51685).toFixed(1)); else setTr(""); };
  const handleGpmChange = (val: string) => { setGpm(val); const n = parseFloat(val); if (!isNaN(n)) setM3h((n * 0.22712).toFixed(1)); else setM3h(""); };
  const handleM3hChange = (val: string) => { setM3h(val); const n = parseFloat(val); if (!isNaN(n)) setGpm((n / 0.22712).toFixed(1)); else setGpm(""); };
  const handleCfmChange = (val: string) => { setCfm(val); const n = parseFloat(val); if (!isNaN(n)) setM3hAir((n * 1.69901).toFixed(0)); else setM3hAir(""); };
  const handleM3hAirChange = (val: string) => { setM3hAir(val); const n = parseFloat(val); if (!isNaN(n)) setCfm((n / 1.69901).toFixed(0)); else setCfm(""); };

  const calculateEstimatedFlows = () => {
    const trNum = parseFloat(estTr); const dtNum = parseFloat(deltaT);
    if (isNaN(trNum) || isNaN(dtNum) || trNum <= 0 || dtNum <= 0) return { gpm: "0", m3h: "0" };
    const factor = fluidType === "chw" ? 24 : 30;
    const dtFahrenheit = dtNum * 1.8;
    const gpmEst = (trNum * factor) / dtFahrenheit;
    return { gpm: gpmEst.toFixed(1), m3h: (gpmEst * 0.22712).toFixed(1) };
  };
  const flowResult = calculateEstimatedFlows();

  const cardBg = isDark ? "bg-slate-900/30 border-slate-800" : "bg-white border-slate-200";
  const headerBorder = isDark ? "border-slate-800" : "border-slate-200";
  const textPrimary = isDark ? "text-slate-200" : "text-slate-800";
  const textSecondary = isDark ? "text-slate-300" : "text-slate-600";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";
  const labelColor = isDark ? "text-slate-400" : "text-slate-500";
  const inputBg = isDark ? "bg-slate-950/60 border-slate-800 text-slate-200" : "bg-white border-slate-300 text-slate-800";
  const pillBg = isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-100 border-slate-200";
  const resultBg = isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-100 border-slate-200";
  const headerCardBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200";

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-2xl border flex items-center gap-3 ${headerCardBg}`}>
        <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20"><Calculator className="w-5 h-5" /></div>
        <div className="space-y-0.5">
          <h4 className={`text-xs font-bold tracking-wider uppercase ${textPrimary}`}>4. Design Calculator & Converters</h4>
          <p className={`text-[11px] ${textMuted}`}>Fast reference calculations for cooling loads, flow rates, and fan capacities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TR ⇄ kW */}
        <div className={`rounded-xl p-4 space-y-3.5 border ${cardBg}`}>
          <div className={`flex items-center gap-1.5 border-b pb-2 ${headerBorder}`}>
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
            <h5 className={`text-[11px] font-bold uppercase tracking-wide ${textPrimary}`}>Cooling Load (TR ⇄ kW)</h5>
          </div>
          <div className="space-y-2">
            <div><label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Tons of Refrigeration (TR)</label><input type="number" value={tr} onChange={e => handleTrChange(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-bold font-mono outline-none focus:border-amber-500/50 ${inputBg}`} placeholder="TR value" /></div>
            <div className="flex justify-center py-0.5"><span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">1 TR = 3.517 kW</span></div>
            <div><label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Kilowatts of Cooling (kW)</label><input type="number" value={kw} onChange={e => handleKwChange(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-bold font-mono outline-none focus:border-amber-500/50 ${inputBg}`} placeholder="kW value" /></div>
          </div>
        </div>

        {/* GPM ⇄ m³/h */}
        <div className={`rounded-xl p-4 space-y-3.5 border ${cardBg}`}>
          <div className={`flex items-center gap-1.5 border-b pb-2 ${headerBorder}`}>
            <ArrowRightLeft className="w-3.5 h-3.5 text-sky-500" />
            <h5 className={`text-[11px] font-bold uppercase tracking-wide ${textPrimary}`}>Water Flow (GPM ⇄ m³/h)</h5>
          </div>
          <div className="space-y-2">
            <div><label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Gallons Per Minute (GPM)</label><input type="number" value={gpm} onChange={e => handleGpmChange(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-bold font-mono outline-none focus:border-sky-500/50 ${inputBg}`} placeholder="GPM value" /></div>
            <div className="flex justify-center py-0.5"><span className="text-[10px] bg-sky-500/10 text-sky-600 font-bold px-2 py-0.5 rounded-full border border-sky-500/20">1 GPM = 0.227 m³/h</span></div>
            <div><label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Cubic Meter Per Hour (m³/hr)</label><input type="number" value={m3h} onChange={e => handleM3hChange(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-bold font-mono outline-none focus:border-sky-500/50 ${inputBg}`} placeholder="m³/h value" /></div>
          </div>
        </div>

        {/* CFM ⇄ m³/h */}
        <div className={`rounded-xl p-4 space-y-3.5 border ${cardBg}`}>
          <div className={`flex items-center gap-1.5 border-b pb-2 ${headerBorder}`}>
            <ArrowRightLeft className="w-3.5 h-3.5 text-green-500" />
            <h5 className={`text-[11px] font-bold uppercase tracking-wide ${textPrimary}`}>Airflow (CFM ⇄ m³/h)</h5>
          </div>
          <div className="space-y-2">
            <div><label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Cubic Feet Per Minute (CFM)</label><input type="number" value={cfm} onChange={e => handleCfmChange(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-bold font-mono outline-none focus:border-green-500/50 ${inputBg}`} placeholder="CFM value" /></div>
            <div className="flex justify-center py-0.5"><span className="text-[10px] bg-green-500/10 text-green-600 font-bold px-2 py-0.5 rounded-full border border-green-500/20">1 CFM = 1.699 m³/h</span></div>
            <div><label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${labelColor}`}>Cubic Meter Per Hour (m³/hr)</label><input type="number" value={m3hAir} onChange={e => handleM3hAirChange(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-bold font-mono outline-none focus:border-green-500/50 ${inputBg}`} placeholder="m³/h value" /></div>
          </div>
        </div>
      </div>

      {/* Flow Estimator */}
      <div className={`rounded-xl p-4 space-y-4 border ${cardBg}`}>
        <div className={`flex items-center gap-2 border-b pb-3 ${headerBorder}`}>
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <div>
            <h5 className={`text-[12px] font-bold uppercase tracking-wider ${textPrimary}`}>Design Water Flow Estimator (TR Based)</h5>
            <p className={`text-[10px] ${textMuted}`}>Instantly size primary pumps, cooling towers, and chillers based on required thermal cooling capacity.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${labelColor}`}>Required Cooling Load (TR)</label><input type="number" value={estTr} onChange={e => setEstTr(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-bold font-mono outline-none focus:border-sky-500/50 ${inputBg}`} placeholder="e.g., 100" /></div>
          <div><label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${labelColor}`}>Temp Differential (ΔT °C)</label><input type="number" step="0.1" value={deltaT} onChange={e => setDeltaT(e.target.value)} className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-bold font-mono outline-none focus:border-sky-500/50 ${inputBg}`} placeholder="Typical is 5°C" /></div>
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${labelColor}`}>Water Loop Type</label>
            <div className={`flex rounded-lg p-0.5 border ${pillBg}`}>
              <button onClick={() => setFluidType("chw")} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${fluidType === "chw" ? "bg-sky-500 text-white shadow" : textSecondary}`}>Chilled Water</button>
              <button onClick={() => setFluidType("cdw")} className={`flex-1 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${fluidType === "cdw" ? "bg-amber-500 text-white shadow" : textSecondary}`}>Condenser Water</button>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-xl border grid grid-cols-2 gap-4 divide-x text-center ${resultBg} ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${labelColor}`}>Estimated Loop Flow (GPM)</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-sky-500 block">{flowResult.gpm} <span className={`text-xs font-sans font-bold ${textMuted}`}>GPM</span></span>
            <span className={`text-[9px] block ${textMuted}`}>Based on {fluidType === "chw" ? "24 GPM/TR heat factor" : "30 GPM/TR heat factor"}</span>
          </div>
          <div className="space-y-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${labelColor}`}>Estimated Flow (m³/hr)</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-500 block">{flowResult.m3h} <span className={`text-xs font-sans font-bold ${textMuted}`}>m³/h</span></span>
            <span className={`text-[9px] block ${textMuted}`}>Calculated metric conversion equivalent</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  6. MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════

export default EquipmentSelector;

function EquipmentSelector({ theme }: { theme: "dark" | "light" }) {
  const isDark = theme === "dark";

  const [selEq, setSelEq] = useState("cooling_tower");
  const [inputVal, setInputVal] = useState("100");
  const [modeKey, setModeKey] = useState("tr");
  const [result, setResult] = useState<EquipmentModel | null>(null);
  const [modelSearch, setModelSearch] = useState("");

  const eqCategory = MODEL_DATABASE[selEq];
  const currentMode = eqCategory.inputModes.find(m => m.key === modeKey) || eqCategory.inputModes[0];

  const blueprintRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const legalRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (inputVal) setResult(findModel(selEq, inputVal, modeKey));
    else setResult(null);
  }, [selEq, inputVal, modeKey]);

  const handleEqChange = (key: string) => {
    setSelEq(key);
    setModelSearch("");
    const newCat = MODEL_DATABASE[key];
    const defaultMode = newCat.inputModes[0];
    setModeKey(defaultMode.key);
    const presets: Record<string, string> = { cooling_tower: "100", chiller_wc: "200", chiller_ac: "150", ahu: "6000", tfa: "3000", hru: "4000", pump_chw: "350", exhaust_fan: "3000", fresh_air_fan: "4000", fcu: "800", jet_fan: "30" };
    setInputVal(presets[key] || "100");
  };

  const handleModeChange = (key: string) => {
    setModeKey(key);
    const modePresets: Record<string, string> = { tr: "150", kw: "500", gpm: "300", cfm: "4000", m3h: "80", chw_gpm: "240", cdw_gpm: "300", thrust: "30" };
    setInputVal(modePresets[key] || "100");
  };

  const filteredModels = useMemo(() => {
    const list = eqCategory.models;
    if (!modelSearch.trim()) return list;
    const query = modelSearch.toLowerCase();
    return list.filter(m => m.model.toLowerCase().includes(query) || (m.type && m.type.toLowerCase().includes(query)));
  }, [eqCategory, modelSearch]);

  const pageBg = isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const headerBg = isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/95 border-slate-200";
  const jumpBarBg = isDark ? "bg-slate-950/80 border-slate-900" : "bg-white/90 border-slate-200";
  const jumpBtn = isDark ? "bg-slate-800/60 hover:bg-slate-800 border-slate-700/50 text-slate-300" : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600";
  const navBg = isDark ? "bg-slate-900/10 border-slate-900" : "bg-slate-100/30 border-slate-200";
  const controlBg = isDark ? "bg-slate-900/30 border-slate-900" : "bg-white border-slate-200";
  const textPrimary = isDark ? "text-slate-200" : "text-slate-800";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const inputBg = isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-800";
  const modeBtnOff = isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200" : "bg-white border-slate-200 text-slate-500 hover:text-slate-800";
  const resultBanner = isDark ? "bg-sky-500/5 border-sky-500/15" : "bg-sky-50 border-sky-200";
  const tableBorder = isDark ? "border-slate-800 bg-slate-900/20" : "border-slate-200 bg-white";
  const tableHead = isDark ? "bg-slate-900/60 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600";
  const tableRowHover = isDark ? "hover:bg-sky-500/5" : "hover:bg-sky-50";
  const tableDivide = isDark ? "divide-slate-800/40" : "divide-slate-100";
  const tableTextMono = isDark ? "text-slate-400" : "text-slate-500";
  const tableTextNum = isDark ? "text-slate-300" : "text-slate-700";
  const actionBtn = isDark ? "bg-slate-800 text-slate-300 border-slate-700/60 hover:bg-sky-500 hover:text-white hover:border-sky-500" : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-sky-500 hover:text-white hover:border-sky-500";
  const disclaimerBg = isDark ? "bg-slate-900/40 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600";
  const searchBg = isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-300";
  const sizeHeaderBg = isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${pageBg}`}>

      {/* HEADER */}
      <header className={`sticky top-0 z-30 px-4 py-3 border-b flex items-center justify-between shadow-sm backdrop-blur-md ${headerBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-sky-500/25">❄️</div>
          <div>
            <h1 className={`text-sm font-extrabold tracking-wider uppercase leading-tight ${textPrimary}`}>HVAC Selector Pro</h1>
            <p className="text-[10px] text-sky-500 font-bold tracking-widest uppercase">Machine Database v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Site Mode Active</span>
          </div>
        </div>
      </header>

      {/* JUMP BAR */}
      <div className={`sticky top-[58px] z-20 px-4 py-2 border-b flex overflow-x-auto gap-2 scrollbar-none backdrop-blur shadow ${jumpBarBg}`}>
        <span className={`text-[10px] font-extrabold text-sky-500 flex items-center gap-1 uppercase shrink-0`}><Map className="w-3.5 h-3.5" /> Jump:</span>
        <button onClick={() => scrollToSection(blueprintRef)} className={`px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap cursor-pointer ${jumpBtn}`}>📐 GAD Blueprint</button>
        <button onClick={() => scrollToSection(specsRef)} className={`px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap cursor-pointer ${jumpBtn}`}>⚙️ Tech Datasheet</button>
        <button onClick={() => scrollToSection(sizesRef)} className={`px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap cursor-pointer ${jumpBtn}`}>📋 All Sizes List</button>
        <button onClick={() => scrollToSection(toolsRef)} className={`px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap cursor-pointer ${jumpBtn}`}>📊 Design Tools</button>
        <button onClick={() => scrollToSection(legalRef)} className={`px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap cursor-pointer ${jumpBtn}`}>⚠️ Legal Disclaimer</button>
      </div>

      {/* CATEGORY NAV */}
      <nav className={`flex overflow-x-auto gap-2 px-4 py-3.5 scrollbar-none border-b shadow-inner ${navBg}`}>
        {Object.entries(MODEL_DATABASE).map(([k, v]) => {
          const isSelected = selEq === k;
          return (
            <button key={k} onClick={() => handleEqChange(k)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all whitespace-nowrap active:scale-95 cursor-pointer border ${isSelected ? "bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/25" : isDark ? "bg-slate-900 border-slate-800/85 text-slate-400 hover:text-slate-200 hover:border-slate-700" : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm"}`}>
              <span className="text-base">{v.icon}</span>
              <span>{v.label}</span>
            </button>
          );
        })}
      </nav>

      {/* CONTROL DASHBOARD */}
      <section className={`p-4 border-b ${controlBg}`}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${textSecondary}`}>
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              1. Choose Selection Parameter Unit
            </label>
            <div className="flex flex-wrap gap-1.5">
              {eqCategory.inputModes.map((mode) => (
                <button key={mode.key} onClick={() => handleModeChange(mode.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all active:scale-95 cursor-pointer ${modeKey === mode.key ? "bg-sky-500/10 border-sky-500 text-sky-500" : modeBtnOff}`}>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-wider block ${textSecondary}`}>2. Enter Design Specification Value</label>
            <div className="relative flex items-center gap-2">
              <input type="number"
                placeholder={`Enter capacity load in ${currentMode.label}...`}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border font-black text-sm sm:text-base outline-none focus:ring-2 focus:ring-sky-500/25 transition-all ${inputBg}`} />
              <span className={`absolute right-3 text-xs font-bold uppercase tracking-widest pointer-events-none ${textSecondary}`}>{currentMode.label}</span>
            </div>
          </div>
        </div>
        {result && (
          <div className="max-w-4xl mx-auto mt-4">
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${resultBanner}`}>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${textSecondary}`}>Standard Size Selected</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-sm font-black tracking-wide uppercase ${textPrimary}`}>{result.model}</span>
                    <span className={`text-xs ${textSecondary}`}>•</span>
                    <span className={`text-xs font-semibold ${textSecondary}`}>{result.type || "Standard HVAC Unit"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* MAIN BODY */}
      <main className="flex-1 p-4 max-w-5xl w-full mx-auto space-y-12 pb-24">

        <div ref={blueprintRef} className="scroll-mt-36">
          <GADBlueprint eqKey={selEq} model={result} color={eqCategory.color} isDark={isDark} />
        </div>

        <div ref={specsRef} className="scroll-mt-36">
          <TechnicalSpecs eqKey={selEq} model={result} isDark={isDark} />
        </div>

        {/* ALL SIZES TABLE */}
        <div ref={sizesRef} className="scroll-mt-36 space-y-4">
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${sizeHeaderBg}`}>
            <div className="space-y-0.5">
              <h4 className={`text-xs font-bold tracking-wider uppercase flex items-center gap-2 ${textPrimary}`}>📋 3. Standard Model Sizing Reference Sheet</h4>
              <p className={`text-[11px] ${textSecondary}`}>Tap any row below to instantly select and generate GAD drawing blueprints.</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border max-w-xs w-full ${searchBg}`}>
              <Search className={`w-4 h-4 shrink-0 ${textSecondary}`} />
              <input type="text" placeholder="Search models..." value={modelSearch} onChange={(e) => setModelSearch(e.target.value)}
                className={`w-full bg-transparent border-none outline-none text-xs font-semibold placeholder-slate-400 ${textPrimary}`} />
            </div>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${tableBorder}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-[10px] font-bold tracking-wider uppercase border-b ${tableHead}`}>
                    <th className="p-3">Model No</th>
                    <th className="p-3">Design Capacity</th>
                    <th className="p-3">Dimensions (L×W×H)</th>
                    <th className="p-3 text-right">Operating Weight</th>
                    <th className="p-3 text-right">Electrical FLA</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-[12px] sm:text-sm ${tableDivide}`}>
                  {filteredModels.length === 0 ? (
                    <tr><td colSpan={6} className={`text-center p-8 font-medium ${textSecondary}`}>No models matched your search query. Try another keyword.</td></tr>
                  ) : (
                    filteredModels.map((m) => {
                      const isCurrent = result?.model === m.model;
                      let capacityStr = "—";
                      if (selEq === "cooling_tower" || selEq.startsWith("chiller") || selEq === "fcu") capacityStr = `${m.cap_tr} TR`;
                      else if (selEq === "pump_chw") capacityStr = `${m.gpm} GPM`;
                      else if (selEq === "jet_fan") capacityStr = `${m.thrust_n} N / ${m.cfm} CFM`;
                      else capacityStr = `${m.cfm} CFM`;
                      return (
                        <tr key={m.model} onClick={() => {
                          if (selEq === "cooling_tower" || selEq.startsWith("chiller") || selEq === "fcu") { setModeKey("tr"); setInputVal(String(m.cap_tr)); }
                          else if (selEq === "jet_fan") { setModeKey("thrust"); setInputVal(String(m.thrust_n)); }
                          else if (selEq === "ahu" || selEq === "tfa" || selEq === "hru" || selEq.endsWith("fan")) { setModeKey("cfm"); setInputVal(String(m.cfm)); }
                          else if (selEq === "pump_chw") { setModeKey("gpm"); setInputVal(String(m.gpm)); }
                          scrollToSection(blueprintRef);
                        }} className={`transition-all cursor-pointer ${tableRowHover} ${isCurrent ? isDark ? "bg-sky-500/10 border-l-4 border-l-sky-500 font-bold text-sky-400" : "bg-sky-50 border-l-4 border-l-sky-500 font-bold" : ""}`}>
                          <td className="p-3 font-bold text-sky-500">{m.model}</td>
                          <td className={`p-3 font-bold ${textPrimary}`}>{capacityStr}</td>
                          <td className={`p-3 font-mono text-xs ${tableTextMono}`}>{m.l}×{m.w}×{m.h} <span className="text-[10px]">mm</span></td>
                          <td className={`p-3 text-right font-mono font-bold ${tableTextNum}`}>{m.wt_op || m.wt_total || m.wt_dry || "—"} kg</td>
                          <td className={`p-3 text-right font-mono font-bold ${tableTextNum}`}>{m.fla ? `${m.fla} A` : "—"}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded border uppercase transition-all ${actionBtn}`}>
                              Load GAD <ArrowRight className="w-3 h-3" />
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* DESIGN TOOLS */}
        <div ref={toolsRef} className="scroll-mt-36">
          <QuickConverterAndCalc isDark={isDark} />
        </div>

        {/* DISCLAIMER */}
        <div ref={legalRef} className="scroll-mt-36 space-y-4">
          <div className={`p-5 rounded-2xl border leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-sans ${disclaimerBg}`}>
            <h4 className="text-sm font-extrabold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              5. Engineering Disclaimer & Reference Notes
            </h4>
            {DISCLAIMER}
          </div>
        </div>

      </main>
    </div>
  );
}
