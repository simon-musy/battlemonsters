// Performance monitoring utility for tracking API calls and duplicates
class PerformanceMonitor {
  private apiCalls = new Map<string, number>();
  private duplicateCalls = new Map<string, number>();
  private callTimestamps = new Map<string, number[]>();

  logAPICall(endpoint: string, cacheKey?: string): void {
    const key = cacheKey || endpoint;
    
    // Track total calls
    this.apiCalls.set(key, (this.apiCalls.get(key) || 0) + 1);
    
    // Track timestamps
    const timestamps = this.callTimestamps.get(key) || [];
    timestamps.push(Date.now());
    this.callTimestamps.set(key, timestamps);
    
    // Detect potential duplicates (calls within 1 second)
    const recentCalls = timestamps.filter(ts => Date.now() - ts < 1000);
    if (recentCalls.length > 1) {
      this.duplicateCalls.set(key, (this.duplicateCalls.get(key) || 0) + 1);
      console.warn(`Potential duplicate API call detected for: ${key}`, {
        totalCalls: this.apiCalls.get(key),
        duplicates: this.duplicateCalls.get(key),
        recentCallsCount: recentCalls.length,
      });
    }
  }

  logCacheHit(cacheKey: string): void {
    console.log(`Cache hit for: ${cacheKey}`);
  }

  getStats() {
    const totalCalls = Array.from(this.apiCalls.values()).reduce((sum, count) => sum + count, 0);
    const totalDuplicates = Array.from(this.duplicateCalls.values()).reduce((sum, count) => sum + count, 0);
    
    return {
      totalAPICalls: totalCalls,
      totalDuplicates: totalDuplicates,
      duplicateRate: totalCalls > 0 ? (totalDuplicates / totalCalls * 100).toFixed(2) + '%' : '0%',
      callsByEndpoint: Object.fromEntries(this.apiCalls),
      duplicatesByEndpoint: Object.fromEntries(this.duplicateCalls),
    };
  }

  reset(): void {
    this.apiCalls.clear();
    this.duplicateCalls.clear();
    this.callTimestamps.clear();
  }

  // Log performance stats to console (useful for debugging)
  logStats(): void {
    const stats = this.getStats();
    console.group('🔍 API Performance Stats');
    console.log('Total API Calls:', stats.totalAPICalls);
    console.log('Total Duplicates:', stats.totalDuplicates);
    console.log('Duplicate Rate:', stats.duplicateRate);
    console.log('Calls by Endpoint:', stats.callsByEndpoint);
    console.log('Duplicates by Endpoint:', stats.duplicatesByEndpoint);
    console.groupEnd();
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Utility to add performance monitoring to development builds
if (import.meta.env.DEV) {
  // Log stats every 30 seconds in development
  setInterval(() => {
    const stats = performanceMonitor.getStats();
    if (stats.totalAPICalls > 0) {
      performanceMonitor.logStats();
    }
  }, 30000);

  // Add to window for manual inspection
  (window as any).apiPerformance = performanceMonitor;
}