// components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useAuth } from '../authcontext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { auth, isLoading } = useAuth();


  useEffect(() => {
    if (!isLoading && !auth) {
        window.location.href = '/login';
    }
  }, [auth, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return auth ? <>{children}</> : null;
}