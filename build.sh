#!/bin/bash

# Script de build pour o2switch - à exécuter en local avant déploiement
# Ce script fait le build de production et prépare les fichiers pour o2switch

echo "🚀 Démarrage du build pour o2switch..."

# Vérifier que Node.js et npm sont installés
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js d'abord."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer npm d'abord."
    exit 1
fi

echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Échec de l'installation des dépendances"
    exit 1
fi

echo "🔨 Build de production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Échec du build"
    exit 1
fi

echo "📁 Création du dossier de déploiement..."
# Créer le dossier de déploiement avec les fichiers nécessaires
mkdir -p deploy

# Copier les fichiers essentiels
cp -r dist deploy/
cp -r uploads deploy/
cp -r src/models deploy/
cp package.json deploy/
cp vite.config.js deploy/
cp .env.example deploy/

# Créer le fichier .env pour o2switch (à configurer manuellement)
cp .env.example deploy/.env

echo "✅ Build terminé !"
echo ""
echo "📋 Prochaines étapes pour o2switch :"
echo "1. Uploader le contenu du dossier 'deploy' vers votre hébergement"
echo "2. Configurer l'application Node.js dans cPanel :"
echo "   - Version Node.js : 20"
echo "   - Application Root : /chemin/vers/votre/dossier/backend"
echo "   - Application URL : votre-domaine.com/api"
echo "   - Startup File : dist/server.cjs"
echo "3. Configurer les variables d'environnement dans cPanel"
echo "4. Créer un cron job pour garder l'app active :"
echo "   */5 * * * * curl -s https://votre-domaine.com/api/health > /dev/null"
echo ""
echo "📁 Structure recommandée sur o2switch :"
echo "- frontend/ (votre app frontend)"
echo "- backend/ (contenu du dossier deploy/)"
