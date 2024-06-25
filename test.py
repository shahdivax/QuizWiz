import getpass, os, pymongo, pprint
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext, get_response_synthesizer
from llama_index.core.settings import Settings
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.vector_stores import MetadataFilter, MetadataFilters, ExactMatchFilter, FilterOperator
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.legacy.embeddings import GeminiEmbedding
from llama_index.llms.gemini import Gemini
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from dotenv import load_dotenv
from llama_index.vector_stores.postgres import PGVectorStore
from sqlalchemy import make_url

load_dotenv()
import psycopg2


# ATLAS_CONNECTION_STRING = os.environ["MONGO_URI"]
Settings.embed_model = GeminiEmbedding(
    model_name="models/text-embedding-004"
)
Settings.llm = Gemini(model_name='models/gemini-1.5-pro-latest')
# Settings.chunk_size = 100
# Settings.chunk_overlap = 10

# sample_data = SimpleDirectoryReader(input_dir='data').load_data()
# # Print the first document
# print(sample_data[0])


# <<<---------------------------------------------------------- POSTGRESQL------------------------------------------->>>
# URL: https://console.aiven.io/account/a4c14128009a/project/divax12345ai-a437/services/pg-3fc3cd07/overview
connection_string = os.environ["POSTGRESQL_URI"]
db_name = "vector_db"
conn = psycopg2.connect(connection_string)
conn.autocommit = True
with conn.cursor() as c:
    c.execute(f"DROP DATABASE IF EXISTS {db_name};")
    c.execute(f"CREATE DATABASE {db_name};")
    c.execute(f"CREATE EXTENSION IF NOT EXISTS vector;")

url = make_url(connection_string)
vector_store = PGVectorStore.from_params(
    database=db_name,
    host=url.host,
    password=url.password,
    port=url.port,
    user=url.username,
    table_name="paper",
    embed_dim=768,  # openai embedding dimension
)

def sanitize_text(text):
    # Remove NUL characters
    return text.replace('\x00', '')

uploaded = False
query_engine = None
def initialize_index():
    global uploaded, query_engine, vector_store
    if not uploaded:
        if query_engine is None:
            documents = SimpleDirectoryReader(input_dir="custombot/data").load_data()
            sanitized_documents = [doc.copy() for doc in documents]
            for doc in sanitized_documents:
                doc.text = sanitize_text(doc.text)
            print(sanitized_documents)
            # Instantiate the vector store
            vector_store_context = StorageContext.from_defaults(vector_store=vector_store)
            vector_store_index = VectorStoreIndex.from_documents(
                sanitized_documents, storage_context=vector_store_context, show_progress=True
            )
            vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
            response_synthesizer = get_response_synthesizer(response_mode="refine",)
            query_engine = RetrieverQueryEngine(retriever=vector_store_retriever, response_synthesizer=response_synthesizer)
            # query_engine.update_prompts(
            #     {"response_synthesizer:text_qa_template": custom_prompt}
            # )
    else:
        vector_store_index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
        vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
        response_synthesizer = get_response_synthesizer(response_mode="refine",)
        query_engine = RetrieverQueryEngine(retriever=vector_store_retriever, response_synthesizer=response_synthesizer)
        # query_engine.update_prompts(
        #     {"response_synthesizer:text_qa_template": custom_prompt}
        # )
    return query_engine

initialize_index()