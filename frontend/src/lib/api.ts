import type { Project } from "@/lib/dummy-projects"
import type { ExtractedPaper } from "@/lib/dummy-papers"
import type { ProfiledDataset } from "@/lib/dummy-datasets"
import type { ResearchQuestionDetail } from "@/lib/dummy-questions"
import type { ExecutedAnalysis } from "@/lib/dummy-analyses"
import type { Artifact } from "@/lib/dummy-visualizations"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

export interface RulebookEntryApi {
  id: string
  projectId: string
  scope: string
  text: string
  confidence: string
  source: string
  createdAt: string
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new ApiError(res.status, `${init?.method ?? "GET"} ${path} failed (${res.status}): ${detail}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function query(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
  if (entries.length === 0) return ""
  return `?${new URLSearchParams(entries).toString()}`
}

function makeCrud<TRead, TCreate = Partial<TRead>, TUpdate = Partial<TRead>>(resource: string) {
  return {
    list: (projectId?: string) => apiFetch<TRead[]>(`/${resource}/${query({ projectId })}`),
    get: (id: string) => apiFetch<TRead>(`/${resource}/${id}`),
    create: (data: TCreate) => apiFetch<TRead>(`/${resource}/`, { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: TUpdate) => apiFetch<TRead>(`/${resource}/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    remove: (id: string) => apiFetch<void>(`/${resource}/${id}`, { method: "DELETE" }),
  }
}

// Deliberately bypasses apiFetch's hardcoded JSON Content-Type — a FormData
// body needs the browser to set its own multipart boundary.
async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: formData })
  if (!res.ok) {
    let detail = ""
    try {
      const body = await res.json()
      detail = typeof body?.detail === "string" ? body.detail : JSON.stringify(body)
    } catch {
      detail = await res.text().catch(() => "")
    }
    throw new ApiError(res.status, detail || `Upload failed (${res.status})`)
  }
  return (await res.json()) as T
}

export const api = {
  projects: makeCrud<Project>("projects"),
  papers: { ...makeCrud<ExtractedPaper>("papers"), upload: (formData: FormData) => apiUpload<ExtractedPaper>("/papers/upload", formData) },
  datasets: { ...makeCrud<ProfiledDataset>("datasets"), upload: (formData: FormData) => apiUpload<ProfiledDataset>("/datasets/upload", formData) },
  researchQuestions: makeCrud<ResearchQuestionDetail>("research-questions"),
  analyses: makeCrud<ExecutedAnalysis>("analyses"),
  artifacts: makeCrud<Artifact>("artifacts"),
  rulebookEntries: makeCrud<RulebookEntryApi>("rulebook-entries"),
}

export { ApiError }
