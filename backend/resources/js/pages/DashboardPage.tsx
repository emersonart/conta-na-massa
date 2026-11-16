import React, { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CostBreakdownChart } from '../components/ui/CostBreakdownChart';
import {
  BookOpen,
  Wheat,
  TrendingUp,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  PieChart,
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
        <div className="animate-spin text-[#E85D04] text-4xl">🥐</div>
      </div>
    );
  }

  const { metrics, recent_recipes, ai, settings } = summary;
  const totalRecipes = metrics.total_recipes;
  const totalIngredients = metrics.total_ingredients;
  const avgProfit = metrics.avg_profit_margin;
  const userProfile = ai.profile;
  const stats = { monthly: { cost_brl: ai.stats.monthly_cost_brl, tokens: ai.stats.monthly_tokens } };
  const recipes = recent_recipes;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Welcome Banner with AI Chef Profile */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#212529] via-[#343A40] to-[#1B4332] text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl select-none pointer-events-none">
          🥐
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-300 border border-white/15">
            <Sparkles className="w-3.5 h-3.5" /> Modo Vibe Ativo
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Pronto para transformar farinha em lucro real?
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            {userProfile?.summary ||
              'Cadastre seus ingredientes e receitas para calcular custos exatos, ponto de equilíbrio e margem de venda.'}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/vibe')}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Falar com o Chef IA
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/recipes?new=true')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Criar Receita
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card hoverable onClick={() => navigate('/recipes')} className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs sm:text-sm font-semibold">Receitas Salvas</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#E85D04] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-[#212529] tabular-nums">
              {totalRecipes}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">cadastradas no seu catálogo</span>
          </div>
        </Card>

        <Card hoverable onClick={() => navigate('/ingredients')} className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs sm:text-sm font-semibold">Ingredientes</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <Wheat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-[#212529] tabular-nums">
              {totalIngredients}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">com custos por grama/ml</span>
          </div>
        </Card>

        <Card hoverable onClick={() => navigate('/settings')} className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs sm:text-sm font-semibold">Margem Média</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#2D6A4F] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
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
            <span className="text-xs sm:text-sm font-semibold">Custos Fixos (Overhead)</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-slate-800 tabular-nums">
              {settings.overhead_pct}%
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">luz, gás, aluguel, embalagem</span>
          </div>
        </Card>

        {/* AI Usage Card */}
        <Card hoverable onClick={() => navigate('/vibe')} className="flex flex-col justify-between border-orange-200 bg-orange-50/50">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs sm:text-sm font-semibold text-orange-900">Uso do Chef IA</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-orange-900 tabular-nums">
              R$ {stats?.monthly?.cost_brl?.toFixed(2) || '0.00'}
            </span>
            <span className="text-xs text-orange-700/70 block mt-0.5">
              {stats?.monthly?.tokens?.toLocaleString() || 0} tokens usados neste mês
            </span>
          </div>
        </Card>
      </div>

      {/* Featured / Recent Recipes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-heading text-[#212529]">
              Suas Receitas & Fichas Técnicas
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Clique em um card para detalhar custos, porções e preços por canal.
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
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#E85D04] text-2xl flex items-center justify-center mx-auto">
              📝
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h4 className="font-bold text-[#212529] font-heading">Nenhuma receita cadastrada ainda</h4>
              <p className="text-xs text-slate-500">
                Você pode cadastrar manualmente ou pedir para a IA do Modo Vibe criar a receita para você em segundos.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/ingredients')} leftIcon={<Wheat className="w-4 h-4" />}>
                1. Cadastrar Ingredientes
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/recipes?new=true')} leftIcon={<Plus className="w-4 h-4" />}>
                2. Criar Nova Receita
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
                  <div className="space-y-3">
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

                  {/* Financial Mini Breakdown */}
                  <div className="pt-3 border-t border-[#E5DDD0]/70 space-y-3">
                    {fin && <CostBreakdownChart financials={fin} compact />}

                    <div className="flex items-end justify-between bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E5DDD0]/60">
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
