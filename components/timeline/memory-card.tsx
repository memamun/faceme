"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Memory, Reaction } from "@/lib/types"
import { MOOD_OPTIONS, REACTION_OPTIONS } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDistanceToNow, format } from "date-fns"
import { MoreHorizontal, Heart, MessageCircle, Share2, Pin, Pencil, Trash2, Send } from "lucide-react"

interface MemoryCardProps {
  memory: Memory
  currentUserId?: string
  compact?: boolean
}

export function MemoryCard({ memory, currentUserId, compact = false }: MemoryCardProps) {
  const router = useRouter()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [localReactions, setLocalReactions] = useState<Reaction[]>(memory.reactions || [])
  const [localComments, setLocalComments] = useState(memory.comments || [])
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const mood = MOOD_OPTIONS.find((m) => m.value === memory.mood)
  const hasMedia = memory.media && memory.media.length > 0
  const formattedDate = format(new Date(memory.memory_date), "MMMM d, yyyy")
  const timeAgo = formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })

  const displayName = memory.profile?.display_name || "You"
  const avatarUrl = memory.profile?.avatar_url

  const userReaction = localReactions.find((r) => r.user_id === currentUserId)
  const reactionCounts = localReactions.reduce(
    (acc, r) => {
      acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const handleReaction = async (type: string) => {
    if (!currentUserId) return
    const supabase = createClient()

    if (userReaction?.reaction_type === type) {
      // Remove reaction
      await supabase.from("reactions").delete().eq("id", userReaction.id)
      setLocalReactions((prev) => prev.filter((r) => r.id !== userReaction.id))
    } else {
      if (userReaction) {
        // Update reaction
        await supabase.from("reactions").delete().eq("id", userReaction.id)
        setLocalReactions((prev) => prev.filter((r) => r.id !== userReaction.id))
      }
      // Add new reaction
      const { data } = await supabase
        .from("reactions")
        .insert({
          memory_id: memory.id,
          user_id: currentUserId,
          reaction_type: type,
        })
        .select()
        .single()

      if (data) {
        setLocalReactions((prev) => [...prev, data as Reaction])
      }
    }
    setShowReactionPicker(false)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUserId) return

    setIsSubmittingComment(true)
    const supabase = createClient()

    const { data } = await supabase
      .from("comments")
      .insert({
        memory_id: memory.id,
        user_id: currentUserId,
        content: newComment.trim(),
      })
      .select(`*, profile:profiles(*)`)
      .single()

    if (data) {
      setLocalComments((prev) => [...prev, data])
      setNewComment("")
    }
    setIsSubmittingComment(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this memory?")) return
    const supabase = createClient()
    await supabase.from("memories").delete().eq("id", memory.id)
    router.refresh()
  }

  const handlePin = async () => {
    const supabase = createClient()
    await supabase.from("memories").update({ is_pinned: !memory.is_pinned }).eq("id", memory.id)
    router.refresh()
  }

  if (compact) {
    return (
      <Link href={`/memory/${memory.id}`}>
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {hasMedia && memory.media![0].media_type === "image" && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
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
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl || "/placeholder.svg"}
              alt={displayName}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{displayName}</span>
              {mood && (
                <span className="text-sm text-muted-foreground">
                  is feeling{" "}
                  <span className={`font-medium ${mood.color.replace("bg-", "text-").replace("-100", "-600")}`}>
                    {mood.label.toLowerCase()}
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{formattedDate}</span>
              <span>·</span>
              <span>{timeAgo}</span>
              {memory.is_pinned && (
                <>
                  <span>·</span>
                  <Pin className="h-3 w-3" />
                </>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handlePin} className="gap-2">
              <Pin className="h-4 w-4" />
              {memory.is_pinned ? "Unpin memory" : "Pin memory"}
            </DropdownMenuItem>
            <Link href={`/memory/${memory.id}/edit`}>
              <DropdownMenuItem className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit memory
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete memory
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <CardContent className="px-4 py-3">
        {memory.content && <p className="whitespace-pre-wrap text-foreground leading-relaxed">{memory.content}</p>}

        {/* Tags */}
        {memory.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {memory.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Media */}
      {hasMedia && (
        <Link href={`/memory/${memory.id}`}>
          <div className={`relative ${memory.media!.length === 1 ? "aspect-video" : "grid grid-cols-2 gap-0.5"}`}>
            {memory.media!.slice(0, 4).map((media, index) => (
              <div
                key={media.id}
                className={`relative overflow-hidden bg-muted ${
                  memory.media!.length === 1 ? "aspect-video" : "aspect-square"
                }`}
              >
                {media.media_type === "image" ? (
                  <Image
                    src={media.url || "/placeholder.svg"}
                    alt=""
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <video src={media.url} className="h-full w-full object-cover" muted />
                )}
                {index === 3 && memory.media!.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-2xl font-bold text-white">+{memory.media!.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Link>
      )}

      {/* Reaction summary */}
      {(localReactions.length > 0 || localComments.length > 0) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-sm text-muted-foreground">
          {localReactions.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {Object.keys(reactionCounts)
                  .slice(0, 3)
                  .map((type) => {
                    const reaction = REACTION_OPTIONS.find((r) => r.value === type)
                    return reaction ? (
                      <span key={type} className="text-base">
                        {reaction.emoji}
                      </span>
                    ) : null
                  })}
              </div>
              <span>{localReactions.length}</span>
            </div>
          )}
          {localComments.length > 0 && (
            <button onClick={() => setShowComments(!showComments)} className="hover:underline">
              {localComments.length} {localComments.length === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center border-b border-border px-2 py-1">
        <Popover open={showReactionPicker} onOpenChange={setShowReactionPicker}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className={`flex-1 gap-2 ${userReaction ? "text-red-500" : ""}`}>
              {userReaction ? (
                <span className="text-lg">
                  {REACTION_OPTIONS.find((r) => r.value === userReaction.reaction_type)?.emoji}
                </span>
              ) : (
                <Heart className="h-5 w-5" />
              )}
              <span className="hidden sm:inline">
                {userReaction ? REACTION_OPTIONS.find((r) => r.value === userReaction.reaction_type)?.label : "Love"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" side="top">
            <div className="flex gap-1">
              {REACTION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleReaction(option.value)}
                  className={`rounded-full p-2 text-2xl transition-transform hover:scale-125 ${
                    userReaction?.reaction_type === option.value ? "bg-muted" : ""
                  }`}
                  title={option.label}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="ghost" className="flex-1 gap-2" onClick={() => setShowComments(!showComments)}>
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Comment</span>
        </Button>

        <Button variant="ghost" className="flex-1 gap-2">
          <Share2 className="h-5 w-5" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="p-4">
          {/* Comment list */}
          {localComments.length > 0 && (
            <div className="mb-4 space-y-3">
              {localComments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {(comment.profile?.display_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 rounded-2xl bg-muted px-3 py-2">
                    <p className="text-sm font-semibold">{comment.profile?.display_name || "User"}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add comment form */}
          <form onSubmit={handleComment} className="flex gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="relative flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[40px] resize-none rounded-2xl pr-10"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute bottom-1 right-1 h-8 w-8"
                disabled={!newComment.trim() || isSubmittingComment}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </Card>
  )
}
