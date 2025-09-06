// modelwhiz-frontend/src/contexts/ChakraProvider.tsx
'use client'

import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react'
import { ReactNode } from 'react'

// --- vvv THIS IS THE CHANGE vvv ---
// Create a standalone toast instance that we can export
const { ToastContainer, toast } = createStandaloneToast()
// Export the toast function so we can use it in non-React files
export { toast }
// --- ^^^ THIS IS THE CHANGE ^^^ ---

export default function ChakraWrapper({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider>
      {children}
      {/* --- vvv ADD THIS vvv --- */}
      {/* The ToastContainer is the component that renders the toasts */}
      <ToastContainer />
      {/* --- ^^^ ADD THIS ^^^ --- */}
    </ChakraProvider>
  )
}