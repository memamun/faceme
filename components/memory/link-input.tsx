"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Link2, X, Plus } from "lucide-react"

interface LinkData {
  url: string
  title?: string
  description?: string
}

interface LinkInputProps {
  links: LinkData[]
  onAdd: (link: LinkData) => void
  onRemove: (url: string) => void
}

export function LinkInput({ links, onAdd, onRemove }: LinkInputProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!url) return

    // Basic URL validation
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`)
    } catch {
      setError("Please enter a valid URL")
      return
    }

    const formattedUrl = url.startsWith("http") ? url : `https://${url}`

    if (links.some((l) => l.url === formattedUrl)) {
      setError("This link has already been added")
      return
    }

    onAdd({ url: formattedUrl })
    setUrl("")
  }

  return (
    <div className="mt-2 space-y-3">
      <form onSubmit={handleAddLink} className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter a URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link) => (
            <Card key={link.url} className="flex items-center gap-3 p-3">
              <Link2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-sm text-primary hover:underline"
              >
                {link.url}
              </a>
              <button
                type="button"
                onClick={() => onRemove(link.url)}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
