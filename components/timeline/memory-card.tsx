"use client"

import Link from "next/link"
import Image from "next/image"
import type { Memory } from "@/lib/types"
import { MOOD_OPTIONS } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ImageIcon, Link2, Pin } from "lucide-react"

interface MemoryCardProps {
  memory: Memory
  compact?: boolean
}

export function MemoryCard({ memory, compact = false }: MemoryCardProps) {
  const mood = MOOD_OPTIONS.find((m) => m.value === memory.mood)
  const hasMedia = memory.media && memory.media.length > 0
  const hasLinks = memory.links && memory.links.length > 0
  const formattedDate = format(new Date(memory.memory_date), "EEEE, MMMM d, yyyy")

  if (compact) {
    return (
      <Link href={`/memory/${memory.id}`}>
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {hasMedia && memory.media![0].media_type === "image" && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                  <Image src={memory.media![0].url || "/placeholder.svg"} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">{format(new Date(memory.memory_date), "MMM d, yyyy")}</p>
                {memory.content && <p className="mt-1 line-clamp-2 text-sm text-foreground">{memory.content}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/memory/${memory.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        {/* Media Preview */}
        {hasMedia && memory.media![0].media_type === "image" && (
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={memory.media![0].url || "/placeholder.svg"}
              alt=""
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {memory.media!.length > 1 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                <ImageIcon className="h-3 w-3" />
                {memory.media!.length}
              </div>
            )}
          </div>
        )}

        <CardContent className="p-4">
          {/* Date and indicators */}
          <div className="mb-2 flex items-center justify-between">
            <time className="text-sm font-medium text-muted-foreground">{formattedDate}</time>
            <div className="flex items-center gap-2">
              {memory.is_pinned && <Pin className="h-4 w-4 text-primary" />}
              {hasLinks && <Link2 className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>

          {/* Content */}
          {memory.content && <p className="mb-3 line-clamp-3 text-foreground leading-relaxed">{memory.content}</p>}

          {/* Mood and Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {mood && (
              <Badge variant="secondary" className={mood.color}>
                {mood.label}
              </Badge>
            )}
            {memory.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {memory.tags.length > 3 && <Badge variant="outline">+{memory.tags.length - 3}</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
