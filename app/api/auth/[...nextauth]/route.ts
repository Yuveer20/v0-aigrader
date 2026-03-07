import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// NextAuth v4 handler for App Router
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
