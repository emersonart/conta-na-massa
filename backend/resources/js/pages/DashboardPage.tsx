import React, { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CostBreakdownChart } from '../components/ui/CostBreakdownChart';
import {
  BookOpen,
  Wheat,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  PieChart,
  ChefHat,
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
      {/* Overview Banner */}
      <div className="rounded-2xl bg-[#212529] text-white p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
            Painel de Custos & Produção
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Cadastre seus ingredientes e receitas para calcular custos reais por porção, taxa de mão de obra e ponto de equilíbrio.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/recipes?new=true')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nova Receita
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ingredients')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<Wheat className="w-4 h-4" />}
            >
              Despensa
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/vibe')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<ChefHat className="w-4 h-4" />}
            >
              Assistente de Custos
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row (4 Clean Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card hoverable onClick={() => navigate('/recipes')} className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs sm:text-sm font-semibold">Receitas Ativas</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#E85D04] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-[#212529] tabular-nums">
              {totalRecipes}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">fichas no seu catálogo</span>
          </div>
        </Card>

        <Card hoverable onClick={() => navigate('/ingredients')} className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs sm:text-sm font-semibold">Ingredientes</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Wheat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-[#212529] tabular-nums">
              {totalIngredients}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">com custo unitário</span>
          </div>
        </Card>

        <Card hoverable onClick={() => navigate('/settings')} className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs sm:text-sm font-semibold">Margem Média</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#2D6A4F] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-[#2D6A4F] tabular-nums">
              +{avgProfit.toFixed(0)}%
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">lucro sobre o custo</span>
          </div>
        </Card>

        <Card hoverable onClick={() => navigate('/settings')} className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs sm:text-sm font-semibold">Custos Fixos</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-slate-800 tabular-nums">
              {settings.overhead_pct}%
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">gás, luz, aluguel, taxa</span>
          </div>
        </Card>
      </div>

      {/* Featured / Recent Recipes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-[#212529]">
              Receitas Recentes
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Selecione uma receita para ver ficha técnica detalhada e simulação de venda.
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
          <Card className="text-center py-12 space-y-4 border-dashed border-2 border-[#E5DDD0]">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#E85D04] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h4 className="font-bold text-[#212529] font-heading">Nenhuma receita cadastrada ainda</h4>
              <p className="text-xs text-slate-500">
                Cadastre seus ingredientes para montar fichas técnicas completas com custos por porção.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/ingredients')} leftIcon={<Wheat className="w-4 h-4" />}>
                Cadastrar Ingredientes
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/recipes?new=true')} leftIcon={<Plus className="w-4 h-4" />}>
                Criar Receita
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.slice(0, 6).map((recipe: Recipe) => {
              const fin = recipe.financials;
              const profitMargin = fin?.profit_margin_pct ?? settings.profit_margin_pct;
              const sellingPrice = fin?.suggested_selling_price_brl ?? 0;
              const costPrice = fin?.total_cost_brl ?? 0;

              return (
                <Card
                  key={recipe.id}
                  hoverable
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                  className="flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-base sm:text-lg text-[#212529] font-heading group-hover:text-[#E85D04] transition-colors leading-snug">
                        {recipe.name}
                      </h4>
                      <Badge variant="sage" size="md">
                        +{profitMargin.toFixed(0)}%
                      </Badge>
                    </div>

                    {recipe.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{recipe.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {recipe.prep_time_minutes} min
                      </span>
                      <span>•</span>
                      <span>
                        Rende {recipe.yield_quantity} {recipe.yield_unit}
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="pt-3 border-t border-[#E5DDD0]/70 space-y-2.5">
                    {fin && <CostBreakdownChart financials={fin} compact />}

                    <div className="flex items-center justify-between bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E5DDD0]/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Custo Total
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 tabular-nums">
                          R$ {costPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#E85D04] tracking-wider">
                          Preço Sugerido
                        </span>
                        <p className="text-base sm:text-lg font-black text-[#E85D04] tabular-nums font-heading">
                          R$ {sellingPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
