import React from 'react';
import type { FinancialBreakdown } from '../../types';

interface CostBreakdownProps {
  financials: FinancialBreakdown;
  compact?: boolean;
}

export const CostBreakdownChart: React.FC<CostBreakdownProps> = ({ financials, compact = false }) => {
  const sellingPrice = Math.max(0.01, financials.suggested_selling_price_brl);

  const ingredientsPct = Math.min(100, Math.max(0, (financials.ingredients_cost_brl / sellingPrice) * 100));
  const laborPct = Math.min(100, Math.max(0, (financials.labor_cost_brl / sellingPrice) * 100));
  const overheadPct = Math.min(100, Math.max(0, (financials.overhead_value_brl / sellingPrice) * 100));
  const profitPct = Math.min(100, Math.max(0, (financials.profit_value_brl / sellingPrice) * 100));

  if (compact) {
    return (
      <div className="w-full space-y-1.5">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 shadow-inner">
          <div
            style={{ width: `${ingredientsPct}%` }}
            className="h-full bg-[#E85D04] rounded-l-full transition-all duration-500"
            title={`Ingredientes: R$ ${financials.ingredients_cost_brl.toFixed(2)} (${ingredientsPct.toFixed(0)}%)`}
          />
          <div
            style={{ width: `${laborPct}%` }}
            className="h-full bg-amber-400 transition-all duration-500"
            title={`Mão de Obra: R$ ${financials.labor_cost_brl.toFixed(2)} (${laborPct.toFixed(0)}%)`}
          />
          <div
            style={{ width: `${overheadPct}%` }}
            className="h-full bg-slate-400 transition-all duration-500"
            title={`Custos Fixos: R$ ${financials.overhead_value_brl.toFixed(2)} (${overheadPct.toFixed(0)}%)`}
          />
          <div
            style={{ width: `${profitPct}%` }}
            className="h-full bg-[#2D6A4F] rounded-r-full transition-all duration-500"
            title={`Lucro Líquido: R$ ${financials.profit_value_brl.toFixed(2)} (${profitPct.toFixed(0)}%)`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 tabular-nums">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#E85D04]" /> Ingredientes {ingredientsPct.toFixed(0)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" /> Lucro {profitPct.toFixed(0)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDFBF7] border border-[#E5DDD0] rounded-2xl p-4 sm:p-5 space-y-4 shadow-warm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#343A40] font-heading">
          Composição do Preço de Venda
        </h4>
        <span className="text-xs font-semibold px-2.5 py-1 bg-[#D8F3DC]/80 text-[#1B4332] border border-[#74C69D]/30 rounded-lg tabular-nums self-start sm:self-auto">
          Preço Sugerido: R$ {financials.suggested_selling_price_brl.toFixed(2)}
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5 shadow-inner">
        <div
          style={{ width: `${ingredientsPct}%` }}
          className="h-full bg-[#E85D04] rounded-l-full transition-all duration-500"
        />
        <div
          style={{ width: `${laborPct}%` }}
          className="h-full bg-[#F4A261] transition-all duration-500"
        />
        <div
          style={{ width: `${overheadPct}%` }}
          className="h-full bg-slate-400 transition-all duration-500"
        />
        <div
          style={{ width: `${profitPct}%` }}
          className="h-full bg-[#2D6A4F] rounded-r-full transition-all duration-500"
        />
      </div>

      {/* Legend & Values Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
        <div className="p-3 rounded-xl bg-[#FFF4ED] border border-[#FFE5D4] flex flex-col">
          <span className="flex items-center gap-1.5 text-xs text-orange-950 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E85D04]" /> Insumos
          </span>
          <span className="text-base font-bold text-[#E85D04] mt-1 tabular-nums font-heading">
            R$ {financials.ingredients_cost_brl.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#495057] tabular-nums mt-0.5">{ingredientsPct.toFixed(1)}% do preço</span>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 flex flex-col">
          <span className="flex items-center gap-1.5 text-xs text-amber-950 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F4A261]" /> Mão de Obra
          </span>
          <span className="text-base font-bold text-[#343A40] mt-1 tabular-nums font-heading">
            R$ {financials.labor_cost_brl.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#495057] tabular-nums mt-0.5">{laborPct.toFixed(1)}% do preço</span>
        </div>

        <div className="p-3 rounded-xl bg-[#F0EAE1]/70 border border-[#E5DDD0] flex flex-col">
          <span className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Custos Fixos
          </span>
          <span className="text-base font-bold text-[#343A40] mt-1 tabular-nums font-heading">
            R$ {financials.overhead_value_brl.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#495057] tabular-nums mt-0.5">{overheadPct.toFixed(1)}% do preço</span>
        </div>

        <div className="p-3 rounded-xl bg-[#D8F3DC]/70 border border-[#74C69D]/40 flex flex-col">
          <span className="flex items-center gap-1.5 text-xs text-emerald-950 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" /> Lucro Líquido
          </span>
          <span className="text-base font-bold text-[#1B4332] mt-1 tabular-nums font-heading">
            + R$ {financials.profit_value_brl.toFixed(2)}
          </span>
          <span className="text-[11px] font-semibold text-[#2D6A4F] tabular-nums mt-0.5">
            +{financials.profit_margin_pct.toFixed(0)}% de margem
          </span>
        </div>
      </div>
    </div>
  );
};
