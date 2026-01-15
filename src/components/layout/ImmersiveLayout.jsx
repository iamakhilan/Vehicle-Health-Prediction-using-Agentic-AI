import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Activity, Menu, Settings, Shield, User } from 'lucide-react';

const NavItem = ({ icon: Icon, active }) => (
    <div className={cn(
        "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer",
        active ? "bg-accent-indigo text-white shadow-glow" : "text-white/40 hover:text-white hover:bg-white/10"
    )}>
        <Icon size={22} strokeWidth={1.5} />
    </div>
);

const ImmersiveLayout = ({ children }) => {
    return (
        <div className="relative h-screen w-screen bg-black overflow-hidden flex text-white font-sans selection:bg-accent-indigo/30">

            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-accent-indigo/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse duration-[10000ms]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-accent-teal/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
            </div>

            {/* Floating Sidebar */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="relative z-50 h-full w-24 flex flex-col items-center py-10 border-r border-white/5 bg-black/20 backdrop-blur-xl"
            >
                <div className="mb-12 h-10 w-10 bg-gradient-to-br from-primary-clay to-orange-600 rounded-xl flex items-center justify-center text-white shadow-glow">
                    <Activity size={20} />
                </div>

                <div className="flex-1 space-y-6">
                    <NavItem icon={Shield} active />
                    <NavItem icon={Menu} />
                    <NavItem icon={Settings} />
                </div>

                <div className="mt-auto">
                    <NavItem icon={User} />
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-8 flex items-center gap-6 z-50">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-medium text-white/50 tracking-widest uppercase">Weather</div>
                        <div className="text-lg font-light">Partly Cloudy, 24°C</div>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                    <div className="text-right">
                        <div className="text-sm font-medium text-white/50 tracking-widest uppercase">System Status</div>
                        <div className="flex items-center justify-end gap-2">
                            <span className="h-2 w-2 rounded-full bg-functional-success shadow-[0_0_10px_#3D8856]" />
                            <span className="text-lg font-light">Connected</span>
                        </div>
                    </div>
                </div>

                {children}
            </main>
        </div>
    );
};

export default ImmersiveLayout;
