'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, VStack, Heading, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.50"
          p={4}
        >
          <VStack spacing={6} maxW="md" textAlign="center">
            <Box p={4} borderRadius="full" bg="red.100">
              <FaExclamationTriangle size="48px" color="#E53E3E" />
            </Box>
            
            <VStack spacing={3}>
              <Heading size="lg" color="red.600">
                Something went wrong
              </Heading>
              <Text color="gray.600">
                We encountered an unexpected error. Please try refreshing the page.
              </Text>
            </VStack>

            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontSize="sm" fontWeight="bold">
                  Error Details:
                </Text>
                <Text fontSize="xs" mt={1}>
                  {this.state.error?.message || 'Unknown error occurred'}
                </Text>
              </Box>
            </Alert>

            <VStack spacing={3}>
              <Button
                leftIcon={<FaRedo />}
                colorScheme="red"
                onClick={this.handleRetry}
                size="lg"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                size="md"
              >
                Refresh Page
              </Button>
            </VStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
