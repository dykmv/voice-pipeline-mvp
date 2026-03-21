"use client"

import {
  User,
  Phone,
  MapPin,
  Building,
  Wallet,
  ArrowRight,
  Calendar,
  FileText,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PendingAction } from "./conversation-reducer"

interface ActionPreviewCardProps {
  action: PendingAction
  onConfirm: () => void
  isApplying: boolean
}

export function ActionPreviewCard({
  action,
  onConfirm,
  isApplying,
}: ActionPreviewCardProps) {
  const fields = [
    { icon: User, label: "Lead", value: action.leadName },
    { icon: Phone, label: "Phone", value: action.leadPhone },
    { icon: Globe, label: "Source", value: action.leadSource },
    { icon: Wallet, label: "Budget", value: action.leadBudget },
    { icon: Building, label: "Property", value: action.leadPropertyType },
    { icon: MapPin, label: "Location", value: action.leadLocation },
    { icon: ArrowRight, label: "Status", value: action.newStatus },
    { icon: Calendar, label: "Follow-up", value: action.followUpDate },
    { icon: FileText, label: "Note", value: action.note },
  ].filter((f) => f.value)

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
        Ready to apply
      </div>

      <div className="mb-3 space-y-1.5">
        {fields.map((field) => (
          <div key={field.label} className="flex items-start gap-2 text-sm">
            <field.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{field.label}:</span>
            <span className="font-medium">{field.value}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onConfirm}
        disabled={isApplying}
        className="w-full"
        size="sm"
      >
        {isApplying ? "Saving..." : "Confirm & Save"}
      </Button>
    </div>
  )
}
