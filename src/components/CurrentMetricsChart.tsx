// src/components/CurrentMetricsChart.tsx
'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  Badge,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  CircularProgress,
  CircularProgressLabel
} from '@chakra-ui/react';

// Import Recharts components with proper typing
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import { FaChartLine, FaChartBar, FaTachometerAlt, FaChartArea } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Type-safe wrapper components for Recharts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeResponsiveContainer = ResponsiveContainer as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeBarChart = BarChart as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeLineChart = LineChart as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeRadarChart = RadarChart as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeXAxis = XAxis as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeYAxis = YAxis as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeBar = Bar as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeLine = Line as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeCell = Cell as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafePolarGrid = PolarGrid as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafePolarAngleAxis = PolarAngleAxis as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafePolarRadiusAxis = PolarRadiusAxis as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeRadar = Radar as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeCartesianGrid = CartesianGrid as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeTooltip = Tooltip as any;

// Simple error fallback for charts
const ChartErrorFallback = ({ componentName = "chart" }: { componentName?: string }) => (
  <VStack p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200" minH="200px" justifyContent="center">
    <Text color="red.700" fontWeight="bold">Error loading {componentName}.</Text>
    <Text color="red.600" fontSize="sm">Please try again or check your data.</Text>
  </VStack>
);

// Tooltip types
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    payload?: Record<string, unknown>;
  }>;
  label?: string;
}

type Props = {
  latest_metrics: { [key: string]: number } | null;
  modelName: string;
};

// --- STATIC OBJECTS AND HELPER FUNCTIONS MOVED OUTSIDE COMPONENT ---
const chartColors = {
  primary: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
  secondary: ['#EC4899', '#F472B6', '#F9A8D4'],
  success: ['#10B981', '#34D399', '#6EE7B7'],
  warning: ['#F59E0B', '#FBBF24', '#FCD34D'],
  error: ['#EF4444', '#F87171', '#FCA5A5'],
  info: ['#3B82F6', '#60A5FA', '#93C5FD']
};

const getPerformanceLevel = (metric: string, value: number, isRegression: boolean) => {
  if (isRegression) {
    switch (metric.toLowerCase()) {
      case 'r2_score':
        if (value >= 0.95) return { level: 'excellent', color: chartColors.success[0] };
        if (value >= 0.85) return { level: 'good', color: chartColors.info[0] };
        if (value >= 0.7) return { level: 'fair', color: chartColors.warning[0] };
        return { level: 'needs improvement', color: chartColors.error[0] };
      case 'rmse':
        if (value <= 0.1) return { level: 'excellent', color: chartColors.success[0] };
        if (value <= 0.5) return { level: 'good', color: chartColors.info[0] };
        if (value <= 1.0) return { level: 'fair', color: chartColors.warning[0] };
        return { level: 'needs improvement', color: chartColors.error[0] };
      case 'mae':
        if (value <= 0.05) return { level: 'excellent', color: chartColors.success[0] };
        if (value <= 0.2) return { level: 'good', color: chartColors.info[0] };
        if (value <= 0.5) return { level: 'fair', color: chartColors.warning[0] };
        return { level: 'needs improvement', color: chartColors.error[0] };
      case 'mse':
        if (value <= 0.01) return { level: 'excellent', color: chartColors.success[0] };
        if (value <= 0.1) return { level: 'good', color: chartColors.info[0] };
        if (value <= 0.25) return { level: 'fair', color: chartColors.warning[0] };
        return { level: 'needs improvement', color: chartColors.error[0] };
    }
  } else {
    if (value >= 0.9) return { level: 'excellent', color: chartColors.success[0] };
    if (value >= 0.8) return { level: 'good', color: chartColors.info[0] };
    if (value >= 0.7) return { level: 'fair', color: chartColors.warning[0] };
    return { level: 'needs improvement', color: chartColors.error[0] };
  }
  return { level: 'unknown', color: chartColors.primary[0] };
};
// --- END STATIC OBJECTS AND HELPER FUNCTIONS ---

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length && payload[0]?.value !== undefined) {
    const value = payload[0].value;
    return (
      <Box bg="white" p={3} borderRadius="lg" boxShadow="lg" border="1px" borderColor="gray.200">
        <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={1}>{label}</Text>
        <Text fontSize="sm" color="purple.600" fontWeight="bold">
          {typeof value === 'number' ? value.toFixed(4) : String(value)}
        </Text>
      </Box>
    );
  }
  return null;
};

const CurrentMetricsChart = memo(function CurrentMetricsChart({ latest_metrics, modelName }: Props) {
  // Move all hooks outside conditional statements
  const { isOpen, onOpen, onClose } = useDisclosure();
  const modalBg = useColorModeValue('white', 'gray.800');
  const [isLoading, setIsLoading] = useState(false);

  const isRegression = useMemo(() => {
    if (!latest_metrics) return false;
    return latest_metrics.hasOwnProperty('rmse');
  }, [latest_metrics]);

  const chartData = useMemo(() => {
    if (!latest_metrics) return [];
    
    const data: { name: string; value: number; color: string; category: string; level: string; }[] = [];
    
    const addMetric = (key: string, name: string, category: string) => {
      const value = latest_metrics[key];
      if (typeof value === 'number' && !isNaN(value)) {
        const perf = getPerformanceLevel(key, value, isRegression);
        data.push({ name, value, color: perf.color, category, level: perf.level });
      } else if (value !== undefined) {
        console.warn(`Invalid metric value for ${key} in CurrentMetricsChart. Using 0.`);
        const perf = getPerformanceLevel(key, 0, isRegression);
        data.push({ name, value: 0, color: perf.color, category, level: perf.level });
      }
    };

    if (isRegression) {
      addMetric('rmse', 'RMSE', 'Error');
      addMetric('r2_score', 'R² Score', 'Performance');
      addMetric('mae', 'MAE', 'Error');
      addMetric('mse', 'MSE', 'Error');
    } else {
      addMetric('accuracy', 'Accuracy', 'Performance');
      addMetric('f1_score', 'F1 Score', 'Performance');
      addMetric('auc', 'AUC', 'Performance');
      addMetric('precision', 'Precision', 'Performance');
      addMetric('recall', 'Recall', 'Performance');
    }
    return data.filter(Boolean);
  }, [latest_metrics, isRegression]);

  const lineData = useMemo(() => chartData.map((item, index) => ({
    metric: item.name,
    value: item.value,
    order: index + 1
  })), [chartData]);

  const radarData = useMemo(() => {
    if (!latest_metrics) return [];
    
    const data: { metric: string; value: number; originalValue: number; }[] = [];
    
    const addRadarMetric = (key: string, metricName: string, normalizeFunc?: (val: number) => number) => {
      const value = latest_metrics[key];
      if (typeof value === 'number' && !isNaN(value)) {
        const normalizedValue = normalizeFunc ? normalizeFunc(value) : value;
        data.push({ metric: metricName, value: normalizedValue, originalValue: value });
      } else if (value !== undefined) {
        console.warn(`Invalid metric value for radar chart ${key} in CurrentMetricsChart. Using 0.`);
      }
    };

    if (isRegression) {
      addRadarMetric('r2_score', 'R² Score', (val) => Math.max(0, Math.min(1, val)));
      addRadarMetric('rmse', 'RMSE Quality', (val) => 1 / (1 + val));
      addRadarMetric('mae', 'MAE Quality', (val) => 1 / (1 + val));
    } else {
      addRadarMetric('accuracy', 'Accuracy');
      addRadarMetric('f1_score', 'F1 Score');
      addRadarMetric('auc', 'AUC');
      addRadarMetric('precision', 'Precision');
      addRadarMetric('recall', 'Recall');
    }
    return data.filter(Boolean);
  }, [latest_metrics, isRegression]);

  const handleOpen = useCallback(() => {
    setIsLoading(true);
    onOpen();
    // Simulate loading for a few seconds
    setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second loading time
  }, [onOpen]);

  const RadarTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as Record<string, unknown>;
      return (
        <Box bg="white" p={3} borderRadius="lg" boxShadow="lg" border="1px" borderColor="gray.200">
          <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={1}>
            {typeof data?.metric === 'string' ? data.metric : 'Unknown'}
          </Text>
          <Text fontSize="sm" color={chartColors.primary[0]} fontWeight="bold">
            Original: {typeof data?.originalValue === 'number' ? data.originalValue.toFixed(4) : 'N/A'}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Normalized: {typeof data?.value === 'number' ? data.value.toFixed(3) : 'N/A'}
          </Text>
        </Box>
      );
    }
    return null;
  };

  // Early return after all hooks
  if (!latest_metrics) {
    return null;
  }

  // Validate that we have at least some valid metrics
  if (chartData.length === 0) {
    return (
      <Button
        leftIcon={<FaChartBar />}
        colorScheme="gray"
        variant="outline"
        size="sm"
        isDisabled
        borderRadius="lg"
      >
        No Metrics Available
      </Button>
    );
  }

  return (
    <>
      <Button
        leftIcon={isLoading ? <Spinner size="sm" /> : <FaChartBar />}
        colorScheme="purple"
        variant="outline"
        size="sm"
        onClick={handleOpen}
        borderRadius="lg"
        isLoading={isLoading}
        loadingText="Loading..."
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'lg'
        }}
        transition="all 0.2s"
      >
        View Metrics Chart
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ borderRadius: '1rem', margin: '1rem' }}
        >
          <ModalContent borderRadius="xl" bg={modalBg} mx={4} maxH="85vh" overflowY="auto">
            <ModalHeader
              bgGradient="linear(to-r, purple.500, pink.500)"
              color="white"
              borderTopRadius="xl"
              py={4}
            >
              <HStack spacing={2}>
                <FaChartLine size="20px" />
                <Text fontSize="lg" fontWeight="bold" isTruncated>
                  {modelName} - Performance Analytics
                </Text>
                <Badge colorScheme="whiteAlpha" variant="solid" ml={2}>
                  {isRegression ? 'Regression' : 'Classification'}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="white" />
            
            <ModalBody p={6}>
              <Tabs variant="enclosed" colorScheme="purple" size="lg">
                <TabList mb={6} flexWrap="wrap">
                  <Tab>
                    <HStack spacing={2}>
                      <FaChartBar />
                      <Text>Bar Chart</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <FaChartLine />
                      <Text>Line Chart</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <FaChartArea />
                      <Text>Radar View</Text>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack spacing={2}>
                      <FaTachometerAlt />
                      <Text>Gauges</Text>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel p={0}>
                    <VStack spacing={6}>
                      <HStack spacing={3} align="center">
                        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                          {isRegression ? 'Regression Metrics' : 'Classification Metrics'}
                        </Text>
                        <Badge colorScheme="purple" px={2} py={1} borderRadius="md" fontSize="xs">
                          Latest Results
                        </Badge>
                      </HStack>
                      
                      {chartData.length > 0 ? (
                        <SafeResponsiveContainer width="100%" height={280}>
                          <SafeBarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                            <SafeCartesianGrid strokeDasharray="2 2" stroke="#F7FAFC" strokeOpacity={0.8} />
                            <SafeXAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11, fill: '#718096' }}
                              interval={0}
                              axisLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                              tickLine={{ stroke: '#E2E8F0' }}
                            />
                            <SafeYAxis 
                              domain={isRegression ? [0, 'dataMax + 0.05'] : [0, 1]}
                              tick={{ fontSize: 10, fill: '#718096' }}
                              axisLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                              tickLine={{ stroke: '#E2E8F0' }}
                            />
                            <SafeTooltip content={<CustomTooltip />} />
                            <SafeBar dataKey="value" radius={[6, 6, 0, 0]} stroke="white" strokeWidth={1} maxBarSize={80}>
                              {chartData.map((entry, index) => (
                                <SafeCell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </SafeBar>
                          </SafeBarChart>
                        </SafeResponsiveContainer>
                      ) : (
                        <ChartErrorFallback componentName="Bar Chart (No Data)" />
                      )}

                      <SimpleGrid columns={{ base: 1, md: chartData.length > 3 ? 3 : chartData.length }} spacing={4} w="full" maxW="800px">
                        {chartData.map((metric, index) => (
                          <Box 
                            key={index} 
                            p={4} 
                            bg="gray.50" 
                            borderRadius="lg" 
                            border="1px solid" 
                            borderColor="gray.200"
                            textAlign="center"
                            boxShadow="sm"
                            transition="all 0.2s"
                            _hover={{ 
                              transform: 'translateY(-2px)', 
                              boxShadow: 'md',
                              borderColor: metric.color 
                            }}
                          >
                            <Box w={4} h={4} bg={metric.color} borderRadius="full" mx="auto" mb={2} />
                            <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={1}>
                              {metric.name}
                            </Text>
                            <Text fontSize="xl" fontWeight="bold" color={metric.color}>
                              {metric.value.toFixed(isRegression ? 4 : 3)}
                            </Text>
                            <Badge colorScheme="gray" mt={1} fontSize="xs" px={2}>
                              {metric.category}
                            </Badge>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  <TabPanel p={0}>
                    <VStack spacing={6}>
                      <Text fontSize="lg" fontWeight="semibold" color="gray.700" textAlign="center">
                        Metrics Trend Line
                      </Text>
                      
                      {lineData.length > 0 ? (
                        <SafeResponsiveContainer width="100%" height={350}>
                          <SafeLineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <SafeCartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <SafeXAxis 
                              dataKey="metric" 
                              tick={{ fontSize: 12, fill: '#4A5568' }}
                              axisLine={{ stroke: '#CBD5E0' }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <SafeYAxis 
                              tick={{ fontSize: 11, fill: '#4A5568' }}
                              axisLine={{ stroke: '#CBD5E0' }}
                            />
                            <SafeTooltip content={<CustomTooltip />} />
                            <SafeLine 
                              type="monotone" 
                              dataKey="value" 
                              stroke={chartColors.primary[0]} 
                              strokeWidth={3}
                              dot={{ fill: chartColors.primary[0], strokeWidth: 2, r: 6 }}
                              activeDot={{ r: 8, fill: '#7C3AED' }}
                            />
                          </SafeLineChart>
                        </SafeResponsiveContainer>
                      ) : (
                        <ChartErrorFallback componentName="Line Chart (No Data)" />
                      )}

                      <Box textAlign="center" p={4} bg="blue.50" borderRadius="lg" w="full">
                        <Text fontSize="sm" color="blue.700" fontWeight="semibold" mb={1}>
                          Line Chart Interpretation:
                        </Text>
                        <Text fontSize="xs" color="blue.600">
                          This shows the current value of each metric. Higher points are generally better for 
                          {isRegression ? " R² Score, while lower points are better for error metrics (RMSE, MAE, MSE)." : " all classification metrics."}
                        </Text>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel p={0}>
                    <VStack spacing={6}>
                      <Text fontSize="lg" fontWeight="semibold" color="gray.700" textAlign="center">
                        Performance Radar
                      </Text>
                      
                      {radarData.length > 0 ? (
                        <VStack spacing={4}>
                          <SafeResponsiveContainer width="100%" height={400}>
                            <SafeRadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                              <SafePolarGrid stroke="#E2E8F0" />
                              <SafePolarAngleAxis 
                                dataKey="metric" 
                                tick={{ fontSize: 12, fill: '#4A5568', fontWeight: 'bold' }} 
                              />
                              <SafePolarRadiusAxis 
                                domain={[0, 1]} 
                                tick={{ fontSize: 10, fill: '#718096' }} 
                                axisLine={false}
                              />
                              <SafeRadar
                                dataKey="value"
                                stroke={chartColors.primary[0]}
                                fill={chartColors.primary[0]}
                                fillOpacity={0.3}
                                strokeWidth={4}
                                dot={{ fill: chartColors.primary[0], strokeWidth: 2, r: 6 }}
                              />
                              <SafeTooltip content={<RadarTooltip />} />
                            </SafeRadarChart>
                          </SafeResponsiveContainer>
                          
                          <Box textAlign="center" mt={4} p={4} bg="gray.50" borderRadius="lg">
                            <Text fontSize="sm" color="gray.600" fontWeight="semibold" mb={2}>
                              Normalization Notes:
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {isRegression 
                                ? "Error metrics (RMSE, MAE) are converted to 'Quality' scores using 1/(1+error) for better visualization"
                                : "All classification metrics are shown on their original 0-1 scale"
                              }
                            </Text>
                          </Box>
                        </VStack>
                      ) : (
                        <ChartErrorFallback componentName="Radar Chart (No Data)" />
                      )}
                    </VStack>
                  </TabPanel>

                  <TabPanel p={0}>
                    <VStack spacing={6}>
                      <Text fontSize="lg" fontWeight="semibold" color="gray.700" textAlign="center">
                        Individual Metric Gauges
                      </Text>
                      
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
                        {chartData.map((metric, index) => (
                          <VStack key={index} spacing={4} align="center">
                            <Text fontSize="md" fontWeight="semibold" color="gray.700">
                              {metric.name}
                            </Text>
                            
                            <CircularProgress
                              value={Math.max(0, Math.min(100,
                                metric.name === 'RMSE' || metric.name === 'MAE' || metric.name === 'MSE'
                                  ? (1 / (1 + metric.value)) * 100
                                  : Math.min(metric.value * 100, 100)
                              ))}
                              size="120px"
                              thickness="8px"
                              color={metric.color}
                              trackColor="gray.100"
                            >
                              <CircularProgressLabel fontSize="lg" fontWeight="bold" color={metric.color}>
                                {metric.value.toFixed(3)}
                              </CircularProgressLabel>
                            </CircularProgress>
                            
                            <Badge
                              colorScheme={
                                metric.level === 'excellent' ? 'green' :
                                metric.level === 'good' ? 'blue' :
                                metric.level === 'fair' ? 'yellow' : 'red'
                              }
                              px={3}
                              py={1}
                              borderRadius="full"
                              fontSize="xs"
                              textTransform="capitalize"
                            >
                              {metric.level}
                            </Badge>
                          </VStack>
                        ))}
                      </SimpleGrid>
                      
                      {isRegression && (
                        <Box textAlign="center" mt={6} p={4} bg="orange.50" borderRadius="lg" borderLeft="4px" borderColor="orange.400">
                          <Text fontSize="sm" color="orange.700" fontWeight="semibold" mb={1}>
                            Note for Regression Metrics:
                          </Text>
                          <Text fontSize="xs" color="orange.600">
                            For error metrics (RMSE, MAE, MSE): Lower values are better. 
                            For R² Score: Higher values (closer to 1) are better.
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </motion.div>
      </Modal>
    </>
  );
});

export default CurrentMetricsChart;