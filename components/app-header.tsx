"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Users, Bell, Search, Settings, LogOut } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface AppHeaderProps {
  user: SupabaseUser
  profile?: Profile | null
}

export function AppHeader({ user, profile }: AppHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User"
  const avatarUrl = profile?.avatar_url

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-3">
          <Link href="/timeline" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="text-lg font-bold text-primary-foreground">M</span>
            </div>
          </Link>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search memories"
              className="h-10 w-60 rounded-full bg-muted/50 pl-10 focus-visible:ring-1"
              onFocus={() => router.push("/search")}
            />
          </div>
        </div>

        <nav className="hidden flex-1 justify-center md:flex">
          <div className="flex items-center gap-2">
            <Link href="/timeline">
              <Button variant="ghost" size="lg" className="h-12 w-24 rounded-lg hover:bg-muted">
                <Home className="h-6 w-6" />
              </Button>
            </Link>
            <Link href="/friends">
              <Button variant="ghost" size="lg" className="h-12 w-24 rounded-lg hover:bg-muted">
                <Users className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 rounded-full px-2">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl || "/placeholder.svg"}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden text-sm font-medium lg:inline">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer gap-3 p-3">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl || "/placeholder.svg"}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">View your profile</p>
                  </div>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer gap-3">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer gap-3 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
