'use client';

import { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      if (typeof window === 'undefined') return;

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
      
      // Measure render time
      const renderStart = performance.now();
      const renderTime = renderStart - (navigation?.loadEventEnd || 0);

      // Estimate bundle size (rough approximation)
      const scripts = document.querySelectorAll('script[src]');
      let bundleSize = 0;
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && src.includes('_next/static')) {
          // This is a rough estimate - in reality you'd need to fetch and measure
          bundleSize += 100; // KB estimate per script
        }
      });

      // Memory usage (if available)
      const memoryUsage = (performance as any).memory 
        ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
        : 0;

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        bundleSize,
        memoryUsage
      });
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Show/hide with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('load', measurePerformance);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!isVisible || !metrics) return null;

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      bg="blackAlpha.800"
      color="white"
      p={4}
      borderRadius="lg"
      fontSize="sm"
      zIndex={9999}
      backdropFilter="blur(10px)"
    >
      <VStack spacing={2} align="start">
        <Text fontWeight="bold" color="green.300">
          Performance Monitor
        </Text>
        <HStack spacing={4}>
          <Badge colorScheme="blue" variant="solid">
            Load: {metrics.loadTime}ms
          </Badge>
          <Badge colorScheme="green" variant="solid">
            Render: {metrics.renderTime}ms
          </Badge>
        </HStack>
        <HStack spacing={4}>
          <Badge colorScheme="purple" variant="solid">
            Bundle: ~{metrics.bundleSize}KB
          </Badge>
          <Badge colorScheme="orange" variant="solid">
            Memory: {metrics.memoryUsage}MB
          </Badge>
        </HStack>
        <Text fontSize="xs" color="gray.400">
          Press Ctrl+Shift+P to toggle
        </Text>
      </VStack>
    </Box>
  );
}
