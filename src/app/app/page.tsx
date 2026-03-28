"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Mic, ChevronDown } from "lucide-react"
import { Navigation } from "@/components/Navigation"
import { PipelineBoard } from "@/components/PipelineBoard"
import { LeadForm } from "@/components/LeadForm"
import { AssistantDialog } from "@/components/voice-assistant/assistant-dialog"
import type { LeadWithNotes } from "@/lib/types"

export default function PipelinePage() {
  const [leads, setLeads] = useState<LeadWithNotes[]>([])
  const [showForm, setShowForm] = useState(false)

  const fetchLeads = useCallback(async () => {
    const res = await fetch("/api/leads")
    const data = await res.json()
    setLeads(data)
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const handleCreateLead = async (formData: Record<string, string>) => {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
    setShowForm(false)
    fetchLeads()
  }

  const handleStatusChange = async (
    leadId: string,
    newStatus: string,
    comment: string
  ) => {
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, statusComment: comment }),
    })
    fetchLeads()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1 overflow-hidden px-4 pb-20 pt-4 md:pb-4 md:pt-2">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              Pipeline
            </h1>
            <p className="text-xs text-muted-foreground">
              {leads.length} active leads
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {showForm && (
          <div className="mb-4 max-w-md rounded-xl border border-border bg-card p-4">
            <LeadForm
              onSubmit={handleCreateLead}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}

        {leads.length === 0 && !showForm ? (
          <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Add your first lead</h2>
            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
              Say &quot;New lead Anna, Limassol, apartment, 200K&quot; or type in the bar below
            </p>
            <ChevronDown className="h-5 w-5 animate-bounce text-muted-foreground" />
          </div>
        ) : (
          <PipelineBoard leads={leads} onStatusChange={handleStatusChange} />
        )}
      </main>

      {/* Voice assistant — FAB + dialog */}
      <AssistantDialog onActionApplied={fetchLeads} />
    </div>
  )
}
