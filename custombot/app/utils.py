import getpass, os, pymongo, pprint
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext, get_response_synthesizer, PromptTemplate
from llama_index.core.settings import Settings
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.vector_stores import MetadataFilter, MetadataFilters, ExactMatchFilter, FilterOperator
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.embeddings.mistralai import MistralAIEmbedding
from llama_index.llms.mistralai import MistralAI
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from dotenv import load_dotenv
from sqlalchemy import make_url
from llama_index.vector_stores.postgres import PGVectorStore
import psycopg2
load_dotenv()

Settings.embed_model = MistralAIEmbedding(model_name="mistral-embed")
Settings.llm = MistralAI() # MistralAI(model_name="mistral-large-latest")

connection_string = os.environ["POSTGRESQL_URI"]

query_engines = {}

def sanitize_text(text):
    # Remove NUL characters
    return text.replace('\x00', '')


def get_vector_store(bot_id):
    url = make_url(connection_string)
    return PGVectorStore.from_params(
        database='quizwiz_bot_data',
        host=url.host,
        password=url.password,
        port=url.port,
        user=url.username,
        table_name=f"QuizWiz_{bot_id}",
        embed_dim=768,
    )


def initialize_index_for_bot(bot_id, bot_name, document_paths):
    vector_store = get_vector_store(bot_id)
    documents = SimpleDirectoryReader(input_dir=document_paths).load_data()
    sanitized_documents = [doc.copy() for doc in documents]
    for doc in sanitized_documents:
        doc.text = sanitize_text(doc.text)

    vector_store_context = StorageContext.from_defaults(vector_store=vector_store)
    vector_store_index = VectorStoreIndex.from_documents(
        sanitized_documents, storage_context=vector_store_context, show_progress=True
    )

    vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
    response_synthesizer = get_response_synthesizer(response_mode="refine")
    query_engine = RetrieverQueryEngine(retriever=vector_store_retriever, response_synthesizer=response_synthesizer)
    query_engines[bot_id] = query_engine


def get_query_engine(bot_id):
    vector_store = get_vector_store(bot_id)
    vector_store_index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
    vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
    response_synthesizer = get_response_synthesizer(response_mode="refine")
    query_engines = RetrieverQueryEngine(retriever=vector_store_retriever,
                                         response_synthesizer=response_synthesizer)

    return query_engines


def init_db():
    conn = psycopg2.connect(connection_string)
    with conn.cursor() as c:
        c.execute("""
            CREATE TABLE IF NOT EXISTS bot_logos (
                bot_id TEXT PRIMARY KEY,
                logo_data BYTEA NOT NULL
            )
        """)
        conn.commit()
    print("Database initialized successfully")
