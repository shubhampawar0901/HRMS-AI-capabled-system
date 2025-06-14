import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook for authentication
 * Provides access to auth context and helper methods
 */
export const useAuth = () => {
  const context = useAuthContext();
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
