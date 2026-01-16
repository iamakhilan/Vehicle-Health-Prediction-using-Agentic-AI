from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path to import agent1_diagnoser
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agent1_diagnoser import diagnose_to_json

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/diagnose', methods=['POST'])
def run_diagnosis():
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


if __name__ == '__main__':
    print("Starting Agent-1 API on port 5000...")
    app.run(port=5000, debug=True)
