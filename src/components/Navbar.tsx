// FILE: src/components/Navbar.tsx (Updated with Purple Color Palette)

'use client'

// --- CHAKRA UI IMPORTS - OPTIMIZED ---
import { Box, Flex, HStack, Heading, Text, Avatar, IconProps, Icon } from '@chakra-ui/react';

// Grouping menu-related components
import {
  Menu, MenuButton, MenuItem, MenuList, MenuDivider, Button
} from '@chakra-ui/react';
// --- END CHAKRA UI IMPORTS - OPTIMIZED ---


import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaHistory } from 'react-icons/fa';
// Removed `FC` import as it's not strictly necessary for simple functional components
// Removed `ModalProps` import as Modal is not used
// Removed `lazy` function definition, as Modal is not used

// Simple icons as SVG components
const UploadIcon = (props : IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
    />
  </Icon>
)

const DashboardIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z"
    />
  </Icon>
)

const CompareIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M19,3H14V5H19V18L14,12V17H19A2,2 0 0,0 21,15V5A2,2 0 0,0 19,3M10,6V12L5,18V5A2,2 0 0,1 7,3H12A2,2 0 0,1 14,5V6H10Z"
    />
  </Icon>
)

const LogoutIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"
    />
  </Icon>
)

export default function Navbar() {
  const router = useRouter()
  const auth = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Box
      bg="linear-gradient(135deg, #f8f7ff, #ffffff)" // Very light purple to white gradient
      shadow="sm"
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom="1px solid"
      borderBottomColor="rgba(229, 228, 225, 0.4)"
    >
      <Flex
        maxW="7xl"
        mx="auto"
        px={6}
        py={4}
        justify="space-between"
        align="center"
      >
        {/* Logo/Brand - Clickable to dashboard */}
        <Box
          as="button"
          onClick={() => router.push('/dashboard')}
          cursor="pointer"
          _hover={{
            transform: "translateY(-1px)",
            transition: "transform 0.2s"
          }}
        >
          <HStack spacing={4}>
            <Box
              bg="purple.500"
              color="white"
              p={2}
              borderRadius="lg"
              fontWeight="bold"
              fontSize="lg"
              shadow="sm"
            >
              MW
            </Box>
            <Heading 
              size="lg" 
              color="purple.700"
              fontWeight="bold"
              letterSpacing="tight"
            >
              ModelWhiz
            </Heading>
          </HStack>
        </Box>

        {/* User Menu */}
        <Menu>
          <MenuButton
            as={Button}
            rounded="full"
            variant="ghost"
            cursor="pointer"
            minW={0}
            _hover={{
              bg: "purple.100" // Light purple hover
            }}
            _active={{
              bg: "purple.200"
            }}
            transition="all 0.2s"
          >
            <HStack spacing={2}>
              <Avatar 
                name={auth?.user?.email ?? 'User'} 
                size="sm"
                bg="purple.100"
                color="purple.600"
              />
              <Text 
                color="purple.700" 
                fontSize="sm" 
                fontWeight="medium"
                display={{ base: "none", md: "block" }}
              >
                {auth?.user?.email?.split('@')[0] ?? 'User'}
              </Text>
            </HStack>
          </MenuButton>
          
          <MenuList
            bg="white"
            borderColor="rgba(229, 228, 225, 0.6)"
            shadow="xl"
            border="1px"
            borderRadius="xl"
            py={2}
            minW="200px"
          >
            {/* User Info */}
            <Box px={4} py={2} mb={2}>
              <Text fontSize="sm" fontWeight="semibold" color="purple.800">
                Signed in as
              </Text>
              <Text fontSize="sm" color="gray.600" isTruncated>
                {auth?.user?.email ?? 'Loading...'}
              </Text>
            </Box>
            
            <MenuDivider borderColor="rgba(229, 228, 225, 0.6)" />
            
            {/* Navigation Items */}
            <MenuItem
              onClick={() => router.push('/dashboard')}
              color="gray.700"
              _hover={{ bg: "#f8f7ff", color: "purple.600" }} // Light purple hover
              _focus={{ bg: "#f8f7ff", color: "purple.600" }}
              icon={<DashboardIcon />}
              fontSize="sm"
              fontWeight="medium"
            >
              Dashboard
            </MenuItem>
            
            <MenuItem
                onClick={() => router.push('/dashboard/evaluations')}
                icon={<Icon as={FaHistory} />}
                fontSize="sm"
                fontWeight="medium"
                color="gray.700"
                _hover={{ bg: "#f8f7ff", color: "purple.600" }}
                _focus={{ bg: "#f8f7ff", color: "purple.600" }}
              >
                Evaluation History
            </MenuItem>

            <MenuItem
              onClick={() => router.push('/upload')}
              color="gray.700"
              _hover={{ bg: "#f8f7ff", color: "purple.600" }}
              _focus={{ bg: "#f8f7ff", color: "purple.600" }}
              icon={<UploadIcon />}
              fontSize="sm"
              fontWeight="medium"
            >
              Upload Model
            </MenuItem>

            <MenuItem
              onClick={() => router.push('/compare')}
              color="gray.700"
              _hover={{ bg: "#f8f7ff", color: "purple.600" }}
              _focus={{ bg: "#f8f7ff", color: "purple.600" }}
              icon={<CompareIcon />}
              fontSize="sm"
              fontWeight="medium"
            >
              Compare Models
            </MenuItem>
            
            <MenuDivider borderColor="rgba(229, 228, 225, 0.6)" />
            
            <MenuItem
              onClick={handleLogout}
              color="red.600"
              _hover={{ bg: "red.50", color: "red.700" }}
              _focus={{ bg: "red.50", color: "red.700" }}
              icon={<LogoutIcon />}
              fontSize="sm"
              fontWeight="medium"
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  )
}