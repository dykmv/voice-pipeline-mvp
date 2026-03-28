import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBudget(value: string): string {
  const num = Number(value)
  if (isNaN(num) || num < 1000) return value
  if (num >= 1_000_000) {
    const m = num / 1_000_000
    return m % 1 === 0 ? `${m}M` : `${parseFloat(m.toFixed(1))}M`
  }
  const k = num / 1000
  const rounded = parseFloat(k.toFixed(1))
  if (rounded >= 1000) {
    const m = rounded / 1000
    return m % 1 === 0 ? `${m}M` : `${parseFloat(m.toFixed(1))}M`
  }
  return k % 1 === 0 ? `${k}K` : `${rounded}K`
}
