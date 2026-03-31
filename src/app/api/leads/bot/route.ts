import { prisma } from "@/lib/db"
import { sendPushToUser } from "@/lib/push"
import { NextRequest, NextResponse } from "next/server"

// POST /api/leads/bot — create lead from Telegram bot (API key auth)
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key")
  if (!apiKey || apiKey !== process.env.BOT_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  if (!body.email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 })
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const lead = await prisma.lead.create({
    data: {
      userId: user.id,
      name: body.name || "Unknown",
      phone: body.phone || "",
      email: body.leadEmail || "",
      source: body.source || "Telegram",
      budget: body.budget || "",
      propertyType: body.propertyType || "",
      location: body.location || "",
      status: "new",
      transactionType: body.transactionType || "",
      leadRole: body.leadRole || "",
      nextAction: body.nextAction || "",
      viewingDate: body.viewingDate ? new Date(body.viewingDate) : null,
      refNumber: body.refNumber || "",
    },
  })

  // Add note with extra details if provided
  if (body.note) {
    await prisma.note.create({
      data: {
        leadId: lead.id,
        text: body.note,
        type: "note",
      },
    })
  }

  const result = await prisma.lead.findUnique({
    where: { id: lead.id },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  })

  // Send push notification to user
  await sendPushToUser(
    user.id,
    "Новый лид",
    `${lead.name}${body.source ? ` — ${body.source}` : ""}`,
    { leadId: lead.id },
  )

  return NextResponse.json(result, { status: 201 })
}
