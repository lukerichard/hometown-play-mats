import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Re-export the useAuth hook from AuthContext for convenience
export const useAuth = useAuthContext;

export default useAuth;
