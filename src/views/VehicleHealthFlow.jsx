/**
 * VehicleHealthFlow Component
 * 
 * Main workflow component that simulates a multi-agent vehicle health prediction system.
 * Demonstrates the flow from sensor monitoring through AI diagnosis to service scheduling.
 * 
 * Architecture:
 * - MONITOR: Real-time sensor data visualization
 * - ANOMALY: Anomaly detection and alerting
 * - DIAGNOSIS: Agent-1 (AI Diagnostician) analyzes root cause
 * - ACTION: Agent-2 (Service Advisor) + Agent-3 (Scheduler) coordinate repair
 * 
 * Human-in-the-loop approval required before scheduling repairs.
 * 
 * @param {string} initialState - Starting step for the flow (defaults to MONITOR)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Wrench, ArrowRight } from 'lucide-react';
import IPhoneFrame from '../components/layout/IPhoneFrame';
import { H1, H2, H3, Body, Caption } from '../components/ui/Typography';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SENSORS, DIAGNOSIS } from '../constants/mockData';
import { STEPS } from '../constants/steps';
import { runDiagnosis } from '../services/agents/diagnostician';

const VehicleHealthFlow = ({ initialState = STEPS.MONITOR }) => {
    const [step, setStep] = useState(initialState);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSimulateAnomaly = () => {
        setStep(STEPS.ANOMALY);
    };

    const handleRunDiagnosis = async () => {
        setStep(STEPS.DIAGNOSIS);
        setIsProcessing(true);
        
        // Simulate Agent-1 (AI Diagnostician) processing
        await runDiagnosis(SENSORS);
        
        setIsProcessing(false);
    };

    const handleApprove = () => {
        setStep(STEPS.ACTION);
    };

    return (
        <IPhoneFrame>
            <div className="px-6 pb-20">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Caption className="mb-1 block">Vehicle Health</Caption>
                        <H2>My Model S</H2>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-secondary-sand border border-functional-stone/30 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-functional-success"></div>
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
                            className="space-y-6"
                        >
                            <Card className="bg-primary-clay text-white">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <Activity className="text-white" />
                                    </div>
                                    <span className="text-white/80 font-medium text-sm">Real-time</span>
                                </div>
                                <H3 className="text-white mb-1">All Systems Active</H3>
                                <div className="text-white/80 text-sm">Monitoring 142 sensors...</div>
                            </Card>

                            <div>
                                <Caption className="mb-4 block">Live Metrics</Caption>
                                <div className="space-y-3">
                                    {SENSORS.map((sensor) => (
                                        <Card key={sensor.id} className="flex items-center justify-between py-4 bg-white/50">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl ${sensor.status === 'error' ? 'bg-functional-error/10 text-functional-error' :
                                                        sensor.status === 'warning' ? 'bg-accent-teal/10 text-accent-teal' :
                                                            'bg-functional-success/10 text-functional-success'
                                                    }`}>
                                                    <sensor.icon size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-primary-ink">{sensor.label}</div>
                                                    <div className="text-xs text-functional-stone">{sensor.unit}</div>
                                                </div>
                                            </div>
                                            <div className="font-bold font-serif text-lg">{sensor.value}</div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={handleSimulateAnomaly} variant="ghost" className="mt-8">
                                Simulate Anomaly
                            </Button>
                        </motion.div>
                    )}

                    {/* STEP 2: ANOMALY DETECTED */}
                    {step === STEPS.ANOMALY && (
                        <motion.div
                            key="anomaly"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="space-y-6 text-center pt-10"
                        >
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-functional-error/20 rounded-full animate-ping"></div>
                                <div className="relative p-6 bg-functional-error/10 rounded-full text-functional-error">
                                    <AlertTriangle size={48} strokeWidth={1.5} />
                                </div>
                            </div>

                            <div>
                                <H1 className="mb-2">Anomaly Detected</H1>
                                <Body variant="serif" className="text-functional-stone">
                                    Unusual vibration and temperature patterns detected in the engine block.
                                </Body>
                            </div>

                            <Card className="text-left border-functional-error/30 bg-functional-error/5">
                                <H3 className="text-functional-error mb-2">Alert Summary</H3>
                                <ul className="space-y-2">
                                    <li className="flex justify-between text-sm">
                                        <span>Engine Temp</span>
                                        <span className="font-bold text-primary-ink">110°C (High)</span>
                                    </li>
                                    <li className="flex justify-between text-sm">
                                        <span>Vibration</span>
                                        <span className="font-bold text-primary-ink">Level 4 (Critical)</span>
                                    </li>
                                </ul>
                            </Card>

                            <div className="pt-8">
                                <Button onClick={handleRunDiagnosis}>
                                    Analyze Root Cause
                                </Button>
                                <Button variant="ghost" onClick={() => setStep(STEPS.MONITOR)} className="mt-4">
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
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 180, 360],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="h-20 w-20 rounded-3xl bg-accent-indigo text-white flex items-center justify-center shadow-glow"
                                    >
                                        <Zap size={32} fill="currentColor" />
                                    </motion.div>
                                    <H2 className="text-accent-indigo">Synthesizing...</H2>
                                    <Body variant="small">Analyzing sensor history and service manuals.</Body>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-3 text-accent-indigo mb-2">
                                        <Zap size={20} fill="currentColor" />
                                        <Caption className="text-accent-indigo">AI Diagnosis Complete</Caption>
                                    </div>

                                    <H1>Engine Misfire</H1>

                                    <Card className="bg-white border-accent-indigo/10 shadow-float">
                                        <div className="mb-4 pb-4 border-b border-functional-mist">
                                            <Caption className="mb-1">Root Cause</Caption>
                                            <Body className="font-medium">{DIAGNOSIS.cause}</Body>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Caption className="mb-1">Risk Level</Caption>
                                                <div className="text-functional-error font-bold font-serif text-xl">{DIAGNOSIS.risk}</div>
                                            </div>
                                            <div>
                                                <Caption className="mb-1">RUL</Caption>
                                                <div className="text-primary-clay font-bold font-serif text-xl">{DIAGNOSIS.rul}</div>
                                            </div>
                                        </div>
                                    </Card>

                                    <div>
                                        <H3 className="mb-3">Recommendation</H3>
                                        <Card className="bg-secondary-sand border-0">
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-primary-clay flex items-center justify-center text-white">
                                                    <Wrench size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-primary-ink mb-1">Replace Spark Plugs</div>
                                                    <Body variant="small" className="mb-3">
                                                        Drive safely to the nearest service center. Avoid highway speeds.
                                                    </Body>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        <Button onClick={handleApprove} icon={ArrowRight}>
                                            Schedule Repair
                                        </Button>
                                        <Button variant="secondary" onClick={() => setStep(STEPS.MONITOR)}>
                                            Dismiss
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 4: ACTION CONFIRMED */}
                    {step === STEPS.ACTION && (
                        <motion.div
                            key="action"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6 text-center pt-8"
                        >
                            <div className="h-24 w-24 rounded-full bg-functional-success/20 flex items-center justify-center text-functional-success mx-auto mb-4">
                                <CheckCircle size={48} />
                            </div>
                            <H1>Repair Scheduled</H1>
                            <Body className="text-functional-stone">
                                Your appointment has been confirmed. Service center notified.
                            </Body>
                            
                            <Card className="text-left bg-secondary-sand border-0">
                                <Caption className="mb-3 block">Confirmation Details</Caption>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-functional-stone">Service</span>
                                        <span className="font-semibold text-primary-ink">Replace Spark Plugs</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-functional-stone">Location</span>
                                        <span className="font-semibold text-primary-ink">Downtown Service Center</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-functional-stone">Est. Duration</span>
                                        <span className="font-semibold text-primary-ink">1-2 hours</span>
                                    </div>
                                </div>
                            </Card>

                            <Button variant="secondary" className="mt-4" onClick={() => setStep(STEPS.MONITOR)}>
                                Return to Dashboard
                            </Button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </IPhoneFrame>
    );
};

export default VehicleHealthFlow;
