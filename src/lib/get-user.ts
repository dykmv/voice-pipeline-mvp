import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function getUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return (session.user as { id: string }).id
}
