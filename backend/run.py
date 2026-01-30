import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

from app import create_app

# Créer l'application
app = create_app(os.environ.get('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # Lancer le serveur de développement
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=app.config['DEBUG']
    )
