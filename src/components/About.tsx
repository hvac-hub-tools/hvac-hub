import React from 'react';

// Prop type definition for TypeScript
interface AboutProps {
  theme: string;
}

const About = ({ theme }: AboutProps) => {
  const isDark = theme === 'dark';

  // --- DYNAMIC STYLES ---
  const containerStyle: React.CSSProperties = {
    padding: "20px", 
    // Dark mode mein navy blue, Light mode mein halka grey
    backgroundColor: isDark ? "#0B1F3A" : "#F8FAFC", 
    minHeight: "100vh",
    color: isDark ? "#FFFFFF" : "#1E293B",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    transition: "all 0.3s ease"
  };

  const cardStyle: React.CSSProperties = {
    // Dark mode mein transparent white effect, Light mode mein pure white
    backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#FFFFFF", 
    borderRadius: "20px",
    padding: "25px",
    border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
    boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.2)" : "0 10px 20px rgba(0,0,0,0.05)",
    lineHeight: "1.8",
    transition: "all 0.3s ease"
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "17px", 
    // Dark mode mein light grey, Light mode mein slate grey
    color: isDark ? "#CBD5E0" : "#475569", 
    marginBottom: "20px" 
  };

  const missionTextStyle: React.CSSProperties = { 
    fontSize: "16px", 
    color: isDark ? "#A0AEC0" : "#64748B" 
  };

  const infoBoxStyle: React.CSSProperties = { 
    marginTop: '30px', 
    padding: '15px', 
    backgroundColor: isDark ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)', 
    borderRadius: '12px',
    borderLeft: '5px solid #2196F3'
  };

  return (
    <div style={containerStyle}>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        marginTop: '10px' 
      }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#2196F3', 
          letterSpacing: '1px'
        }}>
          About Us
        </h2>
        <div style={{ 
          height: '4px', 
          width: '50px', 
          backgroundColor: '#2196F3', 
          margin: '10px auto', 
          borderRadius: '2px' 
        }}></div>
      </div>

      {/* Main Content Card */}
      <div style={cardStyle}>
        <p style={descriptionStyle}>
          HVAC Hub is a professional engineering calculation app designed specifically for HVAC engineers and designers.
        </p>

        <h3 style={{ color: isDark ? "#4FC3F7" : "#0288D1", fontSize: "20px", marginBottom: "15px", fontWeight: "600" }}>Our Mission</h3>
        
        <p style={missionTextStyle}>
          Tools include duct sizing, pressure calculations, airflow calculations and more. We aim to simplify complex on-site calculations with high accuracy.
        </p>

        {/* Info Box */}
        <div style={infoBoxStyle}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            fontStyle: 'italic', 
            color: isDark ? '#E2E8F0' : '#475569' 
          }}>
            "Providing precision at your fingertips since 2026."
          </p>
        </div>
      </div>

      {/* Footer Space (Bottom Nav ke liye padding) */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default About;