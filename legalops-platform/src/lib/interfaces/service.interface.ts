/**
 * Base service interface.
 * All service classes should implement this interface.
 */
export interface IService {
  /**
   * The name of the service for logging and identification purposes.
   */
  readonly name: string;
}
