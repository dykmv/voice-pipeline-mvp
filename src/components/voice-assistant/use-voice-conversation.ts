"use client"

import { useReducer, useCallback, useRef } from "react"
import {
  conversationReducer,
  initialState,
  type PendingAction,
  type Message,
} from "./conversation-reducer"

export interface LeadContext {
  leadId: string
  leadName: string
  leadStatus: string
  leadPhone?: string
  leadBudget?: string
  leadPropertyType?: string
  leadLocation?: string
  leadTransactionType?: string
  leadRole?: string
  leadNextAction?: string
}

export function useVoiceConversation(leadContext?: LeadContext) {
  const [state, dispatch] = useReducer(conversationReducer, initialState)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  // Use ref to always have current messages without stale closure
  const messagesRef = useRef<Message[]>([])
  messagesRef.current = state.messages

  // Internal: call the chat API — uses ref, no stale closure
  const sendToAssistant = useCallback(
    async (newUserMessage: string) => {
      const apiMessages = [
        ...messagesRef.current
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: newUserMessage },
      ]

      try {
        const res = await fetch("/api/voice/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            leadContext: leadContext || null,
          }),
        })

        if (!res.ok) throw new Error("API error")

        const data = await res.json()
        dispatch({
          type: "ASSISTANT_RESPONSE",
          message: data.message,
          action: data.action as PendingAction | null,
          quickReplies: data.quickReplies as string[] | null,
        })
      } catch {
        dispatch({
          type: "ASSISTANT_RESPONSE",
          message: "Sorry, I had trouble processing that. Could you try again?",
          action: null,
          quickReplies: null,
        })
      }
    },
    [leadContext]
  )

  // Start voice recording
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser")
      return
    }

    dispatch({ type: "START_LISTENING" })

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = "en-US"

    let fullTranscript = ""
    let silenceTimer: ReturnType<typeof setTimeout> | null = null

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      fullTranscript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")

      if (silenceTimer) clearTimeout(silenceTimer)
      silenceTimer = setTimeout(() => {
        recognition.stop()
      }, 3000)
    }

    recognition.onerror = () => {
      if (silenceTimer) clearTimeout(silenceTimer)
      if (messagesRef.current.length === 0 && !fullTranscript) {
        dispatch({ type: "CLOSE" })
      } else if (fullTranscript) {
        dispatch({ type: "VOICE_CAPTURED", transcript: fullTranscript })
        sendToAssistant(fullTranscript)
      } else {
        dispatch({
          type: "ASSISTANT_RESPONSE",
          message: "I didn't catch that. Could you say it again?",
          action: null,
          quickReplies: ["Try again"],
        })
      }
    }

    recognition.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer)
      if (fullTranscript.trim()) {
        dispatch({ type: "VOICE_CAPTURED", transcript: fullTranscript })
        sendToAssistant(fullTranscript)
      }
    }

    setTimeout(() => recognition.stop(), 30000)

    recognitionRef.current = recognition
    recognition.start()
  }, [sendToAssistant])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  // Send text message
  const sendText = useCallback(
    (text: string) => {
      if (!text.trim()) return
      dispatch({ type: "TEXT_SENT", text })
      sendToAssistant(text)
    },
    [sendToAssistant]
  )

  // Confirm and apply the pending action
  const confirm = useCallback(async (): Promise<PendingAction | null> => {
    if (!state.pendingAction) return null

    if (state.pendingAction.action === "search") {
      dispatch({ type: "ACTION_SUCCESS" })
      return state.pendingAction
    }

    dispatch({ type: "CONFIRM" })

    try {
      const action = state.pendingAction

      if (action.action === "create_lead") {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: action.leadName || "Unknown",
            phone: action.leadPhone || "",
            source: action.leadSource || "",
            budget: action.leadBudget || "",
            propertyType: action.leadPropertyType || "",
            location: action.leadLocation || "",
            status: action.newStatus || "new",
            note: action.note || "",
            followUpDate: action.followUpDate || null,
            transactionType: action.transactionType || "",
            leadRole: action.leadRole || "",
            nextAction: action.nextAction || "",
            viewingDate: action.viewingDate || null,
            refNumber: action.refNumber || "",
          }),
        })
        if (!res.ok) throw new Error("Failed to create lead")
      } else {
        // Find lead — use context if available, otherwise search by name
        let leadId: string | null = leadContext?.leadId || null

        if (!leadId && action.leadName) {
          const leadsRes = await fetch("/api/leads")
          const leads = await leadsRes.json()
          const lead = leads.find(
            (l: { name: string }) =>
              l.name.toLowerCase().includes(action.leadName!.toLowerCase())
          )
          leadId = lead?.id || null
        }

        if (leadId) {
          const patchData: Record<string, unknown> = {}
          if (action.newStatus) {
            patchData.status = action.newStatus
            patchData.statusComment =
              action.note || `Moved to ${action.newStatus}`
          }
          if (action.followUpDate) patchData.followUpDate = action.followUpDate
          if (action.leadBudget) patchData.budget = action.leadBudget
          if (action.leadPropertyType)
            patchData.propertyType = action.leadPropertyType
          if (action.leadLocation) patchData.location = action.leadLocation
          if (action.leadPhone) patchData.phone = action.leadPhone
          if (action.transactionType) patchData.transactionType = action.transactionType
          if (action.leadRole) patchData.leadRole = action.leadRole
          if (action.nextAction) patchData.nextAction = action.nextAction
          if (action.viewingDate) patchData.viewingDate = action.viewingDate
          if (action.refNumber) patchData.refNumber = action.refNumber

          if (Object.keys(patchData).length > 0) {
            await fetch(`/api/leads/${leadId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(patchData),
            })
          }

          if (action.note) {
            await fetch("/api/notes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                leadId,
                text: action.note,
                type: "voice",
              }),
            })
          }
        }
      }

      dispatch({ type: "ACTION_SUCCESS" })
      return action
    } catch (err) {
      dispatch({
        type: "ACTION_ERROR",
        error: err instanceof Error ? err.message : "Unknown error",
      })
      return null
    }
  }, [state.pendingAction, leadContext])

  const close = useCallback(() => {
    recognitionRef.current?.stop()
    dispatch({ type: "CLOSE" })
  }, [])

  return {
    state,
    startListening,
    stopListening,
    sendText,
    confirm,
    close,
    isOpen: state.status !== "idle",
  }
}
