import os
from flask import Flask
from .config import config
from .extensions import db, jwt, cors


def get_cors_origins():
    """Récupère les origines CORS autorisées depuis les variables d'environnement."""
    # Origines par défaut pour le développement local
    origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

    # Ajouter l'URL du frontend Netlify si configurée
    frontend_url = os.environ.get('FRONTEND_URL')
    if frontend_url:
        origins.append(frontend_url)
        # Aussi accepter sans le slash final
        origins.append(frontend_url.rstrip('/'))

    return origins


def create_app(config_name='default'):
    """Factory pattern pour créer l'application Flask"""
    app = Flask(__name__)

    # Charger la configuration
    app.config.from_object(config[config_name])

    # Initialiser les extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": get_cors_origins(),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # Enregistrer les blueprints
    from .routes.auth import auth_bp
    from .routes.spam import spam_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(spam_bp, url_prefix='/api/spam')

    # Créer les tables
    with app.app_context():
        db.create_all()

    # Route de santé
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'SpamGuard API is running'}

    return app
