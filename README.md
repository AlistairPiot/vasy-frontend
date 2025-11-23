# Vasy Frontend

Interface utilisateur SvelteKit pour la plateforme de créateurs.

## Prérequis

- Node.js 18+
- npm

## Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
```

## Lancement

```bash
# Serveur de développement
npm run dev

# Le site est accessible sur http://localhost:5173
```

## Build production

```bash
npm run build
npm run preview
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL de l'API backend |

## Stack

- SvelteKit
- TailwindCSS
- Shadcn-svelte
- GSAP (animations)
