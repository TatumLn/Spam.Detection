import os
import re
import pandas as pd
import string
import joblib
import unicodedata
import nltk
from nltk.corpus import stopwords
from nltk.stem.snowball import FrenchStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline

# --- CONFIGURATION ---
nltk.download('stopwords', quiet=True)
stemmer = FrenchStemmer()
stop_words_fr = stopwords.words('french')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'french_spam_only.csv')
MODEL_FILE = os.path.join(BASE_DIR, 'spam_model_ultra.pkl')

# --- AMÉLIORATION : NETTOYAGE EXPERT ---
def preprocessing_expert(message):
    # 1. Normalisation Unicode (enlève les accents : "gagné" -> "gagne")
    # Cela permet de regrouper les mots même si l'utilisateur oublie l'accent
    message = "".join(c for c in unicodedata.normalize('NFD', message) if unicodedata.category(c) != 'Mn')
    
    # 2. Gestion du Leetspeak (remplacer les chiffres suspects par des lettres)
    leetspeak = {'0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b'}
    for num, char in leetspeak.items():
        # On ne remplace que si c'est au milieu d'un mot suspect
        message = re.sub(rf'(?<=[a-zA-Z]){num}(?=[a-zA-Z])', char, message)

    message = message.lower()
    
    # 3. Marqueurs sémantiques (URLs, Téléphones, Monnaies)
    message = re.sub(r'http\S+|www\S+', '_URL_', message)
    message = re.sub(r'\d{10}', '_PHONE_', message)
    message = re.sub(r'[€$£%]', '_CASH_', message)
    
    # 4. Ponctuation & Stemming
    message = "".join([char for char in message if char not in string.punctuation])
    return [stemmer.stem(mot) for mot in message.split() if mot not in stop_words_fr]

class UltraSpamEngine:
    def __init__(self):
        self.model = None
        self.charger_ou_entrainer()

    def charger_ou_entrainer(self):
        if os.path.exists(MODEL_FILE):
            print("📦 Chargement de l'IA Ultra...")
            self.model = joblib.load(MODEL_FILE)
        else:
            self.entrainer()

    def entrainer(self):
        print("🧠 Entraînement du SVM (Précision maximale)...")
        df = pd.read_csv(DATA_FILE)
        
        # On utilise LinearSVC (SVM) au lieu de Naive Bayes
        # On l'enveloppe dans CalibratedClassifierCV pour avoir les % de probabilité
        svc_model = LinearSVC(C=1.0, class_weight='balanced', random_state=42)
        clf = CalibratedClassifierCV(svc_model) 

        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(analyzer=preprocessing_expert, ngram_range=(1, 3))), # Trigrammes inclus !
            ('svm', clf)
        ])
        
        pipeline.fit(df['text_fr'], df['labels'])
        self.model = pipeline
        joblib.dump(pipeline, MODEL_FILE)
        print("✅ Modèle Ultra sauvegardé.")

    def predire(self, message):
        label = self.model.predict([message])[0]
        probs = self.model.predict_proba([message])[0]
        idx_spam = list(self.model.classes_).index('spam')
        score = probs[idx_spam] * 100
        
        # Bonus : Détection d'agressivité (MAJUSCULES)
        if message.isupper() and len(message) > 10:
            score = min(score + 20, 100) # Augmente le score si c'est tout en majuscules
            
        return label, score

# --- DÉMONSTRATION ---
if __name__ == "__main__":
    ia = UltraSpamEngine()

    tests = [
        "Salut, tu peux m'envoyer le dossier ?", # Ham normal
        "V1TE !! G4GNEZ du C4SH ici : http://bit.ly/123", # Obfusqué
        "URGENT : VOTRE COMPTE VA EXPIRER" # Majuscules
    ]

    for t in tests:
        res, pts = ia.predire(t)
        print(f"\n[{res.upper()}] ({pts:.1f}%) -> {t}")