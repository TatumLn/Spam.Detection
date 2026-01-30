from datetime import datetime
import json
from ..extensions import db


class SpamAnalysis(db.Model):
    """Modèle pour stocker l'historique des analyses de spam"""
    __tablename__ = 'spam_analyses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    text = db.Column(db.Text, nullable=False)
    is_spam = db.Column(db.Boolean, nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    indicators = db.Column(db.Text)  # JSON array stocké comme texte
    flags = db.Column(db.Text)  # JSON object stocké comme texte
    analyzed_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def set_indicators(self, indicators_list):
        """Stocker les indicateurs comme JSON"""
        self.indicators = json.dumps(indicators_list)

    def get_indicators(self):
        """Récupérer les indicateurs comme liste"""
        if self.indicators:
            return json.loads(self.indicators)
        return []

    def set_flags(self, flags_dict):
        """Stocker les flags comme JSON"""
        self.flags = json.dumps(flags_dict)

    def get_flags(self):
        """Récupérer les flags comme dictionnaire"""
        if self.flags:
            return json.loads(self.flags)
        return {}

    def to_dict(self):
        """Convertir en dictionnaire pour l'API"""
        return {
            'id': self.id,
            'text': self.text[:60] + '...' if len(self.text) > 60 else self.text,
            'full_text': self.text,
            'isSpam': self.is_spam,
            'confidence': self.confidence,
            'indicators': self.get_indicators(),
            'flags': self.get_flags(),
            'time': self.analyzed_at.strftime('%H:%M'),
            'date': self.analyzed_at.strftime('%Y-%m-%d'),
            'analyzed_at': self.analyzed_at.isoformat()
        }

    def __repr__(self):
        return f'<SpamAnalysis {self.id} spam={self.is_spam}>'
