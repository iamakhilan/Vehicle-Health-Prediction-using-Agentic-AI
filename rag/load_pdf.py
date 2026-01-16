import os
from langchain_community.document_loaders import PyPDFLoader

# Use relative path to data directory
PDF_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "Corolla E11 Haynes Workshop Manual.pdf")

def load_manual():
    """Validates and loads the car manual PDF.
    
    Returns:
        list: List of document pages, limited to first 10 for performance
    
    Raises:
        FileNotFoundError: If the PDF file doesn't exist
    """
    if not os.path.exists(PDF_PATH):
        raise FileNotFoundError(f"PDF not found at {PDF_PATH}")
    
    print(f"Loading PDF from {PDF_PATH}...")
    loader = PyPDFLoader(PDF_PATH)
    documents = loader.load()
    print(f"Successfully loaded {len(documents)} pages.")
    # Limit to first 10 pages to speed up embedding on CPU
    return documents[:10]

if __name__ == "__main__":
    try:
        load_manual()
    except Exception as e:
        print(f"Error: {e}")
