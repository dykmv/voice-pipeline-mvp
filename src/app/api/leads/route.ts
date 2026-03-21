import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/leads — fetch all leads with latest note
export async function GET() {
  const leads = await prisma.lead.findMany({
    where: { userId: "default-user" },
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(leads)
}

// POST /api/leads — create a new lead
export async function POST(req: NextRequest) {
  const body = await req.json()

  const lead = await prisma.lead.create({
    data: {
      userId: "default-user",
      name: body.name,
      phone: body.phone || "",
      email: body.email || "",
      source: body.source || "",
      budget: body.budget || "",
      propertyType: body.propertyType || "",
      location: body.location || "",
      status: body.status || "new",
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      transactionType: body.transactionType || "",
      leadRole: body.leadRole || "",
      nextAction: body.nextAction || "",
      viewingDate: body.viewingDate ? new Date(body.viewingDate) : null,
      refNumber: body.refNumber || "",
    },
    include: { notes: true },
  })

  // Add initial note if provided
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

  return NextResponse.json(result, { status: 201 })
}
