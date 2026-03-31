import { prisma } from "./db"

interface PushMessage {
  to: string
  title: string
  body: string
  data?: Record<string, string>
  sound?: "default"
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  const tokens = await prisma.pushToken.findMany({
    where: { userId },
    select: { token: true },
  })

  if (tokens.length === 0) return

  const messages: PushMessage[] = tokens.map(({ token }) => ({
    to: token,
    title,
    body,
    data,
    sound: "default",
  }))

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    })
  } catch (err) {
    console.error("Failed to send push notification:", err)
  }
}
