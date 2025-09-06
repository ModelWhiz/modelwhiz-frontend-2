'use client'

import { Box, Container, VStack, HStack, Heading, Text, Button, Card, CardBody, Input, InputGroup, InputLeftElement, useToast } from '@chakra-ui/react';
import { AtSignIcon, LockIcon } from '@chakra-ui/icons';
import { useState, useCallback, memo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const LoginPage = memo(function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleLogin = useCallback(async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          status: 'error',
        })
      } else {
        toast({
          title: 'Login successful!',
          status: 'success',
        })
        router.push('/dashboard')
      }
    } catch (err) {
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred',
        status: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [email, password, toast, router])

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-r, teal.400, purple.500, pink.400)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={6}
    >
      <Container maxW="5xl">
        <Card
          bg="rgba(255, 255, 255, 0.15)"
          backdropFilter="blur(15px)"
          shadow="2xl"
          borderRadius="2xl"
          border="1px solid rgba(255,255,255,0.2)"
        >
          <CardBody p={{ base: 6, md: 10 }}>
            <HStack spacing={10} align="center" justify="space-between" flexDir={{ base: "column", md: "row" }}>
              
              {/* Left Section */}
              <VStack spacing={4} align="start" maxW="sm">
                <Heading size="2xl" color="white" fontWeight="extrabold">
                  Welcome Back 👋
                </Heading>
                <Text color="whiteAlpha.800" fontSize="lg">
                  Sign in to <b>ModelWhiz</b> and continue building smarter ML workflows 🚀
                </Text>
              </VStack>

              {/* Right Section (Form) */}
              <Box bg="white" p={8} borderRadius="xl" shadow="lg" w={{ base: "full", md: "sm" }}>
                <VStack spacing={6} w="full">
                  <Heading size="lg" color="gray.800">
                    Login
                  </Heading>

                  {/* Email */}
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AtSignIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{
                        borderColor: "teal.500",
                        boxShadow: "0 0 0 1px #4FD1C7"
                      }}
                    />
                  </InputGroup>

                  {/* Password */}
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <LockIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{
                        borderColor: "teal.500",
                        boxShadow: "0 0 0 1px #4FD1C7"
                      }}
                    />
                  </InputGroup>

                  {/* Button */}
                  <Button
                    colorScheme="teal"
                    onClick={handleLogin}
                    size="lg"
                    w="full"
                    borderRadius="lg"
                    bg="teal.500"
                    _hover={{ bg: "teal.600", transform: "translateY(-2px)" }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    fontWeight="semibold"
                    isLoading={isLoading}
                  >
                    Login
                  </Button>

                  <Text fontSize="sm" color="gray.500">
                    Don’t have an account?{" "}
                    <Button
                      variant="link"
                      colorScheme="purple"
                      onClick={() => router.push('/signup')}
                    >
                      Sign Up
                    </Button>
                  </Text>
                </VStack>
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  )
})

export default LoginPage
