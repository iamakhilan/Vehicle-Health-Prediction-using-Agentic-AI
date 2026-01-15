import React from 'react';

const STATUS_CONFIG = {
    success: { color: 'text-accent-success', dot: 'bg-accent-success' },
    warning: { color: 'text-accent-warning', dot: 'bg-accent-warning' },
    error: { color: 'text-accent-error', dot: 'bg-accent-error' },
    default: { color: 'text-text-secondary', dot: 'bg-text-secondary' },
};

const MinimalBadge = ({ status = 'default', children }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;

    return (
        <span className={`inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
            {children}
        </span>
    );
};

export default MinimalBadge;
