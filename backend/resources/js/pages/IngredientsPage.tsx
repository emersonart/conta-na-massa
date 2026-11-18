import React, { useState, useEffect } from 'react';
import { useIngredientStore } from '../stores/ingredientStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Wheat, Plus, Trash2, Edit2, Scale, AlertCircle, Search } from 'lucide-react';
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
    if (window.confirm(`Tem certeza que deseja excluir "${ingName}"? Receitas que utilizam este ingrediente podem ser afetadas.`)) {
      await deleteIngredient(id);
    }
  };

  const numQty = parseFloat(packageQuantity) || 0;
  const numCost = parseFloat(packageCostBrl) || 0;
  const calculatedUnitCost = numQty > 0 ? numCost / numQty : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-[#212529] tracking-tight flex items-center gap-2">
            <Wheat className="w-6 h-6 text-[#E85D04]" /> Despensa de Ingredientes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cadastre os insumos comprados com o valor da embalagem. O custo unitário é calculado automaticamente.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Novo Ingrediente
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <div className="absolute left-3.5 top-3.5 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Buscar ingrediente por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full min-h-[44px] rounded-xl border border-[#E5DDD0] bg-white pl-10 pr-4 py-2 text-sm text-[#212529] placeholder:text-slate-400 focus:border-[#E85D04] focus:outline-none focus:ring-2 focus:ring-[#E85D04]/15 shadow-2xs"
        />
      </div>

      {/* Ingredients Grid */}
      {ingredients.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 border-[#E5DDD0]">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
            <Wheat className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-[#212529] font-heading mt-3">Nenhum ingrediente encontrado</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            {searchTerm
              ? `Nenhum resultado para "${searchTerm}".`
              : 'Comece adicionando itens como farinha, açúcar, manteiga, ovos ou embalagens.'}
          </p>
          {!searchTerm && (
            <Button variant="primary" size="sm" onClick={handleOpenCreate} className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
              Adicionar Primeiro Ingrediente
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ing) => {
            const unitLabel = ing.unit === 'g' ? 'grama' : ing.unit === 'ml' ? 'ml' : 'unidade';
            const displayPkg =
              ing.unit === 'g' && ing.package_quantity >= 1000
                ? `${(ing.package_quantity / 1000).toLocaleString('pt-BR')} kg`
                : ing.unit === 'ml' && ing.package_quantity >= 1000
                ? `${(ing.package_quantity / 1000).toLocaleString('pt-BR')} L`
                : `${ing.package_quantity.toLocaleString('pt-BR')} ${ing.unit}`;

            return (
              <Card key={ing.id} className="flex flex-col justify-between space-y-4 group">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-base text-[#212529] font-heading group-hover:text-[#E85D04] transition-colors">
                      {ing.name}
                    </h4>
                    <Badge variant="neutral" size="sm">
                      {ing.unit}
                    </Badge>
                  </div>

                  {ing.notes && <p className="text-xs text-slate-500 line-clamp-2">{ing.notes}</p>}
                </div>

                {/* Pricing Details */}
                <div className="pt-3 border-t border-[#E5DDD0]/70 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Embalagem ({displayPkg}):</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      R$ {ing.package_cost_brl.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5DDD0]/60">
                    <span className="text-xs font-bold text-[#2D6A4F] flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" /> Custo por {unitLabel}:
                    </span>
                    <span className="text-sm font-black text-[#2D6A4F] tabular-nums font-heading">
                      R$ {ing.cost_per_unit_brl < 0.01 ? ing.cost_per_unit_brl.toFixed(4) : ing.cost_per_unit_brl.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(ing)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-600" />}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ing.id, ing.name)}
                      className="text-rose-600 hover:bg-rose-50"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Ingrediente' : 'Novo Ingrediente'}
        subtitle="Informe os dados da embalagem comprada para calcular o custo unitário"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Nome do Ingrediente ou Insumo"
            placeholder="Ex: Chocolate em Pó 50%, Farinha Especial, Embalagem Kraft..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs sm:text-sm font-semibold text-[#343A40]">Unidade de Medida</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full min-h-[46px] rounded-xl border-2 border-[#E5DDD0] bg-white px-3.5 py-2.5 text-sm text-[#212529] focus:border-[#E85D04] focus:outline-none cursor-pointer"
              >
                <option value="g">Gramas (g / kg)</option>
                <option value="ml">Mililitros (ml / Litros)</option>
                <option value="un">Unidades (un)</option>
              </select>
            </div>

            <Input
              label={`Qtd da Embalagem (${unit})`}
              type="number"
              step="any"
              placeholder="Ex: 1000"
              inputMode="decimal"
              value={packageQuantity}
              onChange={(e) => setPackageQuantity(e.target.value)}
              helperText={unit === 'g' ? '1kg = 1000g' : unit === 'ml' ? '1L = 1000ml' : 'Quantidade de itens'}
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

          {/* Instant Cost Calculation Preview Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#2D6A4F]" /> Custo Unitário Calculado:
            </span>
            <span className="font-black text-[#2D6A4F] text-base tabular-nums font-heading">
              R$ {calculatedUnitCost < 0.01 ? calculatedUnitCost.toFixed(5) : calculatedUnitCost.toFixed(3)} / {unit}
            </span>
          </div>

          <Input
            label="Observações / Marca (Opcional)"
            placeholder="Ex: Marca Dona Benta, fornecedor Mercado Central..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Salvar Alterações' : 'Cadastrar Ingrediente'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
