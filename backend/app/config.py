import os
from datetime import timedelta


def get_database_url():
    """
    Récupère l'URL de la base de données.
    Corrige le préfixe postgres:// vers postgresql:// pour SQLAlchemy.
    """
    database_url = os.environ.get('DATABASE_URL')

    if database_url:
        # Render utilise postgres:// mais SQLAlchemy nécessite postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        return database_url

    # Fallback vers SQLite pour le développement local
    return 'sqlite:///' + os.path.join(os.path.dirname(os.path.dirname(__file__)), 'spam_detector.db')


class Config:
    """Configuration de base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # Database (PostgreSQL en production, SQLite en développement)
    SQLALCHEMY_DATABASE_URI = get_database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'


class DevelopmentConfig(Config):
    """Configuration de développement"""
    DEBUG = True


class ProductionConfig(Config):
    """Configuration de production"""
    DEBUG = False


class TestingConfig(Config):
    """Configuration de test"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
