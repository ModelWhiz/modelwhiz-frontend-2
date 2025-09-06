// modelwhiz-frontend/src/components/ModelComparisonChart.tsx
'use client';

import { Model } from '@/types';
import { Box, VStack, Text, Center, Spinner, Skeleton } from '@chakra-ui/react';
import { useMemo, memo, Suspense } from 'react';
import dynamic from 'next/dynamic';

// --- OPTIMIZED RECHARTS IMPORTS - SINGLE BUNDLE ---
// @ts-ignore
const BarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.BarChart })), { 
  ssr: false,
  loading: () => <Skeleton height="350px" borderRadius="lg" />
});
// @ts-ignore
const Bar = dynamic(() => import('recharts').then(mod => ({ default: mod.Bar })), { ssr: false });
// @ts-ignore
const XAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.XAxis })), { ssr: false });
// @ts-ignore
const YAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.YAxis })), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });
// @ts-ignore
const Legend = dynamic(() => import('recharts').then(mod => ({ default: mod.Legend })), { ssr: false });
// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });
// @ts-ignore
const CartesianGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })), { ssr: false });
// @ts-ignore
const LabelList = dynamic(() => import('recharts').then(mod => ({ default: mod.LabelList })), { ssr: false });

const ChartErrorFallback = ({ componentName = "chart" }: { componentName?: string }) => (
  <VStack p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200" h="100%" justifyContent="center">
    <Text color="red.700" fontWeight="bold">Error loading {componentName}.</Text>
    <Text color="red.600" fontSize="sm">Please check models' data and try again.</Text>
  </VStack>
);

type Props = {
  modelA: Model;
  modelB: Model;
};

const ModelComparisonChart = memo(function ModelComparisonChart({ modelA, modelB }: Props) {
  const isRegression = useMemo(() => modelA.task_type === 'regression', [modelA.task_type]);

  const metrics = useMemo(() => isRegression
    ? [{ key: 'rmse', label: 'RMSE' }, { key: 'r2_score', label: 'R² Score' }]
    : [{ key: 'accuracy', label: 'Accuracy' }, { key: 'f1_score', label: 'F1 Score' }, { key: 'auc', label: 'AUC' }]
  , [isRegression]);

  // Data validation and preparation
  const data = useMemo(() => {
    return metrics.map(({ key, label }) => {
      const valueA = modelA.latest_metrics?.[key];
      const valueB = modelB.latest_metrics?.[key];

      // Validate that values are numbers and not NaN
      const validatedValueA = (typeof valueA === 'number' && !isNaN(valueA)) ? valueA : 0;
      const validatedValueB = (typeof valueB === 'number' && !isNaN(valueB)) ? valueB : 0;

      if ((valueA !== undefined && typeof valueA !== 'number') || (valueB !== undefined && typeof valueB !== 'number')) {
          console.warn(`Invalid metric value encountered for ${label} in comparison chart. Using 0.`);
      }

      return {
        metric: label,
        valueA: validatedValueA,
        valueB: validatedValueB,
      };
    });
  }, [metrics, modelA.latest_metrics, modelB.latest_metrics]);

  if (data.length === 0 || !(modelA && modelB)) {
    return (
      <ChartErrorFallback componentName="Comparison Chart (No Data/Invalid Models)" />
    );
  }

  return (
    <Box w="100%" h="350px">
      <Suspense fallback={<Skeleton height="350px" borderRadius="lg" />}>
        {/* @ts-ignore */}
        <ResponsiveContainer width="100%" height="100%">
          {/* @ts-ignore */}
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis domain={isRegression ? undefined : [0, 1]} />
            <Tooltip formatter={(val: any) => typeof val === 'number' ? val.toFixed(4) : val} />
            <Legend />
            {/* @ts-ignore */}
            <Bar dataKey="valueA" name={`${modelA.name} v${modelA.version}`} fill="#3182ce" radius={[4, 4, 0, 0]}>
              {/* @ts-ignore */}
              <LabelList dataKey="valueA" position="top" formatter={(val: any) => typeof val === 'number' ? val.toFixed(2) : ''} />
            </Bar>
            {/* @ts-ignore */}
            <Bar dataKey="valueB" name={`${modelB.name} v${modelB.version}`} fill="#38a169" radius={[4, 4, 0, 0]}>
              {/* @ts-ignore */}
              <LabelList dataKey="valueB" position="top" formatter={(val: any) => typeof val === 'number' ? val.toFixed(2) : ''} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Suspense>
    </Box>
  );
});

export default ModelComparisonChart;