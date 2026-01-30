import os
import re
import pandas as pd
import string
import joblib
import nltk
from nltk.corpus import stopwords
from nltk.stem.snowball import FrenchStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# --- 1. CONFIGURATION ---
nltk.download('stopwords', quiet=True)
stemmer = FrenchStemmer()
stop_words_fr = stopwords.words('french')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'french_spam_only.csv')
MODEL_FILE = os.path.join(BASE_DIR, 'spam_model.pkl')

# --- 2. LA FONCTION DOIT ÊTRE DÉFINIE AVANT LE CHARGEMENT ---
def preprocessing_ultra(message):
    message = message.lower()
    message = re.sub(r'http\S+|www\S+|https\S+', '_URL_', message, flags=re.MULTILINE)
    message = re.sub(r'\d{10}', '_PHONE_', message)
    message = re.sub(r'[€$£]', '_MONNAIE_', message)
    message = "".join([char for char in message if char not in string.punctuation])
    return [stemmer.stem(mot) for mot in message.split() if mot not in stop_words_fr]

class SpamEngine:
    def __init__(self):
        self.model = None
        self.charger_ou_entrainer()

    def charger_ou_entrainer(self, force_retrain=False):
        # Si le fichier .pkl existe, on ne ré-entraîne pas !
        if os.path.exists(MODEL_FILE) and not force_retrain:
            print("📦 MODE RAPIDE : Chargement du modèle existant (pas d'entraînement)...")
            try:
                self.model = joblib.load(MODEL_FILE)
            except Exception as e:
                print(f"⚠️ Erreur de chargement : {e}. Ré-entraînement forcé...")
                self.entrainer()
        else:
            self.entrainer()

    def entrainer(self):
        print("🧠 MODE APPRENTISSAGE : Entraînement du modèle en cours...")
        if not os.path.exists(DATA_FILE):
            raise FileNotFoundError(f"Fichier {DATA_FILE} introuvable.")
        
        df = pd.read_csv(DATA_FILE)
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(analyzer=preprocessing_ultra, ngram_range=(1, 2))),
            ('nb', MultinomialNB(alpha=0.1))
        ])
        
        pipeline.fit(df['text_fr'], df['labels'])
        self.model = pipeline
        joblib.dump(pipeline, MODEL_FILE)
        print("💾 Modèle sauvegardé dans 'spam_model.pkl'.")

    def predire(self, message):
        label = self.model.predict([message])[0]
        prob = self.model.predict_proba([message])[0]
        idx_spam = list(self.model.classes_).index('spam')
        score = prob[idx_spam] * 100
        return label, score

# --- EXÉCUTION ---
if __name__ == "__main__":
    ia = SpamEngine() # Ici, il va charger s'il existe, sinon il entraîne.

    msg = "Félicitation ! vous avez ganier 500£ ?"
    verdict, score = ia.predire(msg)
    print(f"\nRésultat : {verdict} ({score:.2f}%)")