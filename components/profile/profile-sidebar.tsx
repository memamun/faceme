"use client"

import Image from "next/image"
import Link from "next/link"
import type { Profile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Edit2 } from "lucide-react"
import { format } from "date-fns"

interface ProfileSidebarProps {
  profile: Profile
  isOwner?: boolean
  memoryCount?: number
  friendCount?: number
}

export function ProfileSidebar({ profile, isOwner = true, memoryCount = 0, friendCount = 0 }: ProfileSidebarProps) {
  const displayName = profile.display_name || "User"

  return (
    <Card className="sticky top-20 overflow-hidden">
      {/* Cover photo */}
      <div className="relative h-24 bg-gradient-to-r from-primary/20 to-primary/10">
        {profile.cover_url && (
          <Image src={profile.cover_url || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
        )}
      </div>

      {/* Avatar */}
      <div className="relative -mt-12 px-4">
        <div className="relative inline-block">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url || "/placeholder.svg"}
              alt={displayName}
              width={80}
              height={80}
              className="rounded-full border-4 border-card object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-primary text-2xl font-bold text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-2">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
          {profile.bio && <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {profile.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.birthday && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(profile.birthday), "MMMM d")}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-4 border-t border-border pt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{memoryCount}</p>
            <p className="text-xs text-muted-foreground">Memories</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{friendCount}</p>
            <p className="text-xs text-muted-foreground">Friends</p>
          </div>
        </div>

        {isOwner && (
          <Link href="/profile/edit" className="mt-4 block">
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
