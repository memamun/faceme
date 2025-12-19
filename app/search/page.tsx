import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { SearchView } from "@/components/search/search-view"
import type { Memory } from "@/lib/types"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; mood?: string; from?: string; to?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const params = await searchParams
  const { q, tag, mood, from, to } = params

  let query = supabase
    .from("memories")
    .select(`
      *,
      media:memory_media(*),
      links:memory_links(*)
    `)
    .eq("user_id", user.id)
    .order("memory_date", { ascending: false })

  // Text search
  if (q) {
    query = query.ilike("content", `%${q}%`)
  }

  // Tag filter
  if (tag) {
    query = query.contains("tags", [tag])
  }

  // Mood filter
  if (mood) {
    query = query.eq("mood", mood)
  }

  // Date range filter
  if (from) {
    query = query.gte("memory_date", from)
  }
  if (to) {
    query = query.lte("memory_date", to)
  }

  const { data: memories } = await query.limit(50)

  // Get all unique tags for filter options
  const { data: allMemories } = await supabase.from("memories").select("tags").eq("user_id", user.id)

  const allTags = allMemories ? [...new Set(allMemories.flatMap((m) => m.tags))].filter(Boolean).sort() : []

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} />
      <main className="container mx-auto px-4 py-6">
        <SearchView memories={(memories as Memory[]) || []} allTags={allTags} initialFilters={params} />
      </main>
    </div>
  )
}
