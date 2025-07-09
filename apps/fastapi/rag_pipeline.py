# rag_pipeline.py

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from sentence_transformers import SentenceTransformer
from langchain_core.embeddings import Embeddings
from langchain_community.chat_models import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

class SentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts):
        return self.model.encode(texts, show_progress_bar=True)

    def embed_query(self, text):
        return self.model.encode([text])[0]

# Prepare RAG components once
def initialize_rag_pipeline():
    
    
    
    llm=ChatGoogleGenerativeAI(model='gemini-1.5-flash',temperature=0)

    # initial_context = (
    #     'What is metaverse? Explain everything about this metaverse game website:https://zep.us/en . How can we create a space in this zep world. How can we join existing space.'
    # )
    # messages = [HumanMessage(content=initial_context)]
    initial_context = open("initial_context.txt", encoding="utf-8").read()
    messages= [HumanMessage(content=initial_context)]
    content = llm.invoke(messages).content
    # print(content)

    splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=50)
    chunks = splitter.create_documents([content])
    print(chunks)

    embedding_function = SentenceTransformerEmbeddings()
    vector_store = FAISS.from_documents(chunks, embedding_function)

    retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 1})

    # prompt = PromptTemplate(
    #     template="""
    #     You are a helpful assistant.
    #     Answer ONLY from the provided transcript context.
    #     If the context is insufficient, just say you don't know.

    #     {context}
    #     Question: {question}
    #     """,
    #     input_variables=["context", "question"]
    # )

    return llm, retriever


def get_answer(question: str, llm, retriever, prompt):
    retrived_docs = retriever.invoke(question)
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

    final_prompt = prompt.invoke({"context": context_text, "question": question})
    answer = llm.invoke(final_prompt).content

    return answer.replace("**", "") # remove markdown bolds
