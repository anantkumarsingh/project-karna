export type ProjectStatus = "active" | "paused" | "completed" | "archived"

export interface Project {
  id: string
  name: string
  description: string
  domain: string
  status: ProjectStatus
  createdAt: string
  lastActivity: string
  researchQuestionIds: string[]
  focusedQuestionId?: string
}

export const dummyProjects: Project[] = [
  {
    id: "project_001",
    name: "Biomarker Prognostic Study — NSCLC Cohort",
    description:
      "Investigating whether baseline serum IL-6 and CRP levels predict progression-free survival in patients with non-small cell lung cancer receiving first-line immunotherapy.",
    domain: "Biomedical / Clinical Oncology",
    status: "active",
    createdAt: "2026-05-12",
    lastActivity: "2026-06-16T14:32:00Z",
    researchQuestionIds: ["rq_001", "rq_002"],
    focusedQuestionId: "rq_001",
  },
  {
    id: "project_002",
    name: "Depression & Glycemic Control in Type 2 Diabetes",
    description:
      "Exploring whether depressive symptom severity (PHQ-9) is associated with poor glycemic control (HbA1c) in adults with type 2 diabetes, independent of medication adherence.",
    domain: "Biomedical / Endocrinology",
    status: "paused",
    createdAt: "2026-06-20",
    lastActivity: "2026-06-22T11:00:00Z",
    researchQuestionIds: ["rq_101"],
    focusedQuestionId: "rq_101",
  },
]

export function getProject(projectId: string): Project | undefined {
  return dummyProjects.find((p) => p.id === projectId)
}
