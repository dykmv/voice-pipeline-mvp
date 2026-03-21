"use client"

import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import type { VoiceAction } from "@/lib/types"

interface VoiceConfirmProps {
  action: VoiceAction
  onConfirm: () => void
  onReject: () => void
  isApplying?: boolean
}

export function VoiceConfirm({
  action,
  onConfirm,
  onReject,
  isApplying,
}: VoiceConfirmProps) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-50 mx-auto max-w-lg px-4 md:bottom-4">
      <div className="rounded-xl border border-primary/30 bg-card p-4 shadow-[0_0_30px_rgba(239,169,67,0.15)]">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Confirm action
        </div>
        <p className="mb-3 text-sm text-foreground">{action.summary}</p>
        <div className="flex gap-2">
          <Button
            onClick={onConfirm}
            disabled={isApplying}
            size="sm"
            className="flex-1 gap-1.5"
          >
            <Check className="h-3.5 w-3.5" />
            Confirm
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
