import React from 'react';
import StatRow from './StatRow';

const TelemetrySidebar = ({ sensors, onSimulateFault }) => {
    return (
        <div className="w-80 h-full border-l border-border/30 bg-surface/30 backdrop-blur-md p-8 flex flex-col justify-between">
            <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-8">Live Telemetry</h4>
                <div className="flex flex-col gap-1">
                    {sensors.map((sensor) => (
                        <StatRow
                            key={sensor.id}
                            label={sensor.label}
                            value={sensor.value}
                            unit={sensor.unit}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="p-4 rounded-lg bg-surface-subtle/50 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-text-muted uppercase">Connection</span>
                        <span className="flex items-center gap-1.5 text-xs text-accent-success font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse" />
                            Stable
                        </span>
                    </div>
                    <p className="text-[10px] text-text-muted font-mono">Lat: 12ms • Up: 48h</p>
                </div>

                <button
                    onClick={onSimulateFault}
                    className="w-full py-4 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary border border-white/5 hover:border-white/20 hover:bg-white/5 rounded-lg transition-all duration-300"
                >
                    Inject Fault
                </button>
            </div>
        </div>
    );
};

export default TelemetrySidebar;
