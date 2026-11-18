import React from 'react';
import {
  UtensilsCrossed,
  Wheat,
  BookOpen,
  Sliders,
  ChefHat,
  LogOut,
  Plus,
  X,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;
  const { user, logout } = useAuthStore();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Painel',
      icon: <UtensilsCrossed className="w-4 h-4 shrink-0" />,
    },
    {
      path: '/recipes',
      label: 'Receitas & Fichas',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
    },
    {
      path: '/ingredients',
      label: 'Despensa de Insumos',
      icon: <Wheat className="w-4 h-4 shrink-0" />,
    },
    {
      path: '/settings',
      label: 'Custos & Margens',
      icon: <Sliders className="w-4 h-4 shrink-0" />,
    },
    {
      path: '/vibe',
      label: 'Assistente de Custos',
      icon: <ChefHat className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E5DDD0]
          flex flex-col transition-transform duration-200 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-[#E5DDD0]/70 shrink-0">
          <div
            onClick={() => handleNav('/dashboard')}
            className="cursor-pointer select-none"
          >
            <Logo size="sm" />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-4 shrink-0">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center shadow-xs"
            onClick={() => handleNav('/recipes?new=true')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nova Receita
          </Button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Gestão da Produção
          </span>

          {navItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? activePath === '/dashboard'
                : activePath.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left
                  ${
                    isActive
                      ? 'bg-orange-50 text-[#E85D04] font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <span
                  className={
                    isActive ? 'text-[#E85D04]' : 'text-slate-400'
                  }
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout in Footer */}
        <div className="p-3 border-t border-[#E5DDD0]/80 shrink-0 bg-[#FDFBF7]">
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] text-white font-bold text-xs flex items-center justify-center uppercase shrink-0 shadow-2xs">
                {user?.name?.[0] || 'C'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#212529] truncate leading-tight">
                  {user?.name || 'Chef Confeiteiro'}
                </p>
                <p className="text-[11px] text-slate-500 truncate leading-tight">
                  {user?.email || 'Conectado'}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Encerrar sessão"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1 shrink-0"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
