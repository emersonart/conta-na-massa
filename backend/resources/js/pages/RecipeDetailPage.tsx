import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeStore } from '../stores/recipeStore';
import { Card } from '../components/ui/Card';
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
} from 'lucide-react';
import type { Recipe } from '../types';

export const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRecipe: recipe, fetchRecipe, isLoading, error } = useRecipeStore();
  const [multiplier, setMultiplier] = useState<number>(1);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id, fetchRecipe]);

  if (isLoading) return <div className="p-8 text-center">Carregando...</div>;
  if (!recipe) return <div className="p-8 text-center">Receita não encontrada</div>;

  const fin = recipe.financials;

  const scaledYield = (recipe.yield_quantity || 1) * multiplier;
  const scaledSellingPrice = (fin?.suggested_selling_price_brl || 0) * multiplier;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate('/recipes')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Voltar para Receitas
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Imprimir Ficha Técnica
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(`/recipes?edit=${recipe.id}`)}>
            Editar Receita
          </Button>
        </div>
      </div>

      {/* Hero Header */}
      <Card className="p-6 sm:p-8 bg-[#FDFBF7] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="sage" size="md">
                Margem de +{fin?.profit_margin_pct.toFixed(0)}%
              </Badge>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {recipe.prep_time_minutes} min de preparo
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#212529]">
              {recipe.name}
            </h1>

            {recipe.description && (
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl">{recipe.description}</p>
            )}
          </div>

          {/* Big Highlight Pricing Badge */}
          <div className="p-4 rounded-2xl bg-white border border-[#E5DDD0] text-right shadow-sm shrink-0">
            <span className="text-[11px] uppercase font-bold text-[#E85D04] tracking-wider block">
              Preço de Venda Sugerido
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#E85D04] tabular-nums font-heading">
              R$ {scaledSellingPrice.toFixed(2)}
            </p>
            <span className="text-xs font-semibold text-slate-600 block mt-0.5 tabular-nums">
              R$ {(fin?.price_per_portion_brl || 0).toFixed(2)} por {recipe.yield_unit.replace(/s$/, '')}
            </span>
          </div>
        </div>

        {/* Multiplier / Batch Scaler Tool */}
        <div className="pt-4 border-t border-[#E5DDD0]/70 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm print:hidden">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#E85D04]" /> Multiplicador de Produção (Escalar Fornada):
          </span>

          <div className="flex items-center gap-1.5 bg-[#F0EAE1] p-1 rounded-xl">
            {[1, 2, 3, 5, 10].map((m) => (
              <button
                key={m}
                onClick={() => setMultiplier(m)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer tabular-nums ${
                  multiplier === m
                    ? 'bg-[#E85D04] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white/60'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Visual Cost Proportions Chart */}
      {fin && <CostBreakdownChart financials={fin} />}

      {/* Ingredients Breakdown Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-heading text-[#212529] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#E85D04]" /> Ficha Técnica dos Ingredientes
          </h3>
          <span className="text-xs font-bold text-slate-500 tabular-nums">
            Rendimento: {scaledYield} {recipe.yield_unit} {multiplier > 1 && `(${multiplier}x fornada)`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E5DDD0] text-slate-500 font-bold uppercase text-[11px] tracking-wider bg-[#FDFBF7]">
                <th className="py-3 px-4">Ingrediente</th>
                <th className="py-3 px-4 text-right">Qtd Necessária</th>
                <th className="py-3 px-4 text-right">Custo Unitário</th>
                <th className="py-3 px-4 text-right">Custo na Receita</th>
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
                  <tr key={idx} className="hover:bg-[#FDFBF7]/60">
                    <td className="py-3.5 px-4 font-semibold text-[#212529]">{item.name}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700 tabular-nums">
                      {displayQty}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 tabular-nums">
                      R$ {item.cost_per_unit_brl < 0.01 ? item.cost_per_unit_brl.toFixed(4) : item.cost_per_unit_brl.toFixed(2)} / {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#2D6A4F] tabular-nums">
                      R$ {scaledSubtotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#E5DDD0] bg-[#FDFBF7] font-bold">
                <td colSpan={3} className="py-3.5 px-4 text-slate-700">
                  Subtotal dos Ingredientes
                </td>
                <td className="py-3.5 px-4 text-right text-base text-[#E85D04] tabular-nums font-heading">
                  R$ {((fin?.ingredients_cost_brl || 0) * multiplier).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Sales Channels Simulation (Venda Direta, Delivery, Atacado) */}
      {fin && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold font-heading text-[#212529]">
            Simulação de Preços por Canal de Venda
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white border-2 border-emerald-300 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-[#2D6A4F] flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" /> Balcão / Encomenda Direta
                </span>
                <Badge variant="sage" size="sm">
                  +{fin.profit_margin_pct}%
                </Badge>
              </div>
              <div>
                <span className="text-xs text-slate-500">Preço Sugerido</span>
                <p className="text-2xl font-black text-[#2D6A4F] tabular-nums font-heading">
                  R$ {(fin.scenarios.direct_sale * multiplier).toFixed(2)}
                </p>
                <p className="text-xs text-slate-600 mt-1">Lucro líquido máximo sem taxas de terceiros.</p>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-amber-300 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-amber-800 flex items-center gap-1">
                  <Truck className="w-4 h-4" /> Aplicativos de Delivery (+15%)
                </span>
                <Badge variant="mustard" size="sm">
                  Repasse Taxa
                </Badge>
              </div>
              <div>
                <span className="text-xs text-slate-500">Preço Recomendado</span>
                <p className="text-2xl font-black text-amber-900 tabular-nums font-heading">
                  R$ {(fin.scenarios.delivery_app_15pct * multiplier).toFixed(2)}
                </p>
                <p className="text-xs text-slate-600 mt-1">Garante a mesma margem cobrindo comissão de app.</p>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-slate-300 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-slate-700 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Venda no Atacado / Revenda
                </span>
                <Badge variant="charcoal" size="sm">
                  Volume Alto
                </Badge>
              </div>
              <div>
                <span className="text-xs text-slate-500">Preço Mínimo</span>
                <p className="text-2xl font-black text-slate-800 tabular-nums font-heading">
                  R$ {(fin.scenarios.wholesale * multiplier).toFixed(2)}
                </p>
                <p className="text-xs text-slate-600 mt-1">Margem reduzida compensada pelo volume de pedidos.</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
