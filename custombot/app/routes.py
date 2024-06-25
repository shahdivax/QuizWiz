# from flask import Blueprint, jsonify, request, render_template
# from app.utils import get_query_engine
#
#
#
# bp = Blueprint('main', __name__)
#
# @bp.route('/', methods=['GET'])
# def index():
#     return render_template('home.html')
#
# @bp.route('/chat', methods=['POST'])
# def chat():
#     user_input = request.json['input']
#     query_engine = get_query_engine()
#     response = query_engine.query(user_input)
#     return jsonify({'output': [str(response)]})
#
# @bp.route('/health', methods=['GET'])
# def health_check():
#     return jsonify({'status': 'healthy'}), 200

from flask import Blueprint, jsonify, request, render_template, send_from_directory
from app.utils import get_query_engine, initialize_index_for_bot
import os
import uuid

bp = Blueprint('main', __name__)


@bp.route('/', methods=['GET'])
def home():
    return render_template('home.html')


@bp.route('/index', methods=['GET'])
def index():
    return render_template('index.html')


@bp.route('/chat', methods=['POST'])
def chat():
    user_input = request.json['input']
    print(user_input)
    bot_id = request.json['botId']
    print(bot_id)
    try:
        query_engine = get_query_engine(bot_id)
        response = query_engine.query(user_input)
        print(response)
        return jsonify({'output': str(response)})
    except FileNotFoundError:
        return jsonify({'error': 'Bot not found'}), 404


@bp.route('/create-bot', methods=['POST'])
def create_bot():
    data_dir = ''
    host_url = request.form['hostUrl']
    bot_name = request.form['botName']
    bot_logo = request.files.get('logoUpload')
    documents = request.files.getlist('fileUpload')

    bot_id = str(uuid.uuid4()).replace('-', '_')
    bot_dir = os.path.join('bots', bot_id)
    os.makedirs(bot_dir, exist_ok=True)

    logo_filename = None
    if bot_logo:
        logo_filename = f"{bot_id}_logo{os.path.splitext(bot_logo.filename)[1]}"
        os.makedirs(f'{bot_dir}/images/', exist_ok=True)
        logo_dir = f'{bot_dir}/images/'
        bot_logo.save(os.path.join(logo_dir, logo_filename))

    doc_filenames = []
    for doc in documents:
        os.makedirs(f'{bot_dir}/data/', exist_ok=True)
        data_dir = f'{bot_dir}/data/'
        filename = doc.filename
        doc.save(os.path.join(data_dir, filename))
        doc_filenames.append(filename)

    initialize_index_for_bot(bot_id, bot_name, data_dir)

    return jsonify({
        'serverUrl': host_url,
        'botName': bot_name,
        'botImageUrl': f"../bots/{bot_id}/images/{bot_id}_logo.png" if logo_filename else None,
        'botId': bot_id,
        'uploadedFiles': [doc.filename for doc in documents]
    })


@bp.route('/bot-logo/<bot_id>', methods=['GET'])
def bot_logo(bot_id):
    bot_dir = os.path.join('bots', bot_id)
    logo_file = next(f for f in os.listdir(bot_dir) if f.startswith(f"{bot_id}_logo"))
    return send_from_directory(bot_dir, logo_file)


@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200
