/**
 * Agent-2: Rule-based Service Advisor
 * 
 * In production:
 * - Uses deterministic rules for cost and time estimation
 * - Provides explainable, business-critical decisions
 * - No AI/ML - purely rule-based for reliability and auditability
 * 
 * This is a simulation that applies predefined service rules.
 */

import { SERVICE_RECOMMENDATION } from '../../constants/mockData';

/**
 * Determines service recommendation based on diagnosis
 * @param {Object} diagnosis - Diagnosis from Agent-1
 * @returns {Object} Service recommendation with action, cost, and time estimates
 */
export const getServiceRecommendation = (diagnosis) => {
    // In production, this would:
    // 1. Match diagnosis to service catalog
    // 2. Calculate cost based on parts + labor rules
    // 3. Estimate time based on repair complexity
    // 4. Apply business rules and constraints
    
    // For now, return mock recommendation
    // In real system, this would have fallback rules for unknown faults
    return SERVICE_RECOMMENDATION;
};
