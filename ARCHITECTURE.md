# Architecture Overview

## System Design Philosophy

The Vehicle Health Prediction System follows a hybrid architecture that leverages both AI and deterministic rule-based systems:

### Why This Architecture?

1. **AI for Complex Reasoning** (Agent-1 only)
   - Diagnosis requires reasoning over unstructured data (sensor patterns, service manuals)
   - RAG (Retrieval-Augmented Generation) provides contextual, accurate fault identification
   - Local LLM (Ollama) ensures privacy and low latency

2. **Rules for Business Logic** (Agents 2 & 3)
   - Cost estimation must be transparent and auditable
   - Scheduling decisions need to be predictable
   - No "black box" for critical business operations

3. **Human-in-the-Loop**
   - All repair actions require explicit approval
   - Users maintain control over maintenance decisions
   - System provides recommendations, not mandates

## Agent Responsibilities

### Agent-1: AI-based Diagnostician
**Technology**: RAG with FAISS + Ollama  
**Purpose**: Fault diagnosis from sensor data  
**Input**: Sensor readings, historical data  
**Output**: Fault identification, root cause, risk level, RUL  

**Process**:
1. Embeds current sensor readings and symptoms
2. Retrieves similar cases from FAISS vector store
3. Queries local Ollama LLM with retrieved context
4. Parses structured diagnosis from LLM response

### Agent-2: Rule-based Service Advisor
**Technology**: Deterministic rules engine  
**Purpose**: Cost and time estimation  
**Input**: Diagnosis from Agent-1  
**Output**: Service recommendation, cost estimate, time estimate  

**Process**:
1. Maps fault to service catalog
2. Calculates cost using parts + labor rules
3. Estimates time based on repair complexity
4. Applies business constraints and policies

### Agent-3: Rule-based Scheduler
**Technology**: Deterministic scheduling rules  
**Purpose**: Appointment booking  
**Input**: Service recommendation from Agent-2, user location, urgency  
**Output**: Appointment confirmation  

**Process**:
1. Queries available service center slots
2. Applies urgency-based prioritization
3. Considers location and user preferences
4. Books appointment and sends confirmation

## Data Flow

```
Sensors → Monitor → Anomaly Detection
                         ↓
                    Agent-1 (AI)
                         ↓
                    Diagnosis
                         ↓
                    Agent-2 (Rules)
                         ↓
                Service Recommendation
                         ↓
                  Human Approval
                         ↓
                    Agent-3 (Rules)
                         ↓
                 Appointment Booked
```

## Current Implementation

This prototype is a **frontend simulation** that demonstrates the architecture:
- All agents are mocked with realistic delays
- No actual backend or ML models
- Mock data represents typical system outputs
- Interactive UI shows the complete workflow

## Production Considerations

For a production system, you would need:

1. **Backend Infrastructure**
   - Python FastAPI or Flask server
   - FAISS vector database for RAG
   - Ollama or similar LLM deployment
   - PostgreSQL or MongoDB for data storage

2. **Agent Implementation**
   - Agent-1: LangChain + FAISS + Ollama
   - Agent-2: Python rules engine or Drools
   - Agent-3: Scheduling system integration

3. **Data Pipeline**
   - Real-time sensor data ingestion
   - Time-series database (InfluxDB, TimescaleDB)
   - Historical data for training and context

4. **Security & Privacy**
   - User authentication (JWT)
   - Data encryption at rest and in transit
   - Local LLM deployment (no data leaves premises)

5. **Monitoring & Observability**
   - Agent performance metrics
   - Diagnosis accuracy tracking
   - User feedback loop
   - System health monitoring
