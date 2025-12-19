import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TimelineView } from "@/components/timeline/timeline-view"
import { OnThisDayCard } from "@/components/timeline/on-this-day-card"
import { QuickPostComposer } from "@/components/memory/quick-post-composer"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import type { Memory, Profile } from "@/lib/types"

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const params = await searchParams
  const currentYear = params.year ? Number.parseInt(params.year) : new Date().getFullYear()
  const currentMonth = params.month ? Number.parseInt(params.month) : undefined

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch memories with media, links, reactions, and comments
  let query = supabase
    .from("memories")
    .select(`
      *,
      media:memory_media(*),
      links:memory_links(*),
      reactions(*),
      comments(*, profile:profiles(*)),
      profile:profiles(*)
    `)
    .eq("user_id", user.id)
    .order("memory_date", { ascending: false })

  // Filter by year
  const startOfYear = `${currentYear}-01-01`
  const endOfYear = `${currentYear}-12-31`
  query = query.gte("memory_date", startOfYear).lte("memory_date", endOfYear)

  // Filter by month if specified
  if (currentMonth) {
    const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`
    const lastDay = new Date(currentYear, currentMonth, 0).getDate()
    const endOfMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${lastDay}`
    query = query.gte("memory_date", startOfMonth).lte("memory_date", endOfMonth)
  }

  const { data: memories, error } = await query

  if (error) {
    console.error("Error fetching memories:", error)
  }

  // Fetch "On This Day" memories
  const today = new Date()
  const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const { data: onThisDayMemories } = await supabase
    .from("memories")
    .select(`
      *,
      media:memory_media(*),
      links:memory_links(*)
    `)
    .eq("user_id", user.id)
    .like("memory_date", `%-${monthDay}`)
    .neq("memory_date", today.toISOString().split("T")[0])
    .order("memory_date", { ascending: false })
    .limit(5)

  // Get available years for navigation
  const { data: yearsData } = await supabase
    .from("memories")
    .select("memory_date")
    .eq("user_id", user.id)
    .order("memory_date", { ascending: false })

  const availableYears = yearsData
    ? [...new Set(yearsData.map((m) => new Date(m.memory_date).getFullYear()))]
    : [new Date().getFullYear()]

  // Get memory count and friend count for sidebar
  const { count: memoryCount } = await supabase
    .from("memories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: friendCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

  return (
    <div className="flex gap-6">
      {/* Left sidebar - Profile */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <ProfileSidebar
          profile={
            (profile as Profile) || ({ id: user.id, display_name: user.email?.split("@")[0] || "User" } as Profile)
          }
          memoryCount={memoryCount || 0}
          friendCount={friendCount || 0}
        />
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        {/* Quick post composer */}
        <QuickPostComposer userId={user.id} profile={profile as Profile | null} />

        {/* On This Day */}
        {onThisDayMemories && onThisDayMemories.length > 0 && (
          <OnThisDayCard memories={onThisDayMemories as Memory[]} />
        )}

        {/* Timeline */}
        <TimelineView
          memories={(memories as Memory[]) || []}
          currentYear={currentYear}
          currentMonth={currentMonth}
          availableYears={availableYears}
          currentUserId={user.id}
        />
      </main>

      {/* Right sidebar - placeholder for future features */}
      <aside className="hidden w-72 shrink-0 xl:block">
        <div className="sticky top-20 rounded-lg bg-card p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-foreground">Memories</h3>
          <p className="text-sm text-muted-foreground">
            Your personal timeline for preserving life's precious moments.
          </p>
        </div>
      </aside>
    </div>
  )
}
