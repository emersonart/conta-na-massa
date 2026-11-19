import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F6F0]">
        <p role="status" className="text-sm text-[#495057]">Verificando acesso…</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // No futuro, se houver planos, poderemos adicionar validações aqui:
  // if (user.plan !== 'premium' && window.location.pathname === '/vibe') {
  //   return <Navigate to="/upgrade" replace />
  // }

  return <>{children}</>;
};
