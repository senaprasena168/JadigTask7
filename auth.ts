import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { CustomPrismaAdapter } from './src/lib/auth-adapter';
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
  secret: process.env.AUTH_SECRET,
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          select_account: true,
        },
      },
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
          // Only use the new auth_users table
          const user = await prisma.authUser.findUnique({
            where: { email: credentials.email as string }
          });

          if (!user || !user.password) {
            return null;
          }

          // Check if user is verified
          if (!user.isVerified) {
            throw new Error('Please verify your email before logging in');
          }

          // Validate password
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Only grant admin privileges to specific email
          const isSpecificAdmin = user.email === 'aingmeongshop@gmail.com';

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.isAdmin && isSpecificAdmin ? 'admin' : 'user',
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For credentials login, ensure user exists in auth_users table
      if (account?.provider === 'credentials' && user?.email) {
        try {
          // Check if user exists in auth_users table
          let authUser = await prisma.authUser.findUnique({
            where: { email: user.email }
          });

          // If user doesn't exist in auth_users, create them
          if (!authUser) {
            authUser = await prisma.authUser.create({
              data: {
                id: user.id,
                email: user.email,
                name: user.name,
                isAdmin: user.email === 'aingmeongshop@gmail.com',
                isVerified: true,
                provider: 'email'
              }
            });
          }

          // Update user object with database user info
          user.id = authUser.id;
          user.email = authUser.email;
          user.name = authUser.name;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (user && session.user) {
        session.user.id = user.id;
        session.user.email = user.email;
        session.user.name = user.name;

        // Set role based on isAdmin field from database and specific email check
        const isSpecificAdmin = user.email === 'aingmeongshop@gmail.com';
        const isAdmin = (user as any).isAdmin && isSpecificAdmin;
        session.user.role = isAdmin ? 'admin' : 'user';
        
        // Debug logging
        console.log('Session callback - user:', {
          id: user.id,
          email: user.email,
          isAdmin: (user as any).isAdmin,
          isSpecificAdmin,
          finalRole: session.user.role
        });
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      console.log('User signed out:', message);
    },
  },
});
