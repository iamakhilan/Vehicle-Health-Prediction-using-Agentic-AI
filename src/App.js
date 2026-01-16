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
