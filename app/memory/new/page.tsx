import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MemoryForm } from "@/components/memory/memory-form"
import { AppHeader } from "@/components/app-header"

export default async function NewMemoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      <main className="container mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Create a Memory</h1>
        <MemoryForm userId={user.id} />
      </main>
    </div>
  )
}
