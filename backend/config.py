# config.py
import os

class Config:
    SQLALCHEMY_DATABASE_URI = (
        f'mysql+mysqlconnector://{os.getenv("DB_USER")}:{os.getenv("DB_PASSWORD")}'
        f'@{os.getenv("DB_SERVER")}/{os.getenv("DB_NAME")}'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False 
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT =  os.getenv('MAIL_PORT')
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = 'noreply@rub.com'
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET = os.getenv('JWT_SECRET')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')