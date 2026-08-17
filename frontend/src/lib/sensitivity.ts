import type { SensitivityLevel } from "@/lib/dummy-papers"

export const SENSITIVITY_OPTIONS: { value: SensitivityLevel; label: string; description: string }[] = [
  { value: "public", label: "Public", description: "AI agents may use raw content from this item." },
  { value: "restricted", label: "Restricted", description: "AI agents only see schema and aggregate stats — never raw values. Default." },
  { value: "no_ai", label: "Do not send to AI", description: "AI agents get no access at all, not even schema." },
]
