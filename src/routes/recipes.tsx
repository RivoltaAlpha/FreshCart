import { createFileRoute } from '@tanstack/react-router'
import RecipeRecommendation from '@/components/RecipeRecommendation'
import { type RecipeWithIngredients } from '@/services/recipeService'

export const Route = createFileRoute('/recipes')({
    component: RecipesPage,
})

function RecipesPage() {
    const handleAddToCart = (recipe: RecipeWithIngredients) => {
        console.log('Recipe ingredients added to cart:', recipe.name);
        // Integration with your existing cart system
        // You can add additional logic here to sync with your global cart state
    };

    const userPreferences = {
        cuisine: 'kenyan',
        dietary: ['halal'],
        cookingTime: 60,
        servings: 4
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <RecipeRecommendation
                    onAddToCart={handleAddToCart}
                    userPreferences={userPreferences}
                />
            </div>
        </div>
    );
}

export default RecipesPage;
