import React from 'react';
import { cn } from '../../lib/utils';
import { Battery, Signal, Wifi } from 'lucide-react';

const IPhoneFrame = ({ children, className }) => {
    return (
        <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden rounded-[50px] border-[8px] border-[#1C1C1E] bg-secondary-sand shadow-2xl ring-4 ring-[#3a3a3c]">
            {/* Notch */}
            <div className="absolute left-1/2 top-0 z-50 h-[30px] w-[140px] -translate-x-1/2 rounded-b-[20px] bg-[#1C1C1E]">
                {/* Speaker/Camera simulation */}
                <div className="absolute top-[8px] right-[20px] h-3 w-3 rounded-full bg-[#0d0d0d]/80"></div>
                <div className="absolute top-[12px] right-[40px] h-1.5 w-8 rounded-full bg-[#0d0d0d]/80"></div>
            </div>

            {/* Status Bar */}
            <div className="absolute top-0 z-40 flex w-full justify-between px-6 pt-3 text-primary-ink">
                <span className="text-[15px] font-semibold">9:41</span>
                <div className="flex items-center gap-1.5">
                    <Signal size={16} fill="currentColor" strokeWidth={0} />
                    <Wifi size={16} strokeWidth={2.5} />
                    <Battery size={20} className="ml-1" />
                </div>
            </div>

            {/* Content */}
            <div className={cn("h-full w-full overflow-y-auto pt-[44px] pb-[34px] scrollbar-hide", className)}>
                {children}
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 h-1.5 w-[134px] -translate-x-1/2 rounded-full bg-black/80"></div>
        </div>
    );
};

export default IPhoneFrame;
