"use client"

import { useState, useRef, useCallback } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getLanguagePriority, MIN_CONFIDENCE } from "@/lib/speech-lang"

interface VoiceButtonProps {
  onTranscript: (text: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
}

export function VoiceButton({
  onTranscript,
  className,
  size = "md",
}: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const langIndexRef = useRef(0)
  const bestResultRef = useRef<{ transcript: string; confidence: number } | null>(null)

  const attemptRecognition = useCallback(
    (langIndex: number) => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser")
        return
      }

      const langs = getLanguagePriority()
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = langs[langIndex] || "en-US"

      recognition.onstart = () => setIsListening(true)

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0][0]
        const { transcript, confidence } = result

        // Track best result across attempts
        if (
          !bestResultRef.current ||
          confidence > bestResultRef.current.confidence
        ) {
          bestResultRef.current = { transcript, confidence }
        }

        // If confidence is low and more languages to try, auto-retry
        if (confidence < MIN_CONFIDENCE && langIndex < langs.length - 1) {
          langIndexRef.current = langIndex + 1
          attemptRecognition(langIndex + 1)
          return
        }

        // Use the best result we got
        const best = bestResultRef.current
        setIsListening(false)
        setIsProcessing(true)
        onTranscript(best.transcript)
        bestResultRef.current = null
        langIndexRef.current = 0
        setTimeout(() => setIsProcessing(false), 300)
      }

      recognition.onerror = () => {
        // On error, if we have a previous best result, use it
        if (bestResultRef.current) {
          setIsListening(false)
          setIsProcessing(true)
          onTranscript(bestResultRef.current.transcript)
          bestResultRef.current = null
          langIndexRef.current = 0
          setTimeout(() => setIsProcessing(false), 300)
          return
        }
        setIsListening(false)
        setIsProcessing(false)
        langIndexRef.current = 0
      }

      recognition.onend = () => {
        // Only reset if we're not retrying
        if (langIndexRef.current <= langIndex) {
          setIsListening(false)
          langIndexRef.current = 0
          bestResultRef.current = null
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    },
    [onTranscript]
  )

  const startListening = useCallback(() => {
    bestResultRef.current = null
    langIndexRef.current = 0
    attemptRecognition(0)
  }, [attemptRecognition])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    langIndexRef.current = 0
    bestResultRef.current = null
  }, [])

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      disabled={isProcessing}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        isListening
          ? "animate-pulse bg-placy-red text-white shadow-[0_0_20px_rgba(218,58,58,0.4)]"
          : "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(239,169,67,0.2)] hover:shadow-[0_0_24px_rgba(239,169,67,0.3)]",
        isProcessing && "opacity-60",
        sizeClasses[size],
        className
      )}
    >
      {isProcessing ? (
        <Loader2 className={cn("animate-spin", iconSizes[size])} />
      ) : isListening ? (
        <MicOff className={iconSizes[size]} />
      ) : (
        <Mic className={iconSizes[size]} />
      )}
    </button>
  )
}
