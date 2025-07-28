import { createFileRoute } from '@tanstack/react-router'
import RecipeRecommendation from '@/components/RecipeRecommendation'
import { type RecipeWithIngredients } from '@/services/recipeService'
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import * as motion from "motion/react-client";


export const Route = createFileRoute('/recipes')({
    component: RouteComponent,
})

function RouteComponent() {
    const handleAddToCart = (recipe: RecipeWithIngredients) => {
        console.log('Recipe ingredients added to cart:', recipe.name);
    };

    const userPreferences = {
        cuisine: 'kenyan',
        dietary: ['halal'],
        cookingTime: 60,
        servings: 4
    };

    return (
        <>

            <Header />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.6,
                            rotate: { duration: 0.6, ease: "easeOut" }
                        }}
                    >
                        <RecipeRecommendation
                            onAddToCart={handleAddToCart}
                            userPreferences={userPreferences}
                        />
                    </motion.div>
                </div>
            </div>
            <Footer />
        </>
    );
}

