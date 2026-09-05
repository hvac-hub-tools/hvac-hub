import React from 'react';

// TypeScript interface for props
interface DisclaimerProps {
  theme: string;
}

const Disclaimer = ({ theme }: DisclaimerProps) => {
  const isDark = theme === 'dark';

  // --- DYNAMIC STYLES ---
  const pageStyle: React.CSSProperties = {
    padding: "20px",
    // Dark mode mein navy blue, Light mode mein soft white/grey
    background: isDark ? "#0B1F3A" : "#F8FAFC",
    minHeight: "100vh",
    color: isDark ? "white" : "#1E293B",
    fontFamily: "'Segoe UI', sans-serif",
    transition: "all 0.3s ease"
  };

  const titleStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "28px",
    color: "#2196F3",
    fontWeight: "bold"
  };

  const highlightBar: React.CSSProperties = {
    width: "50px",
    height: "4px",
    background: "#2196F3",
    margin: "10px auto 20px auto",
    borderRadius: "10px"
  };

  const cardStyle: React.CSSProperties = {
    // Dark mode mein light navy, Light mode mein pure white
    background: isDark ? "#132F57" : "#FFFFFF",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: isDark ? "0px 10px 30px rgba(0,0,0,0.3)" : "0px 10px 20px rgba(0,0,0,0.05)",
    lineHeight: "1.7",
    color: isDark ? "#CBD5E0" : "#475569",
    borderLeft: "4px solid #2196F3",
    transition: "all 0.3s ease"
  };

  const quoteBox: React.CSSProperties = {
    marginTop: "20px",
    padding: "15px",
    // Dark mode mein deep blue, Light mode mein very light blue tint
    background: isDark ? "#1E3A5F" : "#F0F9FF",
    borderRadius: "12px",
    fontStyle: "italic",
    borderLeft: "4px solid #2196F3",
    color: isDark ? "#E2E8F0" : "#0369A1",
    transition: "all 0.3s ease"
  };

  return (
    <div style={pageStyle}>
      
      <h2 style={titleStyle}>
        Disclaimer
      </h2>

      <div style={highlightBar}></div>

      <div style={cardStyle}>
        
        <p style={{ 
          color: isDark ? "#FFD700" : "#B45309", // Light mode mein thoda dark gold/amber
          fontWeight: "bold" 
        }}>
          ⚠️ Engineering Disclaimer
        </p>

        <p>
          The calculations provided by the HVAC Hub are for reference only.
          It is not the final authority for real-world design.
        </p>

        <h3 style={{ 
          color: isDark ? "#4FC3F7" : "#0288D1", 
          marginTop: "15px",
          fontWeight: "600"
        }}>
          Important
        </h3>

        <p>
          Be sure to verify with a Certified HVAC Engineer or Professional Engineer (PE) before final implementation.
        </p>

        <div style={quoteBox}>
          "Use this tool for assistance, not as a final authority."
        </div>
      </div>

      {/* Footer Space for Navigation Bar */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default Disclaimer;