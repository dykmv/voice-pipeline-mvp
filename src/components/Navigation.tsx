"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LayoutGrid, CalendarCheck, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/app", label: "Pipeline", icon: LayoutGrid },
  { href: "/today", label: "Today", icon: CalendarCheck },
]

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showMenu, setShowMenu] = useState(false)

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() || "?"

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

        {/* Avatar + menu */}
        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary transition-colors hover:bg-primary/25"
            >
              {initials}
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute bottom-12 right-0 z-50 min-w-[180px] rounded-lg border border-border bg-card p-1 shadow-lg md:bottom-auto md:top-10">
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    {session.user.email}
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
