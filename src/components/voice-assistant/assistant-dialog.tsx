"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Send, Loader2, X, CheckCircle2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useVoiceConversation, type LeadContext } from "./use-voice-conversation"
import { MessageBubble } from "./message-bubble"
import { ActionPreviewCard } from "./action-preview-card"

interface AssistantDialogProps {
  onActionApplied?: () => void
  leadContext?: LeadContext
}

export function AssistantDialog({ onActionApplied, leadContext }: AssistantDialogProps) {
  const {
    state,
    startListening,
    stopListening,
    sendText,
    confirm,
    close,
    isOpen,
  } = useVoiceConversation(leadContext)

  const [textInput, setTextInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  // Auto-close after success
  useEffect(() => {
    if (state.status === "done") {
      const timer = setTimeout(() => {
        close()
        onActionApplied?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state.status, close, onActionApplied])

  const handleSendText = () => {
    if (!textInput.trim()) return
    sendText(textInput)
    setTextInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const handleConfirm = async () => {
    const result = await confirm()
    if (result) {
      onActionApplied?.()
    }
  }

  const handleClose = () => {
    close()
    setTextInput("")
  }

  const isListening = state.status === "listening"
  const isProcessing = state.status === "processing"
  const isApplying = state.status === "applying"
  const isDone = state.status === "done"
  const canInput = !isProcessing && !isApplying && !isDone

  return (
    <>
      {/* FAB — always visible when dialog is closed */}
      {!isOpen && (
        <button
          onClick={startListening}
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_24px_rgba(239,169,67,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_36px_rgba(239,169,67,0.4)] active:scale-95 md:bottom-6 md:right-6"
        >
          <Mic className="h-6 w-6" />
        </button>
      )}

      {/* Full-screen modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="relative z-10 mx-4 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[0_0_60px_rgba(239,169,67,0.12)] md:max-w-lg" style={{ maxHeight: "80vh" }}>
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Voice Assistant</h2>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    {isListening && (
                      <>
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-placy-red" />
                        Listening...
                      </>
                    )}
                    {isProcessing && (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Thinking...
                      </>
                    )}
                    {isApplying && (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Saving...
                      </>
                    )}
                    {isDone && (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-placy-green" />
                        Saved!
                      </>
                    )}
                    {state.status === "active" && (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-placy-green" />
                        Ready
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages area — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-3">
                {state.messages.length === 0 && isListening && (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-primary/15">
                      <Mic className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      I&apos;m listening... Tell me about a lead.
                    </p>
                  </div>
                )}

                {state.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {isProcessing && (
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex gap-1 rounded-2xl rounded-bl-md bg-secondary px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </div>
                  </div>
                )}

                {/* Smart quick reply buttons — LLM-generated */}
                {state.status === "active" &&
                  !state.pendingAction?.readyToApply &&
                  state.quickReplies &&
                  state.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {state.quickReplies.map((reply) => {
                        const isConfirm = ["confirm", "yes, move", "yes, do it", "yes"].includes(reply.toLowerCase())
                        const isCancel = ["cancel", "close", "no"].includes(reply.toLowerCase())
                        return (
                          <button
                            key={reply}
                            onClick={() => sendText(reply)}
                            className={cn(
                              "rounded-full px-4 py-1.5 text-sm font-medium transition-all active:scale-95",
                              isConfirm
                                ? "bg-primary text-primary-foreground hover:opacity-90"
                                : isCancel
                                ? "border border-border text-muted-foreground hover:text-foreground"
                                : "border border-primary/30 text-foreground hover:bg-primary/10"
                            )}
                          >
                            {reply}
                          </button>
                        )
                      })}
                    </div>
                  )}

                {/* Action preview */}
                {state.pendingAction?.readyToApply && !isDone && (
                  <ActionPreviewCard
                    action={state.pendingAction}
                    onConfirm={handleConfirm}
                    isApplying={isApplying}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input bar */}
            {canInput && (
              <div className="shrink-0 border-t border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all",
                      isListening
                        ? "animate-pulse bg-placy-red text-white shadow-[0_0_16px_rgba(218,58,58,0.4)]"
                        : "bg-primary/15 text-primary hover:bg-primary/25"
                    )}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type or tap mic to speak..."
                    disabled={isListening}
                    className="flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                  />

                  <button
                    onClick={handleSendText}
                    disabled={!textInput.trim() || isListening}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-30"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
