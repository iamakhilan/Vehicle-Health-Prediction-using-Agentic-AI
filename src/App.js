/**
 * App Component
 * 
 * Main application entry point that displays three workflow states side-by-side
 * for demonstration purposes. Each state shows a different stage of the vehicle
 * health prediction system:
 * 
 * 1. Monitor - Real-time sensor data display
 * 2. Anomaly - Alert detection and notification
 * 3. Diagnosis - AI-powered fault analysis
 * 
 * In production, this would be a single flow rather than three parallel instances.
 */

import React from 'react';
import VehicleHealthFlow from './views/VehicleHealthFlow';

function App() {
  return (
    <div className="min-h-screen bg-[#e5e5e5] py-20 overflow-x-auto">
      <div className="flex gap-16 justify-center px-10 min-w-max">
        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-sm text-gray-500 uppercase tracking-widest">01. Monitor</span>
          <VehicleHealthFlow initialState="monitor" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-sm text-gray-500 uppercase tracking-widest">02. Anomaly</span>
          <VehicleHealthFlow initialState="anomaly" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-sm text-gray-500 uppercase tracking-widest">03. Diagnosis</span>
          <VehicleHealthFlow initialState="diagnosis" />
        </div>
      </div>
    </div>
  );
}

export default App;
