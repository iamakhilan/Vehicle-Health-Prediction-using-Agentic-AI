# Vehicle Health Prediction System (Version 2.0)

A multi-agent vehicle health monitoring and prediction system with human-in-the-loop approval. This prototype demonstrates an intelligent architecture combining AI-driven diagnostics with rule-based business logic.

## 🎯 Overview

This system simulates an end-to-end vehicle health prediction workflow with three specialized agents:

- **Agent-1: AI-based Diagnostician** - Uses RAG (Retrieval-Augmented Generation) with local FAISS vector store and Ollama for intelligent fault diagnosis
- **Agent-2: Rule-based Service Advisor** - Provides deterministic, explainable cost and time estimations
- **Agent-3: Rule-based Scheduler** - Handles appointment booking with rule-based slot selection

### Design Philosophy

- **AI where it matters**: Agent-1 uses AI only for reasoning over unstructured data (sensor patterns, service manuals)
- **Deterministic business logic**: Agents 2 & 3 use rules for critical decisions (cost, scheduling) ensuring explainability
- **Human-in-the-loop**: All repair actions require explicit user approval

## 🏗️ Architecture

```
Sensor Monitoring → Anomaly Detection → AI Diagnosis → Service Recommendation → Human Approval → Scheduling
      ↓                    ↓                ↓                   ↓                    ↓             ↓
   Real-time          Alert System      Agent-1            Agent-2              User Action   Agent-3
                                       (AI + RAG)         (Rule-based)                       (Rule-based)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 14+ and npm

### Installation

```bash
npm install
```

### Development

Run the application in development mode:

```bash
npm start
```

Opens [http://localhost:3000](http://localhost:3000) in your browser. The page auto-reloads on changes.

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `build/` folder.

### Testing

```bash
npm test
```

Launches the test runner in interactive watch mode.

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (IPhoneFrame)
│   └── ui/              # Reusable UI components (Button, Card, Typography)
├── constants/           # Application constants and mock data
│   ├── mockData.js      # Sensor data, diagnosis results
│   └── steps.js         # Workflow step definitions
├── services/
│   └── agents/          # Agent simulation logic
│       ├── diagnostician.js    # Agent-1: AI-based diagnosis
│       ├── serviceAdvisor.js   # Agent-2: Rule-based service recommendations
│       └── scheduler.js        # Agent-3: Rule-based appointment scheduling
├── views/
│   └── VehicleHealthFlow.jsx   # Main workflow component
├── lib/
│   └── utils.js         # Utility functions
├── App.js               # Application entry point
└── index.js             # React root
```

## 🔧 Technology Stack

- **Frontend**: React 19 with Hooks
- **Styling**: Tailwind CSS with custom design system
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Create React App

## 📝 Current Implementation

This is a **frontend prototype** that simulates the multi-agent architecture with:
- Mock sensor data
- Simulated AI processing delays
- Rule-based response patterns
- Interactive state management

In a production system:
- Agent-1 would connect to actual RAG pipeline (FAISS + Ollama)
- Agent-2 would use real service catalog and pricing rules
- Agent-3 would integrate with booking systems
- All agents would communicate via API

## 🎨 Design System

The UI follows a custom design system with:
- **Colors**: Primary (Clay, Ink), Secondary (Sand, Peach), Accent (Indigo, Teal)
- **Typography**: Merriweather (serif headlines), Nunito (UI text)
- **Components**: Cards, Pills, Super-ellipse buttons
- **Animations**: Subtle motion for better UX

## 📄 License

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## 🤝 Contributing

This is a demonstration prototype. For questions or feedback, please open an issue.

