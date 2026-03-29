import { getServerSession } from "next-auth"
import { headers } from "next/headers"
import jwt from "jsonwebtoken"
import { authOptions } from "./auth"

export async function getUserId(): Promise<string> {
  // 1. Try NextAuth session (web — cookie-based)
  const session = await getServerSession(authOptions)
  if (session?.user) {
    return (session.user as { id: string }).id
  }

  // 2. Try Bearer token (mobile — JWT)
  const headersList = await headers()
  const authorization = headersList.get("authorization")
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7)
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string }
      return decoded.id
    } catch {
      throw new Error("Invalid token")
    }
  }

  throw new Error("Unauthorized")
}
