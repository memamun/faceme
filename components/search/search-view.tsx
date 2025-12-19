"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Memory } from "@/lib/types"
import { MOOD_OPTIONS } from "@/lib/types"
import { MemoryCard } from "@/components/timeline/memory-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, SlidersHorizontal, Calendar, Tag, Smile, X } from "lucide-react"

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
  currentUserId?: string
}

export function SearchView({ memories, allTags, initialFilters, currentUserId }: SearchViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(initialFilters.q || "")
  const [selectedTag, setSelectedTag] = useState(initialFilters.tag || "")
  const [selectedMood, setSelectedMood] = useState(initialFilters.mood || "")
  const [dateFrom, setDateFrom] = useState(initialFilters.from || "")
  const [dateTo, setDateTo] = useState(initialFilters.to || "")

  const hasActiveFilters =
    initialFilters.q || initialFilters.tag || initialFilters.mood || initialFilters.from || initialFilters.to

  const activeFilterCount = [initialFilters.tag, initialFilters.mood, initialFilters.from || initialFilters.to].filter(
    Boolean,
  ).length

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

  const clearFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(filter)
    if (filter === "tag") setSelectedTag("")
    if (filter === "mood") setSelectedMood("")
    if (filter === "from") setDateFrom("")
    if (filter === "to") setDateTo("")
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Search bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search your memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 border-0 bg-muted/50 pl-10 text-base"
              />
            </div>
            <Button type="submit" className="h-11 px-6">
              Search
            </Button>
          </form>

          {/* Filter buttons */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Tag filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={selectedTag ? "default" : "outline"}
                  size="sm"
                  className={`gap-2 ${!selectedTag ? "bg-transparent" : ""}`}
                >
                  <Tag className="h-4 w-4" />
                  {selectedTag || "Tag"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto">
                <DropdownMenuItem onClick={() => setSelectedTag("")}>All tags</DropdownMenuItem>
                <DropdownMenuSeparator />
                {allTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag)
                      setTimeout(applyFilters, 0)
                    }}
                  >
                    {tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mood filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={selectedMood ? "default" : "outline"}
                  size="sm"
                  className={`gap-2 ${!selectedMood ? "bg-transparent" : ""}`}
                >
                  <Smile className="h-4 w-4" />
                  {selectedMood ? MOOD_OPTIONS.find((m) => m.value === selectedMood)?.label : "Mood"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedMood("")
                      setTimeout(applyFilters, 0)
                    }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    All moods
                  </button>
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => {
                        setSelectedMood(mood.value)
                        setTimeout(applyFilters, 0)
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${
                        selectedMood === mood.value ? mood.color : ""
                      }`}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Date filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={dateFrom || dateTo ? "default" : "outline"}
                  size="sm"
                  className={`gap-2 ${!dateFrom && !dateTo ? "bg-transparent" : ""}`}
                >
                  <Calendar className="h-4 w-4" />
                  Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">From</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">To</label>
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1" />
                  </div>
                  <Button size="sm" onClick={applyFilters} className="w-full">
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={clearFilters} disabled={!hasActiveFilters}>
                  Clear all filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {initialFilters.q && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  "{initialFilters.q}"
                  <button onClick={() => clearFilter("q")} className="ml-1 rounded-full p-0.5 hover:bg-background/50">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {initialFilters.tag && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  #{initialFilters.tag}
                  <button onClick={() => clearFilter("tag")} className="ml-1 rounded-full p-0.5 hover:bg-background/50">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {initialFilters.mood && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {MOOD_OPTIONS.find((m) => m.value === initialFilters.mood)?.label}
                  <button
                    onClick={() => clearFilter("mood")}
                    className="ml-1 rounded-full p-0.5 hover:bg-background/50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(initialFilters.from || initialFilters.to) && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {initialFilters.from} - {initialFilters.to}
                  <button
                    onClick={() => {
                      clearFilter("from")
                      clearFilter("to")
                    }}
                    className="ml-1 rounded-full p-0.5 hover:bg-background/50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results count */}
      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          Found {memories.length} {memories.length === 1 ? "memory" : "memories"}
        </p>
      )}

      {/* Results */}
      {memories.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground">
              {hasActiveFilters ? "No memories found" : "Start searching"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your search or filters"
                : "Use the search bar to find memories by content, or use filters to narrow down results"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  )
}
