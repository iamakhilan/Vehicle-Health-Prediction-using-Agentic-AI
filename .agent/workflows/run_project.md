---
description: How to run the Vehicle Health Prediction project from scratch
---

This workflow describes the steps to start the entire system (Ollama, Backend, Frontend) after a fresh boot.

1. **Start Ollama**
   - Ensure Ollama is running in the background. You can usually start it from your Start Menu or by running `ollama serve` in a terminal.
   - Verify the models are pulled:
     ```bash
     ollama list
     ```
     *(Ensure `gemma3:1b` and `nomic-embed-text` are present. If not, run `ollama pull gemma3:1b` and `ollama pull nomic-embed-text`)*

2. **Start the Backend API**
   - Open a new terminal.
   - Navigate to the project directory:
     ```powershell
     cd "c:\Users\akhil\Music\IOT\Vehicle health prediction\vehicle-health-prediction"
     ```
   - Run the API server:
     ```powershell
     python api_server.py
     ```
   - *Note: This server handles the diagnostics, estimation, and scheduling logic.*

3. **Start the Frontend**
   - Open a second terminal.
   - Navigate to the project directory:
     ```powershell
     cd "c:\Users\akhil\Music\IOT\Vehicle health prediction\vehicle-health-prediction"
     ```
   - Start the React application:
     ```powershell
     npm start
     ```
   - The application should automatically open in your default browser at `http://localhost:3000`.

4. **Verify Connectivity**
   - Once the UI is loaded, you should see the dashboard.
   - To test the full flow, click "Simulate Sensor Anomaly" then "Run Diagnostics".
   - *Note: If diagnostics are slow on the first run, it is likely loading the AI models.*
