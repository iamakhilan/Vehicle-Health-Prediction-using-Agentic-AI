"""
FAISS Index Builder for Vehicle Service Manual

Builds a vector search index from the service manual PDF to enable
semantic retrieval for Agent 1 (Diagnostician).
"""

import os
import sys

# Add parent directory to path so we can import rag.load_pdf if running as script
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from rag.load_pdf import load_manual

INDEX_PATH = os.path.join(os.path.dirname(__file__), "faiss_index")

def build_index():
    """Build FAISS vector index from service manual.
    
    Process:
    1. Load PDF pages
    2. Split into chunks (800 chars with 100 char overlap)
    3. Generate embeddings using Ollama's nomic-embed-text
    4. Create and save FAISS index
    
    The index is saved to ./faiss_index for later use by query_manual.
    """
    # 1. Load PDF
    documents = load_manual()
    
    # 2. Chunk Text
    print("Splitting text into chunks (Size: 800, Overlap: 100)...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        length_function=len,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks.")
    
    # 3. Create Embeddings & Build Index
    print("Creating embeddings using 'nomic-embed-text'...")
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    
    print("Building FAISS vector store...")
    vector_store = FAISS.from_documents(chunks, embeddings)
    
    # 4. Save Index
    print(f"Saving INDEX to {INDEX_PATH}...")
    vector_store.save_local(INDEX_PATH)
    print("Index built and saved successfully.")

if __name__ == "__main__":
    build_index()
