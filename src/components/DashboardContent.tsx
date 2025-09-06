'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import { Model } from '@/types';
import { AxiosError } from 'axios';

// --- CHAKRA UI IMPORTS ---
import {
  Box, VStack, HStack, Container, SimpleGrid, InputGroup, InputLeftElement, Input,
  Heading, Text, Badge, Button, Icon, Spinner, Alert, AlertIcon, AlertDescription, AlertTitle,
  Card, CardBody, Flex, Skeleton
} from '@chakra-ui/react';

// --- ICON IMPORTS ---
import {
  FaArrowUp, FaRocket, FaHistory, FaSearch,
  FaChartLine, FaTrophy, FaLayerGroup, FaBrain, FaUpload,
  FaBalanceScale, FaRedo
} from 'react-icons/fa';

// --- FRAMER MOTION IMPORTS ---
import { motion } from 'framer-motion';
const MotionCard = motion(Card);

// --- DYNAMIC COMPONENT IMPORTS ---
import dynamic from 'next/dynamic';
const ModelCard = dynamic(() => import('@/components/ModelCard'), {
  loading: () => <Skeleton height="400px" borderRadius="xl" />,
  ssr: false
});

// --- STATIC OBJECTS ---
const containerPadding = { base: 4, md: 8 };

// --- REUSABLE ERROR COMPONENT ---
const ErrorMessage = ({ title, description, onRetry }: { title: string; description: string; onRetry: () => void }) => (
  <Alert status="error" borderRadius="lg" p={6} boxShadow="xl" flexDir="column" textAlign="center" alignItems="center">
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle mt={4} mb={1} fontSize="lg">{title}</AlertTitle>
    <AlertDescription maxW="sm">{description}</AlertDescription>
    <Button mt={4} colorScheme="red" onClick={onRetry} leftIcon={<FaRedo />}>
      Try Again
    </Button>
  </Alert>
);

// --- TYPES ---
interface DashboardContentProps {
  initialModels: Model[];
  initialError: string | null;
  userId: string;
}

// --- MAIN COMPONENT ---
export default memo(function DashboardContent({ initialModels, initialError, userId }: DashboardContentProps) {
  const router = useRouter();
  const { user_id } = useAuth();
  const [models, setModels] = useState<Model[]>(Array.isArray(initialModels) ? initialModels : []);
  const [isLoading, setIsLoading] = useState(false); // Start with false since we have initial data
  const [error, setError] = useState<string | null>(initialError);
  const [activeTaskType, setActiveTaskType] = useState<'classification' | 'regression'>('regression');
  const [searchTerm, setSearchTerm] = useState('');

  // Use the passed userId or fallback to auth context
  const effectiveUserId = userId || user_id;

  const fetchModels = useCallback(async () => {
    if (!effectiveUserId) {
      setError("User ID not available.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/models/?user_id=${effectiveUserId}`);
      if (Array.isArray(res.data.items)) {
        setModels(res.data.items);
      } else if (Array.isArray(res.data)) {
        setModels(res.data);
      } else {
        console.error("API response for models is not in the expected format:", res.data);
        setModels([]);
      }
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (err instanceof AxiosError) {
        errorMessage = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error('Error refreshing models:', err);
      setError(errorMessage);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserId]);

  // Only fetch if we don't have initial data or if user_id changed
  useEffect(() => {
    if (Array.isArray(initialModels) && initialModels.length === 0 && !initialError) {
      fetchModels();
    }
  }, [fetchModels, initialModels, initialError]);

  // Memoized filtered models to prevent unnecessary recalculations
  const taskFilteredModels = useMemo(() => {
    const safeModels = Array.isArray(models) ? models : [];
    return safeModels
      .filter(m => m && typeof m === 'object' && m.task_type === activeTaskType)
      .filter(m => m && typeof m === 'object' && m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [models, activeTaskType, searchTerm]);

  // Memoized statistics calculation to prevent expensive computations on every render
  const { totalModels, avgScore, bestModel } = useMemo(() => {
    const total = taskFilteredModels.length;
    if (total === 0) return { totalModels: 0, avgScore: 0, bestModel: null };

    const sumScores = taskFilteredModels.reduce((sum, m) => {
      const score = activeTaskType === 'classification'
        ? (m.latest_metrics?.accuracy || 0)
        : (m.latest_metrics?.r2_score || 0);
      return sum + score;
    }, 0);
    const avg = sumScores / total;

    const best = taskFilteredModels.reduce((bestModelFound, current) => {
      if (!bestModelFound) return current;
      const currentScore = activeTaskType === 'classification'
        ? (current.latest_metrics?.accuracy || 0)
        : (current.latest_metrics?.r2_score || 0);
      const bestScore = activeTaskType === 'classification'
        ? (bestModelFound.latest_metrics?.accuracy || 0)
        : (bestModelFound.latest_metrics?.r2_score || 0);
      return currentScore > bestScore ? current : bestModelFound;
    }, taskFilteredModels[0]);

    return { totalModels: total, avgScore: avg, bestModel: best };
  }, [taskFilteredModels, activeTaskType]);

  const handleTaskTypeChange = (type: 'classification' | 'regression') => {
    setActiveTaskType(type);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (error && !isLoading) {
    return (
      <Box minH="100vh" bg="#f8f7ff" position="relative">
        <Container maxW="container.xl" p={containerPadding}>
          <VStack spacing={10} py={8}>
            <ErrorMessage title="Failed to Load Models" description={error} onRetry={fetchModels} />
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#f8f7ff" position="relative">
      <Container maxW="6xl" py={12}>
        <VStack spacing={10} py={8}>
          <VStack spacing={6} textAlign="center" w="full">
            <HStack spacing={3} justify="center">
              <Icon as={FaBrain} boxSize="50px" color="purple.500" />
              <Heading
                fontSize={{ base: "3xl", md: "7xl" }}
                fontWeight="bold"
                bgGradient="linear(to-r, purple.700, purple.400)"
                bgClip="text"
              >
                ML Model Dashboard
              </Heading>
            </HStack>
            <Text fontSize="lg" color="gray.500" maxW="2xl">
              Track, compare, and optimize your machine learning models
            </Text>

            <Box maxW="500px" w="full">
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  bg="white"
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="full"
                  fontSize="md"
                  _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px #9F7AEA" }}
                  _hover={{ borderColor: "gray.300" }}
                />
              </InputGroup>
            </Box>
          </VStack>

          {isLoading ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full" maxW="900px">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} height="120px" borderRadius="2xl" />
              ))}
            </SimpleGrid>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full" maxW="900px">
              <MotionCard bg="white" shadow="lg" borderRadius="2xl" border="1px solid" borderColor="gray.100" whileHover={{ y: -4, shadow: "xl" }} transition={{ duration: 0.2 }}>
                <CardBody p={6}>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FaLayerGroup} color="purple.500" boxSize={5} />
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">TOTAL MODELS</Text>
                    </HStack>
                    <Heading size="2xl" color="purple.600">{totalModels}</Heading>
                    <HStack>
                      <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                      <Text fontSize="sm" color="gray.500">{activeTaskType} models</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </MotionCard>
              <MotionCard bg="white" shadow="lg" borderRadius="2xl" border="1px solid" borderColor="gray.100" whileHover={{ y: -4, shadow: "xl" }} transition={{ duration: 0.2 }}>
                <CardBody p={6}>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FaChartLine} color="pink.500" boxSize={5} />
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">AVG {activeTaskType === 'regression' ? "R² SCORE" : "ACCURACY"}</Text>
                    </HStack>
                    <Heading size="2xl" color="pink.500">{(avgScore * 100).toFixed(1)}%</Heading>
                    <HStack>
                      <Icon as={FaArrowUp} color="green.500" boxSize={3} />
                      <Text fontSize="sm" color="gray.500">Across all models</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </MotionCard>
              <MotionCard bg="white" shadow="lg" borderRadius="2xl" border="1px solid" borderColor="gray.100" whileHover={{ y: -4, shadow: "xl" }} transition={{ duration: 0.2 }}>
                <CardBody p={6}>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Icon as={FaTrophy} color="yellow.500" boxSize={5} />
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">BEST MODEL</Text>
                    </HStack>
                    <Heading size={{ base: "md", md: "lg" }} color="gray.700" isTruncated maxW="100%" wordBreak="break-word" title={bestModel?.name || 'N/A'}>{bestModel?.name || 'N/A'}</Heading>
                    <Badge colorScheme="green" borderRadius="full" px={3} py={1}>{((bestModel?.latest_metrics?.[activeTaskType === 'regression' ? 'r2_score' : 'accuracy'] || 0) * 100).toFixed(1)}% {activeTaskType === 'regression' ? "R² SCORE" : "ACCURACY"}</Badge>
                  </VStack>
                </CardBody>
              </MotionCard>
            </SimpleGrid>
          )}

          <HStack bg="white" p={2} borderRadius="full" shadow="md" border="1px solid" borderColor="gray.200">
            <Button
              onClick={() => handleTaskTypeChange('classification')}
              variant={activeTaskType === 'classification' ? 'solid' : 'ghost'}
              colorScheme={activeTaskType === 'classification' ? 'gray' : undefined}
              bg={activeTaskType === 'classification' ? 'gray.100' : 'transparent'}
              color={activeTaskType === 'classification' ? 'gray.700' : 'gray.500'}
              size="md"
              borderRadius="full"
              leftIcon={<Icon as={FaLayerGroup} />}
              _hover={{ bg: activeTaskType === 'classification' ? 'gray.200' : 'gray.50' }}
            >
              Classification
            </Button>
            <Button
              onClick={() => handleTaskTypeChange('regression')}
              variant={activeTaskType === 'regression' ? 'solid' : 'ghost'}
              colorScheme={activeTaskType === 'regression' ? undefined : undefined}
              bgGradient={activeTaskType === 'regression' ? 'linear(to-r, purple.500, pink.500)' : undefined}
              bg={activeTaskType === 'regression' ? undefined : 'transparent'}
              color={activeTaskType === 'regression' ? 'white' : 'gray.500'}
              size="md"
              borderRadius="full"
              leftIcon={<Icon as={FaChartLine} />}
              _hover={{ bgGradient: activeTaskType === 'regression' ? 'linear(to-r, purple.600, pink.600)' : undefined, bg: activeTaskType === 'regression' ? undefined : 'gray.50' }}
            >
              Regression
            </Button>
          </HStack>

          {(Array.isArray(models) && models.length > 0) && (
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Button
                onClick={() => handleNavigate('/compare')}
                leftIcon={<Icon as={FaBalanceScale} />}
                variant="outline"
                borderColor="purple.200"
                color="purple.600"
                borderRadius="full"
                size="lg"
                _hover={{ bg: "purple.50", borderColor: "purple.300" }}
              >
                Compare Models
              </Button>
              <Button
                onClick={() => handleNavigate('/dashboard/evaluations')}
                leftIcon={<Icon as={FaHistory} />}
                variant="outline"
                borderColor="blue.200"
                color="blue.600"
                borderRadius="full"
                size="lg"
                _hover={{ bg: "blue.50", borderColor: "blue.300" }}
              >
                View History
              </Button>
              <Button
                onClick={() => handleNavigate('/upload')}
                leftIcon={<Icon as={FaUpload} />}
                variant="outline"
                borderColor="green.200"
                color="green.600"
                borderRadius="full"
                size="lg"
                _hover={{ bg: "green.50", borderColor: "green.300" }}
              >
                Upload Model
              </Button>
            </HStack>
          )}

          {isLoading ? (
            <VStack spacing={6} w="full">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} height="400px" borderRadius="xl" />
                ))}
              </SimpleGrid>
            </VStack>
          ) : (
            <>
              {taskFilteredModels.length === 0 ? (
                <VStack spacing={6} py={20} textAlign="center">
                  <Box p={6} borderRadius="full" bg="purple.100">
                    <Icon as={FaRocket} boxSize="40px" color="purple.500" />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size="lg" color="gray.600">No {activeTaskType} models found</Heading>
                    <Text color="gray.500" maxW="md">{searchTerm ? 'Try adjusting your search terms or' : ''} Upload a new model to get started.</Text>
                  </VStack>
                  <Button colorScheme="purple" size="lg" leftIcon={<Icon as={FaUpload} />} borderRadius="full" onClick={() => handleNavigate('/upload')}>Upload a Model</Button>
                </VStack>
              ) : (
                <SimpleGrid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={6} width="100%">
                  {taskFilteredModels.map((model) => (
                    <ModelCard key={model.id} model={model} refreshModels={fetchModels} userId={user_id || ''} />
                  ))}
                </SimpleGrid>
              )}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
});
