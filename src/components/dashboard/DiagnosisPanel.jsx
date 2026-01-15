import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle, ArrowRight, Wrench, Zap } from 'lucide-react';
// Assuming Button is available
import Button from '../ui/Button';

const DiagnosisPanel = ({ step, onDiagnose, onRepair, onDismiss, isProcessing, diagnosisData }) => {
    const isVisible = step !== 'monitor';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "tween", ease: "circOut", duration: 0.4 }}
                    className="h-full w-full bg-surface border-l border-border flex flex-col p-8 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-10">
                        <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">System Alert</span>
                        <button onClick={onDismiss} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {step === 'anomaly' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="h-16 w-16 rounded-2xl bg-functional-error/10 flex items-center justify-center text-functional-error mb-6">
                                    <AlertTriangle size={32} />
                                </div>
                                <h2 className="text-2xl font-semibold text-white mb-2">Anomaly Detected</h2>
                                <p className="text-zinc-400 leading-relaxed mb-8">
                                    Irregular vibration signatures detected in the primary drive unit. Performance may be limited.
                                </p>

                                <button
                                    onClick={onDiagnose}
                                    className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 mb-3"
                                >
                                    Run Diagnostics <ArrowRight size={16} />
                                </button>
                                <button
                                    onClick={onDismiss}
                                    className="w-full py-4 text-zinc-500 hover:text-zinc-300 transition-colors text-sm font-medium"
                                >
                                    Ignore Warning
                                </button>
                            </div>
                        )}

                        {step === 'diagnosis' && (
                            <div className="animate-in fade-in duration-500">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center justify-center h-64 opacity-50">
                                        <Zap size={32} className="text-zinc-400 mb-4 animate-pulse" />
                                        <p className="text-sm font-mono text-zinc-500">Analyzing telemetry...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 text-functional-success mb-2">
                                            <div className="w-2 h-2 rounded-full bg-functional-success" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Analysis Complete</span>
                                        </div>

                                        <h2 className="text-xl font-medium text-white pb-6 border-b border-border">
                                            {diagnosisData.fault}
                                        </h2>

                                        <div className="grid grid-cols-2 gap-8 py-4">
                                            <div>
                                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Root Cause</div>
                                                <div className="text-zinc-200">{diagnosisData.cause}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Est. RUL</div>
                                                <div className="text-zinc-200 font-mono">{diagnosisData.rul}</div>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-800/50 rounded-lg p-5 border border-zinc-content-subtle mt-4">
                                            <div className="flex gap-4">
                                                <Wrench size={20} className="text-zinc-400 mt-1" />
                                                <div>
                                                    <div className="text-sm font-medium text-white mb-1">Recommended Action</div>
                                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                                        Immediate replacement suggested. Schedule via nearby service center.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={onRepair}
                                            className="w-full mt-6 py-4 bg-functional-success text-white font-semibold rounded-lg hover:bg-functional-success/90 transition-colors"
                                        >
                                            Schedule Service
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'action' && (
                            <div className="text-center animate-in fade-in zoom-in-95 duration-500 mt-20">
                                <div className="h-20 w-20 mx-auto rounded-full bg-functional-success/20 flex items-center justify-center text-functional-success mb-6">
                                    <CheckCircle size={40} />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Service Scheduled</h3>
                                <p className="text-zinc-500 mb-8 max-w-[200px] mx-auto">
                                    Your vehicle log has been updated. Code #8821.
                                </p>
                                <button onClick={onDismiss} className="text-sm text-white border-b border-white/20 pb-0.5 hover:border-white transition-colors">
                                    Return to Overview
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DiagnosisPanel;
