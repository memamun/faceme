import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TimelineView } from "@/components/timeline/timeline-view"
import { OnThisDayCard } from "@/components/timeline/on-this-day-card"
import type { Memory } from "@/lib/types"

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

  // Fetch memories with media and links
  let query = supabase
    .from("memories")
    .select(`
      *,
      media:memory_media(*),
      links:memory_links(*)
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

  return (
    <div className="space-y-6">
      {onThisDayMemories && onThisDayMemories.length > 0 && <OnThisDayCard memories={onThisDayMemories as Memory[]} />}

      <TimelineView
        memories={(memories as Memory[]) || []}
        currentYear={currentYear}
        currentMonth={currentMonth}
        availableYears={availableYears}
      />
    </div>
  )
}
