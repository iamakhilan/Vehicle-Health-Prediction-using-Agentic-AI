"""
Service Manual Query Module

Loads the FAISS vector index and provides semantic search over 
the vehicle service manual for Agent 1 (Diagnostician).
"""

import os
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings

INDEX_PATH = os.path.join(os.path.dirname(__file__), "faiss_index")

def get_retriever(k=5):
    """Load the FAISS index and return a retriever.
    
    Args:
        k (int): Number of documents to retrieve (default: 5)
    
    Returns:
        Retriever: LangChain retriever for querying the manual
    
    Raises:
        FileNotFoundError: If the index hasn't been built yet
    """
    if not os.path.exists(INDEX_PATH):
        raise FileNotFoundError(f"Index not found at {INDEX_PATH}. Run build_index.py first.")
        
    embeddings = OllamaEmbeddings(model="nomic-embed-text")
    # allow_dangerous_deserialization is needed for loading local pickles securely in trusted environments
    vector_store = FAISS.load_local(INDEX_PATH, embeddings, allow_dangerous_deserialization=True)
    return vector_store.as_retriever(search_kwargs={"k": k})

def query_manual(query_text, k=5):
    """Retrieve relevant manual sections for a query.
    
    Args:
        query_text (str): Search query (e.g., "engine misfire P0300")
        k (int): Number of documents to retrieve (default: 5)
    
    Returns:
        list: List of Document objects with page_content and metadata
    """
    retriever = get_retriever(k=k)
    docs = retriever.invoke(query_text)
    return docs

if __name__ == "__main__":
    # Test query
    test_query = "engine misfire"
    print(f"Querying for: '{test_query}'")
    try:
        results = query_manual(test_query)
        for i, doc in enumerate(results):
            print(f"\n--- Result {i+1} ---")
            print(doc.page_content[:200] + "...")
            print(f"Source: Page {doc.metadata.get('page', 'unknown')}")
    except Exception as e:
        print(f"Error: {e}")
