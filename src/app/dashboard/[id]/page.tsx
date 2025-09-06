// src/app/dashboard/[id]/page.tsx
'use client';

import { Suspense, useEffect, useState, useRef, useCallback, lazy } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import axios from 'axios'; // Import axios to use isAxiosError

// --- CHAKRA UI IMPORTS - OPTIMIZED ---
import { 
  Box, VStack, HStack, Flex, Container, SimpleGrid, Grid, GridItem
} from '@chakra-ui/react';

import { 
  Heading, Text, Badge, Avatar, Button, IconButton, Icon, Alert, AlertIcon, AlertTitle, AlertDescription
} from '@chakra-ui/react';

import { 
  Stat, StatLabel, StatNumber, StatHelpText, Divider, Progress
} from '@chakra-ui/react';

import { 
  Card, CardBody, CardHeader, List, ListItem, ListIcon
} from '@chakra-ui/react';

import { 
  Breadcrumb, BreadcrumbItem, BreadcrumbLink
} from '@chakra-ui/react';

import { 
  Spinner, Skeleton, useColorModeValue, useToast
} from '@chakra-ui/react';
// --- END CHAKRA UI IMPORTS - OPTIMIZED ---


import { DownloadIcon, CalendarIcon, CheckCircleIcon, ArrowBackIcon, InfoIcon } from '@chakra-ui/icons';
import { 
  FaRobot, FaChartLine, FaTrophy, FaStar, FaFire, FaHistory,
  FaBrain, FaDownload, FaFileAlt, FaCalendarAlt, FaArrowLeft,
  FaLightbulb, FaChevronRight, FaHome, FaDatabase, FaClock,
  FaCheckCircle, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import environment from '@/config/environment';

// Lazy load heavy components
const CurrentMetricsInline = dynamic(() => import('@/components/CurrentMetricsInline'), {
  loading: () => <Skeleton height="250px" borderRadius="lg" />,
  ssr: false
});

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionGrid = motion(SimpleGrid);
const MotionButton = motion(Button);

// --- LAZY LOAD MODAL COMPONENTS (as they are heavy and conditional) ---
const LazyModal = dynamic(() => import('@chakra-ui/react').then(mod => ({ default: mod.Modal })), { ssr: false });
const LazyModalOverlay = dynamic(() => import('@chakra-ui/react').then(mod => ({ default: mod.ModalOverlay })), { ssr: false });
const LazyModalContent = dynamic(() => import('@chakra-ui/react').then(mod => ({ default: mod.ModalContent })), { ssr: false });
const LazyModalHeader = dynamic(() => import('@chakra-ui/react').then(mod => ({ default: mod.ModalHeader })), { ssr: false });
const LazyModalCloseButton = dynamic(() => import('@chakra-ui/react').then(mod => ({ default: mod.ModalCloseButton })), { ssr: false });
const LazyModalBody = dynamic(() => import('@chakra-ui/react').then(mod => ({ default: mod.ModalBody })), { ssr: false });
const LazyModalFooter = dynamic(() => import('@chakra-ui/react').then(mod => ({ default: mod.ModalFooter })), { ssr: false });
// --- END LAZY LOAD ---


type Model = {
  id: number;
  name: string;
  version: string;
  filename: string;
  upload_time: string;
  metrics: any[];
  latest_metrics: { [key: string]: number } | null;
};

// Error display component for consistency
const ErrorMessage = ({ title, description, onRetry }: { title: string; description: string; onRetry?: () => void }) => (
  <Alert status="error" borderRadius="lg" p={6} boxShadow="xl" flexDir="column" textAlign="center" alignItems="center">
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle mt={4} mb={1} fontSize="lg">{title}</AlertTitle>
    <AlertDescription maxW="sm">{description}</AlertDescription>
    {onRetry && (
      <Button mt={4} colorScheme="red" onClick={onRetry}>
        Try Again
      </Button>
    )}
  </Alert>
);


export default function ModelDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isInsightOpen, setIsInsightOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const isMounted = useRef(true);

  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50, blue.50)',
    'linear(to-br, purple.900, pink.900, blue.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('purple.50', 'purple.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const getPerformanceScore = (model: Model | null) => {
    if (!model?.latest_metrics) return '0.0';
    if (model.latest_metrics.hasOwnProperty('rmse')) {
      return ((model.latest_metrics.r2_score || 0) * 100).toFixed(1);
    } else {
      const { accuracy = 0, f1_score = 0, auc = 0 } = model.latest_metrics;
      return ((((accuracy + f1_score + auc) / 3)) * 100).toFixed(1);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'yellow';
    if (score >= 70) return 'orange';
    return 'red';
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return FaTrophy;
    if (score >= 80) return FaStar;
    if (score >= 70) return FaFire;
    return FaChartLine;
  };

  const fetchModel = useCallback(async () => {
    if (!id) {
      if (isMounted.current) {
        setLoading(false);
        setError("Model ID is missing.");
      }
      return;
    }
    
    if (isMounted.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const response = await apiClient.get('/models/');
      const found = response.data.find((m: Model) => m.id === Number(id));
      if (isMounted.current) {
        setModel(found);
      }
      if (!found && isMounted.current) {
        setError("Model not found.");
      }
    } catch (err: unknown) { // Explicitly type err as unknown
      let errorMessage = 'Failed to load model details. Please try again.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) { // Fallback for generic Error objects
        errorMessage = err.message;
      }
      
      console.error('Error fetching model:', err);
      if (isMounted.current) {
        setError(errorMessage);
        toast({
          title: 'Failed to load model',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, toast]);

  useEffect(() => {
    isMounted.current = true;
    fetchModel();

    return () => {
      isMounted.current = false;
    };
  }, [fetchModel]);


  const handleInsights = async () => {
    if (!model) return;

    setInsightsLoading(true);
    try {
      const res = await apiClient.get(`/models/${model.id}/insights`);
      if (isMounted.current) {
        setInsights(res.data.insights);
        setIsInsightOpen(true);
      }
    } catch (err: unknown) { // Explicitly type err as unknown
      let errorMessage = 'Failed to load insights. Please try again later.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) { // Fallback for generic Error objects
        errorMessage = err.message;
      }

      console.error("Failed to load insights:", err);
      if (isMounted.current) {
        toast({
          title: 'Failed to load insights',
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      if (isMounted.current) {
        setInsightsLoading(false);
      }
    }
  };

  const handleRetryFetchModel = useCallback(() => {
    setModel(null);
    setError(null);
    fetchModel();
  }, [fetchModel]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 }}};
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 10 }}};
  const cardVariants = { hidden: { y: 20, opacity: 0, scale: 0.95 }, visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 }}, hover: { y: -5, boxShadow: "0px 10px 30px rgba(139, 92, 246, 0.3)", transition: { type: "spring", stiffness: 300, damping: 20 }}};
  const buttonVariants = { hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 }}, tap: { scale: 0.95 }};


  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="purple.600" fontSize="lg" fontWeight="medium">
            Loading model details...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <ErrorMessage 
          title="Failed to Load Model Details" 
          description={error} 
          onRetry={handleRetryFetchModel}
        />
      </Box>
    );
  }

  if (!model) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6}>
          <Icon as={FaExclamationTriangle} boxSize={16} color="orange.500" />
          <Heading color="orange.600">Model Not Found</Heading>
          <Text color="gray.600" textAlign="center">
            The requested model could not be found or may have been deleted.
          </Text>
          <Button
            leftIcon={<FaArrowLeft />}
            colorScheme="purple"
            onClick={() => router.push('/dashboard')}
            borderRadius="xl"
            size="lg"
          >
            Back to Dashboard
          </Button>
        </VStack>
      </Box>
    );
  }

  const performanceScore = parseFloat(getPerformanceScore(model));
  const performanceColor = getPerformanceColor(performanceScore);
  const PerformanceIcon = getPerformanceIcon(performanceScore);
  const isRegression = model.latest_metrics?.hasOwnProperty('rmse');

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="1200px" py={8}>
        <MotionBox
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Breadcrumb Navigation */}
          <MotionBox variants={itemVariants} mb={6}>
            <Breadcrumb 
              spacing="8px" 
              separator={<FaChevronRight color="gray.500" size="12px" />}
              fontSize="sm"
              color="gray.600"
            >
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => router.push('/dashboard')}>
                  <HStack spacing={1}>
                    <FaHome />
                    <Text>Dashboard</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <Text color="purple.600" fontWeight="medium">
                  {model.name}
                </Text>
              </BreadcrumbItem>
            </Breadcrumb>
          </MotionBox>

          {/* Header Section */}
          <MotionCard
            variants={cardVariants}
            whileHover="hover"
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="xl"
            border="1px"
            borderColor="purple.100"
            mb={8}
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              bgGradient: 'linear(to-r, purple.500, pink.500)',
            }}
          >
            <CardBody p={8}>
              <Flex direction={{ base: 'column', md: 'row' }} align={{ base: 'start', md: 'center' }} gap={6}>
                <Avatar
                  size="2xl"
                  name={model.name}
                  bg="purple.500"
                  color="white"
                  icon={<FaRobot size="3em" />}
                >
                  <Badge
                    position="absolute"
                    bottom={2}
                    right={2}
                    bg={`${performanceColor}.500`}
                    color="white"
                    borderRadius="full"
                    p={2}
                  >
                    <PerformanceIcon size="16px" />
                  </Badge>
                </Avatar>

                <VStack align="start" spacing={3} flex={1}>
                  <HStack spacing={4} wrap="wrap">
                    <Heading size="2xl" color={textColor} fontWeight="bold">
                      {model.name}
                    </Heading>
                    <Badge
                      colorScheme={performanceColor}
                      variant="subtle"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {getPerformanceScore(model)}% Score
                    </Badge>
                  </HStack>

                  <HStack spacing={6} wrap="wrap" color="gray.500">
                    <HStack spacing={2}>
                      <FaCalendarAlt />
                      <Text fontSize="sm">
                        Uploaded {new Date(model.upload_time).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <FaFileAlt />
                      <Text fontSize="sm">{model.filename}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <FaDatabase />
                      <Text fontSize="sm">ID: {model.id}</Text>
                    </HStack>
                  </HStack>

                  {/* Performance Progress */}
                  <Box w="full" maxW="400px">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontSize="sm" color="gray.500" fontWeight="medium">
                        Overall Performance
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" color={`${performanceColor}.600`}>
                        {getPerformanceScore(model)}%
                      </Text>
                    </Flex>
                    <Progress
                      value={performanceScore}
                      colorScheme={performanceColor}
                      borderRadius="full"
                      size="md"
                      bg="gray.100"
                    />
                  </Box>
                </VStack>

                <VStack spacing={3}>
                  <MotionButton
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    leftIcon={<FaArrowLeft />}
                    colorScheme="gray"
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    borderRadius="xl"
                    size="lg"
                  >
                    Back
                  </MotionButton>
                </VStack>
              </Flex>
            </CardBody>
          </MotionCard>

          {/* Metrics Cards */}
          <MotionBox variants={itemVariants} mb={8}>
            <Heading size="lg" mb={6} color={textColor} display="flex" alignItems="center">
              <Icon as={FaChartLine} mr={3} color="purple.500" />
              Performance Metrics
            </Heading>

            <MotionGrid columns={{ base: 1, md: 3 }} spacing={6} variants={containerVariants}>
              {isRegression ? (
                <>
                  <MotionCard variants={cardVariants} bg={cardBg}>
                    <CardHeader bg="teal.50"><HStack><Icon as={FaStar} color="teal.500" /><Text fontWeight="bold">RMSE</Text></HStack></CardHeader>
                    <CardBody textAlign="center"><Text fontSize="3xl" fontWeight="bold">{model.latest_metrics?.rmse}</Text></CardBody>
                  </MotionCard>
                  <MotionCard variants={cardVariants} bg={cardBg}>
                    <CardHeader bg="cyan.50"><HStack><Icon as={FaTrophy} color="cyan.500" /><Text fontWeight="bold">R² Score</Text></HStack></CardHeader>
                    <CardBody textAlign="center"><Text fontSize="3xl" fontWeight="bold">{model.latest_metrics?.r2_score}</Text></CardBody>
                  </MotionCard>
                </>
              ) : (
                <>
                  <MotionCard variants={cardVariants} bg={cardBg}>
                    <CardHeader bg="purple.50"><HStack><Icon as={FaCheckCircle} color="purple.500" /><Text fontWeight="bold">Accuracy</Text></HStack></CardHeader>
                    <CardBody textAlign="center"><Text fontSize="3xl" fontWeight="bold">{model.latest_metrics?.accuracy?.toFixed(3)}</Text></CardBody>
                  </MotionCard>
                  <MotionCard variants={cardVariants} bg={cardBg}>
                    <CardHeader bg="blue.50"><HStack><Icon as={FaStar} color="blue.500" /><Text fontWeight="bold">F1 Score</Text></HStack></CardHeader>
                    <CardBody textAlign="center"><Text fontSize="3xl" fontWeight="bold">{model.latest_metrics?.f1_score?.toFixed(3)}</Text></CardBody>
                  </MotionCard>
                  <MotionCard variants={cardVariants} bg={cardBg}>
                    <CardHeader bg="green.50"><HStack><Icon as={FaTrophy} color="green.500" /><Text fontWeight="bold">AUC</Text></HStack></CardHeader>
                    <CardBody textAlign="center"><Text fontSize="3xl" fontWeight="bold">{model.latest_metrics?.auc?.toFixed(3)}</Text></CardBody>
                  </MotionCard>
                </>
              )}
            </MotionGrid>
          </MotionBox>

          {/* Evaluation History */}
            <MotionBox variants={itemVariants} mb={8}>
                  <Heading size="lg" mb={6} color={textColor} display="flex" alignItems="center">
                    <Icon as={FaHistory} mr={3} color="purple.500" />
                    Evaluation History
                  </Heading>

                  <MotionCard
                    variants={cardVariants}
                    whileHover="hover"
                    bg={cardBg}
                    borderRadius="xl"
                    boxShadow="lg"
                    border="1px"
                    borderColor="purple.100"
                  >
                    <CardBody p={6}>
                      {model.latest_metrics ? (
                        <Box>
                          <HStack justify="space-between" mb={4}>
                            <Text fontWeight="medium" color={textColor}>
                              Current Performance Metrics
                            </Text>
                            <Badge colorScheme="purple" borderRadius="full">
                              Latest Evaluation
                            </Badge>
                          </HStack>
                          <Suspense fallback={<Skeleton height="250px" borderRadius="lg" />}>
                            <CurrentMetricsInline latest_metrics={model.latest_metrics} />
                          </Suspense>
                        </Box>
                      ) : (
                        <VStack spacing={4} py={8}>
                          <Icon as={FaClock} boxSize={12} color="gray.300" />
                          <Text color="gray.500" fontSize="lg">
                            No evaluation data available
                          </Text>
                          <Text color="gray.400" fontSize="sm" textAlign="center">
                            Upload and evaluate your model to see performance metrics and charts.
                          </Text>
                        </VStack>
                      )}
                    </CardBody>
                  </MotionCard>
                </MotionBox>

          {/* Action Buttons */}
          <MotionBox variants={itemVariants}>
            <HStack spacing={4} justify="center" wrap="wrap">
              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                leftIcon={<FaLightbulb />}
                colorScheme="orange"
                size="lg"
                borderRadius="xl"
                onClick={handleInsights}
                isLoading={insightsLoading}
                loadingText="Generating..."
                boxShadow="lg"
              >
                Generate Insights
              </MotionButton>

              <MotionButton
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                leftIcon={<FaDownload />}
                colorScheme="blue"
                size="lg"
                borderRadius="xl"
                onClick={() =>
                  window.open(`${environment.ASSET_BASE_URL}/uploads/${model.filename}`, '_blank')
                }
                boxShadow="lg"
              >
                Download Model
              </MotionButton>
            </HStack>
          </MotionBox>
        </MotionBox>

        {/* Insights Modal (Using Lazy Loaded Components) */}
        <LazyModal isOpen={isInsightOpen} onClose={() => setIsInsightOpen(false)} size="xl">
          <LazyModalOverlay backdropFilter="blur(10px)" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ borderRadius: '1rem', marginLeft: '1rem', marginRight: '1rem' }}
          >
            <LazyModalContent borderRadius="2xl" mx={4}>
              <LazyModalHeader
                bgGradient="linear(to-r, orange.500, yellow.500)"
                color="white"
                borderTopRadius="2xl"
                py={6}
              >
                <HStack spacing={3}>
                  <FaBrain size="24px" />
                  <Text fontSize="xl" fontWeight="bold">AI-Generated Insights</Text>
                </HStack>
              </LazyModalHeader>
              <LazyModalCloseButton color="white" />
              
              <LazyModalBody p={6}>
                {insights.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    <Alert status="info" borderRadius="xl">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Analysis Complete!</AlertTitle>
                        <AlertDescription>
                          Here are AI-powered insights based on your model's performance metrics.
                        </AlertDescription>
                      </Box>
                    </Alert>
                    
                    <List spacing={4}>
                      {insights.map((item, idx) => (
                        <ListItem
                          key={idx}
                          p={4}
                          bg="orange.50"
                          borderRadius="xl"
                          border="1px"
                          borderColor="orange.100"
                        >
                          <HStack align="start" spacing={3}>
                            <ListIcon as={CheckCircleIcon} color="orange.500" mt={1} />
                            <Text color="gray.700" lineHeight="tall">
                              {item}
                            </Text>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </VStack>
                ) : (
                  <VStack spacing={4} py={8}>
                    <Spinner size="lg" color="orange.500" />
                    <Text color="gray.500">Generating insights...</Text>
                  </VStack>
                )}
              </LazyModalBody>
              
              <LazyModalFooter borderTop="1px" borderColor="gray.100">
                <Button 
                  onClick={() => setIsInsightOpen(false)} 
                  colorScheme="orange"
                  borderRadius="xl"
                  size="lg"
                >
                  Close
                </Button>
              </LazyModalFooter>
            </LazyModalContent>
          </motion.div>
        </LazyModal>
      </Container>
    </Box>
  );
}