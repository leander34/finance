import { useQuery } from '@tanstack/react-query'
import { getCookie } from 'cookies-next'
import { createContext, type ReactNode, use, useMemo } from 'react'

import {
  getUserProfileHttp,
  type GetUserProfileResponse,
} from '@/http/auth/user/get-user-profile-http'

interface AuthContextType {
  isAuthPending: boolean
  user: GetUserProfileResponse['user'] | null
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthContextProviderProps {
  children: ReactNode
}
export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const { data, isLoading: isAuthPending } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      // await fakeDelay(2000)
      return getUserProfileHttp()
    },
    enabled: !!getCookie('access_token'),
  })

  console.log('data')
  console.log(data)

  const user = useMemo(() => {
    return data ? data.user : null
  }, [data])

  return (
    <AuthContext.Provider value={{ user, isAuthPending }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = use(AuthContext)
  if (context === null) {
    throw new Error('useAuth needs to be used within an AuthContext')
  }

  return context
}
