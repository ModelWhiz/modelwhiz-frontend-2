'use client';

import { Box, Text, VStack, HStack, Spinner, Center } from '@chakra-ui/react';
import { Suspense, lazy, useMemo, memo } from 'react';

// --- RECHARTS DYNAMIC IMPORTS - INDIVIDUAL LAZY LOAD ---
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const Bar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Cell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));
// --- END RECHARTS DYNAMIC IMPORTS ---

const ChartErrorFallback = ({ componentName = "chart" }: { componentName?: string }) => (
  <VStack p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200" minH="200px" justifyContent="center">
    <Text color="red.700" fontWeight="bold">Error loading {componentName}.</Text>
    <Text color="red.600" fontSize="sm">Please try again or check your data.</Text>
  </VStack>
);

type Props = {
  latest_metrics: { [key: string]: number } | null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <Box bg="white" p={3} borderRadius="lg" boxShadow="lg" border="1px" borderColor="gray.200">
        <Text fontSize="sm" fontWeight="bold" color="gray.700">{label}</Text>
        <Text fontSize="sm" color="purple.600" fontWeight="semibold">
          {typeof value === 'number' ? value.toFixed(4) : value}
        </Text>
      </Box>
    );
  }
  return null;
};

const CurrentMetricsInline = memo(function CurrentMetricsInline({ latest_metrics }: Props) {
  if (!latest_metrics) {
    return (
      <Box p={8} textAlign="center" bg="gray.50" borderRadius="lg">
        <Text color="gray.500" fontSize="lg">No metrics available</Text>
        <Text color="gray.400" fontSize="sm" mt={2}>
          Upload and evaluate your model to see performance metrics.
        </Text>
      </Box>
    );
  }

  const isRegression = useMemo(() => latest_metrics.hasOwnProperty('rmse'), [latest_metrics]);

  const chartData = useMemo(() => {
    const data: { name: string; value: number; color: string; }[] = [];

    const addMetric = (key: string, name: string, color: string) => {
      const value = latest_metrics[key];
      if (typeof value === 'number' && !isNaN(value)) {
        data.push({ name, value, color });
      } else if (value !== undefined) {
        console.warn(`Invalid metric value for inline chart ${key}:`, value);
      }
    };

    if (isRegression) {
      addMetric('rmse', 'RMSE', '#E53E3E');
      addMetric('r2_score', 'R² Score', '#38A169');
    } else {
      addMetric('accuracy', 'Accuracy', '#8B5CF6');
      addMetric('f1_score', 'F1 Score', '#3B82F6');
      addMetric('auc', 'AUC', '#10B981');
    }
    return data.filter(Boolean); // Filter out any undefined entries in case of invalid data
  }, [latest_metrics, isRegression]);

  if (chartData.length === 0) {
    return (
      <Box p={8} textAlign="center" bg="gray.50" borderRadius="lg">
        <Text color="red.500" fontSize="lg" fontWeight="bold">Error: No valid metrics to display.</Text>
        <Text color="gray.400" fontSize="sm" mt={2}>
          Please check the model's latest metrics.
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="md" fontWeight="semibold" color="gray.700" textAlign="center">
        Current {isRegression ? 'Regression' : 'Classification'} Metrics
      </Text>
      
      <Suspense fallback={<Center h="250px"><Spinner size="lg" color="purple.500" /><Text ml={3}>Loading Chart...</Text></Center>}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={isRegression ? [0, (dataMax: number) => dataMax * 1.1] : [0, 1]}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Suspense>

      {/* Metrics Summary */}
      <HStack spacing={6} justify="center" flexWrap="wrap">
        {chartData.map((metric, index) => (
          <VStack key={index} spacing={1}>
            <Box w={3} h={3} bg={metric.color} borderRadius="full" />
            <Text fontSize="xs" fontWeight="semibold" textAlign="center">{metric.name}</Text>
            <Text fontSize="sm" fontWeight="bold" color={metric.color}>
              {metric.value.toFixed(isRegression ? 4 : 3)}
            </Text>
          </VStack>
        ))}
      </HStack>
    </VStack>
  );
});

export default CurrentMetricsInline;