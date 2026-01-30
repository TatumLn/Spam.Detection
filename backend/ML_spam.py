import pandas as pd
import string
import nltk
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# 1. Téléchargement des ressources pour le français
nltk.download('stopwords')
stop_words_fr = stopwords.words('french')

# 2. Chargement de la dataset
# Assurez-vous que le fichier csv est dans le même dossier
df = pd.read_csv('french_spam_only.csv')

# 3. Fonction de nettoyage (Preprocessing)
def nettoyage_texte(message):
    # Supprimer la ponctuation
    sans_ponctuation = [char for char in message if char not in string.punctuation]
    message = ''.join(sans_ponctuation)
    
    # Supprimer les mots vides (stopwords) français
    return [mot for mot in message.split() if mot.lower() not in stop_words_fr]

# 4. Préparation des données
X = df['text_fr'] # Les messages
y = df['labels']  # Les étiquettes (ham ou spam)

# Découpage en données d'entraînement (80%) et de test (20%)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Vectorisation (Transformation du texte en nombres)
# Étape A: Compter les mots (Bag of Words)
bow_transformer = CountVectorizer(analyzer=nettoyage_texte).fit(X_train)
X_train_bow = bow_transformer.transform(X_train)

# Étape B: Pondération TF-IDF (pour donner moins d'importance aux mots trop fréquents)
tfidf_transformer = TfidfTransformer().fit(X_train_bow)
X_train_tfidf = tfidf_transformer.transform(X_train_bow)

# 6. Entraînement du modèle Naive Bayes
spam_detector = MultinomialNB().fit(X_train_tfidf, y_train)

# 7. Évaluation du modèle
X_test_bow = bow_transformer.transform(X_test)
X_test_tfidf = tfidf_transformer.transform(X_test_bow)
predictions = spam_detector.predict(X_test_tfidf)

print("--- Rapport de Classification ---")
print(classification_report(y_test, predictions))

# 8. Test sur un nouveau message
def predire_message(msg):
    msg_transformed = tfidf_transformer.transform(bow_transformer.transform([msg]))
    prediction = spam_detector.predict(msg_transformed)[0]
    return prediction

# Exemple :
#nouveau_sms = "Félicitations ! Vous avez gagné un iPhone. Cliquez ici pour réclamer votre prix."
nouveau_sms = "salut! veut tu sortir avec moi?"
print(f"Test message : '{nouveau_sms}'")
print(f"Résultat : {predire_message(nouveau_sms)}")