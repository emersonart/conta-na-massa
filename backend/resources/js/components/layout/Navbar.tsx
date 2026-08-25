import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Wheat,
  BookOpen,
  Sliders,
  Sparkles,
  LogOut,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

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
    { id: 'settings', label: 'Margens & Custos', icon: <Sliders className="w-4 h-4" /> },
    {
      id: 'vibe',
      label: 'Modo Vibe',
      icon: <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />,
      highlight: true,
    },
  ];

  const handleTabClick = (tabId: string) => {
    navigate(`/${tabId}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E5DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#E85D04] to-[#F4A261] flex items-center justify-center text-white text-xl sm:text-2xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              🥐
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold font-heading text-[#212529] tracking-tight flex items-center gap-1.5">
                Conta na Massa
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-orange-100 text-[#E85D04] rounded-md border border-orange-200">
                  Open Source
                </span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Precificação para Confeitaria & Panificação
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F0EAE1]/70 p-1.5 rounded-2xl border border-[#E5DDD0]/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#212529] shadow-sm border border-[#E5DDD0]'
                      : 'text-slate-600 hover:text-[#212529] hover:bg-white/50'
                  } ${item.highlight && !isActive ? 'text-[#E85D04]' : ''}`}
                >
                  {item.icon}
                  {item.label}
                  {item.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E85D04] animate-ping" />
                  )}
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
              <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white font-bold text-xs flex items-center justify-center uppercase shadow-inner">
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

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleTabClick('vibe')}
              className="p-2 rounded-xl bg-orange-100 text-[#E85D04] border border-orange-200 text-xs font-bold flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" /> Vibe
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl border border-[#E5DDD0] bg-white text-slate-700 hover:bg-slate-50"
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#E85D04] text-white shadow-md'
                    : 'bg-white text-slate-800 border border-[#E5DDD0]'
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                {item.highlight && !isActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-[#E85D04] rounded-md">
                    IA
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-[#E5DDD0] flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-slate-600">Conectado como {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => logout()} leftIcon={<LogOut className="w-4 h-4 text-rose-500" />}>
              Sair
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
