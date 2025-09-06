'use client';

import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Heading, Text, VStack, HStack, Icon } from '@chakra-ui/react';
import { FaRocket, FaBrain, FaChartLine, FaUpload } from 'react-icons/fa';

const MainContent = memo(function MainContent() {
  const router = useRouter();

  const handleDashboardClick = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const handleUploadClick = useCallback(() => {
    router.push('/upload');
  }, [router]);

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #f8f7ff, #E6D8FD, #f8f7ff)">
      <VStack spacing={12} py={20} px={8} textAlign="center">
        <VStack spacing={6}>
          <Icon as={FaBrain} boxSize="80px" color="purple.500" />
          <Heading size="2xl" color="purple.700" fontWeight="bold">
            🚀 ModelWhiz Dashboard
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl">
            Evaluate, compare, and optimize your machine learning models with comprehensive metrics and insights
          </Text>
        </VStack>

        <VStack spacing={6} w="full" maxW="4xl">
          <HStack spacing={6} flexWrap="wrap" justify="center">
            <Button
              size="lg"
              colorScheme="purple"
              leftIcon={<FaRocket />}
              onClick={handleDashboardClick}
              borderRadius="xl"
              px={8}
              py={6}
              fontSize="lg"
            >
              Go to Dashboard
            </Button>
            <Button
              size="lg"
              variant="outline"
              colorScheme="purple"
              leftIcon={<FaUpload />}
              onClick={handleUploadClick}
              borderRadius="xl"
              px={8}
              py={6}
              fontSize="lg"
            >
              Upload Model
            </Button>
          </HStack>

          <HStack spacing={8} flexWrap="wrap" justify="center" pt={8}>
            <VStack spacing={3} minW="200px">
              <Icon as={FaBrain} boxSize="40px" color="purple.500" />
              <Text fontWeight="bold" color="purple.700">Smart Evaluation</Text>
              <Text fontSize="sm" color="gray.600">Automated ML model assessment</Text>
            </VStack>
            <VStack spacing={3} minW="200px">
              <Icon as={FaChartLine} boxSize="40px" color="pink.500" />
              <Text fontWeight="bold" color="pink.700">Performance Metrics</Text>
              <Text fontSize="sm" color="gray.600">Comprehensive model analysis</Text>
            </VStack>
            <VStack spacing={3} minW="200px">
              <Icon as={FaUpload} boxSize="40px" color="green.500" />
              <Text fontWeight="bold" color="green.700">Easy Upload</Text>
              <Text fontSize="sm" color="gray.600">Simple model submission</Text>
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
});

export default MainContent;
