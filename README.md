# Vehicle Health Prediction

> Predict engine health from real-time sensor telemetry — served through a REST API, visualised in a React dashboard, and deployable as a native Android app.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![XGBoost](https://img.shields.io/badge/ML-XGBoost-orange?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/API-Flask-lightgrey?logo=flask&logoColor=black)
![Capacitor](https://img.shields.io/badge/Android-Capacitor-119EFF?logo=capacitor&logoColor=white)
![License](https://img.shields.io/badge/License-TODO-green)

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Tech Stack](#tech-stack)
6. [Quick Start](#quick-start)
7. [Installation](#installation)
8. [Running the Project](#running-the-project)
9. [Android Build / Run](#android-build--run)
10. [ML Workflow](#ml-workflow)
11. [API Endpoints](#api-endpoints)
12. [Testing](#testing)
13. [Configuration & Environment Variables](#configuration--environment-variables)
14. [Troubleshooting](#troubleshooting)
15. [Roadmap](#roadmap)
16. [Contributing](#contributing)
17. [License](#license)
18. [Acknowledgements](#acknowledgements)

---

## Overview

**Vehicle Health Prediction** is a full-stack predictive-maintenance system that ingests engine sensor data (RPM, oil pressure, fuel pressure, coolant pressure, oil temperature, coolant temperature) and classifies engine condition as healthy or faulty using a trained XGBoost model.

Predictions are surfaced through a validated Flask REST API, consumed by a React dashboard (with animated charts and progressive state transitions), and packaged as a native Android app via Capacitor. A SHAP explainer identifies and returns the top contributing sensor features for every prediction.

---

## Features

- **ML-powered engine health classification** — XGBoost binary classifier trained on `engine_data.csv`; 80/20 stratified train/test split
- **SHAP explainability** — top-3 contributing features returned per prediction request
- **Stress index scoring** — weighted OBD telemetry normalization mapping sensor readings to a 0–1 stress scale
- **Progressive health decay** — cumulative runtime-adjusted health degradation persisted per vehicle in SQLite
- **Trend analysis** — per-vehicle stress-slope tracking (Stable / Degrading / Improving)
- **Validated REST API** — strict field validation, typed error responses, CORS-enabled for the React client
- **React dashboard** — real-time telemetry charts (Recharts), animated state machine (Framer Motion), responsive Tailwind CSS UI
- **Android app** — Capacitor-wrapped React build targeting Android; live-reload dev mode supported
- **Simulated data feed** — `/simulated-data` endpoint streams rows from `engine_data.csv` for demo/testing without a real OBD device
- **Comprehensive test suite** — pytest with temp-DB isolation, API contract tests, edge-case unit tests

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Layer                      │
│   React Dashboard (src/)   │   Android App (android/)│
│   Recharts · Framer Motion · Tailwind · Capacitor   │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP / JSON
┌───────────────────▼─────────────────────────────────┐
│              Flask REST API (api_server.py)          │
│  /predict  /estimate  /schedule  /vehicle-history   │
│  /simulated-data  /health                           │
└──────┬──────────────────────────┬────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────────────────┐
│   Backend   │          │       ML Pipeline            │
│  Modules    │          │  backend/ml_pipeline/        │
│             │          │                              │
│ feature_    │          │  dataset_loader.py           │
│ engineering │          │  train.py (XGBClassifier)    │
│             │          │  predict_model.py + SHAP     │
│ health_     │          │  feature_config.json         │
│ model       │          │  model_xgb.pkl (generated)   │
│             │          └──────────────────────────────┘
│ explanation_│
│ engine      │          ┌──────────────────────────────┐
│             │          │        SQLite Database        │
│ database    ├─────────►│  vehicles · health_history   │
└─────────────┘          └──────────────────────────────┘
```

### Backend Modules (`backend/`)

| Module | Responsibility |
|---|---|
| `feature_engineering.py` | Parses raw OBD telemetry; normalises RPM, load, coolant temp, throttle, fuel trim, DTC flag to 0–1 stress scale |
| `health_model.py` | Computes weighted stress index; applies runtime-adjusted decay to vehicle health score; trend analysis; remaining-distance estimation |
| `explanation_engine.py` | Rule-based human-readable explanation generator for top stress contributors |
| `database.py` | SQLite DAL — vehicles state, health history, per-vehicle stress history (JSON column) |

### ML Pipeline (`backend/ml_pipeline/`)

| File | Role |
|---|---|
| `dataset_loader.py` | Loads `engine_data.csv`, selects 6 feature columns + target |
| `train.py` | Trains XGBClassifier (200 estimators, depth 6, lr 0.05); saves `model_xgb.pkl` + feature importance plot |
| `predict_model.py` | Loads trained model at startup; maps API field names → dataset column names; runs SHAP TreeExplainer for top-3 features |
| `feature_config.json` | Feature mapping: API keys → dataset column names; single source of truth |

---

## Project Structure

```
Vehicle-Health-Prediction-using-Agentic-AI/
│
├── api_server.py                  # Flask app entrypoint
├── requirements.txt               # Python dependencies
├── package.json                   # Node dependencies & scripts
├── capacitor.config.ts            # Capacitor / Android config
├── tailwind.config.js
├── postcss.config.js
│
├── backend/                       # Python backend modules
│   ├── __init__.py
│   ├── feature_engineering.py
│   ├── health_model.py
│   ├── explanation_engine.py
│   ├── database.py
│   ├── config/
│   │   └── repair_rules.json      # Rule-based repair action map
│   └── ml_pipeline/
│       ├── dataset_loader.py
│       ├── train.py
│       ├── predict_model.py
│       ├── feature_config.json    # API key ↔ dataset column mapping
│       ├── feature_columns.json   # Generated column list
│       ├── model_xgb.pkl          # Trained model (generated)
│       └── data/
│           └── engine_data.csv    # Training dataset
│
├── data/
│   └── engine_data.csv            # Dataset mirror (API telemetry feed)
│
├── src/                           # React frontend
│   ├── App.js
│   ├── index.js
│   └── components/
│
├── public/                        # Static assets
├── android/                       # Capacitor Android project
│
├── tests/
│   └── test_backend.py            # pytest suite (25+ tests)
├── test_prediction.py             # Standalone prediction smoke test
├── test_fetch.js                  # JS API fetch smoke test
│
├── vehicle_health.db              # SQLite DB (generated at runtime)
├── .env                           # Environment variables (not committed)
├── ANDROID.md                     # Android build guide
└── README.md
```

---

## Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| Flask | 3.0.0 | REST API framework |
| Flask-Cors | 4.0.0 | CORS headers for React client |
| scikit-learn | latest | Train/test split, metrics |
| xgboost | latest | Binary classification model |
| shap | latest | Feature importance explainability |
| pandas | latest | Dataset loading and manipulation |
| numpy | latest | Array operations |
| joblib | latest | Model serialisation |
| matplotlib | latest | Feature importance plot |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| Recharts | 3.7 | Health trend charts |
| Framer Motion | 12.26 | Animated state transitions |
| Tailwind CSS | 3.4 | Utility-first styling |
| Lucide React | 0.562 | Icon set |
| Capacitor | 6.2 | Android packaging |

---

## Quick Start

> **Prerequisites:** Python 3.10+, Node.js 18+, npm 9+

```bash
# 1. Clone the repository
git clone https://github.com/iamakhilan/Vehicle-Health-Prediction-using-Agentic-AI.git
cd Vehicle-Health-Prediction-using-Agentic-AI

# 2. Train the ML model (required before starting the API)
cd backend/ml_pipeline
python train.py
cd ../..

# 3. Start the Flask API
python api_server.py

# 4. In a new terminal, start the React frontend
npm install
npm start
```

The API is available at `http://localhost:5000` and the dashboard at `http://localhost:3000`.

---

## Installation

### Backend

```bash
# Create and activate a virtual environment
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt
```

### Frontend

```bash
# Install Node dependencies
npm install
```

---

## Running the Project

### Start the API Server

```bash
python api_server.py
```

The server starts on `http://localhost:5000` by default. Override with environment variables (see [Configuration](#configuration--environment-variables)).

### Start the React Dashboard

```bash
npm start
```

Opens `http://localhost:3000` in your default browser. The dashboard connects to the API at the URL defined in `REACT_APP_API_URL` (defaults to `http://localhost:5000`).

### Build for Production

```bash
npm run build
```

Outputs optimised static files to `build/`.

---

## Android Build / Run

Full Android setup instructions are documented in **[ANDROID.md](./ANDROID.md)**.

Quick reference:

```bash
# Build the React app and sync to the Android project
npm run cap:sync

# Open the Android project in Android Studio
npm run cap:android

# Run on a connected device with live reload
npm run cap:live

# Build a debug APK from the command line (Windows)
npm run android:debug-apk
```

> **Requirements:** Android Studio, Android SDK, and a connected device or emulator. See `ANDROID.md` for full prerequisites.

---

## ML Workflow

The ML pipeline lives in `backend/ml_pipeline/` and must be run before the API server.

```
engine_data.csv
      │
      ▼
 dataset_loader.py      ← loads CSV, selects 6 features + target
      │
      ▼
   train.py             ← XGBClassifier (200 trees, depth 6, lr 0.05)
      │                    stratified 80/20 split, logs accuracy/F1
      ▼
 model_xgb.pkl          ← serialised model (joblib)
 feature_importance.png ← bar chart of feature importances
      │
      ▼
 predict_model.py       ← loads model at startup, maps API keys → features
      │                    SHAP TreeExplainer for top-3 contributors
      ▼
 api_server.py /predict ← calls predict_vehicle_health(input_data)
```

### Feature Mapping

| API Field | Dataset Column |
|---|---|
| `rpm` | `Engine rpm` |
| `oil_pressure` | `Lub oil pressure` |
| `fuel_pressure` | `Fuel pressure` |
| `coolant_pressure` | `Coolant pressure` |
| `oil_temp` | `lub oil temp` |
| `coolant_temperature` | `Coolant temp` |

**Target column:** `Engine Condition` (binary: `0` = faulty, `1` = healthy)

### Train the model

```bash
cd backend/ml_pipeline
python train.py
```

Outputs: `model_xgb.pkl`, `feature_columns.json`, `feature_importance.png`

---

## API Endpoints

Base URL: `http://localhost:5000`

---

### `GET /health`

Liveness and readiness probe. Checks database connectivity.

**Response `200`**
```json
{
  "status": "ready",
  "database": "connected"
}
```

---

### `POST /predict`

Submit engine telemetry; receive health score, risk level, failure probability, trend, and SHAP explanations.

**Request**
```json
{
  "vehicle_id": "VH-001",
  "engine_runtime": 60,
  "rpm": 2500,
  "oil_pressure": 3.5,
  "fuel_pressure": 7.2,
  "coolant_pressure": 2.1,
  "oil_temp": 78,
  "coolant_temperature": 88
}
```

**Response `200`**
```json
{
  "vehicle_id": "VH-001",
  "health_score": 96.4,
  "risk_level": "Low",
  "trend": "Stable",
  "failure_probability": 0.07,
  "predicted_label": 1,
  "explanation": ["All systems operating within normal parameters"],
  "primary_stress_factors": ["Coolant temp", "Engine rpm", "Lub oil pressure"],
  "input_features": {
    "rpm": 2500,
    "oil_pressure": 3.5,
    "fuel_pressure": 7.2,
    "coolant_pressure": 2.1,
    "oil_temp": 78,
    "coolant_temperature": 88
  }
}
```

**Error `400`** — missing or invalid fields  
**Error `503`** — database unavailable

---

### `POST /estimate`

Returns a repair recommendation based on stress factors and risk level.

**Request**
```json
{
  "stress_factors": ["coolant_temperature"],
  "risk_level": "High"
}
```

**Response `200`**
```json
{
  "action": "Cooling system service",
  "description": "TODO",
  "estimated_cost": "TODO"
}
```

---

### `POST /schedule`

Returns the next available service slot.

**Response `200`**
```json
{
  "next_slot": "2026-03-10T09:00:00",
  "location": "Downtown Service Center"
}
```

---

### `GET /vehicle-history/<vehicle_id>`

Returns the health score timeline for a vehicle.

**Query params:** `limit` (integer, default 50)

```bash
curl http://localhost:5000/vehicle-history/VH-001?limit=10
```

**Response `200`**
```json
[
  {"timestamp_text": "2026-03-06T10:00:00", "health_score": 98.2, "source_row_index": 0},
  {"timestamp_text": "2026-03-06T10:01:00", "health_score": 97.8, "source_row_index": 1}
]
```

---

### `GET /simulated-data`

Streams a row from `engine_data.csv` as API-shaped telemetry (useful for demos without a real OBD adapter).

**Query params:** `index` (integer, default 0)

```bash
curl http://localhost:5000/simulated-data?index=0
```

**Response `200`**
```json
{
  "telemetry": {
    "rpm": 1200.0,
    "oil_pressure": 3.8,
    "fuel_pressure": 7.0,
    "coolant_pressure": 2.0,
    "oil_temp": 76.0,
    "coolant_temperature": 85.0
  },
  "row_index": 0,
  "next_index": 1
}
```

---

## Testing

### Python — pytest

```bash
# From the project root
pytest tests/test_backend.py -v
```

The suite includes 25+ tests covering:

- Feature normalisation (boundary values, string coercion, DTC flag)
- Stress index calculation (zero, clamped, weighted)
- Health decay logic and database persistence roundtrip
- Risk level determination (`Low` / `Medium` / `High` thresholds)
- Trend analysis edge cases
- All API endpoint contracts (`/predict`, `/estimate`, `/schedule`, `/vehicle-history`, `/simulated-data`)
- Explanation engine (all-normal and high-stress scenarios)

Each test runs against a temporary SQLite database (`tmp_path` fixture) to ensure full isolation.

### Python — Standalone Smoke Test

```bash
python test_prediction.py
```

### JavaScript — API Smoke Test

```bash
node test_fetch.js
```

### Frontend Tests

```bash
npm test
```

---

## Configuration & Environment Variables

Create a `.env` file in the project root (already in `.gitignore`).

| Variable | Default | Description |
|---|---|---|
| `FLASK_HOST` | `0.0.0.0` | Host the API server binds to |
| `FLASK_PORT` | `5000` | Port the API server listens on |
| `FLASK_DEBUG` | `false` | Enable Flask debug mode (do **not** set `true` in production) |
| `REACT_APP_API_URL` | `http://localhost:5000` | Base URL the React app uses to call the API |

Example `.env`:

```dotenv
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=false
REACT_APP_API_URL=http://localhost:5000
```

---

## Troubleshooting

**`ValueError: Model not trained or not found.`**  
The ML model file `backend/ml_pipeline/model_xgb.pkl` is missing. Run `python train.py` from `backend/ml_pipeline/` first.

**`ModuleNotFoundError: No module named 'backend'`**  
Ensure you are running `python api_server.py` from the **project root**, not from inside a subdirectory.

**CORS errors in the browser**  
Confirm the API is running and that `REACT_APP_API_URL` in your `.env` matches the actual API address. Flask-Cors is enabled globally in `api_server.py`.

**Android build: Gradle sync fails**  
Run `npm run cap:sync` to rebuild the web bundle and sync it to the Android project before opening in Android Studio. See `ANDROID.md` for full prerequisites.

**`sqlite3.OperationalError: unable to open database file`**  
The process does not have write permission to the project root. Run from a directory where your user has write access, or set a custom DB path.

---

## Roadmap

- [ ] Dockerise the API server and SQLite volume
- [ ] Add GitHub Actions CI pipeline (pytest + npm test)
- [ ] Replace SQLite with PostgreSQL for multi-instance deployments
- [ ] Integrate a real OBD-II Bluetooth adapter (e.g. ELM327) as a data source
- [ ] Track experiments with MLflow (model versioning, metric logging)
- [ ] Add iOS support via Capacitor

### Next Improvements

1. **Containerise with Docker** — add a `Dockerfile` and `docker-compose.yml` so the API, database volume, and frontend build are fully portable with a single `docker compose up`.
2. **Real OBD-II adapter integration** — implement a data-ingest module that connects to an ELM327 Bluetooth/Wi-Fi adapter and pipes live sensor reads to `/predict`, replacing the simulated data feed.
3. **MLflow experiment tracking** — instrument `train.py` with MLflow to log hyperparameters, accuracy, F1, and artefacts; enables reproducible model comparisons and a model registry.
4. **Swap SQLite for PostgreSQL** — replace the SQLite DAL with SQLAlchemy + PostgreSQL to support concurrent API workers (e.g. gunicorn), proper migrations via Alembic, and cloud-native deployments.
5. **Property-based testing with Hypothesis** — add Hypothesis strategies to `tests/test_backend.py` to generate randomised telemetry payloads, catching edge cases in normalisation and stress-index clamping that fixed unit tests miss.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests where applicable.
4. Run the full test suite: `pytest tests/test_backend.py -v && npm test`
5. Submit a pull request with a clear description of the change.

Please follow the existing code style. For significant changes, open an issue first to discuss the approach.

---

## License

TODO — add a `LICENSE` file. (e.g. MIT, Apache 2.0)

---

## Acknowledgements

- [UCI / Kaggle Engine Dataset](https://www.kaggle.com/) — `engine_data.csv` training data (TODO: link exact source)
- [XGBoost](https://xgboost.readthedocs.io/) — gradient-boosted tree library
- [SHAP](https://shap.readthedocs.io/) — model explainability
- [Capacitor](https://capacitorjs.com/) — cross-platform native runtime
- [Recharts](https://recharts.org/) — React charting library
