"use client"

import { useRouter, useSearchParams } from "next/navigation"
import type { Memory } from "@/lib/types"
import { MemoryCard } from "./memory-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, Calendar, SlidersHorizontal } from "lucide-react"

interface TimelineViewProps {
  memories: Memory[]
  currentYear: number
  currentMonth?: number
  availableYears: number[]
  currentUserId?: string
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

export function TimelineView({
  memories,
  currentYear,
  currentMonth,
  availableYears,
  currentUserId,
}: TimelineViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToYear = (year: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("year", year.toString())
    params.delete("month")
    router.push(`/timeline?${params.toString()}`)
  }

  const navigateToMonth = (month: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (month === null) {
      params.delete("month")
    } else {
      params.set("month", month.toString())
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
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousYear}
            disabled={availableYears.indexOf(currentYear) >= availableYears.length - 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 text-lg font-semibold">
                {currentYear}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableYears.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => navigateToYear(year)}
                  className={year === currentYear ? "bg-muted" : ""}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextYear}
            disabled={availableYears.indexOf(currentYear) <= 0}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {currentMonth ? MONTHS[currentMonth - 1] : "All"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigateToMonth(null)} className={!currentMonth ? "bg-muted" : ""}>
              All months
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {MONTHS.map((month, index) => (
              <DropdownMenuItem
                key={month}
                onClick={() => navigateToMonth(index + 1)}
                className={currentMonth === index + 1 ? "bg-muted" : ""}
              >
                {month}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Timeline */}
      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg bg-card py-20 text-center shadow-sm">
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
            <MemoryCard key={memory.id} memory={memory} currentUserId={currentUserId} />
          ))}
        </div>
      ) : (
        // Grouped by month view
        <div className="space-y-6">
          {Object.entries(memoriesByMonth)
            .sort(([a], [b]) => Number.parseInt(b) - Number.parseInt(a))
            .map(([monthIndex, monthMemories]) => (
              <div key={monthIndex}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <h2 className="text-sm font-semibold text-muted-foreground">{MONTHS[Number.parseInt(monthIndex)]}</h2>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-4">
                  {monthMemories.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} currentUserId={currentUserId} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
