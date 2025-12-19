import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MemoryCard } from "@/components/timeline/memory-card"
import type { Memory } from "@/lib/types"
import { Camera, Edit2, MapPin, Calendar } from "lucide-react"
import { format } from "date-fns"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: memories } = await supabase
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
    .limit(10)

  const { data: pinnedMemories } = await supabase
    .from("memories")
    .select(`
      *,
      media:memory_media(*),
      links:memory_links(*),
      reactions(*),
      profile:profiles(*)
    `)
    .eq("user_id", user.id)
    .eq("is_pinned", true)
    .order("memory_date", { ascending: false })

  const { count: memoryCount } = await supabase
    .from("memories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: friendCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User"

  return (
    <div className="-mt-6">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-primary/30 to-primary/10 md:h-72">
        {profile?.cover_url && (
          <Image src={profile.cover_url || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
        )}
        <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 gap-2">
          <Camera className="h-4 w-4" />
          Edit Cover
        </Button>
      </div>

      {/* Profile Info */}
      <div className="relative mx-auto max-w-5xl px-4">
        <div className="flex flex-col items-center md:flex-row md:items-end md:gap-6">
          {/* Avatar */}
          <div className="relative -mt-16 md:-mt-8">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url || "/placeholder.svg"}
                alt={displayName}
                width={168}
                height={168}
                className="rounded-full border-4 border-background object-cover"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-background bg-primary text-5xl font-bold text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-2 right-2 h-9 w-9 rounded-full shadow-md"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          {/* Name and stats */}
          <div className="mt-4 flex-1 text-center md:mb-4 md:text-left">
            <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
            {profile?.bio && <p className="mt-1 text-muted-foreground">{profile.bio}</p>}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:justify-start">
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
              {profile?.birthday && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(profile.birthday), "MMMM d")}
                </span>
              )}
              <span>{memoryCount || 0} memories</span>
              <span>{friendCount || 0} friends</span>
            </div>
          </div>

          {/* Edit button */}
          <div className="mt-4 md:mb-4">
            <Link href="/profile/edit">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="mt-6">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="pinned"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Pinned
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-4">
              {(memories as Memory[])?.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} currentUserId={user.id} />
              ))}
              {(!memories || memories.length === 0) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No memories yet. Start posting!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pinned" className="mt-6">
            <div className="space-y-4">
              {(pinnedMemories as Memory[])?.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} currentUserId={user.id} />
              ))}
              {(!pinnedMemories || pinnedMemories.length === 0) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No pinned memories yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold">About</h3>
                <div className="space-y-4">
                  {profile?.bio && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Bio</h4>
                      <p className="mt-1">{profile.bio}</p>
                    </div>
                  )}
                  {profile?.location && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p className="mt-1">{profile.location}</p>
                    </div>
                  )}
                  {profile?.birthday && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Birthday</h4>
                      <p className="mt-1">{format(new Date(profile.birthday), "MMMM d, yyyy")}</p>
                    </div>
                  )}
                  {!profile?.bio && !profile?.location && !profile?.birthday && (
                    <p className="text-muted-foreground">
                      No details added yet.{" "}
                      <Link href="/profile/edit" className="text-primary hover:underline">
                        Add some info
                      </Link>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
