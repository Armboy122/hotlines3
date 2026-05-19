/**
 * Public barrel for the shared design-system module.
 */

// Design tokens (pure data, no React)
export {
  type PlanningStatus,
  type PlanningSource,
  type SemanticStatus,
  PLANNING_STATUS_LABELS,
  PLANNING_SOURCE_LABELS,
  STATUS_COLORS,
  SOURCE_COLORS,
  ROLE_COLORS,
  ROLE_LABELS,
  NO_PERMISSION_LABEL,
  CONFIRM_DELETE,
  CONFIRM_ROLE_CHANGE,
  CANCEL_ACTION,
  CONFIRM_ACTION,
  getStatusColor,
  getSourceColor,
  getRoleBadgeStyle,
} from './design-tokens'

// Badge utility functions (pure, no React)
export {
  getBadgeClass,
  getSourceBadgeClass,
  getRoleBadgeClass,
  NO_PERMISSION_BADGE_CLASS,
} from './badge-utils'

// Badge React components
export {
  SourceBadge,
  StatusBadge,
  RoleBadge,
  NoPermissionBadge,
} from './badges'

// Page layout components
export { PageHeader } from './page-header'
export { ResponsiveTableCard, type Column } from './responsive-table-card'

// State pattern components
export {
  LoadingState,
  EmptyState,
  ErrorState,
  NoPermissionState,
} from './state-patterns'
