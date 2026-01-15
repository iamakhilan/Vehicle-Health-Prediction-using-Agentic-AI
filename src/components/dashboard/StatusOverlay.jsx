import React from 'react';

const StatusOverlay = ({ status, label }) => {
    const isError = status === 'error';

    return (
        <div className="absolute top-12 left-12 z-20 pointer-events-none mix-blend-difference">
            <h1 className={`text-10xl font-black tracking-tightest leading-none bg-clip-text text-transparent bg-gradient-to-br transition-all duration-500 ${isError ? 'from-accent-error to-red-900' : 'from-white to-zinc-500'
                }`}>
                {status === 'error' ? 'ATTN' : 'OPTL'}
            </h1>
            <p className={`text-xl font-medium tracking-widest uppercase ml-2 ${isError ? 'text-accent-error' : 'text-text-secondary'
                }`}>
                {label || 'System Optimal'}
            </p>
        </div>
    );
};

export default StatusOverlay;
