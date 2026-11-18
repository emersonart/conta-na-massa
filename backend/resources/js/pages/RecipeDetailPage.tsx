import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeStore } from '../stores/recipeStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CostBreakdownChart } from '../components/ui/CostBreakdownChart';
import {
  ArrowLeft,
  Clock,
  Printer,
  Scale,
  DollarSign,
  ShoppingBag,
  Truck,
  Layers,
  Edit2,
} from 'lucide-react';

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRecipe: recipe, fetchRecipe, isLoading } = useRecipeStore();
  const [multiplier, setMultiplier] = useState<number>(1);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id, fetchRecipe]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-[#E85D04]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-slate-500 font-medium">Receita não encontrada</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/recipes')}>
          Voltar para Receitas
        </Button>
      </div>
    );
  }

  const fin = recipe.financials;
  const scaledYield = (recipe.yield_quantity || 1) * multiplier;
  const scaledSellingPrice = (fin?.suggested_selling_price_brl || 0) * multiplier;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/recipes')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Voltar para Receitas
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Imprimir
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/recipes?edit=${recipe.id}`)}
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Editar Receita
          </Button>
        </div>
      </div>

      {/* Main Recipe Summary Surface */}
      <div className="bg-white rounded-2xl border border-[#E5DDD0] shadow-soft p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="sage" size="md">
                Margem +{fin?.profit_margin_pct.toFixed(0)}%
              </Badge>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {recipe.prep_time_minutes} min de preparo
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#212529]">
              {recipe.name}
            </h1>

            {recipe.description && (
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Pricing Highlight Block */}
          <div className="text-left sm:text-right shrink-0 bg-[#FDFBF7] p-4 rounded-xl border border-[#E5DDD0]/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E85D04] block">
              Preço Sugerido Total
            </span>
            <p className="text-3xl font-extrabold text-[#E85D04] tabular-nums font-heading mt-0.5">
              R$ {scaledSellingPrice.toFixed(2)}
            </p>
            <span className="text-xs font-semibold text-slate-600 block mt-1 tabular-nums">
              R$ {(fin?.price_per_portion_brl || 0).toFixed(2)} por{' '}
              {recipe.yield_unit.replace(/s$/, '')}
            </span>
          </div>
        </div>

        {/* Multiplier / Batch Scaler Tool */}
        <div className="pt-4 border-t border-[#E5DDD0]/70 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm print:hidden">
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#E85D04]" /> Multiplicador de Produção (Escalar Fornada):
          </span>

          <div className="flex items-center gap-1 bg-[#F0EAE1]/70 p-1 rounded-xl border border-[#E5DDD0]/60">
            {[1, 2, 3, 5, 10].map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer tabular-nums ${
                  multiplier === m
                    ? 'bg-[#E85D04] text-white shadow-2xs'
                    : 'text-slate-700 hover:bg-white/60'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Cost Proportions Chart */}
      {fin && <CostBreakdownChart financials={fin} />}

      {/* Ingredients Breakdown Table (Single Surface, Zero nesting) */}
      <div className="bg-white rounded-2xl border border-[#E5DDD0] shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5DDD0] flex items-center justify-between bg-[#FDFBF7]">
          <h2 className="text-base font-bold font-heading text-[#212529] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#E85D04]" /> Ficha Técnica dos Insumos
          </h2>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            Rendimento: <strong>{scaledYield} {recipe.yield_unit}</strong>{' '}
            {multiplier > 1 && `(${multiplier}x fornada)`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5DDD0] text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-5">Insumo</th>
                <th className="py-3 px-4 text-right">Quantidade</th>
                <th className="py-3 px-4 text-right">Custo Unitário</th>
                <th className="py-3 px-5 text-right">Custo na Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]/60">
              {fin?.breakdown_items.map((item, idx) => {
                const scaledQty = item.quantity * multiplier;
                const scaledSubtotal = item.subtotal_brl * multiplier;

                const displayQty =
                  item.unit === 'g' && scaledQty >= 1000
                    ? `${(scaledQty / 1000).toLocaleString('pt-BR')} kg`
                    : item.unit === 'ml' && scaledQty >= 1000
                    ? `${(scaledQty / 1000).toLocaleString('pt-BR')} L`
                    : `${scaledQty.toLocaleString('pt-BR')} ${item.unit}`;

                return (
                  <tr key={idx} className="hover:bg-[#FDFBF7]/60 transition-colors">
                    <td className="py-3 px-5 font-semibold text-[#212529]">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 tabular-nums">
                      {displayQty}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 tabular-nums text-xs">
                      R$ {item.cost_per_unit_brl < 0.01 ? item.cost_per_unit_brl.toFixed(4) : item.cost_per_unit_brl.toFixed(2)} / {item.unit}
                    </td>
                    <td className="py-3 px-5 text-right font-bold text-[#2D6A4F] tabular-nums">
                      R$ {scaledSubtotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#E5DDD0] bg-[#FDFBF7] font-bold">
                <td colSpan={3} className="py-3.5 px-5 text-slate-700">
                  Subtotal dos Ingredientes
                </td>
                <td className="py-3.5 px-5 text-right text-base text-[#E85D04] tabular-nums font-heading">
                  R$ {((fin?.ingredients_cost_brl || 0) * multiplier).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Sales Channels Simulation */}
      {fin && (
        <div className="space-y-3">
          <h2 className="text-base font-bold font-heading text-[#212529]">
            Precificação por Canal de Venda
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-emerald-300 shadow-soft flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-[#2D6A4F] flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" /> Balcão / Direto
                </span>
                <Badge variant="sage" size="sm">
                  +{fin.profit_margin_pct}%
                </Badge>
              </div>
              <div>
                <span className="text-xs text-slate-500">Preço Sugerido</span>
                <p className="text-2xl font-black text-[#2D6A4F] tabular-nums font-heading mt-0.5">
                  R$ {(fin.scenarios.direct_sale * multiplier).toFixed(2)}
                </p>
                <p className="text-xs text-slate-600 mt-1">Margem líquida máxima sem taxas.</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-amber-300 shadow-soft flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-amber-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> Delivery (+15%)
                </span>
                <Badge variant="mustard" size="sm">
                  Repasse Taxa
                </Badge>
              </div>
              <div>
                <span className="text-xs text-slate-500">Preço Recomendado</span>
                <p className="text-2xl font-black text-amber-900 tabular-nums font-heading mt-0.5">
                  R$ {(fin.scenarios.delivery_app_15pct * multiplier).toFixed(2)}
                </p>
                <p className="text-xs text-slate-600 mt-1">Cobre comissão mantendo o lucro.</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-300 shadow-soft flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" /> Atacado / Revenda
                </span>
                <Badge variant="charcoal" size="sm">
                  Volume Alto
                </Badge>
              </div>
              <div>
                <span className="text-xs text-slate-500">Preço Mínimo</span>
                <p className="text-2xl font-black text-slate-800 tabular-nums font-heading mt-0.5">
                  R$ {(fin.scenarios.wholesale * multiplier).toFixed(2)}
                </p>
                <p className="text-xs text-slate-600 mt-1">Compensado pelo volume pedido.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
