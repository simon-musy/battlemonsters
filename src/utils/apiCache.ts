// Centralized API cache utility for managing duplicate requests
class APICache {
  private cache = new Map<string, Promise<any>>();
  private results = new Map<string, any>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  // Default cache duration: 5 minutes
  private readonly DEFAULT_TTL = 5 * 60 * 1000;

  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Check if we have a cached result
    if (this.results.has(key)) {
      return this.results.get(key);
    }

    // Check if there's already a request in progress
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Create new request
    const promise = fetcher().then((result) => {
      // Cache the result
      this.results.set(key, result);
      
      // Set up TTL cleanup
      const timeout = setTimeout(() => {
        this.results.delete(key);
        this.timeouts.delete(key);
      }, ttl);
      
      this.timeouts.set(key, timeout);
      
      return result;
    }).catch((error) => {
      // Don't cache errors, just remove from pending requests
      this.cache.delete(key);
      throw error;
    }).finally(() => {
      // Remove from pending requests
      this.cache.delete(key);
    });

    // Cache the promise to prevent duplicate requests
    this.cache.set(key, promise);
    
    return promise;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
    this.results.delete(key);
    
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
    }
  }

  clear(): void {
    this.cache.clear();
    this.results.clear();
    
    // Clear all timeouts
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }

  // Get cache statistics for debugging
  getStats() {
    return {
      pendingRequests: this.cache.size,
      cachedResults: this.results.size,
      activeTimeouts: this.timeouts.size,
    };
  }
}

// Global instance for image generation requests
export const imageCache = new APICache();

// Utility function to generate cache keys for images
export function generateImageCacheKey(prompt: string, aspectRatio?: string, additionalParams?: Record<string, any>): string {
  const params = {
    prompt: prompt.trim(),
    aspectRatio: aspectRatio || 'auto',
    ...additionalParams,
  };
  
  // Create a stable hash of the parameters
  const paramString = JSON.stringify(params, Object.keys(params).sort());
  return `image:${btoa(paramString).replace(/[+/=]/g, '')}`;
}