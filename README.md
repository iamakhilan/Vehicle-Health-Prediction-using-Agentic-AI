# Vehicle Health Prediction System v2.0

An intelligent multi-agent system for vehicle diagnostics, repair estimation, and service scheduling. Combines AI-powered diagnostics with deterministic business logic to provide transparent, explainable vehicle health management.

## 🎯 System Overview

This system demonstrates a **human-in-the-loop agentic architecture** where:
- **AI is used only where reasoning over unstructured data is required** (Agent 1: Diagnostician)
- **Business-critical decisions remain deterministic and explainable** (Agents 2 & 3)
- **Human approval is the final authority** for all repair actions

### Agent Architecture

#### Agent 0: Sensor Monitor (Simulated)
- Monitors real-time vehicle telemetry (142 sensors)
- Detects anomalies in engine temperature, vibration, battery, etc.
- Triggers alerts when thresholds are exceeded

#### Agent 1: AI Diagnostician 🤖
- **Type:** AI-based (Local RAG using FAISS + Ollama)
- **Model:** Gemma3:1b for diagnosis generation
- **Embeddings:** nomic-embed-text for semantic search
- **Purpose:** Interprets error codes and symptoms using service manual context
- **Output:** Structured diagnosis (fault, cause, fix, reference, confidence)

#### Agent 2: Service Advisor 📋
- **Type:** Rule-based (Deterministic)
- **Purpose:** Estimates repair cost, parts, labor, and time
- **Logic:** Keyword matching against predefined repair rules
- **Fallback:** "General Inspection" when no rule matches

#### Agent 3: Scheduler 📅
- **Type:** Rule-based (Deterministic)
- **Purpose:** Finds next available service appointment
- **Logic:** Returns next weekday (Mon-Fri) at 10:00 AM, skips weekends

#### Human Approval ✅
- Reviews diagnosis, cost estimate, and schedule
- Final authority to approve or decline repair

## 🏗️ Technology Stack

### Backend
- **Python 3.x** - Backend logic
- **Flask** - REST API server
- **LangChain** - RAG orchestration
- **Ollama** - Local LLM inference (Gemma3:1b)
- **FAISS** - Vector database for semantic search
- **PyPDF** - Service manual parsing

### Frontend
- **React 19** - UI framework
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📋 Prerequisites

Before running the system, ensure you have:

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **Ollama** installed and running locally
   - Install from: https://ollama.ai
   - Pull required models:
     ```bash
     ollama pull gemma3:1b
     ollama pull nomic-embed-text
     ```
4. Service manual PDF placed in `data/` directory

## 🚀 Setup & Installation

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Build the FAISS index** (one-time setup):
   ```bash
   python rag/build_index.py
   ```
   This processes the service manual PDF and creates a searchable vector index.

3. **Start the Flask API server:**
   ```bash
   python api_server.py
   ```
   Server will start on `http://localhost:5000`

### Frontend Setup

1. **Install Node dependencies:**
   ```bash
   npm install
   ```

2. **Start the React development server:**
   ```bash
   npm start
   ```
   Application will open at `http://localhost:3000`

## 🔧 API Endpoints

### GET `/health`
Health check endpoint
```json
Response: {"status": "ok", "service": "Vehicle Health Prediction API"}
```

### POST `/diagnose`
Agent 1: AI-based diagnosis
```json
Request: {"alert": "Error Code P0300 with high engine vibration"}
Response: {
  "diagnosis": {
    "Diagnosis": "Engine Misfire",
    "Cause": "Worn spark plug in Cylinder 4",
    "Recommended Fix": "Replace spark plugs",
    "Reference": "Page 6",
    "Confidence": "0.85"
  }
}
```

### POST `/estimate`
Agent 2: Repair cost estimation
```json
Request: {"diagnosis": "engine misfire", "fix": "replace spark plugs"}
Response: {
  "action": "Ignition Coil & Spark Plug Replacement",
  "parts": ["Spark Plugs (x4)", "Ignition Coil"],
  "labor_cost": "₹400",
  "parts_cost": "₹800",
  "total_cost": "₹1200",
  "estimated_time": "1 hour",
  "notes": "Includes diagnostic scan and test drive."
}
```

### POST `/schedule`
Agent 3: Service scheduling
```json
Request: {"duration": "1 hour"}
Response: {
  "location": "Downtown Service Center",
  "next_slot": "Tuesday, 10:00 AM"
}
```

## 🎨 User Flow

1. **Monitor Dashboard** - View real-time sensor telemetry
2. **Anomaly Detection** - System alerts on detected issues
3. **Run Diagnostics** - Trigger Agent 1 to analyze the problem
4. **Review Plan** - See diagnosis, cost estimate, and available slots
5. **Approve/Decline** - Make final decision on proposed repair
6. **Confirmation** - Receive appointment details

## 📁 Project Structure

```
├── agent1_diagnoser.py      # Agent 1: AI Diagnostician
├── api_server.py             # Flask API with all 3 agent endpoints
├── requirements.txt          # Python dependencies
├── rag/
│   ├── build_index.py        # FAISS index builder
│   ├── load_pdf.py           # PDF loader
│   └── query_manual.py       # RAG query module
├── data/
│   └── Corolla E11 Haynes Workshop Manual.pdf
├── src/
│   ├── views/
│   │   └── VehicleHealthFlow.jsx  # Main UI orchestrator
│   ├── components/
│   │   └── ui/               # Reusable UI components
│   ├── App.js
│   └── index.js
└── package.json              # Node.js dependencies
```

## 🧪 Testing

### Test Backend
```bash
# Test API health
curl http://localhost:5000/health

# Test diagnosis endpoint
curl -X POST http://localhost:5000/diagnose \
  -H "Content-Type: application/json" \
  -d '{"alert": "Error Code P0300"}'
```

### Test Frontend
1. Open browser to `http://localhost:3000`
2. Click "Simulate Sensor Anomaly"
3. Click "Run Diagnostics"
4. Verify all agents complete successfully
5. Test approval flow

## 🔐 Security & Privacy

- All AI inference runs **locally** using Ollama (no data sent to cloud)
- Service manual stays on your machine
- No external API calls for diagnostics
- Deterministic logic for cost-sensitive decisions

## ⚙️ Configuration

### Customizing Repair Rules (Agent 2)
Edit the `rules` dictionary in `api_server.py` to add/modify repair estimates:
```python
rules = {
    "keyword": {
        "action": "Repair Action Name",
        "parts": ["Part 1", "Part 2"],
        "labor_cost": "₹XXX",
        "parts_cost": "₹XXX",
        "total_cost": "₹XXX",
        "estimated_time": "X hours",
        "notes": "Additional information"
    }
}
```

### Customizing Service Manual
1. Replace PDF in `data/` directory
2. Update path in `rag/load_pdf.py` if needed
3. Rebuild FAISS index: `python rag/build_index.py`

## 🤝 Contributing

This is a demonstration project showcasing agentic AI architecture principles. Contributions that maintain the core design philosophy are welcome.

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 🙏 Acknowledgments

- Service manual: Haynes Workshop Manual (Toyota Corolla E11)
- LLM: Gemma3 by Google (via Ollama)
- Embeddings: nomic-embed-text by Nomic AI
- UI Framework: React and Tailwind CSS
