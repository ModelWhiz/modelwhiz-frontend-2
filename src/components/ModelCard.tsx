'use client';

import { useState, useRef, Suspense, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Model } from '@/types';
import apiClient from '@/lib/apiClient';
import dynamic from 'next/dynamic';

// --- CHAKRA UI IMPORTS - OPTIMIZED ---
import { Box, VStack, HStack, Flex, SimpleGrid } from '@chakra-ui/react';

import {
  Text, Badge, Avatar, Button, IconButton
} from '@chakra-ui/react';

import {
  Card, CardHeader, CardBody, Progress
} from '@chakra-ui/react';

import {
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, useDisclosure, Skeleton,
  Tooltip, useToast, useColorModeValue
} from '@chakra-ui/react';
// --- END CHAKRA UI IMPORTS - OPTIMIZED ---

import { 
  FaRobot, FaEye, FaTrash, FaClock, FaAward
} from 'react-icons/fa';

import { motion } from 'framer-motion'
const MotionCard = motion(Card)
const MotionButton = motion(Button)

// Dynamic import for the current metrics chart (heavy component, so kept dynamic)
const CurrentMetricsChart = dynamic(() => import('@/components/CurrentMetricsChart'), {
  loading: () => <Skeleton height="44px" borderRadius="lg" />,
  ssr: false
});

type Props = {
  model: Model;
  refreshModels: () => void;
  userId: string | null;
};

// --- STATIC OBJECTS AND HELPER FUNCTIONS MOVED OUTSIDE COMPONENT ---
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { 
    y: -4,
    transition: { duration: 0.2 }
  }
};

const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 }
};

// Memoized helper to format upload time
const formatUploadTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

// --- END STATIC OBJECTS AND HELPER FUNCTIONS ---

// Memoize the ModelCard component
const ModelCard = memo(function ModelCard({ model, refreshModels, userId }: Props) {
  // Move all hooks outside conditional statements
  const router = useRouter();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen: isAlertOpen, onOpen, onClose: onAlertClose } = useDisclosure();
  
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  const isRegression = useMemo(() => 
    model.latest_metrics?.hasOwnProperty('rmse') || model.task_type === 'regression'
  , [model.latest_metrics, model.task_type]);

  // Get performance score - Memoized
  const performanceScore = useMemo(() => {
    if (isRegression) {
      return model.latest_metrics?.r2_score || 0;
    }
    return model.latest_metrics?.accuracy || 0;
  }, [model.latest_metrics, isRegression]);

  // Get performance color - Memoized
  const performanceColor = useMemo(() => {
    if (performanceScore >= 0.9) return 'green';
    if (performanceScore >= 0.8) return 'blue';
    if (performanceScore >= 0.7) return 'orange';
    return 'red';
  }, [performanceScore]);

  // Move all useColorModeValue calls to the top level
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.3)');
  const hoverBorderColor = useColorModeValue('purple.200', 'purple.500');
  const modelNameColor = useColorModeValue('gray.800', 'white');
  const whiteBg = useColorModeValue('white', 'whiteAlpha.200');

  // Performance color mapping - static colors to avoid dynamic construction
  const performanceColors = useMemo(() => ({
    green: {
      50: useColorModeValue('green.50', 'green.900'),
      200: useColorModeValue('green.200', 'green.600'),
      600: useColorModeValue('green.600', 'green.400'),
      700: useColorModeValue('green.700', 'green.300')
    },
    blue: {
      50: useColorModeValue('blue.50', 'blue.900'),
      200: useColorModeValue('blue.200', 'blue.600'),
      600: useColorModeValue('blue.600', 'blue.400'),
      700: useColorModeValue('blue.700', 'blue.300')
    },
    orange: {
      50: useColorModeValue('orange.50', 'orange.900'),
      200: useColorModeValue('orange.200', 'orange.600'),
      600: useColorModeValue('orange.600', 'orange.400'),
      700: useColorModeValue('orange.700', 'orange.300')
    },
    red: {
      50: useColorModeValue('red.50', 'red.900'),
      200: useColorModeValue('red.200', 'red.600'),
      600: useColorModeValue('red.600', 'red.400'),
      700: useColorModeValue('red.700', 'red.300')
    }
  }), []);

  // Metric colors - static mapping
  const metricColors = useMemo(() => ({
    red: {
      50: useColorModeValue('red.50', 'red.900'),
      600: useColorModeValue('red.600', 'red.400'),
      700: useColorModeValue('red.700', 'red.300')
    },
    green: {
      50: useColorModeValue('green.50', 'green.900'),
      600: useColorModeValue('green.600', 'green.400'),
      700: useColorModeValue('green.700', 'green.300')
    },
    blue: {
      50: useColorModeValue('blue.50', 'blue.900'),
      600: useColorModeValue('blue.600', 'blue.400'),
      700: useColorModeValue('blue.700', 'blue.300')
    },
    purple: {
      50: useColorModeValue('purple.50', 'purple.900'),
      600: useColorModeValue('purple.600', 'purple.400'),
      700: useColorModeValue('purple.700', 'purple.300')
    }
  }), []);

  const clockColor = useColorModeValue('#A0AEC0', '#718096');
  const timeColor = useColorModeValue('gray.500', 'gray.400');

  // Get current performance colors based on score
  const currentPerfColors = performanceColors[performanceColor];
  const perfColor50 = currentPerfColors?.[50] || performanceColors.green[50];
  const perfColor200 = currentPerfColors?.[200] || performanceColors.green[200];
  const perfColor600 = currentPerfColors?.[600] || performanceColors.green[600];
  const perfColor700 = currentPerfColors?.[700] || performanceColors.green[700];

  const handleDelete = useCallback(async () => {
    // Delete function called for model
    setIsDeleting(true);
    try {
      await apiClient.delete(`/models/${model.id}`, {
        params: { user_id: userId } // Pass user ID for authorization
      });
      toast({ 
        title: 'Model deleted successfully', 
        status: 'success', 
        duration: 3000, 
        isClosable: true,
        position: 'top-right'
      });
      refreshModels(); // Refresh the model list after deletion
    } catch {
      toast({ 
        title: 'Failed to delete model', 
        description: 'Please try again later',
        status: 'error', 
        duration: 3000, 
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsDeleting(false);
      onAlertClose();
    }
  }, [model.id, refreshModels, toast, onAlertClose, userId]); // Add userId dependency

  // Early return after all hooks
  if (!model) return null;

  return (
    <>
      <Suspense fallback={<Skeleton height="400px" borderRadius="xl" />}>
        <MotionCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          bg={cardBg}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          shadow={`0 4px 12px ${shadowColor}`}
          overflow="hidden"
          transition={{ duration: 0.2 }}
          _hover={{
            shadow: `0 8px 25px ${shadowColor}`,
            borderColor: hoverBorderColor
          }}
        >
          {/* Header */}
          <CardHeader pb={4}>
            <Flex justify="space-between" align="flex-start">
              <HStack spacing={4}>
                <Avatar 
                  name={model.name} 
                  bg="purple.500" 
                  color="white" 
                  icon={<FaRobot size="1.2em" />}
                  size="md"
                />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="lg" color={modelNameColor}>
                    {model.name}
                  </Text>
                  <HStack spacing={2}>
                    <Badge colorScheme="purple" variant="subtle" borderRadius="md" px={2}>
                      v{model.version}
                    </Badge>
                    <Badge 
                      colorScheme={isRegression ? "blue" : "green"} 
                      variant="outline" 
                      borderRadius="md"
                      px={2}
                    >
                      {isRegression ? "Regression" : "Classification"}
                    </Badge>
                  </HStack>
                </VStack>
              </HStack>
              
              <Tooltip label="Delete model" hasArrow>
                <IconButton
                  aria-label="Delete model" 
                  icon={<FaTrash />} 
                  size="sm" 
                  variant="ghost" 
                  colorScheme="red" 
                  onClick={onOpen}
                  borderRadius="lg"
                />
              </Tooltip>
            </Flex>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={6} align="stretch">
              {/* Performance Score */}
              <Box 
                p={4} 
                bg={performanceColor50} 
                borderRadius="lg"
                border="1px solid"
                borderColor={performanceColor200}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="sm" fontWeight="semibold" color={`${performanceColor}.600`}>
                    Performance Score
                  </Text>
                  <HStack spacing={1}>
                    <FaAward color={performanceColor600} size="14px" />
                    <Text fontSize="sm" color={`${performanceColor}.600`} fontWeight="medium">
                      {(performanceScore * 100).toFixed(1)}%
                    </Text>
                  </HStack>
                </Flex>
                <Progress 
                  value={performanceScore * 100} 
                  colorScheme={performanceColor}
                  borderRadius="full"
                  size="md"
                  bg={whiteBg}
                />
              </Box>

              {/* Metrics */}
              <SimpleGrid columns={isRegression ? 2 : 3} spacing={3}>
                {isRegression ? (
                  <>
                    <Box p={4} bg={red50} borderRadius="lg" textAlign="center">
                      <Text fontSize="xs" color={red600} fontWeight="bold" mb={1}>
                        RMSE
                      </Text>
                      <Text fontWeight="bold" fontSize="lg" color={red700}>
                        {model.latest_metrics?.rmse?.toFixed(4) ?? 'N/A'}
                      </Text>
                    </Box>
                    <Box p={4} bg={green50} borderRadius="lg" textAlign="center">
                      <Text fontSize="xs" color={green600} fontWeight="bold" mb={1}>
                        R² SCORE
                      </Text>
                      <Text fontWeight="bold" fontSize="lg" color={green700}>
                        {model.latest_metrics?.r2_score?.toFixed(4) ?? 'N/A'}
                      </Text>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box p={3} bg={green50} borderRadius="lg" textAlign="center">
                      <Text fontSize="xs" color={green600} fontWeight="bold" mb={1}>
                        ACCURACY
                      </Text>
                      <Text fontWeight="bold" fontSize="md" color={green700}>
                        {model.latest_metrics?.accuracy?.toFixed(3) ?? 'N/A'}
                      </Text>
                    </Box>
                    <Box p={3} bg={blue50} borderRadius="lg" textAlign="center">
                      <Text fontSize="xs" color={blue600} fontWeight="bold" mb={1}>
                        F1 SCORE
                      </Text>
                      <Text fontWeight="bold" fontSize="md" color={blue700}>
                        {model.latest_metrics?.f1_score?.toFixed(3) ?? 'N/A'}
                      </Text>
                    </Box>
                    <Box p={3} bg={purple50} borderRadius="lg" textAlign="center">
                      <Text fontSize="xs" color={purple600} fontWeight="bold" mb={1}>
                        AUC
                      </Text>
                      <Text fontWeight="bold" fontSize="md" color={purple700}>
                        {model.latest_metrics?.auc?.toFixed(3) ?? 'N/A'}
                      </Text>
                    </Box>
                  </>
                )}
              </SimpleGrid>

              {/* Current Metrics Chart - UPDATED */}
              {model.latest_metrics && (
                <Suspense fallback={<Skeleton height="44px" borderRadius="lg" />}>
                  <Box textAlign="center">
                    <CurrentMetricsChart 
                      latest_metrics={model.latest_metrics} 
                      modelName={`${model.name} v${model.version}`}
                    />
                  </Box>
                </Suspense>
              )}

              {/* Action Buttons */}
              <HStack spacing={3} pt={2}>
                <Suspense fallback={<Skeleton height="44px" borderRadius="lg" flex={1} />}>
                  <MotionButton
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    colorScheme="purple"
                    leftIcon={<FaEye />}
                    onClick={() => router.push(`/models/${model.id}`)}
                    flex={1}
                    borderRadius="lg"
                    size="md"
                    fontWeight="semibold"
                  >
                    View Details
                  </MotionButton>
                </Suspense>
              </HStack>

              {/* Upload Time */}
              <HStack justify="center" spacing={2} pt={3}>
                <FaClock color={clockColor} size="12px" />
                <Text fontSize="sm" color={timeColor}>
                  Uploaded {formatUploadTime(model.upload_time)}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </MotionCard>
      </Suspense>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose} isCentered>
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)">
          <AlertDialogContent borderRadius="xl" mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Model
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete <strong>&quot;{model.name} - v{model.version}&quot;</strong>? 
              This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose} borderRadius="lg">
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3} 
                isLoading={isDeleting}
                loadingText="Deleting..."
                borderRadius="lg"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
});

export default ModelCard;
