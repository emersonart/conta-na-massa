<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIngredientRequest;
use App\Http\Requests\UpdateIngredientRequest;
use App\Http\Resources\IngredientResource;
use App\Models\Ingredient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class IngredientController extends Controller
{
    /**
     * List user ingredients with optional search and pagination.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->ingredients();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $perPage = min(100, max(1, (int) $request->input('per_page', 25)));
        $ingredients = $query->orderBy('name', 'asc')->paginate($perPage);

        return IngredientResource::collection($ingredients);
    }

    /**
     * Create new ingredient for authenticated user.
     */
    public function store(StoreIngredientRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = $request->user()->id;

        $ingredient = Ingredient::create($validated);

        return (new IngredientResource($ingredient))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show ingredient details.
     */
    public function show(Request $request, Ingredient $ingredient): IngredientResource
    {
        abort_if($ingredient->user_id !== $request->user()->id, 404);

        return new IngredientResource($ingredient);
    }

    /**
     * Update existing ingredient.
     */
    public function update(UpdateIngredientRequest $request, Ingredient $ingredient): IngredientResource
    {
        abort_if($ingredient->user_id !== $request->user()->id, 404);

        $ingredient->update($request->validated());

        return new IngredientResource($ingredient);
    }

    /**
     * Delete ingredient.
     */
    public function destroy(Request $request, Ingredient $ingredient): JsonResponse
    {
        abort_if($ingredient->user_id !== $request->user()->id, 404);

        $ingredient->delete();

        return response()->json([
            'message' => 'Ingrediente excluído com sucesso.',
        ]);
    }
}
