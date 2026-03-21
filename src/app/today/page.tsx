"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Navigation } from "@/components/Navigation"
import { AssistantDialog } from "@/components/voice-assistant/assistant-dialog"
import { AlertCircle, Phone, Eye, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeadWithNotes } from "@/lib/types"

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(dateStr) < today
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function daysOverdue(dateStr: string): number {
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
}

export default function TodayPage() {
  const [leads, setLeads] = useState<LeadWithNotes[]>([])
  const fetchLeads = useCallback(async () => {
    const res = await fetch("/api/leads")
    const data = await res.json()
    setLeads(data)
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const overdueLeads = leads.filter((l) => isOverdue(l.followUpDate))
  const todayLeads = leads.filter(
    (l) => isToday(l.followUpDate) && !isOverdue(l.followUpDate)
  )
  const viewingLeads = leads.filter(
    (l) => l.status === "viewing" && !isOverdue(l.followUpDate)
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1 px-4 pb-20 pt-4 md:mx-auto md:max-w-2xl md:pb-4 md:pt-2">
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            Today
          </h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <div className="text-2xl font-semibold">{todayLeads.length}</div>
            <div className="text-[10px] text-muted-foreground">Follow-ups</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <div className="text-2xl font-semibold">{viewingLeads.length}</div>
            <div className="text-[10px] text-muted-foreground">Viewings</div>
          </div>
          <div
            className={cn(
              "rounded-lg border border-border bg-card p-3 text-center",
              overdueLeads.length > 0 && "border-placy-red/30"
            )}
          >
            <div
              className={cn(
                "text-2xl font-semibold",
                overdueLeads.length > 0 && "text-placy-red"
              )}
            >
              {overdueLeads.length}
            </div>
            <div className="text-[10px] text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Overdue section */}
        {overdueLeads.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-placy-red">
              <AlertCircle className="h-3.5 w-3.5" />
              Overdue
            </h2>
            <div className="space-y-2">
              {overdueLeads
                .sort(
                  (a, b) =>
                    new Date(a.followUpDate!).getTime() -
                    new Date(b.followUpDate!).getTime()
                )
                .map((lead) => (
                  <TodayItem
                    key={lead.id}
                    lead={lead}
                    type="overdue"
                    detail={`${daysOverdue(lead.followUpDate!)}d overdue`}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Today follow-ups */}
        {todayLeads.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Phone className="h-3.5 w-3.5" />
              Follow-ups today
            </h2>
            <div className="space-y-2">
              {todayLeads.map((lead) => (
                <TodayItem key={lead.id} lead={lead} type="followup" />
              ))}
            </div>
          </section>
        )}

        {/* Viewings */}
        {viewingLeads.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-placy-blue">
              <Eye className="h-3.5 w-3.5" />
              Viewings
            </h2>
            <div className="space-y-2">
              {viewingLeads.map((lead) => (
                <TodayItem
                  key={lead.id}
                  lead={lead}
                  type="viewing"
                  detail={
                    lead.followUpDate ? formatTime(lead.followUpDate) : ""
                  }
                />
              ))}
            </div>
          </section>
        )}

        {overdueLeads.length === 0 &&
          todayLeads.length === 0 &&
          viewingLeads.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <p className="text-lg font-medium">All clear!</p>
              <p className="text-sm">No follow-ups or viewings for today.</p>
            </div>
          )}
      </main>

      <AssistantDialog onActionApplied={fetchLeads} />
    </div>
  )
}

function TodayItem({
  lead,
  type,
  detail,
}: {
  lead: LeadWithNotes
  type: "overdue" | "followup" | "viewing"
  detail?: string
}) {
  const dotColors = {
    overdue: "bg-placy-red",
    followup: "bg-primary",
    viewing: "bg-placy-blue",
  }

  return (
    <Link href={`/leads/${lead.id}`}>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30">
        <div
          className={cn("h-2 w-2 shrink-0 rounded-full", dotColors[type])}
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{lead.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {lead.propertyType && `${lead.propertyType} `}
            {lead.location && `${lead.location} `}
            {lead.budget && `· ${lead.budget}`}
          </div>
          {lead.notes[0] && (
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
              {lead.notes[0].text}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {detail && (
            <span className={cn(type === "overdue" && "text-placy-red font-medium")}>
              {detail}
            </span>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  )
}
