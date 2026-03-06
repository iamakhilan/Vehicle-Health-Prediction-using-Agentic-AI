import json
from backend import database

def calculate_stress_index(norm_features):
    """
    Computes a stress index (0 to 1) using a weighted combination.
    """
    weights = {
        'norm_dtc': 0.35,
        'norm_temp': 0.25,
        'norm_load': 0.15,
        'norm_rpm': 0.10,
        'norm_trim': 0.10,
        'norm_throttle': 0.05
    }
    
    stress = sum(norm_features.get(k, 0) * w for k, w in weights.items())
    return min(1.0, max(0.0, stress))

def process_vehicle_health(vehicle_id, stress_index, engine_runtime=60.0):
    """
    Progressively degrades health and keeps a historical record in SQLite.
    engine_runtime acts as a usage_factor.
    """
    state_row = database.get_vehicle_state(vehicle_id)
    
    if not state_row:
        # Default initialization
        health = 100.0
        cumulative_runtime = 0.0
        cumulative_decay = 0.0
        stress_history_list = []
    else:
        health = state_row['health_score']
        cumulative_runtime = state_row['cumulative_runtime']
        cumulative_decay = state_row['cumulative_decay']
        try:
            stress_history_list = json.loads(state_row['stress_history'])
        except (json.JSONDecodeError, TypeError):
            stress_history_list = []
    
    # Recalibrated Base decay percentage per unit stress (Increased to make degradation more noticeable)
    decay_factor = 2.0 
    
    # Normalize runtime assuming 60 minutes is baseline
    usage_factor = max(0.1, engine_runtime / 60.0)
    
    decay = stress_index * decay_factor * usage_factor
    
    stress_history_list.append(stress_index)
    if len(stress_history_list) > 10:
        stress_history_list.pop(0)
        
    health = max(0.0, health - decay)
    
    database.update_vehicle_state(vehicle_id, health, max(0.1, engine_runtime), decay, stress_history_list)
    return health

def analyze_trend(vehicle_id):
    """
    Calculates stress slope to identify trends.
    """
    state_row = database.get_vehicle_state(vehicle_id)
    if not state_row:
        return "stable"
        
    try:
        history = json.loads(state_row['stress_history'])
    except (json.JSONDecodeError, TypeError):
        history = []
        
    if len(history) < 2:
        return "stable"
        
    # basic slope of recent history
    slope = history[-1] - history[0]
    
    if slope > 0.05:
        return "deteriorating"
    elif slope < -0.05:
        return "improving"
    else:
        return "stable"

def estimate_remaining_distance(vehicle_id, current_health):
    """
    Dynamic estimation of distance until major service.
    """
    state_row = database.get_vehicle_state(vehicle_id)
    scaling_constant = 100
    
    if not state_row:
        return max(0, int(current_health * scaling_constant))
        
    cumulative_decay = state_row['cumulative_decay']
    cumulative_runtime = state_row['cumulative_runtime']
    
    if cumulative_decay > 0 and cumulative_runtime > 0:
        avg_decay_per_runtime = cumulative_decay / cumulative_runtime
        
        if avg_decay_per_runtime > 0:
            # We divide by avg_decay_per_runtime to know how many more runtimes we can sustain, 
            # and multiply by 50 to estimate distance covered per runtime cycle.
            remaining = (current_health / avg_decay_per_runtime) * 50
            return min(25000, max(0, int(remaining)))
            
    return max(0, int(current_health * scaling_constant))


def determine_risk_level(health_score):
    if health_score >= 80:
        return "Low"
    elif health_score >= 50:
        return "Medium"
    else:
        return "High"
