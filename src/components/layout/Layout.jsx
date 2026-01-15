import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="h-screen w-screen bg-background text-text-primary overflow-hidden relative selection:bg-white/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-background via-background to-surface-subtle/20 pointer-events-none" />
            <div className="relative z-10 h-full w-full flex flex-col">
                {children}
            </div>
        </div>
    );
};

export default Layout;
