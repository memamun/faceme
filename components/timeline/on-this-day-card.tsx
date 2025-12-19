"use client"

import type { Memory } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MemoryCard } from "./memory-card"
import { Clock } from "lucide-react"
import { format } from "date-fns"

interface OnThisDayCardProps {
  memories: Memory[]
}

export function OnThisDayCard({ memories }: OnThisDayCardProps) {
  const today = new Date()
  const formattedDate = format(today, "MMMM d")

  return (
    <Card className="mb-6 overflow-hidden border-0 shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50 pb-3 dark:from-amber-950/20 dark:to-orange-950/20">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Clock className="h-5 w-5 text-amber-600" />
          On This Day - {formattedDate}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {memories.map((memory) => {
            const year = new Date(memory.memory_date).getFullYear()
            const yearsAgo = today.getFullYear() - year
            return (
              <div key={memory.id} className="relative min-w-[280px] max-w-[300px] flex-shrink-0">
                <div className="absolute -top-1 left-3 z-10 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                  {yearsAgo} {yearsAgo === 1 ? "year" : "years"} ago
                </div>
                <MemoryCard memory={memory} compact />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
