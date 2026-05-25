# VoteSystem — Frontend React

Système de vote électronique sécurisé — Interface utilisateur React

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-purple)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-Academic-orange)](LICENSE)

---

## Présentation

Interface utilisateur du système de vote électronique sécurisé, développée en React 18 + TypeScript + Vite.

|               |                        |
| ------------- | ---------------------- |
| **Frontend**  | FOUOGUE Gabriela       |
| **Backend**   | KENMATIO Vicens        |
| **Encadreur** | Ing. KUEDA             |
| **Promotion** | Licence GL — 2025-2026 |

---

## Stack technique

| Élément       | Technologie                |
| ------------- | -------------------------- |
| Framework     | React 18 + TypeScript      |
| Build tool    | Vite                       |
| Styles        | Tailwind CSS v4            |
| Routing       | React Router v6            |
| HTTP          | Axios                      |
| Graphiques    | Chart.js + react-chartjs-2 |
| QR Codes      | qrcode.react               |
| Animations    | AOS                        |
| Notifications | react-hot-toast            |
| Icônes        | Lucide React               |
| Déploiement   | Vercel                     |

---

## URLs de production

| Ressource          | URL                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Application        | [https://vote-frontend-phi.vercel.app](https://vote-frontend-phi.vercel.app)                             |
| QR Code plateforme | [https://vote-frontend-phi.vercel.app/qrcode](https://vote-frontend-phi.vercel.app/qrcode)               |
| Vérification vote  | [https://vote-frontend-phi.vercel.app/verifier-vote](https://vote-frontend-phi.vercel.app/verifier-vote) |

---

## Installation locale

### Prérequis

* Node.js 18+
* npm ou yarn

### Étapes

### 1. Cloner le dépôt

```bash id="l8y5as"
git clone https://github.com/Vote-System-Org/vote-frontend.git
cd vote-frontend
```

### 2. Installer les dépendances

```bash id="9twzpa"
npm install
```

### 3. Configurer les variables d'environnement

```bash id="9t6z6q"
cp .env.example .env
# Modifier .env avec vos valeurs
```

### 4. Lancer le serveur de développement

```bash id="6vk8pn"
npm run dev
```

L'application est accessible sur : `http://localhost:5173`

---

## Scripts disponibles

| Commande          | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Lancer le serveur de développement   |
| `npm run build`   | Construire pour la production        |
| `npm run preview` | Prévisualiser le build de production |
| `npm run lint`    | Vérifier le code avec ESLint         |

---

## Architecture du projet

```text id="r9wdsl"
vote-frontend/
├── public/                     # Fichiers statiques
├── src/
│   ├── api/
│   │   └── axios.ts            # Configuration Axios + intercepteurs JWT
│   ├── context/
│   │   └── AuthContext.tsx     # Contexte d'authentification global
│   ├── hooks/
│   │   └── useToast.tsx        # Hook notifications toast
│   ├── types/
│   │   └── index.ts            # Types TypeScript globaux
│   ├── components/
│   │   └── GraphiqueResultats.tsx  # Composant graphique Chart.js
│   ├── pages/
│   │   ├── public/             # Pages publiques (accueil, résultats...)
│   │   ├── auth/               # Pages authentification
│   │   ├── electeur/           # Espace électeur
│   │   └── admin/              # Back-office administrateur
│   ├── App.tsx                 # Routing principal + guards
│   └── main.tsx                # Point d'entrée
├── .env.example                # Variables d'environnement (modèle)
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Pages de l'application

### Pages publiques

| Route                 | Description                    |
| --------------------- | ------------------------------ |
| `/`                   | Page d'accueil animée          |
| `/connexion`          | Connexion avec CAPTCHA         |
| `/inscription`        | Inscription via matricule      |
| `/resultats/:id`      | Résultats publics post-clôture |
| `/verifier-vote`      | Vérification hash SHA-256      |
| `/qrcode`             | QR code de la plateforme       |
| `/mot-de-passe/reset` | Réinitialisation mot de passe  |

### Espace électeur

| Route                           | Description            |
| ------------------------------- | ---------------------- |
| `/espace/dashboard`             | Scrutins disponibles   |
| `/espace/scrutin/:id`           | Page de vote           |
| `/espace/scrutin/:id/confirmer` | Confirmation du vote   |
| `/espace/vote/recu`             | Reçu de vote avec hash |
| `/espace/profil`                | Profil électeur        |
| `/espace/scrutin/:id/resultats` | Résultats post-clôture |

### Back-office admin

| Route                           | Description              |
| ------------------------------- | ------------------------ |
| `/admin`                        | Tableau de bord          |
| `/admin/scrutins`               | Gestion des scrutins     |
| `/admin/electeurs`              | Gestion des électeurs    |
| `/admin/liste-blanche`          | Import CSV liste blanche |
| `/admin/scrutins/:id/candidats` | Gestion des candidats    |
| `/admin/scrutins/:id/resultats` | Résultats temps réel     |
| `/admin/audit`                  | Logs d'audit SHA-256     |
| `/admin/qrcodes`                | QR codes étudiants       |

---

## Fonctionnalités clés

* **Authentification JWT** — Access token 15min + Refresh token 7j
* **Vote chiffré RSA 2048** — Chiffrement côté backend
* **Anonymat garanti** — Aucun lien Vote ↔ Électeur
* **QR codes** — Accès rapide avec matricule pré-rempli
* **Résultats temps réel** — Graphiques Chart.js
* **Export CSV** — Résultats téléchargeables
* **Responsive** — Mobile + Desktop
* **Animations** — AOS + transitions CSS
* **Toast notifications** — Feedback utilisateur professionnel
* **Barre de progression** — Entre les pages

---

## Variables d'environnement

| Variable            | Description          |
| ------------------- | -------------------- |
| `VITE_API_BASE_URL` | URL de l'API backend |
| `VITE_FRONTEND_URL` | URL du frontend      |

---

## Contribution

```bash id="j3uw72"
# Créer une branche feature
git checkout -b feature/ma-fonctionnalite

# Développer
npm run dev

# Vérifier le code
npm run lint

# Merger via develop
git checkout develop
git merge feature/ma-fonctionnalite
git push origin develop
```

---

*Projet tutoré 2025-2026 — Université — Filière Génie Logiciel*

