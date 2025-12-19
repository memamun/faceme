"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Memory } from "@/lib/types"
import { MOOD_OPTIONS } from "@/lib/types"
import { MemoryCard } from "@/components/timeline/memory-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X, SlidersHorizontal } from "lucide-react"

interface SearchViewProps {
  memories: Memory[]
  allTags: string[]
  initialFilters: {
    q?: string
    tag?: string
    mood?: string
    from?: string
    to?: string
  }
}

export function SearchView({ memories, allTags, initialFilters }: SearchViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(initialFilters.q || "")
  const [selectedTag, setSelectedTag] = useState(initialFilters.tag || "")
  const [selectedMood, setSelectedMood] = useState(initialFilters.mood || "")
  const [dateFrom, setDateFrom] = useState(initialFilters.from || "")
  const [dateTo, setDateTo] = useState(initialFilters.to || "")
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters =
    initialFilters.q || initialFilters.tag || initialFilters.mood || initialFilters.from || initialFilters.to

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (selectedTag) params.set("tag", selectedTag)
    if (selectedMood) params.set("mood", selectedMood)
    if (dateFrom) params.set("from", dateFrom)
    if (dateTo) params.set("to", dateTo)

    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTag("")
    setSelectedMood("")
    setDateFrom("")
    setDateTo("")
    router.push("/search")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Search Memories</h1>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Filters</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto gap-1 px-2 py-1 text-xs">
                  <X className="h-3 w-3" />
                  Clear all
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Tag filter */}
              <div className="space-y-2">
                <Label>Tag</Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any tag</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mood filter */}
              <div className="space-y-2">
                <Label>Mood</Label>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any mood</SelectItem>
                    {MOOD_OPTIONS.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date from */}
              <div className="space-y-2">
                <Label>From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              {/* Date to */}
              <div className="space-y-2">
                <Label>To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <Button onClick={applyFilters} className="mt-4">
              Apply Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          Found {memories.length} {memories.length === 1 ? "memory" : "memories"}
        </p>
      )}

      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground">
            {hasActiveFilters ? "No memories found" : "Start searching"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Use the search bar to find memories by content, or use filters to narrow down results"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  )
}
