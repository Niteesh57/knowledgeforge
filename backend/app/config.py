import os
from langchain_groq import ChatGroq

def get_llm(temperature: float = 0.7):
    groq_api_key = os.environ.get("GROQ_API_KEY", "")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set. Check your .env file.")
    return ChatGroq(
        temperature=temperature,
        model_name="llama-3.3-70b-versatile",
        groq_api_key=groq_api_key
    )
