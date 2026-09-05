import React from 'react';

// Props ka type define kiya hai (TypeScript ke liye)
interface PrivacyProps {
  theme: string;
}

const Privacy = ({ theme }: PrivacyProps) => {
  const isDark = theme === 'dark';

  // --- DYNAMIC STYLES ---
  const pageStyle: React.CSSProperties = {
    padding: "20px",
    // Dark mode mein navy blue, Light mode mein halka grey/white
    background: isDark ? "#0B1F3A" : "#F8FAFC", 
    minHeight: "100vh",
    // Dark mode mein white, Light mode mein dark grey text
    color: isDark ? "white" : "#1E293B",
    fontFamily: "'Segoe UI', sans-serif",
    transition: "all 0.3s ease" // Smooth color change ke liye
  };

  const titleStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "28px",
    color: "#2196F3", // Primary Blue color same rahega
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
    // Dark mode mein thoda light navy, Light mode mein pure white
    background: isDark ? "#132F57" : "#FFFFFF",
    padding: "20px",
    borderRadius: "20px",
    // Light mode mein shadow thodi halki rakhi hai
    boxShadow: isDark ? "0px 10px 30px rgba(0,0,0,0.3)" : "0px 10px 20px rgba(0,0,0,0.05)",
    lineHeight: "1.7",
    color: isDark ? "#CBD5E0" : "#475569",
    borderLeft: "4px solid #2196F3",
    transition: "all 0.3s ease"
  };

  const sectionTitle: React.CSSProperties = {
    color: isDark ? "#4FC3F7" : "#0288D1", // Light mode mein thoda dark blue for readability
    marginTop: "15px",
    fontWeight: "600"
  };

  return (
    <div style={pageStyle}>
      
      <h2 style={titleStyle}>
        Privacy Policy
      </h2>

      <div style={highlightBar}></div>

      <div style={cardStyle}>

        <p><strong>Last updated:</strong> 20 March 2026</p>

        <p>
          This Privacy Policy describes how HVAC Hub - Tools & Community 
          ("we", "our", or "us") handles user information.
        </p>

        <h3 style={sectionTitle}>1. Information We Collect</h3>
        <p>We do NOT collect any personal data from users.</p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>No account creation is required</li>
          <li>No personal information (name, phone number, location) is collected</li>
          <li>All calculations are performed offline on your device</li>
        </ul>

        <h3 style={sectionTitle}>2. Contact Information</h3>
        <p>If you choose to contact us through the app (Contact Form), you may provide:</p>
        <ul style={{ paddingLeft: "20px" }}>
          <li>Your Name</li>
          <li>Your Email Address</li>
          <li>Your Message</li>
        </ul>
        <p>
          This information is used only to respond to your queries and is not stored 
          or shared with any third party.
        </p>

        <h3 style={sectionTitle}>3. Internet Usage</h3>
        <p>This app does NOT require an active internet connection for its core functionality.</p>

        <h3 style={sectionTitle}>4. Data Sharing</h3>
        <p>We do NOT sell, trade, or share any user data with third parties.</p>

        <h3 style={sectionTitle}>5. Data Security</h3>
        <p>Since no personal data is collected or stored, your privacy is fully safe.</p>

        <h3 style={sectionTitle}>6. Children's Privacy</h3>
        <p>
          This app is safe for all users and does not knowingly collect any data 
          from children under the age of 13.
        </p>

        <h3 style={sectionTitle}>7. Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy in the future. Any changes will be 
          updated on this page.
        </p>

        <h3 style={sectionTitle}>8. Contact Us</h3>
        <p>If you have any questions, you can contact us </p>
        

        <p style={{ marginTop: "20px", fontWeight: "bold", color: isDark ? "white" : "#0F172A" }}>
          Developer: Rehan Shaikh
        </p>

      </div>
    </div>
  );
};

export default Privacy;