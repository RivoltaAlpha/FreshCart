import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Users, DollarSign, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import RecipeService, { type Recipe, type RecipeWithIngredients } from '../services/recipeService';

interface RecipeRecommendationProps {
    onAddToCart?: (recipe: RecipeWithIngredients) => void;
    userPreferences?: {
        cuisine?: string;
        dietary?: string[];
        cookingTime?: number;
        servings?: number;
    };
}

const RecipeRecommendation: React.FC<RecipeRecommendationProps> = ({
    onAddToCart,
    userPreferences = {}
}) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithIngredients | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [recipeService] = useState(new RecipeService());

    // Initialize with recipe suggestions
    useEffect(() => {
        loadRecipeSuggestions();
    }, []);

    const loadRecipeSuggestions = async () => {
        setLoading(true);
        try {
            const suggestions = await recipeService.getRecipeSuggestions({
                ...userPreferences,
                mealType: 'dinner'
            }, 6);
            setRecipes(suggestions);
        } catch (error) {
            console.error('Error loading recipe suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecipeSelect = async (recipe: Recipe) => {
        setLoading(true);
        try {
            const recipeWithIngredients = await recipeService.getRecipeWithIngredients(recipe.id);
            if (recipeWithIngredients) {
                setSelectedRecipe(recipeWithIngredients);
            }
        } catch (error) {
            console.error('Error loading recipe details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRecipeToCart = async () => {
        if (!selectedRecipe) return;

        setLoading(true);
        try {
            const result = await recipeService.addRecipeToCart(selectedRecipe);

            if (result.success) {
                onAddToCart?.(selectedRecipe);
                alert(`Added ${result.addedItems.length} ingredients to cart! Total: KSh ${result.totalCost.toFixed(2)}`);

                if (result.unavailableItems.length > 0) {
                    alert(`Note: ${result.unavailableItems.length} ingredients are not available in nearby stores.`);
                }
            } else {
                alert('Unable to add ingredients to cart. Please try again.');
            }
        } catch (error) {
            console.error('Error adding recipe to cart:', error);
            alert('Error adding ingredients to cart.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadRecipeSuggestions();
            return;
        }

        setLoading(true);
        try {
            const searchResults = await recipeService.searchRecipes(searchQuery);
            setRecipes(searchResults);
        } catch (error) {
            console.error('Error searching recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'hard': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getAvailabilityStatus = (recipe: RecipeWithIngredients) => {
        const percentage = (recipe.availableIngredients / recipe.ingredients.length) * 100;
        if (percentage >= 80) return { color: 'text-green-600', text: 'Most ingredients available' };
        if (percentage >= 50) return { color: 'text-yellow-600', text: 'Some ingredients available' };
        return { color: 'text-red-600', text: 'Few ingredients available' };
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                    <ChefHat className="h-8 w-8 text-fresh-primary mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900">What's for Dinner?</h1>
                </div>
                <p className="text-xl text-gray-600">
                    AI-powered recipe suggestions with instant ingredient shopping
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for recipes... (e.g., 'chicken curry', 'vegetarian pasta')"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fresh-primary focus:border-fresh-primary"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-6 py-3 bg-fresh-primary text-white rounded-lg hover:bg-fresh-secondary transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search Recipes'}
                    </button>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={loadRecipeSuggestions}
                        className="px-4 py-2 bg-fresh-accent text-white rounded-md hover:bg-fresh-secondary transition-colors"
                    >
                        ✨ AI Suggestions
                    </button>
                    <button
                        onClick={() => setSearchQuery('vegetarian')}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                        🥬 Vegetarian
                    </button>
                    <button
                        onClick={() => setSearchQuery('quick')}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                        ⚡ Quick Meals
                    </button>
                    <button
                        onClick={() => setSearchQuery('kenyan')}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                        🇰🇪 Kenyan Cuisine
                    </button>
                </div>
            </div>

            {/* Recipe Grid */}
            {!selectedRecipe && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {loading && recipes.length === 0 ? (
                        // Loading skeletons
                        Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-300"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                                    <div className="flex gap-2 mb-3">
                                        <div className="h-6 w-16 bg-gray-300 rounded"></div>
                                        <div className="h-6 w-16 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        recipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleRecipeSelect(recipe)}
                            >
                                <img
                                    src={recipe.image || 'https://via.placeholder.com/400x300?text=Recipe+Image'}
                                    alt={recipe.name}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = './register.jpg'; // Fallback image
                                    }}
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>

                                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {recipe.cookingTime}m
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-1" />
                                            {recipe.servings}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                                            {recipe.difficulty}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {recipe.cuisine}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {recipe.tags && recipe.tags.slice(0, 3).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="text-xs bg-fresh-accent text-white px-2 py-1 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Selected Recipe Detail */}
            {selectedRecipe && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="md:flex">
                        {/* Recipe Image */}
                        <div className="md:w-1/2">
                            <img
                                src={selectedRecipe.image || 'https://via.placeholder.com/600x400?text=Recipe+Image'}
                                alt={selectedRecipe.name}
                                className="w-full h-64 md:h-full object-cover"
                            />
                        </div>

                        {/* Recipe Details */}
                        <div className="md:w-1/2 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedRecipe.name}</h2>
                                    <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedRecipe(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                                    <span>{selectedRecipe.cookingTime} minutes</span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                                    <span>{selectedRecipe.servings} servings</span>
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                                    <span>KSh {selectedRecipe.estimatedCost.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                                        {selectedRecipe.difficulty}
                                    </span>
                                </div>
                            </div>

                            {/* Availability Status */}
                            <div className="mb-6">
                                <div className={`flex items-center ${getAvailabilityStatus(selectedRecipe).color} mb-2`}>
                                    <CheckCircle className="h-5 w-5 mr-2" />
                                    <span className="font-medium">{getAvailabilityStatus(selectedRecipe).text}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {selectedRecipe.availableIngredients} of {selectedRecipe.ingredients.length} ingredients available nearby
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddRecipeToCart}
                                disabled={loading || selectedRecipe.availableIngredients === 0}
                                className="w-full bg-fresh-primary text-white py-3 px-4 rounded-lg hover:bg-fresh-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                {loading ? 'Adding to Cart...' : `Add Ingredients to Cart (KSh ${selectedRecipe.estimatedCost.toFixed(2)})`}
                            </button>
                        </div>
                    </div>

                    {/* Ingredients List */}
                    <div className="border-t p-6">
                        <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedRecipe.ingredients && selectedRecipe.ingredients.map((ingredient, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${ingredient.product ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        {ingredient.product ? (
                                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                                        )}
                                        <div>
                                            <span className="font-medium">{ingredient.name}</span>
                                            <div className="text-sm text-gray-600">
                                                {ingredient.quantity} {ingredient.unit}
                                            </div>
                                        </div>
                                    </div>
                                    {ingredient.product && (
                                        <div className="text-right">
                                            <div className="font-medium text-green-600">
                                                KSh {parseFloat(ingredient.product.price).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {ingredient.product.name}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cooking Instructions */}
                    <div className="border-t p-6">
                        <h3 className="text-lg font-semibold mb-4">Instructions</h3>
                        <ol className="space-y-3">
                            {selectedRecipe.instructions && selectedRecipe.instructions.map((instruction, index) => (
                                <li key={index} className="flex">
                                    <span className="flex-shrink-0 w-6 h-6 bg-fresh-primary text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                        {index + 1}
                                    </span>
                                    <span className="text-gray-700">{instruction}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Nutritional Information */}
                    {selectedRecipe.nutritionalInfo && (
                        <div className="border-t p-6 bg-gray-50">
                            <h3 className="text-lg font-semibold mb-4">Nutritional Information (per serving)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="font-semibold text-lg">{selectedRecipe.nutritionalInfo.calories}</div>
                                    <div className="text-sm text-gray-600">Calories</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-lg">{selectedRecipe.nutritionalInfo.protein}</div>
                                    <div className="text-sm text-gray-600">Protein</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-lg">{selectedRecipe.nutritionalInfo.carbs}</div>
                                    <div className="text-sm text-gray-600">Carbs</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-lg">{selectedRecipe.nutritionalInfo.fat}</div>
                                    <div className="text-sm text-gray-600">Fat</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && recipes.length === 0 && (
                <div className="text-center py-12">
                    <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                    <p className="text-gray-600 mb-4">Try searching for different ingredients or cuisine types.</p>
                    <button
                        onClick={loadRecipeSuggestions}
                        className="px-4 py-2 bg-fresh-primary text-white rounded-lg hover:bg-fresh-secondary transition-colors"
                    >
                        Get AI Suggestions
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecipeRecommendation;
