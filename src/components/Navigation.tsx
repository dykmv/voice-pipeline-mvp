"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, CalendarCheck, Mic } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/app", label: "Pipeline", icon: LayoutGrid },
  { href: "/today", label: "Today", icon: CalendarCheck },
]

export function Navigation({ onMicClick }: { onMicClick?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md md:static md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-5xl items-center justify-around px-4 py-2 md:justify-between md:py-3">
        {/* Brand — desktop only */}
        <div className="hidden md:block">
          <span className="text-lg font-semibold tracking-tight">
            Voice<span className="text-primary">Pipeline</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-colors md:flex-row md:gap-2 md:px-3 md:py-2 md:text-sm",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 md:h-4 md:w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Mic button */}
        {onMicClick && (
          <button
            onClick={onMicClick}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(239,169,67,0.25)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(239,169,67,0.35)] active:scale-95"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>
    </nav>
  )
}
