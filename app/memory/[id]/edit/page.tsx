import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { MemoryForm } from "@/components/memory/memory-form"
import type { Memory } from "@/lib/types"

export default async function EditMemoryPage({
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
      <main className="container mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Edit Memory</h1>
        <MemoryForm userId={user.id} existingMemory={memory as Memory} />
      </main>
    </div>
  )
}
