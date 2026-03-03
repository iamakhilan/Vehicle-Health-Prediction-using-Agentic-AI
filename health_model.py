import time

VEHICLE_STATE = {}

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
    Progressively degrades health and keeps a historical record.
    engine_runtime acts as a usage_factor.
    """
    if vehicle_id not in VEHICLE_STATE:
        VEHICLE_STATE[vehicle_id] = {
            "health": 100.0,
            "stress_history": [],
            "last_update_timestamp": time.time(),
            "cumulative_runtime": 0.0,
            "cumulative_decay": 0.0
        }
    
    state = VEHICLE_STATE[vehicle_id]
    
    # Base decay percentage per unit stress
    decay_factor = 0.5 
    # Normalize runtime assuming 60 minutes is baseline
    usage_factor = max(0.1, engine_runtime / 60.0)
    
    decay = stress_index * decay_factor * usage_factor
    
    state["stress_history"].append(stress_index)
    if len(state["stress_history"]) > 10:
        state["stress_history"].pop(0)
        
    state["cumulative_runtime"] += max(0.1, engine_runtime)
    state["cumulative_decay"] += decay
    
    state["health"] = max(0.0, state["health"] - decay)
    state["last_update_timestamp"] = time.time()
    
    return state["health"]

def analyze_trend(vehicle_id):
    """
    Calculates stress slope to identify trends.
    """
    if vehicle_id not in VEHICLE_STATE:
        return "stable"
        
    history = VEHICLE_STATE[vehicle_id]["stress_history"]
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
    if vehicle_id not in VEHICLE_STATE:
        scaling_constant = 100
        return max(0, int(current_health * scaling_constant))
        
    state = VEHICLE_STATE[vehicle_id]
    
    if state["cumulative_decay"] > 0 and state["cumulative_runtime"] > 0:
        avg_decay_per_runtime = state["cumulative_decay"] / state["cumulative_runtime"]
        
        if avg_decay_per_runtime > 0:
            remaining = current_health / avg_decay_per_runtime
            return min(25000, max(0, int(remaining)))
            
    scaling_constant = 100
    return max(0, int(current_health * scaling_constant))


def determine_risk_level(health_score):
    if health_score >= 70:
        return "Low"
    elif health_score >= 40:
        return "Medium"
    else:
        return "High"
