export type ConversationStatus =
  | "idle"
  | "listening"
  | "processing"
  | "active"       // dialog open, assistant responded
  | "applying"
  | "done"
  | "error"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  inputMode?: "voice" | "text"
}

export type PendingAction = {
  action: string
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
  summary: string
  readyToApply: boolean
  searchQuery?: string
}

export type ConversationState = {
  status: ConversationStatus
  messages: Message[]
  pendingAction: PendingAction | null
  quickReplies: string[] | null
  error: string | null
}

export type ConversationEvent =
  | { type: "START_LISTENING" }
  | { type: "VOICE_CAPTURED"; transcript: string }
  | { type: "TEXT_SENT"; text: string }
  | { type: "PROCESSING" }
  | { type: "ASSISTANT_RESPONSE"; message: string; action: PendingAction | null; quickReplies: string[] | null }
  | { type: "CONFIRM" }
  | { type: "ACTION_SUCCESS" }
  | { type: "ACTION_ERROR"; error: string }
  | { type: "CLOSE" }

let messageCounter = 0
function nextId() {
  return `msg-${++messageCounter}-${Date.now()}`
}

export const initialState: ConversationState = {
  status: "idle",
  messages: [],
  pendingAction: null,
  quickReplies: null,
  error: null,
}

export function conversationReducer(
  state: ConversationState,
  event: ConversationEvent
): ConversationState {
  switch (event.type) {
    case "START_LISTENING":
      return {
        ...state,
        status: "listening",
        error: null,
      }

    case "VOICE_CAPTURED":
      return {
        ...state,
        status: "processing",
        quickReplies: null,
        messages: [
          ...state.messages,
          {
            id: nextId(),
            role: "user",
            content: event.transcript,
            timestamp: Date.now(),
            inputMode: "voice",
          },
        ],
      }

    case "TEXT_SENT":
      return {
        ...state,
        status: "processing",
        quickReplies: null,
        messages: [
          ...state.messages,
          {
            id: nextId(),
            role: "user",
            content: event.text,
            timestamp: Date.now(),
            inputMode: "text",
          },
        ],
      }

    case "PROCESSING":
      return { ...state, status: "processing" }

    case "ASSISTANT_RESPONSE":
      return {
        ...state,
        status: "active",
        messages: [
          ...state.messages,
          {
            id: nextId(),
            role: "assistant",
            content: event.message,
            timestamp: Date.now(),
          },
        ],
        pendingAction: event.action,
        quickReplies: event.quickReplies || null,
      }

    case "CONFIRM":
      return { ...state, status: "applying" }

    case "ACTION_SUCCESS":
      return {
        ...state,
        status: "done",
        messages: [
          ...state.messages,
          {
            id: nextId(),
            role: "assistant",
            content: state.pendingAction?.summary
              ? `Done! ${state.pendingAction.summary}`
              : "Done! Changes saved.",
            timestamp: Date.now(),
          },
        ],
      }

    case "ACTION_ERROR":
      return {
        ...state,
        status: "error",
        error: event.error,
        messages: [
          ...state.messages,
          {
            id: nextId(),
            role: "assistant",
            content: `Something went wrong: ${event.error}. Please try again.`,
            timestamp: Date.now(),
          },
        ],
      }

    case "CLOSE":
      return initialState

    default:
      return state
  }
}
