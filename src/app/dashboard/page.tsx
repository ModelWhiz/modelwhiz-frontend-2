// FILE: src/app/dashboard/page.tsx

import { Suspense, lazy } from 'react';
import { Box, Container } from '@chakra-ui/react';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load components for better performance
const Navbar = lazy(() => import('@/components/Navbar'));
const DashboardContent = lazy(() => import('@/components/DashboardContent'));

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={<LoadingSpinner message="Loading navigation..." />}>
        <Navbar />
      </Suspense>
      <Box
        minH="100vh"
        bg="#f8f7ff"
        position="relative"
      >
        <Container maxW="container.xl" p={{ base: 4, md: 8 }}>
          <Suspense fallback={<LoadingSpinner message="Loading dashboard..." />}>
            <DashboardContent
              initialModels={[]}
              initialError={null}
              userId="temp-user-id"
            />
          </Suspense>
        </Container>
      </Box>
    </>
  );
}
