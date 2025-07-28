**# PetStore Next.js App - README**

## Project Overview

A Next.js–based PetStore application has been built to some point. This README merges the assignment requirements, existing pages, and design concepts into clear step-by-step guidance to complete the app for a perfect grade.

---

## Objectives

1. Implement secure user authentication and session management with NextAuth.js.
2. Protect private routes (dashboard, admin) with middleware.
3. Support two login methods: Google OAuth (one-click) and manual email/password.
4. Maintain a consistent, clean color scheme across the app.
5. Leverage existing admin page and public pages effectively.

---

## Key Requirements (Mentor Assignment)

- **Authentication**: Use NextAuth.js as the primary auth solution.
- **Middleware**: Restrict access to authenticated-only pages (`/dashboard`, `/admin`).
- **Login Page**: Support Email & Password.
- **Register Page**: New user sign-up.
- **Public Pages**: Accessible without login (`/`, `/about`, `/products`, `/product/[id]`).
- **Protected Pages**: Accessible only when logged in:
  - `/dashboard` (user dashboard)
  - `/admin` (admin: add/edit/delete products)
- **Display**: Show authenticated user’s name/email on protected pages.
- **Sign In & Sign Out**: Fully implement with NextAuth.js.
- **GitHub Submission**: Push repo and submit link to LMS.

---

## Existing Pages and Access Levels

| Path             | Access  | Description                                        |
| ---------------- | ------- | -------------------------------------------------- |
| `/`              | Public  | Landing page showcasing PetStore promo.            |
| `/about`         | Public  | About the PetStore and team.                       |
| `/products`      | Public  | List of all products available.                    |
| `/product/[id]`  | Public  | Detail page for a single product.                  |
| `/auth/login`    | Public  | Login form with Email/Password + Google.           |
| `/auth/register` | Public  | User registration form.                            |
| `/dashboard`     | Private | User dashboard—protected. Displays user info.      |
| `/admin`         | Private | Admin page—add, edit, delete products (protected). |
| `/api/auth/*`    | Public  | NextAuth.js endpoints.                             |

---

## Tech Stack

- **Framework**: Next.js (v13+)
- **Auth**: NextAuth.js
- **UI**: Tailwind CSS (or your preferred CSS-in-JS)
- **Database**: Prisma ORM with PostgreSQL (or SQLite for dev)
- **State**: React Context or SWR for session caching

---

## Installation & Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/petstore-nextjs.git
   cd petstore-nextjs
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   # or yarn install
   ```
3. **Environment Variables**: Create a `.env.local` file:

   ```dotenv
   NEXTAUTH_URL=http://localhost:3000
   DATABASE_URL=postgresql://user:pass@localhost:5432/petstore
   NEXTAUTH_SECRET=<generate_a_strong_secret>

   # Google OAuth
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   ```

4. **Database Migration**:
   ```bash
   npx prisma migrate dev --name init
   ```
5. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## Authentication & Middleware

### NextAuth Configuration (`/pages/api/auth/[...nextauth].ts`)

```ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Lookup user in DB and verify password hash
      },
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
});
```

### Middleware (`/middleware.ts`)

```ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/auth/login' },
});

export const config = { matcher: ['/dashboard', '/admin'] };
```

---

## Color Scheme & UI

- **Primary**: `#1E40AF` (Dark Blue)
- **Secondary**: `#22D3EE` (Teal)
- **Accent**: `#F472B6` (Pink)
- **Neutral**: Shades of gray (backgrounds/text)

Define these in `tailwind.config.js` under `theme.extend.colors`.

---

## Step-by-Step Implementation Plan

1. **Data Models**: Verify `User`, `Product`, `Order` schemas—ensure product permissions.
2. **Auth Logic**: Finalize NextAuth providers and credential handling.
3. **Forms & Components**: Build/update `LoginForm`, `RegisterForm`, `Navbar`, `Footer`, `AdminForm`.
4. **Middleware Testing**: Confirm `/dashboard` and `/admin` redirect unauthenticated users.
5. **Admin Page**: Integrate CRUD operations for products.
6. **Public Pages**: Polish `/about`, `/products`, `/product/[id]` layouts.
7. **Styling**: Apply and audit Tailwind theme consistency.
8. **Testing**: Write auth and page-access tests.
9. **Deployment**: Set up Vercel with env vars, incorporate preview workflow.

---

## Notes for Future IDE AI Sessions

- Keep this README updated as source of truth.
- Record every step in `CHANGELOG.md`.
- After each major commit, snapshot UI and note tweaks.
- Securely manage and rotate environment variables.
- Log any third-party library additions.

---

## Submission

- Push all changes to GitHub.
- Submit repository link on LMS by due date.

---

Let’s refine and finalize—feel free to request more details or adjustments!
