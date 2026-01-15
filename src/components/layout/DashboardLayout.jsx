import React, { useState } from 'react';
import { Home, Activity, Settings, Menu, X, Car } from 'lucide-react';
import { cn } from '../../lib/utils';
import { H3, Caption } from '../ui/Typography';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors",
            active ? "bg-primary-clay text-white" : "text-functional-stone hover:bg-secondary-sand"
        )}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </div>
);

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-secondary-sand overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-background-surface border-r border-functional-mist transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary-clay flex items-center justify-center text-white">
                        <Activity size={20} />
                    </div>
                    <H3>V-Health</H3>
                </div>

                <div className="flex-1 px-4 space-y-2">
                    <Caption className="px-4 mb-2 block">Menu</Caption>
                    <SidebarItem icon={Home} label="Overview" active onClick={() => { }} />
                    <SidebarItem icon={Car} label="My Vehicle" onClick={() => { }} />
                    <SidebarItem icon={Settings} label="Settings" onClick={() => { }} />
                </div>

                <div className="p-6 border-t border-functional-mist">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent-indigo text-white flex items-center justify-center">
                            AH
                        </div>
                        <div>
                            <div className="font-bold text-sm text-primary-ink">Akhil H.</div>
                            <div className="text-xs text-functional-stone">Model S Plaid</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header (Mobile only toggle) */}
                <div className="lg:hidden p-4 bg-background-surface border-b border-functional-mist flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary-clay flex items-center justify-center text-white">
                            <Activity size={20} />
                        </div>
                        <span className="font-bold text-lg">V-Health</span>
                    </div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X /> : <Menu />}
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
