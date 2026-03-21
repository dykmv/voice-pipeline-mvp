"use client"

import { useRouter } from "next/navigation"
import { useDraggable } from "@dnd-kit/core"
import { Phone, MapPin, Calendar, AlertCircle, GripVertical } from "lucide-react"
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
  const router = useRouter()
  const overdue = isOverdue(followUpDate)

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined

  const handleClick = () => {
    // Only navigate if not dragging
    if (!transform) {
      router.push(`/leads/${id}`)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30",
        overdue && "border-l-2 border-l-placy-red",
        isDragging && "opacity-40"
      )}
      onClick={handleClick}
    >
      {/* Drag handle + Name + budget */}
      <div className="mb-1 flex items-start justify-between gap-1">
        <div className="flex items-start gap-1">
          <button
            {...listeners}
            {...attributes}
            className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <span className="text-sm font-semibold leading-tight">{name}</span>
        </div>
        {budget && (
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {budget}
          </span>
        )}
      </div>

      {/* Property tag */}
      {(propertyType || location) && (
        <div className="mb-2 flex flex-wrap gap-1 pl-5">
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
        <p className="mb-2 line-clamp-2 pl-5 text-xs text-muted-foreground">
          {lastNote}
        </p>
      )}

      {/* Footer: source + follow-up */}
      <div className="flex items-center justify-between pl-5 text-[10px] text-muted-foreground">
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
  )
}
