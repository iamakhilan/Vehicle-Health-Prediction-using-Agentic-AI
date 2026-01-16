"""
Agent 1: AI-based Vehicle Diagnostician

Uses local RAG (FAISS + Ollama) to diagnose vehicle issues by querying 
the service manual. Deterministic keyword enrichment improves retrieval accuracy.

Architecture:
- Query enrichment: Maps error codes to relevant keywords
- RAG retrieval: Finds relevant manual sections via FAISS
- LLM diagnosis: Gemma3:1b generates structured diagnosis from context
"""

import argparse
import sys
from rag.query_manual import query_manual
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

def enrich_query(alert_text):
    """Refine retrieval query using deterministic keyword expansion.
    
    Maps known OBD-II error codes to relevant technical keywords to improve
    semantic search accuracy.
    
    Args:
        alert_text (str): Raw alert text (e.g., "Error Code P0300")
    
    Returns:
        str: Enriched query with additional keywords
    """
    enriched = alert_text
    
    # Simple deterministic mapping for demo purposes
    # In a real system, this could be a larger lookup table or regex pattern
    enrichment_map = {
        "P0300": "engine misfire ignition spark plug cylinder",
        "P0301": "cylinder 1 misfire ignition spark plug",
        "P0302": "cylinder 2 misfire ignition spark plug",
        "P0303": "cylinder 3 misfire ignition spark plug",
        "P0304": "cylinder 4 misfire ignition spark plug",
        "P0171": "system too lean fuel injection vacuum leak",
        "P0420": "catalytic converter exhaust system oxygen sensor"
    }
    
    # Check for known codes and append keywords
    for code, keywords in enrichment_map.items():
        if code in alert_text:
            enriched += f" {keywords}"
            
    return enriched

def diagnose_to_json(alert_text):
    """Diagnose vehicle issue and return structured result.
    
    Process:
    1. Enrich query with relevant keywords
    2. Retrieve manual sections via RAG
    3. Generate diagnosis using LLM with strict output format
    4. Parse and return structured dictionary
    
    Args:
        alert_text (str): Vehicle alert or symptom description
    
    Returns:
        dict: Structured diagnosis with keys: Diagnosis, Cause, 
              Recommended Fix, Reference, Confidence
              Returns {"error": str} on failure
    """
    enriched = enrich_query(alert_text)
    
    docs = query_manual(enriched, k=5)
    if not docs:
        context = "No specific manual sections found."
    else:
        context = "\n\n".join([f"Source (Page {d.metadata.get('page')}):\n{d.page_content}" for d in docs])

    template = """You are Agent-1, an expert vehicle diagnostician. 
    Your task is to diagnose a vehicle issue based ONLY on the provided Car Service Manual context.
    
    Adhere strictly to this output format:
    Diagnosis: <Short summary of the problem>
    Cause: <Specific cause based on manual>
    Recommended Fix: <Actionable step from manual>
    Reference: <Section or page from manual>
    Confidence: <0.0 to 1.0 score>

    Do NOT hallucinate. If the answer is not in the context, state "Insufficient information in manual."
    If the retrieved context does not clearly support the error code, state the uncertainty explicitly.
    
    Context from Manual:
    {context}
    
    Alert/symptom:
    {alert}
    """
    
    prompt = ChatPromptTemplate.from_template(template)
    model = OllamaLLM(model="gemma3:1b")
    chain = prompt | model
    
    try:
        response_text = chain.invoke({"context": context, "alert": alert_text})
        # Attempt to parse JSON from the response if the model outputs purely JSON
        # Since gemma3:1b might output text around it, we might need robust parsing.
        # For this prototype, we'll try to extract fields or just return the text if parsing fails.
        # But to be safer with "gemma3:1b", let's ask for specific keys in a simple format and parse it manually 
        # OR just use the text output if we trust it. 
        # actually, the previous prompt asked for specific "Diagnosis: ..." lines. Let's stick to that for reliability 
        # and then parse it into a dict.
        
        return parse_diagnosis_output(response_text)
    except Exception as e:
        return {"error": str(e)}

def parse_diagnosis_output(text):
    """Parse LLM text output with 'Key: Value' lines into a dictionary.
    
    Args:
        text (str): Multi-line text output from LLM
    
    Returns:
        dict: Parsed diagnosis fields
    """
    data = {}
    lines = text.split('\n')
    for line in lines:
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip()
            if key in ["Diagnosis", "Cause", "Recommended Fix", "Reference", "Confidence"]:
                data[key] = val
    return data

def diagnose(alert_text):
    # Wrapper to maintain simpler CLI behavior
    result = diagnose_to_json(alert_text)
    print("\n--- Agent-1 Report ---")
    for k, v in result.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Agent-1 Vehicle Diagnostician")
    parser.add_argument("alert", nargs="?", default="Error Code P0300 with high engine vibration", help="Alert string to diagnose")
    args = parser.parse_args()
    
    diagnose(args.alert)
