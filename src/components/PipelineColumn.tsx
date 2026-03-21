"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface PipelineColumnProps {
  id: string
  label: string
  count: number
  children: React.ReactNode
}

export function PipelineColumn({
  id,
  label,
  count,
  children,
}: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-56 shrink-0 flex-col rounded-xl border border-border bg-secondary/30 p-2 transition-colors md:w-60",
        isOver && "border-primary/40 bg-primary/5"
      )}
    >
      {/* Column header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-muted-foreground">
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex min-h-[60px] flex-1 flex-col gap-2">
        {children}
      </div>
    </div>
  )
}
