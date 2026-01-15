import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Thermometer, Zap, Wrench, ArrowRight } from 'lucide-react';
import { H1, H2, H3, Body, Caption } from '../components/ui/Typography';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Mock Data
const SENSORS = [
    { id: 'temp', label: 'Engine Temp', value: '110°C', unit: 'Normal: 90°C', status: 'error', icon: Thermometer },
    { id: 'vibration', label: 'Vibration', value: 'High', unit: 'Normal: Low', status: 'warning', icon: Activity },
    { id: 'battery', label: 'Battery', value: '12.4V', unit: 'Stable', status: 'success', icon: Zap },
    // Adding more mock sensors to better demonstrate grid on desktop
    { id: 'oil', label: 'Oil Pressure', value: '45 PSI', unit: 'Normal: 40-50 PSI', status: 'success', icon: Activity },
    { id: 'coolant', label: 'Coolant Level', value: '98%', unit: 'Optimal', status: 'success', icon: Thermometer },
    { id: 'brake', label: 'Brake Pad', value: '85%', unit: 'Good', status: 'success', icon: Wrench },
];

const DIAGNOSIS = {
    fault: "Engine Misfire",
    cause: "Worn spark plug in Cylinder 4",
    risk: "High",
    rul: "180 km",
};

const STEPS = {
    MONITOR: 'monitor',
    ANOMALY: 'anomaly',
    DIAGNOSIS: 'diagnosis',
    ACTION: 'action',
};

const VehicleHealthFlow = ({ initialState = STEPS.MONITOR }) => {
    const [step, setStep] = useState(initialState);
    const [isProcessing, setIsProcessing] = useState(false);

    // Auto-advance for demo purposes if in monitor mode
    useEffect(() => {
        if (initialState === STEPS.MONITOR && step === STEPS.MONITOR) {
            // Just a static view for the "Monitor" state, or interactive? 
            // Let's keep it interactive but manual for now to let user explore.
        }
    }, [initialState, step]);

    const handleSimulateAnomaly = () => {
        setStep(STEPS.ANOMALY);
    };

    const handleRunDiagnosis = () => {
        setStep(STEPS.DIAGNOSIS);
        setIsProcessing(true);
        // Simulate AI thinking time
        setTimeout(() => setIsProcessing(false), 2500);
    };

    const handleApprove = () => {
        setStep(STEPS.ACTION);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-10 md:py-20 lg:px-12 min-h-screen">

            {/* Header */}
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <Caption className="mb-2 block">Vehicle Health</Caption>
                    <H2 className="text-3xl md:text-4xl">My Model S</H2>
                </div>
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-secondary-sand border border-functional-stone/30 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-functional-success"></div>
                </div>
            </div>

            <AnimatePresence mode="wait">

                {/* STEP 1: MONITOR SENSORS */}
                {step === STEPS.MONITOR && (
                    <motion.div
                        key="monitor"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-8"
                    >
                        <Card className="bg-primary-clay text-white p-8 md:p-10">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <Activity className="text-white h-6 w-6" />
                                    </div>
                                    <H3 className="text-white text-2xl md:text-3xl">All Systems Active</H3>
                                </div>
                                <span className="text-white/80 font-medium text-sm md:self-center bg-white/10 px-4 py-2 rounded-full">Real-time Monitoring</span>
                            </div>
                            <div className="text-white/80 text-base md:text-lg max-w-2xl">
                                Continuous analysis of 142 vehicle sensors. System operating within optimal parameters.
                            </div>
                        </Card>

                        <div>
                            <Caption className="mb-6 block text-lg">Live Metrics</Caption>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {SENSORS.map((sensor) => (
                                    <Card key={sensor.id} className="flex flex-col justify-between p-6 bg-white/50 h-full hover:bg-white transition-colors duration-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl ${sensor.status === 'error' ? 'bg-functional-error/10 text-functional-error' :
                                                    sensor.status === 'warning' ? 'bg-accent-teal/10 text-accent-teal' :
                                                        'bg-functional-success/10 text-functional-success'
                                                    }`}>
                                                    <sensor.icon size={22} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-primary-ink text-lg">{sensor.label}</div>
                                                    <div className="text-sm text-functional-stone">{sensor.unit}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-bold font-serif text-2xl self-end">{sensor.value}</div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center pt-8">
                            <Button onClick={handleSimulateAnomaly} variant="ghost" className="text-base text-functional-stone hover:text-primary-ink">
                                Simulate Anomaly
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: ANOMALY DETECTED */}
                {step === STEPS.ANOMALY && (
                    <motion.div
                        key="anomaly"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="max-w-3xl mx-auto text-center pt-10 md:pt-20"
                    >
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-functional-error/20 rounded-full animate-ping duration-1000"></div>
                            <div className="relative p-8 bg-functional-error/10 rounded-full text-functional-error">
                                <AlertTriangle size={64} strokeWidth={1.5} />
                            </div>
                        </div>

                        <div className="mb-12">
                            <H1 className="mb-4 text-4xl md:text-5xl">Anomaly Detected</H1>
                            <Body variant="serif" className="text-functional-stone text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                                Unusual vibration and temperature patterns detected in the engine block core systems.
                            </Body>
                        </div>

                        <Card className="text-left border-functional-error/30 bg-functional-error/5 p-8 max-w-xl mx-auto shadow-sm">
                            <H3 className="text-functional-error mb-6 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Alert Summary
                            </H3>
                            <ul className="space-y-4">
                                <li className="flex justify-between items-center text-base md:text-lg pb-4 border-b border-functional-error/10 last:border-0 last:pb-0">
                                    <span className="text-functional-stone">Engine Temp</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg">110°C (High)</span>
                                </li>
                                <li className="flex justify-between items-center text-base md:text-lg">
                                    <span className="text-functional-stone">Vibration</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg">Level 4 (Critical)</span>
                                </li>
                            </ul>
                        </Card>

                        <div className="pt-12 flex flex-col md:flex-row gap-4 justify-center items-center">
                            <Button onClick={handleRunDiagnosis} className="w-full md:w-auto px-8 py-3 text-lg h-auto">
                                Analyze Root Cause
                            </Button>
                            <Button variant="ghost" onClick={() => setStep(STEPS.MONITOR)} className="w-full md:w-auto text-lg h-auto">
                                Ignore Alert
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: DIAGNOSIS & PROCESSING */}
                {step === STEPS.DIAGNOSIS && (
                    <motion.div
                        key="diagnosis"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full flex flex-col"
                    >
                        {isProcessing ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 min-h-[50vh]">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 180, 360],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="h-24 w-24 md:h-32 md:w-32 rounded-[2rem] bg-accent-indigo text-white flex items-center justify-center shadow-glow"
                                >
                                    <Zap size={48} fill="currentColor" />
                                </motion.div>
                                <div>
                                    <H2 className="text-accent-indigo text-3xl mb-2">Synthesizing...</H2>
                                    <Body variant="small" className="text-lg">Analyzing sensor history and global service manuals.</Body>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8 md:space-y-12 max-w-5xl mx-auto w-full"
                            >
                                <div className="flex items-center gap-3 text-accent-indigo mb-2 bg-accent-indigo/10 w-fit px-4 py-2 rounded-full">
                                    <Zap size={20} fill="currentColor" />
                                    <Caption className="text-accent-indigo font-bold">AI Diagnosis Complete</Caption>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
                                    {/* Left Column: The Problem */}
                                    <div className="space-y-6">
                                        <div>
                                            <H1 className="text-4xl md:text-5xl mb-4">Engine Misfire</H1>
                                            <Body className="text-functional-stone text-lg">
                                                A consistent misfire pattern has been identified in Cylinder 4, correlating with recent high load events.
                                            </Body>
                                        </div>

                                        <Card className="bg-white border-accent-indigo/10 shadow-float p-8">
                                            <div className="mb-6 pb-6 border-b border-functional-mist">
                                                <Caption className="mb-2 text-functional-stone/70">Root Cause</Caption>
                                                <Body className="font-bold text-xl md:text-2xl text-primary-ink">{DIAGNOSIS.cause}</Body>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <Caption className="mb-2 text-functional-stone/70">Risk Level</Caption>
                                                    <div className="text-functional-error font-bold font-serif text-3xl">{DIAGNOSIS.risk}</div>
                                                </div>
                                                <div>
                                                    <Caption className="mb-2 text-functional-stone/70">RUL</Caption>
                                                    <div className="text-primary-clay font-bold font-serif text-3xl">{DIAGNOSIS.rul}</div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Right Column: The Solution */}
                                    <div className="space-y-6 md:pt-4">
                                        <H3 className="text-2xl">Recommendation</H3>
                                        <Card className="bg-secondary-sand border-0 p-8">
                                            <div className="flex gap-6">
                                                <div className="h-14 w-14 shrink-0 rounded-2xl bg-primary-clay flex items-center justify-center text-white shadow-lg shadow-primary-clay/20">
                                                    <Wrench size={28} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-2xl text-primary-ink mb-2">Replace Spark Plugs</div>
                                                    <Body className="text-functional-stone mb-6 leading-relaxed">
                                                        Drive safely to the nearest service center. Avoid highway speeds to prevent further cylinder damage.
                                                    </Body>
                                                </div>
                                            </div>
                                        </Card>

                                        <div className="pt-4 flex flex-col gap-4">
                                            <Button onClick={handleApprove} icon={ArrowRight} className="w-full py-4 text-lg justify-between px-8">
                                                Schedule Repair
                                            </Button>
                                            <Button variant="secondary" onClick={() => setStep(STEPS.MONITOR)} className="w-full py-4 text-lg">
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* STEP 4: ACTION CONFIRMED */}
                {step === STEPS.ACTION && (
                    <motion.div
                        key="action"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
                    >
                        <div className="h-32 w-32 rounded-full bg-functional-success/20 flex items-center justify-center text-functional-success mb-6 shadow-xl shadow-functional-success/10">
                            <CheckCircle size={64} />
                        </div>
                        <div className="max-w-md mx-auto space-y-4">
                            <H1 className="text-4xl md:text-5xl">All Set</H1>
                            <Body className="text-lg text-functional-stone">
                                Maintenance has been scheduled. A full report has been saved to your vehicle log.
                            </Body>
                        </div>
                        <Button variant="secondary" className="mt-8 px-8 py-3" onClick={() => setStep(STEPS.MONITOR)}>
                            Return to Dashboard
                        </Button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

export default VehicleHealthFlow;

