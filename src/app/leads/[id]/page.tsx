"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Phone, Mail, MapPin, Building, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AssistantDialog } from "@/components/voice-assistant/assistant-dialog"
import { PIPELINE_STATUSES, LEAD_SOURCES, PROPERTY_TYPES } from "@/lib/types"
import { cn } from "@/lib/utils"
import type { LeadWithNotes } from "@/lib/types"

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<LeadWithNotes | null>(null)
  const [newNote, setNewNote] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Record<string, string>>({})
  const [statusComment, setStatusComment] = useState("")
  const [showStatusDialog, setShowStatusDialog] = useState<string | null>(null)

  const fetchLead = useCallback(async () => {
    const res = await fetch(`/api/leads/${params.id}`)
    if (res.ok) {
      setLead(await res.json())
    }
  }, [params.id])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  if (!lead) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, text: newNote }),
    })
    setNewNote("")
    fetchLead()
  }

  const handleStatusChange = async (newStatus: string) => {
    setShowStatusDialog(newStatus)
  }

  const confirmStatusChange = async () => {
    if (!showStatusDialog) return
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: showStatusDialog,
        statusComment: statusComment || `Moved to ${showStatusDialog}`,
      }),
    })
    setShowStatusDialog(null)
    setStatusComment("")
    fetchLead()
  }

  const handleEdit = async () => {
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })
    setIsEditing(false)
    setEditData({})
    fetchLead()
  }

  const handleFollowUp = async (date: string) => {
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpDate: date }),
    })
    fetchLead()
  }

  const statusLabel =
    PIPELINE_STATUSES.find((s) => s.id === lead.status)?.label || lead.status

  return (
    <div className="min-h-screen pb-20 md:pb-4">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-xs text-muted-foreground">Use mic button below</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4">
        {/* Lead header */}
        <div className="mb-6">
          <div className="mb-2 flex items-start justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              {lead.name}
            </h1>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true)
                  setEditData({
                    name: lead.name,
                    phone: lead.phone,
                    email: lead.email,
                    source: lead.source,
                    budget: lead.budget,
                    propertyType: lead.propertyType,
                    location: lead.location,
                  })
                }}
              >
                Edit
              </Button>
            )}
          </div>

          {/* Status selector */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {PIPELINE_STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id !== lead.status) handleStatusChange(s.id)
                }}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  s.id === lead.status
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Lead info */}
          {isEditing ? (
            <div className="space-y-2 rounded-lg border border-border bg-card p-4">
              <Input
                value={editData.name || ""}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, name: e.target.value }))
                }
                placeholder="Name"
              />
              <Input
                value={editData.phone || ""}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, phone: e.target.value }))
                }
                placeholder="Phone"
              />
              <Input
                value={editData.email || ""}
                onChange={(e) =>
                  setEditData((d) => ({ ...d, email: e.target.value }))
                }
                placeholder="Email"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={editData.source || ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, source: e.target.value }))
                  }
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Source</option>
                  {LEAD_SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={editData.propertyType || ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, propertyType: e.target.value }))
                  }
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Property type</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={editData.budget || ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, budget: e.target.value }))
                  }
                  placeholder="Budget"
                />
                <Input
                  value={editData.location || ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, location: e.target.value }))
                  }
                  placeholder="Location"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleEdit} size="sm" className="flex-1">Save</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {lead.phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <a href={`tel:${lead.phone}`} className="hover:text-foreground">
                    {lead.phone}
                  </a>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {lead.email}
                </div>
              )}
              {lead.budget && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" />
                  {lead.budget}
                </div>
              )}
              {lead.propertyType && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building className="h-3.5 w-3.5" />
                  {lead.propertyType}
                </div>
              )}
              {lead.location && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {lead.location}
                </div>
              )}
              {lead.source && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  Source: {lead.source}
                </div>
              )}
            </div>
          )}

          {/* Follow-up date */}
          <div className="mt-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Follow-up:</span>
            <input
              type="date"
              value={
                lead.followUpDate
                  ? new Date(lead.followUpDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleFollowUp(e.target.value)}
              className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            />
          </div>
        </div>

        {/* Add note */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              placeholder="Add a note..."
              className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button onClick={handleAddNote} size="sm">
              Add
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Timeline
          </h2>
          {lead.notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "rounded-lg border border-border p-3",
                note.type === "status_change" && "border-l-2 border-l-primary",
                note.type === "voice" && "border-l-2 border-l-placy-blue"
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase"
                >
                  {note.type === "status_change"
                    ? "Status"
                    : note.type === "voice"
                    ? "Voice"
                    : "Note"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm">{note.text}</p>
            </div>
          ))}
          {lead.notes.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notes yet. Add one above or use voice.
            </p>
          )}
        </div>
      </div>

      {/* Status change dialog */}
      {showStatusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">Add a comment</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Moving to{" "}
              <span className="font-medium text-foreground">
                {PIPELINE_STATUSES.find((s) => s.id === showStatusDialog)?.label}
              </span>
            </p>
            <textarea
              autoFocus
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              placeholder="e.g. Scheduled viewing..."
              className="mb-3 h-20 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex gap-2">
              <Button onClick={confirmStatusChange} className="flex-1" size="sm">
                Move
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowStatusDialog(null)
                  setStatusComment("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Voice assistant with lead context */}
      <AssistantDialog
        onActionApplied={fetchLead}
        leadContext={{
          leadId: lead.id,
          leadName: lead.name,
          leadStatus: lead.status,
          leadPhone: lead.phone,
          leadBudget: lead.budget,
          leadPropertyType: lead.propertyType,
          leadLocation: lead.location,
        }}
      />
    </div>
  )
}
