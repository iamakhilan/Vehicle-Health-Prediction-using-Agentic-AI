import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import pandas as pd
from pathlib import Path
import json

from backend import feature_engineering
from backend import health_model
from backend import explanation_engine
from backend import database

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Global singletons to prevent disk I/O per request
data_path = Path(__file__).parent / 'backend' / 'ml_pipeline' / 'data' / 'engine_data.csv'
try:
    telemetry_dataset = pd.read_csv(data_path)
    logger.info(f"Loaded telemetry dataset with {len(telemetry_dataset)} rows")
except Exception as e:
    logger.error(f"Failed to load dataset: {e}")
    telemetry_dataset = pd.DataFrame()

rules_path = Path(__file__).parent / 'backend' / 'config' / 'repair_rules.json'
try:
    with open(rules_path) as f:
        REPAIR_RULES = json.load(f)
    logger.info(f"Loaded {len(REPAIR_RULES)} repair rules configuration")
except Exception as e:
    logger.error(f"Failed to load repair rules: {e}")
    REPAIR_RULES = {}

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/health', methods=['GET'])
def health_check():
    """Readiness and liveness probe."""
    try:
        # Check DB connection
        conn = database.get_connection()
        conn.cursor().execute("SELECT 1")
        conn.close()
        return jsonify({"status": "ready", "database": "connected"}), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({"status": "unhealthy", "error": str(e)}), 503

@app.route('/predict', methods=['POST'])
def predict_health():
    """Condition-based prediction API with validation."""
    if not request.is_json:
        logger.warning("/predict called without JSON body")
        return jsonify({"error": "Request body must be JSON"}), 400
        
    data = request.json or {}
    
    # Validation
    required_fields = ['vehicle_id']
    for field in required_fields:
        if field not in data or not data[field]:
            logger.warning(f"/predict validation failed: Missing '{field}'")
            return jsonify({"error": f"Missing required field: '{field}'"}), 400
            
    vehicle_id = data.get('vehicle_id')
    
    try:
        engine_runtime = float(data.get('engine_runtime', 60.0))
        if engine_runtime <= 0:
            raise ValueError("Engine runtime must be positive")
    except ValueError as e:
        return jsonify({"error": f"Invalid engine_runtime: {str(e)}"}), 400
    
    try:
        # Phase 4 & 8: ML prediction with fallback
        from backend.ml_pipeline.predict_model import predict_vehicle_health
        
        predicted_label, failure_probability, top_features = predict_vehicle_health(data)
        
        if failure_probability < 0.3:
            risk_level = "LOW"
        elif failure_probability <= 0.7:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"
            
        explanation = f"{risk_level.capitalize()} risk of engine failure due to abnormal {top_features[0].lower()} and {top_features[1].lower()}."
        
        database.update_vehicle_state_ml(vehicle_id, predicted_label, failure_probability)
        
        health_score_proxy = (1.0 - failure_probability) * 100
        current_time = datetime.now().strftime("%H:%M")
        database.add_history_record(vehicle_id, current_time, round(health_score_proxy, 1))
        
        response_data = {
            "vehicle_id": vehicle_id,
            "predicted_label": int(predicted_label),
            "failure_probability": float(failure_probability),
            "risk_level": risk_level,
            "explanation": explanation,
            # Legacy fields for API contract
            "health_score": round(health_score_proxy, 1),
            "remaining_km": "N/A",
            "trend": "Stable" if predicted_label == 1 else "Degrading",
            "primary_stress_factors": top_features,
            "stress_index": float(failure_probability)
        }
        logger.info(f"ML Prediction successful for {vehicle_id}. Prob: {failure_probability}")
        return jsonify(response_data), 200
        
    except Exception as ml_err:
        logger.warning(f"ML Model failed: {ml_err}. Falling back to rule-based system.")
        try:
            # Fallback to rule-based logic
            norm_features = feature_engineering.normalize_features(data)
            stress_index = health_model.calculate_stress_index(norm_features)
            health_score = health_model.process_vehicle_health(vehicle_id, stress_index, engine_runtime)
            trend = health_model.analyze_trend(vehicle_id)
            remaining_km = health_model.estimate_remaining_distance(vehicle_id, health_score)
            risk_level = health_model.determine_risk_level(health_score)
            primary_stress_factors = explanation_engine.generate_explanations(norm_features)
            
            current_time = datetime.now().strftime("%H:%M")
            database.add_history_record(vehicle_id, current_time, round(health_score, 1))
            
            response_data = {
                "vehicle_id": vehicle_id,
                "health_score": round(health_score, 1),
                "remaining_km": remaining_km,
                "risk_level": risk_level,
                "trend": trend,
                "primary_stress_factors": primary_stress_factors,
                "stress_index": round(stress_index, 3)
            }
            logger.info(f"Rule-based fallback successful for {vehicle_id}. Health: {response_data['health_score']}")
            return jsonify(response_data), 200
            
        except Exception as e:
            logger.error(f"Prediction logic error for {vehicle_id}: {str(e)}", exc_info=True)
            return jsonify({"error": "Internal server error during prediction"}), 500

@app.route('/estimate', methods=['POST'])
def estimate_repair():
    """Service Advisor estimation using rule-driven ML outputs."""
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON"}), 400
        
    data = request.json or {}
    stress_factors = data.get('stress_factors', [])
    risk_level = data.get('risk_level', 'Low')
    
    if not isinstance(stress_factors, list):
        return jsonify({"error": "'stress_factors' must be a list"}), 400
    
    # Phase 3: Rule Configuration Driven Repair Estimation
    # Loop through the top features provided by SHAP
    for feature in stress_factors:
        if feature in REPAIR_RULES:
            estimation = REPAIR_RULES[feature]
            logger.info(f"Generated estimate using matching rule for '{feature}'")
            return jsonify({
                "action": estimation.get("action"),
                "parts": estimation.get("parts"),
                "labor_cost": f"₹{int(estimation.get('cost', 0) * 0.3)}",
                "parts_cost": f"₹{int(estimation.get('cost', 0) * 0.7)}",
                "total_cost": f"₹{estimation.get('cost', 0)}",
                "estimated_time": estimation.get("time"),
                "notes": estimation.get("notes")
            }), 200

    # Fallback default behavior if no rules matched
    logger.info(f"No specific rule matched for factors: {stress_factors}. Using default.")
    return jsonify({
        "action": "Routine inspection recommended",
        "parts": ["Diagnostic Check"],
        "labor_cost": "₹500",
        "parts_cost": "₹0",
        "total_cost": "₹500",
        "estimated_time": "1 hour",
        "notes": "Standard diagnostic and vehicle checkover."
    }), 200

@app.route('/schedule', methods=['POST'])
def schedule_service():
    """Finds next available slot."""
    if request.content_type and 'application/json' in request.content_type:
        data = request.json or {}
        # Validate that if duration is provided, it's a string
        duration = data.get('duration')
        if duration and not isinstance(duration, str):
            return jsonify({"error": "'duration' must be a string"}), 400
            
    now = datetime.now()
    candidate = now + timedelta(days=1)
    
    # Set to 10 AM
    candidate = candidate.replace(hour=10, minute=0, second=0, microsecond=0)
    
    # If Sat/Sun, shift to Monday
    if candidate.weekday() == 5:
        candidate += timedelta(days=2)
    elif candidate.weekday() == 6:
        candidate += timedelta(days=1)
        
    formatted_slot = candidate.strftime("%A, %I:%M %p")
    
    logger.info(f"Scheduled service at {formatted_slot}")
    return jsonify({
        "location": "Downtown Service Center",
        "next_slot": formatted_slot
    }), 200

@app.route('/vehicle-history/<vehicle_id>', methods=['GET'])
def get_vehicle_history(vehicle_id):
    """Retrieve persistent history."""
    if not vehicle_id:
        return jsonify({"error": "Vehicle ID is required"}), 400
        
    try:
        history = database.get_vehicle_history(vehicle_id)
        return jsonify(history), 200
    except Exception as e:
        logger.error(f"Error fetching history for {vehicle_id}: {e}")
        return jsonify({"error": "Failed to fetch history"}), 500

@app.route('/simulated-data', methods=['GET'])
def simulated_data():
    """Load playback row from globally loaded dataset to simulate real streaming."""
    if telemetry_dataset.empty:
        return jsonify({"error": "Dataset unavailable"}), 503
        
    try:
        index_param = request.args.get('index', '0')
        index = int(index_param)
        
        # Safe looping mechanism utilizing modulo to handle arbitrary numbers
        safe_index = index % len(telemetry_dataset)
        row = telemetry_dataset.iloc[safe_index]
        next_index = (safe_index + 1) % len(telemetry_dataset)
        
        mapped_row = {
            "rpm": row.get("Engine rpm", 0),
            "oil_pressure": row.get("Lub oil pressure", 0),
            "fuel_pressure": row.get("Fuel pressure", 0),
            "coolant_pressure": row.get("Coolant pressure", 0),
            "oil_temp": row.get("lub oil temp", 0),
            "coolant_temperature": row.get("Coolant temp", 0)
        }
        
        return jsonify({
            "telemetry": mapped_row,
            "next_index": next_index
        }), 200
        
    except ValueError:
        return jsonify({"error": "Index must be an integer"}), 400
    except Exception as e:
        logger.error(f"Error fetching simulated dataset playback at index {index_param}: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Use environment variables for secure production config defaults
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    host = os.environ.get("FLASK_HOST", "0.0.0.0")
    port = int(os.environ.get("FLASK_PORT", 5000))
    
    logger.info(f"Starting Vehicle Health API. Debug: {debug_mode}, Binding: {host}:{port}")
    app.run(host=host, port=port, debug=debug_mode)
