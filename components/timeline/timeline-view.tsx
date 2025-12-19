"use client"

import { useRouter, useSearchParams } from "next/navigation"
import type { Memory } from "@/lib/types"
import { MemoryCard } from "./memory-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface TimelineViewProps {
  memories: Memory[]
  currentYear: number
  currentMonth?: number
  availableYears: number[]
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function TimelineView({ memories, currentYear, currentMonth, availableYears }: TimelineViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToYear = (year: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("year", year.toString())
    params.delete("month")
    router.push(`/timeline?${params.toString()}`)
  }

  const navigateToMonth = (month: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (month === "all") {
      params.delete("month")
    } else {
      params.set("month", month)
    }
    router.push(`/timeline?${params.toString()}`)
  }

  const goToPreviousYear = () => {
    const prevYearIndex = availableYears.indexOf(currentYear) + 1
    if (prevYearIndex < availableYears.length) {
      navigateToYear(availableYears[prevYearIndex])
    }
  }

  const goToNextYear = () => {
    const nextYearIndex = availableYears.indexOf(currentYear) - 1
    if (nextYearIndex >= 0) {
      navigateToYear(availableYears[nextYearIndex])
    }
  }

  // Group memories by month
  const memoriesByMonth = memories.reduce(
    (acc, memory) => {
      const month = new Date(memory.memory_date).getMonth()
      if (!acc[month]) acc[month] = []
      acc[month].push(memory)
      return acc
    },
    {} as Record<number, Memory[]>,
  )

  return (
    <div className="space-y-6">
      {/* Navigation Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousYear}
            disabled={availableYears.indexOf(currentYear) >= availableYears.length - 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous year</span>
          </Button>

          <Select value={currentYear.toString()} onValueChange={(v) => navigateToYear(Number.parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextYear}
            disabled={availableYears.indexOf(currentYear) <= 0}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next year</span>
          </Button>
        </div>

        <Select value={currentMonth?.toString() || "all"} onValueChange={navigateToMonth}>
          <SelectTrigger className="w-40">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {MONTHS.map((month, index) => (
              <SelectItem key={month} value={(index + 1).toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground">No memories yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentMonth
              ? `No memories recorded for ${MONTHS[currentMonth - 1]} ${currentYear}`
              : `No memories recorded for ${currentYear}`}
          </p>
        </div>
      ) : currentMonth ? (
        // Single month view
        <div className="space-y-4">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      ) : (
        // Grouped by month view
        <div className="space-y-8">
          {Object.entries(memoriesByMonth)
            .sort(([a], [b]) => Number.parseInt(b) - Number.parseInt(a))
            .map(([monthIndex, monthMemories]) => (
              <div key={monthIndex}>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <span className="h-px flex-1 bg-border" />
                  <span className="px-3">{MONTHS[Number.parseInt(monthIndex)]}</span>
                  <span className="h-px flex-1 bg-border" />
                </h2>
                <div className="space-y-4">
                  {monthMemories.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
