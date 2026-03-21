"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { LEAD_SOURCES, PROPERTY_TYPES, TRANSACTION_TYPES, LEAD_ROLES } from "@/lib/types"
import { X } from "lucide-react"

interface LeadFormProps {
  onSubmit: (data: Record<string, string>) => void
  onClose: () => void
}

export function LeadForm({ onSubmit, onClose }: LeadFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    source: "",
    budget: "",
    propertyType: "",
    location: "",
    transactionType: "",
    leadRole: "",
    refNumber: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
  }

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">New Lead</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Input
        placeholder="Name *"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        autoFocus
        required
      />

      <Input
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        type="tel"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.source}
          onChange={(e) => update("source", e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
        >
          <option value="">Source</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={form.propertyType}
          onChange={(e) => update("propertyType", e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
        >
          <option value="">Property type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.transactionType}
          onChange={(e) => update("transactionType", e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
        >
          <option value="">Transaction type</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={form.leadRole}
          onChange={(e) => update("leadRole", e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
        >
          <option value="">Client role</option>
          {LEAD_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Budget"
          value={form.budget}
          onChange={(e) => update("budget", e.target.value)}
        />
        <Input
          placeholder="Location"
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      <Input
        placeholder="Property ref (e.g. D-4195)"
        value={form.refNumber}
        onChange={(e) => update("refNumber", e.target.value)}
      />

      <div className="flex gap-2 pt-1">
        <Button type="submit" className="flex-1">
          Add Lead
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
