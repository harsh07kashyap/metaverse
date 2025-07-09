# main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from rag_pipeline import initialize_rag_pipeline, get_answer
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.prompts import PromptTemplate

app = FastAPI()

# Optional: allow cross-origin requests for frontend usage
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to your frontend's domain in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Load RAG model once
llm, retriever = initialize_rag_pipeline()

class QueryInput(BaseModel):
    question: str

@app.post("/query")
async def query_rag(input: QueryInput):
    try:
        retrived_docs = retriever.invoke(input.question)
        context_text = "\n\n".join(doc.page_content for doc in retrived_docs)
        print(f"Context: {context_text}")
        prompt = PromptTemplate(
            template="""
            You are a helpful assistant.
            Answer ONLY from the provided transcript context.
            If the context is insufficient, just say you don't know.

            {context}
            Question: {question}
            """,
            input_variables=["context", "question"]
        )

        final_prompt = prompt.invoke({"context": context_text, "question": input.question})
        answer = llm.invoke(final_prompt).content

        return answer.replace("**", "")
    except Exception as e:
        print("Error in /query:", e)
        raise HTTPException(status_code=500, detail=str(e))
