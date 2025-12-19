import type React from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, Lock, Calendar, Heart } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/timeline")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">Memory Timeline</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Your Private Space for <span className="text-primary">Life's Moments</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
            A calm, intentional place to record memories, thoughts, and photos. Revisit your journey through a beautiful
            timeline, completely private and owned by you.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="text-lg px-8">
              Start Your Timeline
            </Button>
          </Link>
        </section>

        <section className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Lock className="h-10 w-10 text-primary" />}
            title="Completely Private"
            description="Your memories are yours alone. No social sharing, no public profiles, no external validation."
          />
          <FeatureCard
            icon={<Calendar className="h-10 w-10 text-primary" />}
            title="Timeline View"
            description="Navigate through your memories chronologically. Jump to any year or revisit 'On This Day' moments."
          />
          <FeatureCard
            icon={<Heart className="h-10 w-10 text-primary" />}
            title="Intentional Reflection"
            description="Record moments with purpose. Add moods, tags, photos, and backdate memories from any time."
          />
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>Your personal memory vault. Private. Calm. Yours.</p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
