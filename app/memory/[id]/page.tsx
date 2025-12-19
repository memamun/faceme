import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MemoryDetail } from "@/components/memory/memory-detail"
import type { Memory } from "@/lib/types"

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: memory, error } = await supabase
    .from("memories")
    .select(`
      *,
      media:memory_media(*),
      links:memory_links(*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !memory) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      <main className="container mx-auto max-w-3xl px-4 py-6">
        <MemoryDetail memory={memory as Memory} userId={user.id} />
      </main>
    </div>
  )
}
