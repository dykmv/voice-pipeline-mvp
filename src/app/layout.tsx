import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/Providers"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Voice Pipeline",
  description: "Voice-first lead pipeline for real estate agents",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-[family-name:var(--font-inter)] antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
