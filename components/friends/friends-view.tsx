"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Friendship, Profile } from "@/lib/types"
import { Search, UserPlus, Check, X, Users } from "lucide-react"

interface FriendsViewProps {
  currentUserId: string
  friendships: (Friendship & { friend: Profile; user: Profile })[]
  pendingRequests: (Friendship & { user: Profile })[]
  suggestions: Profile[]
}

export function FriendsView({ currentUserId, friendships, pendingRequests, suggestions }: FriendsViewProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const friends = friendships.map((f) => (f.user_id === currentUserId ? f.friend : f.user))

  const filteredFriends = friends.filter(
    (friend) => friend.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === "",
  )

  const handleAcceptRequest = async (friendshipId: string) => {
    const supabase = createClient()
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId)
    router.refresh()
  }

  const handleDeclineRequest = async (friendshipId: string) => {
    const supabase = createClient()
    await supabase.from("friendships").update({ status: "declined" }).eq("id", friendshipId)
    router.refresh()
  }

  const handleSendRequest = async (friendId: string) => {
    const supabase = createClient()
    await supabase.from("friendships").insert({
      user_id: currentUserId,
      friend_id: friendId,
      status: "pending",
    })
    router.refresh()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Friends</h1>

      <Tabs defaultValue="friends">
        <TabsList className="mb-6">
          <TabsTrigger value="friends" className="gap-2">
            <Users className="h-4 w-4" />
            Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredFriends.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No friends match your search" : "No friends yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredFriends.map((friend) => (
                <Card key={friend.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    {friend.avatar_url ? (
                      <Image
                        src={friend.avatar_url || "/placeholder.svg"}
                        alt={friend.display_name || "Friend"}
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
                        {(friend.display_name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{friend.display_name || "User"}</p>
                      {friend.location && <p className="text-sm text-muted-foreground">{friend.location}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserPlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No pending friend requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    {request.user?.avatar_url ? (
                      <Image
                        src={request.user.avatar_url || "/placeholder.svg"}
                        alt={request.user.display_name || "User"}
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
                        {(request.user?.display_name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{request.user?.display_name || "User"}</p>
                      <p className="text-sm text-muted-foreground">wants to be your friend</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeclineRequest(request.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">People you may know</CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No suggestions available</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {suggestions.map((profile) => (
                    <div key={profile.id} className="flex items-center gap-4 rounded-lg border p-4">
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url || "/placeholder.svg"}
                          alt={profile.display_name || "User"}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {(profile.display_name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{profile.display_name || "User"}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleSendRequest(profile.id)}>
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
