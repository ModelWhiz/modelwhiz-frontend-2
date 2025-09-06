'use client';

import { Box, Text, VStack } from '@chakra-ui/react';

export default function CompareContent() {
  return (
    <Box p={8} textAlign="center">
      <VStack spacing={4}>
        <Text fontSize="lg" color="gray.600">
          Compare Content Component
        </Text>
        <Text fontSize="sm" color="gray.500">
          This component is ready for implementation
        </Text>
      </VStack>
    </Box>
  );
}