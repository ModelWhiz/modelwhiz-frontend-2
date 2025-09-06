'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
// import { Session, User } from '@supabase/supabase-js'

// Mock types for development
type Session = any;
type User = any;

type AuthInfo = {
  session: Session | null
  user: User | null
  user_id: string | null
}

const AuthContext = createContext<AuthInfo>({
  session: null,
  user: null,
  user_id: null,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    session: null,
    user: null,
    user_id: null,
  })

  useEffect(() => {
    // Simplified auth for development - skip Supabase calls
    // supabase.auth.getSession().then(({ data }) => {
    //   const session = data.session ?? null
    //   const user = session?.user ?? null
    //   setAuthInfo({
    //     session,
    //     user,
    //     user_id: user?.id ?? null,
    //   })
    // })

    // const {
    //   data: { subscription },
    // } = supabase.auth.onAuthStateChange((_event, session) => {
    //   const user = session?.user ?? null
    //   setAuthInfo({
    //     session,
    //     user,
    //     user_id: user?.id ?? null,
    //   })
    // })

    // return () => subscription.unsubscribe()
    
    // Set mock user for development
    setAuthInfo({
      session: null,
      user: { id: 'dev-user-123' },
      user_id: 'dev-user-123',
    });
  }, [])

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
