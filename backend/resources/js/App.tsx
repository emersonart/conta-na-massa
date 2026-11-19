import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { CostSettingsPage } from './pages/CostSettingsPage';
import { VibeChatPage } from './pages/VibeChatPage';
import { AccountPage } from './pages/AccountPage';
import { PasswordRecoveryPage } from './pages/PasswordRecoveryPage';
import { ConfirmEmailChangePage } from './pages/ConfirmEmailChangePage';
import { setTelemetryUser } from './observability';

function AppContent() {
  const { checkAuth, logout, user, token, isCheckingAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Listen for global unauthorized events to prevent zombie states
    const handleUnauthorized = () => {
      logout();
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [checkAuth, logout, navigate]);

  useEffect(() => {
    // Use an opaque account ID only; never send name, e-mail, or auth token.
    setTelemetryUser(user?.id);
  }, [user?.id]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F6F0]">
        <svg className="animate-spin h-8 w-8 text-[#E85D04]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  // If we are at the root or login page and authenticated, go to dashboard
  if ((location.pathname === '/' || location.pathname === '/login') && token && user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // If we are at the root and NOT authenticated, go to login
  if (location.pathname === '/' && (!token || !user)) {
    return <Navigate to="/login" replace />;
  }

  const isAuthPage = ['/login', '/forgot-password', '/reset-password', '/confirm-email-change'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-[#F8F6F0]">
        {location.pathname === '/login' ? (
          <AuthPage />
        ) : location.pathname === '/confirm-email-change' ? (
          <ConfirmEmailChangePage />
        ) : (
          <PasswordRecoveryPage />
        )}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col selection:bg-orange-200 selection:text-orange-950">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
            <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetailPage /></ProtectedRoute>} />
            <Route path="/ingredients" element={<ProtectedRoute><IngredientsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><CostSettingsPage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/vibe" element={<ProtectedRoute><VibeChatPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return <AppContent />;
}

export default App;
