import React, { useState, useEffect } from 'react';
import { useIngredientStore } from '../stores/ingredientStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Plus, Trash2, Edit2, Scale, AlertCircle, Search, Wheat } from 'lucide-react';
import type { Ingredient, UnitType } from '../types';

export const IngredientsPage: React.FC = () => {
  const {
    ingredients,
    fetchIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  } = useIngredientStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<UnitType>('g');
  const [packageQuantity, setPackageQuantity] = useState('1000');
  const [packageCostBrl, setPackageCostBrl] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchIngredients(searchTerm);
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setUnit('g');
    setPackageQuantity('1000');
    setPackageCostBrl('');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ing: Ingredient) => {
    setEditingId(ing.id);
    setName(ing.name);
    setUnit(ing.unit);
    setPackageQuantity(ing.package_quantity.toString());
    setPackageCostBrl(ing.package_cost_brl.toString());
    setNotes(ing.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const qty = parseFloat(packageQuantity);
    const cost = parseFloat(packageCostBrl);

    if (isNaN(qty) || qty <= 0) {
      setFormError('Informe uma quantidade válida da embalagem.');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setFormError('Informe o valor pago na embalagem.');
      return;
    }

    const payload = {
      name: name.trim(),
      unit,
      package_quantity: qty,
      package_cost_brl: cost,
      notes: notes.trim() || null,
    };

    let success = false;
    if (editingId) {
      success = await updateIngredient(editingId, payload);
    } else {
      const res = await createIngredient(payload);
      success = !!res;
    }

    if (success) {
      setIsModalOpen(false);
    } else {
      setFormError('Falha ao salvar ingrediente. Verifique os campos.');
    }
  };

  const handleDelete = async (id: string, ingName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${ingName}"?`)) {
      await deleteIngredient(id);
    }
  };

  const filteredIngredients = ingredients.filter((ing) => {
    if (selectedUnit === 'all') return true;
    return ing.unit === selectedUnit;
  });

  const numQty = parseFloat(packageQuantity) || 0;
  const numCost = parseFloat(packageCostBrl) || 0;
  const calculatedUnitCost = numQty > 0 ? numCost / numQty : 0;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#495057] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar por nome ou marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#E5DDD0] bg-white pl-9 pr-3 text-sm text-[#212529] placeholder:text-[#495057] focus:border-[#E85D04] focus:outline-none focus:ring-1 focus:ring-[#E85D04]/20 shadow-2xs"
            />
          </div>

          {/* Unit Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F0EAE1]/70 p-1 rounded-xl border border-[#E5DDD0]/70 text-xs">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'g', label: 'g' },
              { id: 'ml', label: 'ml' },
              { id: 'un', label: 'un' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedUnit(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedUnit === tab.id
                    ? 'bg-white text-[#212529] shadow-2xs font-semibold'
                    : 'text-[#495057] hover:text-[#212529]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Novo Ingrediente
        </Button>
      </div>

      {/* Main Table Surface (Zero cards inside cards) */}
      <div className="bg-[#FDFBF7] rounded-xl border border-[#E5DDD0] overflow-hidden">
        {filteredIngredients.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
              <Wheat className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="font-bold text-[#212529] font-heading">
                {searchTerm ? 'Nenhum insumo encontrado' : 'Despensa vazia'}
              </h3>
              <p className="text-xs text-[#495057] mt-1">
                {searchTerm
                  ? `Nenhum resultado para a busca "${searchTerm}".`
                  : 'Cadastre seus insumos básicos para começar a estruturar suas receitas.'}
              </p>
            </div>
            {!searchTerm && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreate}
                leftIcon={<Plus className="w-4 h-4" />}
                className="mt-2"
              >
                Cadastrar Primeiro Insumo
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5DDD0] bg-[#FDFBF7] text-[#495057] text-xs font-semibold">
                  <th className="py-3.5 px-5">Insumo</th>
                  <th className="py-3.5 px-4 text-center">Unidade</th>
                  <th className="py-3.5 px-4 text-right">Embalagem Comprada</th>
                  <th className="py-3.5 px-4 text-right">Custo Unitário Real</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Observações</th>
                  <th className="py-3.5 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0]/60">
                {filteredIngredients.map((ing) => {
                  const unitLabel =
                    ing.unit === 'g'
                      ? 'grama'
                      : ing.unit === 'ml'
                      ? 'ml'
                      : 'unidade';

                  const displayPkg =
                    ing.unit === 'g' && ing.package_quantity >= 1000
                      ? `${(ing.package_quantity / 1000).toLocaleString('pt-BR')} kg`
                      : ing.unit === 'ml' && ing.package_quantity >= 1000
                      ? `${(ing.package_quantity / 1000).toLocaleString('pt-BR')} L`
                      : `${ing.package_quantity.toLocaleString('pt-BR')} ${ing.unit}`;

                  return (
                    <tr
                      key={ing.id}
                      className="hover:bg-[#FDFBF7]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-5 font-semibold text-[#212529]">
                        {ing.name}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="neutral" size="sm">
                          {ing.unit}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#495057] tabular-nums">
                        <span>{displayPkg} por </span>
                        <strong className="text-[#212529]">
                          R$ {ing.package_cost_brl.toFixed(2)}
                        </strong>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <span className="font-bold text-[#2D6A4F] bg-[#D8F3DC]/60 px-2 py-0.5 rounded-md">
                          R${' '}
                          {ing.cost_per_unit_brl < 0.01
                            ? ing.cost_per_unit_brl.toFixed(4)
                            : ing.cost_per_unit_brl.toFixed(2)}{' '}
                          <span className="text-[11px] font-medium text-[#495057]">
                            / {unitLabel}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#495057] hidden md:table-cell truncate max-w-[200px]">
                        {ing.notes || '—'}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(ing)}
                            title="Editar insumo"
                            className="p-1.5 text-[#495057] hover:text-[#212529] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ing.id, ing.name)}
                            title="Excluir insumo"
                            className="p-1.5 text-[#495057] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Insumo' : 'Novo Insumo'}
        subtitle="Informe embalagem e preço pago para calcular o custo unitário"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Nome do Insumo"
            placeholder="Ex: Chocolate 50%, Farinha Especial, Embalagem Kraft..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-semibold text-[#343A40]">
                Unidade
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full min-h-[46px] rounded-xl border border-[#E5DDD0] bg-white px-3.5 py-2.5 text-sm text-[#212529] focus:border-[#E85D04] focus:outline-none cursor-pointer"
              >
                <option value="g">Gramas (g / kg)</option>
                <option value="ml">Mililitros (ml / L)</option>
                <option value="un">Unidades (un)</option>
              </select>
            </div>

            <Input
              label={`Quantidade na Embalagem (${unit})`}
              type="number"
              step="any"
              placeholder="Ex: 1000"
              inputMode="decimal"
              value={packageQuantity}
              onChange={(e) => setPackageQuantity(e.target.value)}
              helperText={
                unit === 'g'
                  ? '1kg = 1000g'
                  : unit === 'ml'
                  ? '1L = 1000ml'
                  : 'Qtd de unidades'
              }
              required
            />
          </div>

          <Input
            label="Preço Total Pago na Embalagem"
            type="number"
            step="0.01"
            placeholder="0,00"
            prefixText="R$"
            inputMode="decimal"
            value={packageCostBrl}
            onChange={(e) => setPackageCostBrl(e.target.value)}
            required
          />

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#2D6A4F]" /> Custo Unitário:
            </span>
            <span className="font-black text-[#2D6A4F] text-base tabular-nums font-heading">
              R${' '}
              {calculatedUnitCost < 0.01
                ? calculatedUnitCost.toFixed(5)
                : calculatedUnitCost.toFixed(3)}{' '}
              / {unit}
            </span>
          </div>

          <Input
            label="Marca ou Fornecedor (Opcional)"
            placeholder="Ex: Fornecedor Central, Marca X..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Salvar Alterações' : 'Cadastrar Insumo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
