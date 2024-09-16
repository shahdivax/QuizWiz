import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'DEFAULT_SECRET_KEY'
    MONGO_URI = os.environ.get('MONGO_URI') or 'DEFAULT_MONGO_URI'