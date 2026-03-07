import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/classroom.courses.readonly",
            "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
            "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
        }
      }

      // Return previous token if not expired
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token
      }

      // Refresh the token
      if (token.refreshToken) {
        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken,
            }),
          })

          const tokens = await response.json()

          if (!response.ok) throw tokens

          return {
            ...token,
            accessToken: tokens.access_token,
            expiresAt: Date.now() + tokens.expires_in * 1000,
            refreshToken: tokens.refresh_token ?? token.refreshToken,
          }
        } catch (error) {
          console.error("Error refreshing access token", error)
          return { ...token, error: "RefreshAccessTokenError" }
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.error = token.error
      return session
    },
  },
  pages: {
    signIn: "/",
  },
})
