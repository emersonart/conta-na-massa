import React, { useState, useEffect } from 'react';
import { useCostStore } from '../stores/costStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Sliders, Save, CheckCircle2, Calculator, Info, AlertCircle } from 'lucide-react';

export const CostSettingsPage: React.FC = () => {
  const { settings, fetchSettings, updateSettings, isLoading } = useCostStore();

  const [overheadPct, setOverheadPct] = useState('20');
  const [profitMarginPct, setProfitMarginPct] = useState('35');
  const [laborCostPerHour, setLaborCostPerHour] = useState('20');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setOverheadPct(settings.overhead_pct.toString());
      setProfitMarginPct(settings.profit_margin_pct.toString());
      setLaborCostPerHour(settings.labor_cost_per_hour_brl.toString());
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setErrorMsg(null);

    const overhead = parseFloat(overheadPct);
    const profit = parseFloat(profitMarginPct);
    const labor = parseFloat(laborCostPerHour);

    if (isNaN(overhead) || overhead < 0) {
      setErrorMsg('Informe um percentual de custos fixos válido.');
      return;
    }
    if (isNaN(profit) || profit < 0) {
      setErrorMsg('Informe uma margem de lucro válida.');
      return;
    }
    if (isNaN(labor) || labor < 0) {
      setErrorMsg('Informe um valor de mão de obra por hora válido.');
      return;
    }

    const success = await updateSettings({
      overhead_pct: overhead,
      profit_margin_pct: profit,
      labor_cost_per_hour_brl: labor,
    });

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setErrorMsg('Falha ao salvar configurações.');
    }
  };

  // Live Simulator: Example with R$ 25 in ingredients and 1h prep time
  const simIngredients = 25.0;
  const simLabor = (parseFloat(laborCostPerHour) || 0) * 1.0;
  const simBase = simIngredients + simLabor;
  const simOverheadVal = simBase * ((parseFloat(overheadPct) || 0) / 100);
  const simTotalCost = simBase + simOverheadVal;
  const simProfitVal = simTotalCost * ((parseFloat(profitMarginPct) || 0) / 100);
  const simFinalPrice = simTotalCost + simProfitVal;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-heading text-[#212529] tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-[#E85D04]" /> Parâmetros Financeiros & Margens
        </h2>
        <p className="text-xs sm:text-sm text-[#495057] mt-1">
          Defina as taxas que são aplicadas automaticamente em todas as suas receitas e fichas técnicas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <Card className="lg:col-span-2 space-y-6 bg-white shadow-warm" variant="elevated">
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-[#D8F3DC]/80 border border-[#74C69D]/40 text-[#1B4332] text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#2D6A4F]" />
              <span>Configurações financeiras salvas com sucesso! Todas as receitas foram recalculadas.</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Custos Fixos / Overhead (%)"
              type="number"
              step="0.5"
              inputMode="decimal"
              suffixText="%"
              placeholder="20"
              value={overheadPct}
              onChange={(e) => setOverheadPct(e.target.value)}
              helperText="Percentual para cobrir gás, energia elétrica, água, detergente, desgaste de equipamentos e aluguel (geralmente entre 15% e 25%)."
              required
            />

            <Input
              label="Margem de Lucro Desejada (%)"
              type="number"
              step="1"
              inputMode="decimal"
              suffixText="%"
              placeholder="35"
              value={profitMarginPct}
              onChange={(e) => setProfitMarginPct(e.target.value)}
              helperText="Lucro líquido que sobra para você reinvestir ou retirar após cobrir todos os insumos, mão de obra e custos fixos."
              required
            />

            <Input
              label="Valor da sua Hora de Trabalho"
              type="number"
              step="1.00"
              inputMode="decimal"
              prefixText="R$"
              suffixText="/ hora"
              placeholder="20,00"
              value={laborCostPerHour}
              onChange={(e) => setLaborCostPerHour(e.target.value)}
              helperText="Quanto você quer receber por hora dedicada na cozinha (ex: R$ 20,00/h equivale a ~R$ 3.500/mês em 44h semanais)."
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                isLoading={isLoading}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Salvar Parâmetros Financeiros
              </Button>
            </div>
          </form>
        </Card>

        {/* Live Simulator Preview */}
        <div className="space-y-4">
          <Card className="bg-[#FDFBF7] border border-[#E5DDD0] p-5 space-y-4 shadow-warm" variant="default">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E85D04] font-heading uppercase tracking-wider">
              <Calculator className="w-4 h-4" /> Simulador em Tempo Real
            </div>

            <p className="text-xs text-[#495057] leading-relaxed">
              Exemplo de um bolo com <strong className="text-[#212529]">R$ 25,00 em insumos</strong> e{' '}
              <strong className="text-[#212529]">1 hora de preparo</strong>:
            </p>

            <div className="space-y-2.5 text-xs text-[#495057] divide-y divide-[#E5DDD0]/70">
              <div className="flex justify-between pt-1">
                <span>Insumos:</span>
                <span className="font-semibold text-[#212529] tabular-nums">R$ 25,00</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Mão de Obra (1h):</span>
                <span className="font-semibold text-[#212529] tabular-nums">R$ {simLabor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Overhead ({overheadPct}%):</span>
                <span className="font-semibold text-[#212529] tabular-nums">R$ {simOverheadVal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 font-bold text-[#212529]">
                <span>Custo Real de Produção:</span>
                <span className="tabular-nums">R$ {simTotalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1.5 text-[#1B4332] font-bold">
                <span>Lucro Líquido (+{profitMarginPct}%):</span>
                <span className="tabular-nums">+ R$ {simProfitVal.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF4ED] border border-[#FFE5D4] text-center shadow-2xs">
              <span className="text-[10px] font-bold text-[#E85D04] uppercase tracking-wider block font-heading">
                Preço de Venda Resultante
              </span>
              <p className="text-3xl font-black text-[#E85D04] tabular-nums font-heading mt-1">
                R$ {simFinalPrice.toFixed(2)}
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-white border border-[#E5DDD0] text-xs text-[#495057] space-y-2 shadow-2xs" variant="flat">
            <span className="font-bold text-[#343A40] flex items-center gap-1.5 font-heading">
              <Info className="w-3.5 h-3.5 text-[#2D6A4F]" /> Dica de Gestão Gastronômica
            </span>
            <p className="leading-relaxed">
              Evite a regra amadora de apenas multiplicar os ingredientes por 3. Sem calcular tempo de preparo e custos fixos, receitas que demandam horas de trabalho geram prejuízo disfarçado.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
