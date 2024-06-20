from llama_index.core import SimpleDirectoryReader, VectorStoreIndex
from llama_index.core.settings import Settings
from llama_index.legacy.embeddings import GeminiEmbedding
from llama_index.llms.gemini import Gemini
from dotenv import load_dotenv
load_dotenv()

Settings.embed_model = GeminiEmbedding(model_name="models/text-embedding-004")
Settings.llm = Gemini(model_name="models/gemini-1.5-pro-latest")

documents = SimpleDirectoryReader("data").load_data()
index = VectorStoreIndex.from_documents(documents)

query_engine = index.as_query_engine()