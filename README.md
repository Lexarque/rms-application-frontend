# rms-application-frontend — Local Development Guide

## 📑 Table of Contents
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Project Directory Structure](#-project-directory-structure)
- [Branch Naming Convention](#-branch-naming-convention)
- [File & Folder Naming Convention](#-file--folder-naming-convention)

---

## 📦 Prerequisites

Make sure the following are installed on your local machine (Windows):

| Tool | Version |
| :--- | :--- |
| Node.js | 20+ (LTS recommended) |
| npm | Comes with Node.js |

---

## 🚀 Getting Started

### 1. Clone the project
```bash
git clone <this-repository-url>
cd rms-application-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Then edit the `.env` file and update the values as needed:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build locally |
| `npm run typecheck` | Run type generation and TypeScript checks |

---

## 📁 Project Directory Structure

```text
.
├── app/
│   ├── components/          # Shared/reusable UI components
│   │   └── ui/              # Base UI components (buttons, inputs, modals, etc.)
│   ├── hooks/               # Custom React hooks (e.g. useAuth, useDebounce)
│   ├── lib/
│   │   └── axios.ts         # Axios instance with base URL and interceptors
│   ├── queries/             # TanStack Query hooks (useQuery, useMutation per module)
│   │   ├── staffs/
│   │   └── orders/, payments/, etc.
│   ├── types/               # Shared TypeScript type definitions
│   ├── root.tsx             # App root layout and providers
│   └── app.css              # Global styles
├── public/                  # Static assets (favicon, images, etc.)
├── .env                     # Local environment variables (Git ignored)
├── .env.example             # Template for environment variables
├── .dockerignore
├── Dockerfile
├── react-router.config.ts   # React Router configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

## 🌿 Branch Naming Convention

Always use lowercase and separate words with hyphens (`kebab-case`).

**Format:** `type/short-description`

| Type | Purpose | Example |
| :--- | :--- | :--- |
| `feature/` | A new feature or functionality | `feat/user-authentication` |
| `fix/` | A bug fix | `fix/token-expiry-redirect` |

---

## 🗂️ File & Folder Naming Convention

Consistent naming keeps the codebase predictable. Follow these rules across the project:

### Folders
Use **lowercase kebab-case** for all folders.
```text
✅ user-profile/
✅ order-details/
❌ UserProfile/
❌ orderDetails/
```

### Route Files (React Router 7)
React Router 7 uses file-based routing. Follow the flat-file convention with dot-notation for nested routes.

| Pattern | Route | Example File |
| :--- | :--- | :--- |
| `{module}.tsx` | `/module` | `app/routes/staffs.tsx` |
| `{module}.$id.tsx` | `/module/:id` | `app/routes/staffs.$id.tsx` |
| `{module}_.create.tsx` | `/module/create` (pathless layout) | `app/routes/staffs_.create.tsx` |

### Components
Use **PascalCase** for component files — each file should export a single component matching its filename.
```text
✅ StaffCard.tsx
✅ OrderStatusBadge.tsx
❌ staffCard.tsx
❌ order-status-badge.tsx
```

### Hooks
Prefix with `use` and use **camelCase**.
```text
✅ useAuth.ts
✅ useStaffList.ts
❌ AuthHook.ts
```

### TanStack Query Files
Group query hooks by module. Use **camelCase** filenames and keep `useQuery` and `useMutation` hooks co-located per module.
```text
app/queries/
├── staffs/
│   └── useStaffsQuery.ts      ← list queries
│   └── useCreateStaffMutation.ts
├── orders/
│   └── useOrdersQuery.ts
```

### Types
Use **PascalCase** for type and interface names. Keep shared types in `app/types/`.
```text
✅ export interface Staff { ... }
✅ export type OrderStatus = "pending" | "completed"
```

---

## ✅ You're Ready!

The project should now be running locally. Happy coding!
