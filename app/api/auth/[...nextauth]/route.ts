import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth-config"

const nextAuthHandler = NextAuth(authConfig)

export { nextAuthHandler as GET, nextAuthHandler as POST }
