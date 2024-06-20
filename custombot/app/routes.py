from flask import Blueprint, jsonify, request, render_template
from app.utils import query_engine

bp = Blueprint('main', __name__)

@bp.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@bp.route('/chat', methods=['POST'])
def chat():
    user_input = request.json['input']
    response = query_engine.query(user_input)
    return jsonify({'output': [str(response)]})

@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200