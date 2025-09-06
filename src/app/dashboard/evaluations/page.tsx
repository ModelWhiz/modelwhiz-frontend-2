// src/app/dashboard/evaluations/page.tsx

'use client';

import { useEffect, useState, Suspense, memo, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';

// Lazy load Navbar for better performance
const Navbar = lazy(() => import('@/components/Navbar'));

// --- CHAKRA UI IMPORTS - OPTIMIZED ---
import { 
  Box, VStack, HStack, Container, SimpleGrid, Stack
} from '@chakra-ui/react';

import { 
  Heading, Text, Badge, Button, Icon, Spinner, Alert, AlertIcon, AlertDescription, AlertTitle
} from '@chakra-ui/react';

import { 
  Table, Thead, Tbody, Tr, Th, Td, Progress
} from '@chakra-ui/react';

import { 
  Card, CardBody, Stat, StatLabel, StatNumber, StatHelpText, StatArrow
} from '@chakra-ui/react';

import { 
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, Skeleton
} from '@chakra-ui/react';
// --- END CHAKRA UI IMPORTS - OPTIMIZED ---


import { 
  FaEye, FaHistory, FaHome, FaDatabase, FaClock, FaCheckCircle, 
  FaExclamationTriangle, FaSpinner, FaTimes, FaChartLine, FaTrophy,
  FaBrain, FaRocket
} from 'react-icons/fa';

import { motion, AnimatePresence } from 'framer-motion'
const MotionBox = motion(Box)
const MotionCard = motion(Card)
const MotionTr = motion(Tr);

interface Job {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  model_name: string;
  created_at: string;
}

const StatusBadge = memo(function StatusBadge({ status }: { status: Job['status'] }) {
  const colorScheme = {
    COMPLETED: 'green',
    PROCESSING: 'blue', 
    PENDING: 'yellow',
    FAILED: 'red',
  }[status];

  const icon = {
    COMPLETED: FaCheckCircle,
    PROCESSING: FaSpinner,
    PENDING: FaClock,
    FAILED: FaTimes,
  }[status];

  const bgColor = {
    COMPLETED: 'green.50',
    PROCESSING: 'blue.50',
    PENDING: 'yellow.50', 
    FAILED: 'red.50',
  }[status];

  const borderColor = {
    COMPLETED: 'green.200',
    PROCESSING: 'blue.200',
    PENDING: 'yellow.200',
    FAILED: 'red.200',
  }[status];

  return (
    <Badge 
      bg={bgColor}
      color={`${colorScheme}.700`}
      border="1px solid"
      borderColor={borderColor}
      display="flex" 
      alignItems="center" 
      gap={2} 
      px={3} 
      py={1.5}
      borderRadius="full"
      fontWeight="semibold"
    >
      <Icon as={icon} boxSize={3} />
      {status}
    </Badge>
  );
});

// Loading skeleton components
function StatsCardSkeleton() {
  return (
    <Card bg="white" shadow="lg" borderRadius="2xl" border="1px solid #E2E8F0">
      <CardBody p={6} textAlign="center">
        <VStack spacing={3}>
          <Skeleton height="4" width="100px" />
          <Skeleton height="8" width="60px" />
          <Skeleton height="4" width="80px" />
        </VStack>
      </CardBody>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card bg="white" shadow="lg" borderRadius="2xl" border="1px solid #E2E8F0">
      <CardBody p={6}>
        <VStack spacing={4}>
          <HStack justify="space-between" w="full">
            <Skeleton height="6" width="200px" />
            <Skeleton height="6" width="100px" />
          </HStack>
          <Stack spacing={3} w="full">
            {[...Array(5)].map((_, i) => (
              <HStack key={i} spacing={4}>
                <Skeleton height="12" width="200px" />
                <Skeleton height="6" width="100px" />
                <Skeleton height="6" width="120px" />
                <Skeleton height="8" width="120px" />
              </HStack>
            ))}
          </Stack>
        </VStack>
      </CardBody>
    </Card>
  );
}

// Error display component for consistency
const ErrorMessage = ({ title, description }: { title: string; description: string }) => (
  <Alert status="error" borderRadius="lg" p={6} boxShadow="xl" flexDir="column" textAlign="center" alignItems="center">
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle mt={4} mb={1} fontSize="lg">{title}</AlertTitle>
    <AlertDescription maxW="sm">{description}</AlertDescription>
    <Button mt={4} colorScheme="red" onClick={() => window.location.reload()}>
      Reload Page
    </Button>
  </Alert>
);

export default function EvaluationsHistoryPage() {
  const router = useRouter();
  const auth = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for error handling

  useEffect(() => {
    const fetchJobs = async () => {
      if (!auth?.user_id) {
        setError("User ID is not available. Please log in.");
        setIsLoading(false); // Stop loading if no user ID
        return;
      }
      setIsLoading(true);
      setError(null); // Clear previous errors on new fetch attempt
      try {
        const response = await apiClient.get(`/evaluations/?user_id=${auth.user_id}`);
        setJobs(response.data);
      } catch (err: any) {
        console.error("Failed to fetch evaluation jobs", err);
        setError(err.message || 'Failed to load evaluation history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, [auth?.user_id]);

  // Calculate stats
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(job => job.status === 'COMPLETED').length;
  const processingJobs = jobs.filter(job => job.status === 'PROCESSING').length;
  const pendingJobs = jobs.filter(job => job.status === 'PENDING').length;
  const failedJobs = jobs.filter(job => job.status === 'FAILED').length;
  const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

  const recentJobs = jobs.filter(job => {
    const jobDate = new Date(job.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return jobDate > weekAgo;
  }).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <VStack spacing={6} w="full">
          <TableSkeleton />
        </VStack>
      );
    }

    if (error) { // Display a dedicated error message if there was an API error
      return (
        <ErrorMessage 
          title="Error Loading Evaluations" 
          description={error} 
        />
      );
    }

    if (jobs.length === 0) {
      return (
        <Card bg="white" shadow="lg" borderRadius="2xl" border="1px solid #E2E8F0">
          <CardBody p={12} textAlign="center">
            <VStack spacing={6}>
              <Box p={6} borderRadius="full" bg="purple.100">
                <Icon as={FaHistory} boxSize="40px" color="purple.500" />
              </Box>
              <VStack spacing={3}>
                <Heading size="lg" color="gray.700">
                  No Evaluations Found
                </Heading>
                <Text color="gray.500" maxW="400px" lineHeight="1.6">
                  Run your first evaluation from the upload page to see its history here. 
                  Track your model performance and compare results over time.
                </Text>
              </VStack>
              <Button 
                bgGradient="linear(to-r, purple.500, purple.600)"
                color="white"
                size="lg" 
                onClick={() => router.push('/upload')}
                leftIcon={<FaRocket />}
                borderRadius="full"
                _hover={{
                  bgGradient: "linear(to-r, purple.600, purple.700)",
                  transform: "translateY(-1px)"
                }}
                shadow="md"
              >
                Upload a Model
              </Button>
            </VStack>
          </CardBody>
        </Card>
      );
    }

    return (
      <Card bg="white" shadow="lg" borderRadius="2xl" border="1px solid #E2E8F0">
        <CardBody p={6}>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="gray.700">
                  Evaluation History
                </Heading>
                <Text color="gray.500" fontSize="sm">
                  {totalJobs} total evaluations • {recentJobs} this week
                </Text>
              </VStack>
              <Badge 
                bg="purple.50" 
                color="purple.700"
                border="1px solid"
                borderColor="purple.200"
                fontSize="sm" 
                px={4} 
                py={2}
                borderRadius="full"
                fontWeight="semibold"
              >
                {successRate.toFixed(1)}% Success Rate
              </Badge>
            </HStack>

            <Box borderWidth="1px" borderColor="gray.100" borderRadius="xl" overflow="hidden">
              <Table variant="simple" size="md">
                <Thead bg="gray.50">
                  <Tr>
                    <Th color="gray.600" fontWeight="semibold" py={4}>Model Name</Th>
                    <Th color="gray.600" fontWeight="semibold" py={4}>Status</Th>
                    <Th color="gray.600" fontWeight="semibold" py={4}>Date Created</Th>
                    <Th color="gray.600" fontWeight="semibold" py={4}>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Suspense fallback={
                    [...Array(5)].map((_, i) => (
                      <Tr key={i}>
                        <Td><Skeleton height="20px" width="150px" /></Td>
                        <Td><Skeleton height="20px" width="100px" /></Td>
                        <Td><Skeleton height="20px" width="100px" /></Td>
                        <Td><Skeleton height="20px" width="120px" /></Td>
                      </Tr>
                    ))
                  }>
                    {jobs.map((job, index) => (
                      <MotionTr 
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        _hover={{ bg: 'gray.50' }}
                      >
                        <Td py={4}>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" color="gray.700">
                              {job.model_name}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              Job #{job.id}
                            </Text>
                          </VStack>
                        </Td>
                        <Td py={4}>
                          <StatusBadge status={job.status} />
                        </Td>
                        <Td py={4}>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium" color="gray.700">
                              {formatDate(job.created_at)}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {new Date(job.created_at).toLocaleTimeString()}
                            </Text>
                          </VStack>
                        </Td>
                        <Td py={4}>
                          <Button
                            size="sm"
                            variant="outline"
                            borderColor="purple.200"
                            color="purple.600"
                            leftIcon={<FaEye />}
                            onClick={() => router.push(`/evaluations/${job.id}`)}
                            _hover={{ 
                              bg: 'purple.50', 
                              borderColor: 'purple.300',
                              transform: 'translateY(-1px)' 
                            }}
                            transition="all 0.2s"
                            borderRadius="full"
                            fontWeight="semibold"
                          >
                            View Results
                          </Button>
                        </Td>
                      </MotionTr>
                    ))}
                  </Suspense>
                </Tbody>
              </Table>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  return (
    <>
      <Suspense fallback={<div>Loading navigation...</div>}>
        <Navbar />
      </Suspense>
      <Box minH="100vh" bg="#f8f7ff" position="relative">
        <Container maxW="container.xl" py={10}>
          <VStack spacing={8} align="stretch">
            {/* Header Section */}
            <VStack spacing={6} textAlign="center">
              <HStack spacing={3} justify="center">
                <Icon as={FaHistory} boxSize="40px" color="purple.500" />
                <Heading 
                  fontSize={{ base: "4xl", md: "7xl" }}
                  fontWeight="bold"
                  bgGradient="linear(to-r, purple.600, purple.400)"
                  bgClip="text"
                >
                  Evaluation History
                </Heading>
              </HStack>
              <Text fontSize="lg" color="gray.500" maxW="2xl">
                Track and analyze your model evaluation results over time
              </Text>

              {/* Breadcrumb */}
              <Breadcrumb fontSize="sm" color="gray.500">
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => router.push('/dashboard')} 
                    color="gray.500" 
                    _hover={{ color: 'purple.500' }}
                    cursor="pointer"
                  >
                    <HStack spacing={2}>
                      <Icon as={FaHome} />
                      <Text>Dashboard</Text>
                    </HStack>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <Text color="purple.500" fontWeight="semibold">
                    Evaluations
                  </Text>
                </BreadcrumbItem>
              </Breadcrumb>
            </VStack>

            {/* Stats Cards */}
            {!isLoading && jobs.length > 0 && ( // Only show stats if not loading and jobs exist
              <SimpleGrid columns={{ base: 3, md: 5, lg: 4 }} spacing={6} maxW="1000px" mx="auto">
                <Suspense fallback={<StatsCardSkeleton />}>
                  <MotionCard
                    whileHover={{ y: -4, scale: 1.02 }}
                    bg="white"
                    shadow="lg"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="gray.100"
                    transition={{ duration: 0.2 }}
                  >
                    <CardBody p={6} textAlign="center">
                      <Stat>
                        <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                          Total Evaluations
                        </StatLabel>
                        <StatNumber color="blue.600" fontSize="3xl" fontWeight="bold">
                          {totalJobs}
                        </StatNumber>
                        <StatHelpText color="green.500" fontWeight="medium">
                          <StatArrow type="increase" />
                          {recentJobs} this week
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </MotionCard>
                </Suspense>

                <Suspense fallback={<StatsCardSkeleton />}>
                  <MotionCard
                    whileHover={{ y: -4, scale: 1.02 }}
                    bg="white"
                    shadow="lg"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="gray.100"
                    transition={{ duration: 0.2 }}
                  >
                    <CardBody p={6} textAlign="center">
                      <Stat>
                        <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                          Completed
                        </StatLabel>
                        <StatNumber color="green.600" fontSize="3xl" fontWeight="bold">
                          {completedJobs}
                        </StatNumber>
                        <StatHelpText color="gray.500" fontWeight="medium">
                          <Icon as={FaCheckCircle} color="green.500" />
                          Successful runs
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </MotionCard>
                </Suspense>

                <Suspense fallback={<StatsCardSkeleton />}>
                  <MotionCard
                    whileHover={{ y: -4, scale: 1.02 }}
                    bg="white"
                    shadow="lg"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="gray.100"
                    transition={{ duration: 0.2 }}
                  >
                    <CardBody p={6} textAlign="center">
                      <Stat>
                        <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                          In Progress
                        </StatLabel>
                        <StatNumber color="blue.600" fontSize="3xl" fontWeight="bold">
                          {processingJobs + pendingJobs}
                        </StatNumber>
                        <StatHelpText color="gray.500" fontWeight="medium">
                          <Icon as={FaSpinner} color="blue.500" />
                          Active jobs
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </MotionCard>
                </Suspense>

                <Suspense fallback={<StatsCardSkeleton />}>
                  <MotionCard
                    whileHover={{ y: -4, scale: 1.02 }}
                    bg="white"
                    shadow="lg"
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="gray.100"
                    transition={{ duration: 0.2 }}
                  >
                    <CardBody p={6} textAlign="center">
                      <Stat>
                        <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                          Success Rate
                        </StatLabel>
                        <StatNumber color="purple.600" fontSize="3xl" fontWeight="bold">
                          {successRate.toFixed(1)}%
                        </StatNumber>
                        <StatHelpText color="gray.500" fontWeight="medium">
                          <Icon as={FaTrophy} color="yellow.500" />
                          Completion rate
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </MotionCard>
                </Suspense>
              </SimpleGrid>
            )}

            {/* Progress Bar */}
            {!isLoading && totalJobs > 0 && (
              <Card bg="white" shadow="md" borderRadius="xl" border="1px solid" borderColor="gray.100" maxW="600px" mx="auto">
                <CardBody p={6}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text color="gray.600" fontSize="sm" fontWeight="medium">
                        Overall Progress
                      </Text>
                      <Text color="gray.600" fontSize="sm" fontWeight="semibold">
                        {completedJobs}/{totalJobs} completed
                      </Text>
                    </HStack>
                    <Progress 
                      value={successRate} 
                      colorScheme="purple"
                      size="lg" 
                      borderRadius="full"
                      bg="gray.100"
                    />
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Main content, including the table or "No Evaluations Found" message */}
            {renderContent()}

          </VStack>
        </Container>
      </Box>
    </>
  );
}