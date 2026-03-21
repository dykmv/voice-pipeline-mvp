"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { PIPELINE_STATUSES } from "@/lib/types"
import { PipelineColumn } from "./PipelineColumn"
import { LeadCard } from "./LeadCard"
import type { LeadWithNotes } from "@/lib/types"

interface PipelineBoardProps {
  leads: LeadWithNotes[]
  onStatusChange: (leadId: string, newStatus: string, comment: string) => void
}

export function PipelineBoard({ leads, onStatusChange }: PipelineBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [commentDialog, setCommentDialog] = useState<{
    leadId: string
    newStatus: string
  } | null>(null)
  const [comment, setComment] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  )

  const activeLead = activeId
    ? leads.find((l) => l.id === activeId)
    : undefined

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over) return

      const leadId = active.id as string
      const newStatus = over.id as string
      const lead = leads.find((l) => l.id === leadId)

      if (lead && lead.status !== newStatus) {
        setCommentDialog({ leadId, newStatus })
      }
    },
    [leads]
  )

  const handleCommentSubmit = () => {
    if (commentDialog) {
      onStatusChange(
        commentDialog.leadId,
        commentDialog.newStatus,
        comment || `Moved to ${commentDialog.newStatus}`
      )
      setCommentDialog(null)
      setComment("")
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Desktop: horizontal scroll columns */}
        <div className="flex gap-3 overflow-x-auto pb-4 md:gap-4">
          {PIPELINE_STATUSES.map((status) => {
            const columnLeads = leads.filter((l) => l.status === status.id)
            return (
              <PipelineColumn
                key={status.id}
                id={status.id}
                label={status.label}
                count={columnLeads.length}
              >
                {columnLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    id={lead.id}
                    name={lead.name}
                    phone={lead.phone}
                    source={lead.source}
                    budget={lead.budget}
                    propertyType={lead.propertyType}
                    location={lead.location}
                    followUpDate={lead.followUpDate}
                    lastNote={lead.notes[0]?.text}
                    isDragging={activeId === lead.id}
                  />
                ))}
              </PipelineColumn>
            )
          })}
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="w-56 rotate-3 opacity-90">
              <LeadCard
                id={activeLead.id}
                name={activeLead.name}
                phone={activeLead.phone}
                source={activeLead.source}
                budget={activeLead.budget}
                propertyType={activeLead.propertyType}
                location={activeLead.location}
                followUpDate={activeLead.followUpDate}
                lastNote={activeLead.notes[0]?.text}
                isDragging
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Comment dialog on status change */}
      {commentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold">Add a comment</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Why are you moving this lead to{" "}
              <span className="font-medium text-foreground">
                {
                  PIPELINE_STATUSES.find(
                    (s) => s.id === commentDialog.newStatus
                  )?.label
                }
              </span>
              ?
            </p>
            <textarea
              autoFocus
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Scheduled viewing for tomorrow..."
              className="mb-3 h-20 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCommentSubmit}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Move
              </button>
              <button
                onClick={() => {
                  setCommentDialog(null)
                  setComment("")
                }}
                className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
