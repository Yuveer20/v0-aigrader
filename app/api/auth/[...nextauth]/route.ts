/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// NextAuth v4 handler - DO NOT use 'handlers' export
const authHandler = NextAuth(authOptions)

export const GET = authHandler
export const POST = authHandler
