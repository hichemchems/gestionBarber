# GestionBarber - Salon de Coiffure Management API

Une API REST complète pour la gestion d'un salon de coiffure, développée avec Node.js, Express et MySQL.

## Fonctionnalités

- **Authentification JWT** avec rôles (superAdmin, admin, user)
- **Gestion des utilisateurs** et employés
- **Gestion des forfaits** (packages)
- **Suivi des ventes** et reçus
- **Gestion des dépenses**
- **Calcul automatique des salaires**
- **Charges administratives**
- **Analyses et statistiques**
- **Documentation Swagger**
- **Sécurité** (helmet, rate limiting, CSRF, validation)

## Technologies

- **Backend**: Node.js, Express.js
- **Base de données**: MySQL avec Sequelize ORM
- **Authentification**: JWT
- **Sécurité**: Helmet, CORS, Rate Limiting, CSRF
- **Validation**: Express Validator
- **Documentation**: Swagger/OpenAPI
- **Déploiement**: Compatible o2switch avec Phusion Passenger

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone <repository-url>
   cd gestionBarber
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration**
   - Copier `.env.example` vers `.env`
   - Configurer les variables d'environnement (base de données, JWT, etc.)

4. **Base de données**
   - Créer une base de données MySQL
   - Configurer les variables dans `.env`
   - Initialiser la base de données :
   ```bash
   npm run db:reset
   ```

5. **Démarrage**
   ```bash
   # Développement
   npm run dev

   # Production
   npm run build
   npm start
   ```

## Déploiement sur o2switch

1. **Préparation**
   - S'assurer que Phusion Passenger est activé
   - Configurer les variables d'environnement dans le panneau o2switch
   - Créer la base de données MySQL

2. **Structure des fichiers**
   - Le fichier principal doit être `dist/server.cjs`
   - Les dépendances externes sont configurées dans `vite.config.js`

3. **Variables d'environnement o2switch**
   ```
   NODE_ENV=production
   SERVER_URL=https://votre-domaine.com
   DATABASE_HOST=votre_host_mysql
   DATABASE_USER=votre_user_mysql
   DATABASE_PASSWORD=votre_password_mysql
   DATABASE_DBNAME=votre_base_mysql
   ACCESS_TOKEN_SECRET=votre_secret_jwt
   ```

## API Endpoints

### Authentification
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/logout` - Déconnexion
- `GET /api/v1/auth/me` - Profil utilisateur

### Utilisateurs
- `GET /api/v1/users` - Liste des utilisateurs
- `POST /api/v1/users` - Créer un utilisateur
- `PUT /api/v1/users/:id` - Modifier un utilisateur
- `DELETE /api/v1/users/:id` - Supprimer un utilisateur

### Forfaits
- `GET /api/v1/packages` - Liste des forfaits actifs
- `POST /api/v1/packages` - Créer un forfait
- `PUT /api/v1/packages/:id` - Modifier un forfait
- `DELETE /api/v1/packages/:id` - Désactiver un forfait

### Ventes
- `GET /api/v1/sales/employee/:employeeId` - Ventes d'un employé
- `POST /api/v1/sales/employee/:employeeId` - Ajouter une vente
- `PUT /api/v1/sales/employee/:employeeId/sale/:saleId` - Modifier une vente
- `DELETE /api/v1/sales/employee/:employeeId/sale/:saleId` - Supprimer une vente

### Reçus
- `GET /api/v1/receipts/employee/:employeeId` - Reçus d'un employé
- `POST /api/v1/receipts/employee/:employeeId` - Ajouter un reçu
- `PUT /api/v1/receipts/employee/:employeeId/receipt/:receiptId` - Modifier un reçu
- `DELETE /api/v1/receipts/employee/:employeeId/receipt/:receiptId` - Supprimer un reçu

### Dépenses
- `GET /api/v1/expenses` - Liste des dépenses
- `POST /api/v1/expenses` - Ajouter une dépense
- `PUT /api/v1/expenses/:id` - Modifier une dépense
- `DELETE /api/v1/expenses/:id` - Supprimer une dépense

### Salaires
- `GET /api/v1/salaries/employee/:employeeId` - Salaires d'un employé
- `POST /api/v1/salaries/generate` - Générer les salaires

### Charges Administratives
- `GET /api/v1/admin-charges` - Liste des charges
- `POST /api/v1/admin-charges` - Ajouter une charge
- `PUT /api/v1/admin-charges/:id` - Modifier une charge
- `DELETE /api/v1/admin-charges/:id` - Supprimer une charge

### Analyses
- `GET /api/v1/analytics/dashboard` - Tableau de bord
- `GET /api/v1/analytics/revenue` - Analyses des revenus

## Documentation API

Accédez à la documentation Swagger à l'adresse : `/api-docs`

## Sécurité

- **Authentification JWT** avec expiration
- **Rate limiting** (100 requêtes/15min par IP)
- **Protection CSRF**
- **Headers de sécurité** avec Helmet
- **Validation des données** avec express-validator
- **Hachage des mots de passe** avec scrypt
- **Upload sécurisé** de fichiers

## Structure du projet

```
gestionBarber/
├── src/
│   ├── config.js              # Configuration
│   ├── server.js              # Serveur principal
│   ├── lib/
│   │   ├── auth.js           # Fonctions d'authentification
│   │   └── tokens.js         # Gestion des tokens JWT
│   ├── models/
│   │   ├── index.js          # Connexion DB
│   │   ├── associations.js   # Associations des modèles
│   │   ├── reset.js          # Reset/initialisation DB
│   │   └── *.js              # Modèles Sequelize
│   └── routes/
│       └── *.js              # Routes API
├── uploads/                   # Fichiers uploadés
├── dist/                      # Build de production
├── .env.example               # Exemple de configuration
├── package.json
├── vite.config.js
└── README.md
```

## Scripts NPM

- `npm run dev` - Démarrage en développement
- `npm run build` - Build de production
- `npm start` - Démarrage en production
- `npm run db:reset` - Reset et initialisation de la base de données

## Licence

Ce projet est sous licence MIT.
# gestionBarber
# imadLoft
# imadLoft
# imadLoft
