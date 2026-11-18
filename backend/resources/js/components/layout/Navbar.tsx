import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Wheat,
  BookOpen,
  Sliders,
  ChefHat,
  LogOut,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'dashboard';
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'recipes', label: 'Receitas', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ingredients', label: 'Ingredientes', icon: <Wheat className="w-4 h-4" /> },
    { id: 'settings', label: 'Custos & Margens', icon: <Sliders className="w-4 h-4" /> },
    {
      id: 'vibe',
      label: 'Assistente',
      icon: <ChefHat className="w-4 h-4" />,
    },
  ];

  const handleTabClick = (tabId: string) => {
    navigate(`/${tabId}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-[#E5DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer select-none"
          >
            <Logo size="md" />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F0EAE1]/70 p-1.5 rounded-xl border border-[#E5DDD0]/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#212529] shadow-xs border border-[#E5DDD0]'
                      : 'text-slate-600 hover:text-[#212529] hover:bg-white/50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User & Quick Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/recipes?new=true')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nova Receita
            </Button>

            <div className="h-6 w-px bg-[#E5DDD0]" />

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#212529] leading-tight truncate max-w-[120px]">
                  {user?.name || 'Chef'}
                </p>
                <button
                  onClick={() => logout()}
                  className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3 h-3" /> Sair
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleTabClick('vibe')}
              className="p-2 rounded-xl bg-orange-100 text-[#E85D04] border border-orange-200 text-xs font-bold flex items-center gap-1.5"
            >
              <ChefHat className="w-4 h-4" />
              <span>Assistente</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl border border-[#E5DDD0] bg-white text-slate-700 hover:bg-slate-50"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5DDD0] bg-[#FDFBF7] p-4 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#E85D04] text-white shadow-xs'
                    : 'bg-white text-slate-800 border border-[#E5DDD0]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-[#E5DDD0] flex items-center justify-between px-2">
            <span className="text-xs font-medium text-slate-600">Conectado como {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => logout()} leftIcon={<LogOut className="w-4 h-4 text-rose-500" />}>
              Sair
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
