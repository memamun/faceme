import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FriendsView } from "@/components/friends/friends-view"
import type { Friendship, Profile } from "@/lib/types"

export default async function FriendsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch accepted friendships
  const { data: friendships } = await supabase
    .from("friendships")
    .select(`
      *,
      friend:profiles!friendships_friend_id_fkey(*),
      user:profiles!friendships_user_id_fkey(*)
    `)
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq("status", "accepted")

  // Fetch pending friend requests (received)
  const { data: pendingRequests } = await supabase
    .from("friendships")
    .select(`
      *,
      user:profiles!friendships_user_id_fkey(*)
    `)
    .eq("friend_id", user.id)
    .eq("status", "pending")

  // Fetch all users for suggestions (excluding current user and existing friends)
  const friendIds =
    friendships?.map((f) => (f.user_id === user.id ? f.friend_id : f.user_id)).filter((id) => id !== user.id) || []
  const pendingIds = pendingRequests?.map((r) => r.user_id) || []
  const excludeIds = [user.id, ...friendIds, ...pendingIds]

  const { data: suggestions } = await supabase
    .from("profiles")
    .select("*")
    .not("id", "in", `(${excludeIds.join(",")})`)
    .limit(10)

  return (
    <div className="mx-auto max-w-4xl">
      <FriendsView
        currentUserId={user.id}
        friendships={(friendships as (Friendship & { friend: Profile; user: Profile })[]) || []}
        pendingRequests={(pendingRequests as (Friendship & { user: Profile })[]) || []}
        suggestions={(suggestions as Profile[]) || []}
      />
    </div>
  )
}
