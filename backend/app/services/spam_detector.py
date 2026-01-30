"""
Service de détection de spam (avec ML + fallback règles)
=========================================================

Ce service utilise en priorité le modèle ML Naive Bayes pour la détection.
Si le modèle n'est pas disponible, il utilise un système de règles heuristiques.
"""

import re
import random

# Tentative d'import du détecteur ML
try:
    from app.services.ml_spam_detector import get_detector, MLSpamDetector
    ML_AVAILABLE = True
except Exception:
    ML_AVAILABLE = False


class SpamDetector:
    """
    Service de détection de spam hybride.

    Utilise:
    - ML (Naive Bayes + TF-IDF) si le modèle est disponible
    - Règles heuristiques en fallback
    """

    # Indicateurs de spam (mots-clés suspects) - utilisés en fallback
    SPAM_INDICATORS = [
        'click here', 'free', 'limited time', 'act now', 'congratulations',
        'winner', 'prize', 'urgent', 'hurry', 'buy now', 'discount',
        'www.', 'http', 'visit my', 'desperate', 'amazing work',
        'make money', 'earn cash', 'work from home', 'no obligation',
        'risk free', 'guarantee', 'credit card', 'wire transfer',
        'nigerian prince', 'lottery', 'inheritance', 'bank account',
        'password', 'verify your', 'suspended', 'confirm your',
        'dear customer', 'dear user', 'click below', 'unsubscribe',
        'order now', 'limited offer', 'exclusive deal', 'special promotion',
        'cliquez ici', 'gratuit', 'temps limité', 'agissez maintenant',
        'félicitations', 'gagnant', 'prix', 'urgent', 'dépêchez-vous',
        'achetez maintenant', 'réduction', 'offre spéciale', 'promotion',
        'gagnez de l\'argent', 'travail à domicile', 'sans risque',
        'carte de crédit', 'virement', 'loterie', 'héritage',
        'mot de passe', 'vérifiez votre', 'suspendu', 'confirmez votre',
        'cher client', 'cher utilisateur', 'désabonnez-vous'
    ]

    # Poids pour chaque type d'indicateur
    WEIGHTS = {
        'indicator': 15,
        'multiple_exclamations': 20,
        'all_caps': 15,
        'url': 10,
        'phone_number': 5,
        'money_symbol': 10,
        'excessive_punctuation': 10
    }

    # Seuil pour classifier comme spam
    SPAM_THRESHOLD = 30

    @classmethod
    def analyze(cls, text):
        """
        Analyser un texte pour détecter s'il s'agit de spam.

        Utilise le modèle ML en priorité, avec fallback sur les règles heuristiques.

        Args:
            text (str): Le texte à analyser

        Returns:
            dict: Résultat de l'analyse avec score, indicateurs et flags
        """
        # Essayer d'utiliser le modèle ML en priorité
        if ML_AVAILABLE:
            try:
                detector = get_detector()
                result = detector.analyze(text)
                result['method'] = 'ml'  # Indiquer la méthode utilisée
                return result
            except Exception as e:
                # En cas d'erreur, utiliser le fallback
                print(f"[SpamDetector] Erreur ML, fallback sur règles: {e}")

        # Fallback: Système basé sur les règles heuristiques
        return cls._analyze_with_rules(text)

    @classmethod
    def _analyze_with_rules(cls, text):
        """
        Analyse basée sur les règles heuristiques (fallback).

        Args:
            text (str): Le texte à analyser

        Returns:
            dict: Résultat de l'analyse
        """
        if not text or not text.strip():
            return {
                'isSpam': False,
                'confidence': 0,
                'indicators': [],
                'flags': {
                    'multipleExclamations': False,
                    'allCaps': False,
                    'suspiciousUrl': False
                },
                'method': 'rules'
            }

        text_lower = text.lower()
        score = 0
        found_indicators = []
        flags = {
            'multipleExclamations': False,
            'allCaps': False,
            'suspiciousUrl': False,
            'phoneNumber': False,
            'moneySymbol': False,
            'excessivePunctuation': False
        }

        # Rechercher les indicateurs de spam
        for indicator in cls.SPAM_INDICATORS:
            if indicator.lower() in text_lower:
                found_indicators.append(indicator)
                score += cls.WEIGHTS['indicator']

        # Vérifier les multiples points d'exclamation
        exclamation_count = text.count('!')
        if exclamation_count >= 3:
            flags['multipleExclamations'] = True
            score += cls.WEIGHTS['multiple_exclamations']

        # Vérifier si le texte est principalement en majuscules
        alpha_chars = [c for c in text if c.isalpha()]
        if alpha_chars:
            caps_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)
            if caps_ratio > 0.6:
                flags['allCaps'] = True
                score += cls.WEIGHTS['all_caps']

        # Vérifier la présence d'URLs
        url_pattern = r'https?://|www\.|\.com|\.net|\.org|\.fr'
        if re.search(url_pattern, text_lower):
            flags['suspiciousUrl'] = True
            score += cls.WEIGHTS['url']

        # Vérifier la présence de numéros de téléphone
        phone_pattern = r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
        if re.search(phone_pattern, text):
            flags['phoneNumber'] = True
            score += cls.WEIGHTS['phone_number']

        # Vérifier la présence de symboles monétaires
        money_pattern = r'[$€£¥₹]|\d+\s*(euro|dollar|usd|eur)'
        if re.search(money_pattern, text_lower):
            flags['moneySymbol'] = True
            score += cls.WEIGHTS['money_symbol']

        # Vérifier la ponctuation excessive
        punctuation_count = sum(1 for c in text if c in '!?.,;:')
        if len(text) > 0 and punctuation_count / len(text) > 0.1:
            flags['excessivePunctuation'] = True
            score += cls.WEIGHTS['excessive_punctuation']

        # Déterminer si c'est du spam
        is_spam = score > cls.SPAM_THRESHOLD

        # Calculer la confiance (entre 60% et 95%)
        base_confidence = min(95, max(60, score + 40))
        confidence = min(95, max(60, base_confidence + random.randint(-5, 5)))

        return {
            'isSpam': is_spam,
            'confidence': confidence,
            'indicators': found_indicators,
            'flags': flags,
            'score': score,
            'method': 'rules'
        }

    @classmethod
    def get_spam_level(cls, confidence):
        """
        Obtenir le niveau de spam basé sur la confiance

        Args:
            confidence (float): Pourcentage de confiance

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
