"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ImagePlus, Video, X, Loader2 } from "lucide-react"

interface UploadedMedia {
  url: string
  filename: string
  media_type: "image" | "video"
  file_size: number
}

interface MediaUploaderProps {
  onUpload: (media: UploadedMedia) => void
  uploadedMedia: UploadedMedia[]
  onRemove: (url: string) => void
}

export function MediaUploader({ onUpload, uploadedMedia, onRemove }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      // Validate file type
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")

      if (!isImage && !isVideo) {
        setError("Only images and videos are allowed")
        continue
      }

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB")
        continue
      }

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()

        onUpload({
          url: data.url,
          filename: file.name,
          media_type: isImage ? "image" : "video",
          file_size: file.size,
        })
      } catch (err) {
        console.error("Upload error:", err)
        setError("Failed to upload file")
      }
    }

    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="mt-2 space-y-4">
      {/* Upload button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              Add Photos
            </>
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Preview grid */}
      {uploadedMedia.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {uploadedMedia.map((media) => (
            <div key={media.url} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
              {media.media_type === "image" ? (
                <Image src={media.url || "/placeholder.svg"} alt={media.filename} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Video className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(media.url)}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
