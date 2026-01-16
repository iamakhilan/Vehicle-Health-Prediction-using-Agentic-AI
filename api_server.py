"""
Flask API Server for Vehicle Health Prediction System

Exposes three agent endpoints:
- Agent 1 (POST /diagnose): AI-based diagnostician using RAG + Ollama
- Agent 2 (POST /estimate): Rule-based service cost estimator  
- Agent 3 (POST /schedule): Rule-based appointment scheduler

All agents are deterministic except Agent 1, which uses AI only for
interpreting unstructured manual content.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path to import agent1_diagnoser
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agent1_diagnoser import diagnose_to_json

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# --- AGENT 1: DIAGNOSTICIAN (AI-based with RAG) ---

@app.route('/diagnose', methods=['POST'])
def run_diagnosis():
    """Agent 1: Diagnose vehicle issues using AI + service manual.
    
    Request body:
        {"alert": "Error Code P0300 with high engine vibration"}
    
    Response:
        {"diagnosis": {
            "Diagnosis": "...",
            "Cause": "...",
            "Recommended Fix": "...",
            "Reference": "...",
            "Confidence": "..."
        }}
    
    Error response:
        {"error": "error message"}, 400 or 500
    """
    data = request.json
    alert_text = data.get('alert', '')
    
    if not alert_text:
        return jsonify({"error": "No alert text provided"}), 400
    
    print(f"Received alert: {alert_text}")
    try:
        # Call the agent
        result = diagnose_to_json(alert_text)
        return jsonify({"diagnosis": result})
    except Exception as e:
        print(f"Error processing diagnosis: {e}")
        return jsonify({"error": str(e)}), 500

# --- AGENT 2: SERVICE ADVISOR (Rule-Based) ---

@app.route('/estimate', methods=['POST'])
def estimate_repair():
    """Agent 2: Estimate repair cost and time using deterministic rules.
    
    Request body:
        {"diagnosis": "engine misfire", "fix": "replace spark plugs"}
    
    Response:
        {
            "action": "Ignition Coil & Spark Plug Replacement",
            "parts": ["Spark Plugs (x4)", "Ignition Coil"],
            "labor_cost": "₹400",
            "parts_cost": "₹800",
            "total_cost": "₹1200",
            "estimated_time": "1 hour",
            "notes": "Includes diagnostic scan and test drive."
        }
    
    Falls back to "General Inspection" if no rule matches.
    """
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
    """Agent 3: Find next available service slot (deterministic).
    
    Logic: Returns next available weekday (Mon-Fri) at 10:00 AM,
    starting from tomorrow. Skips weekends automatically.
    
    Request body:
        {"duration": "1 hour"} (currently unused, reserved for future)
    
    Response:
        {
            "location": "Downtown Service Center",
            "next_slot": "Tuesday, 10:00 AM"
        }
    """
    now = datetime.now()
    
    # Start from tomorrow at 10 AM
    candidate = now + timedelta(days=1)
    candidate = candidate.replace(hour=10, minute=0, second=0, microsecond=0)
    
    # If candidate is Sat (5) or Sun (6), add days to reach Monday
    if candidate.weekday() == 5:  # Saturday
        candidate += timedelta(days=2)
    elif candidate.weekday() == 6:  # Sunday
        candidate += timedelta(days=1)
        
    formatted_slot = candidate.strftime("%A, %I:%M %p")
    
    return jsonify({
        "location": "Downtown Service Center",
        "next_slot": formatted_slot
    })


# --- HEALTH CHECK ENDPOINT ---

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify API is running.
    
    Response:
        {"status": "ok", "service": "Vehicle Health Prediction API"}
    """
    return jsonify({
        "status": "ok",
        "service": "Vehicle Health Prediction API"
    })


if __name__ == '__main__':
    print("=" * 60)
    print("Vehicle Health Prediction System - API Server")
    print("=" * 60)
    print("Agent 1 (Diagnostician): POST /diagnose")
    print("Agent 2 (Service Advisor): POST /estimate")
    print("Agent 3 (Scheduler): POST /schedule")
    print("Health Check: GET /health")
    print("=" * 60)
    print("Starting server on http://localhost:5000")
    print("=" * 60)
    app.run(port=5000, debug=True)
