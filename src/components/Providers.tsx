'use client'

import { Provider } from 'react-redux'
import { useEffect } from 'react'
import { store } from '@/lib/store'
import { initializeAuth } from '@/lib/features/auth/authSlice'

function AuthInitializer() {
  useEffect(() => {
    store.dispatch(initializeAuth())
  }, [])
  
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      {children}
    </Provider>
  )
}

