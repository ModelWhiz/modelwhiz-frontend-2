// modelwhiz-frontend/src/components/PerformanceOptimizer.tsx
'use client';

import { useEffect } from 'react';
import { optimizeBundleLoading } from '@/lib/performance';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Initialize performance optimizations only on client side
    optimizeBundleLoading();
  }, []);

  return null; // This component doesn't render anything
}
