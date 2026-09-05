import { useState, useEffect, useRef } from "react";
import { Network, Sparkles, Cylinder } from "lucide-react";
import { Pipette, Waves, Flame, Wind } from "lucide-react";

import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { AppUpdate, AppUpdateAvailability } from "@capawesome/capacitor-app-update";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Home, LayoutGrid, Database, Gauge, Thermometer, ChevronRight, Monitor, Ruler, Droplets, Zap, Sun, Moon, PlayCircle, Lock, Bell, BellRing, CheckCheck, Info, AlertTriangle, Lightbulb, X, Trash2, Share2, Star, Menu, ShieldCheck, FileText, Mail, Wrench, Globe, Smartphone, Download } from "lucide-react";

// --- THEME IMPORTS ---
import { useTheme } from "./hooks/useTheme";

// Main Components
import DuctSizer from "./components/DuctSizer";
import InstallPrompt from "./components/InstallPrompt";
import Settings from "./components/Settings";

// Page Components
import Privacy from "./components/Privacy";
import About from "./components/About";
import Disclaimer from "./components/Disclaimer";
import Contact from "./components/Contact";

// --- TOOLS COMPONENTS IMPORT ---
import EquipmentSelector from "./components/EquipmentSelector";
import ElectricalLoadCalculator from "./components/ElectricalLoadCalculator";
import StaticPressureCalculator from "./components/StaticPressureCalculator";
import Pressurrization from "./components/Pressurrization";
import PsychrometricCalculator from "./components/PsychrometricTool";
import PipeSizer from "./components/PipeSizer";
import HeatLoad from "./components/HeatLoad";
import RefrigerationGas from "./components/RefrigerationGas";
import ComingSoon from "./components/ComingSoon";
import AllCatalogueApp, { type CatalogueView } from "./components/catalogue/AllCatalogueApp";
import DaikinVRV from "./components/DaikinVRV";
import SplashScreen from "./components/SplashScreen";
import VentilationGuide from "./components/VentilationGuide";
import HumidityTool from "./components/humidity/HumidityTool";
import ScrubberWaterUsageCalculator from "./components/ScrubberWaterUsageCalculator";

// ─────────────────────────────────────────────────────────────────────────────
//  APP VERSION — Yeh apne current version se match karo
//  Jab bhi naya update aaye, sirf version.json file update karo GitHub pe
// ─────────────────────────────────────────────────────────────────────────────
const APP_VERSION = "4.4.4";

// ─────────────────────────────────────────────────────────────────────────────
//  PLAY STORE LINK — Apna actual package ID daalo
// ─────────────────────────────────────────────────────────────────────────────
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.rehan.hvacmastertoolkit";

// ─────────────────────────────────────────────────────────────────────────────
//  VERSION JSON URL — GitHub pe yeh file banao
//  File content example:
//  {
//    "latest_version": "4.4.4.3",
//    "console.capgo version : 0.0.9,
//    "force_update": false,
//    "message": "Nayi update mein PipeSizer Pro aur Splash Screen add hua hai!"
//  }
// ─────────────────────────────────────────────────────────────────────────────
const VERSION_URL = "https://raw.githubusercontent.com/YOURUSERNAME/YOURREPO/main/version.json";

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION TYPES & DEFAULT DATA
// ─────────────────────────────────────────────────────────────────────────────

export type NotifType = "tip" | "update" | "reminder" | "warning";

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n_catalog_soon",
    type: "update",
    title: "🌍 World Catalog Coming Soon",
    body: "A complete catalog of HVAC equipment, brands, and products from around the world is coming to this app soon.",
    time: "Just now",
    read: false,
  },
  {
    id: "n1",
    type: "tip",
    title: "💡 HVAC Design Tip",
    body: "Cooling tower approach temperature should be kept ≥ 4°C for efficient operation. Lower approach = larger & costlier tower.",
    time: "Just now",
    read: false,
  },
  {
    id: "n_daikin_soon",
    type: "update",
    title: "🚀 Daikin VRV Pipe Sizing Coming Soon",
    body: "Daikin VRV refrigerant pipe sizing software jald hi launch hone wala hai — stay tuned!",
    time: "2 min ago",
    read: false,
  },
  {
    id: "n3",
    type: "reminder",
    title: "📋 Always Verify Data",
    body: "All specs shown are indicative reference values. Confirm with manufacturer datasheets before finalising any design or BOQ.",
    time: "5 min ago",
    read: false,
  },
  {
    id: "n4",
    type: "tip",
    title: "💡 Duct Sizing Rule",
    body: "For low-velocity duct design, maintain supply air velocity between 6–8 m/s in main ducts and 4–5 m/s in branch ducts.",
    time: "10 min ago",
    read: true,
  },
  {
    id: "n5",
    type: "warning",
    title: "⚠️ Structural Check Required",
    body: "Equipment operating weights shown include water-filled conditions. Always have a licensed structural engineer verify foundation loads.",
    time: "1 hr ago",
    read: true,
  },
  {
    id: "n6",
    type: "update",
    title: "🔧 Psychrometric Tool Updated",
    body: "Psychro Pro now includes enthalpy and specific volume calculations for humid air. Check it out under Master Toolkit.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n7",
    type: "tip",
    title: "💡 CHW ΔT Best Practice",
    body: "Increasing chilled water ΔT from 5°C to 8°C reduces pump flow by ~37%, cutting pump energy significantly on large plants.",
    time: "Yesterday",
    read: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION ICON HELPER
// ─────────────────────────────────────────────────────────────────────────────
function notifIcon(type: NotifType) {
  switch (type) {
    case "tip":      return <Lightbulb size={15} />;
    case "update":   return <Info size={15} />;
    case "reminder": return <BellRing size={15} />;
    case "warning":  return <AlertTriangle size={15} />;
  }
}

function notifColors(type: NotifType, isDark: boolean) {
  const map: Record<NotifType, { bg: string; icon: string; border: string }> = {
    tip:      { bg: isDark ? "rgba(234,179,8,0.08)"  : "#fefce8", icon: "#eab308", border: isDark ? "rgba(234,179,8,0.2)"  : "#fde047" },
    update:   { bg: isDark ? "rgba(59,130,246,0.08)" : "#eff6ff", icon: "#3b82f6", border: isDark ? "rgba(59,130,246,0.2)" : "#93c5fd" },
    reminder: { bg: isDark ? "rgba(45,212,191,0.08)" : "#f0fdfa", icon: "#2DD4BF", border: isDark ? "rgba(45,212,191,0.2)" : "#5eead4" },
    warning:  { bg: isDark ? "rgba(239,68,68,0.08)"  : "#fef2f2", icon: "#ef4444", border: isDark ? "rgba(239,68,68,0.2)"  : "#fca5a5" },
  };
  return map[type];
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION PANEL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface NotifPanelProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  theme: "dark" | "light";
}

function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onDelete, onClearAll, onClose, theme }: NotifPanelProps) {
  const isDark = theme === "dark";
  const panelBg    = isDark ? "#0F2444" : "#ffffff";
  const headerBg   = isDark ? "#0B1F3A" : "#f8fafc";
  const borderCol  = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const textPri    = isDark ? "#e2e8f0" : "#1e293b";
  const textSec    = isDark ? "#94a3b8" : "#64748b";
  const hoverBg    = isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9";
  const unreadDot  = "#2DD4BF";

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      style={{
        position: "fixed",
        top: "64px",
        right: "16px",
        width: "min(360px, calc(100vw - 32px))",
        maxHeight: "78vh",
        borderRadius: "20px",
        background: panelBg,
        border: `1px solid ${borderCol}`,
        boxShadow: isDark
          ? "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(45,212,191,0.08)"
          : "0 24px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "notifSlideIn 0.22s cubic-bezier(0.175,0.885,0.32,1.275)",
      }}
    >
      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .notif-item:hover { background: ${hoverBg} !important; }
        .notif-scroll::-webkit-scrollbar { width: 4px; }
        .notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .notif-scroll::-webkit-scrollbar-thumb { background: ${borderCol}; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 12px", background: headerBg,
        borderBottom: `1px solid ${borderCol}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Bell size={18} color="#2DD4BF" />
          <span style={{ fontWeight: 800, fontSize: "14px", color: textPri, letterSpacing: "0.03em" }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: "#2DD4BF", color: "#0B1F3A", fontSize: "10px",
              fontWeight: 800, padding: "1px 6px", borderRadius: "10px", lineHeight: 1.6,
            }}>{unreadCount} new</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead} style={{
              fontSize: "10px", fontWeight: 700, color: "#2DD4BF", background: "transparent",
              border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "8px",
              transition: "background 0.2s",
            }}>Mark all read</button>
          )}
          {notifications.length > 0 && (
            <button onClick={onClearAll} title="Clear all" style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: isDark ? "#475569" : "#94a3b8", display: "flex", alignItems: "center",
              padding: "4px", borderRadius: "6px", transition: "color 0.2s",
            }}>
              <Trash2 size={14} />
            </button>
          )}
          <button onClick={onClose} style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: isDark ? "#475569" : "#94a3b8", display: "flex", alignItems: "center",
            padding: "4px", borderRadius: "6px",
          }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="notif-scroll" style={{ overflowY: "auto", flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "48px 24px", gap: "12px",
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              background: isDark ? "rgba(45,212,191,0.08)" : "#f0fdfa",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCheck size={24} color="#2DD4BF" />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: textSec }}>All caught up!</span>
            <span style={{ fontSize: "11px", color: textSec, textAlign: "center" }}>No notifications at the moment.</span>
          </div>
        ) : (
          notifications.map((notif) => {
            const clr = notifColors(notif.type, isDark);
            return (
              <div
                key={notif.id}
                className="notif-item"
                onClick={() => onMarkRead(notif.id)}
                style={{
                  display: "flex", gap: "12px", padding: "14px 16px",
                  borderBottom: `1px solid ${borderCol}`,
                  background: notif.read ? "transparent" : clr.bg,
                  cursor: "pointer", transition: "background 0.2s", position: "relative",
                }}
              >
                {!notif.read && (
                  <div style={{
                    position: "absolute", left: "6px", top: "50%",
                    transform: "translateY(-50%)",
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: unreadDot,
                    boxShadow: `0 0 6px ${unreadDot}`,
                  }} />
                )}
                <div style={{
                  flexShrink: 0, width: "34px", height: "34px", borderRadius: "10px",
                  background: `${clr.icon}18`,
                  border: `1px solid ${clr.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: clr.icon, marginLeft: "4px",
                }}>
                  {notifIcon(notif.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px" }}>
                    <span style={{
                      fontSize: "12px", fontWeight: notif.read ? 600 : 800,
                      color: textPri, lineHeight: 1.4, flex: 1,
                    }}>{notif.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        color: isDark ? "#334155" : "#cbd5e1",
                        padding: "0", flexShrink: 0, display: "flex",
                        transition: "color 0.2s",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p style={{
                    fontSize: "11px", color: textSec, lineHeight: 1.55,
                    margin: "3px 0 5px", wordBreak: "break-word",
                  }}>{notif.body}</p>
                  <span style={{
                    fontSize: "10px", color: isDark ? "#334155" : "#94a3b8",
                    fontWeight: 500,
                  }}>{notif.time}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div style={{
          padding: "10px 16px", borderTop: `1px solid ${borderCol}`,
          background: headerBg, flexShrink: 0, textAlign: "center",
        }}>
          <span style={{ fontSize: "10px", color: textSec, fontWeight: 500 }}>
            {notifications.filter(n => n.read).length} read · {unreadCount} unread
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARE & RATE MODAL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface ShareRateModalProps {
  theme: "dark" | "light";
  onClose: () => void;
}

function ShareRateModal({ theme, onClose }: ShareRateModalProps) {
  const isDark = theme === "dark";
  const [rated, setRated] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);

  const bg        = isDark ? "#0F2444" : "#ffffff";
  const overlayBg = "rgba(0,0,0,0.65)";
  const textPri   = isDark ? "#e2e8f0" : "#1e293b";
  const textSec   = isDark ? "#94a3b8" : "#64748b";
  const border    = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const cardBg    = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";

  const handleShare = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      await Share.share({
        title: "HVAC Hub - Tools & Community",
        text: "Check out HVAC Toolkit Pro — Professional HVAC engineering calculations at your fingertips! 🔧",
        url: PLAY_STORE_URL,
        dialogTitle: "Share HVAC Hub - Tools & Community",
      });
    } catch (e) {
      // Fallback: Web Share API ya clipboard
      try {
        if (navigator.share) {
          await navigator.share({
            title: "HVAC Hub - Tools & Community",
            text: "Check out HVAC Hub - Tools & Community — Professional HVAC engineering calculations!",
            url: PLAY_STORE_URL,
          });
        } else {
          await navigator.clipboard.writeText(PLAY_STORE_URL);
          alert("Link copied to clipboard!");
        }
      } catch (err) {}
    }
  };

  const handleStarClick = async (star: number) => {
    setSelectedStar(star);
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    setTimeout(() => {
      setRated(true);
      // Play Store kholo
      window.open(PLAY_STORE_URL, "_blank");
    }, 400);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: overlayBg,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(3px)",
        animation: "fadeInOverlay 0.2s ease",
      }}
    >
      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .share-btn:active { transform: scale(0.96) !important; }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "480px",
          background: bg,
          borderTopLeftRadius: "28px", borderTopRightRadius: "28px",
          padding: "0 0 32px",
          animation: "slideUpSheet 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
          border: `1px solid ${border}`,
          boxShadow: isDark
            ? "0 -20px 60px rgba(0,0,0,0.5)"
            : "0 -20px 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* Drag Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 16px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: textPri }}>Share & Rate</div>
            <div style={{ fontSize: "12px", color: textSec, marginTop: "2px" }}>Support us & spread the word 🙌</div>
          </div>
          <button onClick={onClose} style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
            border: "none", cursor: "pointer", borderRadius: "50%",
            width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
            color: textSec,
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Share Card */}
          <div style={{
            background: cardBg, borderRadius: "20px",
            border: `1px solid ${border}`, padding: "18px 20px",
            display: "flex", alignItems: "center", gap: "16px",
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "16px", flexShrink: 0,
              background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,176,0.2))",
              border: "1px solid rgba(59,130,246,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Share2 size={22} color="#3b82f6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: textPri, marginBottom: "3px" }}>Share with Friends</div>
              <div style={{ fontSize: "11px", color: textSec, lineHeight: 1.5 }}>
                Share HVAC Toolkit with your colleagues & engineers
              </div>
            </div>
            <button
              className="share-btn"
              onClick={handleShare}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563b0)",
                border: "none", borderRadius: "14px",
                padding: "10px 18px", cursor: "pointer",
                color: "white", fontSize: "13px", fontWeight: 700,
                boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                transition: "transform 0.15s ease",
                flexShrink: 0,
              }}
            >
              Share
            </button>
          </div>

          {/* Rate Us Card */}
          <div style={{
            background: cardBg, borderRadius: "20px",
            border: `1px solid ${border}`, padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "16px", flexShrink: 0,
                background: "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(245,158,11,0.2))",
                border: "1px solid rgba(234,179,8,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Star size={22} color="#eab308" fill="#eab308" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: textPri, marginBottom: "3px" }}>Rate on Play Store</div>
                <div style={{ fontSize: "11px", color: textSec, lineHeight: 1.5 }}>
                  {rated ? "Thank you for your review! 🎉" : "Your rating helps us improve the app"}
                </div>
              </div>
            </div>

            {!rated ? (
              <>
                {/* Star Row */}
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "14px" }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => handleStarClick(star)}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        padding: "4px", transition: "transform 0.15s ease",
                        transform: (hoveredStar >= star || selectedStar >= star) ? "scale(1.2)" : "scale(1)",
                      }}
                    >
                      <Star
                        size={36}
                        color="#eab308"
                        fill={(hoveredStar >= star || selectedStar >= star) ? "#eab308" : "transparent"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
                <div style={{ textAlign: "center", fontSize: "11px", color: textSec }}>
                  Tap a star to rate on Play Store
                </div>
              </>
            ) : (
              <div style={{
                textAlign: "center", padding: "10px",
                fontSize: "28px", letterSpacing: "4px",
              }}>
                {"★".repeat(selectedStar)}
              </div>
            )}
          </div>

          {/* Divider + small note */}
          <div style={{ textAlign: "center", fontSize: "11px", color: isDark ? "#334155" : "#94a3b8", paddingBottom: "4px" }}>
            Made with ❤️ for HVAC engineers worldwide
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DESKTOP NAV CONFIG — bade screen (sidebar) ke liye
// ─────────────────────────────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: "home", label: "Home", icon: <Home size={19} /> },
  { id: "tools", label: "Master Toolkit", icon: <LayoutGrid size={19} /> },
  { id: "catalog", label: "World Catalog", icon: <Globe size={19} /> },
];

const TOOL_PAGES = ["equipment-selector","elec-load","static-pressure","pressurrization","psychro-calc","pipe-sizer","heat-load","refrigeration-gas","ventilation","humidity","scrubber-water","coming-soon","daikin-vrv"];

// Screen width se neeche isDesktop = false, hamburger + bottom-nav layout dikhega
const DESKTOP_BREAKPOINT = 880;

// ─────────────────────────────────────────────────────────────────────────────
//  APP LINK — WEB APP URL (Chrome / Edge Desktop pe bhi available hai)
// ─────────────────────────────────────────────────────────────────────────────
const WEB_APP_URL = "https://hvac-master-toolkit.netlify.app/";

// ─────────────────────────────────────────────────────────────────────────────
//  AVAILABLE ON DESKTOP — INFO MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface DesktopAvailableModalProps {
  theme: "dark" | "light";
  onClose: () => void;
}

function DesktopAvailableModal({ theme, onClose }: DesktopAvailableModalProps) {
  const isDark    = theme === "dark";
  const bg        = isDark ? "#0F2444" : "#ffffff";
  const overlayBg = "rgba(0,0,0,0.65)";
  const textPri   = isDark ? "#e2e8f0" : "#1e293b";
  const textSec   = isDark ? "#94a3b8" : "#64748b";
  const border    = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const cardBg    = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    try {
      await navigator.clipboard.writeText(WEB_APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {}
  };

  const handleOpen = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    window.open(WEB_APP_URL, "_blank");
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: overlayBg,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        backdropFilter: "blur(3px)",
        animation: "fadeInOverlay 0.2s ease",
      }}
    >
      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .desktop-btn:active { transform: scale(0.96) !important; }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "480px",
          background: bg,
          borderTopLeftRadius: "28px", borderTopRightRadius: "28px",
          padding: "0 0 32px",
          animation: "slideUpSheet 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
          border: `1px solid ${border}`,
          boxShadow: isDark ? "0 -20px 60px rgba(0,0,0,0.5)" : "0 -20px 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* Drag Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 16px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: textPri }}>Available on Desktop 💻</div>
            <div style={{ fontSize: "12px", color: textSec, marginTop: "2px" }}>
              Also use it in Chrome / Edge (Desktop)
            </div>
          </div>
          <button onClick={onClose} style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
            border: "none", cursor: "pointer", borderRadius: "50%",
            width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
            color: textSec,
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{
            background: cardBg, borderRadius: "16px",
            border: `1px solid ${border}`, padding: "16px",
          }}>
            <div style={{ fontSize: "12.5px", color: textSec, lineHeight: 1.6, marginBottom: "12px" }}>
              "HVAC Hub - Tools & Community" is now available on the Chrome / Edge browser on your PC or laptop. Open the link below, or copy and share it:
            </div>
            <div style={{
              background: isDark ? "rgba(0,0,0,0.2)" : "#ffffff",
              border: `1px solid ${border}`, borderRadius: "10px",
              padding: "10px 12px", fontSize: "12px", color: textPri,
              wordBreak: "break-all", fontWeight: 600,
            }}>
              {WEB_APP_URL}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="desktop-btn"
              onClick={handleOpen}
              style={{
                flex: 1, background: "linear-gradient(135deg, #2DD4BF, #2563b0)",
                border: "none", borderRadius: "14px",
                padding: "13px", cursor: "pointer",
                color: "white", fontSize: "13px", fontWeight: 700,
                boxShadow: "0 6px 16px rgba(45,212,191,0.3)",
                transition: "transform 0.15s ease",
              }}
            >
              Open Link
            </button>
            <button
              className="desktop-btn"
              onClick={handleCopy}
              style={{
                flex: 1, background: cardBg,
                border: `1px solid ${border}`, borderRadius: "14px",
                padding: "13px", cursor: "pointer",
                color: textPri, fontSize: "13px", fontWeight: 700,
                transition: "transform 0.15s ease",
              }}
            >
              {copied ? "Copied! ✓" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIDE MENU (HAMBURGER DRAWER) COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface SideMenuProps {
  theme: "dark" | "light";
  onClose: () => void;
  onNavigate: (page: string) => void;
  onShare: () => void;
  onDesktopInfo: () => void;
  version: string;
}

function SideMenu({ theme, onClose, onNavigate, onShare, onDesktopInfo, version }: SideMenuProps) {
  const isDark   = theme === "dark";
  const panelBg  = isDark ? "#0F2444" : "#ffffff";
  const headerBg = isDark ? "#0B1F3A" : "#f8fafc";
  const border   = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const textPri  = isDark ? "#e2e8f0" : "#1e293b";
  const textSec  = isDark ? "#94a3b8" : "#64748b";
  const hoverBg  = isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9";

  // ── Closing animation — same style as opening, played in reverse before unmount ──
  const CLOSE_DURATION = 220;
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = () => {
    setIsClosing(true);
    setTimeout(onClose, CLOSE_DURATION);
  };

  const items: { id: string; label: string; icon: JSX.Element; color: string }[] = [
    { id: "about",      label: "About Us",       icon: <Info size={18} />,          color: "#3b82f6" },
    { id: "privacy",    label: "Privacy Policy", icon: <ShieldCheck size={18} />,   color: "#10B981" },
    { id: "disclaimer", label: "Disclaimer",     icon: <AlertTriangle size={18} />, color: "#F59E0B" },
    { id: "contact",    label: "Contact Us",     icon: <Mail size={18} />,          color: "#8B5CF6" },
  ];

  const handleItemClick = async (item: typeof items[number]) => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    onNavigate(item.id);
    requestClose();
  };

  const handleShareOrRateClick = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    onShare();
    requestClose();
  };

  const handleDesktopInfoClick = async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    onDesktopInfo();
    requestClose();
  };

  return (
    <div
      onClick={requestClose}
      style={{
        position: "fixed", inset: 0, zIndex: 3000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(2px)",
        animation: isClosing
          ? "sideMenuFadeOut 0.2s ease forwards"
          : "sideMenuFade 0.2s ease",
      }}
    >
      <style>{`
        @keyframes sideMenuFade    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sideMenuFadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes sideMenuSlide    { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes sideMenuSlideOut { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        .side-menu-item:hover { background: ${hoverBg} !important; }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(300px, 82vw)", height: "100%",
          background: panelBg,
          borderRight: `1px solid ${border}`,
          display: "flex", flexDirection: "column",
          boxShadow: isDark ? "8px 0 40px rgba(0,0,0,0.5)" : "8px 0 40px rgba(0,0,0,0.15)",
          animation: isClosing
            ? "sideMenuSlideOut 0.22s cubic-bezier(0.175,0.885,0.32,1.275) forwards"
            : "sideMenuSlide 0.25s cubic-bezier(0.175,0.885,0.32,1.275)",
        }}
      >
        {/* Header — logo + app name + version */}
        <div style={{
          padding: "22px 20px 18px",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
          background: headerBg,
          borderBottom: `1px solid ${border}`, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "42px", height: "42px", borderRadius: "12px", flexShrink: 0,
              background: "linear-gradient(135deg, #2DD4BF, #2563b0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(45,212,191,0.35)",
            }}>
              <Wrench size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: textPri, letterSpacing: "0.01em", lineHeight: 1.2 }}>
                HVAC Hub
              </div>
              <div style={{ fontSize: "11px", color: textSec, marginTop: "2px" }}>
                Pro · v{version}
              </div>
            </div>
          </div>
          <button onClick={requestClose} style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
            border: "none", cursor: "pointer", borderRadius: "50%",
            width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center",
            color: textSec, flexShrink: 0,
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="side-menu-item"
              onClick={() => handleItemClick(item)}
              style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "13px 20px", cursor: "pointer",
                transition: "background 0.15s ease",
              }}
            >
              <div style={{
                width: "34px", height: "34px", borderRadius: "10px",
                background: `${item.color}18`, color: item.color,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: "14px", fontWeight: 600, color: textPri }}>{item.label}</span>
              <ChevronRight size={15} style={{ marginLeft: "auto", color: isDark ? "#475569" : "#cbd5e1" }} />
            </div>
          ))}

          <div
            className="side-menu-item"
            onClick={handleDesktopInfoClick}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "13px 20px", cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "rgba(45,212,191,0.14)", color: "#2DD4BF",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Monitor size={17} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: textPri }}>Available on Desktop</span>
            <ChevronRight size={15} style={{ marginLeft: "auto", color: isDark ? "#475569" : "#cbd5e1" }} />
          </div>

          <div style={{ height: "1px", background: border, margin: "10px 20px" }} />

          <div
            className="side-menu-item"
            onClick={handleShareOrRateClick}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "13px 20px", cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "rgba(59,130,246,0.12)", color: "#3b82f6",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Share2 size={17} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: textPri }}>Share App</span>
            <ChevronRight size={15} style={{ marginLeft: "auto", color: isDark ? "#475569" : "#cbd5e1" }} />
          </div>

          <div
            className="side-menu-item"
            onClick={handleShareOrRateClick}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "13px 20px", cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "rgba(234,179,8,0.12)", color: "#eab308",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Star size={17} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: textPri }}>Rate Us</span>
            <ChevronRight size={15} style={{ marginLeft: "auto", color: isDark ? "#475569" : "#cbd5e1" }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 20px", borderTop: `1px solid ${border}`,
          textAlign: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: "10px", color: textSec, fontWeight: 500 }}>
            Made with ❤️ for HVAC engineers worldwide
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE DIALOG COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface UpdateDialogProps {
  message: string;
  forceUpdate: boolean;
  theme: "dark" | "light";
  onClose: () => void;
}

function UpdateDialog({ message, forceUpdate, theme, onClose }: UpdateDialogProps) {
  const isDark = theme === "dark";
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: isDark ? "#0F2444" : "white",
        borderRadius: "28px",
        padding: "32px 24px 24px",
        maxWidth: "320px",
        width: "100%",
        textAlign: "center",
        border: `1px solid ${isDark ? "rgba(45,212,191,0.25)" : "#e2e8f0"}`,
        boxShadow: isDark
          ? "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(45,212,191,0.1)"
          : "0 32px 80px rgba(0,0,0,0.15)",
        animation: "updatePopIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275)",
      }}>
        <style>{`
          @keyframes updatePopIn {
            from { opacity: 0; transform: scale(0.85) translateY(20px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);    }
          }
        `}</style>

        {/* Icon */}
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(45,212,191,0.15), rgba(37,99,176,0.15))",
          border: "1px solid rgba(45,212,191,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: "36px",
        }}>🚀</div>

        {/* Title */}
        <h2 style={{
          color: isDark ? "white" : "#1e293b",
          fontSize: "22px", fontWeight: 800,
          marginBottom: "10px", lineHeight: 1.2,
        }}>Update Available!</h2>

        {/* Message */}
        <p style={{
          color: isDark ? "#94a3b8" : "#64748b",
          fontSize: "13px", lineHeight: 1.65,
          marginBottom: "28px",
        }}>{message}</p>

        {/* Update Button */}
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block", padding: "15px",
            background: "linear-gradient(135deg, #2DD4BF, #2563b0)",
            color: "white", borderRadius: "16px",
            fontWeight: 700, fontSize: "15px",
            textDecoration: "none", marginBottom: "12px",
            boxShadow: "0 8px 20px rgba(45,212,191,0.3)",
            letterSpacing: "0.02em",
          }}
        >
          Update Now →
        </a>

        {/* Later button — sirf tab dikhao jab force_update false ho */}
        {!forceUpdate && (
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none",
              color: isDark ? "#475569" : "#94a3b8",
              fontSize: "13px", cursor: "pointer",
              padding: "10px 20px", borderRadius: "10px",
              width: "100%",
              transition: "color 0.2s",
            }}
          >
            I will do it later.
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LIGHT MODE DEFAULT — Module load hote hi run hoga (hook se pehle)
//  Agar koi saved theme nahi hai to light set karo
// ─────────────────────────────────────────────────────────────────────────────
(function ensureLightDefault() {
  try {
    const KEYS = ["theme", "colorTheme", "app-theme", "hvac-theme", "vite-ui-theme"];
    const alreadySet = KEYS.some(k => localStorage.getItem(k) !== null);
    if (!alreadySet) {
      KEYS.forEach(k => localStorage.setItem(k, "light"));
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  } catch (e) {}
})();

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState("home");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showSplash, setShowSplash] = useState(true);

  // ── World Catalog back-stack ─────────────────────────────────────────────
  // Catalogue ke andar ki screens (home → browse → compare) ka hisaab, taaki
  // app ka back button / Android hardware back har level pe sahi pichhe jaaye.
  const [catView, setCatView] = useState<CatalogueView>({ screen: "home" });
  const [catStack, setCatStack] = useState<CatalogueView[]>([]);

  const openCatView = (v: CatalogueView) => {
    setCatStack((s) => [...s, catView]);
    setCatView(v);
  };

  // ── Update Dialog State ──
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);

  // ── Share & Rate Modal ──
  const [showShareModal, setShowShareModal] = useState(false);

  // ── Side Menu (Hamburger Drawer) ──
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Available on Desktop — info modal state ──
  const [showDesktopInfo, setShowDesktopInfo] = useState(false);

  // ── Responsive layout — bade screen pe sidebar, chhote screen pe hamburger + bottom-nav ──
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= DESKTOP_BREAKPOINT : true
  );
  useEffect(() => {
    const handleLayoutResize = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    window.addEventListener("resize", handleLayoutResize);
    return () => window.removeEventListener("resize", handleLayoutResize);
  }, []);

  // Theme
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // ── Notification State — localStorage se persist karo ──
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("hvac_notifications");
      if (saved) {
        const parsed: AppNotification[] = JSON.parse(saved);
        // Sirf wahi saved notifications rakho jo abhi bhi INITIAL_NOTIFICATIONS
        // list mein exist karte hain — purane/removed IDs (jaise ek outdated
        // "Catalog is Live" wala) yahin drop ho jayenge.
        const validIds = new Set(INITIAL_NOTIFICATIONS.map(n => n.id));
        const cleaned = parsed.filter(n => validIds.has(n.id));
        // Naye notifications merge karo jo pehle save nahi the (naye IDs add karo)
        const savedIds = new Set(cleaned.map(n => n.id));
        const newOnes = INITIAL_NOTIFICATIONS.filter(n => !savedIds.has(n.id));
        return [...newOnes, ...cleaned];
      }
    } catch (e) {}
    return INITIAL_NOTIFICATIONS;
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Notifications badlenge to localStorage update karo
  useEffect(() => {
    try {
      localStorage.setItem("hvac_notifications", JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const handleMarkAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const handleDelete = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const handleClearAll = () => setNotifications([]);

  // ── Version Check — Splash ke baad run hoga ──
  // Pehle REAL Google Play in-app update try hota hai (Android + Play Store install).
  // Ye wahi popup hai jo tumne screenshot me dikhaya — bina Play Store khole
  // background me download + install, aur Cancel/back dabane pe app khud band ho jata hai.
  // Agar ye available nahi hai (iOS / web / sideload APK), to apna purana GitHub-based
  // custom update dialog fallback ke roop me chalega — jaisa pehle chal raha tha.
  useEffect(() => {
    if (showSplash) return; // splash band hone ke baad check karo

    const checkVersion = async () => {
      // ── Step 1: Native Google Play In-App Update (sirf Android pe kaam karta hai,
      // aur sirf tab jab app Play Store se install hua ho) ──
      if (Capacitor.getPlatform() === "android") {
        try {
          const info = await AppUpdate.getAppUpdateInfo();

          if (
            info.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE &&
            info.immediateUpdateAllowed
          ) {
            try {
              // Real Play Store "Update available" popup dikhega, background me
              // download hoga, Play Store app khulega hi nahi.
              await AppUpdate.performImmediateUpdate();
              // Update successfully start ho gaya — app khud restart karega jab
              // download poora ho jayega, isliye yaha kuch aur karne ki zaroorat nahi.
            } catch (err) {
              // User ne Cancel ya back button dabaya — Play Store wala hi
              // behaviour follow karte hue app ko band kar do.
              try { await CapacitorApp.exitApp(); } catch (e2) {}
            }
            return; // Native flow ho gaya, neeche wala GitHub fallback skip karo
          }
        } catch (e) {
          // Play Core available nahi (e.g. sideload APK, emulator, ya Play Store
          // account issue) — chup chaap neeche wale GitHub fallback pe chale jao
        }
      }

      // ── Step 2: Fallback — tumhara purana GitHub version.json based check
      // (iOS, web preview, ya jab native update available na ho) ──
      try {
        const res = await fetch(VERSION_URL, { cache: "no-store" });
        const data = await res.json();
        if (data.latest_version !== APP_VERSION) {
          setUpdateMessage(data.message || "Nayi update available hai. Play Store se update karo!");
          setForceUpdate(data.force_update || false);
          setShowUpdateDialog(true);
        }
      } catch (e) {
        // Network error — silently ignore, app chalti rahegi
      }
    };

    // 2 second baad check karo taaki app smoothly load ho sake
    const timer = setTimeout(checkVersion, 2000);
    return () => clearTimeout(timer);
  }, [showSplash]);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const navigate = (newPage: string) => {
    if (page !== newPage) {
      setHistory((prev) => [...prev, page]);
      setPage(newPage);
    }
  };

  const goBack = () => {
    // 1) Catalogue ke andar deep ho to pehle catalogue ka previous screen kholo
    if (page === "catalog" && catStack.length > 0) {
      const prev = catStack[catStack.length - 1];
      setCatStack((s) => s.slice(0, -1));
      setCatView(prev);
      return;
    }
    // 2) Warna app-level history pop karo
    setHistory((prev) => {
      const h = [...prev];
      const last = h.pop();
      if (last) setPage(last);
      return h;
    });
  };

  // Jab catalogue se bahar jao to uska back-stack reset — agla entry fresh ho
  useEffect(() => {
    if (page !== "catalog") {
      setCatView({ screen: "home" });
      setCatStack([]);
    }
  }, [page]);

  useEffect(() => {
    const setStatusBarStyle = async () => {
      try {
        const barColor = theme === 'dark' ? '#0B1F3A' : '#ffffff';
        const barStyle = theme === 'dark' ? Style.Dark : Style.Light;
        await StatusBar.setBackgroundColor({ color: barColor });
        await StatusBar.setStyle({ style: barStyle });
      } catch (e) {}
    };
    setStatusBarStyle();

    const handleResize = () => {
      const isVisible = window.innerHeight - (window.visualViewport?.height || 0) > 150;
      setIsKeyboardOpen(isVisible);
    };
    window.visualViewport?.addEventListener('resize', handleResize);

    let backHandler: any;
    const setupBackListener = async () => {
      backHandler = await CapacitorApp.addListener("backButton", () => {
        if (showUpdateDialog && forceUpdate) return; // force update pe back press disable
        // 1) Catalogue ke andar deep ho to pehle catalogue ka previous screen kholo
        if (page === "catalog" && catStack.length > 0) {
          const prev = catStack[catStack.length - 1];
          setCatStack((s) => s.slice(0, -1));
          setCatView(prev);
          return;
        }
        // 2) Warna app-level history pop karo
        if (history.length > 0) {
          setHistory((prev) => {
            const newHistory = [...prev];
            const lastPage = newHistory.pop();
            if (lastPage) setPage(lastPage);
            return newHistory;
          });
        } else {
          CapacitorApp.exitApp();
        }
      });
    };
    setupBackListener();

    return () => {
      if (backHandler) backHandler.remove();
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [history, page, theme, showUpdateDialog, forceUpdate, catStack, catView]);

  // ── Splash Screen ──
  // ★ CHANGE: theme prop pass kiya — splash screen ab app ke theme ko follow karega ★
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} theme={theme} />;
  }

  // ── Desktop-only derived values (sidebar header/title) ──
  const pageBg     = isDark ? "#0B1F3A" : "#F1F5F9";
  const sidebarBg  = isDark ? "#0F2444" : "#ffffff";
  const borderCol  = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const headerBg   = isDark ? "rgba(15,36,68,0.7)" : "rgba(255,255,255,0.75)";

  const activeToolSection =
    page.includes("tools") || TOOL_PAGES.includes(page) || ["privacy","about","disclaimer","contact"].includes(page);

  const pageTitle =
    page === "home" ? "Duct Sizer" :
    page === "tools" ? "Master Toolkit" :
    page === "catalog"
      ? catView.screen === "compare" ? "Side-by-Side Compare"
      : catView.screen === "browse" ? "All Catalogue"
      : "World Catalog" :
    page === "settings" ? "Settings" :
    activeToolSection ? "Master Toolkit" : "HVAC Toolkit Pro";

  // ── Shared page content — same for desktop & mobile layouts ──
  const pageContent = (
    <>
      {page === "home"     && <DuctSizer theme={theme} />}
      {page === "tools"    && <ToolsHub setPage={navigate} theme={theme} />}
      {page === "settings" && <Settings setPage={navigate} theme={theme} />}

      {page === "equipment-selector" && <EquipmentSelector theme={theme as "dark" | "light"} />}
      {page === "elec-load"          && <ElectricalLoadCalculator theme={theme} />}
      {page === "static-pressure"    && <StaticPressureCalculator theme={theme} />}
      {page === "pressurrization"    && <Pressurrization theme={theme} />}
      {page === "psychro-calc"       && <PsychrometricCalculator theme={theme} />}
      {page === "pipe-sizer"         && <PipeSizer theme={theme as "dark" | "light"} />}
      {page === "heat-load"          && <HeatLoad theme={theme} />}
      {page === "refrigeration-gas"  && <RefrigerationGas theme={theme} />}
      {page === "ventilation"        && <VentilationGuide theme={theme as "dark" | "light"} onToggleTheme={toggleTheme} />}
      {page === "humidity"           && <HumidityTool theme={theme as "dark" | "light"} />}
      {page === "scrubber-water"     && <ScrubberWaterUsageCalculator theme={theme} />}
      {page === "coming-soon"        && <ComingSoon theme={theme} />}
      {page === "daikin-vrv"         && <DaikinVRV theme={theme} />}
      {page === "catalog"            && <AllCatalogueApp theme={theme} view={catView} onNavigate={openCatView} onBack={goBack} />}

      {page === "privacy"    && <Privacy theme={theme} />}
      {page === "about"      && <About theme={theme} />}
      {page === "disclaimer" && <Disclaimer theme={theme} />}
      {page === "contact"    && <Contact theme={theme} />}

      <InstallPrompt />
    </>
  );

  // ── Modals shared across both layouts ──
  const sharedModals = (
    <>
      {showUpdateDialog && (
        <UpdateDialog
          message={updateMessage}
          forceUpdate={forceUpdate}
          theme={theme as "dark" | "light"}
          onClose={() => setShowUpdateDialog(false)}
        />
      )}

      {showShareModal && (
        <ShareRateModal
          theme={theme as "dark" | "light"}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showDesktopInfo && (
        <DesktopAvailableModal
          theme={theme as "dark" | "light"}
          onClose={() => setShowDesktopInfo(false)}
        />
      )}

      {/* Desktop notification panel rendered here (not inside the header) so the
          header's backdrop-filter doesn't trap it behind the content area below. */}
      {isDesktop && notifOpen && (
        <NotificationPanel
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
          onClose={() => setNotifOpen(false)}
          theme={theme as "dark" | "light"}
        />
      )}

      {!isDesktop && menuOpen && (
        <SideMenu
          theme={theme as "dark" | "light"}
          onClose={() => setMenuOpen(false)}
          onNavigate={navigate}
          onShare={() => setShowShareModal(true)}
          onDesktopInfo={() => setShowDesktopInfo(true)}
          version={APP_VERSION}
        />
      )}
    </>
  );

  // ═══════════════════════════════════════════════════════════════════════
  //  DESKTOP LAYOUT — persistent left sidebar (bade screen, >= 880px)
  // ═══════════════════════════════════════════════════════════════════════
  if (isDesktop) {
    return (
      <div
        className="transition-colors duration-300"
        style={{
          height: "100vh", width: "100%",
          display: "flex", flexDirection: "row",
          backgroundColor: pageBg,
          fontFamily: "'Inter', sans-serif",
          overflow: "hidden",
        }}
      >
        {sharedModals}

        {/* ═══ LEFT SIDEBAR ═══ */}
        <div style={{
          width: "240px", flexShrink: 0, height: "100%",
          background: sidebarBg,
          borderRight: `1px solid ${borderCol}`,
          display: "flex", flexDirection: "column",
        }}>
          {/* Logo / Brand */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "22px 20px", borderBottom: `1px solid ${borderCol}`,
          }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "12px",
              background: "linear-gradient(135deg, #2DD4BF, #2563b0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 16px rgba(45,212,191,0.3)", flexShrink: 0,
            }}>
              <Wrench size={19} color="white" />
            </div>
            <div>
              <div style={{ fontSize: "14.5px", fontWeight: 800, color: isDark ? "white" : "#1e293b", lineHeight: 1.2 }}>HVAC Hub - Tools & Community</div>
              <div style={{ fontSize: "10.5px", color: isDark ? "#64748b" : "#94a3b8", fontWeight: 600 }}>Pro · v{APP_VERSION}</div>
            </div>
          </div>

          {/* Nav Items */}
          <div style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
            {SIDEBAR_ITEMS.map((item) => {
              const active = item.id === "home" ? page === "home"
                : item.id === "tools" ? activeToolSection
                : page === "catalog";
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    // Catalog tab dobara tap karo to catalogue home pe reset
                    if (item.id === "catalog" && page === "catalog" && catStack.length > 0) {
                      setCatView({ screen: "home" });
                      setCatStack([]);
                    } else {
                      navigate(item.id);
                    }
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "11px 14px", borderRadius: "12px", cursor: "pointer",
                    background: active
                      ? (isDark ? "rgba(45,212,191,0.12)" : "#e0f2fe")
                      : "transparent",
                    color: active
                      ? "#2DD4BF"
                      : (isDark ? "#94a3b8" : "#64748b"),
                    fontWeight: active ? 700 : 600,
                    fontSize: "13.5px",
                    transition: "background 0.2s, color 0.2s",
                    border: active ? "1px solid rgba(45,212,191,0.25)" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {active && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
                </div>
              );
            })}

            {/* Simulator - locked/future item */}
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "11px 14px", borderRadius: "12px",
              color: "#F59E0B", fontWeight: 600, fontSize: "13.5px",
              opacity: 0.65, marginTop: "4px", position: "relative",
            }}>
              <PlayCircle size={19} />
              <span>Simulator</span>
              <span style={{
                marginLeft: "auto", background: "#F59E0B", color: "white",
                fontSize: "8.5px", padding: "2px 6px", borderRadius: "5px", fontWeight: 800,
              }}>SOON</span>
            </div>

            {/* ── Get Mobile App — Play Store promo button ── */}
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 14px", borderRadius: "12px", marginTop: "10px",
                background: "linear-gradient(135deg, rgba(45,212,191,0.14), rgba(37,99,176,0.14))",
                border: "1px solid rgba(45,212,191,0.3)",
                textDecoration: "none", cursor: "pointer",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 18px rgba(45,212,191,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: "32px", height: "32px", borderRadius: "9px", flexShrink: 0,
                background: "linear-gradient(135deg, #2DD4BF, #2563b0)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Smartphone size={16} color="white" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "12.5px", fontWeight: 800, color: isDark ? "white" : "#1e293b", lineHeight: 1.2 }}>
                  Get the Mobile App
                </div>
                <div style={{ fontSize: "10px", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
                  <Download size={10} /> Available on Play Store
                </div>
              </div>
            </a>
          </div>

          {/* Sidebar footer - quick links */}
          <div style={{ padding: "14px 12px", borderTop: `1px solid ${borderCol}`, display: "flex", flexDirection: "column", gap: "2px" }}>
            <FooterLink label="About" onClick={() => navigate("about")} active={page === "about"} isDark={isDark} />
            <FooterLink label="Privacy Policy" onClick={() => navigate("privacy")} active={page === "privacy"} isDark={isDark} />
            <FooterLink label="Disclaimer" onClick={() => navigate("disclaimer")} active={page === "disclaimer"} isDark={isDark} />
            <FooterLink label="Contact Us" onClick={() => navigate("contact")} active={page === "contact"} isDark={isDark} />
          </div>
        </div>

        {/* ═══ RIGHT SIDE: HEADER + CONTENT ═══ */}
        <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* ── TOP HEADER BAR ── */}
          <div style={{
            height: "64px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 28px",
            background: headerBg,
            backdropFilter: "blur(10px)",
            borderBottom: `1px solid ${borderCol}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {(history.length > 0 || (page === "catalog" && catStack.length > 0)) && (
                <button
                  onClick={goBack}
                  style={{
                    width: "32px", height: "32px", borderRadius: "9px",
                    background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                    border: `1px solid ${borderCol}`, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isDark ? "#94a3b8" : "#64748b", transform: "rotate(180deg)",
                  }}
                  title="Back"
                >
                  <ChevronRight size={16} />
                </button>
              )}
              <h1 style={{
                fontSize: "17px", fontWeight: 800,
                color: isDark ? "white" : "#1e293b", margin: 0,
              }}>{pageTitle}</h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Share Button */}
              <button
                onClick={async () => {
                  setShowShareModal(true);
                  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
                }}
                style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                  cursor: "pointer", transition: "all 0.25s ease",
                  color: isDark ? "#94a3b8" : "#64748b",
                }}
                title="Share & Rate"
              >
                <Share2 size={17} />
              </button>

              {/* Bell Button */}
              <div ref={notifRef} style={{ position: "relative" }}>
                <button
                  onClick={async () => {
                    setNotifOpen(o => !o);
                    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
                  }}
                  style={{
                    width: "38px", height: "38px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: notifOpen
                      ? (isDark ? "rgba(45,212,191,0.15)" : "#e0f2fe")
                      : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                    border: notifOpen
                      ? (isDark ? "1px solid rgba(45,212,191,0.35)" : "1px solid #7dd3fc")
                      : (isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0"),
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    color: notifOpen ? "#2DD4BF" : (isDark ? "#94a3b8" : "#64748b"),
                    boxShadow: unreadCount > 0 ? `0 0 0 2px ${pageBg}, 0 0 0 4px rgba(45,212,191,0.25)` : "none",
                    position: "relative",
                  }}
                  title="Notifications"
                >
                  {unreadCount > 0
                    ? <BellRing size={18} style={{ animation: "bellWiggle 2.5s ease-in-out infinite" }} />
                    : <Bell size={18} />
                  }
                  {unreadCount > 0 && (
                    <span style={{
                      position: "absolute", top: "1px", right: "1px",
                      minWidth: "16px", height: "16px", borderRadius: "8px",
                      background: "#ef4444", color: "#fff",
                      fontSize: "9px", fontWeight: 900, lineHeight: "16px",
                      textAlign: "center", padding: "0 3px",
                      border: `2px solid ${pageBg}`,
                    }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Theme Toggle Pill */}
              <button
                onClick={toggleTheme}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "56px", height: "28px", borderRadius: "14px", padding: "0 4px",
                  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  background: isDark ? "rgba(45, 212, 191, 0.15)" : "#E2E8F0",
                  border: isDark ? "1px solid rgba(45, 212, 191, 0.3)" : "1px solid #CBD5E1",
                  cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? (
                  <>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    <Moon size={14} className="text-slate-600" style={{ marginRight: "4px" }} />
                  </>
                ) : (
                  <>
                    <Sun size={14} className="text-[#2DD4BF]" style={{ marginLeft: "4px" }} />
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#2DD4BF", boxShadow: "0 1px 5px rgba(45,212,191,0.5)" }} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bell wiggle keyframe */}
          <style>{`
            @keyframes bellWiggle {
              0%,100% { transform: rotate(0deg); }
              10%      { transform: rotate(-12deg); }
              20%      { transform: rotate(12deg); }
              30%      { transform: rotate(-8deg); }
              40%      { transform: rotate(8deg); }
              50%      { transform: rotate(0deg); }
            }
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}; border-radius: 6px; }
          `}</style>

          {/* ── CONTENT AREA ── */}
          <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "8px 0 40px" }}>
              {pageContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  MOBILE LAYOUT — hamburger + bottom-nav (chhote screen, < 880px)
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div
      className="transition-colors duration-300"
      style={{
        height: "100vh", display: "flex", flexDirection: "column",
        backgroundColor: theme === 'dark' ? "#0B1F3A" : "#F8FAFC",
        fontFamily: "'Inter', sans-serif", overflow: "hidden", position: "relative",
      }}
    >
      {sharedModals}

      {/* ── TOP-LEFT CONTROL: Hamburger Menu — sirf home screen pe ── */}
      {page === "home" && (
        <div style={{ position: "absolute", top: "18px", left: "16px", zIndex: 1000 }}>
          <button
            onClick={async () => {
              setMenuOpen(true);
              try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
            }}
            style={{
              width: "38px", height: "38px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              border: theme === 'dark' ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
              cursor: "pointer", transition: "all 0.25s ease",
              color: theme === 'dark' ? "#94a3b8" : "#64748b",
            }}
            title="Menu"
          >
            <Menu size={18} />
          </button>
        </div>
      )}

      {/* ── TOP-RIGHT CONTROLS: Bell + Theme Toggle ── */}
      <div style={{ position: "absolute", top: "18px", right: "16px", zIndex: 1000, display: "flex", alignItems: "center", gap: "10px" }}>

        {/* Bell Button — sirf home page pe dikhao */}
        {page === "home" && <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={async () => {
              setNotifOpen(o => !o);
              try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
            }}
            style={{
              width: "38px", height: "38px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: notifOpen
                ? (theme === 'dark' ? "rgba(45,212,191,0.15)" : "#e0f2fe")
                : (theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"),
              border: notifOpen
                ? (theme === 'dark' ? "1px solid rgba(45,212,191,0.35)" : "1px solid #7dd3fc")
                : (theme === 'dark' ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0"),
              cursor: "pointer",
              transition: "all 0.25s ease",
              color: notifOpen ? "#2DD4BF" : (theme === 'dark' ? "#94a3b8" : "#64748b"),
              boxShadow: unreadCount > 0 ? `0 0 0 2px ${theme === 'dark' ? '#0B1F3A' : '#F8FAFC'}, 0 0 0 4px rgba(45,212,191,0.25)` : "none",
              position: "relative",
            }}
            title="Notifications"
          >
            {unreadCount > 0
              ? <BellRing size={18} style={{ animation: "bellWiggle 2.5s ease-in-out infinite" }} />
              : <Bell size={18} />
            }
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: "1px", right: "1px",
                minWidth: "16px", height: "16px", borderRadius: "8px",
                background: "#ef4444", color: "#fff",
                fontSize: "9px", fontWeight: 900, lineHeight: "16px",
                textAlign: "center", padding: "0 3px",
                border: `2px solid ${theme === 'dark' ? '#0B1F3A' : '#F8FAFC'}`,
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationPanel
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDelete}
              onClearAll={handleClearAll}
              onClose={() => setNotifOpen(false)}
              theme={theme as "dark" | "light"}
            />
          )}
        </div>}

        {/* Theme Toggle Pill */}
        <button
          onClick={toggleTheme}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "56px", height: "28px", borderRadius: "14px", padding: "0 4px",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            background: theme === 'dark' ? "rgba(45, 212, 191, 0.15)" : "#E2E8F0",
            border: theme === 'dark' ? "1px solid rgba(45, 212, 191, 0.3)" : "1px solid #CBD5E1",
            cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              <Moon size={14} className="text-slate-600" style={{ marginRight: "4px" }} />
            </>
          ) : (
            <>
              <Sun size={14} className="text-[#2DD4BF]" style={{ marginLeft: "4px" }} />
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#2DD4BF", boxShadow: "0 1px 5px rgba(45,212,191,0.5)" }} />
            </>
          )}
        </button>
      </div>

      {/* Bell wiggle keyframe */}
      <style>{`
        @keyframes bellWiggle {
          0%,100% { transform: rotate(0deg); }
          10%      { transform: rotate(-12deg); }
          20%      { transform: rotate(12deg); }
          30%      { transform: rotate(-8deg); }
          40%      { transform: rotate(8deg); }
          50%      { transform: rotate(0deg); }
        }
      `}</style>

      {/* ── CONTENT AREA ── */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative", paddingBottom: isKeyboardOpen ? "0px" : "90px" }}>
        {pageContent}
      </div>

      {/* ── BOTTOM NAV ── */}
      {!isKeyboardOpen && (
        <div style={{
          position: "fixed", bottom: 0, width: "100%", height: "75px",
          background: theme === 'dark' ? "#132F57" : "white",
          display: "flex", justifyContent: "space-around", alignItems: "center",
          boxShadow: "0 -5px 20px rgba(0,0,0,0.2)",
          borderTopLeftRadius: "25px", borderTopRightRadius: "25px", zIndex: 1000,
        }}>
          <NavItem active={page === "home"} label="Home" icon={<Home size={26} />} onClick={() => navigate("home")} />
          <NavItem
            active={page.includes("tools") || ["equipment-selector","elec-load","static-pressure","room-tonnage","psychro-calc","pipe-sizer","drain-slope","ventilation","heat-load","refrigeration-gas","daikin-vrv"].includes(page)}
            label="Tools" icon={<LayoutGrid size={26} />} onClick={() => navigate("tools")}
          />
          <NavItem
            active={page === "catalog"}
            label="Catalog" icon={<Globe size={24} />} onClick={() => {
              if (page === "catalog" && catStack.length > 0) {
                setCatView({ screen: "home" });
                setCatStack([]);
              } else {
                navigate("catalog");
              }
            }}
          />
          <NavItem isFuture label="Sim" icon={<PlayCircle size={24} />} onClick={() => {}} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR FOOTER LINK (desktop layout)
// ─────────────────────────────────────────────────────────────────────────────
function FooterLink({ label, onClick, active, isDark }: { label: string; onClick: () => void; active: boolean; isDark: boolean }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "8px 14px", borderRadius: "9px", cursor: "pointer",
        fontSize: "12px", fontWeight: 600,
        color: active ? "#2DD4BF" : (isDark ? "#64748b" : "#94a3b8"),
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = isDark ? "#94a3b8" : "#64748b"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = isDark ? "#64748b" : "#94a3b8"; }}
    >
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  TOOLS HUB
// ─────────────────────────────────────────────────────────────────────────────
function ToolsHub({ setPage, theme }: any) {
  const tools = [
    { id: "equipment-selector", name: "Machine Database",      desc: "Weights, KW & Load Amps",        icon: <Database size={24} />,    color: "#3B82F6" },
    { id: "elec-load",          name: "Elec Load",             desc: "Machine kW & Amp calc",          icon: <Zap size={24} />,         color: "#F59E0B" },
    { id: "static-pressure",    name: "ESP Calc",              desc: "External Static Pressure",       icon: <Gauge size={24} />,       color: "#10B981" },
    { id: "pressurrization",    name: "Pressurrization Calc",  desc: "Staircase & Lift pressurization",icon: <Wind size={24} />,        color: "#EF4444" },
    { id: "psychro-calc",       name: "Psychro Pro",           desc: "Air properties & Chart",         icon: <Thermometer size={24} />, color: "#06B6D4" },
    { id: "pipe-sizer",         name: "PipeSizer Pro",         desc: "McQuay & L&T sizing",            icon: <Waves size={24} />,       color: "#8B5CF6" },
    { id: "heat-load",          name: "Heat Load",             desc: "Room cooling & heating load",    icon: <Flame size={24} />,       color: "#F59E0B" },
    { id: "refrigeration-gas",  name: "Refrigeration Gas Calc",     desc: "Calculate refrigerant gas properties",    icon: <Cylinder size={24} />,    color: "#00BCD4" },
    { id: "ventilation",        name: "Ventilation",           desc: "16 Types + ASHRAE Calculators",  icon: <Wind size={24} />,        color: "#06B6D4" },
    { id: "humidity",           name: "Humidity Sizer",        desc: "Humidifier & Dehumidifier sizing", icon: <Droplets size={24} />,  color: "#0EA5E9" },
    { id: "scrubber-water",     name: "Scrubber Water Calc",   desc: "Wet & dry scrubber water usage", icon: <Pipette size={24} />,    color: "#0891B2" },
    { id: "coming-soon",        name: "Coming Soon",           desc: "Something New Is Coming",        icon: <Sparkles size={24} />,    color: "#8B5CF6" },
    { id: "daikin-vrv",        name: "Daikin VRV Coming Soon", desc: "Daikin VRV Pipe Sizing",         icon: <Network size={24} />,     color: "#06B6D4" },
  ];

  return (
    <div style={{ padding: "25px 20px", color: theme === 'dark' ? "white" : "#1E293B" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "5px" }}>Master Toolkit</h2>
      <p style={{ color: theme === 'dark' ? "#94a3b8" : "#64748B", fontSize: "14px", marginBottom: "25px" }}>Professional HVAC engineering tools</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px" }}>
        {tools.map((tool) => (
          <div key={tool.id} onClick={() => setPage(tool.id)} style={{
            background: theme === 'dark' ? "rgba(255,255,255,0.04)" : "white",
            border: theme === 'dark' ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0",
            borderRadius: "20px", padding: "15px", position: "relative",
            overflow: "hidden", cursor: "pointer",
            boxShadow: theme === 'dark' ? "none" : "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}>
            <div style={{ position: "absolute", top: "-20px", left: "-20px", width: "80px", height: "80px", background: `${tool.color}15`, borderRadius: "50%", filter: "blur(20px)" }} />
            <div style={{ color: tool.color, backgroundColor: `${tool.color}20`, width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              {tool.icon}
            </div>
            <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>{tool.name}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>{tool.desc}</div>
            <ChevronRight size={14} style={{ position: "absolute", bottom: "15px", right: "15px", color: "#475569" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  NAV ITEM
// ─────────────────────────────────────────────────────────────────────────────
function NavItem({ active, label, icon, onClick, isFuture, soonBadge }: any) {
  // isFuture  = fully locked, tap does nothing (e.g. Sim)
  // soonBadge = shows the same "SOON" look, but is still tappable (e.g. Catalog -> opens its coming-soon page)
  const showSoonLook = isFuture || soonBadge;
  const isActive = active;

  const handleItemClick = async () => {
    if (isFuture) return;
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
    onClick();
  };
  return (
    <div onClick={handleItemClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: isFuture ? "default" : "pointer", width: "80px", position: "relative", opacity: showSoonLook && !isActive ? 0.6 : 1 }}>
      <div style={{
        width: "55px", height: "55px", borderRadius: "50%",
        backgroundColor: isActive ? "#2196F3" : "transparent",
        color: isActive ? "white" : (showSoonLook ? "#F59E0B" : "#94A3B8"),
        display: "flex", justifyContent: "center", alignItems: "center",
        transform: isActive ? "translateY(-30px)" : "translateY(0)",
        boxShadow: isActive ? "0 10px 20px rgba(33,150,243,0.3)" : "none",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", zIndex: 2,
        position: "relative",
      }}>
        {icon}
        {isFuture && <Lock size={10} style={{ position: "absolute", top: "4px", right: "4px" }} />}
      </div>
      <span style={{
        fontSize: "11px", color: isActive ? "#2196F3" : (showSoonLook ? "#F59E0B" : "#94A3B8"),
        fontWeight: isActive ? "700" : "500",
        marginTop: isActive ? "-15px" : "4px",
        transition: "all 0.3s ease",
      }}>{label}</span>
      {showSoonLook && (
        <span style={{ position: "absolute", top: "-10px", background: "#F59E0B", color: "white", fontSize: "7px", padding: "1px 4px", borderRadius: "4px", fontWeight: "bold" }}>SOON</span>
      )}
    </div>
  );
}

export default App;