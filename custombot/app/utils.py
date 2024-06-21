import getpass, os, pymongo, pprint
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext
from llama_index.core.settings import Settings
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.vector_stores import MetadataFilter, MetadataFilters, ExactMatchFilter, FilterOperator
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.legacy.embeddings import GeminiEmbedding
from llama_index.llms.gemini import Gemini
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from dotenv import load_dotenv
load_dotenv()

ATLAS_CONNECTION_STRING = os.environ["MONGO_URI"]
Settings.embed_model = GeminiEmbedding(model_name="models/text-embedding-004")
Settings.llm = Gemini(model_name="models/gemini-1.5-flash-latest")
# Settings.chunk_size = 100
# Settings.chunk_overlap = 10
mongodb_client = pymongo.MongoClient(ATLAS_CONNECTION_STRING)
atlas_vector_store = MongoDBAtlasVectorSearch(
                mongodb_client,
                db_name="llamaindex_db",
                collection_name="test",
                index_name="vector_index"
            )


query_engine = None
uploaded = True

# TODO: try with posgress database

def initialize_index():
    global uploaded, query_engine, atlas_vector_store
    if not uploaded:
        if query_engine is None:
            documents = SimpleDirectoryReader("data").load_data()
            # Instantiate the vector store
            vector_store_context = StorageContext.from_defaults(vector_store=atlas_vector_store)
            vector_store_index = VectorStoreIndex.from_documents(
                documents, storage_context=vector_store_context, show_progress=True
            )
            vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
            query_engine = RetrieverQueryEngine(retriever=vector_store_retriever)
    else:
        vector_store_index = VectorStoreIndex.from_vector_store(vector_store=atlas_vector_store)
        vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
        query_engine = RetrieverQueryEngine(retriever=vector_store_retriever)
    return query_engine

def get_query_engine():
    return initialize_index()