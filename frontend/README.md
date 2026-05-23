# ⚡ TaskFlow — Application de gestion de projets collaboratifs

## Stack technique
- **Frontend** : HTML / CSS / JavaScript + Axios
- **Backend** : Node.js + Express
- **Base de données** : MongoDB (Docker)
- **Auth** : JWT + bcryptjs

## Démarrage

### 1. Installer les dépendances
cd backend
npm install

### 2. Créer le fichier .env
cp .env.example .env

### 3. Lancer le backend
cd backend
node server.js

### 4. Lancer le frontend
cd frontend
npx serve .

Puis ouvre http://localhost:3000

| # | Fonctionnalité | Développeur |
|---|---|---|
| 1 | Authentification JWT + bcrypt | Yousra |
| 2 | Gestion des projets CRUD | Yousra |
| 3 | Gestion des tâches | Yousra |
| 4 | Assignation des tâches | Yousra |
| 5 | Tableau de bord | Yousra |
| 6 | Filtrage et recherche | Rnad |
| 7 | Brouillons automatiques | Rnad |
| 8 | Gestion des membres | Rnad |
| 9 | Historique des activités | Rnad |
| 10 | Notifications + polling | Rnad |

## Répartition des tâches

| Membre | Rôle | Fonctionnalités |
|---|---|---|
| Yousra | Chef de projet | 1, 2, 3, 4, 5 |
| Rnad | Développeur | 6, 7, 8, 9, 10 |

## Workflow Git

- **main** : code validé
- **develop** : intégration
- **feature/authentification** : fonctionnalité 1
- **feature/projets** : fonctionnalité 2
- **feature/taches** : fonctionnalité 3
- **feature/dashboard** : fonctionnalité 5