import os
import re
import pandas as pd
import string
import joblib  # Pour sauvegarder le modèle
import nltk
from nltk.corpus import stopwords
from nltk.stem.snowball import FrenchStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# --- CONFIGURATION ET RESSOURCES ---
nltk.download('stopwords', quiet=True)
stemmer = FrenchStemmer()
stop_words_fr = stopwords.words('french')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'french_spam_only.csv')
MODEL_FILE = os.path.join(BASE_DIR, 'spam_model.pkl')

# --- AMÉLIORATION 1 : NORMALISATION ---
def preprocessing_ultra(message):
    # Convertir en minuscule
    message = message.lower()
    # Remplacer les URLs par un mot clé
    message = re.sub(r'http\S+|www\S+|https\S+', '_URL_', message, flags=re.MULTILINE)
    # Remplacer les numéros de téléphone (approximatif)
    message = re.sub(r'\d{10}', '_PHONE_', message)
    # Remplacer les symboles monétaires
    message = re.sub(r'[€$£]', '_MONNAIE_', message)
    
    # Suppression ponctuation
    message = "".join([char for char in message if char not in string.punctuation])
    
    # Stemming et Stopwords
    return [stemmer.stem(mot) for mot in message.split() if mot not in stop_words_fr]

class SpamEngine:
    def __init__(self):
        self.model = None
        self.charger_ou_entrainer()

    def charger_ou_entrainer(self, force_retrain=False):
        if os.path.exists(MODEL_FILE) and not force_retrain:
            print("Chargement du modèle sauvegardé...")
            self.model = joblib.load(MODEL_FILE)
        else:
            self.entrainer()

    def entrainer(self):
        print(" Entraînement en cours (cela peut prendre quelques secondes)...")
        if not os.path.exists(DATA_FILE):
            raise FileNotFoundError(f"Fichier {DATA_FILE} introuvable.")
        
        df = pd.read_csv(DATA_FILE)
        
        # Pipeline optimisé
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(analyzer=preprocessing_ultra, ngram_range=(1, 2))),
            ('nb', MultinomialNB(alpha=0.1))
        ])
        
        pipeline.fit(df['text_fr'], df['labels'])
        self.model = pipeline
        # Sauvegarde sur le disque
        joblib.dump(pipeline, MODEL_FILE)
        print(" Modèle sauvegardé avec succès.")

    def predire(self, message):
        label = self.model.predict([message])[0]
        prob = self.model.predict_proba([message])[0]
        idx_spam = list(self.model.classes_).index('spam')
        score = prob[idx_spam] * 100
        return label, score

    # --- AMÉLIORATION 2 : AJOUT DYNAMIQUE ---
    def apprendre_nouveau(self, message, label):
        # 1. Mise à jour du CSV
        nouveau = pd.DataFrame([[label, message]], columns=['labels', 'text_fr'])
        nouveau.to_csv(DATA_FILE, mode='a', header=False, index=False)
        # 2. Ré-entraînement forcé
        self.entrainer()
        print(f" L'IA a appris ce nouveau message comme '{label}'")

# --- TEST DU SYSTÈME ---
if __name__ == "__main__":
    ia = SpamEngine()

    msg = "cheri tu me manque !! Appelez sur  0601020304"
    verdict, score = ia.predire(msg)
    
    print(f"\nANALYSE : {msg}")
    print(f"RÉSULTAT : {verdict.upper()} ({score:.2f}%)")

    # Exemple de feedback loop :
    # ia.apprendre_nouveau("Ceci est un message très spécifique", "ham")