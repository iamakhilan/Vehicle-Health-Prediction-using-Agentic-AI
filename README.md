# Vehicle Health Prediction - Production Baseline

A robust, full-stack predictive maintenance dashboard for vehicles. This is an upgraded baseline ready for scalable production use and eventual integration with real Machine Learning pipelines.

## Tech Stack
- Python
- Flask
- React
- XGBoost
- SQLite
- Pandas

## Project Architecture

```text
Telemetry Sensors
↓
Flask API
↓
XGBoost ML Model
↓
Prediction + Explanation
↓
React Dashboard
```

### 1. Frontend (React + Tailwind + Recharts)
- An immersive, interactive UI tracking vehicle health telemetry.
- Connects securely to the prediction APIs, handling dynamic state changes (monitoring -> anomaly -> diagnostics -> scheduling).
- Highly resilient to network failures with graceful error degradation.

### 2. Backend API (Flask)
- A strictly validated REST API providing predictive estimation workflows (`/predict`, `/estimate`, `/schedule`).
- Powered by a SQLite persistent database to securely save condition-based health history across restarts autonomously.

### 3. ML Pipeline Architecture
- Full Machine Learning Pipeline implemented in `backend/ml_pipeline/` for dataset ingestion, training, and predicting.
- Prediction relies on a trained XGBoost ML model (`model_xgb.pkl`) generated from `engine_data.csv`.

## Setup Instructions

### Backend
1. Create a virtual environment: `python -m venv venv`
2. Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Install dependencies: `pip install -r requirements.txt`
4. Run server: `python api_server.py`
*(Server runs on port 5000 by default. Set `FLASK_HOST`, `FLASK_PORT`, `FLASK_DEBUG` as env variables if needed)*

### Frontend
1. Install node dependencies: `npm install`
2. Start development server: `npm start`
3. View the dashboard at `localhost:3000`.

## Available Endpoints
- `GET /health` - API readiness probe detecting DB connection presence.
- `GET /vehicle-history/<vehicle_id>` - Retrieve historical timeline scores for plotting.
- `POST /predict` - Submits a telemetry package (RPM, load, temp, trim, DTC) to calculate stress and degrade condition health.
- `POST /estimate` - Receives predictive stress factors and risk to generate dynamic repair estimates.
- `POST /schedule` - Estimates the next available calendar slot based on the repair type.

## Production Hardening Checklist
- [x] Stricter request payload validation with 400 exits.
- [x] Python structured logging capturing runtime errors and status codes.
- [x] Persistent SQLite data layer allowing threaded access without data loss.
- [x] Removal of all debug=True triggers defaults.
- [x] UI gracebacks preventing freezes when API goes offline.
- [x] Clear backend isolation mapped in `backend/` and `tests/`.

## Known Limitations
1. As stated, true predictive diagnostics are simulated heavily by linear heuristics right now.
2. The SQLite configuration assumes local filesystem persistence.
3. Schedule slots are determined by simple date-shifting rules rather than a true backing calendar API.
