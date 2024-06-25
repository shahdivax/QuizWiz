# import getpass, os, pymongo, pprint
# from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext, get_response_synthesizer, PromptTemplate
# from llama_index.core.settings import Settings
# from llama_index.core.retrievers import VectorIndexRetriever
# from llama_index.core.vector_stores import MetadataFilter, MetadataFilters, ExactMatchFilter, FilterOperator
# from llama_index.core.query_engine import RetrieverQueryEngine
# from llama_index.legacy.embeddings import GeminiEmbedding
# from llama_index.llms.gemini import Gemini
# from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
# from dotenv import load_dotenv
# from sqlalchemy import make_url
# from llama_index.vector_stores.postgres import PGVectorStore
# import psycopg2
# load_dotenv()
#
#
# # custom_prompt_str = (
# #     "Context information is below.\n"
# #     "---------------------\n"
# #     "{context_str}\n"
# #     "---------------------\n"
# #     "Dont give false info, if you don't know about that , simply say that you don't know, be Nice and use emoji, "
# #     "Important: dont tell user you have context, just answer"
# #     "Given the context information and not prior knowledge, answer the query: {query_str}\n"
# # )
# # custom_prompt_str = (
# #     "You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the "
# #     "question. If you don't know the answer, just say that you don't know. Use 2 sentences maximum and keep the "
# #     "answer concise, be Nice and use emoji"
# #     "Question: {query_str}"
# #     "Context: {context_str} "
# #     "Answer:"
# #
# # )
# # custom_prompt = PromptTemplate(custom_prompt_str)
# custom_prompt = ""
#
# Settings.embed_model = GeminiEmbedding(model_name="models/text-embedding-004")
# Settings.llm = Gemini(model_name="models/gemini-1.5-flash-latest")
# query_engine = None
# uploaded = False
# # Settings.chunk_size = 100
# # Settings.chunk_overlap = 10
#
#
# # <<<----------------------------------------------------------- MongoDB -------------------------------------------->>>
# # ATLAS_CONNECTION_STRING = os.environ["MONGO_URI"]
# # mongodb_client = pymongo.MongoClient(ATLAS_CONNECTION_STRING)
# # atlas_vector_store = MongoDBAtlasVectorSearch(
# #                 mongodb_client,
# #                 db_name="llamaindex_db",
# #                 collection_name="test",
# #                 index_name="vector_index"
# #             )
# # def initialize_index():
# #     global uploaded, query_engine, vector_store, custom_prompt
# #     if not uploaded:
# #         if query_engine is None:
# #             documents = SimpleDirectoryReader("data").load_data()
# #             # Instantiate the vector store
# #             vector_store_context = StorageContext.from_defaults(vector_store=atlas_vector_store)
# #             vector_store_index = VectorStoreIndex.from_documents(
# #                 documents, storage_context=vector_store_context, show_progress=True
# #             )
# #             vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
# #             response_synthesizer = get_response_synthesizer(response_mode="refine",)
# #             query_engine = RetrieverQueryEngine(retriever=vector_store_retriever, response_synthesizer=response_synthesizer)
# ##            query_engine.update_prompts(
# ##                {"response_synthesizer:text_qa_template": custom_prompt}
# ##           )
# #     else:
# #         vector_store_index = VectorStoreIndex.from_vector_store(vector_store=atlas_vector_store)
# #         vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
# #         response_synthesizer = get_response_synthesizer(response_mode="refine", )
# #         query_engine = RetrieverQueryEngine(retriever=vector_store_retriever, response_synthesizer=response_synthesizer)
# ##         query_engine.update_prompts(
# ##             {"response_synthesizer:text_qa_template": custom_prompt}
# ##         )
# #     return query_engine
#
#
# # <<<---------------------------------------------------------- POSTGRESQL------------------------------------------->>>
# # URL: https://console.aiven.io/account/a4c14128009a/project/divax12345ai-a437/services/pg-3fc3cd07/overview
# connection_string = os.environ["POSTGRESQL_URI"]
# db_name = "vector_db"
# conn = psycopg2.connect(connection_string)
# conn.autocommit = True
# with conn.cursor() as c:
#     c.execute(f"DROP DATABASE IF EXISTS {db_name};")
#     c.execute(f"CREATE DATABASE {db_name};")
#     c.execute(f"CREATE EXTENSION IF NOT EXISTS vector;")
#
# url = make_url(connection_string)
# vector_store = PGVectorStore.from_params(
#     database=db_name,
#     host=url.host,
#     password=url.password,
#     port=url.port,
#     user=url.username,
#     table_name="paper",
#     embed_dim=768,  # openai embedding dimension
# )
# def initialize_index():
#     global uploaded, query_engine, vector_store, custom_prompt
#     if not uploaded:
#         if query_engine is None:
#             documents = SimpleDirectoryReader("data").load_data()
#             # Instantiate the vector store
#             vector_store_context = StorageContext.from_defaults(vector_store=vector_store)
#             vector_store_index = VectorStoreIndex.from_documents(
#                 documents, storage_context=vector_store_context, show_progress=True
#             )
#             vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
#             response_synthesizer = get_response_synthesizer(response_mode="refine",)
#             query_engine = RetrieverQueryEngine(retriever=vector_store_retriever, response_synthesizer=response_synthesizer)
#             # query_engine.update_prompts(
#             #     {"response_synthesizer:text_qa_template": custom_prompt}
#             # )
#     else:
#         vector_store_index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
#         vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
#         response_synthesizer = get_response_synthesizer(response_mode="refine",)
#         query_engine = RetrieverQueryEngine(retriever=vector_store_retriever, response_synthesizer=response_synthesizer)
#         # query_engine.update_prompts(
#         #     {"response_synthesizer:text_qa_template": custom_prompt}
#         # )
#     return query_engine
#
# def get_query_engine():
#     return initialize_index()


import os
from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext, get_response_synthesizer
from llama_index.core.settings import Settings
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.legacy.embeddings import GeminiEmbedding
from llama_index.llms.gemini import Gemini
from llama_index.vector_stores.postgres import PGVectorStore
from sqlalchemy import create_engine, text, make_url
import psycopg2
from dotenv import load_dotenv

load_dotenv()

Settings.embed_model = GeminiEmbedding(model_name="models/text-embedding-004")
Settings.llm = Gemini(model_name="models/gemini-1.5-flash-latest")

connection_string = os.environ["POSTGRESQL_URI"]

query_engines = {}


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

    vector_store_context = StorageContext.from_defaults(vector_store=vector_store)
    vector_store_index = VectorStoreIndex.from_documents(
        documents, storage_context=vector_store_context, show_progress=True
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


# def save_logo_to_database(bot_id, logo_path):
#     conn = psycopg2.connect(connection_string)
#     try:
#         with conn.cursor() as cur:
#             with open(logo_path, 'rb') as logo_file:
#                 logo_data = logo_file.read()
#             cur.execute(
#                 "INSERT INTO bot_logos (bot_id, logo_data) VALUES (%s, %s) ON CONFLICT (bot_id) DO UPDATE SET logo_data = EXCLUDED.logo_data",
#                 (bot_id, psycopg2.Binary(logo_data))
#             )
#         conn.commit()
#     except Exception as e:
#         print(f"Error saving logo to database: {e}")
#         conn.rollback()
#     finally:
#         conn.close()
#
#
# def get_logo_from_database(bot_id):
#     conn = psycopg2.connect(connection_string)
#     try:
#         with conn.cursor() as cur:
#             cur.execute("SELECT logo_data FROM bot_logos WHERE bot_id = %s", (bot_id,))
#             result = cur.fetchone()
#             return result[0] if result else None
#     except Exception as e:
#         print(f"Error retrieving logo from database: {e}")
#     finally:
#         conn.close()


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
