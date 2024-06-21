from flask import Flask
from flask_cors import CORS
from config import Config
from app.utils import initialize_index

def create_app(config_class=Config):
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config.from_object(config_class)
    CORS(app)

    from app import routes
    app.register_blueprint(routes.bp)

    with app.app_context():
        initialize_index()

    return app