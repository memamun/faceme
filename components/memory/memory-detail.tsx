"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Memory } from "@/lib/types"
import { MOOD_OPTIONS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Edit, Trash2, Pin, Link2, ExternalLink, ChevronLeft, ChevronRight, X } from "lucide-react"

interface MemoryDetailProps {
  memory: Memory
  userId: string
}

export function MemoryDetail({ memory, userId }: MemoryDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const mood = MOOD_OPTIONS.find((m) => m.value === memory.mood)
  const hasMedia = memory.media && memory.media.length > 0
  const hasLinks = memory.links && memory.links.length > 0
  const images = memory.media?.filter((m) => m.media_type === "image") || []
  const videos = memory.media?.filter((m) => m.media_type === "video") || []

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    try {
      // Delete media files from blob storage
      if (memory.media) {
        for (const media of memory.media) {
          await fetch("/api/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: media.url }),
          })
        }
      }

      // Delete memory (cascades to media and links)
      const { error } = await supabase.from("memories").delete().eq("id", memory.id).eq("user_id", userId)

      if (error) throw error

      router.push("/timeline")
    } catch (error) {
      console.error("Error deleting memory:", error)
      setIsDeleting(false)
    }
  }

  const handleTogglePin = async () => {
    const supabase = createClient()
    await supabase.from("memories").update({ is_pinned: !memory.is_pinned }).eq("id", memory.id).eq("user_id", userId)

    router.refresh()
  }

  return (
    <>
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-2 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card>
        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="relative">
            {images.length === 1 ? (
              <button
                type="button"
                onClick={() => setSelectedImageIndex(0)}
                className="block w-full"
                aria-label="View image fullscreen"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image src={images[0].url || "/placeholder.svg"} alt="" fill className="object-cover" />
                </div>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className="relative aspect-video overflow-hidden"
                    aria-label={`View image ${index + 1} fullscreen`}
                  >
                    <Image src={image.url || "/placeholder.svg"} alt="" fill className="object-cover" />
                    {index === 3 && images.length > 4 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-medium text-white">
                        +{images.length - 4}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <CardContent className="p-6">
          {/* Date and actions */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time className="font-medium">{format(new Date(memory.memory_date), "EEEE, MMMM d, yyyy")}</time>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTogglePin}
                className={memory.is_pinned ? "text-primary" : "text-muted-foreground"}
              >
                <Pin className="h-4 w-4" />
                <span className="sr-only">{memory.is_pinned ? "Unpin" : "Pin"} memory</span>
              </Button>
              <Link href={`/memory/${memory.id}/edit`}>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit memory</span>
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete memory</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this memory and all associated media.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Content */}
          {memory.content && (
            <div className="mb-6">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">{memory.content}</p>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="mb-6 space-y-3">
              {videos.map((video) => (
                <video key={video.id} src={video.url} controls className="w-full rounded-lg">
                  Your browser does not support the video tag.
                </video>
              ))}
            </div>
          )}

          {/* Links */}
          {hasLinks && (
            <div className="mb-6 space-y-2">
              {memory.links!.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
                >
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="flex-1 truncate text-sm text-foreground">{link.title || link.url}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          )}

          {/* Mood and Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {mood && (
              <Badge variant="secondary" className={mood.color}>
                {mood.label}
              </Badge>
            )}
            {memory.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Metadata */}
          <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
            <p>Created {format(new Date(memory.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
            {memory.updated_at !== memory.created_at && (
              <p>Last updated {format(new Date(memory.updated_at), "MMM d, yyyy 'at' h:mm a")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            type="button"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          {selectedImageIndex > 0 && (
            <button
              type="button"
              onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="relative h-[80vh] w-[90vw] max-w-5xl">
            <Image
              src={images[selectedImageIndex].url || "/placeholder.svg"}
              alt=""
              fill
              className="object-contain"
              priority
            />
          </div>

          {selectedImageIndex < images.length - 1 && (
            <button
              type="button"
              onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white">
            {selectedImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
