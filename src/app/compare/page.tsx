// FILE: src/app/compare/page.tsx

import { Suspense, lazy } from 'react';
import { Box, Container } from '@chakra-ui/react';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load components for better performance
const Navbar = lazy(() => import('@/components/Navbar'));
const CompareClient = lazy(() => import('@/components/CompareClient'));

export default function ComparePage() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner message="Loading navigation..." />}>
        <Navbar />
      </Suspense>
      <Box minH="100vh" bgGradient={'linear(to-r, #f8f7ff, #E6D8FD, #f8f7ff)'}>
        <Container maxW="7xl" py={12}>
          <Suspense fallback={<LoadingSpinner message="Loading comparison..." />}>
            <CompareClient initialModels={[]} />
          </Suspense>
        </Container>
      </Box>
    </>
  );
}