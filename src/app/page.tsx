import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load the main content with better loading strategy
const MainContent = lazy(() => import('@/components/MainContent'));

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner message="Loading ModelWhiz..." minHeight="100vh" />}>
        <MainContent />
      </Suspense>
    </>
  );
}
