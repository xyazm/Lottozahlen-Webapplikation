# config.py
import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://root:@localhost/Bachelorarbeit_Lottoscheinanalyse'  # Verbindungs-URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False 
    MAIL_SERVER = 'sandbox.smtp.mailtrap.io'
    MAIL_PORT = 2525
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = 'noreply@rub.com'
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET = os.getenv('JWT_SECRET')