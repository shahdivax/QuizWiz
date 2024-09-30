# /* Uncomment the all the comments and lines when running locally */


from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
# import uuid
# import cloudinary
# import cloudinary.uploader
# from cloudinary.utils import cloudinary_url
# import getpass
# from llama_index.core import SimpleDirectoryReader, VectorStoreIndex, StorageContext, get_response_synthesizer, PromptTemplate
# from llama_index.core.settings import Settings
# from llama_index.core.retrievers import VectorIndexRetriever
# from llama_index.core.vector_stores import MetadataFilter, MetadataFilters, ExactMatchFilter, FilterOperator
# from llama_index.core.query_engine import RetrieverQueryEngine
# from llama_index.embeddings.mistralai import MistralAIEmbedding
# from llama_index.llms.mistralai import MistralAI
# from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
# from sqlalchemy import make_url
# from llama_index.vector_stores.postgres import PGVectorStore
# import psycopg2

load_dotenv()

# cloudinary.config(
#     cloud_name=os.environ["CLOUDINARY_NAME"],
#     api_key=os.environ["CLOUDINARY_API"],
#     api_secret=os.environ["CLOUDINARY_SECRET"],
#     secure=True
# )

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'DEFAULT_SECRET_KEY'
    MONGO_URI = os.environ.get('MONGO_URI') or 'DEFAULT_MONGO_URI'

# Settings.embed_model = MistralAIEmbedding(model_name="mistral-embed")
# Settings.llm = MistralAI()

connection_string = os.environ["POSTGRESQL_URI"]

query_engines = {}

def create_app(config_class=Config):
    app = Flask(__name__, template_folder='templates', static_folder='static')
    app.config.from_object(config_class)
    CORS(app)

    # init_db()

    return app

# def sanitize_text(text):
#     return text.replace('\x00', '')

# def get_vector_store(bot_id):
#     url = make_url(connection_string)
#     return PGVectorStore.from_params(
#         database='quizwiz_bot_data',
#         host=url.host,
#         password=url.password,
#         port=url.port,
#         user=url.username,
#         table_name=f"QuizWiz_{bot_id}",
#         embed_dim=1024,
#     )

# def initialize_index_for_bot(bot_id, bot_name, document_paths):
#     vector_store = get_vector_store(bot_id)
#     documents = SimpleDirectoryReader(input_dir=document_paths).load_data()
#     sanitized_documents = [doc.model_copy() for doc in documents]
#     for doc in sanitized_documents:
#         doc.text = sanitize_text(doc.text)

#     vector_store_context = StorageContext.from_defaults(vector_store=vector_store)
#     vector_store_index = VectorStoreIndex.from_documents(
#         sanitized_documents, storage_context=vector_store_context, show_progress=True
#     )

#     vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
#     response_synthesizer = get_response_synthesizer(response_mode="refine")
#     query_engine = RetrieverQueryEngine(retriever=vector_store_retriever, response_synthesizer=response_synthesizer)
#     query_engines[bot_id] = query_engine

# def get_query_engine(bot_id):
#     vector_store = get_vector_store(bot_id)
#     vector_store_index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
#     vector_store_retriever = VectorIndexRetriever(index=vector_store_index, similarity_top_k=5)
#     response_synthesizer = get_response_synthesizer(response_mode="refine")
#     query_engines = RetrieverQueryEngine(retriever=vector_store_retriever,
#                                          response_synthesizer=response_synthesizer)

#     return query_engines

# def init_db():
#     conn = psycopg2.connect(connection_string)
#     with conn.cursor() as c:
#         c.execute("""
#             CREATE TABLE IF NOT EXISTS bot_logos (
#                 bot_id TEXT PRIMARY KEY,
#                 logo_data BYTEA NOT NULL
#             )
#         """)
#         conn.commit()
#     print("Database initialized successfully")

app = create_app()

@app.route('/', methods=['GET'])
def home():
    return render_template('home.html')

@app.route('/index', methods=['GET'])
def index():
    return render_template('index.html')

# @app.route('/chat', methods=['POST'])
# def chat():
#     data = request.json
#     user_input = data.get('input')
#     bot_id = data.get('botId', 'default')

#     if not user_input:
#         return jsonify({'error': 'No input provided'}), 400

#     try:
#         query_engine = get_query_engine(bot_id)
#         response = query_engine.query(user_input)
#         return jsonify({'output': str(response)})
#     except FileNotFoundError:
#         return jsonify({'error': f'Bot with ID {bot_id} not found'}), 404
#     except Exception as e:
#         return jsonify({'error': f'An error occurred: {str(e)}'}), 500

# @app.route('/create-bot', methods=['POST'])
# def create_bot():
#     data_dir = ''
#     bot_logo_link = ''
#     host_url = request.form['hostUrl']
#     bot_name = request.form['botName']
#     bot_logo = request.files.get('logoUpload')
#     documents = request.files.getlist('fileUpload')

#     if len(documents) > 3:
#         return jsonify({'error': 'Maximum 3 files allowed'}), 400

#     total_context_size = 0
#     MAX_CONTEXT_SIZE = 100000

#     for doc in documents:
#         total_context_size += len(doc.read())
#         doc.seek(0)

#     if total_context_size > MAX_CONTEXT_SIZE:
#         return jsonify({'error': 'Total context size exceeds the limit'}), 400

#     bot_id = str(uuid.uuid4()).replace('-', '_')
#     bot_dir = os.path.join('bots', bot_id)
#     os.makedirs(bot_dir, exist_ok=True)

#     bot_logo_link = ''
#     if bot_logo:
#         logo_filename = f"{bot_id}_logo{os.path.splitext(bot_logo.filename)[1]}"
#         os.makedirs(f'{bot_dir}/images/', exist_ok=True)
#         logo_dir = f'{bot_dir}/images/'
#         logo_path = os.path.join(logo_dir, logo_filename)
#         bot_logo.save(logo_path)
#         bot_logo_link = cloudinary.uploader.upload(logo_path, public_id=f"{bot_id}_logo")
#         print(bot_logo_link["secure_url"])

#     doc_filenames = []
#     for doc in documents:
#         os.makedirs(f'{bot_dir}/data/', exist_ok=True)
#         data_dir = f'{bot_dir}/data/'
#         filename = doc.filename
#         doc.save(os.path.join(data_dir, filename))
#         doc_filenames.append(filename)

#     initialize_index_for_bot(bot_id, bot_name, data_dir)

#     return jsonify({
#         'serverUrl': host_url,
#         'botName': bot_name,
#         'botImageUrl': bot_logo_link["secure_url"],
#         'botId': bot_id,
#         'uploadedFiles': [doc.filename for doc in documents]
#     })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

app.run()