import pandas as pd
import string
import nltk
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report

# 1. Ressources NLTK
nltk.download('stopwords', quiet=True)
stop_words_fr = stopwords.words('french')

# 2. Chargement (Vérifie bien que le fichier est au bon endroit !)
df = pd.read_csv('french_spam_only.csv')

# 3. Nettoyage
def nettoyage_texte(message):
    sans_ponctuation = [char for char in message if char not in string.punctuation]
    message = ''.join(sans_ponctuation)
    return [mot for mot in message.split() if mot.lower() not in stop_words_fr]

# 4. Préparation
X = df['text_fr']
y = df['labels']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Vectorisation
bow_transformer = CountVectorizer(analyzer=nettoyage_texte).fit(X_train)
X_train_bow = bow_transformer.transform(X_train)
tfidf_transformer = TfidfTransformer().fit(X_train_bow)
X_train_tfidf = tfidf_transformer.transform(X_train_bow)

# 6. Entraînement
spam_detector = MultinomialNB().fit(X_train_tfidf, y_train)

# --- LA PARTIE QUI T'INTÉRESSE ---

# 8. Test sur un nouveau message avec SCORE
def predire_message(msg):
    # Transformation du texte
    msg_transformed = tfidf_transformer.transform(bow_transformer.transform([msg]))
    
    # Prédiction de la catégorie (ham ou spam)
    prediction = spam_detector.predict(msg_transformed)[0]
    
    # Récupération des probabilités [prob_ham, prob_spam]
    probabilites = spam_detector.predict_proba(msg_transformed)[0]
    
    # Trouver l'indice correspondant au label 'spam' dans le modèle
    index_spam = list(spam_detector.classes_).index('spam')
    score_spam = probabilites[index_spam] * 100
    
    return prediction, score_spam

# Exemple d'utilisation
nouveau_sms = "salut! T'es jolie 😍."
label, score = predire_message(nouveau_sms)

print(f"\nMessage : '{nouveau_sms}'")
print(f"Verdict : {label.upper()}")
print(f"Probabilité que ce soit un spam : {score:.2f}%")