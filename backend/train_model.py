"""
Script d'entraînement et sauvegarde du modèle ML de détection de spam
=====================================================================

Ce script:
1. Charge le dataset de spam en français
2. Prétraite les textes (nettoyage, suppression stopwords)
3. Entraîne un modèle Naive Bayes avec TF-IDF
4. Sauvegarde le modèle et les transformers pour utilisation en production
"""

import os
import sys
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, accuracy_score

# Ajouter le chemin du backend au PYTHONPATH pour les imports
backend_dir = os.path.dirname(__file__)
sys.path.insert(0, backend_dir)

# Importer la fonction de nettoyage depuis le module partagé
from app.services.text_preprocessor import nettoyage_texte

# Chemin vers le dossier model
MODEL_DIR = os.path.join(backend_dir, 'model')
os.makedirs(MODEL_DIR, exist_ok=True)


def train_and_save_model():
    """
    Entraîne le modèle et sauvegarde tous les composants nécessaires.

    Returns:
        dict: Métriques d'évaluation du modèle
    """
    print("=" * 60)
    print("ENTRAINEMENT DU MODELE DE DETECTION DE SPAM")
    print("=" * 60)

    # 1. Chargement du dataset
    csv_path = os.path.join(os.path.dirname(__file__), 'french_spam_only.csv')
    print(f"\n[1] Chargement du dataset: {csv_path}")

    df = pd.read_csv(csv_path)
    print(f"   - Nombre total de messages: {len(df)}")
    print(f"   - Distribution des classes:")
    print(df['labels'].value_counts().to_string().replace('\n', '\n     '))

    # 2. Preparation des donnees
    X = df['text_fr']
    y = df['labels']

    # Decoupage train/test (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n[2] Decoupage des donnees:")
    print(f"   - Entrainement: {len(X_train)} messages")
    print(f"   - Test: {len(X_test)} messages")

    # 3. Vectorisation avec Bag of Words
    print("\n[3] Vectorisation (Bag of Words + TF-IDF)...")
    bow_transformer = CountVectorizer(analyzer=nettoyage_texte)
    bow_transformer.fit(X_train)
    X_train_bow = bow_transformer.transform(X_train)
    print(f"   - Vocabulaire: {len(bow_transformer.vocabulary_)} mots uniques")

    # 4. Transformation TF-IDF
    tfidf_transformer = TfidfTransformer()
    tfidf_transformer.fit(X_train_bow)
    X_train_tfidf = tfidf_transformer.transform(X_train_bow)

    # 5. Entrainement du modele Naive Bayes
    print("\n[4] Entrainement du modele Naive Bayes...")
    model = MultinomialNB()
    model.fit(X_train_tfidf, y_train)

    # 6. Evaluation sur le jeu de test
    X_test_bow = bow_transformer.transform(X_test)
    X_test_tfidf = tfidf_transformer.transform(X_test_bow)
    predictions = model.predict(X_test_tfidf)

    accuracy = accuracy_score(y_test, predictions)
    print(f"\n[5] Performance du modele:")
    print(f"   - Accuracy: {accuracy:.2%}")
    print("\n   Rapport de classification:")
    report = classification_report(y_test, predictions)
    print("   " + report.replace('\n', '\n   '))

    # 7. Sauvegarde des composants
    print("\n[6] Sauvegarde du modele...")

    model_data = {
        'bow_transformer': bow_transformer,
        'tfidf_transformer': tfidf_transformer,
        'model': model,
        'accuracy': accuracy
    }

    model_path = os.path.join(MODEL_DIR, 'spam_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)

    print(f"   [OK] Modele sauvegarde: {model_path}")
    print("=" * 60)

    return {
        'accuracy': accuracy,
        'vocab_size': len(bow_transformer.vocabulary_),
        'train_size': len(X_train),
        'test_size': len(X_test)
    }


if __name__ == '__main__':
    metrics = train_and_save_model()
    print(f"\n[SUCCESS] Entrainement termine avec une accuracy de {metrics['accuracy']:.2%}")
