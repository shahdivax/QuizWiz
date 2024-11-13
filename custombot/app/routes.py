from flask import Blueprint, jsonify, request, render_template, send_from_directory
from app.utils import get_query_engine, initialize_index_for_bot  #,save_logo_to_database, get_logo_from_database
import os
import uuid
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from dotenv import load_dotenv
import tempfile
import shutil

load_dotenv()

cloudinary.config(
    cloud_name=os.environ["CLOUDINARY_NAME"],
    api_key=os.environ["CLOUDINARY_API"],
    api_secret=os.environ["CLOUDINARY_SECRET"],
    secure=True
)

# Upload an image


bp = Blueprint('main', __name__)


@bp.route('/', methods=['GET'])
def home():
    return render_template('home.html')


@bp.route('/index', methods=['GET'])
def index():
    return render_template('index.html')


@bp.route('/chat', methods=['POST'])
def chat():
    data = request.json
    # print(f"Received data: {data}")
    user_input = data.get('input')
    bot_id = data.get('botId', 'default')
    # print(f"user_input: {user_input}, bot_id: {bot_id}")

    if not user_input:
        # print("No input provided")
        return jsonify({'error': 'No input provided'}), 400

    try:
        query_engine = get_query_engine(bot_id)
        # print(f"Query engine initialized for bot_id: {bot_id}")
        response = query_engine.query(user_input)
        # print(f"Query response: {response}")
        return jsonify({'output': str(response)})
    except FileNotFoundError:
        # print(f"Bot with ID {bot_id} not found")
        return jsonify({'error': f'Bot with ID {bot_id} not found'}), 404
    except Exception as e:
        # print(f"An error occurred: {str(e)}")
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@bp.route('/create-bot', methods=['POST'])
def create_bot():
    data_dir = ''
    bot_logo_link = ''
    host_url = request.form['hostUrl']
    bot_name = request.form['botName']
    bot_logo = request.files.get('logoUpload')
    documents = request.files.getlist('fileUpload')

    # Check number of files
    if len(documents) > 3:
        return jsonify({'error': 'Maximum 3 files allowed'}), 400

    # Check total context size (assuming 1 byte = 1 character for simplicity)
    total_context_size = 0
    MAX_CONTEXT_SIZE = 1000000  # 100,000 characters (about 50 pages of text)

    for doc in documents:
        total_context_size += len(doc.read())
        doc.seek(0)  # Reset file pointer

    if total_context_size > MAX_CONTEXT_SIZE:
        return jsonify({'error': 'Total context size exceeds the limit'}), 400

    bot_id = str(uuid.uuid4()).replace('-', '_')
    
    # Create temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        # Handle logo upload
        bot_logo_link = ''
        if bot_logo:
            logo_filename = f"{bot_id}_logo{os.path.splitext(bot_logo.filename)[1]}"
            logo_path = os.path.join(temp_dir, logo_filename)
            bot_logo.save(logo_path)
            bot_logo_link = cloudinary.uploader.upload(logo_path, public_id=f"{bot_id}_logo")

        # Handle document uploads
        data_dir = os.path.join(temp_dir, 'data')
        os.makedirs(data_dir)
        
        for doc in documents:
            filename = doc.filename
            doc.save(os.path.join(data_dir, filename))

        # Initialize index
        initialize_index_for_bot(bot_id, bot_name, data_dir)

        # Temporary directory and its contents will be automatically cleaned up

    return jsonify({
        'serverUrl': host_url,
        'botName': bot_name,
        'botImageUrl': bot_logo_link["secure_url"],
        'botId': bot_id,
        'uploadedFiles': [doc.filename for doc in documents]
    })


# @bp.route('/bot-logo/<bot_id>', methods=['GET'])
# def bot_logo(bot_id):
#     bot_dir = os.path.join('bots', bot_id, 'images')
#     logo_file = next((f for f in os.listdir(bot_dir) if f.startswith(f"{bot_id}_logo")), None)
#     if logo_file:
#         return send_from_directory(bot_dir, logo_file)
#     else:
#         return 'Logo not found', 404


@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200
