export type CategoryKind = "role" | "plan" | "status" | "type" | "category" | "env" | "method";

const CATEGORY_CLASS_MAP: Record<string, string> = {
  "role:host": "badge-cat-role-host",
  "role:provider": "badge-cat-role-provider",
  "role:admin": "badge-cat-role-admin",
  "role:employee": "badge-cat-role-employee",
  "role:moderator": "badge-cat-role-moderator",

  "plan:light": "badge-cat-plan-light",
  "plan:growth": "badge-cat-plan-growth",
  "plan:expanding": "badge-cat-plan-expanding",

  "status:active": "badge-cat-status-active",
  "status:available": "badge-cat-status-available",
  "status:booked": "badge-cat-status-booked",
  "status:verified": "badge-cat-status-verified",
  "status:password-set": "badge-cat-status-password-set",
  "status:pending": "badge-cat-status-pending",
  "status:accepted": "badge-cat-status-accepted",
  "status:declined": "badge-cat-status-declined",
  "status:approved": "badge-cat-status-approved",
  "status:rejected": "badge-cat-status-rejected",
  "status:connected": "badge-cat-status-connected",
  "status:configured": "badge-cat-status-configured",
  "status:error": "badge-cat-status-error",
  "status:paused": "badge-cat-status-paused",
  "status:inactive": "badge-cat-status-inactive",
  "status:current": "badge-cat-status-current",
  "status:selected": "badge-cat-status-selected",
  "status:select": "badge-cat-status-select",
  "status:email-verified": "badge-cat-status-email-verified",
  "status:email-not-verified": "badge-cat-status-email-not-verified",
  "status:confirmed": "badge-cat-status-confirmed",
  "status:checked-in": "badge-cat-status-checked-in",
  "status:canceled": "badge-cat-status-canceled",
  "status:suspended": "badge-cat-status-suspended",
  "status:blocked": "badge-cat-status-blocked",

  "type:cleaning": "badge-cat-type-cleaning",
  "type:maintenance": "badge-cat-type-maintenance",
  "type:company": "badge-cat-type-company",
  "type:freelancer": "badge-cat-type-freelancer",
  "type:event": "badge-cat-type-event",
  "env:staging": "badge-cat-env-staging",
  "env:production": "badge-cat-env-production",
  "method:get": "badge-cat-method-get",
  "method:post": "badge-cat-method-post",
  "method:put": "badge-cat-method-put",
  "method:patch": "badge-cat-method-patch",
  "method:delete": "badge-cat-method-delete",
};

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase().replace(/[_\s]+/g, "-");
}

export function getCategoryBadgeClass(value?: string | null, kind?: CategoryKind): string {
  if (!value) return "badge-cat-base badge-cat-default";
  const normalized = normalizeCategory(value);

  if (kind) {
    const direct = CATEGORY_CLASS_MAP[`${kind}:${normalized}`];
    if (direct) return `badge-cat-base ${direct}`;
    return `badge-cat-base badge-cat-${kind}-default`;
  }

  const inferredKinds: CategoryKind[] = ["status", "role", "plan", "type", "env", "method", "category"];
  for (const inferred of inferredKinds) {
    const match = CATEGORY_CLASS_MAP[`${inferred}:${normalized}`];
    if (match) return `badge-cat-base ${match}`;
  }
  return "badge-cat-base badge-cat-default";
}
