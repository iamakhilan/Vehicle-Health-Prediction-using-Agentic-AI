import React from 'react';
import VehicleHealthFlow from './views/VehicleHealthFlow';

function App() {
  return (
    <div className="min-h-screen bg-[#e5e5e5] py-20 overflow-x-auto">
      <div className="flex gap-16 justify-center px-10 min-w-max">
        {/* Screen 1: Monitoring State */}
        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-sm text-gray-500 uppercase tracking-widest">01. Monitor</span>
          <VehicleHealthFlow initialState="monitor" />
        </div>

        {/* Screen 2: Anomaly / Alert State */}
        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-sm text-gray-500 uppercase tracking-widest">02. Anomaly</span>
          <VehicleHealthFlow initialState="anomaly" />
        </div>

        {/* Screen 3: Diagnosis Result State */}
        {/* Note: We pass 'diagnosis' but the component starts processing. 
             Ideally for a static "snapshot" we might want to bypass processing.
             But showing the UI is enough. Let's let it run or modify the component logic slightly if needed.
             For now, I'll rely on the user clicking or just the processing animation which is cool too.
             Actually, let's create a "diagnosis_ready" state if we want to show the result immediately?
             The current logic forces a processing wait. That's fine for the demo interactiveness. 
             But if we want a static mock of the result, we should probably add a prop or state.
             Let's blindly pass 'diagnosis' and let it show the loading state - it communicates the "Agentic" nature.
             OR, better, let's update the component to accept a prop to skip processing.
             Actually, I can just modify the code above to default 'isProcessing' to false if initialState is diagnosis.
          */}
        <div className="flex flex-col items-center gap-4">
          <span className="font-mono text-sm text-gray-500 uppercase tracking-widest">03. Diagnosis</span>
          <VehicleHealthFlow initialState="diagnosis" />
        </div>
      </div>
    </div>
  );
}

export default App;
