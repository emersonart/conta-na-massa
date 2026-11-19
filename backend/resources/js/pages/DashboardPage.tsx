import React, { useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  BookOpen,
  Wheat,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  PieChart,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Recipe } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await apiClient.get('/dashboard/summary');
        setSummary(response.data);
      } catch (e) {
        console.error('Failed to load dashboard summary', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading || !summary) {
    return (
      <div className="flex h-64 items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#E85D04]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  const { metrics, recent_recipes, settings } = summary;
  const totalRecipes = metrics.total_recipes;
  const totalIngredients = metrics.total_ingredients;
  const avgProfit = metrics.avg_profit_margin;
  const recipes = recent_recipes;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Executive Welcome & Status Banner */}
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5DDD0] p-5 sm:p-6 shadow-warm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#495057] font-heading">
                Produção em Dia
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-[#212529] tracking-tight">
              Painel de Custos & Produção
            </h2>
            <p className="text-xs sm:text-sm text-[#495057] mt-1">
              Monitore os custos unitários, preços sugeridos e margens das suas receitas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
            >
              Taxas: {settings.overhead_pct}% fixo • {settings.profit_margin_pct}% lucro
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
      </div>

      {/* 4 Distinct KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Receitas */}
        <div
          onClick={() => navigate('/recipes')}
          className="bg-white rounded-2xl border border-[#E5DDD0] p-5 shadow-warm hover:shadow-warm-md hover:border-[#E85D04]/60 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#495057] font-heading uppercase tracking-wider">
              Receitas Cadastradas
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FFF4ED] text-[#E85D04] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-[#212529] tabular-nums">
              {totalRecipes}
            </span>
            <span className="text-xs text-[#495057]">fichas ativas</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E5DDD0]/60 flex items-center justify-between text-xs text-[#E85D04] font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Ver catálogo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 2: Insumos */}
        <div
          onClick={() => navigate('/ingredients')}
          className="bg-white rounded-2xl border border-[#E5DDD0] p-5 shadow-warm hover:shadow-warm-md hover:border-amber-400 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#495057] font-heading uppercase tracking-wider">
              Despensa de Insumos
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-[#212529] tabular-nums">
              {totalIngredients}
            </span>
            <span className="text-xs text-[#495057]">itens com custo</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E5DDD0]/60 flex items-center justify-between text-xs text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Gerenciar despensa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 3: Margem Alvo */}
        <div
          onClick={() => navigate('/settings')}
          className="bg-white rounded-2xl border border-[#E5DDD0] p-5 shadow-warm hover:shadow-warm-md hover:border-[#2D6A4F]/60 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#495057] font-heading uppercase tracking-wider">
              Margem Média Alvo
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#D8F3DC]/70 text-[#1B4332] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-[#2D6A4F] tabular-nums">
              +{avgProfit.toFixed(0)}%
            </span>
            <span className="text-xs text-[#495057]">sobre o custo</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E5DDD0]/60 flex items-center justify-between text-xs text-[#2D6A4F] font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Ajustar margens</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 4: Overhead */}
        <div
          onClick={() => navigate('/settings')}
          className="bg-white rounded-2xl border border-[#E5DDD0] p-5 shadow-warm hover:shadow-warm-md hover:border-slate-400 transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#495057] font-heading uppercase tracking-wider">
              Custos Fixos / Overhead
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F0EAE1] text-[#343A40] flex items-center justify-center shrink-0">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-heading text-[#212529] tabular-nums">
              {settings.overhead_pct}%
            </span>
            <span className="text-xs text-[#495057]">gás, luz, aluguel</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E5DDD0]/60 flex items-center justify-between text-xs text-[#343A40] font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Parâmetros</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Production & Technical Sheets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading text-[#212529]">
              Fichas Técnicas Recentes
            </h3>
            <p className="text-xs text-[#495057]">
              Custos apurados por porção e preços de venda calculados.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/recipes')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Ver todas ({totalRecipes})
          </Button>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5DDD0] text-center py-16 px-4 space-y-3 shadow-warm">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF4ED] text-[#E85D04] flex items-center justify-center mx-auto shadow-2xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="max-w-sm mx-auto">
              <h4 className="font-bold text-base text-[#212529] font-heading">
                Nenhuma ficha técnica cadastrada
              </h4>
              <p className="text-xs text-[#495057] mt-1.5 leading-relaxed">
                Cadastre seus ingredientes na despensa para calcular automaticamente o custo real por porção e os preços sugeridos.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/ingredients')}
              >
                Cadastrar Insumos
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
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-[#FDFBF7] rounded-2xl border border-[#E5DDD0] overflow-hidden shadow-warm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5DDD0] bg-white text-[#495057] text-xs font-semibold font-heading">
                    <th className="py-3.5 px-5">Receita</th>
                    <th className="py-3.5 px-4">Rendimento & Tempo</th>
                    <th className="py-3.5 px-4 text-right">Custo de Produção</th>
                    <th className="py-3.5 px-4 text-right">Preço Sugerido</th>
                    <th className="py-3.5 px-4 text-right">Preço / Porção</th>
                    <th className="py-3.5 px-4 text-center">Margem</th>
                    <th className="py-3.5 px-5 text-right">Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DDD0]/60 bg-[#FDFBF7]">
                  {recipes.map((recipe: Recipe) => {
                    const fin = recipe.financials;
                    const profitMargin =
                      fin?.profit_margin_pct ?? settings.profit_margin_pct;
                    const sellingPrice = fin?.suggested_selling_price_brl ?? 0;
                    const costPrice = fin?.total_cost_brl ?? 0;
                    const portionPrice = fin?.price_per_portion_brl ?? 0;

                    return (
                      <tr
                        key={recipe.id}
                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                        className="hover:bg-white transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-5">
                          <span className="font-bold text-[#212529] group-hover:text-[#E85D04] transition-colors block font-heading">
                            {recipe.name}
                          </span>
                          {recipe.description && (
                            <span className="text-xs text-[#495057] line-clamp-1 mt-0.5">
                              {recipe.description}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-[#495057] text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#212529] bg-[#F0EAE1]/70 px-2 py-0.5 rounded-md">
                              {recipe.yield_quantity} {recipe.yield_unit}
                            </span>
                            <span className="flex items-center gap-1 text-[#495057]">
                              <Clock className="w-3.5 h-3.5" />
                              {recipe.prep_time_minutes} min
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right tabular-nums text-[#343A40] font-medium">
                          R$ {costPrice.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right tabular-nums">
                          <span className="font-extrabold text-[#E85D04] text-base font-heading">
                            R$ {sellingPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right tabular-nums text-[#495057] font-medium text-xs">
                          R$ {portionPrice.toFixed(2)} /{recipe.yield_unit.replace(/s$/, '')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="sage" size="sm">
                            +{profitMargin.toFixed(0)}%
                          </Badge>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E85D04] group-hover:translate-x-0.5 transition-transform">
                            Ver <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-3">
              {recipes.map((recipe: Recipe) => {
                const fin = recipe.financials;
                const profitMargin =
                  fin?.profit_margin_pct ?? settings.profit_margin_pct;
                const sellingPrice = fin?.suggested_selling_price_brl ?? 0;
                const costPrice = fin?.total_cost_brl ?? 0;
                const portionPrice = fin?.price_per_portion_brl ?? 0;

                return (
                  <div
                    key={recipe.id}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    className="bg-white rounded-2xl border border-[#E5DDD0] p-4 shadow-warm space-y-3 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#212529] font-heading text-base leading-snug truncate">
                          {recipe.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#495057]">
                          <span className="font-medium bg-[#F0EAE1]/70 px-1.5 py-0.5 rounded">
                            {recipe.yield_quantity} {recipe.yield_unit}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recipe.prep_time_minutes} min
                          </span>
                        </div>
                      </div>
                      <Badge variant="sage" size="sm" className="shrink-0">
                        +{profitMargin.toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-[#E5DDD0]/60 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#FDFBF7] p-2 rounded-xl border border-[#E5DDD0]/60">
                        <span className="text-[11px] text-[#495057] block">Custo de Produção</span>
                        <span className="text-sm font-bold text-[#343A40] tabular-nums">
                          R$ {costPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-[#FFF4ED] p-2 rounded-xl border border-[#FFE5D4]">
                        <span className="text-[11px] text-[#E85D04] font-semibold block">Preço Sugerido</span>
                        <span className="text-base font-extrabold text-[#E85D04] font-heading tabular-nums">
                          R$ {sellingPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-[#495057] block tabular-nums">
                          R$ {portionPrice.toFixed(2)} / un
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end text-xs font-semibold text-[#E85D04] pt-1">
                      <span>Abrir ficha técnica</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
