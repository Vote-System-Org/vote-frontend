# Changelog — VoteSystem Frontend

Toutes les modifications notables de ce projet sont documentées ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.0.0] — Juillet 2025

### Ajouté
- Page d'accueil animée avec AOS
- Menu hamburger mobile
- Page connexion avec CAPTCHA + pré-remplissage QR code
- Page inscription avec indicateur force mot de passe
- Page réinitialisation mot de passe
- Dashboard électeur responsive
- Page de vote avec avatars candidats
- Page confirmation de vote
- Page reçu avec hash SHA-256 + bouton vérifier
- Page vérification hash publique
- Page profil électeur
- Résultats post-clôture avec graphique Chart.js
- Résultats publics
- Dashboard admin responsive
- Gestion scrutins (CRUD + ouvrir/clôturer)
- Gestion candidats + photo Cloudinary + email
- Gestion électeurs avec pagination
- Import liste blanche CSV
- Résultats temps réel + export CSV
- Logs d'audit avec pagination
- QR codes étudiants (admin)
- QR code plateforme téléchargeable + partageable
- Page 404 personnalisée
- Toast notifications professionnelles
- Barre de progression entre les pages
- Loader animé
- Compteur votes temps réel dashboard admin

### Sécurité
- Tokens JWT stockés en mémoire (non localStorage)
- Refresh token en cookie httpOnly
- Intercepteurs Axios pour renouvellement automatique

---

## [0.3.0] — Juin 2025

### Ajouté
- Page vérification hash publique
- QR codes étudiants
- QR code plateforme
- Toast notifications
- Pagination électeurs et logs

### Modifié
- Refonte UI complète — toutes les pages responsive
- Animations AOS sur page d'accueil
- Menu hamburger mobile

---

## [0.2.0] — Juin 2025

### Ajouté
- Dashboard admin complet
- Résultats temps réel avec graphiques
- Export CSV
- Gestion candidats avec photos

### Modifié
- Amélioration UX formulaires
- Responsive mobile

---

## [0.1.0] — Mai 2025

### Ajouté
- Initialisation projet React + Vite + TypeScript
- Configuration Tailwind CSS
- Routing React Router v6
- Contexte authentification JWT
- Pages de base (connexion, inscription, vote)
- Déploiement initial sur Vercel