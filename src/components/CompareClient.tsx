// FILE: src/components/CompareClient.tsx

'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Model } from '@/types';
import apiClient from '@/lib/apiClient';
import dynamic from 'next/dynamic';

// --- CHAKRA UI IMPORTS - OPTIMIZED ---
import { 
  Box, VStack, HStack, Center, SimpleGrid, Container
} from '@chakra-ui/react';

import { 
  Heading, Text, Select, Badge, Button, Icon, Spinner
} from '@chakra-ui/react';

import { 
  Card, CardBody, Progress, Divider, useColorModeValue, Skeleton
} from '@chakra-ui/react';
// --- END CHAKRA UI IMPORTS - OPTIMIZED ---

import { FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

// Dynamically load heavy chart components (these remain dynamic as per instructions)
const ModelComparisonChart = dynamic(() => import('@/components/ModelComparisonChart'), {
  loading: () => <Skeleton height="350px" borderRadius="xl" />,
  ssr: false
});
const ModelRadarChart = dynamic(() => import('@/components/ModelRadarChart'), {
  loading: () => <Skeleton height="350px" borderRadius="xl" />,
  ssr: false
});

// --- STATIC OBJECTS MOVED OUTSIDE COMPONENT ---
const bgGradient = 'linear(to-r, #f8f7ff, #E6D8FD, #f8f7ff)'; // light purple gradient
const cardBg = '#FFFFFF'; // white background for cards
const glassBg = 'rgba(255, 255, 255, 0.9)'; // slightly transparent white
const borderColor = 'rgba(229, 228, 225, 0.6)'; // light gray for borders
// --- END STATIC OBJECTS ---

// Memoize ModelDisplayCard component
const ModelDisplayCard = memo(function ModelDisplayCard({ model, label, color, isRegression }: 
  { model: Model | null; label: string; color: string; isRegression: boolean }) {
  return (
    <Card bg={cardBg} shadow="xl" borderRadius="2xl" border={`1px solid ${borderColor}`}>
      <CardBody p={6}>
        {model ? (
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Badge colorScheme={color}>{label}</Badge>
                <Heading size="md">{model.name} v{model.version}</Heading>
              </VStack>
              <Icon as={FiCheckCircle} color={`${color}.500`} />
            </HStack>
            <Divider borderColor={borderColor} />
            {isRegression ? (
              <VStack spacing={4} align="stretch">
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text>RMSE</Text>
                    <Text fontWeight="bold">{model.latest_metrics?.rmse?.toFixed(4)}</Text>
                  </HStack>
                  <Progress 
                    value={Math.max(0, 100 - (model.latest_metrics?.rmse || 0) * 100)} 
                    colorScheme="red" 
                    size="sm" 
                    borderRadius="full" 
                    bg="gray.100"
                  />
                </VStack>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text>R² Score</Text>
                    <Text fontWeight="bold">{model.latest_metrics?.r2_score?.toFixed(4)}</Text>
                  </HStack>
                  <Progress 
                    value={(model.latest_metrics?.r2_score || 0) * 100} 
                    colorScheme="teal" 
                    size="sm" 
                    borderRadius="full" 
                    bg="gray.100"
                  />
                </VStack>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch">
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text>Accuracy</Text>
                    <Text fontWeight="bold">{model.latest_metrics?.accuracy?.toFixed(3)}</Text>
                  </HStack>
                  <Progress 
                    value={(model.latest_metrics?.accuracy || 0) * 100} 
                    colorScheme="purple" 
                    size="sm" 
                    borderRadius="full" 
                    bg="gray.100"
                  />
                </VStack>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text>F1 Score</Text>
                    <Text fontWeight="bold">{model.latest_metrics?.f1_score?.toFixed(3)}</Text>
                  </HStack>
                  <Progress 
                    value={(model.latest_metrics?.f1_score || 0) * 100} 
                    colorScheme="blue" 
                    size="sm" 
                    borderRadius="full" 
                    bg="gray.100"
                  />
                </VStack>
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text>AUC</Text>
                    <Text fontWeight="bold">{model.latest_metrics?.auc?.toFixed(3)}</Text>
                  </HStack>
                  <Progress 
                    value={(model.latest_metrics?.auc || 0) * 100} 
                    colorScheme="green" 
                    size="sm" 
                    borderRadius="full" 
                    bg="gray.100"
                  />
                </VStack>
              </VStack>
            )}
          </VStack>
        ) : (
          <Center h="150px"><Text color="gray.500">Select {label}</Text></Center>
        )}
      </CardBody>
    </Card>
  );
});


export default function CompareClient({ initialModels }: { initialModels: Model[] }) {
  const [models, setModels] = useState<Model[]>(initialModels);
  const [modelA, setModelA] = useState<Model | null>(null);
  const [modelB, setModelB] = useState<Model | null>(null);
  const [loading, setLoading] = useState(false); // Only for refresh, initial load is done by server
  const [activeTaskType, setActiveTaskType] = useState<'classification' | 'regression'>('classification');

  const statBg = useColorModeValue('#f8f7ff', 'gray.700'); // Dynamic, so stays inside

  useEffect(() => {
    if (!initialModels || initialModels.length === 0) { // Added initialModels.length check
        setLoading(true);
        apiClient.get('/models/').then(res => {
            setModels(res.data);
        }).catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [initialModels]);

  const isRegression = useMemo(() => activeTaskType === 'regression', [activeTaskType]);

  const selectableModels = useMemo(() => models.filter(m => m.task_type === activeTaskType), [models, activeTaskType]);

  const resetComparison = useCallback(() => { setModelA(null); setModelB(null); }, []);

  const metricConfig = useMemo(() => isRegression 
    ? [{ key: 'rmse', label: 'RMSE' }, { key: 'r2_score', label: 'R² Score' }]
    : [{ key: 'accuracy', label: 'Accuracy' }, { key: 'f1_score', label: 'F1 Score' }, { key: 'auc', label: 'AUC' }]
  , [isRegression]);

  return (
    <>
      <Box minH="100vh" bgGradient={bgGradient}> {/* Uses moved static object */}
        <Container maxW="7xl" py={12}>
          <VStack spacing={8} align="stretch">
            <Heading textAlign="center" color="purple.800">Model Comparison Lab</Heading>
            {loading ? (<Center h="50vh"><Spinner size="xl" color="purple.500" /></Center>) : (
              <>
                <Card bg={cardBg} shadow="lg" borderRadius="xl" w="full" border={`1px solid ${borderColor}`}>
                  <CardBody p={6}>
                    <HStack justify="space-between" mb={4}>
                      <HStack bg={statBg} p={1} borderRadius="lg" spacing={1} border={`1px solid ${borderColor}`}>
                        <Button 
                          onClick={() => { setActiveTaskType('classification'); resetComparison(); }} 
                          colorScheme={!isRegression ? 'purple' : 'gray'} 
                          variant={!isRegression ? 'solid' : 'ghost'}
                          size="sm"
                        >
                          Classification
                        </Button>
                        <Button 
                          onClick={() => { setActiveTaskType('regression'); resetComparison(); }} 
                          colorScheme={isRegression ? 'purple' : 'gray'} 
                          variant={isRegression ? 'solid' : 'ghost'}
                          size="sm"
                        >
                          Regression
                        </Button>
                      </HStack>
                      {(modelA || modelB) && (
                        <Button size="sm" variant="ghost" leftIcon={<FiRefreshCw />} onClick={resetComparison} colorScheme="purple">
                          Reset
                        </Button>
                      )}
                    </HStack>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Select 
                        placeholder="Select Model A" 
                        value={modelA?.id || ''} 
                        onChange={(e) => setModelA(models.find(m => m.id === Number(e.target.value)) || null)}
                        bg={glassBg}
                        border={`1px solid ${borderColor}`}
                        focusBorderColor="purple.400"
                      >
                        {selectableModels.map((m) => (<option key={m.id} value={m.id}>{m.name} - v{m.version}</option>))}
                      </Select>
                      <Select 
                        placeholder="Select Model B" 
                        value={modelB?.id || ''} 
                        onChange={(e) => setModelB(models.find(m => m.id === Number(e.target.value)) || null)}
                        bg={glassBg}
                        border={`1px solid ${borderColor}`}
                        focusBorderColor="purple.400"
                      >
                        {selectableModels.map((m) => (<option key={m.id} value={m.id}>{m.name} - v{m.version}</option>))}
                      </Select>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full">
                  <ModelDisplayCard model={modelA} label="Model A" color="blue" isRegression={isRegression} />
                  <ModelDisplayCard model={modelB} label="Model B" color="green" isRegression={isRegression} />
                </SimpleGrid>

                {modelA && modelB && (
                  <VStack spacing={8} w="full">
                    <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8} w="full">
                      <Card bg={cardBg} border={`1px solid ${borderColor}`}>
                        <CardBody>
                          <Heading size="md" mb={4} color="purple.800">Performance Comparison</Heading>
                          <ModelComparisonChart modelA={modelA} modelB={modelB} />
                        </CardBody>
                      </Card>
                      <Card bg={cardBg} border={`1px solid ${borderColor}`}>
                        <CardBody>
                          <Heading size="md" mb={4} color="purple.800">Radar Analysis</Heading>
                          <ModelRadarChart models={[modelA, modelB]} />
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                    <VStack spacing={6} w="full">
                      {/* Performance Metrics Table */}
                      <Card bg={cardBg} w="full" border={`1px solid ${borderColor}`}>
                        <CardBody p={6}>
                          <Heading size="md" mb={6} color="purple.800">Performance Comparison</Heading>
                          <Box overflowX="auto">
                            <SimpleGrid columns={{ base: 1, md: metricConfig.length + 1 }} spacing={4} minW="600px">
                              {/* Header */}
                              <Box></Box>
                              {metricConfig.map(({ label }) => (
                                <Text key={label} fontWeight="bold" textAlign="center" color="purple.700" fontSize="sm">
                                  {label}
                                </Text>
                              ))}
                              
                              {/* Model A Row */}
                              <HStack>
                                <Box w={3} h={3} bg="blue.500" borderRadius="full" />
                                <Text fontWeight="medium" color="blue.600">Model A</Text>
                              </HStack>
                              {metricConfig.map(({ key }) => {
                                const val = modelA.latest_metrics?.[key] ?? 0;
                                return (
                                  <Text key={key} textAlign="center" fontWeight="bold">
                                    {val.toFixed(4)}
                                  </Text>
                                );
                              })}
                              
                              {/* Model B Row */}
                              <HStack>
                                <Box w={3} h={3} bg="green.500" borderRadius="full" />
                                <Text fontWeight="medium" color="green.600">Model B</Text>
                              </HStack>
                              {metricConfig.map(({ key }) => {
                                const val = modelB.latest_metrics?.[key] ?? 0;
                                return (
                                  <Text key={key} textAlign="center" fontWeight="bold">
                                    {val.toFixed(4)}
                                  </Text>
                                );
                              })}
                              
                              {/* Winner Row */}
                              <Text fontWeight="bold" color="purple.700">Winner</Text>
                              {metricConfig.map(({ key }) => {
                                const valA = modelA?.latest_metrics?.[key] ?? 0;
                                const valB = modelB?.latest_metrics?.[key] ?? 0;
                                const isLowerBetter = key === 'rmse';
                                const winner = isLowerBetter 
                                  ? (valA < valB ? 'A' : valB < valA ? 'B' : 'Tie')
                                  : (valA > valB ? 'A' : valB > valA ? 'B' : 'Tie');
                                
                                return (
                                  <Text 
                                    key={key} 
                                    textAlign="center" 
                                    fontWeight="bold"
                                    color={winner === 'A' ? 'blue.500' : winner === 'B' ? 'green.500' : 'gray.500'}
                                  >
                                    {winner === 'Tie' ? '🤝' : winner === 'A' ? '🥇 A' : '🥇 B'}
                                  </Text>
                                );
                              })}
                            </SimpleGrid>
                          </Box>
                        </CardBody>
                      </Card>

                      {/* Overall Winner */}
                      <Card bg={cardBg} w="full" border={`1px solid ${borderColor}`}>
                        <CardBody p={6}>
                          {(() => {
                            let modelAWins = 0;
                            let modelBWins = 0;
                            
                            metricConfig.forEach(({ key }) => {
                              const valA = modelA?.latest_metrics?.[key] ?? 0;
                              const valB = modelB?.latest_metrics?.[key] ?? 0;
                              const isLowerBetter = key === 'rmse';
                              
                              if (isLowerBetter) {
                                if (valA < valB) modelAWins++;
                                else if (valB < valA) modelBWins++;
                              } else {
                                if (valA > valB) modelAWins++;
                                else if (valB > valA) modelBWins++;
                              }
                            });
                            
                            const overallWinner = modelAWins > modelBWins ? 'A' : modelBWins > modelAWins ? 'B' : 'tie';
                            
                            return (
                              <VStack spacing={4}>
                                <Heading size="md" color="purple.800">Overall Result</Heading>
                                <HStack spacing={8} justify="center">
                                  <VStack>
                                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">{modelAWins}</Text>
                                    <Text color="blue.600" fontSize="sm">Model A</Text>
                                  </VStack>
                                  <Text fontSize="lg" color="gray.400">vs</Text>
                                  <VStack>
                                    <Text fontSize="2xl" fontWeight="bold" color="green.500">{modelBWins}</Text>
                                    <Text color="green.600" fontSize="sm">Model B</Text>
                                  </VStack>
                                </HStack>
                                
                                <Box textAlign="center" p={4} bg={statBg} borderRadius="xl" w="full">
                                  {overallWinner === 'tie' ? (
                                    <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                      🤝 It's a tie!
                                    </Text>
                                  ) : (
                                    <Text fontSize="lg" fontWeight="bold" color={overallWinner === 'A' ? 'blue.700' : 'green.700'}>
                                      🏆 Model {overallWinner} wins overall!
                                    </Text>
                                  )}
                                </Box>
                              </VStack>
                            );
                          })()}
                        </CardBody>
                      </Card>
                    </VStack>
                  </VStack>
                )}
              </>
            )}
          </VStack>
        </Container>
      </Box>
    </>
  );
}