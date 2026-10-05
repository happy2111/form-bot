# ApplePark Form Admin

React + Vite + shadcn/ui admin panel for job applications.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

API default: `https://api.form.applepark.uz`

## Login (seed)

| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@applepark.uz` | `ChangeMe123!` |
| REVIEWER | `reviewer@applepark.uz` | `ChangeMe123!` |

- **REVIEWER** — list, detail, change status  
- **ADMIN** — same + delete one / clear all

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
