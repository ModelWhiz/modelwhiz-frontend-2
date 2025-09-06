'use client';

import { useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  useToast,
  Container,
  Icon,
  InputGroup,
  InputRightElement,
  Progress,
  Alert,
  AlertIcon,
  Link,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser , FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';

// Dynamic imports for components
// const AlertComponent = lazy(() => import('@chakra-ui/react').then(module => ({ default: module.Alert })));
// const AlertIconComponent = lazy(() => import('@chakra-ui/react').then(module => ({ default: module.AlertIcon })));

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const router = useRouter();
  const toast = useToast();
  
  // Color mode values
  const bgGradient = 'linear(to-r, blue.400, purple.500, pink.400)';
  const cardBg = 'rgba(255, 255, 255, 0.1)';
  const glassBg = 'rgba(255, 255, 255, 0.95)';
  const borderColor = 'rgba(255, 255, 255, 0.2)';

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = passwordStrength <= 2 ? 'red' : passwordStrength <= 3 ? 'orange' : passwordStrength <= 4 ? 'yellow' : 'green';
  const strengthText = passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Fair' : passwordStrength <= 4 ? 'Good' : 'Strong';

  // Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Password is too weak';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to verify your account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to login page
      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient} display="flex" alignItems="center" justifyContent="center" p={4}>
      <Container maxW="6xl">
        <Box
          bg={cardBg}
          borderRadius="2xl"
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={borderColor}
          shadow="2xl"
          overflow="hidden"
          display="flex"
          minH="600px"
        >
          {/* Left Section - Welcome Message */}
          <Box
            flex="2"
            bg={cardBg}
            p={12}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            position="relative"
          >
            <VStack spacing={6} align="start">
              <Heading size="2xl" color="white" fontWeight="bold">
                Welcome to ModelWhiz
              </Heading>
              <Text fontSize="6xl">👋</Text>
              <Text color="white" fontSize="lg" lineHeight="tall">
                Create your account and start building smarter ML workflows 🚀
              </Text>
            </VStack>
          </Box>

          {/* Right Section - Signup Form */}
          <Box
            flex="1.5"
            bg={glassBg}
            p={12}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <VStack spacing={8} align="stretch">
              <VStack spacing={2} align="start">
                <Heading size="lg" color="gray.800">
                  Sign Up
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Join our community of ML enthusiasts
                </Text>
              </VStack>
              
              <VStack spacing={6}>
                {/* Full Name */}
                <FormControl isInvalid={!!errors.fullName}>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Full Name
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      borderColor="gray.300"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    />
                  </InputGroup>
                  {errors.fullName && (
                    <Text color="red.500" fontSize="xs" mt={1}>
                      {errors.fullName}
                    </Text>
                  )}
                </FormControl>

                {/* Email */}
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Email Address
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      borderColor="gray.300"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    />
                  </InputGroup>
                  {errors.email && (
                    <Text color="red.500" fontSize="xs" mt={1}>
                      {errors.email}
                    </Text>
                  )}
                </FormControl>

                {/* Password */}
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      borderColor="gray.300"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    />
                    <InputRightElement>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        _hover={{ bg: 'transparent' }}
                      >
                        <Icon as={showPassword ? FiEyeOff : FiEye} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <VStack spacing={2} mt={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.500">
                          Password strength:
                        </Text>
                        <Text fontSize="xs" color={`${strengthColor}.500`} fontWeight="medium">
                          {strengthText}
                        </Text>
                      </HStack>
                      <Progress
                        value={(passwordStrength / 5) * 100}
                        colorScheme={strengthColor}
                        size="sm"
                        borderRadius="full"
                      />
                      <HStack spacing={4} fontSize="xs" color="gray.500">
                        <HStack spacing={1}>
                          <Icon as={password.length >= 8 ? FiCheckCircle : undefined} color={password.length >= 8 ? 'green.500' : 'gray.300'} />
                          <Text>8+ characters</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={/[A-Z]/.test(password) ? FiCheckCircle : undefined} color={/[A-Z]/.test(password) ? 'green.500' : 'gray.300'} />
                          <Text>Uppercase</Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Icon as={/[0-9]/.test(password) ? FiCheckCircle : undefined} color={/[0-9]/.test(password) ? 'green.500' : 'gray.300'} />
                          <Text>Number</Text>
                        </HStack>
                      </HStack>
                    </VStack>
                  )}
                  
                  {errors.password && (
                    <Text color="red.500" fontSize="xs" mt={1}>
                      {errors.password}
                    </Text>
                  )}
                </FormControl>

                {/* Confirm Password */}
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel fontSize="sm" fontWeight="medium">
                    Confirm Password
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      borderColor="gray.300"
                      _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    />
                    <InputRightElement>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        _hover={{ bg: 'transparent' }}
                      >
                        <Icon as={showConfirmPassword ? FiEyeOff : FiEye} />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {errors.confirmPassword && (
                    <Text color="red.500" fontSize="xs" mt={1}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </FormControl>

                {/* Signup Button */}
                <Button
                  w="full"
                  colorScheme="teal"
                  size="lg"
                  onClick={handleSignup}
                  isLoading={loading}
                  loadingText="Creating Account..."
                  rightIcon={<FiArrowRight />}
                  _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Create Account
                </Button>

                {/* Terms and Privacy */}
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  By creating an account, you agree to our{' '}
                  <Link color="blue.500" href="/terms" textDecoration="underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link color="blue.500" href="/privacy" textDecoration="underline">
                    Privacy Policy
                  </Link>
                </Text>
              </VStack>

              {/* Login Link */}
              <HStack spacing={1} fontSize="sm" justify="center">
                <Text color="gray.600">
                  Already have an account?
                </Text>
                <Link
                  href="/login"
                  color="purple.500"
                  fontWeight="medium"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Sign in here
                </Link>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
