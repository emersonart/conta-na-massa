<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRecipeRequest;
use App\Http\Requests\UpdateRecipeRequest;
use App\Http\Resources\RecipeResource;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class RecipeController extends Controller
{
    /**
     * List user recipes.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->recipes()->with('items.ingredient');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $perPage = min(100, max(1, (int) $request->input('per_page', 25)));
        $recipes = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return RecipeResource::collection($recipes);
    }

    /**
     * Store new recipe with ingredients.
     */
    public function store(StoreRecipeRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $recipe = DB::transaction(function () use ($validated, $user) {
            $recipe = Recipe::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'yield_quantity' => $validated['yield_quantity'],
                'yield_unit' => $validated['yield_unit'],
                'prep_time_minutes' => $validated['prep_time_minutes'] ?? 0,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                // Ensure ingredient belongs to this user
                $ingredient = $user->ingredients()->where('id', $item['ingredient_id'])->firstOrFail();

                RecipeIngredient::create([
                    'recipe_id' => $recipe->id,
                    'ingredient_id' => $ingredient->id,
                    'quantity' => $item['quantity'],
                ]);
            }

            return $recipe;
        });

        $recipe->load('items.ingredient');

        return (new RecipeResource($recipe))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show single recipe details with cost metrics.
     */
    public function show(Request $request, Recipe $recipe): RecipeResource
    {
        abort_if($recipe->user_id !== $request->user()->id, 404);

        $recipe->load('items.ingredient');

        return new RecipeResource($recipe);
    }

    /**
     * Update existing recipe.
     */
    public function update(UpdateRecipeRequest $request, Recipe $recipe): RecipeResource
    {
        abort_if($recipe->user_id !== $request->user()->id, 404);

        $validated = $request->validated();
        $user = $request->user();

        DB::transaction(function () use ($recipe, $validated, $user) {
            $recipe->update([
                'name' => $validated['name'] ?? $recipe->name,
                'description' => array_key_exists('description', $validated) ? $validated['description'] : $recipe->description,
                'yield_quantity' => $validated['yield_quantity'] ?? $recipe->yield_quantity,
                'yield_unit' => $validated['yield_unit'] ?? $recipe->yield_unit,
                'prep_time_minutes' => array_key_exists('prep_time_minutes', $validated) ? $validated['prep_time_minutes'] : $recipe->prep_time_minutes,
                'notes' => array_key_exists('notes', $validated) ? $validated['notes'] : $recipe->notes,
            ]);

            if (isset($validated['items']) && is_array($validated['items'])) {
                // Delete old items and insert updated items
                $recipe->items()->delete();

                foreach ($validated['items'] as $item) {
                    $ingredient = $user->ingredients()->where('id', $item['ingredient_id'])->firstOrFail();

                    RecipeIngredient::create([
                        'recipe_id' => $recipe->id,
                        'ingredient_id' => $ingredient->id,
                        'quantity' => $item['quantity'],
                    ]);
                }
            }
        });

        $recipe->load('items.ingredient');

        return new RecipeResource($recipe);
    }

    /**
     * Delete recipe.
     */
    public function destroy(Request $request, Recipe $recipe): JsonResponse
    {
        abort_if($recipe->user_id !== $request->user()->id, 404);

        $recipe->delete();

        return response()->json([
            'message' => 'Receita excluída com sucesso.',
        ]);
    }
}
