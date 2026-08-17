"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { api } from "@/lib/api"
import type { Project } from "@/lib/dummy-projects"

interface ProjectContextValue {
  currentProjectId: string
  // Nullable and honestly typed as such — only guaranteed non-null once `loading`
  // is false and `error` is null. AppShell gates rendering on that; any consumer
  // added later should still guard for null rather than assume the gate protects it.
  currentProject: Project | null
  projects: Project[]
  setCurrentProjectId: (id: string) => void
  loading: boolean
  error: string | null
  refreshProjects: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.projects.list()
      setProjects(data)
      setCurrentProjectId((prev) => {
        if (prev && data.some((p) => p.id === prev)) return prev
        return data.find((p) => p.status === "active")?.id ?? data[0]?.id ?? ""
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects — is the backend running?")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const currentProject = projects.find((p) => p.id === currentProjectId) ?? null

  const value = useMemo<ProjectContextValue>(
    () => ({ currentProjectId, currentProject, projects, setCurrentProjectId, loading, error, refreshProjects: loadProjects }),
    [currentProjectId, currentProject, projects, loading, error, loadProjects]
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error("useProject must be used within a ProjectProvider")
  return ctx
}
