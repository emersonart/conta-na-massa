import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { IngredientsPage } from './pages/IngredientsPage';
import { RecipesPage } from './pages/RecipesPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { CostSettingsPage } from './pages/CostSettingsPage';
import { VibeChatPage } from './pages/VibeChatPage';

function AppContent() {
  const { checkAuth, logout, user, token, isCheckingAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

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

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F6F0]">
        <div className="animate-spin text-[#E85D04] text-4xl">🥐</div>
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

  // Hide Layout on Auth Page
  const isAuthPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col selection:bg-orange-200 selection:text-orange-950">
      {!isAuthPage && <Navbar />}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute><RecipesPage /></ProtectedRoute>} />
          <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetailPage /></ProtectedRoute>} />
          <Route path="/ingredients" element={<ProtectedRoute><IngredientsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><CostSettingsPage /></ProtectedRoute>} />
          <Route path="/vibe" element={<ProtectedRoute><VibeChatPage /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthPage && (
        <footer className="border-t border-[#E5DDD0] bg-[#FDFBF7] py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="flex items-center gap-1.5">
              🥐 <strong>Conta na Massa</strong> — Sistema Open Source de Precificação Gastronômica.
            </p>
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              <span>Laravel 13 + React 19 + PostgreSQL 16</span>
              <span>•</span>
              <span className="text-[#E85D04]">Licença MIT</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export function App() {
  return <AppContent />;
}

export default App;
