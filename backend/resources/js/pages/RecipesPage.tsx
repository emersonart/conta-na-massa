import React, { useState, useEffect } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import { useIngredientStore } from '../stores/ingredientStore';
import { useCostStore } from '../stores/costStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { CostBreakdownChart } from '../components/ui/CostBreakdownChart';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Clock,
  ChevronRight,
  PlusCircle,
  X,
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

  // Real-time cost preview for the modal
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-[#212529] tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#E85D04]" /> Catálogo de Receitas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fichas técnicas completas com custos de insumos, mão de obra e preço de venda por porção.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Nova Receita
        </Button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Input
          placeholder="Buscar receita pelo nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefixText="🔍"
          className="bg-white"
        />
      </div>

      {/* Recipe Cards Grid */}
      {recipes.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-2 border-[#E5DDD0]">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#E85D04] flex items-center justify-center mx-auto text-xl">
            🥐
          </div>
          <h4 className="font-bold text-[#212529] font-heading mt-3">Nenhuma receita encontrada</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            {searchTerm
              ? `Nenhum resultado para "${searchTerm}".`
              : 'Cadastre sua primeira receita ou peça no Modo Vibe IA para criar automaticamente.'}
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="mt-4" leftIcon={<Plus className="w-4 h-4" />}>
            Criar Minha Primeira Receita
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => {
            const fin = recipe.financials;
            const profitMargin = fin?.profit_margin_pct ?? settings.profit_margin_pct;
            const sellingPrice = fin?.suggested_selling_price_brl ?? 0;
            const costPrice = fin?.total_cost_brl ?? 0;
            const portionPrice = fin?.price_per_portion_brl ?? 0;

            return (
              <Card
                key={recipe.id}
                hoverable
                onClick={() => navigate(`/recipes/${recipe.id}`)}
                className="flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-lg text-[#212529] font-heading group-hover:text-[#E85D04] transition-colors leading-snug">
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

                {/* Financial Summary & Breakdown Bar */}
                <div className="pt-3 border-t border-[#E5DDD0]/70 space-y-3">
                  {fin && <CostBreakdownChart financials={fin} compact />}

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FDFBF7] border border-[#E5DDD0]/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Custo ({recipe.yield_quantity} {recipe.yield_unit})
                      </span>
                      <p className="text-sm font-semibold text-slate-700 tabular-nums">
                        R$ {costPrice.toFixed(2)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#E85D04] tracking-wider">
                        Venda Total
                      </span>
                      <p className="text-lg font-black text-[#E85D04] tabular-nums font-heading">
                        R$ {sellingPrice.toFixed(2)}
                      </p>
                      <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                        (R$ {portionPrice.toFixed(2)} / {recipe.yield_unit.replace(/s$/, '')})
                      </span>
                    </div>
                  </div>

                  {/* Actions & Detail CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => handleOpenEdit(recipe, e)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Editar Receita"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(recipe.id, recipe.name, e)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Receita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-[#E85D04] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Ver Ficha Técnica <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Recipe Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Editar Ficha Técnica' : 'Nova Receita & Ficha Técnica'}
        subtitle="Informe o rendimento e os ingredientes com suas quantidades"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              ⚠️ {formError}
            </div>
          )}

          <Input
            label="Nome da Receita"
            placeholder="Ex: Bolo Vulcão de Ninho com Nutella, Pão Italiano..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              helperText="Usado para calcular a mão de obra"
            />
          </div>

          <Input
            label="Descrição Curta (Opcional)"
            placeholder="Ex: Massa amanteigada de cenoura com calda aveludada..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Dynamic Ingredients Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold font-heading text-[#212529]">
                Ingredientes Utilizados
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#E85D04]" />}
              >
                Adicionar Linha
              </Button>
            </div>

            {ingredients.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Você ainda não tem ingredientes cadastrados na despensa. Cadastre ingredientes primeiro ou crie via Modo Vibe IA.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {items.map((item, index) => {
                  const selectedIng = ingredients.find((i) => i.id === item.ingredient_id);
                  const itemUnit = selectedIng?.unit || 'g';
                  const itemQty = parseFloat(item.quantity) || 0;
                  const itemCost = selectedIng ? itemQty * selectedIng.cost_per_unit_brl : 0;

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5DDD0]"
                    >
                      {/* Ingredient Selector */}
                      <select
                        value={item.ingredient_id}
                        onChange={(e) => handleItemChange(index, 'ingredient_id', e.target.value)}
                        className="flex-1 min-h-[42px] rounded-lg border border-[#E5DDD0] bg-white px-2.5 py-1.5 text-xs sm:text-sm text-[#212529] focus:border-[#E85D04] focus:outline-none"
                      >
                        <option value="">Selecione o ingrediente...</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit}) — R$ {ing.cost_per_unit_brl < 0.01 ? ing.cost_per_unit_brl.toFixed(4) : ing.cost_per_unit_brl.toFixed(2)}/{ing.unit}
                          </option>
                        ))}
                      </select>

                      {/* Quantity */}
                      <div className="w-28 sm:w-32 relative">
                        <input
                          type="number"
                          step="any"
                          placeholder="Qtd"
                          inputMode="decimal"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full min-h-[42px] rounded-lg border border-[#E5DDD0] bg-white px-2.5 py-1.5 pr-8 text-xs sm:text-sm text-[#212529] focus:border-[#E85D04] focus:outline-none tabular-nums"
                        />
                        <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 select-none">
                          {itemUnit}
                        </span>
                      </div>

                      {/* Subtotal */}
                      <span className="w-20 text-right text-xs font-bold text-[#2D6A4F] tabular-nums hidden sm:block">
                        R$ {itemCost.toFixed(2)}
                      </span>

                      {/* Remove Button */}
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/80 via-amber-50/80 to-emerald-50/80 border border-orange-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Custo de Insumos: R$ {previewIngredientsCost.toFixed(2)}</span>
              <span>Mão de Obra ({prepTimeMinutes}m): R$ {previewLaborCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-orange-200/50">
              <div>
                <span className="text-[11px] text-slate-500 block">Custo Total c/ Overhead ({settings.overhead_pct}%)</span>
                <span className="text-sm font-bold text-slate-800 tabular-nums">
                  R$ {previewTotalCost.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Preço Sugerido c/ Lucro ({settings.profit_margin_pct}%)</span>
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
