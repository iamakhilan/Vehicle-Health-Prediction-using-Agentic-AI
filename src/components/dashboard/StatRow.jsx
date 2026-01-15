import React from 'react';

const StatRow = ({ label, value, unit }) => {
    return (
        <div className="group flex items-baseline justify-between py-3 border-b border-border/50 hover:border-border transition-colors">
            <span className="text-sm text-text-secondary font-medium">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-base text-text-primary font-mono tracking-tight">{value}</span>
                {unit && <span className="text-xs text-text-secondary opacity-60 ml-1">{unit}</span>}
            </div>
        </div>
    );
};

export default StatRow;
