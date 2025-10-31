# Guide de dépannage - Déploiement o2switch

## Problème actuel
L'application Node.js ne peut pas démarrer sur o2switch avec Phusion Passenger. Erreur : "Web application could not be started by the Phusion Passenger application server."

## Versions testées
- ✅ Version complète (avec toutes les dépendances)
- ✅ Version simplifiée (ES modules)
- ✅ Version minimale (CommonJS avec express + cors uniquement)

Toutes échouent avec la même erreur, indiquant un problème d'environnement plutôt que de code.

## Étapes de dépannage à suivre avec o2switch

### 1. Vérifier les logs Phusion Passenger
```bash
# Sur o2switch, vérifier les logs d'erreur
tail -f /home/[votre-utilisateur]/logs/passenger.log
# Ou chercher l'Error ID dans les logs
grep "15e75713" /home/[votre-utilisateur]/logs/*.log
```

### 2. Vérifier la configuration Node.js
```bash
# Vérifier la version Node.js sur o2switch
node --version
# Doit être Node.js 20.x
```

### 3. Vérifier les permissions
```bash
# Permissions recommandées pour o2switch
chmod -R 755 /home/[votre-utilisateur]/gestionBarber/deploy/
chmod 644 /home/[votre-utilisateur]/gestionBarber/deploy/.htaccess
```

### 4. Configuration .htaccess actuelle
```apache
Configuration pour o2switch - Application Node.js
PassengerEnabled On
PassengerAppRoot /home/dije1636/gestionBarber/deploy
PassengerAppType node
PassengerStartupFile dist/server-minimal.cjs
PassengerAppEnv production

# Redirections pour SPA
RewriteEngine On

# API routes - laisser passer vers l'application Node.js
RewriteCond %{REQUEST_URI} ^/api/ [OR]
RewriteCond %{REQUEST_URI} ^/health$
RewriteRule ^ - [L]

# Fichiers statiques existants - servir directement
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Routes SPA - rediriger vers index.html
RewriteRule ^ index.html [QSA,L]
```

### 5. Test de démarrage manuel
```bash
# Tester le démarrage manuel de l'application
cd /home/[votre-utilisateur]/gestionBarber/deploy
npm start
# Ou directement
node dist/server-minimal.cjs
```

### 6. Variables d'environnement
Vérifier que ces variables sont correctement configurées dans cPanel :
- `NODE_ENV=production`
- Autres variables nécessaires (DB, etc.)

### 7. Structure des fichiers déployés
```
/home/[votre-utilisateur]/gestionBarber/deploy/
├── .htaccess
├── package.json (version minimale)
├── node_modules/
├── dist/
│   ├── server-minimal.cjs
│   ├── index.html
│   └── public/ (fichiers statiques)
├── models/ (optionnel)
└── uploads/ (optionnel)
```

## Questions à poser au support o2switch

1. **Version Node.js** : Quelle version de Node.js est utilisée dans l'environnement Node.js ?
2. **Phusion Passenger** : Quelle version de Passenger est installée ?
3. **Logs détaillés** : Comment obtenir les logs détaillés de Passenger avec les erreurs complètes ?
4. **Configuration spécifique** : Y a-t-il des configurations spécifiques requises pour les applications Node.js ?
5. **Modules système** : Quels modules Node.js système sont disponibles ?

## Solutions alternatives si le problème persiste

### Option A : Utiliser PM2
Si o2switch le permet, utiliser PM2 au lieu de Passenger :
```bash
npm install -g pm2
pm2 start dist/server-minimal.cjs --name gestionBarber
pm2 save
pm2 startup
```

### Option B : Application statique
Convertir l'application en site statique avec pré-rendu si possible.

### Option C : Hébergement alternatif
Considérer un hébergement spécialisé Node.js (Heroku, Vercel, Railway, etc.).

## Commandes de test local
```bash
# Test de l'application minimale localement
cd deploy
npm start
# Puis tester avec curl
curl http://localhost:3000/health
curl http://localhost:3000/
