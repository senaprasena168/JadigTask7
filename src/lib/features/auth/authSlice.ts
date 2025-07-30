import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  user: {
    username: string
    email: string
    role: string
  } | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ username: string; email: string; role: string }>) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        const authData = {
          isAuthenticated: true,
          user: action.payload
        }
        localStorage.setItem('auth', JSON.stringify(authData))
        
        // Also set a cookie for server-side middleware
        document.cookie = `auth=${JSON.stringify(authData)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.loading = false
      state.error = null
      
      // Remove from localStorage and cookies
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth')
        // Clear the auth cookie
        document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    },
    initializeAuth: (state) => {
      // Initialize auth state from localStorage on app start
      if (typeof window !== 'undefined') {
        const storedAuth = localStorage.getItem('auth')
        if (storedAuth) {
          try {
            const parsedAuth = JSON.parse(storedAuth)
            if (parsedAuth.isAuthenticated && parsedAuth.user) {
              state.isAuthenticated = true
              state.user = parsedAuth.user
              
              // Also set the cookie for server-side middleware
              document.cookie = `auth=${JSON.stringify(parsedAuth)}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
            }
          } catch (error) {
            // Invalid stored data, clear it
            console.warn('Failed to parse stored auth data:', error)
            localStorage.removeItem('auth')
          }
        }
      }
    }
  }
})

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  initializeAuth 
} = authSlice.actions

export default authSlice.reducer