import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import type { Profile } from "@/lib/types"

export default async function TimelineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader user={user} profile={profile as Profile | null} />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
