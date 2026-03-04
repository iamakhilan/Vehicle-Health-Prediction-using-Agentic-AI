from flask import Flask, request, jsonify
from flask_cors import CORS

from backend import feature_engineering
from backend import health_model
from backend import explanation_engine

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# --- AGENT 2: SERVICE ADVISOR (Rule-Based) ---
@app.route('/estimate', methods=['POST'])
def estimate_repair():
    data = request.json
    diagnosis = data.get('diagnosis', '').lower()
    fix = data.get('fix', '').lower()
    
    # Deterministic Rule Table
    # Keys are keywords to search in diagnosis or fix
    rules = {
        "misfire": {
            "action": "Ignition Coil & Spark Plug Replacement",
            "parts": ["Spark Plugs (x4)", "Ignition Coil"],
            "labor_cost": "₹400",
            "parts_cost": "₹800",
            "total_cost": "₹1200",
            "estimated_time": "1 hour",
            "notes": "Includes diagnostic scan and test drive."
        },
        "battery": {
            "action": "Battery Replacement",
            "parts": ["12V AGM Battery"],
            "labor_cost": "₹200",
            "parts_cost": "₹3500",
            "total_cost": "₹3700",
            "estimated_time": "30 mins",
            "notes": "Includes alternator check."
        },
        "brake": {
            "action": "Brake Pad Replacement",
            "parts": ["Front Brake Pads", "Wear Sensor"],
            "labor_cost": "₹600",
            "parts_cost": "₹2200",
            "total_cost": "₹2800",
            "estimated_time": "1.5 hours",
            "notes": "Includes rotor inspection."
        },
        "coolant": {
            "action": "Coolant Flush & Top-up",
            "parts": ["Coolant Fluid (2L)"],
            "labor_cost": "₹300",
            "parts_cost": "₹500",
            "total_cost": "₹800",
            "estimated_time": "45 mins",
            "notes": "Includes pressure test."
        }
    }
    
    # Default fallback
    estimation = {
        "action": "General Inspection",
        "parts": ["Diagnostic Fee"],
        "labor_cost": "₹500",
        "parts_cost": "₹0",
        "total_cost": "₹500",
        "estimated_time": "1 hour",
        "notes": "Standard diagnostic fee applies."
    }
    
    # Find matching rule
    combined_text = f"{diagnosis} {fix}"
    for keyword, rule in rules.items():
        if keyword in combined_text:
            estimation = rule
            break
            
    return jsonify(estimation)

# --- AGENT 3: SCHEDULER (Rule-Based) ---
from datetime import datetime, timedelta

@app.route('/schedule', methods=['POST'])
def schedule_service():
    # Logic: Find next available slot (Mon-Fri, 9am-5pm)
    now = datetime.now()
    
    # Start checking from tomorrow 9 AM if it's already late, or just next hour
    # For simplicity/stability: Start checking from "tomorrow 10 AM" to simulate realistic scheduling
    # relative to the current time.
    
    candidate = now + timedelta(days=1)
    
    # Set to 10 AM
    candidate = candidate.replace(hour=10, minute=0, second=0, microsecond=0)
    
    # If candidate is Sat (5) or Sun (6), add days to reach Monday
    if candidate.weekday() == 5: # Saturday
        candidate += timedelta(days=2)
    elif candidate.weekday() == 6: # Sunday
        candidate += timedelta(days=1)
        
    formatted_slot = candidate.strftime("%A, %I:%M %p")
    
    return jsonify({
        "location": "Downtown Service Center",
        "next_slot": formatted_slot
    })


# --- NEW: VEHICLE HEALTH HISTORY ---
VEHICLE_HISTORY = {}

@app.route('/vehicle-history/<vehicle_id>', methods=['GET'])
def get_vehicle_history(vehicle_id):
    history = VEHICLE_HISTORY.get(vehicle_id, [])
    return jsonify(history)


# --- NEW: CONDITION-BASED PREDICTION API ---
@app.route('/predict', methods=['POST'])
def predict_health():
    data = request.json or {}
    
    vehicle_id = data.get('vehicle_id', 'car1')
    engine_runtime = float(data.get('engine_runtime', 60.0))
    
    # Feature Engineering
    norm_features = feature_engineering.normalize_features(data)
    
    # Models
    stress_index = health_model.calculate_stress_index(norm_features)
    health_score = health_model.process_vehicle_health(vehicle_id, stress_index, engine_runtime)
    trend = health_model.analyze_trend(vehicle_id)
    remaining_km = health_model.estimate_remaining_distance(vehicle_id, health_score)
    risk_level = health_model.determine_risk_level(health_score)
    
    # Explanation
    primary_stress_factors = explanation_engine.generate_explanations(norm_features)
    
    # Store history
    if vehicle_id not in VEHICLE_HISTORY:
        VEHICLE_HISTORY[vehicle_id] = []
        
    current_time = datetime.now().strftime("%H:%M")
    
    VEHICLE_HISTORY[vehicle_id].append({
        "time": current_time,
        "health": round(health_score, 1)
    })
    
    # Keep only last 50 records
    if len(VEHICLE_HISTORY[vehicle_id]) > 50:
        VEHICLE_HISTORY[vehicle_id] = VEHICLE_HISTORY[vehicle_id][-50:]
    
    return jsonify({
        "vehicle_id": vehicle_id,
        "health_score": round(health_score, 1),
        "remaining_km": remaining_km,
        "risk_level": risk_level,
        "trend": trend,
        "primary_stress_factors": primary_stress_factors,
        "stress_index": round(stress_index, 3)
    })

if __name__ == '__main__':
    print("Vehicle Health API running at:")
    print("http://127.0.0.1:5000")
    print("http://10.12.194.189:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
