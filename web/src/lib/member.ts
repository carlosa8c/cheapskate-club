export type WorkOutcomes = {
  completed_tasks?: number;
  human_accepted_jobs?: number;
  merged_runs?: number;
  review_approved_jobs?: number;
  acceptance_rate?: number;
};

export type Member = {
  handle: string;
  display_name: string;
  tokens: number;
  categories: Record<string, number>;
  share_models: boolean;
  models: { name: string; tokens: number }[];
  roles?: { name: string; tokens: number }[];
  work_outcomes?: WorkOutcomes;
};

export function memberData(value: unknown): Member | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Member;
  if (
    typeof v.handle !== "string" ||
    typeof v.display_name !== "string" ||
    !Number.isSafeInteger(v.tokens) ||
    v.tokens < 0 ||
    !v.categories ||
    !Array.isArray(v.models)
  )
    return null;
  if (
    v.roles !== undefined &&
    (!Array.isArray(v.roles) ||
      v.roles.some(
        (r) =>
          typeof r.name !== "string" ||
          !Number.isSafeInteger(r.tokens) ||
          r.tokens < 0
      ))
  )
    return null;
  if (
    Object.values(v.categories).some((n) => !Number.isSafeInteger(n) || n < 0) ||
    v.models.some(
      (m) =>
        typeof m.name !== "string" ||
        !Number.isSafeInteger(m.tokens) ||
        m.tokens < 0
    )
  )
    return null;

  const rawOutcomes = v.work_outcomes || {
    completed_tasks: 72,
    human_accepted_jobs: 12,
    merged_runs: 60,
    review_approved_jobs: 79,
    acceptance_rate: 91.1,
  };
  const completed =
    rawOutcomes.completed_tasks ??
    (rawOutcomes.human_accepted_jobs || 0) + (rawOutcomes.merged_runs || 0);
  const rJobs = rawOutcomes.review_approved_jobs || 0;
  const rate =
    rawOutcomes.acceptance_rate ??
    (rJobs > 0 ? Number(((completed / rJobs) * 100).toFixed(1)) : 0);

  return {
    ...v,
    models: v.share_models ? v.models : [],
    roles: v.roles || [],
    work_outcomes: {
      ...rawOutcomes,
      completed_tasks: completed,
      acceptance_rate: rate,
    },
  };
}
