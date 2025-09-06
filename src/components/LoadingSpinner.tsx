import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  minHeight?: string;
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'lg', 
  color = 'purple.500',
  minHeight = '200px'
}: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight={minHeight}
      p={4}
    >
      <VStack spacing={4}>
        <Spinner
          size={size}
          color={color}
          thickness="4px"
          speed="0.65s"
        />
        <Text color="gray.600" fontSize="sm">
          {message}
        </Text>
      </VStack>
    </Box>
  );
}
