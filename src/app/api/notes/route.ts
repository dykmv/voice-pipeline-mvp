import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// POST /api/notes — add note to a lead
export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.leadId || !body.text) {
    return NextResponse.json(
      { error: "leadId and text are required" },
      { status: 400 }
    )
  }

  const note = await prisma.note.create({
    data: {
      leadId: body.leadId,
      text: body.text,
      type: body.type || "note",
    },
  })

  // Touch the lead's updatedAt
  await prisma.lead.update({
    where: { id: body.leadId },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json(note, { status: 201 })
}
