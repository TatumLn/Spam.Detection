import re


def validate_email(email):
    """Valider le format d'un email"""
    if not email:
        return False, "L'email est requis"

    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, "Format d'email invalide"

    return True, None


def validate_password(password):
    """Valider la force du mot de passe"""
    if not password:
        return False, "Le mot de passe est requis"

    if len(password) < 6:
        return False, "Le mot de passe doit contenir au moins 6 caractères"

    return True, None


def validate_name(name):
    """Valider le nom d'utilisateur"""
    if not name:
        return False, "Le nom est requis"

    if len(name) < 2:
        return False, "Le nom doit contenir au moins 2 caractères"

    if len(name) > 100:
        return False, "Le nom ne peut pas dépasser 100 caractères"

    return True, None


def validate_text(text):
    """Valider le texte à analyser"""
    if not text:
        return False, "Le texte est requis"

    if len(text.strip()) == 0:
        return False, "Le texte ne peut pas être vide"

    if len(text) > 10000:
        return False, "Le texte ne peut pas dépasser 10000 caractères"

    return True, None
