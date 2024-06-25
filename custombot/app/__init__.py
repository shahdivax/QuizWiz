# from flask import Flask
# from flask_cors import CORS
# from config import Config
# from app.utils import initialize_index
#
# def create_app(config_class=Config):
#     app = Flask(__name__, template_folder='../templates', static_folder='../static')
#     app.config.from_object(config_class)
#     CORS(app)
#
#     from app import routes
#     app.register_blueprint(routes.bp)
#
#     with app.app_context():
#         initialize_index()
#
#     return app

from flask import Flask
from .routes import bp
from app.utils import init_db


def create_app():
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.register_blueprint(bp)

    init_db()

    return app
