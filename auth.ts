import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';


declare module 'next-auth' {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role?: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  // Temporarily disable adapter until tables are created
  // adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use raw SQL to query user with actual database structure
          const users = await prisma.$queryRaw<Array<{
            id: string;
            name: string | null;
            email: string;
            password: string | null;
            isAdmin: boolean;
          }>>`
            SELECT id, name, email, password, "isAdmin"
            FROM users
            WHERE email = ${credentials.email as string}
            LIMIT 1
          `;

          const user = users[0];
          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.isAdmin ? "admin" : "user",
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in database using raw SQL
          const existingUsers = await prisma.$queryRaw<Array<{
            id: string;
            email: string;
          }>>`
            SELECT id, email FROM users WHERE email = ${user.email!} LIMIT 1
          `;

          if (existingUsers.length === 0) {
            // Create new user with admin role using raw SQL
            await prisma.$executeRaw`
              INSERT INTO users (id, name, email, password, "isAdmin", "isVerified", provider, "createdAt", "updatedAt")
              VALUES (gen_random_uuid(), ${user.name!}, ${user.email!}, NULL, true, true, 'google', NOW(), NOW())
            `;
          }
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }

      // --- NEW LOGIC FOR SERVER-SIDE REDIRECT FOR OAuth ---
      // This ensures that after a successful OAuth login, the browser history
      // entry for the OAuth callback is replaced by the dashboard.
      if (account && user && account.type === 'oauth') {
        const dashboardUrl = '/admin'; // This is your desired post-login URL
        console.log(`[Auth.js] Redirecting OAuth user to: ${dashboardUrl}`);
        // For Auth.js v5, we return a redirect URL string instead of Response object
        return dashboardUrl;
      }

      // For Credentials sign-in, or if the above OAuth condition isn't met,
      // allow Auth.js's default behavior, which your client-side `redirect: false` expects.
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      // Handle account switching by clearing old token data
      if (trigger === 'signIn') {
        // Clear existing token data for fresh sign-in
        if (account?.provider === 'google') {
          try {
            // Get fresh user data from database using raw SQL
            const dbUsers = await prisma.$queryRaw<Array<{
              id: string;
              name: string | null;
              email: string;
              isAdmin: boolean;
            }>>`
              SELECT id, name, email, "isAdmin" FROM users WHERE email = ${user?.email!} LIMIT 1
            `;
            
            if (dbUsers.length > 0) {
              const dbUser = dbUsers[0];
              // Create a fresh token with new user data
              return {
                ...token,
                role: dbUser.isAdmin ? "admin" : "user",
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                sub: dbUser.id,
              };
            }
          } catch (error) {
            console.error('Error fetching user in JWT callback:', error);
            // Don't fail the entire auth process, use default values
            return {
              ...token,
              role: 'admin',
              id: user?.id || token.sub,
              email: user?.email,
              name: user?.name,
            };
          }
        } else if (user) {
          // For credentials login
          return {
            ...token,
            role: user.role,
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      } else if (account?.provider === 'google' && token.email) {
        try {
          // Get user from database using raw SQL
          const dbUsers = await prisma.$queryRaw<Array<{
            id: string;
            isAdmin: boolean;
          }>>`
            SELECT id, "isAdmin" FROM users WHERE email = ${token.email} LIMIT 1
          `;
          
          if (dbUsers.length > 0) {
            const dbUser = dbUsers[0];
            token.role = dbUser.isAdmin ? "admin" : "user";
            token.id = dbUser.id;
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error);
          token.role = 'admin';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async signOut(message) {
      console.log('User signed out:', message);
    },
  },
});
