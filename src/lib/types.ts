export const PIPELINE_STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "viewing", label: "Meeting / Viewing" },
  { id: "deal", label: "Deal" },
  { id: "won", label: "Closed Won" },
  { id: "lost", label: "Closed Lost" },
] as const

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number]["id"]

export const LEAD_SOURCES = [
  "Bazaraki",
  "Facebook",
  "WhatsApp",
  "Referral",
  "Other",
] as const

export const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Commercial",
  "Land",
] as const

export const TRANSACTION_TYPES = [
  "Sale",
  "Rent",
  "Auction",
] as const

export const LEAD_ROLES = [
  "Buyer",
  "Tenant",
  "Seller",
  "Landlord",
] as const

export interface LeadWithNotes {
  id: string
  userId: string
  name: string
  phone: string
  email: string
  source: string
  budget: string
  propertyType: string
  location: string
  status: string
  followUpDate: string | null
  transactionType: string
  leadRole: string
  nextAction: string
  viewingDate: string | null
  refNumber: string
  createdAt: string
  updatedAt: string
  notes: NoteData[]
}

export interface NoteData {
  id: string
  leadId: string
  text: string
  type: string
  createdAt: string
}

export interface VoiceAction {
  action: "create_lead" | "add_note" | "change_status" | "set_followup" | "combo"
  leadName?: string
  leadPhone?: string
  leadSource?: string
  leadBudget?: string
  leadPropertyType?: string
  leadLocation?: string
  newStatus?: string
  note?: string
  followUpDate?: string
  transactionType?: string
  leadRole?: string
  nextAction?: string
  viewingDate?: string
  refNumber?: string
  summary: string // Human-readable description for confirmation
}
