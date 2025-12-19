export interface Memory {
  id: string
  user_id: string
  content: string | null
  memory_date: string
  created_at: string
  updated_at: string
  mood: string | null
  tags: string[]
  is_pinned: boolean
  media?: MemoryMedia[]
  links?: MemoryLink[]
}

export interface MemoryMedia {
  id: string
  memory_id: string
  user_id: string
  url: string
  media_type: "image" | "video"
  filename: string | null
  file_size: number | null
  created_at: string
}

export interface MemoryLink {
  id: string
  memory_id: string
  user_id: string
  url: string
  title: string | null
  description: string | null
  created_at: string
}

export interface MemoryFormData {
  content: string
  memory_date: string
  mood: string
  tags: string[]
}

export const MOOD_OPTIONS = [
  { value: "happy", label: "Happy", color: "bg-yellow-100 text-yellow-800" },
  { value: "grateful", label: "Grateful", color: "bg-green-100 text-green-800" },
  { value: "peaceful", label: "Peaceful", color: "bg-blue-100 text-blue-800" },
  { value: "excited", label: "Excited", color: "bg-orange-100 text-orange-800" },
  { value: "nostalgic", label: "Nostalgic", color: "bg-purple-100 text-purple-800" },
  { value: "reflective", label: "Reflective", color: "bg-slate-100 text-slate-800" },
  { value: "sad", label: "Sad", color: "bg-indigo-100 text-indigo-800" },
  { value: "anxious", label: "Anxious", color: "bg-red-100 text-red-800" },
] as const

export const TAG_SUGGESTIONS = [
  "Travel",
  "Family",
  "Friends",
  "Career",
  "Health",
  "Achievement",
  "Learning",
  "Nature",
  "Food",
  "Music",
  "Art",
  "Sports",
  "Holiday",
  "Birthday",
  "Anniversary",
  "Milestone",
] as const
