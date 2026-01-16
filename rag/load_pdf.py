import os
from langchain_community.document_loaders import PyPDFLoader

# Hardcoded path as per requirements
PDF_PATH = r"C:\Users\akhil\Music\IOT\Vehicle health prediction\vehicle-health-prediction\data\Corolla E11 Haynes Workshop Manual.pdf"

def load_manual():
    """Validates and loads the car manual PDF."""
    if not os.path.exists(PDF_PATH):
        raise FileNotFoundError(f"PDF not found at {PDF_PATH}")
    
    print(f"Loading PDF from {PDF_PATH}...")
    loader = PyPDFLoader(PDF_PATH)
    documents = loader.load()
    print(f"Successfully loaded {len(documents)} pages.")
    # For demo purposes, limit to first 10 pages to speed up embedding on CPU
    return documents[:10]

if __name__ == "__main__":
    try:
        load_manual()
    except Exception as e:
        print(f"Error: {e}")
