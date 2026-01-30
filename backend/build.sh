#!/usr/bin/env bash
# Script de build pour Render
# Ce script est exécuté lors du déploiement

set -e  # Arrêter en cas d'erreur

echo "=== Installation des dépendances Python ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Téléchargement des ressources NLTK ==="
python -c "import nltk; nltk.download('stopwords', quiet=True)"

echo "=== Entraînement du modèle ML ==="
python train_model.py

echo "=== Build terminé avec succès ==="
