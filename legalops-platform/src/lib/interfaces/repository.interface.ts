/**
 * Base repository interface.
 * All repository classes should implement this interface.
 */
export interface IRepository {
  /**
   * The name of the repository for logging and identification purposes.
   */
  readonly name: string;
}

/**
 * Generic filter type for repository queries.
 * Can be extended with specific filter properties.
 */
export type Filter<T> = Partial<T> & {
  /** Optional limit for number of results */
  limit?: number;
  /** Optional offset for pagination */
  offset?: number;
  /** Optional cursor for cursor-based pagination */
  cursor?: string;
  /** Optional ordering */
  orderBy?: {
    field: keyof T;
    direction: 'asc' | 'desc';
  };
};

/**
 * Generic create data type for repository operations.
 * Excludes system-managed fields like id, createdAt, updatedAt.
 */
export type CreateData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Generic update data type for repository operations.
 * All fields are optional and excludes system-managed fields.
 */
export type UpdateData<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Base repository interface with CRUD operations.
 * 
 * @template T - The entity type this repository manages
 */
export interface IBaseRepository<T> extends IRepository {
  /**
   * Find an entity by its ID.
   * 
   * @param id - The entity ID
   * @returns The entity if found, null otherwise
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find multiple entities matching the filter.
   * 
   * @param filter - Filter criteria
   * @returns Array of matching entities
   */
  findMany(filter?: Filter<T>): Promise<T[]>;

  /**
   * Find a single entity matching the filter.
   * 
   * @param filter - Filter criteria
   * @returns The first matching entity or null
   */
  findOne(filter: Filter<T>): Promise<T | null>;

  /**
   * Create a new entity.
   * 
   * @param data - The entity data
   * @returns The created entity
   */
  create(data: CreateData<T>): Promise<T>;

  /**
   * Update an existing entity.
   * 
   * @param id - The entity ID
   * @param data - The update data
   * @returns The updated entity
   */
  update(id: string, data: UpdateData<T>): Promise<T>;

  /**
   * Delete an entity.
   * 
   * @param id - The entity ID
   * @returns void
   */
  delete(id: string): Promise<void>;

  /**
   * Count entities matching the filter.
   * 
   * @param filter - Filter criteria
   * @returns The count of matching entities
   */
  count(filter?: Filter<T>): Promise<number>;

  /**
   * Check if an entity exists.
   * 
   * @param id - The entity ID
   * @returns True if the entity exists
   */
  exists(id: string): Promise<boolean>;
}
