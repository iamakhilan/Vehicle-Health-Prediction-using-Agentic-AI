# Vehicle Health Prediction System

A production-ready multi-agent system that combines a modern React frontend with a Python backend to diagnose vehicle issues, estimate repair costs, and schedule services. This project leverages **RAG (Retrieval-Augmented Generation)** with local LLMs via **Ollama** to provide accurate, context-aware diagnoses directly from a vehicle workshop manual.

## Features

- **Agent 1: Diagnoser (RAG-based)**
  - Uses `gemma3:1b` and `nomic-embed-text` to retrieve relevant sections from the *Corolla E11 Haynes Workshop Manual*.
  - Provides a diagnosis, potential causes, and recommended fixes based strictly on the manual.
- **Agent 2: Service Advisor (Rule-based)**
  - estimates repair costs, including parts and labor, based on the diagnosis.
- **Agent 3: Scheduler (Rule-based)**
  - Suggests the next available service appointment slot.
- **Modern Frontend**
  - Built with **React**, **Tailwind CSS**, and **Framer Motion** for a responsive and animated user experience.

## Tech Stack

### Frontend
- **React** (Create React App)
- **Tailwind CSS** (Styling)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)

### Backend & AI
- **Python** (Flask API)
- **LangChain** (Orchestration)
- **FAISS** (Vector Store for RAG)
- **Ollama** (Local LLM Runtime)
- **PyPDF** (PDF Parsing)

## Prerequisites

Before running the project, ensure you have the following installed:
- **Node.js** (v16+) and **npm**
- **Python** (v3.8+)
- **Ollama** (Download from [ollama.com](https://ollama.com))

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository_url>
cd vehicle-health-prediction
```

### 2. Setup Backend

It is recommended to use a virtual environment.

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Configure Ollama

This project uses local LLMs. You need to pull the specific models used by the agents.

```bash
# Pull the chat model
ollama pull gemma3:1b

# Pull the embedding model
ollama pull nomic-embed-text

# Ensure Ollama is running
ollama serve
```

### 4. Build the RAG Index

Before the system can diagnose issues, you need to index the workshop manual.

```bash
python rag/build_index.py
```
*This command processes the PDF in `data/` and saves the FAISS index to `rag/faiss_index/`.*

### 5. Start the Backend API

```bash
python api_server.py
```
The Flask API will start on `http://localhost:5000`.

### 6. Start the Frontend

Open a new terminal window for the frontend.

```bash
# Install Node modules
npm install

# Start the React app
npm start
```
The application will open automatically at `http://localhost:3000`.

## Usage

1.  Ensure both the Backend API and Frontend are running.
2.  On the web interface, describe the vehicle issue (e.g., *"Error code P0300"* or *"Engine is vibrating"*).
3.  Click **"Run Diagnostics"**.
4.  The system will:
    -   **Analyze**: Search the manual and return a diagnosis.
    -   **Estimate**: Calculate the cost for parts and labor.
    -   **Schedule**: Propose a time for the repair.

## Project Structure

```
├── agent1_diagnoser.py  # Logic for the diagnosing agent
├── api_server.py        # Flask API entry point
├── data/                # Contains the workshop manual PDF
├── rag/                 # RAG implementation
│   ├── build_index.py   # Script to index the PDF
│   ├── load_pdf.py      # PDF loading utility
│   ├── query_manual.py  # Logic to query the FAISS index
│   └── faiss_index/     # Generated vector store (after build)
├── requirements.txt     # Python dependencies
├── src/                 # React frontend source code
└── ...
```

## Contributing

Contributions are welcome! Please follow standard pull request workflows.

## License

[MIT](LICENSE)
