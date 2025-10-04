// User types for workspace users
export const USER_TYPES = ['USER', 'GUEST', 'ADMIN'] as const
export type UserType = (typeof USER_TYPES)[number]

// Workspace plans
export const WORKSPACE_PLANS = ['free', 'unlimited'] as const
export type WorkspacePlan = (typeof WORKSPACE_PLANS)[number]
