import React, { useState } from 'react';
import { Zap } from 'lucide-react';

import DXSection from './DXSection';
import VRVSystem from './VRVSystem';
import CHWSection from './CHWSection';

// ✅ Theme prop ko yahan define kiya gaya hai
export default function ElectricalLoadCalculator({ theme }: { theme: string }) {
  const [activeTab, setActiveTab] = useState('DX');

  // Dark mode colors decide karna
  const isDark = theme === 'dark';

  return (
    <div style={{ 
      padding: '16px', 
      color: isDark ? 'white' : '#1E293B', 
      backgroundColor: isDark ? '#0B1F3A' : '#F8FAFC', 
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap color="#F59E0B" fill="#F59E0B" size={24} /> HVAC Electrical Load
        </h2>
      </div>

      {/* Tabs Layout */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white', 
        borderRadius: '12px', 
        padding: '4px', 
        marginBottom: '20px',
        boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <button 
          onClick={() => setActiveTab('DX')}
          style={tabStyle(activeTab === 'DX', '#3B82F6', isDark)}
        >DX Units</button>
        
        <button 
          onClick={() => setActiveTab('VRV')}
          style={tabStyle(activeTab === 'VRV', '#F97316', isDark)}
        >VRV System</button>
        
        <button 
          onClick={() => setActiveTab('CHW')}
          style={tabStyle(activeTab === 'CHW', '#06B6D4', isDark)}
        >CHW System</button>
      </div>

      {/* Rendering Sections - Theme pass karna zaroori hai */}
      <div> 
        {activeTab === "DX" && <DXSection theme={theme} />}
        {activeTab === 'VRV' && <VRVSystem theme={theme} />}
        {activeTab === 'CHW' && <CHWSection theme={theme} />}
      </div>
    </div>
  );
}

// Tab style ko update kiya gaya hai taaki light/dark mode support kare
const tabStyle = (active: boolean, color: string, isDark: boolean) => ({
  flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
  backgroundColor: active ? color : 'transparent',
  color: active ? 'white' : (isDark ? '#94A3B8' : '#64748b'),
  fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', transition: '0.3s'
});