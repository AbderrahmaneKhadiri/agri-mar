# CONTEXTE DU PROJET : AGRICONNECT MAROC (REBUILD)
Tu es un Développeur Expert Next.js (Principal Engineer). Nous allons recréer l'application "AgriMar" de zéro. Il s'agit d'une plateforme SaaS B2B mettant en relation des Agriculteurs et des Entreprises.
L'objectif de ce rebuild est d'appliquer STRICTEMENT une Clean Architecture inspirée du pattern "Presentation -> Service -> Persistence".

# STACK TECHNIQUE IMPOSÉE
- Framework : Next.js 15 (App Router)
- Langage : TypeScript (Strict Mode)
- Base de données : PostgreSQL
- ORM : Drizzle ORM
- Authentification & Sessions (Cookies) : Better-Auth
- Validation : Zod
- Gestion des Droits (RBAC / AuthZ) : CASL (@casl/ability)
- UI : Tailwind CSS v4, Shadcn UI, Lucide React

# RÈGLES D'ARCHITECTURE (INTOUCHABLES)
Le code DOIT être séparé en couches distinctes. Les dépendances vont de haut en bas.

## 1. PRESENTATION LAYER (`src/app`, `src/actions`, `src/data-access`)
- `src/app` : Contient uniquement les RSC (React Server Components), RCC (Client Components) et le routing.
- `src/actions` (Server Actions - Mutations) : 
  - NE CONTIENT AUCUNE LOGIQUE MÉTIER.
  - Rôle : Recevoir le FormData, valider la forme avec Zod, appeler la couche Service, gérer les erreurs, faire un `revalidatePath` ou `redirect`.
- `src/data-access` (DAL - Queries) :
  - Utilisé UNIQUEMENT pour la lecture de données à afficher dans l'UI.
  - Rôle : Vérifier la session, appliquer le cache React, requêter la DB (via les repositories ou raw queries) et retourner des DTOs (Data Transfer Objects) filtrés pour l'UI.

## 2. SERVICE LAYER (`src/services`)
- C'est le CERVEAU de l'application.
- Rôle pour chaque fonction de service :
  1. AuthN : Vérifier la session (via Better-Auth).
  2. AuthZ (RBAC) : Vérifier les droits avec CASL (ex: `ability.can('create', 'Crop')`).
  3. Validation : Re-valider les données d'entrée avec Zod (Sécurité).
  4. Business Logic : Appliquer les règles métier (ex: vérifier qu'une demande de collaboration n'existe pas déjà).
  5. Persistence : Appeler les Repositories pour écrire en base.
  6. Return : Renvoyer un objet de type `{ success: boolean, data?: any, error?: string }`.

## 3. PERSISTENCE LAYER (`src/persistence`)
- C'est la SEULE couche qui importe `drizzle-orm` et la configuration DB.
- `src/persistence/schema.ts` : Définition des tables.
- `src/persistence/repositories/` : Fonctions CRUD simples (insert, update, delete, findById).

# STRUCTURE DE DOSSIERS EXIGÉE
```text
src/
├── app/
├── actions/
├── data-access/
├── services/
├── persistence/
│   ├── db.ts
│   ├── schema.ts
│   └── repositories/
└── lib/
    ├── auth.ts         # Config Better-Auth
    ├── casl.ts         # Règles RBAC
    ├── utils.ts
    └── validations/    # Schemas Zod