import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User
from ..utils.validators import validate_email, validate_password, validate_name

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/test-credentials', methods=['GET'])
def get_test_credentials():
    """Récupérer les credentials de test pour la démo"""
    test_email = os.environ.get('TEST_EMAIL')
    test_password = os.environ.get('TEST_PASSWORD')

    if test_email and test_password:
        return jsonify({
            'available': True,
            'email': test_email,
            'password': test_password
        }), 200

    return jsonify({'available': False}), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    """Inscription d'un nouvel utilisateur"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Données requises'}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validation du nom
    valid, error = validate_name(name)
    if not valid:
        return jsonify({'error': error}), 400

    # Validation de l'email
    valid, error = validate_email(email)
    if not valid:
        return jsonify({'error': error}), 400

    # Validation du mot de passe
    valid, error = validate_password(password)
    if not valid:
        return jsonify({'error': error}), 400

    # Vérifier si l'utilisateur existe déjà
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 409

    # Créer le nouvel utilisateur
    user = User(name=name, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Générer le token JWT
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Inscription réussie',
        'user': user.to_dict(),
        'access_token': access_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Connexion d'un utilisateur"""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Données requises'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validation de l'email
    valid, error = validate_email(email)
    if not valid:
        return jsonify({'error': error}), 400

    # Validation du mot de passe
    if not password:
        return jsonify({'error': 'Le mot de passe est requis'}), 400

    # Rechercher l'utilisateur
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

    if not user.is_active:
        return jsonify({'error': 'Ce compte a été désactivé'}), 403

    # Générer le token JWT
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Connexion réussie',
        'user': user.to_dict(),
        'access_token': access_token
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Récupérer le profil de l'utilisateur connecté"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Déconnexion (côté client, supprimer le token)"""
    return jsonify({'message': 'Déconnexion réussie'}), 200
