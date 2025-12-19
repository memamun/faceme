import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"
import type { Profile } from "@/lib/types"

export default async function EditProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Edit Profile</h1>
      <ProfileEditForm
        userId={user.id}
        profile={
          (profile as Profile) || ({ id: user.id, display_name: user.email?.split("@")[0] || "User" } as Profile)
        }
      />
    </div>
  )
}
