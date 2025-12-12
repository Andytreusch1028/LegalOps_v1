import { PrismaClient, User } from '@/generated/prisma';
import { BaseRepository } from './base.repository';
import { IUserRepository, AdminUserFilters, PaginatedResponse } from '../interfaces/user-repository.interface';
import { ICache } from '../interfaces/cache.interface';
import { ILogger } from '../interfaces/logger.interface';
import { Result, ok, err } from '../types/result';
import { AppError } from '../types/result';

/**
 * User repository implementation.
 * Extends BaseRepository with user-specific methods and authentication features.
 */
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  readonly name = 'UserRepository';

  constructor(
    prisma: PrismaClient,
    logger: ILogger,
    cache?: ICache
  ) {
    super(prisma, logger, cache);
    // Set longer cache TTL for user data (30 minutes)
    this.cacheTTL = 1800;
  }

  /**
   * Get the Prisma model delegate for User entities.
   */
  protected getModel() {
    return this.prisma.user;
  }

  /**
   * Find a user by email address.
   */
  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      // Check cache first
      if (this.cache) {
        const cacheKey = `${this.name}:email:${email}`;
        const cached = await this.cache.get<User>(cacheKey);
        if (cached) {
          this.logger.debug(`[${this.name}] Cache hit for email ${email}`);
          return ok(cached);
        }
      }

      const user = await this.performanceLogger.measureQuery(
        `${this.name}.findByEmail`,
        () => this.getModel().findUnique({
          where: { email }
        }),
        { email }
      );

      // Cache the result
      if (user && this.cache) {
        const cacheKey = `${this.name}:email:${email}`;
        await this.cache.set(cacheKey, user, this.cacheTTL);
        this.logger.debug(`[${this.name}] Cached user for email ${email}`);
      }

      return ok(user);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to find user by email`, {
        email,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to find user by email',
        'USER_FIND_BY_EMAIL_ERROR',
        500,
        { email, originalError: error }
      ));
    }
  }

  /**
   * Find a user by email verification token.
   */
  async findByVerificationToken(token: string): Promise<Result<User | null>> {
    try {
      const user = await this.performanceLogger.measureQuery(
        `${this.name}.findByVerificationToken`,
        () => this.getModel().findUnique({
          where: { emailVerificationToken: token }
        }),
        { hasToken: !!token }
      );

      return ok(user);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to find user by verification token`, {
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to find user by verification token',
        'USER_FIND_BY_VERIFICATION_TOKEN_ERROR',
        500,
        { originalError: error }
      ));
    }
  }

  /**
   * Find a user by password reset token.
   */
  async findByPasswordResetToken(token: string): Promise<Result<User | null>> {
    try {
      const user = await this.performanceLogger.measureQuery(
        `${this.name}.findByPasswordResetToken`,
        () => this.getModel().findUnique({
          where: { passwordResetToken: token }
        }),
        { hasToken: !!token }
      );

      return ok(user);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to find user by password reset token`, {
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to find user by password reset token',
        'USER_FIND_BY_RESET_TOKEN_ERROR',
        500,
        { originalError: error }
      ));
    }
  }

  /**
   * Update a user's password hash.
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<Result<void>> {
    try {
      await this.performanceLogger.measureQuery(
        `${this.name}.updatePassword`,
        () => this.getModel().update({
          where: { id: userId },
          data: { passwordHash: hashedPassword }
        }),
        { userId }
      );

      // Invalidate cache
      await this.invalidateUserCache(userId);

      this.logger.info(`[${this.name}] Updated password for user ${userId}`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to update password`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to update user password',
        'USER_UPDATE_PASSWORD_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Activate a user account (set emailVerified to true).
   */
  async activateUser(userId: string): Promise<Result<void>> {
    try {
      await this.performanceLogger.measureQuery(
        `${this.name}.activateUser`,
        () => this.getModel().update({
          where: { id: userId },
          data: { 
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null
          }
        }),
        { userId }
      );

      // Invalidate cache
      await this.invalidateUserCache(userId);

      this.logger.info(`[${this.name}] Activated user ${userId}`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to activate user`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to activate user account',
        'USER_ACTIVATION_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Deactivate a user account (set isActive to false).
   */
  async deactivateUser(userId: string): Promise<Result<void>> {
    try {
      await this.performanceLogger.measureQuery(
        `${this.name}.deactivateUser`,
        () => this.getModel().update({
          where: { id: userId },
          data: { isActive: false }
        }),
        { userId }
      );

      // Invalidate cache
      await this.invalidateUserCache(userId);

      this.logger.info(`[${this.name}] Deactivated user ${userId}`);
      return ok(undefined);

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to deactivate user`, {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to deactivate user account',
        'USER_DEACTIVATION_ERROR',
        500,
        { userId, originalError: error }
      ));
    }
  }

  /**
   * Get users for admin management with filtering and pagination.
   */
  async getUsersForAdmin(
    filters: AdminUserFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<Result<PaginatedResponse<User>>> {
    try {
      // Build where clause
      const where: any = {};

      if (filters.userType) {
        where.userType = filters.userType;
      }

      if (filters.role) {
        where.role = filters.role;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.emailVerified !== undefined) {
        where.emailVerified = filters.emailVerified;
      }

      if (filters.search) {
        where.OR = [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters.createdAfter) {
        where.createdAt = { ...where.createdAt, gte: filters.createdAfter };
      }

      if (filters.createdBefore) {
        where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
      }

      // Calculate pagination
      const skip = (page - 1) * pageSize;

      // Get total count and data in parallel
      const [total, users] = await Promise.all([
        this.performanceLogger.measureQuery(
          `${this.name}.getUsersForAdmin.count`,
          () => this.getModel().count({ where }),
          { filters, page, pageSize }
        ),
        this.performanceLogger.measureQuery(
          `${this.name}.getUsersForAdmin.findMany`,
          () => this.getModel().findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              userType: true,
              role: true,
              isActive: true,
              emailVerified: true,
              lastLoginAt: true,
              loginAttempts: true,
              lockedUntil: true,
              createdAt: true,
              updatedAt: true
            }
          }),
          { filters, page, pageSize }
        )
      ]);

      const hasMore = skip + users.length < total;

      return ok({
        data: users,
        total,
        page,
        pageSize,
        hasMore
      });

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to get users for admin`, {
        filters,
        page,
        pageSize,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to get users for admin',
        'USER_GET_ADMIN_ERROR',
        500,
        { filters, page, pageSize, originalError: error }
      ));
    }
  }

  /**
   * Get user statistics for admin dashboard.
   */
  async getUserStats(): Promise<Result<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    newUsersThisMonth: number;
    lockedUsers: number;
  }>> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        newUsersThisMonth,
        lockedUsers
      ] = await Promise.all([
        this.getModel().count(),
        this.getModel().count({ where: { isActive: true } }),
        this.getModel().count({ where: { emailVerified: true } }),
        this.getModel().count({ 
          where: { 
            createdAt: { gte: startOfMonth }
          }
        }),
        this.getModel().count({ 
          where: { 
            lockedUntil: { gt: now }
          }
        })
      ]);

      return ok({
        totalUsers,
        activeUsers,
        verifiedUsers,
        newUsersThisMonth,
        lockedUsers
      });

    } catch (error) {
      this.logger.error(`[${this.name}] Failed to get user statistics`, {
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to get user statistics',
        'USER_STATS_ERROR',
        500,
        { originalError: error }
      ));
    }
  }

  /**
   * Override the base update method to handle cache invalidation.
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    const result = await super.update(id, data);
    
    // Invalidate user-specific cache entries
    await this.invalidateUserCache(id);
    
    return result;
  }

  /**
   * Override the base create method to return a Result type.
   */
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<User>> {
    try {
      const user = await super.create(data);
      return ok(user);
    } catch (error) {
      this.logger.error(`[${this.name}] Failed to create user`, {
        email: data.email,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to create user',
        'USER_CREATE_ERROR',
        500,
        { email: data.email, originalError: error }
      ));
    }
  }

  /**
   * Override the base findById method to return a Result type.
   */
  async findById(id: string): Promise<Result<User | null>> {
    try {
      const user = await super.findById(id);
      return ok(user);
    } catch (error) {
      this.logger.error(`[${this.name}] Failed to find user by ID`, {
        id,
        error: error instanceof Error ? error.message : String(error)
      });

      return err(new AppError(
        'Failed to find user by ID',
        'USER_FIND_BY_ID_ERROR',
        500,
        { id, originalError: error }
      ));
    }
  }

  /**
   * Invalidate all cache entries for a specific user.
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    if (this.cache) {
      // Get user to find email for cache invalidation
      try {
        const user = await super.findById(userId);
        if (user) {
          await Promise.all([
            this.cache.delete(this.getCacheKey(userId)),
            this.cache.delete(`${this.name}:email:${user.email}`)
          ]);
          this.logger.debug(`[${this.name}] Invalidated cache for user ${userId}`);
        }
      } catch (error) {
        this.logger.warn(`[${this.name}] Failed to invalidate user cache`, {
          userId,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
}