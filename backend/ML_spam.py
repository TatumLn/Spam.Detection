import os
import pandas as pd
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem.snowball import FrenchStemmer # Pour le français
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# 1. Configuration des ressources
nltk.download('stopwords', quiet=True)
stemmer = FrenchStemmer()
stop_words_fr = stopwords.words('french')

# Gestion dynamique du chemin du fichier
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'french_spam_only.csv')

# 2. Fonction de nettoyage avancée (avec Stemming)
def preprocessing_complet(message):
    # Suppression ponctuation
    message = "".join([char for char in message if char not in string.punctuation])
    
    # Découpage + Suppression Stopwords + Racinisation (Stemming)
    # Exemple: "gagneras" -> "gagn"
    mots_nettoyes = [
        stemmer.stem(mot) 
        for mot in message.split() 
        if mot.lower() not in stop_words_fr
    ]
    return mots_nettoyes

# 3. Chargement des données
if not os.path.exists(DATA_FILE):
    print(f"Erreur : placez le fichier CSV dans : {BASE_DIR}")
else:
    df = pd.read_csv(DATA_FILE)
    X_train, X_test, y_train, y_test = train_test_split(
        df['text_fr'], df['labels'], test_size=0.2, random_state=42
    )

    # 4. Création du Pipeline (Plus propre et performant)
    # On ajoute ngram_range=(1,2) pour détecter les suites de 2 mots
    pipeline_spam = Pipeline([
        ('vectorizer', TfidfVectorizer(analyzer=preprocessing_complet, ngram_range=(1, 2))),
        ('classifier', MultinomialNB(alpha=0.1)) # alpha réduit pour être plus sensible
    ])

    # 5. Entraînement
    pipeline_spam.fit(X_train, y_train)
    print("🚀 Modèle ultra-optimisé entraîné !")

    # 6. Fonction de prédiction améliorée
    def analyser_message(msg):
        prediction = pipeline_spam.predict([msg])[0]
        probabilites = pipeline_spam.predict_proba([msg])[0]
        
        # Récupère l'index de la classe 'spam'
        classes = list(pipeline_spam.classes_)
        idx_spam = classes.index('spam')
        score_spam = probabilites[idx_spam] * 100
        
        return prediction, score_spam

    # --- TEST ---
    tests = [
        "Salut, tu viens manger ce soir ?",
        "URGENT ! Votre compte est bloqué. Cliquez ici pour gagner 1000€"
    ]

    for t in tests:
        label, score = analyser_message(t)
        print(f"\nMessage : {t}")
        print(f"Verdict : {label.upper()} | Score Spam : {score:.2f}%")