import React, { useState } from 'react';
import { LayoutGrid, Wind, Droplets, Ruler, ChevronRight } from "lucide-react";
// Agar Framer Motion installed hai, toh animation add kar sakte hain.
// Niche ka code bina external animation library ke hai.

import DuctVisualizer from "./DuctVisualizer"; // Aapka layout planner

// Tool Card data with unique glow colors
const toolsList = [
  { id: "visualizer", name: "Duct Planner", icon: <LayoutGrid size={28} />, desc: "Visual Layout & Routing", color: "#3B82F6" }, // Blue
  { id: "esp", name: "ESP Calc", icon: <Wind size={28} />, desc: "External Static Pressure", color: "#10B981" }, // Green
  { id: "drain", name: "Drain Sizer", icon: <Droplets size={28} />, desc: "Condensate Pipe Sizing", color: "#F59E0B" }, // Amber
  { id: "converter", name: "Unit Converter", icon: <Ruler size={28} />, desc: "CFM, TR, KW Conversion", color: "#8B5CF6" }, // Purple
];

export default function PremiumToolsHub() {
  const [activeTool, setActiveTool] = useState("menu");

  // Logic to show selected tool
  if (activeTool === "visualizer") {
    return (
      <div style={{ backgroundColor: '#0B1F3A', minHeight: '100vh' }}>
        <button onClick={() => setActiveTool("menu")} style={backBtnStyle}>← Tools Menu</button>
        <DuctVisualizer />
      </div>
    );
  }

  // Isi tarah baki tools ke liye if-conditions lagayein (esp, drain, converter)

  return (
    <div style={{ 
      padding: '25px 20px', 
      backgroundColor: '#0B1F3A', 
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'white', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', margin: '0 0 8px 0' }}>
          Master Toolkit
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
          Select a specialized engineering tool to begin.
        </p>
      </div>
      
      {/* 2x2 Grid with Premium Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '18px' 
      }}>
        {toolsList.map((tool) => (
          <PremiumToolCard 
            key={tool.id}
            tool={tool}
            onClick={() => setActiveTool(tool.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Premium Card Component with Glow and Glass effect
function PremiumToolCard({ tool, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      style={{
        ...cardBaseStyle,
        position: 'relative',
        overflow: 'hidden' // Neon glow boundary
      }}
    >
      {/* Background Neon Glow (Soft Inner Glow) */}
      <div style={{
        position: 'absolute',
        top: '-50%', left: '-50%',
        width: '200%', height: '200%',
        background: `radial-gradient(circle at center, ${tool.color}15 0%, transparent 50%)`,
        zIndex: 0
      }} />

      {/* Card Content (Glass Layer) */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Top Section: Icon & Chevron */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ 
            color: tool.color, 
            backgroundColor: `${tool.color}20`, 
            padding: '10px', 
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {tool.icon}
          </div>
          <ChevronRight size={18} color="#475569" style={{ opacity: 0.6 }} />
        </div>

        {/* Bottom Section: Text */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px', marginBottom: '4px' }}>
            {tool.name}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', lineHeight: '1.4', fontWeight: 400 }}>
            {tool.desc}
          </div>
        </div>
      </div>
    </div>
  );
}

// Global Styles for Premium feel
const cardBaseStyle: any = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)', // Subtle glass
  border: '1px solid rgba(255, 255, 255, 0.08)', // Sharp border
  borderRadius: '20px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
  // Hover effect styles (In React, you'd use state or a CSS file for real hover)
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    transform: 'translateY(-3px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
  }
};

const backBtnStyle: any = {
  backgroundColor: 'transparent',
  color: '#2196F3',
  border: 'none',
  padding: '20px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '5px'
};