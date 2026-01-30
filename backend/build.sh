#!/bin/bash
# Script de build pour Render

set -e

echo "=== Installation des dependances Python ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Telechargement des ressources NLTK ==="
python -c "import nltk; nltk.download('stopwords', quiet=True)"

echo "=== Entrainement du modele ML ==="
python train_model.py

echo "=== Build termine avec succes ==="
