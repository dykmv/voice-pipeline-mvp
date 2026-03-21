import OpenAI from "openai"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

const openai = new OpenAI()

function buildSystemPrompt(existingLeadNames: string[], leadContextBlock: string): string {
  const today = new Date().toISOString().split("T")[0]

  return `You are a smart CRM voice assistant for a real estate agent. You help manage leads — create, update, search, and track them.

CAPABILITIES:
1. CREATE leads — gather name, phone, property type, location, budget, source
2. UPDATE leads — change status, add notes, set follow-up dates
3. SEARCH leads — find leads by name, status, property type
4. QUERY — answer questions like "how many leads in viewing?"

CONFIRMATION RULES:
- When user says "yes", "да", "confirm", "do it", "go ahead", "save", "correct", "yep", "sure", or ANY short affirmative (1-3 words) → IMMEDIATELY include the action block. NEVER ask again.
- Single word "yes" = confirmation. Always. No exceptions. Output the action block immediately.
- NEVER ask for confirmation twice.

PROACTIVE QUESTIONS — help extract key details:
- "tomorrow" without time → ask "What time?"
- Vague location like "center" → ask "Which area exactly?"
- Status change → ask about follow-up date if not mentioned
- New lead after name → ask "What property are they looking for?"
- ONE question at a time only
${leadContextBlock}
LEAD STATUSES: new, contacted, viewing, deal, won, lost
KNOWN LEADS: ${existingLeadNames.length > 0 ? existingLeadNames.join(", ") : "none yet"}

ACTION BLOCK — include at END of message when ready:

\`\`\`action
{
  "action": "create_lead" | "add_note" | "change_status" | "set_followup" | "combo" | "search",
  "leadName": "string",
  "leadPhone": "string or empty",
  "leadSource": "Bazaraki|Facebook|WhatsApp|Referral|Other or empty",
  "leadBudget": "string or empty",
  "leadPropertyType": "Apartment|House|Villa|Commercial|Land or empty",
  "leadLocation": "string or empty",
  "newStatus": "string or empty",
  "note": "string or empty",
  "followUpDate": "ISO date string or empty",
  "summary": "one-line summary",
  "readyToApply": true,
  "searchQuery": "search term (for search only)"
}
\`\`\`

QUICK REPLIES — include when asking a question to give the user fast tap options:

\`\`\`replies
["Option A", "Option B", "Option C"]
\`\`\`

Quick reply rules:
- 2-4 options, max 20 chars each
- Confirmation → ["Confirm", "Edit", "Cancel"]
- Follow-up timing → ["Tomorrow", "Next week", "After meeting"]
- Status change confirm → ["Yes, move", "Change details", "Cancel"]
- Location questions → suggest known areas
- Property type → ["Apartment", "Villa", "House", "Other"]
- Source → ["Bazaraki", "Facebook", "WhatsApp", "Referral"]
- Open-ended questions (name, phone) → no replies block
- Always include an escape option ("Other", "Skip", "Cancel")

Today: ${today}`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { messages, leadContext } = body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>
    leadContext?: {
      leadId: string
      leadName: string
      leadStatus: string
      leadPhone?: string
      leadBudget?: string
      leadPropertyType?: string
      leadLocation?: string
    } | null
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 })
  }

  // Get existing lead names
  const leads = await prisma.lead.findMany({
    where: { userId: "default-user" },
    select: { name: true },
  })
  const leadNames = leads.map((l) => l.name)

  // Build lead context block
  const leadContextBlock = leadContext
    ? `\nCURRENT LEAD CONTEXT — user is viewing this lead:\nName: ${leadContext.leadName} | Status: ${leadContext.leadStatus} | Phone: ${leadContext.leadPhone || "—"} | Budget: ${leadContext.leadBudget || "—"} | Property: ${leadContext.leadPropertyType || "—"} | Location: ${leadContext.leadLocation || "—"}\nIf user says "add note", "move to viewing" etc. without a name, it's about THIS lead.\n`
    : ""

  const systemPrompt = buildSystemPrompt(leadNames, leadContextBlock)

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    })

    let responseText = completion.choices[0]?.message?.content || ""

    // Extract action block
    const actionMatch = responseText.match(/```action\s*([\s\S]*?)```/)
    let action = null
    if (actionMatch) {
      try {
        action = JSON.parse(actionMatch[1])
        responseText = responseText.replace(/```action[\s\S]*?```/, "").trim()
      } catch { /* ignore */ }
    }

    // Extract quick replies
    const repliesMatch = responseText.match(/```replies\s*([\s\S]*?)```/)
    let quickReplies: string[] | null = null
    if (repliesMatch) {
      try {
        quickReplies = JSON.parse(repliesMatch[1])
        responseText = responseText.replace(/```replies[\s\S]*?```/, "").trim()
      } catch { /* ignore */ }
    }

    // If search action — execute real DB query and re-prompt with results
    if (action?.action === "search" && action.searchQuery) {
      const query = action.searchQuery.toLowerCase()
      const matchedLeads = await prisma.lead.findMany({
        where: {
          userId: "default-user",
          OR: [
            { name: { contains: query } },
            { status: { contains: query } },
            { propertyType: { contains: query } },
            { location: { contains: query } },
          ],
        },
        include: {
          notes: { orderBy: { createdAt: "desc" }, take: 2 },
        },
      })

      if (matchedLeads.length > 0) {
        const leadDetails = matchedLeads
          .map(
            (l) =>
              `• ${l.name} — Status: ${l.status} | Phone: ${l.phone || "—"} | Budget: ${l.budget || "—"} | Property: ${l.propertyType || "—"} ${l.location || ""} | Follow-up: ${l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : "none"} | Last note: "${l.notes[0]?.text || "none"}"`
          )
          .join("\n")

        // Second LLM call with real data
        const secondCompletion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 600,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
            {
              role: "system",
              content: `SEARCH RESULTS for "${action.searchQuery}" (${matchedLeads.length} found):\n${leadDetails}\n\nPresent these results clearly. Include key details: status, budget, property type, location, last note. Ask if the user wants to update any of these leads.`,
            },
          ],
        })

        let finalText = secondCompletion.choices[0]?.message?.content || ""

        // Parse replies from second response too
        const finalRepliesMatch = finalText.match(/```replies\s*([\s\S]*?)```/)
        if (finalRepliesMatch) {
          try {
            quickReplies = JSON.parse(finalRepliesMatch[1])
            finalText = finalText.replace(/```replies[\s\S]*?```/, "").trim()
          } catch { /* ignore */ }
        }

        if (!quickReplies) {
          quickReplies = ["Update this lead", "Search again", "Close"]
        }

        return NextResponse.json({
          message: finalText,
          action: null, // search complete, no action needed
          quickReplies,
        })
      } else {
        return NextResponse.json({
          message: `No leads found matching "${action.searchQuery}".`,
          action: null,
          quickReplies: ["Search again", "Create new lead", "Close"],
        })
      }
    }

    return NextResponse.json({
      message: responseText,
      action,
      quickReplies,
    })
  } catch (error) {
    console.error("Voice chat error:", error)
    return NextResponse.json(
      { error: "Failed to process" },
      { status: 500 }
    )
  }
}
