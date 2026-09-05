import React from "react";

// Humne theme prop yahan accept kiya hai taaki error na aaye
function Settings({ setPage, theme }: any) {
  
  // ✅ FIX: isDark variable define kiya gaya hai
  const isDark = theme === 'dark';

  // Dynamic Styles jo toggle par change honge
  const containerStyle: React.CSSProperties = {
    padding: "20px",
    background: isDark ? "#0B1F3A" : "#F8FAFC", // Dark blue vs Light grey
    minHeight: "100vh",
    color: isDark ? "white" : "#1E293B", // White text vs Dark slate
    transition: "all 0.3s ease"
  };

  const titleStyle: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "26px",
    fontWeight: "bold",
    color: isDark ? "white" : "#0F172A"
  };

  // Cards ke liye dynamic style function
  const getCardStyle = (): React.CSSProperties => ({
    background: isDark ? "#132F57" : "#FFFFFF", // Dark card vs White card
    padding: "18px",
    borderRadius: "15px",
    marginBottom: "15px",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: isDark 
      ? "0px 4px 10px rgba(0,0,0,0.3)" 
      : "0px 2px 8px rgba(0,0,0,0.05)",
    border: isDark ? "1px solid #1E3A5F" : "1px solid #E2E8F0",
    color: isDark ? "#E2E8F0" : "#334155",
    transition: "all 0.2s ease"
  });

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Settings</h2>

      <div style={getCardStyle()} onClick={() => setPage("privacy")}>
        <span>🔒</span> Privacy Policy
      </div>

      <div style={getCardStyle()} onClick={() => setPage("about")}>
        <span>ℹ️</span> About Us
      </div>

      <div style={getCardStyle()} onClick={() => setPage("disclaimer")}>
        <span>⚠️</span> Disclaimer
      </div>

      <div style={getCardStyle()} onClick={() => setPage("contact")}>
        <span>📧</span> Contact Us
      </div>
    </div>
  );
}

export default Settings;