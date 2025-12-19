"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageIcon, Video, Smile, MoreHorizontal, Calendar, Tag, Loader2, X } from "lucide-react"
import { MOOD_OPTIONS, TAG_SUGGESTIONS } from "@/lib/types"
import type { Profile } from "@/lib/types"
import { format } from "date-fns"

interface QuickPostComposerProps {
  userId: string
  profile?: Profile | null
}

export function QuickPostComposer({ userId, profile }: QuickPostComposerProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState("")
  const [memoryDate, setMemoryDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [useCustomDate, setUseCustomDate] = useState(false)
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)

  const displayName = profile?.display_name || "User"
  const avatarUrl = profile?.avatar_url

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
    setIsExpanded(true)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && selectedFiles.length === 0) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Create memory
      const { data: newMemory, error: insertError } = await supabase
        .from("memories")
        .insert({
          user_id: userId,
          content: content.trim() || null,
          memory_date: useCustomDate ? memoryDate : format(new Date(), "yyyy-MM-dd"),
          mood: mood || null,
          tags,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Upload media files
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData()
          formData.append("file", file)

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (uploadRes.ok) {
            const { url, filename } = await uploadRes.json()
            const mediaType = file.type.startsWith("video/") ? "video" : "image"

            await supabase.from("memory_media").insert({
              memory_id: newMemory.id,
              user_id: userId,
              url,
              media_type: mediaType,
              filename,
              file_size: file.size,
            })
          }
        }
      }

      // Reset form
      setContent("")
      setSelectedFiles([])
      setMood("")
      setTags([])
      setUseCustomDate(false)
      setMemoryDate(format(new Date(), "yyyy-MM-dd"))
      setIsExpanded(false)

      router.refresh()
    } catch (err) {
      console.error("Error creating memory:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedMood = MOOD_OPTIONS.find((m) => m.value === mood)

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            {/* Avatar */}
            {avatarUrl ? (
              <Image
                src={avatarUrl || "/placeholder.svg"}
                alt={displayName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Input area */}
            <div className="flex-1">
              <Textarea
                placeholder={`What's on your mind, ${displayName.split(" ")[0]}?`}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  if (e.target.value) setIsExpanded(true)
                }}
                onFocus={() => setIsExpanded(true)}
                className="min-h-[44px] resize-none border-0 bg-muted/50 px-4 py-3 focus-visible:ring-0"
                rows={isExpanded ? 3 : 1}
              />

              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted">
                        {file.type.startsWith("image/") ? (
                          <Image
                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-foreground p-1 text-background hover:bg-foreground/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags and mood display */}
              {(tags.length > 0 || mood) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedMood && (
                    <Badge variant="secondary" className={selectedMood.color}>
                      {selectedMood.label}
                    </Badge>
                  )}
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Custom date display */}
              {useCustomDate && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(memoryDate), "MMMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Photo/Video</span>
              </Button>

              {/* Mood picker */}
              <Popover open={showMoodPicker} onOpenChange={setShowMoodPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                  >
                    <Smile className="h-5 w-5" />
                    <span className="hidden sm:inline">Feeling</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {MOOD_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setMood(mood === option.value ? "" : option.value)
                          setShowMoodPicker(false)
                        }}
                        className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          mood === option.value ? option.color : "hover:bg-muted"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Tag picker */}
              <Popover open={showTagPicker} onOpenChange={setShowTagPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Tag className="h-5 w-5" />
                    <span className="hidden sm:inline">Tag</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="flex flex-wrap gap-1">
                    {TAG_SUGGESTIONS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${
                          tags.includes(tag) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* More options dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="sm">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setUseCustomDate(!useCustomDate)} className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {useCustomDate ? "Use today's date" : "Set custom date"}
                  </DropdownMenuItem>
                  {useCustomDate && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <Label className="text-xs text-muted-foreground">Memory date</Label>
                        <Input
                          type="date"
                          value={memoryDate}
                          onChange={(e) => setMemoryDate(e.target.value)}
                          max={format(new Date(), "yyyy-MM-dd")}
                          className="mt-1"
                        />
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
              className="px-6"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
