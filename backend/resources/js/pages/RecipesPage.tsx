import React, { useState, useEffect } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import { useIngredientStore } from '../stores/ingredientStore';
import { useCostStore } from '../stores/costStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Clock,
  PlusCircle,
  X,
  Search,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Recipe } from '../types';

export const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { recipes, fetchRecipes, createRecipe, updateRecipe, deleteRecipe } = useRecipeStore();
  const { ingredients, fetchIngredients } = useIngredientStore();
  const { settings, fetchSettings } = useCostStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const isModalOpen = searchParams.get('new') === 'true' || searchParams.has('edit');
  
  const setIsModalOpen = (open: boolean) => {
    if (!open) {
      searchParams.delete('new');
      searchParams.delete('edit');
      setSearchParams(searchParams);
    } else {
      searchParams.set('new', 'true');
      setSearchParams(searchParams);
    }
  };

  // Recipe Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [yieldQuantity, setYieldQuantity] = useState('1');
  const [yieldUnit, setYieldUnit] = useState('porções');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState('60');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<{ ingredient_id: string; quantity: string }>>([
    { ingredient_id: '', quantity: '' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes(searchTerm);
    fetchIngredients();
    fetchSettings();
  }, [searchTerm]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setYieldQuantity('1');
    setYieldUnit('porções');
    setPrepTimeMinutes('60');
    setNotes('');
    setItems(
      ingredients.length > 0
        ? [{ ingredient_id: ingredients[0].id, quantity: '100' }]
        : [{ ingredient_id: '', quantity: '' }]
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(recipe.id);
    setName(recipe.name);
    setDescription(recipe.description || '');
    setYieldQuantity(recipe.yield_quantity.toString());
    setYieldUnit(recipe.yield_unit);
    setPrepTimeMinutes(recipe.prep_time_minutes.toString());
    setNotes(recipe.notes || '');

    if (recipe.items && recipe.items.length > 0) {
      setItems(
        recipe.items.map((it) => ({
          ingredient_id: it.ingredient_id,
          quantity: it.quantity.toString(),
        }))
      );
    } else {
      setItems([{ ingredient_id: '', quantity: '' }]);
    }

    setFormError(null);
    searchParams.set('edit', recipe.id);
    setSearchParams(searchParams);
  };

  const handleAddItem = () => {
    const firstIngId = ingredients[0]?.id || '';
    setItems([...items, { ingredient_id: firstIngId, quantity: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'ingredient_id' | 'quantity', value: string) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validItems = items
      .filter((it) => it.ingredient_id && parseFloat(it.quantity) > 0)
      .map((it) => ({
        ingredient_id: it.ingredient_id,
        quantity: parseFloat(it.quantity),
      }));

    if (validItems.length === 0) {
      setFormError('Adicione pelo menos 1 ingrediente com quantidade válida.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      yield_quantity: parseFloat(yieldQuantity) || 1,
      yield_unit: yieldUnit.trim() || 'porções',
      prep_time_minutes: parseInt(prepTimeMinutes, 10) || 0,
      notes: notes.trim() || null,
      items: validItems,
    };

    let result;
    if (editingId) {
      result = await updateRecipe(editingId, payload);
    } else {
      result = await createRecipe(payload);
    }

    if (result) {
      setIsModalOpen(false);
      fetchRecipes();
    } else {
      setFormError('Erro ao salvar receita. Verifique os dados preenchidos.');
    }
  };

  const handleDelete = async (id: string, recipeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Deseja excluir a receita "${recipeName}"?`)) {
      await deleteRecipe(id);
    }
  };

  const previewIngredientsCost = items.reduce((sum, it) => {
    const ing = ingredients.find((i) => i.id === it.ingredient_id);
    const qty = parseFloat(it.quantity) || 0;
    if (ing && qty > 0) {
      return sum + qty * ing.cost_per_unit_brl;
    }
    return sum;
  }, 0);

  const previewLaborCost = ((parseInt(prepTimeMinutes, 10) || 0) / 60) * settings.labor_cost_per_hour_brl;
  const previewBaseCost = previewIngredientsCost + previewLaborCost;
  const previewTotalCost = previewBaseCost * (1 + settings.overhead_pct / 100);
  const previewSellingPrice = previewTotalCost * (1 + settings.profit_margin_pct / 100);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar receita pelo nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 rounded-xl border border-[#E5DDD0] bg-white pl-9 pr-3 text-sm text-[#212529] placeholder:text-slate-400 focus:border-[#E85D04] focus:outline-none focus:ring-1 focus:ring-[#E85D04]/20 shadow-2xs"
          />
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Nova Receita
        </Button>
      </div>

      {/* Main Table Surface (Zero cards inside cards) */}
      <div className="bg-white rounded-2xl border border-[#E5DDD0] shadow-soft overflow-hidden">
        {recipes.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#E85D04] flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="font-bold text-[#212529] font-heading">
                {searchTerm ? 'Nenhuma receita encontrada' : 'Nenhuma receita cadastrada'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm
                  ? `Nenhum resultado para "${searchTerm}".`
                  : 'Cadastre sua primeira receita para apurar custos e margens de venda.'}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              leftIcon={<Plus className="w-4 h-4" />}
              className="mt-2"
            >
              Criar Primeira Receita
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5DDD0] bg-[#FDFBF7] text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Receita</th>
                  <th className="py-3.5 px-4">Rendimento & Tempo</th>
                  <th className="py-3.5 px-4 text-right">Custo de Produção</th>
                  <th className="py-3.5 px-4 text-right">Preço Sugerido</th>
                  <th className="py-3.5 px-4 text-right">Preço / Porção</th>
                  <th className="py-3.5 px-4 text-center">Margem</th>
                  <th className="py-3.5 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD0]/60">
                {recipes.map((recipe) => {
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
                          <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {recipe.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">
                            {recipe.yield_quantity} {recipe.yield_unit}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            {recipe.prep_time_minutes} min
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-700 font-medium">
                        R$ {costPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums">
                        <span className="font-extrabold text-[#E85D04] text-base font-heading">
                          R$ {sellingPrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-600 font-medium text-xs">
                        R$ {portionPrice.toFixed(2)} /{recipe.yield_unit.replace(/s$/, '')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="sage" size="sm">
                          +{profitMargin.toFixed(0)}%
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => handleOpenEdit(recipe, e)}
                            title="Editar receita"
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(recipe.id, recipe.name, e)}
                            title="Excluir receita"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <span
                            onClick={() => navigate(`/recipes/${recipe.id}`)}
                            className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#E85D04] pl-2 hover:underline cursor-pointer"
                          >
                            Ver <ChevronRight className="w-3.5 h-3.5" />
                          </span>
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
        title={editingId ? 'Editar Ficha Técnica' : 'Nova Receita & Ficha Técnica'}
        subtitle="Informe rendimento, tempo e insumos para compor o custo"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Nome da Receita"
            placeholder="Ex: Bolo de Cenoura com Chocolate, Pão Artesanal..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Rendimento (Qtd)"
              type="number"
              step="any"
              placeholder="Ex: 12"
              inputMode="decimal"
              value={yieldQuantity}
              onChange={(e) => setYieldQuantity(e.target.value)}
              required
            />

            <Input
              label="Unidade de Rendimento"
              placeholder="Ex: fatias, unidades, potes..."
              value={yieldUnit}
              onChange={(e) => setYieldUnit(e.target.value)}
              required
            />

            <Input
              label="Tempo de Preparo (min)"
              type="number"
              placeholder="Ex: 60"
              inputMode="numeric"
              value={prepTimeMinutes}
              onChange={(e) => setPrepTimeMinutes(e.target.value)}
              helperText="Calcula custo de mão de obra"
            />
          </div>

          <Input
            label="Descrição Curta (Opcional)"
            placeholder="Ex: Massa amanteigada de cenoura com cobertura aveludada..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Dynamic Ingredients Section */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-heading text-[#212529]">
                Insumos Utilizados
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#E85D04]" />}
              >
                Adicionar Insumo
              </Button>
            </div>

            {ingredients.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Você ainda não tem ingredientes cadastrados. Cadastre insumos primeiro na despensa.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {items.map((item, index) => {
                  const selectedIng = ingredients.find((i) => i.id === item.ingredient_id);
                  const itemUnit = selectedIng?.unit || 'g';
                  const itemQty = parseFloat(item.quantity) || 0;
                  const itemCost = selectedIng ? itemQty * selectedIng.cost_per_unit_brl : 0;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[#FDFBF7] border border-[#E5DDD0]"
                    >
                      <select
                        value={item.ingredient_id}
                        onChange={(e) => handleItemChange(index, 'ingredient_id', e.target.value)}
                        className="flex-1 min-h-[40px] rounded-lg border border-[#E5DDD0] bg-white px-2.5 py-1 text-xs sm:text-sm text-[#212529] focus:border-[#E85D04] focus:outline-none cursor-pointer"
                      >
                        <option value="">Selecione o insumo...</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit}) — R$ {ing.cost_per_unit_brl < 0.01 ? ing.cost_per_unit_brl.toFixed(4) : ing.cost_per_unit_brl.toFixed(2)}/{ing.unit}
                          </option>
                        ))}
                      </select>

                      <div className="w-28 relative">
                        <input
                          type="number"
                          step="any"
                          placeholder="Qtd"
                          inputMode="decimal"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full min-h-[40px] rounded-lg border border-[#E5DDD0] bg-white px-2.5 py-1 pr-8 text-xs sm:text-sm text-[#212529] focus:border-[#E85D04] focus:outline-none tabular-nums"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 select-none">
                          {itemUnit}
                        </span>
                      </div>

                      <span className="w-20 text-right text-xs font-bold text-[#2D6A4F] tabular-nums hidden sm:block">
                        R$ {itemCost.toFixed(2)}
                      </span>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time Calculation Summary in Modal */}
          <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Insumos: R$ {previewIngredientsCost.toFixed(2)}</span>
              <span>Mão de Obra ({prepTimeMinutes}m): R$ {previewLaborCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-orange-200/50">
              <div>
                <span className="text-[11px] text-slate-500 block">Custo Total ({settings.overhead_pct}% overhead)</span>
                <span className="text-sm font-bold text-slate-800 tabular-nums">
                  R$ {previewTotalCost.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Preço Sugerido (+{settings.profit_margin_pct}% lucro)</span>
                <span className="text-lg font-black text-[#E85D04] tabular-nums font-heading">
                  R$ {previewSellingPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Salvar Alterações' : 'Salvar Receita'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
