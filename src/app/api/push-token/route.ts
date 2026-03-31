import { prisma } from "@/lib/db"
import { getUserId } from "@/lib/get-user"
import { NextRequest, NextResponse } from "next/server"

// POST /api/push-token — save Expo push token for current user
export async function POST(req: NextRequest) {
  const userId = await getUserId()
  const { token } = await req.json()

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token is required" }, { status: 400 })
  }

  await prisma.pushToken.upsert({
    where: { token },
    create: { userId, token },
    update: { userId },
  })

  return NextResponse.json({ ok: true })
}
