import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe auth config (no DB / bcrypt imports).
 * Used by middleware. The full config (lib/auth.ts) extends this with the
 * Credentials provider whose `authorize` requires Node runtime.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role
        token.mustChangePassword = (user as any).mustChangePassword
        token.vendorId = (user as any).vendorId
        token.vendorStatus = (user as any).vendorStatus
      }

      if (trigger === 'update' && session) {
        if (session.vendorStatus !== undefined) token.vendorStatus = session.vendorStatus
        if (session.mustChangePassword !== undefined) token.mustChangePassword = session.mustChangePassword
      }

      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as 'ADMIN' | 'VENDOR'
      session.user.mustChangePassword = token.mustChangePassword as boolean
      session.user.vendorId = token.vendorId as string | undefined
      session.user.vendorStatus = token.vendorStatus as any
      return session
    },
  },
}
