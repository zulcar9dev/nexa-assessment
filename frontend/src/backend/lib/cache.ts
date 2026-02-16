/**
 * Simple in-memory cache with Time-To-Live (TTL) support
 * Used for caching templates, configs, and other static data
 */
export class SimpleCache<T> {
  private cache = new Map<string, { data: T; expiry: number }>();

  /**
   * Get item from cache
   * Returns null if item not found or expired
   */
  get(key: string): T | null {
    const item = this.cache.get(key);

    // If not found, return null
    if (!item) return null;

    // If expired, delete and return null
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set item in cache
   * @param key Cache key
   * @param data Data to store
   * @param ttlMs Time to live in milliseconds (default: 5 minutes)
   */
  set(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  /**
   * Remove item from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.cache.clear();
  }
}
