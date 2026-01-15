import React from 'react';
import vehicleImage from '../../assets/vehicle-wireframe.png';

const VehicleHero = ({ anomaly }) => {
    return (
        <div className="relative w-full h-full flex items-center justify-center perspective-1000">
            {/* Ambient Glow */}
            <div className={`absolute inset-0 bg-radial-gradient from-accent-info/10 to-transparent opacity-50 blur-3xl transition-opacity duration-1000 ${anomaly ? 'from-accent-error/20' : ''}`} />

            {/* Vehicle Image */}
            <div className="relative z-10 w-[80%] max-w-4xl transition-transform duration-700 ease-out hover:scale-105">
                <img
                    src={vehicleImage}
                    alt="Vehicle Digital Twin"
                    className={`w-full h-auto drop-shadow-2xl transition-all duration-500 ${anomaly ? 'sepia-0 hue-rotate-[320deg] saturate-150' : ''}`}
                />

                {/* Anomaly Indicator (Only visible when anomaly) */}
                {anomaly && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent-error/30 rounded-full blur-xl animate-pulse" />
                )}
            </div>

            {/* Grid Floor Effect (CSS generated) */}
            <div className="absolute bottom-10 inset-x-0 h-40 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.03))] transform perspective-[100px] rotate-x-60 pointer-events-none" />
        </div>
    );
};

export default VehicleHero;
