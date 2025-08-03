import { PrismaClient } from '@prisma/client'
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from 'next-auth/adapters'

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  return {
    async createUser(user) {
      const newUser = await prisma.authUser.create({
        data: {
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        },
      })
      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        emailVerified: newUser.emailVerified,
        image: newUser.image,
      }
    },

    async getUser(id) {
      const user = await prisma.authUser.findUnique({
        where: { id },
      })
      if (!user) return null
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        isAdmin: user.isAdmin,
      }
    },

    async getUserByEmail(email) {
      const user = await prisma.authUser.findUnique({
        where: { email },
      })
      if (!user) return null
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        isAdmin: user.isAdmin,
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.authAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      })
      if (!account) return null
      return {
        id: account.user.id,
        name: account.user.name,
        email: account.user.email,
        emailVerified: account.user.emailVerified,
        image: account.user.image,
        isAdmin: account.user.isAdmin,
      }
    },

    async updateUser({ id, ...data }) {
      const user = await prisma.authUser.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
        },
      })
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        isAdmin: user.isAdmin,
      }
    },

    async deleteUser(userId) {
      await prisma.authUser.delete({
        where: { id: userId },
      })
    },

    async linkAccount(account) {
      await prisma.authAccount.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      })
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await prisma.authAccount.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      })
    },

    async createSession({ sessionToken, userId, expires }) {
      const session = await prisma.authSession.create({
        data: {
          sessionToken,
          userId,
          expires,
        },
      })
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      }
    },

    async getSessionAndUser(sessionToken) {
      const userAndSession = await prisma.authSession.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!userAndSession) return null
      const { user, ...session } = userAndSession
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          // Include isAdmin field so session callback can determine role
          isAdmin: user.isAdmin,
        },
      }
    },

    async updateSession({ sessionToken, ...data }) {
      const session = await prisma.authSession.update({
        where: { sessionToken },
        data,
      })
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      }
    },

    async deleteSession(sessionToken) {
      await prisma.authSession.delete({
        where: { sessionToken },
      })
    },

    async createVerificationToken({ identifier, expires, token }) {
      const verificationToken = await prisma.authVerificationToken.create({
        data: {
          identifier,
          expires,
          token,
        },
      })
      return {
        identifier: verificationToken.identifier,
        expires: verificationToken.expires,
        token: verificationToken.token,
      }
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const verificationToken = await prisma.authVerificationToken.delete({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        })
        return {
          identifier: verificationToken.identifier,
          expires: verificationToken.expires,
          token: verificationToken.token,
        }
      } catch (error) {
        return null
      }
    },
  }
}