// modelwhiz-frontend/src/components/ModelRadarChart.tsx
'use client';
import { Model } from '@/types';
import { Box, VStack, Text, Center, Spinner, Skeleton } from '@chakra-ui/react';
import { Suspense, lazy, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';

// --- OPTIMIZED RECHARTS IMPORTS - SINGLE BUNDLE ---
// @ts-ignore
const RadarChart = dynamic(() => import('recharts').then(mod => ({ default: mod.RadarChart })), { 
  ssr: false,
  loading: () => <Skeleton height="350px" borderRadius="lg" />
});
// @ts-ignore
const PolarGrid = dynamic(() => import('recharts').then(mod => ({ default: mod.PolarGrid })), { ssr: false });
// @ts-ignore
const PolarAngleAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.PolarAngleAxis })), { ssr: false });
// @ts-ignore
const PolarRadiusAxis = dynamic(() => import('recharts').then(mod => ({ default: mod.PolarRadiusAxis })), { ssr: false });
// @ts-ignore
const Radar = dynamic(() => import('recharts').then(mod => ({ default: mod.Radar })), { ssr: false });
// @ts-ignore
const Legend = dynamic(() => import('recharts').then(mod => ({ default: mod.Legend })), { ssr: false });
// @ts-ignore
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), { ssr: false });
// @ts-ignore
const Tooltip = dynamic(() => import('recharts').then(mod => ({ default: mod.Tooltip })), { ssr: false });

const ChartErrorFallback = ({ componentName = "chart" }: { componentName?: string }) => (
  <VStack p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200" h="100%" justifyContent="center">
    <Text color="red.700" fontWeight="bold">Error loading {componentName}.</Text>
    <Text color="red.600" fontSize="sm">Please check models' data and try again.</Text>
  </VStack>
);

type Props = {
  models: [Model, Model];
};

const ModelRadarChart = memo(function ModelRadarChart({ models }: Props) {
  const [modelA, modelB] = models;
  const isRegression = useMemo(() => modelA.task_type === 'regression', [modelA.task_type]);

  const subjects = useMemo(() => isRegression
    ? [{ key: 'rmse', label: 'RMSE' }, { key: 'r2_score', label: 'R² Score' }]
    : [{ key: 'accuracy', label: 'Accuracy' }, { key: 'f1_score', label: 'F1 Score' }, { key: 'auc', label: 'AUC' }]
  , [isRegression]);

  // Data validation and preparation
  const data = useMemo(() => {
    return subjects.map(({ key, label }) => {
      const valueA = modelA.latest_metrics?.[key];
      const valueB = modelB.latest_metrics?.[key];

      // Validate that values are numbers and not NaN
      const validatedValueA = (typeof valueA === 'number' && !isNaN(valueA)) ? valueA : 0;
      const validatedValueB = (typeof valueB === 'number' && !isNaN(valueB)) ? valueB : 0;

      if ((valueA !== undefined && typeof valueA !== 'number') || (valueB !== undefined && typeof valueB !== 'number')) {
          console.warn(`Invalid metric value encountered for ${label} in radar chart. Using 0.`);
      }

      return {
        subject: label,
        valueA: validatedValueA,
        valueB: validatedValueB,
      };
    });
  }, [subjects, modelA.latest_metrics, modelB.latest_metrics]);

  if (data.length === 0 || !(modelA && modelB)) {
    return (
      <ChartErrorFallback componentName="Radar Chart (No Data/Invalid Models)" />
    );
  }

  return (
    <Box w="100%" h="350px">
      <Suspense fallback={<Skeleton height="350px" borderRadius="lg" />}>
        {/* @ts-ignore */}
        <ResponsiveContainer width="100%" height="100%">
          {/* @ts-ignore */}
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" reversed={false} scale={'time'} />
            <PolarRadiusAxis domain={isRegression ? undefined : [0, 1]} />
            <Tooltip formatter={(val: any) => typeof val === 'number' ? val.toFixed(4) : val} />
            <Legend />
            <Radar name={`${modelA.name} v${modelA.version}`} dataKey="valueA" stroke="#3182ce" fill="#3182ce" fillOpacity={0.6} />
            <Radar name={`${modelB.name} v${modelB.version}`} dataKey="valueB" stroke="#38a169" fill="#38a169" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </Suspense>
    </Box>
  );
});

export default ModelRadarChart;