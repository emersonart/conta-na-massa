import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/recipes/')) return 'Ficha Técnica';
    if (pathname.startsWith('/recipes')) return 'Receitas & Fichas';
    if (pathname.startsWith('/ingredients')) return 'Despensa de Insumos';
    if (pathname.startsWith('/settings')) return 'Custos & Margens';
    if (pathname.startsWith('/account')) return 'Minha conta';
    if (pathname.startsWith('/vibe')) return 'Assistente de Custos';
    return 'Painel de Produção';
  };

  const title = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 bg-[#F8F6F0]/90 backdrop-blur-md border-b border-[#E5DDD0]/70 lg:bg-[#F8F6F0]/60 lg:backdrop-blur-xs">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-4">
        {/* Mobile Left: Menu Toggle + Logo + Title */}
        <div className="flex items-center gap-3 lg:hidden min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 text-[#343A40] hover:text-[#212529] rounded-xl border border-[#E5DDD0] bg-white shadow-2xs cursor-pointer active:scale-95 transition-all"
            aria-label="Abrir menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div onClick={() => navigate('/dashboard')} className="cursor-pointer shrink-0">
            <Logo size="sm" showText={false} />
          </div>
          <span className="font-bold font-heading text-sm text-[#212529] truncate">
            {title}
          </span>
        </div>

        {/* Desktop Left: Clean Title / Breadcrumb */}
        <div className="hidden lg:flex items-center gap-3">
          <h1 className="text-xl font-bold font-heading text-[#212529] tracking-tight">
            {title}
          </h1>
          <span className="text-xs text-slate-400 font-medium">
            • Conta na Massa
          </span>
        </div>

        {/* Desktop Right Quick Actions */}
        <div className="hidden lg:flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ingredients')}
          >
            Despensa de Insumos
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/recipes?new=true')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nova Receita
          </Button>
        </div>
      </div>
    </header>
  );
};
