"use client"

import type { Memory } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MemoryCard } from "./memory-card"
import { Sparkles } from "lucide-react"
import { format } from "date-fns"

interface OnThisDayCardProps {
  memories: Memory[]
}

export function OnThisDayCard({ memories }: OnThisDayCardProps) {
  const today = new Date()
  const formattedDate = format(today, "MMMM d")

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          On This Day - {formattedDate}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memories.map((memory) => {
            const year = new Date(memory.memory_date).getFullYear()
            const yearsAgo = today.getFullYear() - year
            return (
              <div key={memory.id} className="relative">
                <div className="absolute -top-2 left-3 z-10 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
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
