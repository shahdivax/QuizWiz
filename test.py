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
Settings.embed_model = GeminiEmbedding(
    model_name="models/text-embedding-004"
)
Settings.llm = Gemini(model_name='models/gemini-1.5-pro-latest')
Settings.chunk_size = 100
Settings.chunk_overlap = 10

sample_data = SimpleDirectoryReader(input_dir='data').load_data()
# Print the first document
print(sample_data[0])

# Connect to your Atlas cluster
mongodb_client = pymongo.MongoClient(ATLAS_CONNECTION_STRING)

# Instantiate the vector store
atlas_vector_store = MongoDBAtlasVectorSearch(
    mongodb_client,
    db_name = "llamaindex_db",
    collection_name = "test",
    index_name = "vector_index"
)
vector_store_context = StorageContext.from_defaults(vector_store=atlas_vector_store)
vector_store_index = VectorStoreIndex.from_documents(
   sample_data, storage_context=vector_store_context, show_progress=True
)

#once uploaded then follow
# vector_store_index = VectorStoreIndex.from_vector_store(
#     vector_store=atlas_vector_store
# )


# retriever = vector_store_index.as_retriever(similarity_top_k=3)
# nodes = retriever.retrieve("MongoDB Atlas security")
#
# for node in nodes:
#     print(node)

# Instantiate Atlas Vector Search as a retriever
vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)

# Pass the retriever into the query engine
query_engine = RetrieverQueryEngine(retriever=vector_store_retriever)

# Prompt the LLM
response = query_engine.query('what is the paper about ?')
print("*****************************************************")
print(response)
print("*****************************************************")
