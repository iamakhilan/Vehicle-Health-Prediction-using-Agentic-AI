import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
// Using standard divs instead of bespoke Card component to ensure flat design
// import Card from '../ui/Card'; 

const TelemetryItem = ({ icon: Icon, label, value, unit, status }) => {
    const isError = status === 'error';
    const isSuccess = status === 'success';

    return (
        <div className={cn(
            "group flex items-center justify-between py-4 border-b border-border/50",
            "hover:bg-zinc-900/40 transition-colors -mx-2 px-2 rounded-lg"
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2 rounded-md transition-colors",
                    isError ? "bg-functional-error/10 text-functional-error" :
                        isSuccess ? "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200" : "bg-zinc-800 text-zinc-500"
                )}>
                    <Icon size={16} />
                </div>
                <div>
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-0.5">{label}</div>
                    <div className="text-sm text-zinc-200 font-mono">
                        {value} <span className="text-zinc-600 text-[10px]">{unit}</span>
                    </div>
                </div>
            </div>

            {/* Status Dot */}
            <div className={cn(
                "w-1.5 h-1.5 rounded-full mr-2",
                isError ? "bg-functional-error animate-pulse" :
                    isSuccess ? "bg-functional-success/50" : "bg-zinc-700"
            )} />
        </div>
    );
};

const TelemetryGrid = ({ sensors }) => {
    return (
        <div className="flex flex-col gap-1">
            {sensors.map((sensor) => (
                <TelemetryItem
                    key={sensor.id}
                    {...sensor}
                />
            ))}
        </div>
    );
};

export default TelemetryGrid;
