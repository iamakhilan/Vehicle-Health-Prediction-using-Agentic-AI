/**
 * Application flow steps representing the vehicle health monitoring workflow
 * This simulates the multi-agent system architecture:
 * 
 * MONITOR -> Real-time sensor monitoring
 * ANOMALY -> Anomaly detection triggers investigation
 * DIAGNOSIS -> Agent-1 (AI Diagnostician) analyzes root cause via RAG
 * ACTION -> Agent-2 (Service Advisor) + Agent-3 (Scheduler) coordinate repair
 */
export const STEPS = {
    MONITOR: 'monitor',
    ANOMALY: 'anomaly',
    DIAGNOSIS: 'diagnosis',
    ACTION: 'action',
};
