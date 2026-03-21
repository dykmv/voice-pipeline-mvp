import OpenAI from "openai"
import type { VoiceAction } from "./types"

const client = new OpenAI()

const SYSTEM_PROMPT = `You are a voice command parser for a real estate lead pipeline app.
The user (a real estate agent) dictates commands about their leads/buyers.

Parse the voice input and return a JSON object with the action to take.

Available statuses: new, contacted, viewing, deal, won, lost

Return ONLY valid JSON matching this schema:
{
  "action": "create_lead" | "add_note" | "change_status" | "set_followup" | "combo",
  "leadName": "string (name of lead, if mentioned)",
  "leadPhone": "string (phone, if mentioned)",
  "leadSource": "string (Bazaraki|Facebook|WhatsApp|Referral|Other, if mentioned)",
  "leadBudget": "string (budget amount, if mentioned)",
  "leadPropertyType": "string (Apartment|House|Villa|Commercial|Land, if mentioned)",
  "leadLocation": "string (location/area, if mentioned)",
  "newStatus": "string (new status, if changing)",
  "note": "string (note text to add)",
  "followUpDate": "string (ISO date, if mentioned — resolve relative dates like 'tomorrow', 'friday', 'next week' relative to today)",
  "summary": "string (human-readable summary of what will happen, in English)"
}

Rules:
- If the user creates a new lead, action = "create_lead"
- If the user adds a note to an existing lead, action = "add_note"
- If the user changes status, action = "change_status"
- If the user sets a follow-up date, action = "set_followup"
- If multiple actions (e.g. change status + add note + set follow-up), action = "combo"
- Always extract as much info as possible from the text
- The summary should clearly describe ALL actions in one sentence
- Input can be in any language (English, Russian, Greek) — always output JSON in English
- Today's date is: ${new Date().toISOString().split("T")[0]}`

export async function parseVoiceCommand(
  transcript: string,
  context?: { currentLeadId?: string; currentLeadName?: string }
): Promise<VoiceAction> {
  const contextHint = context?.currentLeadName
    ? `\nContext: the user is currently viewing lead "${context.currentLeadName}" (id: ${context.currentLeadId}). If no lead name is mentioned, assume the command is about this lead.`
    : ""

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 500,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT + contextHint,
      },
      {
        role: "user",
        content: `Parse this voice command: "${transcript}"`,
      },
    ],
  })

  const text = response.choices[0]?.message?.content || ""

  try {
    return JSON.parse(text) as VoiceAction
  } catch {
    return {
      action: "add_note",
      note: transcript,
      summary: `Add note: "${transcript}"`,
    }
  }
}
