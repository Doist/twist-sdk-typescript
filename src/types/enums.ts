// User types for workspace users
export const USER_TYPES = ['USER', 'GUEST', 'ADMIN'] as const

/**
 * The type of user in a workspace.
 *
 * @remarks
 * Possible values:
 * - `'USER'` - Regular user
 * - `'GUEST'` - Guest user
 * - `'ADMIN'` - Administrator
 */
export type UserType = (typeof USER_TYPES)[number]

// Workspace plans
export const WORKSPACE_PLANS = ['free', 'unlimited'] as const

/**
 * The plan type for a workspace.
 *
 * @remarks
 * Possible values:
 * - `'free'` - Free plan
 * - `'unlimited'` - Unlimited plan
 */
export type WorkspacePlan = (typeof WORKSPACE_PLANS)[number]
