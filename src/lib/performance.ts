// modelwhiz-frontend/src/lib/performance.ts
// Performance optimization utilities

// Preload critical components
export const preloadComponents = () => {
  try {
    // Skip preloading in development to avoid dependency issues
    if (typeof window === 'undefined') {
      return {};
    }
    
    // Preload Recharts bundle (only in production)
    // const rechartsPromise = import('recharts');
    
    // Preload heavy components
    const modelCardPromise = import('@/components/ModelCard');
    const currentMetricsChartPromise = import('@/components/CurrentMetricsChart');
    
    // Return promises for potential use
    return {
      // recharts: rechartsPromise,
      modelCard: modelCardPromise,
      currentMetricsChart: currentMetricsChartPromise
    };
  } catch (error) {
    console.warn('Performance preloading failed:', error);
    return {};
  }
};

// Optimize bundle loading
export const optimizeBundleLoading = () => {
  try {
    // Skip preloading in development to improve performance
    if (typeof window === 'undefined') {
      return;
    }
    
    // Preload on idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadComponents();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        preloadComponents();
      }, 5000); // Increased timeout to avoid conflicts
    }
  } catch (error) {
    console.warn('Bundle optimization failed:', error);
  }
};

// Cache management
export const clearComponentCache = () => {
  try {
    // Clear dynamic import cache if needed
    if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__) {
      // Clear any cached dynamic imports
      Object.keys(window).forEach(key => {
        if (key.startsWith('__NEXT_DYNAMIC_IMPORT_')) {
          delete (window as any)[key];
        }
      });
    }
  } catch (error) {
    console.warn('Cache clearing failed:', error);
  }
};

// Debounce function to limit function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function to limit function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization helper for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      
      // Log slow operations
      if (duration > 100) {
        console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  getMetrics(label: string): { avg: number; min: number; max: number; count: number } {
    const values = this.metrics.get(label) || [];
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg, min, max, count: values.length };
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Image lazy loading helper
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  const observer = createIntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        target.src = src;
        target.classList.remove('lazy');
        observer.unobserve(target);
      }
    });
  });

  observer.observe(img);
}

// Component render optimization
export function shouldComponentUpdate<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  keys: (keyof T)[]
): boolean {
  return keys.some(key => prevProps[key] !== nextProps[key]);
}

// Memory management
export function cleanupResources(): void {
  // Clear any cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Clear performance metrics
  PerformanceMonitor.getInstance().clearMetrics();
  
  // Force garbage collection if available
  if ('gc' in window) {
    (window as any).gc();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
