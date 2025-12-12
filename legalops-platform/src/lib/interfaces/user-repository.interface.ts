import { IBaseRepository } from './repository.interface';
import { Result } from '../types/result';
import { User } from '@/generated/prisma';

/**
 * Admin user filters for user management queries.
 */
export interface AdminUserFilters {
  userType?: string;
  role?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  search?: string; // Search in email, firstName, lastName
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Paginated response for admin user queries.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * User repository interface.
 * Handles database operations for User entities with authentication-specific methods.
 */
export interface IUserRepository extends IBaseRepository<User> {
  /**
   * Find a user by email address.
   * 
   * @param email - The email address to search for
   * @returns Result containing the user or null if not found
   */
  findByEmail(email: string): Promise<Result<User | null>>;

  /**
   * Find a user by email verification token.
   * 
   * @param token - The verification token to search for
   * @returns Result containing the user or null if not found
   */
  findByVerificationToken(token: string): Promise<Result<User | null>>;

  /**
   * Find a user by password reset token.
   * 
   * @param token - The password reset token to search for
   * @returns Result containing the user or null if not found
   */
  findByPasswordResetToken(token: string): Promise<Result<User | null>>;

  /**
   * Update a user's password hash.
   * 
   * @param userId - The user ID
   * @param hashedPassword - The new hashed password
   * @returns Result indicating success or error
   */
  updatePassword(userId: string, hashedPassword: string): Promise<Result<void>>;

  /**
   * Activate a user account (set emailVerified to true).
   * 
   * @param userId - The user ID to activate
   * @returns Result indicating success or error
   */
  activateUser(userId: string): Promise<Result<void>>;

  /**
   * Deactivate a user account (set isActive to false).
   * 
   * @param userId - The user ID to deactivate
   * @returns Result indicating success or error
   */
  deactivateUser(userId: string): Promise<Result<void>>;

  /**
   * Get users for admin management with filtering and pagination.
   * 
   * @param filters - Filters to apply to the query
   * @param page - Page number (1-based)
   * @param pageSize - Number of items per page
   * @returns Result containing paginated user data
   */
  getUsersForAdmin(
    filters: AdminUserFilters,
    page: number,
    pageSize: number
  ): Promise<Result<PaginatedResponse<User>>>;

  /**
   * Get user statistics for admin dashboard.
   * 
   * @returns Result containing user statistics
   */
  getUserStats(): Promise<Result<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    newUsersThisMonth: number;
    lockedUsers: number;
  }>>;
}