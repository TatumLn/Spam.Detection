from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from ..extensions import db
from ..models.analysis import SpamAnalysis
from ..services.spam_detector import SpamDetector
from ..utils.validators import validate_text

spam_bp = Blueprint('spam', __name__)


@spam_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_spam():
    """Analyser un texte pour détecter le spam"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Données requises'}), 400

    text = data.get('text', '')

    # Validation du texte
    valid, error = validate_text(text)
    if not valid:
        return jsonify({'error': error}), 400

    # Analyser le texte
    result = SpamDetector.analyze(text)

    # Sauvegarder l'analyse dans l'historique
    analysis = SpamAnalysis(
        user_id=user_id,
        text=text,
        is_spam=result['isSpam'],
        confidence=result['confidence']
    )
    analysis.set_indicators(result['indicators'])
    analysis.set_flags(result['flags'])

    db.session.add(analysis)
    db.session.commit()

    return jsonify({
        'id': analysis.id,
        'isSpam': result['isSpam'],
        'confidence': result['confidence'],
        'indicators': result['indicators'],
        'flags': result['flags'],
        'level': SpamDetector.get_spam_level(result['confidence'])
    }), 200


@spam_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Récupérer l'historique des analyses de l'utilisateur"""
    user_id = int(get_jwt_identity())

    # Paramètres de pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    # Limiter per_page à 100 max
    per_page = min(per_page, 100)

    # Récupérer les analyses paginées
    pagination = SpamAnalysis.query.filter_by(user_id=user_id) \
        .order_by(SpamAnalysis.analyzed_at.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    analyses = [analysis.to_dict() for analysis in pagination.items]

    return jsonify({
        'history': analyses,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@spam_bp.route('/history/<int:analysis_id>', methods=['GET'])
@jwt_required()
def get_analysis(analysis_id):
    """Récupérer une analyse spécifique"""
    user_id = int(get_jwt_identity())

    analysis = SpamAnalysis.query.filter_by(
        id=analysis_id,
        user_id=user_id
    ).first()

    if not analysis:
        return jsonify({'error': 'Analyse non trouvée'}), 404

    return jsonify({'analysis': analysis.to_dict()}), 200


@spam_bp.route('/history/<int:analysis_id>', methods=['DELETE'])
@jwt_required()
def delete_analysis(analysis_id):
    """Supprimer une analyse de l'historique"""
    user_id = int(get_jwt_identity())

    analysis = SpamAnalysis.query.filter_by(
        id=analysis_id,
        user_id=user_id
    ).first()

    if not analysis:
        return jsonify({'error': 'Analyse non trouvée'}), 404

    db.session.delete(analysis)
    db.session.commit()

    return jsonify({'message': 'Analyse supprimée'}), 200


@spam_bp.route('/history/clear', methods=['DELETE'])
@jwt_required()
def clear_history():
    """Effacer tout l'historique de l'utilisateur"""
    user_id = int(get_jwt_identity())

    SpamAnalysis.query.filter_by(user_id=user_id).delete()
    db.session.commit()

    return jsonify({'message': 'Historique effacé'}), 200


@spam_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Récupérer les statistiques de l'utilisateur"""
    user_id = int(get_jwt_identity())

    # Total des analyses
    total = SpamAnalysis.query.filter_by(user_id=user_id).count()

    if total == 0:
        return jsonify({
            'stats': {
                'total': 0,
                'spam': 0,
                'legitimate': 0,
                'spamRate': 0,
                'averageConfidence': 0
            }
        }), 200

    # Nombre de spams détectés
    spam_count = SpamAnalysis.query.filter_by(
        user_id=user_id,
        is_spam=True
    ).count()

    # Messages légitimes
    legitimate_count = total - spam_count

    # Taux de spam
    spam_rate = round((spam_count / total) * 100, 1) if total > 0 else 0

    # Confiance moyenne
    avg_confidence = db.session.query(
        func.avg(SpamAnalysis.confidence)
    ).filter_by(user_id=user_id).scalar()

    avg_confidence = round(avg_confidence, 1) if avg_confidence else 0

    # Statistiques des dernières 24h
    from datetime import datetime, timedelta
    last_24h = datetime.utcnow() - timedelta(hours=24)

    recent_total = SpamAnalysis.query.filter(
        SpamAnalysis.user_id == user_id,
        SpamAnalysis.analyzed_at >= last_24h
    ).count()

    recent_spam = SpamAnalysis.query.filter(
        SpamAnalysis.user_id == user_id,
        SpamAnalysis.is_spam == True,
        SpamAnalysis.analyzed_at >= last_24h
    ).count()

    return jsonify({
        'stats': {
            'total': total,
            'spam': spam_count,
            'legitimate': legitimate_count,
            'spamRate': spam_rate,
            'averageConfidence': avg_confidence,
            'recent': {
                'total': recent_total,
                'spam': recent_spam,
                'legitimate': recent_total - recent_spam
            }
        }
    }), 200
