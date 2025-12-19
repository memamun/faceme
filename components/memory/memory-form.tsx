"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MOOD_OPTIONS, TAG_SUGGESTIONS } from "@/lib/types"
import type { Memory, MemoryMedia, MemoryLink } from "@/lib/types"
import { MediaUploader } from "./media-uploader"
import { LinkInput } from "./link-input"
import { Calendar, X, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface MemoryFormProps {
  userId: string
  existingMemory?: Memory
}

interface UploadedMedia {
  url: string
  filename: string
  media_type: "image" | "video"
  file_size: number
}

interface LinkData {
  url: string
  title?: string
  description?: string
}

export function MemoryForm({ userId, existingMemory }: MemoryFormProps) {
  const router = useRouter()
  const isEditing = !!existingMemory

  const [content, setContent] = useState(existingMemory?.content || "")
  const [memoryDate, setMemoryDate] = useState(existingMemory?.memory_date || format(new Date(), "yyyy-MM-dd"))
  const [mood, setMood] = useState(existingMemory?.mood || "")
  const [tags, setTags] = useState<string[]>(existingMemory?.tags || [])
  const [customTag, setCustomTag] = useState("")
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>(
    existingMemory?.media?.map((m: MemoryMedia) => ({
      url: m.url,
      filename: m.filename || "",
      media_type: m.media_type,
      file_size: m.file_size || 0,
    })) || [],
  )
  const [links, setLinks] = useState<LinkData[]>(
    existingMemory?.links?.map((l: MemoryLink) => ({
      url: l.url,
      title: l.title || undefined,
      description: l.description || undefined,
    })) || [],
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
    setCustomTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleMediaUpload = useCallback((media: UploadedMedia) => {
    setUploadedMedia((prev) => [...prev, media])
  }, [])

  const removeMedia = (url: string) => {
    setUploadedMedia(uploadedMedia.filter((m) => m.url !== url))
  }

  const handleAddLink = (link: LinkData) => {
    setLinks([...links, link])
  }

  const removeLink = (url: string) => {
    setLinks(links.filter((l) => l.url !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      if (isEditing && existingMemory) {
        // Update existing memory
        const { error: updateError } = await supabase
          .from("memories")
          .update({
            content,
            memory_date: memoryDate,
            mood: mood || null,
            tags,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMemory.id)
          .eq("user_id", userId)

        if (updateError) throw updateError

        // Handle media updates - delete removed and add new
        const existingMediaUrls = existingMemory.media?.map((m) => m.url) || []
        const newMediaUrls = uploadedMedia.map((m) => m.url)

        // Delete removed media
        for (const url of existingMediaUrls) {
          if (!newMediaUrls.includes(url)) {
            await supabase.from("memory_media").delete().eq("url", url).eq("user_id", userId)
          }
        }

        // Add new media
        for (const media of uploadedMedia) {
          if (!existingMediaUrls.includes(media.url)) {
            await supabase.from("memory_media").insert({
              memory_id: existingMemory.id,
              user_id: userId,
              url: media.url,
              media_type: media.media_type,
              filename: media.filename,
              file_size: media.file_size,
            })
          }
        }

        // Handle link updates similarly
        const existingLinkUrls = existingMemory.links?.map((l) => l.url) || []
        const newLinkUrls = links.map((l) => l.url)

        for (const url of existingLinkUrls) {
          if (!newLinkUrls.includes(url)) {
            await supabase.from("memory_links").delete().eq("url", url).eq("user_id", userId)
          }
        }

        for (const link of links) {
          if (!existingLinkUrls.includes(link.url)) {
            await supabase.from("memory_links").insert({
              memory_id: existingMemory.id,
              user_id: userId,
              url: link.url,
              title: link.title,
              description: link.description,
            })
          }
        }

        router.push(`/memory/${existingMemory.id}`)
      } else {
        // Create new memory
        const { data: newMemory, error: insertError } = await supabase
          .from("memories")
          .insert({
            user_id: userId,
            content,
            memory_date: memoryDate,
            mood: mood || null,
            tags,
          })
          .select()
          .single()

        if (insertError) throw insertError

        // Add media
        if (uploadedMedia.length > 0) {
          const mediaInserts = uploadedMedia.map((media) => ({
            memory_id: newMemory.id,
            user_id: userId,
            url: media.url,
            media_type: media.media_type,
            filename: media.filename,
            file_size: media.file_size,
          }))

          const { error: mediaError } = await supabase.from("memory_media").insert(mediaInserts)
          if (mediaError) throw mediaError
        }

        // Add links
        if (links.length > 0) {
          const linkInserts = links.map((link) => ({
            memory_id: newMemory.id,
            user_id: userId,
            url: link.url,
            title: link.title,
            description: link.description,
          }))

          const { error: linksError } = await supabase.from("memory_links").insert(linkInserts)
          if (linksError) throw linksError
        }

        router.push(`/memory/${newMemory.id}`)
      }
    } catch (err) {
      console.error("Error saving memory:", err)
      setError(err instanceof Error ? err.message : "Failed to save memory")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          {/* Date */}
          <div className="mb-6">
            <Label htmlFor="memory-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              When did this happen?
            </Label>
            <Input
              id="memory-date"
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              className="mt-2 w-full max-w-xs"
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <Label htmlFor="content">What would you like to remember?</Label>
            <Textarea
              id="content"
              placeholder="Write about this memory... thoughts, feelings, what happened..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-2 min-h-32 resize-y"
            />
          </div>

          {/* Media Upload */}
          <div className="mb-6">
            <Label>Photos & Videos</Label>
            <MediaUploader onUpload={handleMediaUpload} uploadedMedia={uploadedMedia} onRemove={removeMedia} />
          </div>

          {/* Links */}
          <div className="mb-6">
            <Label>Links</Label>
            <LinkInput links={links} onAdd={handleAddLink} onRemove={removeLink} />
          </div>

          {/* Mood */}
          <div className="mb-6">
            <Label>How were you feeling?</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(mood === option.value ? "" : option.value)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    mood === option.value
                      ? `${option.color} ring-2 ring-primary ring-offset-2`
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="default" className="gap-1 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {TAG_SUGGESTIONS.filter((tag) => !tags.includes(tag)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  + {tag}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag(customTag)
                  }
                }}
                className="max-w-xs"
              />
              <Button type="button" variant="outline" onClick={() => addTag(customTag)} disabled={!customTag}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update Memory"
          ) : (
            "Save Memory"
          )}
        </Button>
      </div>
    </form>
  )
}
