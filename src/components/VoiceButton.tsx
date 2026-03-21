"use client"

import { useState, useRef, useCallback } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US" // Web Speech API auto-detects, but default to English

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setIsListening(false)
      setIsProcessing(true)
      onTranscript(transcript)
      setTimeout(() => setIsProcessing(false), 300)
    }

    recognition.onerror = () => {
      setIsListening(false)
      setIsProcessing(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [onTranscript])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
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
