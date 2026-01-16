/**
 * Vehicle Health Flow - Main UI Component
 * 
 * Orchestrates the multi-agent vehicle health diagnostic system:
 * 
 * Flow:
 * 1. MONITOR: Agent 0 displays real-time sensor telemetry
 * 2. ANOMALY: Agent 0 detects and alerts on anomalies
 * 3. DIAGNOSIS: 
 *    - Agent 1 (AI): Diagnoses issue using RAG + service manual
 *    - Agent 2 (Rule-based): Estimates repair cost and time
 *    - Agent 3 (Rule-based): Finds next available service slot
 * 4. ACTION: Human approves or declines the repair plan
 * 
 * Agent Architecture:
 * - Agent 0: Sensor monitoring (simulated for demo)
 * - Agent 1: AI-based diagnostician (Ollama + FAISS RAG)
 * - Agent 2: Rule-based service advisor (deterministic)
 * - Agent 3: Rule-based scheduler (deterministic)
 * - Human: Final approval authority
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Thermometer, Zap, Wrench, ArrowRight, Calendar, DollarSign } from 'lucide-react';
import { H1, H2, H3, Body, Caption } from '../components/ui/Typography';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AgentStage from '../components/ui/AgentStage';

// --- AGENT 0: SENSOR DATA & ANOMALY DETECTION ---
const SENSORS = [
    { id: 'temp', label: 'Engine Temp', value: '110°C', unit: 'Normal: 90°C', status: 'error', icon: Thermometer },
    { id: 'vibration', label: 'Vibration', value: 'High', unit: 'Normal: Low', status: 'warning', icon: Activity },
    { id: 'battery', label: 'Battery', value: '12.4V', unit: 'Stable', status: 'success', icon: Zap },
    { id: 'oil', label: 'Oil Pressure', value: '45 PSI', unit: 'Normal: 40-50 PSI', status: 'success', icon: Activity },
    { id: 'coolant', label: 'Coolant Level', value: '98%', unit: 'Optimal', status: 'success', icon: Thermometer },
    { id: 'brake', label: 'Brake Pad', value: '85%', unit: 'Good', status: 'success', icon: Wrench },
];

// --- AGENT 1: DIAGNOSTICIAN ---
const DIAGNOSIS = {
    fault: "Engine Misfire",
    cause: "Worn spark plug in Cylinder 4",
    fix: "Replace spark plugs",
    reference: "Page 6"
};

// --- AGENT 2: SERVICE ADVISOR ---
const REPAIR_PLAN = {
    action: "Spark Plug Replacement",
    parts_cost: '₹800',
    labor_cost: '₹400',
    total_cost: '₹1200',
    estimated_time: '1 hour',
    notes: "Includes inspection of ignition coils."
};

// --- AGENT 3: SCHEDULER ---
const SCHEDULE = {
    next_slot: "Tuesday, 10:00 AM",
    location: "Downtown Service Center"
};

const STEPS = {
    MONITOR: 'monitor',
    ANOMALY: 'anomaly',
    DIAGNOSIS: 'diagnosis',
    ACTION: 'action',
};

const VehicleHealthFlow = ({ initialState = STEPS.MONITOR }) => {
    const [step, setStep] = useState(initialState);
    const [errorMessage, setErrorMessage] = useState('');

    // Independent agent states
    const [agent1State, setAgent1State] = useState('idle'); // 'idle' | 'processing' | 'complete'
    const [agent2State, setAgent2State] = useState('idle');

    // Reset loop for demo
    useEffect(() => {
        if (step === STEPS.MONITOR) {
            setAgent1State('idle');
            setAgent2State('idle');
            setErrorMessage('');
        }
    }, [step]);

    const handleSimulateAnomaly = () => {
        setStep(STEPS.ANOMALY);
    };

    const [diagnosisResult, setDiagnosisResult] = useState(DIAGNOSIS);
    const [repairPlan, setRepairPlan] = useState(REPAIR_PLAN);
    const [schedule, setSchedule] = useState(SCHEDULE);

    const handleRunDiagnosis = async () => {
        setStep(STEPS.DIAGNOSIS);
        // Start Agent 1 (Chained)
        setAgent1State('processing');

        try {
            const response = await fetch('http://localhost:5000/diagnose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alert: "Error Code P0300 with high engine vibration" })
            });

            const data = await response.json();

            let currentFix = "";
            let currentDiagnosis = "";

            if (data.diagnosis) {
                // Map API response to UI model
                const raw = data.diagnosis;
                currentFix = raw["Recommended Fix"] || "";
                currentDiagnosis = raw["Diagnosis"] || "";

                setDiagnosisResult({
                    fault: raw["Diagnosis"] || "Unknown Fault",
                    cause: raw["Cause"] || "Analysis inconclusive",
                    fix: raw["Recommended Fix"] || "Check Manual",
                    reference: raw["Reference"] || "N/A"
                });
            }

            setAgent1State('complete');

            // --- AGENT 2: ESTIMATE (Service Advisor) ---
            setAgent2State('processing');

            // Artificial delay for UX
            await new Promise(r => setTimeout(r, 800));

            const estResponse = await fetch('http://localhost:5000/estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diagnosis: currentDiagnosis, fix: currentFix })
            });

            const estData = await estResponse.json();
            setRepairPlan({
                action: estData.action,
                parts_cost: estData.parts_cost,
                labor_cost: estData.labor_cost,
                total_cost: estData.total_cost,
                estimated_time: estData.estimated_time,
                notes: estData.notes
            });

            // --- AGENT 3: SCHEDULE (Scheduler) ---

            // Artificial delay for UX
            await new Promise(r => setTimeout(r, 600));

            const schedResponse = await fetch('http://localhost:5000/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ duration: estData.estimated_time })
            });

            const schedData = await schedResponse.json();
            setSchedule({
                next_slot: schedData.next_slot,
                location: schedData.location
            });

            setAgent2State('complete');
        } catch (error) {
            console.error("Diagnosis Failed:", error);
            setErrorMessage('Unable to connect to the API server. Please ensure the backend is running on port 5000.');
            setAgent1State('idle');
            setAgent2State('idle');
            // Keep showing fallback data so UI remains functional
            setDiagnosisResult({
                ...DIAGNOSIS,
                cause: "Connection Error - Using fallback data"
            });
        }


    };

    const handleApprove = () => {
        setStep(STEPS.ACTION);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-6 py-10 md:py-20 lg:px-12 min-h-screen">

            {/* Header */}
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <Caption className="mb-2 block">Vehicle Health System</Caption>
                    <H2 className="text-3xl md:text-4xl">My Model S</H2>
                </div>
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-secondary-sand border border-functional-stone/30 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-functional-success shadow-[0_0_10px_#3D8856]"></div>
                </div>
            </div>

            <AnimatePresence mode="wait">

                {/* STEP 1: MONITOR SENSORS (AGENT 0) */}
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
                                    <H3 className="text-white text-2xl md:text-3xl">System Active</H3>
                                </div>
                                <span className="text-white/80 font-medium text-sm md:self-center bg-white/10 px-4 py-2 rounded-full">Real-time Agent Monitoring</span>
                            </div>
                            <div className="text-white/80 text-base md:text-lg max-w-2xl">
                                Agent 0 is analyzing 142 vehicle sensors stream for anomalies.
                            </div>
                        </Card>

                        <div>
                            <Caption className="mb-6 block text-lg">Live Telemetry</Caption>
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
                                Simulate Sensor Anomaly
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: ANOMALY DETECTED (AGENT 0 ALERT) */}
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
                                Agent 0 triggered an alert. Unusual vibration and temperature patterns detected in the engine block.
                            </Body>
                        </div>

                        <Card className="text-left border-functional-error/30 bg-functional-error/5 p-8 max-w-xl mx-auto shadow-sm">
                            <H3 className="text-functional-error mb-6 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Agent 0 Report
                            </H3>
                            <ul className="space-y-4">
                                <li className="flex justify-between items-center text-base md:text-lg pb-4 border-b border-functional-error/10 last:border-0 last:pb-0">
                                    <span className="text-functional-stone">Error Code</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg font-mono">P0300</span>
                                </li>
                                <li className="flex justify-between items-center text-base md:text-lg pb-4 border-b border-functional-error/10 last:border-0 last:pb-0">
                                    <span className="text-functional-stone">Engine Temp</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg">110°C</span>
                                </li>
                                <li className="flex justify-between items-center text-base md:text-lg">
                                    <span className="text-functional-stone">Vibration</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg">Level 4</span>
                                </li>
                            </ul>
                        </Card>

                        <div className="pt-12 flex flex-col md:flex-row gap-4 justify-center items-center">
                            <Button onClick={handleRunDiagnosis} className="w-full md:w-auto px-8 py-3 text-lg h-auto">
                                Run Diagnostics (Agent 1)
                            </Button>
                            <Button variant="ghost" onClick={() => setStep(STEPS.MONITOR)} className="w-full md:w-auto text-lg h-auto">
                                Ignore Alert
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: DIAGNOSIS & PROCESSING (AGENTS 1, 2, 3) */}
                {step === STEPS.DIAGNOSIS && (
                    <motion.div
                        key="diagnosis"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8 md:space-y-12 max-w-6xl mx-auto w-full min-h-[60vh]"
                    >
                        {/* Error Banner */}
                        {errorMessage && (
                            <Card className="bg-functional-error/10 border-functional-error/30 p-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-functional-error shrink-0 mt-1" size={20} />
                                    <div>
                                        <div className="font-bold text-functional-error mb-1">Connection Error</div>
                                        <div className="text-sm text-functional-stone">{errorMessage}</div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">

                            {/* Left Column: Agent 1 (Diagnosis) */}
                            <AgentStage
                                status={agent1State}
                                title="Agent 1: Diagnostician"
                                icon={Zap}
                                color="text-accent-indigo"
                                processingText="Analyzing sensor context..."
                            >
                                <div className="space-y-6">
                                    <div>
                                        <H1 className="text-4xl md:text-5xl mb-4">{diagnosisResult.fault}</H1>
                                        <Body className="text-functional-stone text-lg">
                                            Agent 1 analyzed service manuals and sensor context. A specific fault has been identified.
                                        </Body>
                                    </div>

                                    <Card className="bg-white border-accent-indigo/10 shadow-float p-8">
                                        <div className="mb-6 pb-6 border-b border-functional-mist">
                                            <div className="mb-2">
                                                <Caption className="text-functional-stone/70">Root Cause</Caption>
                                            </div>
                                            <Body className="font-bold text-xl md:text-2xl text-primary-ink">{diagnosisResult.cause}</Body>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <Caption className="mb-2 text-functional-stone/70">Recommended Fix</Caption>
                                                <div className="text-primary-ink font-medium text-lg leading-relaxed">{diagnosisResult.fix}</div>
                                            </div>
                                            <div>
                                                <Caption className="mb-2 text-functional-stone/70">Reference</Caption>
                                                <div className="text-primary-clay font-bold font-serif text-xl">{diagnosisResult.reference}</div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </AgentStage>

                            {/* Right Column: Agent 2 (Advisor) & Agent 3 (Scheduler) */}
                            {/* Only show/process if Agent 1 is complete */}
                            {agent1State === 'complete' && (
                                <AgentStage
                                    status={agent2State}
                                    title="Agents 2 & 3: Service & Schedule"
                                    icon={Wrench}
                                    color="text-primary-clay"
                                    processingText="Calculating costs & checking schedule..."
                                >
                                    <div className="space-y-6 md:pt-4">
                                        <H3 className="text-2xl">Recommended Action</H3>

                                        {/* Agent 2: Cost & Repair Plan */}
                                        <Card className="bg-secondary-sand border-0 p-8">
                                            <div className="flex gap-6 mb-6">
                                                <div className="h-14 w-14 shrink-0 rounded-2xl bg-primary-clay flex items-center justify-center text-white shadow-lg shadow-primary-clay/20">
                                                    <Wrench size={28} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-2xl text-primary-ink mb-1">{repairPlan.action}</div>
                                                    <Body className="text-functional-stone text-sm">
                                                        Agent 2 Estimate • {repairPlan.estimated_time}
                                                    </Body>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6 bg-white/50 p-4 rounded-xl border border-white">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-functional-stone">Parts</span>
                                                    <span className="font-medium text-primary-ink">{repairPlan.parts_cost}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-functional-stone">Labor ({repairPlan.estimated_time})</span>
                                                    <span className="font-medium text-primary-ink">{repairPlan.labor_cost}</span>
                                                </div>
                                                <div className="border-t border-functional-stone/20 my-2 pt-2 flex justify-between font-bold text-lg">
                                                    <span>Total Estimate</span>
                                                    <span>{repairPlan.total_cost}</span>
                                                </div>
                                            </div>

                                            {/* Agent 3: Schedule */}
                                            <div className="flex gap-4 items-start bg-accent-teal/10 p-4 rounded-xl mb-6">
                                                <Calendar className="text-accent-teal shrink-0 mt-1" size={20} />
                                                <div>
                                                    <div className="font-bold text-accent-teal mb-0.5">Agent 3 Found a Slot</div>
                                                    <div className="text-primary-ink font-medium">{schedule.next_slot}</div>
                                                    <div className="text-xs text-functional-stone mt-1">{schedule.location}</div>
                                                </div>
                                            </div>

                                            <Body className="text-functional-stone text-sm italic">
                                                "I've checked the price list and mechanic availability. This is the earliest slot." — Service Advisor Agent
                                            </Body>
                                        </Card>

                                        <div className="pt-4 flex flex-col gap-4">
                                            <Button onClick={handleApprove} icon={ArrowRight} className="w-full py-4 text-lg justify-between px-8">
                                                Approve Repair & Schedule
                                            </Button>
                                            <Button variant="secondary" onClick={() => setStep(STEPS.MONITOR)} className="w-full py-4 text-lg">
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                </AgentStage>
                            )}

                        </div>
                    </motion.div>
                )}

                {/* STEP 4: ACTION CONFIRMED (HUMAN APPROVED) */}
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
                            <H1 className="text-4xl md:text-5xl">Repair Approved!</H1>
                            <Body className="text-lg text-functional-stone">
                                Your repair has been scheduled. We've sent a confirmation to your registered contact details.
                            </Body>
                            <Card className="bg-white p-6 mt-6 mx-auto text-left max-w-sm border-functional-stone/20">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-primary-clay" size={20} />
                                        <div>
                                            <div className="text-xs text-functional-stone uppercase tracking-wide">Appointment</div>
                                            <div className="font-bold text-primary-ink">{schedule.next_slot}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Wrench className="text-primary-clay" size={20} />
                                        <div>
                                            <div className="text-xs text-functional-stone uppercase tracking-wide">Service</div>
                                            <div className="font-bold text-primary-ink">{repairPlan.action}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="text-primary-clay" size={20} />
                                        <div>
                                            <div className="text-xs text-functional-stone uppercase tracking-wide">Est. Cost</div>
                                            <div className="font-bold text-primary-ink">{repairPlan.total_cost}</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
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

