"""
Module de prétraitement de texte pour la détection de spam
===========================================================

Ce module contient les fonctions de nettoyage de texte utilisées
à la fois pour l'entraînement et l'inférence du modèle ML.
"""

import string

# Stopwords français (liste statique pour éviter les dépendances NLTK au runtime)
FRENCH_STOPWORDS = {
    'au', 'aux', 'avec', 'ce', 'ces', 'dans', 'de', 'des', 'du', 'elle', 'en',
    'et', 'eux', 'il', 'ils', 'je', 'la', 'le', 'les', 'leur', 'lui', 'ma',
    'mais', 'me', 'même', 'mes', 'moi', 'mon', 'ne', 'nos', 'notre', 'nous',
    'on', 'ou', 'par', 'pas', 'pour', 'qu', 'que', 'qui', 'sa', 'se', 'ses',
    'son', 'sur', 'ta', 'te', 'tes', 'toi', 'ton', 'tu', 'un', 'une', 'vos',
    'votre', 'vous', 'c', 'd', 'j', 'l', 'm', 'n', 's', 't', 'y', 'été',
    'étée', 'étées', 'étés', 'étant', 'suis', 'es', 'est', 'sommes', 'êtes',
    'sont', 'serai', 'seras', 'sera', 'serons', 'serez', 'seront', 'serais',
    'serait', 'serions', 'seriez', 'seraient', 'étais', 'était', 'étions',
    'étiez', 'étaient', 'fus', 'fut', 'fûmes', 'fûtes', 'furent', 'sois',
    'soit', 'soyons', 'soyez', 'soient', 'fusse', 'fusses', 'fût', 'fussions',
    'fussiez', 'fussent', 'ayant', 'eu', 'eue', 'eues', 'eus', 'ai', 'as',
    'avons', 'avez', 'ont', 'aurai', 'auras', 'aura', 'aurons', 'aurez',
    'auront', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient', 'avais',
    'avait', 'avions', 'aviez', 'avaient', 'eut', 'eûmes', 'eûtes', 'eurent',
    'aie', 'aies', 'ait', 'ayons', 'ayez', 'aient', 'eusse', 'eusses', 'eût',
    'eussions', 'eussiez', 'eussent', 'ceci', 'cela', 'celà', 'cet', 'cette',
    'ici', 'là', 'les', 'leurs', 'quel', 'quels', 'quelle', 'quelles', 'sans',
    'soi', 'donc', 'or', 'ni', 'car', 'alors', 'ainsi', 'après', 'avant',
    'bien', 'comme', 'comment', 'encore', 'entre', 'faire', 'fait', 'fois',
    'gens', 'grand', 'ici', 'là', 'moins', 'non', 'oui', 'parce', 'plus',
    'pourquoi', 'quand', 'rien', 'si', 'tous', 'tout', 'toute', 'toutes',
    'très', 'trop', 'être', 'avoir', 'aussi', 'autres', 'autre', 'chaque',
    'déjà', 'depuis', 'deux', 'encore', 'faire', 'fait', 'hors', 'ici', 'là',
    'mêmes', 'peu', 'peut', 'plupart', 'premier', 'près', 'quoi', 'sans',
    'sous', 'tandis', 'tel', 'telle', 'tels', 'telles', 'tous', 'vu'
}


def nettoyage_texte(message):
    """
    Nettoie un message en supprimant la ponctuation et les stopwords français.

    Cette fonction est utilisée comme analyzer pour le CountVectorizer.
    Elle doit être importable pour que le modèle pickle puisse la retrouver.

    Args:
        message (str): Le texte à nettoyer

    Returns:
        list: Liste des mots nettoyés (sans ponctuation ni stopwords)
    """
    if not isinstance(message, str):
        return []

    # Supprimer la ponctuation
    sans_ponctuation = [char for char in message if char not in string.punctuation]
    message_clean = ''.join(sans_ponctuation)

    # Supprimer les stopwords et mettre en minuscule
    return [
        mot.lower()
        for mot in message_clean.split()
        if mot.lower() not in FRENCH_STOPWORDS
    ]
