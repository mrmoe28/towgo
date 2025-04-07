import { createContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define user type
export interface User {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
  avatar: string | null;
  subscriptionTier: string;
}

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Create auth context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is authenticated on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // First, try logging in with the credentials
      console.log('Attempting login with username:', username);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      console.log('Login response status:', response.status);
      
      // Check if the response was successful
      if (!response.ok) {
        // For JSON responses with error messages
        if (response.headers.get('content-type')?.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || data.message || 'Login failed');
        }
        throw new Error(`Login failed with status: ${response.status}`);
      }
      
      // For successful responses, check auth status
      const authStatus = await checkAuth();
      
      if (!authStatus) {
        console.log('Login appears successful but unable to verify user session');
        throw new Error('Failed to retrieve user information after login');
      }
      
      toast({
        title: "Login Successful",
        description: "You have been successfully logged in.",
      });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // Use the correct endpoint with GET method as defined in the backend
      const response = await fetch('/api/auth/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      // Navigate to login page after logout
      window.location.href = '/login';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced authentication status check
  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Checking authentication status...');
      
      // Use the correct endpoint for current user with timestamp to avoid caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/auth/current-user?_t=${timestamp}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('Auth check response status:', response.status);
      
      if (!response.ok) {
        if (response.status !== 401) { // 401 is expected if not authenticated
          console.error('Unexpected error status during auth check:', response.status);
          toast({
            title: "Error",
            description: "Failed to check authentication status.",
            variant: "destructive",
          });
        } else {
          console.log('User is not authenticated (401 response)');
        }
        setUser(null);
        return false;
      }

      // Parse response data
      const data = await response.json();
      console.log('Auth check response data:', data);
      
      // Handle different response formats
      // Server may return { user: {...} } or { success: true, user: {...} }
      if (data.user) {
        console.log('User authenticated:', data.user);
        setUser(data.user);
        return true;
      } else {
        console.log('No valid user in response:', data);
        setUser(null);
        
        // Show toast for authentication issues if there's an error message
        if (data.message || data.error) {
          toast({
            title: "Authentication Error",
            description: data.message || data.error,
            variant: "destructive",
          });
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      
      // Don't show toast on every failed check to avoid spamming the user
      // with notifications during initial loading
      const isNetworkError = error instanceof TypeError && error.message.includes('NetworkError');
      
      if (!isNetworkError) {
        toast({
          title: "Connection Error",
          description: "Failed to connect to authentication service.",
          variant: "destructive",
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}