import { parseVoiceCommand } from "@/lib/voice-parser"
import { NextRequest, NextResponse } from "next/server"

// POST /api/voice — parse voice transcript into structured action
export async function POST(req: NextRequest) {
  const body = await req.json()

  if (!body.transcript) {
    return NextResponse.json(
      { error: "transcript is required" },
      { status: 400 }
    )
  }

  try {
    const action = await parseVoiceCommand(body.transcript, {
      currentLeadId: body.currentLeadId,
      currentLeadName: body.currentLeadName,
    })

    return NextResponse.json(action)
  } catch (error) {
    console.error("Voice parsing error:", error)
    return NextResponse.json(
      { error: "Failed to parse voice command" },
      { status: 500 }
    )
  }
}
