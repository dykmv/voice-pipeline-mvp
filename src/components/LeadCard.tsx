"use client"

import Link from "next/link"
import { Phone, MapPin, Calendar, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LeadCardProps {
  id: string
  name: string
  phone: string
  source: string
  budget: string
  propertyType: string
  location: string
  followUpDate: string | null
  lastNote?: string
  isDragging?: boolean
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow"

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function LeadCard({
  id,
  name,
  phone,
  source,
  budget,
  propertyType,
  location,
  followUpDate,
  lastNote,
  isDragging,
}: LeadCardProps) {
  const overdue = isOverdue(followUpDate)

  return (
    <Link href={`/leads/${id}`}>
      <div
        className={cn(
          "group cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30",
          overdue && "border-l-2 border-l-placy-red",
          isDragging && "rotate-2 opacity-80 shadow-lg"
        )}
      >
        {/* Name + budget */}
        <div className="mb-1 flex items-start justify-between gap-2">
          <span className="text-sm font-semibold leading-tight">{name}</span>
          {budget && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {budget}
            </span>
          )}
        </div>

        {/* Property tag */}
        {(propertyType || location) && (
          <div className="mb-2 flex flex-wrap gap-1">
            {propertyType && (
              <Badge
                variant="secondary"
                className="bg-[rgba(21,184,255,0.12)] text-[#15B8FF] text-[10px] px-1.5 py-0 h-4"
              >
                {propertyType}
                {location ? ` ${location}` : ""}
              </Badge>
            )}
            {!propertyType && location && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                {location}
              </span>
            )}
          </div>
        )}

        {/* Last note */}
        {lastNote && (
          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
            {lastNote}
          </p>
        )}

        {/* Footer: source + follow-up */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            {phone && (
              <span className="flex items-center gap-0.5">
                <Phone className="h-2.5 w-2.5" />
              </span>
            )}
            {source && <span>{source}</span>}
          </div>
          {followUpDate && (
            <span
              className={cn(
                "flex items-center gap-0.5",
                overdue && "font-semibold text-placy-red"
              )}
            >
              {overdue && <AlertCircle className="h-2.5 w-2.5" />}
              <Calendar className="h-2.5 w-2.5" />
              {formatDate(followUpDate)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
