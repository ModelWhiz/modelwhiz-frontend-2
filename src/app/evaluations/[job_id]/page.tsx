// src/app/evaluations/[job_id]/page.tsx
'use client'

import { useEffect, useState, Suspense, lazy, useCallback, useRef, memo } from 'react' // Added useRef
import { useParams, useRouter } from 'next/navigation';

// --- CHAKRA UI IMPORTS - OPTIMIZED ---
import { 
  Box, VStack, Container, HStack, SimpleGrid
} from '@chakra-ui/react';

import { 
  Heading, Text, Image, Badge, Button, Icon, Alert, AlertIcon, AlertTitle, AlertDescription, Spinner, useColorModeValue
} from '@chakra-ui/react';

import { 
  Stat, StatLabel, StatNumber, Divider
} from '@chakra-ui/react';

import { 
  List, ListItem, ListIcon
} from '@chakra-ui/react';
// --- END CHAKRA UI IMPORTS - OPTIMIZED ---

import { motion } from 'framer-motion'
import { getJobStatus, getJobResults } from '@/lib/apiClient'
import { FaLightbulb, FaArrowLeft, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import environment from '@/config/environment';

// Dynamic import for Navbar (remains dynamic)
const Navbar = lazy(() => import('@/components/Navbar'));

interface Job {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  model_name: string;
  results: { [key: string]: any } | null;
  artifacts: { [key: string]: string | null } | null;
  error_message: string | null;
  created_at: string;
}

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

const EvaluationResultPage = memo(function EvaluationResultPage() {
  const params = useParams()
  const router = useRouter();
  const jobId = Number(params.job_id)
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref to store setTimeout ID
  const isMounted = useRef(true); // isMounted ref

  const pollStatus = useCallback(async () => {
    if (isNaN(jobId)) {
      if (isMounted.current) {
        setError("Invalid Job ID provided.");
        setIsLoading(false);
      }
      return;
    }

    try {
      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
      }

      const statusRes = await getJobStatus(jobId);
      if (isMounted.current) {
        setJob(prev => ({ ...prev, status: statusRes.status } as Job));
      }

      if (statusRes.status === 'COMPLETED' || statusRes.status === 'FAILED') {
        const finalResults = await getJobResults(jobId);
        if (isMounted.current) {
          setJob(finalResults);
          setIsLoading(false);
          if (finalResults?.status === 'FAILED' && finalResults?.error_message) {
            setError(finalResults.error_message);
          }
        }
      } else {
        if (isMounted.current && statusRes.status === 'PROCESSING') {
          timeoutRef.current = setTimeout(pollStatus, 3000); // Store timeout ID
        } else if (isMounted.current) {
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      console.error("Error fetching job status:", err);
      if (isMounted.current) {
        setError(err.message || 'Could not connect to the server to get job status or results.');
        setJob({ status: 'FAILED', error_message: err.message || 'Network or API error.' } as any);
        setIsLoading(false);
      }
    }
  }, [jobId]);

  useEffect(() => {
    isMounted.current = true; // Set mounted flag on mount
    pollStatus();

    return () => {
      isMounted.current = false; // Set unmounted flag on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Clear any pending timeout on unmount
      }
    };
  }, [pollStatus]);

  const MotionBox = motion(Box);
  const MotionVStack = motion(VStack);

  const handleRetry = useCallback(() => {
    setJob(null);
    setError(null);
    setIsLoading(true);
    pollStatus();
  }, [pollStatus]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <MotionVStack
          spacing={6}
          py={20}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Spinner size="xl" color="purple.500" thickness="4px" speed="0.65s"/>
          <Heading size="lg" bgGradient="linear(to-r, purple.400, pink.400)" bgClip="text">Evaluation in Progress</Heading>
          <Text color="gray.500">We’re crunching numbers and testing your model...</Text>
        </MotionVStack>
      )
    }

    if (error && !job) {
      return (
        <ErrorMessage 
          title="Error Loading Evaluation" 
          description={error} 
          onRetry={handleRetry}
        />
      );
    }
    
    if (job?.status === 'FAILED') {
      return (
        <ErrorMessage 
          title="Evaluation Failed" 
          description={job.error_message || 'An unknown error occurred during evaluation.'} 
          onRetry={handleRetry}
        />
      )
    }

    if (!job) {
      return (
        <ErrorMessage 
          title="Evaluation Not Found" 
          description="The requested evaluation could not be found. Please check the job ID." 
          onRetry={handleRetry}
        />
      );
    }

    if (job.status === 'COMPLETED') {
      const isRegression = job.results?.hasOwnProperty('rmse');
      const metricsToDisplay = job.results ? Object.entries(job.results).filter(([key]) => key !== 'insights') : [];

      return (
        <MotionVStack spacing={8} align="stretch" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Heading size="xl" textAlign="center" bgGradient="linear(to-r, purple.500, cyan.400)" bgClip="text">
            Evaluation Results: {job.model_name}
          </Heading>

          <MotionBox
            borderRadius="2xl"
            backdropFilter="blur(10px)"
            bg={useColorModeValue("whiteAlpha.800", "blackAlpha.400")}
            boxShadow="xl"
            p={6}
            whileHover={{ scale: 1.02 }}
          >
            <Heading size="md" mb={6}>Performance Metrics</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {metricsToDisplay.map(([key, value]) => (
                <Stat
                  key={key}
                  p={6}
                  borderRadius="xl"
                  bgGradient="linear(to-r, purple.50, pink.50)"
                  boxShadow="lg"
                >
                  <StatLabel color="gray.600" fontSize="sm">{key.replace(/_/g, ' ').toUpperCase()}</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="purple.600">
                    {value as number}
                  </StatNumber>
                </Stat>
              ))}
            </SimpleGrid>
          </MotionBox>

          {job.artifacts?.plot_url && (
            <MotionBox
              borderRadius="2xl"
              bg={useColorModeValue("gray.50", "gray.800")}
              p={6}
              boxShadow="xl"
              whileHover={{ scale: 1.01 }}
            >
              <Heading size="md" mb={4}>{isRegression ? 'Predicted vs. Actual Plot' : 'Confusion Matrix'}</Heading>
              <Box display="flex" justifyContent="center">
                <Image
                  src={`${environment.ASSET_BASE_URL}${job.artifacts.plot_url}`}
                  alt="Evaluation Plot"
                  borderRadius="lg"
                  boxShadow="2xl"
                  maxW="100%"
                  h="auto"
                />
              </Box>
            </MotionBox>
          )}

          {job.results?.insights && Array.isArray(job.results.insights) && (
            <MotionBox
              borderRadius="2xl"
              p={6}
              boxShadow="xl"
              backdropFilter="blur(12px)"
              bg={useColorModeValue("whiteAlpha.700", "blackAlpha.500")}
              whileHover={{ scale: 1.01 }}
            >
              <Heading size="md" mb={4}>Automated Insights</Heading>
              <List spacing={4}>
                {(job.results.insights as string[]).map((insight, index) => (
                  <ListItem key={index} display="flex" alignItems="center">
                    <ListIcon as={FaLightbulb} color="yellow.500" />
                    <Text>{insight}</Text>
                  </ListItem>
                ))}
              </List>
            </MotionBox>
          )}

          <Divider pt={4} />
          <HStack spacing={6} justify="center" pt={4}>
            <Button
              leftIcon={<Icon as={FaArrowLeft} />}
              onClick={() => router.push('/dashboard')}
              colorScheme="gray"
              variant="outline"
              size="lg"
              borderRadius="full"
            >
              Back to Dashboard
            </Button>
            <Button
              leftIcon={<Icon as={FaHistory} />}
              onClick={() => router.push('/dashboard/evaluations')}
              colorScheme="purple"
              size="lg"
              borderRadius="full"
            >
              View All Evaluations
            </Button>
          </HStack>
        </MotionVStack>
      )
    }
    // Fallback in case job.status is not "COMPLETED", "FAILED" or "PROCESSING"
    return (
      <ErrorMessage
        title="Unexpected Job Status"
        description={`Job is in an unexpected state: ${job?.status || 'unknown'}.`}
        onRetry={handleRetry}
      />
    );
  };

  return (
    <>
      <Suspense fallback={<div>Loading navigation...</div>}>
        <Navbar />
      </Suspense>
      <Box
        minH="100vh"
        bgGradient={useColorModeValue("linear(to-br, gray.50, purple.50)", "linear(to-br, gray.900, purple.900)")}
      >
        <Container maxW="6xl" py={12}>
          {renderContent()}
        </Container>
      </Box>
    </>
  );
})

export default EvaluationResultPage