import React, { useState } from 'react';

// Theme interface taaki toggle state handle ho sake
interface ReferenceGuideProps {
  isDark: boolean;
}

const ReferenceGuide: React.FC<ReferenceGuideProps> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);

  const velocityData = [
    { application: 'Residential (Supply)', velocity: '600-900', frictionLoss: '0.05-0.08' },
    { application: 'Residential (Return)', velocity: '500-700', frictionLoss: '0.03-0.05' },
    { application: 'Commercial (Main Duct)', velocity: '1200-1800', frictionLoss: '0.08-0.15' },
    { application: 'Commercial (Branch)', velocity: '800-1200', frictionLoss: '0.05-0.10' },
    { application: 'Industrial (General)', velocity: '1500-2500', frictionLoss: '0.10-0.20' },
    { application: 'Industrial (Heavy)', velocity: '2000-4000', frictionLoss: '0.15-0.30' },
    { application: 'High Velocity System', velocity: '2500-4500', frictionLoss: '0.15-0.40' },
    { application: 'Exhaust (General)', velocity: '1000-1500', frictionLoss: '0.08-0.15' },
    { application: 'Kitchen Exhaust', velocity: '1500-2500', frictionLoss: '0.10-0.25' },
    { application: 'Hospital/Clean Room', velocity: '500-800', frictionLoss: '0.03-0.06' },
  ];

  const noiseData = [
    { ncLevel: 'NC 25-30', application: 'Recording Studios, Concert Halls', maxVelocity: '500-700' },
    { ncLevel: 'NC 30-35', application: 'Private Offices, Bedrooms', maxVelocity: '700-900' },
    { ncLevel: 'NC 35-40', application: 'Conference Rooms, Classrooms', maxVelocity: '900-1100' },
    { ncLevel: 'NC 40-45', application: 'Open Offices, Retail Stores', maxVelocity: '1100-1400' },
    { ncLevel: 'NC 45-55', application: 'Cafeterias, Gyms', maxVelocity: '1400-2000' },
    { ncLevel: 'NC 55+', application: 'Factories, Kitchens', maxVelocity: '2000+' },
  ];

  return (
    <div className="mt-4">
      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full backdrop-blur rounded-2xl p-4 border transition-all flex items-center justify-between ${
          isDark 
            ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70' 
            : 'bg-white border-slate-200 shadow-sm hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
            isDark ? 'bg-amber-600/30' : 'bg-amber-100'
          }`}>📋</span>
          <div className="text-left">
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Reference Guide</h3>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs`}>Recommended velocities & friction loss</p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          {/* Velocity Recommendations Sheet */}
          <div className={`backdrop-blur rounded-2xl p-4 border ${
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h4 className="text-amber-500 font-semibold mb-3 flex items-center gap-2">
              <span>💨</span> Recommended Duct Velocities
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={`border-b ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}>
                    <th className="text-left py-2 pr-2">Application</th>
                    <th className="text-right py-2 px-2">Velocity<br/><span className="font-normal">(ft/min)</span></th>
                    <th className="text-right py-2 pl-2">Friction<br/><span className="font-normal">(in.w.g./100ft)</span></th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {velocityData.map((row, index) => (
                    <tr key={index} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-50'}`}>
                      <td className="py-2 pr-2">{row.application}</td>
                      <td className={`text-right py-2 px-2 font-medium ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>{row.velocity}</td>
                      <td className={`text-right py-2 pl-2 font-medium ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>{row.frictionLoss}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Noise Level Guide Sheet */}
          <div className={`backdrop-blur rounded-2xl p-4 border ${
            isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h4 className="text-purple-500 font-semibold mb-3 flex items-center gap-2">
              <span>🔇</span> Noise Level (NC) Guide
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={`border-b ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-100'}`}>
                    <th className="text-left py-2 pr-2">NC Level</th>
                    <th className="text-left py-2 px-2">Application</th>
                    <th className="text-right py-2 pl-2">Max Velocity<br/><span className="font-normal">(ft/min)</span></th>
                  </tr>
                </thead>
                <tbody className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {noiseData.map((row, index) => (
                    <tr key={index} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-50'}`}>
                      <td className={`py-2 pr-2 font-medium ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>{row.ncLevel}</td>
                      <td className="py-2 px-2">{row.application}</td>
                      <td className={`text-right py-2 pl-2 font-medium ${isDark ? 'text-cyan-300' : 'text-cyan-600'}`}>{row.maxVelocity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Tips Section */}
          <div className={`backdrop-blur rounded-2xl p-4 border ${
            isDark 
              ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700/30' 
              : 'bg-blue-50 border-blue-100'
          }`}>
            <h4 className="text-blue-500 font-semibold mb-3 flex items-center gap-2">
              <span>💡</span> Quick Design Tips
            </h4>
            <ul className={`text-xs space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Use <strong className={isDark ? 'text-white' : 'text-slate-900'}>0.08 in.w.g./100ft</strong> for residential low velocity systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Main ducts should be sized for <strong className={isDark ? 'text-white' : 'text-slate-900'}>0.08-0.10 in.w.g.</strong> friction loss</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Keep aspect ratio (W:H) below <strong className={isDark ? 'text-white' : 'text-slate-900'}>4:1</strong> for rectangular ducts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Return ducts typically sized for <strong className={isDark ? 'text-white' : 'text-slate-900'}>20-25% lower</strong> velocity than supply</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">⚠</span>
                <span>High velocities (&gt;2000 ft/min) may cause noise issues in occupied spaces</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceGuide;