/**
 * Admin Components
 * Phase 7: Smart + Safe Experience Overhaul
 * 
 * Export all administrative UI components
 */

export { AdminUserDashboard } from './AdminUserDashboard';
export type { 
  AdminUserDashboardProps, 
  User, 
  UserFlag, 
  UserFilters, 
  UserSearchResult 
} from './AdminUserDashboard';

export { UserDetailsModal } from './UserDetailsModal';
export type { 
  UserDetailsModalProps, 
  UserDetails, 
  Address, 
  Order, 
  SecurityEvent, 
  LoginEvent 
} from './UserDetailsModal';