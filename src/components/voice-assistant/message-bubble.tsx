"use client"

import { Mic, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "./conversation-reducer"

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
          <MessageSquare className="h-3.5 w-3.5" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-secondary text-foreground"
        )}
      >
        {message.content}

        {/* Voice indicator */}
        {isUser && message.inputMode === "voice" && (
          <Mic className="ml-1 inline h-3 w-3 opacity-50" />
        )}
      </div>
    </div>
  )
}
