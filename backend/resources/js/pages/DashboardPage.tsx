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
    <div className="space-y-6 animate-fadeIn">
      {/* Unified Key Metrics Strip (Single surface, divided, zero nested cards) */}
      <div className="bg-[#FDFBF7] rounded-xl border border-[#E5DDD0] overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E5DDD0]/70">
          {/* Metric 1 */}
          <div
            onClick={() => navigate('/recipes')}
            className="p-5 hover:bg-[#FDFBF7]/60 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-[#495057] text-xs font-semibold">
              <BookOpen className="w-4 h-4 text-[#E85D04]" />
              <span>Receitas Cadastradas</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-[#212529] tabular-nums">
                {totalRecipes}
              </span>
              <span className="text-xs text-[#495057]">fichas ativas</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div
            onClick={() => navigate('/ingredients')}
            className="p-5 hover:bg-[#FDFBF7]/60 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-[#495057] text-xs font-semibold">
              <Wheat className="w-4 h-4 text-amber-600" />
              <span>Insumos na Despensa</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-[#212529] tabular-nums">
                {totalIngredients}
              </span>
              <span className="text-xs text-[#495057]">itens com custo</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div
            onClick={() => navigate('/settings')}
            className="p-5 hover:bg-[#FDFBF7]/60 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-[#495057] text-xs font-semibold">
              <TrendingUp className="w-4 h-4 text-[#2D6A4F]" />
              <span>Margem Média Alvo</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-[#2D6A4F] tabular-nums">
                +{avgProfit.toFixed(0)}%
              </span>
              <span className="text-xs text-[#495057]">sobre o custo</span>
            </div>
          </div>

          {/* Metric 4 */}
          <div
            onClick={() => navigate('/settings')}
            className="p-5 hover:bg-[#FDFBF7]/60 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-2 text-[#495057] text-xs font-semibold">
              <PieChart className="w-4 h-4 text-[#495057]" />
              <span>Taxa de Custos Fixos</span>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-[#212529] tabular-nums">
                {settings.overhead_pct}%
              </span>
              <span className="text-xs text-[#495057]">gás, luz, aluguel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production & Technical Sheets (Clean list surface without nested boxes) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-heading text-[#212529]">
              Fichas Técnicas Recentes
            </h2>
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

        <div className="bg-[#FDFBF7] rounded-xl border border-[#E5DDD0] overflow-hidden">
          {recipes.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#E85D04] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto">
                <h3 className="font-bold text-[#212529] font-heading">
                  Nenhuma ficha técnica cadastrada
                </h3>
                <p className="text-xs text-[#495057] mt-1">
                  Cadastre ingredientes na despensa para calcular custos por fatia e margens de venda.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5DDD0] bg-[#FDFBF7] text-[#495057] text-xs font-semibold">
                    <th className="py-3.5 px-5">Receita</th>
                    <th className="py-3.5 px-4">Rendimento & Tempo</th>
                    <th className="py-3.5 px-4 text-right">Custo de Produção</th>
                    <th className="py-3.5 px-4 text-right">Preço Sugerido</th>
                    <th className="py-3.5 px-4 text-right">Preço / Porção</th>
                    <th className="py-3.5 px-4 text-center">Margem</th>
                    <th className="py-3.5 px-5 text-right">Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DDD0]/60">
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
                        className="hover:bg-[#FDFBF7]/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-[#212529] group-hover:text-[#E85D04] transition-colors block">
                            {recipe.name}
                          </span>
                          {recipe.description && (
                            <span className="text-xs text-[#495057] line-clamp-1 mt-0.5">
                              {recipe.description}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#495057] text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#212529]">
                              {recipe.yield_quantity} {recipe.yield_unit}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[#495057]">
                              <Clock className="w-3.5 h-3.5" />
                              {recipe.prep_time_minutes} min
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums text-[#343A40] font-medium">
                          R$ {costPrice.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums">
                          <span className="font-extrabold text-[#E85D04] text-base font-heading">
                            R$ {sellingPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums text-[#495057] font-medium text-xs">
                          R$ {portionPrice.toFixed(2)} /{recipe.yield_unit.replace(/s$/, '')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant="sage" size="sm">
                            +{profitMargin.toFixed(0)}%
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-right">
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
          )}
        </div>
      </div>
    </div>
  );
};
