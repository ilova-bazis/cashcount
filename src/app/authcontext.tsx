'use client'
import { createContext, useContext} from "react";
import { useLocalStorage } from './hooks/useLocalStorage'
import ClientOnly from './components/ClientOnly'

export interface User {
    username: string;
    password: string;
}

export interface AuthContextType {
    auth: User | null;
    setAuth: (user: User | null) => void;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

export interface LoginCredentials{
    username: string;
    password: string;
}

export interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const { value: auth, setValue: setAuth, isLoading } = useLocalStorage<User | null>('auth', null)

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
        const result = await fetch(`${BASE_URL}/api/login`, {
            headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) }
        })
        if (!result.ok) {
            throw new Error('Login failed')
        }

        setAuth({ username: credentials.username, password: credentials.password })
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setAuth(null)
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const value = {
    auth,
    setAuth,
    login,
    logout,
    isLoading
  }

  return (
    <ClientOnly>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </ClientOnly>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}