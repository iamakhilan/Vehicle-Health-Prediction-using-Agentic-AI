import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Thermometer, Zap, Wrench, ArrowRight, Calendar, Clock, DollarSign } from 'lucide-react';
import { H1, H2, H3, Body, Caption } from '../components/ui/Typography';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AgentStage from '../components/ui/AgentStage';
import { API_BASE_URL } from '../config/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- AGENT 0: SENSOR DATA & ANOMALY DETECTION ---
// Will be populated dynamically by the backend telemetry stream.
const DEFAULT_SENSORS = [
    { id: 'temp', label: 'Engine Temp', value: '-- °C', unit: 'Normal: 90°C', status: 'success', icon: Thermometer },
    { id: 'vibration', label: 'RPM Stress', value: '--', unit: 'Normal: Low', status: 'success', icon: Activity },
    { id: 'battery', label: 'Battery', value: '12.4V', unit: 'Stable', status: 'success', icon: Zap },
    { id: 'oil', label: 'Oil Pressure', value: '-- PSI', unit: 'Normal: 40-50 PSI', status: 'success', icon: Activity },
    { id: 'coolant', label: 'Coolant Level', value: '--', unit: 'Optimal', status: 'success', icon: Thermometer },
    { id: 'brake', label: 'Fuel Pressure', value: '--', unit: 'Good', status: 'success', icon: Wrench },
];

// --- AGENT 1: DIAGNOSTICIAN (Upgraded to Predictor v3) ---
const DIAGNOSIS = {
    health_score: 100,
    remaining_km: 10000,
    risk_level: "Low",
    trend: "stable",
    primary_stress_factors: [],
    stress_index: 0,
    failure_probability: 0,
    explanation: "",
    source_row_index: null,
    input_features: null
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
    const sessionVehicleIdRef = React.useRef(`demo_car_${Date.now()}_${Math.floor(Math.random() * 1000)}`);

    // Independent agent states
    const [agent1State, setAgent1State] = useState('idle'); // 'idle' | 'processing' | 'complete'
    const [agent2State, setAgent2State] = useState('idle');

    // Telemetry streaming states
    const [telemetryIndex, setTelemetryIndex] = useState(() => Math.floor(Math.random() * 10000));
    const telemetryIndexRef = React.useRef(telemetryIndex);
    const [liveTelemetry, setLiveTelemetry] = useState(null);
    const [sensorCards, setSensorCards] = useState(DEFAULT_SENSORS);

    // NEW state for freezing telemetry
    const [currentRowIndex, setCurrentRowIndex] = useState(0);
    const [anomalousTelemetry, setAnomalousTelemetry] = useState(null);

    // Dataset playback interval
    useEffect(() => {
        let isMounted = true;

        const fetchTelemetry = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/simulated-data?index=${telemetryIndexRef.current}`);
                if (!res.ok) return;
                const data = await res.json();

                if (isMounted && data.telemetry) {
                    setLiveTelemetry(data.telemetry);
                    setCurrentRowIndex(data.row_index);

                    // Update sensor cards safely
                    setSensorCards(prev => prev.map(sensor => {
                        if (sensor.id === 'temp') return { ...sensor, value: `${Math.round(data.telemetry.coolant_temperature)}°C`, status: data.telemetry.coolant_temperature > 100 ? 'error' : 'success' };
                        if (sensor.id === 'vibration') return { ...sensor, value: `${Math.round(data.telemetry.rpm)}`, status: data.telemetry.rpm > 3500 ? 'warning' : 'success' };
                        if (sensor.id === 'oil') return { ...sensor, value: `${Math.round(data.telemetry.oil_pressure)} PSI` };
                        if (sensor.id === 'coolant') return { ...sensor, value: `${Math.round(data.telemetry.coolant_pressure)} PSI` };
                        if (sensor.id === 'brake') return { ...sensor, value: `${Math.round(data.telemetry.fuel_pressure)} PSI` };
                        return sensor;
                    }));

                    setTelemetryIndex(data.next_index);
                    telemetryIndexRef.current = data.next_index;
                }
            } catch (err) {
                console.error("Telemetry fetch error:", err);
            }
        };

        const interval = setInterval(fetchTelemetry, 3000);

        // Initial fetch so it doesn't wait 3 seconds for the first load
        fetchTelemetry();

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Reset loop for demo
    useEffect(() => {
        if (step === STEPS.MONITOR) {
            setAgent1State('idle');
            setAgent2State('idle');
        }
    }, [step]);

    const handleSimulateAnomaly = () => {
        setAnomalousTelemetry(liveTelemetry);
        setStep(STEPS.ANOMALY);
    };

    const [diagnosisResult, setDiagnosisResult] = useState(DIAGNOSIS);
    const [repairPlan, setRepairPlan] = useState(REPAIR_PLAN);
    const [schedule, setSchedule] = useState(SCHEDULE);
    const [healthHistory, setHealthHistory] = useState([]);

    const handleRunDiagnosis = async () => {
        setStep(STEPS.DIAGNOSIS);
        // Start Agent 1
        setAgent1State('processing');

        let currentFactors = [];
        let currentRisk = "Unknown";
        let estimatedTime = "Unknown";
        let apiError = null;

        // --- AGENT 1: DIAGNOSTICIAN ---
        try {
            // Send actual live telemetry to the ML model if available, else send fallback
            // Use anomalousTelemetry if available, else liveTelemetry
            const telemetryToUse = anomalousTelemetry || liveTelemetry;
            const rowIndexToUse = anomalousTelemetry ? currentRowIndex : null;

            const payloadData = telemetryToUse ? {
                vehicle_id: sessionVehicleIdRef.current,
                engine_runtime: 60,
                source_row_index: rowIndexToUse,
                // ML model expected inputs
                rpm: telemetryToUse.rpm,
                oil_pressure: telemetryToUse.oil_pressure,
                fuel_pressure: telemetryToUse.fuel_pressure,
                coolant_pressure: telemetryToUse.coolant_pressure,
                oil_temp: telemetryToUse.oil_temp,
                coolant_temperature: telemetryToUse.coolant_temperature,
                // Rule-based fallback compatibility inputs
                engine_load: 85, // dataset doesn't have load
                coolant_temp: telemetryToUse.coolant_temperature,
                throttle_pos: 70,
                fuel_trim: 18,
                dtc_flag: telemetryToUse.coolant_temperature > 100 || telemetryToUse.rpm > 3500
            } : {
                vehicle_id: sessionVehicleIdRef.current,
                engine_runtime: 60,
                source_row_index: null,
                // ML model expected inputs (fallback defaults)
                rpm: 4500,
                oil_pressure: 3.5,
                fuel_pressure: 6.0,
                coolant_pressure: 2.5,
                oil_temp: 95,
                coolant_temperature: 110,
                // Rule-based fallback compatibility inputs
                engine_load: 85,
                coolant_temp: 110,
                throttle_pos: 70,
                fuel_trim: 18,
                dtc_flag: true
            };

            const response = await fetch(`${API_BASE_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `Prediction failed with status: ${response.status}`);
            }

            const data = await response.json();

            if (data) {
                currentFactors = data.primary_stress_factors || [];
                currentRisk = data.risk_level || "Unknown";

                setDiagnosisResult({
                    health_score: data.health_score || 0,
                    remaining_km: data.remaining_km || 0,
                    risk_level: currentRisk,
                    trend: data.trend || "stable",
                    primary_stress_factors: currentFactors,
                    stress_index: data.stress_index || 0,
                    failure_probability: data.failure_probability || 0,
                    explanation: data.explanation || "",
                    source_row_index: data.source_row_index || null,
                    input_features: data.input_features || null
                });

                // Fetch updated history
                try {
                    const historyRes = await fetch(`${API_BASE_URL}/vehicle-history/${data.vehicle_id}?limit=50`);
                    if (historyRes.ok) {
                        const historyData = await historyRes.json();
                        setHealthHistory(historyData);
                    }
                } catch (err) {
                    console.error("Failed to fetch history:", err);
                }
            }
        } catch (error) {
            console.error("API error on predict:", error);
            apiError = error.message;
            setDiagnosisResult({
                ...DIAGNOSIS,
                risk_level: "Unknown",
                cause: error.message || "Unable to reach diagnostics server"
            });
        } finally {
            setAgent1State('complete');
        }

        // --- AGENT 2: ESTIMATE (Service Advisor) ---
        setAgent2State('processing');
        await new Promise(r => setTimeout(r, 800));

        if (!apiError) {
            try {
                const estResponse = await fetch(`${API_BASE_URL}/estimate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stress_factors: currentFactors, risk_level: currentRisk })
                });

                if (!estResponse.ok) {
                    const errData = await estResponse.json();
                    throw new Error(errData.error || `Estimate failed with status: ${estResponse.status}`);
                }

                const estData = await estResponse.json();
                estimatedTime = estData.estimated_time || "1 hour";

                setRepairPlan({
                    action: estData.action,
                    parts_cost: estData.parts_cost,
                    labor_cost: estData.labor_cost,
                    total_cost: estData.total_cost,
                    estimated_time: estData.estimated_time,
                    notes: estData.notes
                });
            } catch (error) {
                console.error("API error on estimate:", error);
                setRepairPlan({
                    ...REPAIR_PLAN,
                    action: error.message || "Failed to estimate costs",
                    total_cost: "N/A",
                    estimated_time: "Unknown"
                });
                estimatedTime = "Unknown";
            }
        } else {
            setRepairPlan({
                ...REPAIR_PLAN,
                action: "Dependencies failed. Cannot compute estimate.",
                total_cost: "N/A",
                estimated_time: "Unknown"
            });
            setAgent2State('complete');
            return; // Skip scheduling if earlier steps completely failed
        }

        // --- AGENT 3: SCHEDULE (Scheduler) ---
        await new Promise(r => setTimeout(r, 600));

        try {
            const schedResponse = await fetch(`${API_BASE_URL}/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ duration: estimatedTime })
            });

            if (!schedResponse.ok) {
                throw new Error(`Schedule failed`);
            }

            const schedData = await schedResponse.json();
            setSchedule({
                next_slot: schedData.next_slot,
                location: schedData.location
            });
        } catch (error) {
            console.error("API error on schedule:", error);
            setSchedule({
                next_slot: "Unavailable",
                location: "Online booking offline"
            });
        } finally {
            setAgent2State('complete');
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
                            <Caption className="mb-6 block text-lg">Live Telemetry (Updated dynamically)</Caption>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sensorCards.map((sensor) => (
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
                                Agent 0 triggered an alert from <span className="font-bold text-primary-ink">CSV Row #{currentRowIndex}</span>. Unusual vibration and temperature patterns detected in the engine block.
                            </Body>
                        </div>

                        <Card className="text-left border-functional-error/30 bg-functional-error/5 p-8 max-w-xl mx-auto shadow-sm">
                            <H3 className="text-functional-error mb-6 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Agent 0 Report
                            </H3>
                            <ul className="space-y-4">
                                <li className="flex justify-between items-center text-base md:text-lg pb-4 border-b border-functional-error/10">
                                    <span className="text-functional-stone">Source Row</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg font-mono">#{currentRowIndex}</span>
                                </li>
                                <li className="flex justify-between items-center text-base md:text-lg pb-4 border-b border-functional-error/10">
                                    <span className="text-functional-stone">Engine Temp</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg">{anomalousTelemetry ? `${Math.round(anomalousTelemetry.coolant_temperature)}°C` : '--'}</span>
                                </li>
                                <li className="flex justify-between items-center text-base md:text-lg pb-4 border-b border-functional-error/10">
                                    <span className="text-functional-stone">RPM</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg">{anomalousTelemetry ? Math.round(anomalousTelemetry.rpm) : '--'}</span>
                                </li>
                                <li className="flex justify-between items-center text-base md:text-lg pb-4 border-b border-functional-error/10">
                                    <span className="text-functional-stone">Oil Pressure</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg">{anomalousTelemetry ? `${Number(anomalousTelemetry.oil_pressure).toFixed(1)} PSI` : '--'}</span>
                                </li>
                                <li className="flex justify-between items-center text-base md:text-lg">
                                    <span className="text-functional-stone">Fuel Pressure</span>
                                    <span className="font-bold text-primary-ink bg-white/50 px-3 py-1 rounded-lg">{anomalousTelemetry ? `${Number(anomalousTelemetry.fuel_pressure).toFixed(1)} PSI` : '--'}</span>
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
                                        <div className="flex items-center justify-between mb-4">
                                            <H1 className="text-4xl md:text-5xl text-primary-ink">Health: <span className={diagnosisResult.risk_level === 'High' ? 'text-functional-error' : 'text-accent-teal'}>{diagnosisResult.health_score}%</span></H1>
                                            {diagnosisResult.source_row_index != null && (
                                                <span className="text-sm font-mono bg-accent-indigo/10 text-accent-indigo px-3 py-1.5 rounded-lg">Row #{diagnosisResult.source_row_index}</span>
                                            )}
                                        </div>
                                        <Body className="text-functional-stone text-lg">
                                            {diagnosisResult.explanation ? `Diagnosis: ${diagnosisResult.explanation}` : "Prediction based on live vehicle telemetry."}
                                        </Body>
                                        <div className={`mt-4 mb-2 font-bold px-4 py-2 rounded-lg inline-block ${diagnosisResult.risk_level === 'High' ? 'bg-functional-error/20 text-functional-error' :
                                            diagnosisResult.risk_level === 'Medium' ? 'bg-accent-teal/20 text-accent-teal' :
                                                'bg-functional-success/20 text-functional-success'
                                            }`}>
                                            Risk Badge: {diagnosisResult.risk_level} {diagnosisResult.failure_probability > 0 && `(${(diagnosisResult.failure_probability * 100).toFixed(0)}%)`}
                                        </div>
                                        {diagnosisResult.risk_level === 'High' && (
                                            <div className="mt-2 p-4 bg-functional-error/10 border-l-4 border-functional-error text-functional-error text-lg font-bold">
                                                Warning: Critical vehicle health degradation detected. Immediate service advised.
                                            </div>
                                        )}

                                        {/* ML Failure Probability Chart */}
                                        <div className="mt-6">
                                            <Caption className="text-functional-stone/70 mb-2 block">Failure Probability</Caption>
                                            <div className="h-20 w-full bg-white/50 rounded-xl p-4 border border-solid border-functional-stone/20">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={[{ name: 'Probability', value: diagnosisResult.failure_probability * 100 }]} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                                        <XAxis type="number" domain={[0, 100]} hide />
                                                        <YAxis dataKey="name" type="category" hide />
                                                        <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Probability']} />
                                                        <Bar dataKey="value" fill={diagnosisResult.risk_level === 'High' ? '#ef4444' : diagnosisResult.risk_level === 'Medium' ? '#f59e0b' : '#10b981'} radius={[0, 4, 4, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <div className="text-2xl font-bold mb-4 text-primary-ink">Remaining Safe Distance: <span className="text-accent-indigo">{diagnosisResult.remaining_km} KM</span></div>
                                        </div>
                                        <div className="mt-4 p-4 border-2 border-solid border-functional-stone/30 rounded-xl bg-white/50 flex flex-col items-center">
                                            <div className="text-sm text-functional-stone uppercase tracking-wide mb-2">Trend Analysis</div>
                                            <div className="flex items-center gap-3">
                                                {diagnosisResult.trend === 'Degrading' ? (
                                                    <div className="text-functional-error flex items-center gap-2 font-bold text-lg"><Activity size={24} /> Degrading (↘)</div>
                                                ) : diagnosisResult.trend === 'Improving' ? (
                                                    <div className="text-functional-success flex items-center gap-2 font-bold text-lg"><Activity size={24} /> Improving (↗)</div>
                                                ) : (
                                                    <div className="text-accent-teal flex items-center gap-2 font-bold text-lg"><Activity size={24} /> Stable (→)</div>
                                                )}
                                            </div>
                                            <div className="mt-2 text-sm text-center text-primary-ink/80 max-w-sm">
                                                {diagnosisResult.trend === 'Degrading' ? "Health is dropping faster than the historical baseline due to sustained stress."
                                                    : diagnosisResult.trend === 'Improving' ? "Recent driving patterns are showing less stress on the engine components."
                                                        : "Degradation is consistent with normal usage constraints."}
                                            </div>
                                        </div>

                                        {/* NEW: VEHICLE HEALTH TIMELINE */}
                                        {healthHistory.length > 0 && (
                                            <div className="mt-8">
                                                <Caption className="text-functional-stone/70 mb-4 block">Vehicle Health Timeline</Caption>
                                                <div className="h-48 w-full bg-white/50 rounded-xl p-4 border border-solid border-functional-stone/20">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={healthHistory} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8C8C8C' }} tickMargin={10} />
                                                            <YAxis domain={['auto', 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8C8C8C' }} />
                                                            <Tooltip
                                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                                formatter={(value) => [`${value}%`, 'Health']}
                                                                labelStyle={{ color: '#8C8C8C', marginBottom: '4px' }}
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="health"
                                                                stroke="#3D8856"
                                                                strokeWidth={3}
                                                                dot={{ r: 4, fill: '#3D8856', strokeWidth: 2, stroke: '#FFFFFF' }}
                                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                                                animationDuration={1500}
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}

                                        {/* ML Feature Importance Chart (SHAP) */}
                                        {diagnosisResult.primary_stress_factors.length > 0 && (
                                            <div className="mt-8">
                                                <Caption className="text-functional-stone/70 mb-4 block">Primary SHAP Contributors</Caption>
                                                <div className="h-48 w-full bg-white/50 rounded-xl p-4 border border-solid border-functional-stone/20">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={diagnosisResult.primary_stress_factors.map((f, i) => ({ name: f, value: diagnosisResult.primary_stress_factors.length - i }))}
                                                            layout="vertical"
                                                            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                                                        >
                                                            <XAxis type="number" hide />
                                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#4b5563' }} width={90} axisLine={false} tickLine={false} />
                                                            <Tooltip cursor={{ fill: 'transparent' }} formatter={() => ['Factor Impact', 'Rank']} />
                                                            <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}

                                        {/* Prediction Trace Panel */}
                                        {diagnosisResult.input_features && (
                                            <div className="mt-8 border border-functional-stone/20 rounded-xl bg-white/70 p-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <Caption className="text-functional-stone/70">Prediction Trace</Caption>
                                                    <span className="text-xs bg-primary-clay/10 text-primary-clay px-2 py-1 rounded font-mono">Row: {diagnosisResult.source_row_index ?? 'Live'}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-primary-ink/70">
                                                    <div className="flex justify-between pr-4"><span>RPM:</span> <span>{Math.round(Number(diagnosisResult.input_features.rpm))}</span></div>
                                                    <div className="flex justify-between pl-4"><span>Oil P:</span> <span>{Number(diagnosisResult.input_features.oil_pressure).toFixed(1)}</span></div>
                                                    <div className="flex justify-between pr-4"><span>Fuel P:</span> <span>{Number(diagnosisResult.input_features.fuel_pressure).toFixed(1)}</span></div>
                                                    <div className="flex justify-between pl-4"><span>Coolant P:</span> <span>{Number(diagnosisResult.input_features.coolant_pressure).toFixed(1)}</span></div>
                                                    <div className="flex justify-between pr-4"><span>Oil T:</span> <span>{Math.round(Number(diagnosisResult.input_features.oil_temp))}°</span></div>
                                                    <div className="flex justify-between pl-4"><span>Coolant T:</span> <span>{Math.round(Number(diagnosisResult.input_features.coolant_temperature))}°</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Card className="bg-white border-accent-indigo/10 shadow-float p-8">
                                        <div className="mb-6 pb-6 border-b border-functional-mist">
                                            <div className="mb-4">
                                                <Caption className="text-functional-stone/70">Primary contributors</Caption>
                                            </div>
                                            <ul className="list-disc pl-5">
                                                {(diagnosisResult.primary_stress_factors || []).map((factor, idx) => (
                                                    <li key={idx} className="font-bold text-lg md:text-xl text-primary-ink mb-3">{factor.replace('_', ' ')}</li>
                                                ))}
                                            </ul>
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
                    </motion.div >
                )}

                {/* STEP 4: ACTION CONFIRMED (HUMAN APPROVED) */}
                {
                    step === STEPS.ACTION && (
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
                                <H1 className="text-4xl md:text-5xl">Confirmed</H1>
                                <Body className="text-lg text-functional-stone">
                                    You have approved the repair.
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
                    )
                }

            </AnimatePresence >
        </div >
    );
};

export default VehicleHealthFlow;

