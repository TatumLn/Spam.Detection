"""
Service ML de détection de spam
================================

Ce service charge le modèle ML pré-entraîné et fournit une interface
pour analyser les textes et détecter les spams.

Architecture du modèle:
1. CountVectorizer (Bag of Words) - Transforme le texte en vecteurs de comptage
2. TfidfTransformer - Applique la pondération TF-IDF
3. MultinomialNB - Classifieur Naive Bayes multinomial
"""

import os
import pickle
import re

# Importer la fonction de nettoyage partagée (nécessaire pour le unpickle)
from app.services.text_preprocessor import nettoyage_texte  # noqa: F401

# Chemin vers le modèle
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    'model',
    'spam_model.pkl'
)


class MLSpamDetector:
    """
    Service de détection de spam basé sur le Machine Learning.

    Utilise un modèle Naive Bayes entraîné sur des messages français
    avec vectorisation TF-IDF pour classifier les messages en spam/ham.
    """

    _instance = None
    _model_data = None

    def __new__(cls):
        """Singleton pattern pour éviter de recharger le modèle."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        """Charge le modèle depuis le fichier pickle."""
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Modèle non trouvé: {MODEL_PATH}\n"
                "Exécutez d'abord: python train_model.py"
            )

        with open(MODEL_PATH, 'rb') as f:
            self._model_data = pickle.load(f)

        self.bow_transformer = self._model_data['bow_transformer']
        self.tfidf_transformer = self._model_data['tfidf_transformer']
        self.model = self._model_data['model']
        self.model_accuracy = self._model_data.get('accuracy', 0.95)

    def predict(self, text):
        """
        Prédit si un texte est un spam ou non.

        Args:
            text (str): Le texte à analyser

        Returns:
            tuple: (prediction, probabilité_spam, probabilité_ham)
        """
        # Transformer le texte
        text_bow = self.bow_transformer.transform([text])
        text_tfidf = self.tfidf_transformer.transform(text_bow)

        # Prédiction
        prediction = self.model.predict(text_tfidf)[0]

        # Probabilités
        probabilities = self.model.predict_proba(text_tfidf)[0]
        classes = self.model.classes_

        # Trouver les indices des classes
        spam_idx = list(classes).index('spam') if 'spam' in classes else 1
        ham_idx = list(classes).index('ham') if 'ham' in classes else 0

        prob_spam = probabilities[spam_idx] * 100
        prob_ham = probabilities[ham_idx] * 100

        return prediction, prob_spam, prob_ham

    def analyze(self, text):
        """
        Analyse complète d'un texte pour la détection de spam.

        Args:
            text (str): Le texte à analyser

        Returns:
            dict: Résultat complet de l'analyse
        """
        if not text or not text.strip():
            return {
                'isSpam': False,
                'confidence': 0,
                'indicators': [],
                'flags': {
                    'multipleExclamations': False,
                    'allCaps': False,
                    'suspiciousUrl': False,
                    'phoneNumber': False,
                    'moneySymbol': False,
                    'excessivePunctuation': False
                },
                'mlPrediction': 'ham',
                'mlConfidence': 0
            }

        # Prédiction ML
        prediction, prob_spam, prob_ham = self.predict(text)
        is_spam = prediction == 'spam'

        # Confiance basée sur la probabilité ML
        confidence = prob_spam if is_spam else prob_ham

        # Analyse des patterns (pour les indicateurs visuels)
        flags = self._analyze_patterns(text)
        indicators = self._find_indicators(text)

        return {
            'isSpam': is_spam,
            'confidence': round(confidence, 2),
            'indicators': indicators,
            'flags': flags,
            'mlPrediction': prediction,
            'mlConfidence': round(prob_spam, 2),
            'modelAccuracy': round(self.model_accuracy * 100, 2)
        }

    def _analyze_patterns(self, text):
        """Analyse les patterns suspects dans le texte."""
        flags = {
            'multipleExclamations': False,
            'allCaps': False,
            'suspiciousUrl': False,
            'phoneNumber': False,
            'moneySymbol': False,
            'excessivePunctuation': False
        }

        # Points d'exclamation multiples
        if text.count('!') >= 3:
            flags['multipleExclamations'] = True

        # Texte en majuscules
        alpha_chars = [c for c in text if c.isalpha()]
        if alpha_chars:
            caps_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)
            if caps_ratio > 0.6:
                flags['allCaps'] = True

        # URLs
        url_pattern = r'https?://|www\.|\.com|\.net|\.org|\.fr'
        if re.search(url_pattern, text.lower()):
            flags['suspiciousUrl'] = True

        # Numéros de téléphone
        phone_pattern = r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
        if re.search(phone_pattern, text):
            flags['phoneNumber'] = True

        # Symboles monétaires
        money_pattern = r'[$€£¥₹]|\d+\s*(euro|dollar|usd|eur)'
        if re.search(money_pattern, text.lower()):
            flags['moneySymbol'] = True

        # Ponctuation excessive
        punctuation_count = sum(1 for c in text if c in '!?.,;:')
        if len(text) > 0 and punctuation_count / len(text) > 0.1:
            flags['excessivePunctuation'] = True

        return flags

    def _find_indicators(self, text):
        """Trouve les mots-clés suspects dans le texte."""
        spam_keywords = [
            'gratuit', 'gagnant', 'prix', 'urgent', 'félicitations',
            'cliquez', 'offre', 'promotion', 'réduction', 'loterie',
            'héritage', 'argent', 'crédit', 'virement', 'gagner',
            'free', 'winner', 'prize', 'click', 'offer', 'discount',
            'lottery', 'inheritance', 'money', 'credit', 'transfer'
        ]

        text_lower = text.lower()
        found = []

        for keyword in spam_keywords:
            if keyword in text_lower:
                found.append(keyword)

        return found

    @classmethod
    def get_spam_level(cls, confidence):
        """
        Détermine le niveau de spam basé sur la confiance.

        Args:
            confidence (float): Score de confiance (0-100)

        Returns:
            str: Niveau de spam (low, medium, high, critical)
        """
        if confidence < 40:
            return 'low'
        elif confidence < 60:
            return 'medium'
        elif confidence < 80:
            return 'high'
        else:
            return 'critical'


# Instance globale du détecteur (lazy loading)
_detector = None


def get_detector():
    """Retourne l'instance du détecteur ML (singleton)."""
    global _detector
    if _detector is None:
        _detector = MLSpamDetector()
    return _detector
