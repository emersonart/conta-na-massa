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
        <p className="text-[#495057] font-medium">Receita não encontrada</p>
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
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto">
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
            Imprimir Ficha
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
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5DDD0] p-5 sm:p-7 shadow-warm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="sage" size="md">
                Margem Alvo +{fin?.profit_margin_pct.toFixed(0)}%
              </Badge>
              <span className="text-xs text-[#495057] flex items-center gap-1 bg-[#F0EAE1]/70 px-2 py-0.5 rounded-md font-medium">
                <Clock className="w-3.5 h-3.5 text-[#495057]" />
                {recipe.prep_time_minutes} min de preparo
              </span>
              <span className="text-xs text-[#495057] bg-[#F0EAE1]/70 px-2 py-0.5 rounded-md font-medium">
                Rendimento: {recipe.yield_quantity} {recipe.yield_unit}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-[#212529] tracking-tight">
              {recipe.name}
            </h1>

            {recipe.description && (
              <p className="text-sm text-[#495057] max-w-2xl leading-relaxed">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Pricing Highlight Hero Block */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5DDD0] shadow-warm text-left sm:text-right shrink-0 min-w-[240px]">
            <span className="text-[11px] font-bold text-[#E85D04] uppercase tracking-wider block font-heading">
              Preço Sugerido Total
            </span>
            <p className="text-3xl sm:text-4xl font-black text-[#E85D04] tabular-nums font-heading mt-1">
              R$ {scaledSellingPrice.toFixed(2)}
            </p>
            <div className="mt-2 pt-2 border-t border-[#E5DDD0]/60 space-y-0.5">
              <span className="text-xs font-semibold text-[#212529] block tabular-nums">
                R$ {(fin?.price_per_portion_brl || 0).toFixed(2)} por {recipe.yield_unit.replace(/s$/, '')}
              </span>
              <span className="text-[11px] text-[#2D6A4F] font-semibold block tabular-nums">
                Lucro estimado: +R$ {((fin?.profit_value_brl || 0) * multiplier).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Multiplier / Batch Scaler Tool */}
        <div className="pt-4 border-t border-[#E5DDD0]/70 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#343A40] flex items-center gap-2 font-heading">
              <Layers className="w-4 h-4 text-[#E85D04]" /> Escalar Produção / Fornada:
            </span>
            <span className="text-xs text-[#495057] bg-[#F0EAE1]/70 px-2 py-0.5 rounded-md font-medium">
              Produzindo: <strong>{scaledYield} {recipe.yield_unit}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F0EAE1]/80 p-1 rounded-xl border border-[#E5DDD0]/70">
            {[1, 2, 3, 5, 10].map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer tabular-nums text-xs ${
                  multiplier === m
                    ? 'bg-[#E85D04] text-white shadow-2xs'
                    : 'text-[#343A40] hover:bg-white/70'
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

      {/* Ingredients Breakdown Table */}
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#E5DDD0] overflow-hidden shadow-warm">
        <div className="p-4 sm:p-5 border-b border-[#E5DDD0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
          <h3 className="text-base font-bold font-heading text-[#212529] flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#E85D04]" /> Ficha Técnica dos Insumos
          </h3>
          <span className="text-xs font-semibold text-[#495057] tabular-nums bg-[#F0EAE1]/70 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            Rendimento apurado: <strong>{scaledYield} {recipe.yield_unit}</strong>{' '}
            {multiplier > 1 && `(${multiplier}x lote)`}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5DDD0] bg-white text-[#495057] text-xs font-semibold font-heading">
                <th className="py-3 px-5">Insumo</th>
                <th className="py-3 px-4 text-right">Quantidade</th>
                <th className="py-3 px-4 text-right">Custo Unitário</th>
                <th className="py-3 px-5 text-right">Custo na Receita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD0]/60 bg-[#FDFBF7]">
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
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#212529] font-heading">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#343A40] tabular-nums">
                      {displayQty}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#495057] tabular-nums text-xs">
                      R$ {item.cost_per_unit_brl < 0.01 ? item.cost_per_unit_brl.toFixed(4) : item.cost_per_unit_brl.toFixed(2)} / {item.unit}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-[#1B4332] tabular-nums">
                      R$ {scaledSubtotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[#E5DDD0] bg-white font-bold">
                <td colSpan={3} className="py-4 px-5 text-[#343A40] font-heading">
                  Subtotal dos Insumos
                </td>
                <td className="py-4 px-5 text-right text-base text-[#E85D04] tabular-nums font-heading">
                  R$ {((fin?.ingredients_cost_brl || 0) * multiplier).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile View for Ingredients */}
        <div className="md:hidden divide-y divide-[#E5DDD0]/60">
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
              <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-[#FDFBF7]">
                <div>
                  <span className="font-bold text-[#212529] block font-heading text-sm">
                    {item.name}
                  </span>
                  <span className="text-[#495057] tabular-nums">
                    {displayQty} • R$ {item.cost_per_unit_brl < 0.01 ? item.cost_per_unit_brl.toFixed(4) : item.cost_per_unit_brl.toFixed(2)}/{item.unit}
                  </span>
                </div>
                <span className="font-bold text-[#1B4332] tabular-nums text-sm">
                  R$ {scaledSubtotal.toFixed(2)}
                </span>
              </div>
            );
          })}
          <div className="p-4 bg-white flex items-center justify-between text-sm font-bold font-heading border-t border-[#E5DDD0]">
            <span className="text-[#343A40]">Subtotal Insumos:</span>
            <span className="text-[#E85D04] text-base tabular-nums">
              R$ {((fin?.ingredients_cost_brl || 0) * multiplier).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Sales Channels Simulation */}
      {fin && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-heading text-[#212529]">
              Precificação Recomendada por Canal de Venda
            </h3>
            <p className="text-xs text-[#495057] mt-0.5">
              Simulação de preços ajustados para cobrir taxas de plataformas e comissões.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-[#74C69D]/50 shadow-warm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-[#2D6A4F] flex items-center gap-1.5 font-heading">
                  <ShoppingBag className="w-4 h-4" /> Balcão / Direto
                </span>
                <Badge variant="sage" size="sm">
                  +{fin.profit_margin_pct}%
                </Badge>
              </div>
              <div>
                <span className="text-xs text-[#495057]">Preço Sugerido</span>
                <p className="text-2xl sm:text-3xl font-black text-[#1B4332] tabular-nums font-heading mt-1">
                  R$ {(fin.scenarios.direct_sale * multiplier).toFixed(2)}
                </p>
                <p className="text-xs text-[#495057] mt-1.5">Margem líquida máxima sem taxas de terceiros.</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-amber-300 shadow-warm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5 font-heading">
                  <Truck className="w-4 h-4" /> Delivery (+15%)
                </span>
                <Badge variant="mustard" size="sm">
                  Repasse Taxa
                </Badge>
              </div>
              <div>
                <span className="text-xs text-[#495057]">Preço Recomendado</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-900 tabular-nums font-heading mt-1">
                  R$ {(fin.scenarios.delivery_app_15pct * multiplier).toFixed(2)}
                </p>
                <p className="text-xs text-[#495057] mt-1.5">Cobre a comissão do app mantendo sua margem intacta.</p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-300 shadow-warm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-[#343A40] flex items-center gap-1.5 font-heading">
                  <DollarSign className="w-4 h-4" /> Atacado / Revenda
                </span>
                <Badge variant="charcoal" size="sm">
                  Volume Alto
                </Badge>
              </div>
              <div>
                <span className="text-xs text-[#495057]">Preço Mínimo</span>
                <p className="text-2xl sm:text-3xl font-black text-[#212529] tabular-nums font-heading mt-1">
                  R$ {(fin.scenarios.wholesale * multiplier).toFixed(2)}
                </p>
                <p className="text-xs text-[#495057] mt-1.5">Desconto estratégico compensado pelo volume do lote.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
