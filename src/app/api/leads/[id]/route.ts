import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/leads/[id] — fetch lead with all notes
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json(lead)
}

// PATCH /api/leads/[id] — update lead fields and/or status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  // If status is changing, add a status_change note
  if (body.status) {
    const current = await prisma.lead.findUnique({ where: { id } })
    if (current && current.status !== body.status) {
      const comment = body.statusComment || `Status changed to ${body.status}`
      await prisma.note.create({
        data: {
          leadId: id,
          text: comment,
          type: "status_change",
        },
      })
    }
  }

  const updateData: Record<string, unknown> = {}
  if (body.name !== undefined) updateData.name = body.name
  if (body.phone !== undefined) updateData.phone = body.phone
  if (body.email !== undefined) updateData.email = body.email
  if (body.source !== undefined) updateData.source = body.source
  if (body.budget !== undefined) updateData.budget = body.budget
  if (body.propertyType !== undefined) updateData.propertyType = body.propertyType
  if (body.location !== undefined) updateData.location = body.location
  if (body.status !== undefined) updateData.status = body.status
  if (body.followUpDate !== undefined) {
    updateData.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: updateData,
    include: {
      notes: { orderBy: { createdAt: "desc" } },
    },
  })

  return NextResponse.json(lead)
}
