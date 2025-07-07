// Recipe service for AI-powered recipe suggestions and ingredient shopping
import { GoogleGenerativeAI } from '@google/generative-ai'
import ChatbotApiService, { type ApiProduct } from './chatbotApiService'

export interface Recipe {
  id: string
  name: string
  description: string
  cuisine: string
  difficulty: 'easy' | 'medium' | 'hard'
  cookingTime: number // in minutes
  servings: number
  instructions: string[]
  image?: string
  tags: string[]
  nutritionalInfo?: {
    calories: number
    protein: string
    carbs: string
    fat: string
  }
}

export interface RecipeIngredient {
  productId?: number
  name: string
  quantity: string
  unit: string
  isOptional?: boolean
  notes?: string
  product?: ApiProduct // Matched product from inventory
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: RecipeIngredient[]
  estimatedCost: number
  availableIngredients: number
  missingIngredients: RecipeIngredient[]
}

export interface RecipeSearchFilters {
  cuisine?: string
  difficulty?: string
  maxCookingTime?: number
  maxServings?: number
  dietary?: string[] // vegetarian, vegan, gluten-free, etc.
  availableIngredients?: string[]
}

class RecipeService {
  private apiService: ChatbotApiService
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null

  constructor() {
    this.apiService = new ChatbotApiService()
    this.initializeAI()
  }

  private initializeAI() {
    const apiKey = import.meta.env?.VITE_GEMINI_API_KEY
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey)
        this.model = this.genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
        })
      } catch (error) {
        console.error('Failed to initialize Gemini AI for recipes:', error)
      }
    }
  }

  // Get AI-powered recipe suggestions based on user preferences
  async getRecipeSuggestions(
    preferences: {
      cuisine?: string
      mealType?: string // breakfast, lunch, dinner, snack
      dietary?: string[]
      cookingTime?: number
      servings?: number
      ingredients?: string[]
    },
    limit: number = 5,
  ): Promise<Recipe[]> {
    if (!this.model) {
      return this.getFallbackRecipes(limit)
    }

    try {
      const prompt = `
        Suggest ${limit} recipes based on these preferences:
        Cuisine: ${preferences.cuisine || 'any'}
        Meal Type: ${preferences.mealType || 'any'}
        Dietary Requirements: ${preferences.dietary?.join(', ') || 'none'}
        Max Cooking Time: ${preferences.cookingTime || 60} minutes
        Servings: ${preferences.servings || 4}
        Preferred Ingredients: ${preferences.ingredients?.join(', ') || 'any'}
        search for recipe image from the web 
        Focus on recipes that are popular in Kenya and use commonly available ingredients.
        
        Focus on popular Kenyan and international dishes that use commonly available ingredients.
        
        Return a JSON array of recipes with this exact format:
        [{
          "id": "unique-id",
          "name": "Recipe Name",
          "description": "Brief description",
          "cuisine": "cuisine type",
          "difficulty": "easy|medium|hard",
          "cookingTime": number_in_minutes,
          "servings": number,
          "instructions": ["step 1", "step 2", "step 3"],
          "tags": ["tag1", "tag2"],
          "nutritionalInfo": {
            "calories": number,
            "protein": "amount",
            "carbs": "amount", 
            "fat": "amount"
          }
        }]
        
        Return ONLY the JSON array, no additional text.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const cleanedText = text.replace(/```json|```/g, '').trim()
      const recipes = JSON.parse(cleanedText) as Recipe[]

      return recipes.map((recipe) => ({
        ...recipe,
        id: recipe.id || `recipe-${Date.now()}-${Math.random()}`,
        name: recipe.name || 'Unknown Recipe',
        description: recipe.description || 'No description available',
        cuisine: recipe.cuisine || 'International',
        difficulty: recipe.difficulty || 'medium',
        cookingTime: recipe.cookingTime || 30,
        servings: recipe.servings || 4,
        image: this.getRecipeImage(recipe.name || 'default'),
        tags: recipe.tags || [],
        instructions: recipe.instructions || [],
        nutritionalInfo: recipe.nutritionalInfo || {
          calories: 0,
          protein: '0g',
          carbs: '0g',
          fat: '0g',
        },
      }))
    } catch (error) {
      console.error('Error getting AI recipe suggestions:', error)
      return this.getFallbackRecipes(limit)
    }
  }

  // Get recipe with matched ingredients from available products
  async getRecipeWithIngredients(
    recipeId: string,
  ): Promise<RecipeWithIngredients | null> {
    try {
      // First, get the recipe details with ingredients
      const recipeWithIngredients =
        await this.generateRecipeIngredients(recipeId)
      if (!recipeWithIngredients) return null

      // Get all available products
      const availableProducts = await this.apiService.getAllProducts()

      // Match ingredients with available products
      const matchedIngredients = await this.matchIngredientsWithProducts(
        recipeWithIngredients.ingredients,
        availableProducts,
      )

      const availableCount = matchedIngredients.filter(
        (ing) => ing.product,
      ).length
      const missingIngredients = matchedIngredients.filter(
        (ing) => !ing.product,
      )
      const estimatedCost = matchedIngredients
        .filter((ing) => ing.product)
        .reduce((sum, ing) => sum + parseFloat(ing.product!.price), 0)

      return {
        ...recipeWithIngredients,
        ingredients: matchedIngredients,
        availableIngredients: availableCount,
        missingIngredients,
        estimatedCost,
      }
    } catch (error) {
      console.error('Error getting recipe with ingredients:', error)
      return null
    }
  }

  // Generate detailed recipe with ingredients using AI
  private async generateRecipeIngredients(
    recipeId: string,
  ): Promise<(Recipe & { ingredients: RecipeIngredient[] }) | null> {
    if (!this.model) return null

    try {
      const prompt = `
        Generate a detailed recipe with ingredients for recipe ID: ${recipeId}
        
        Focus on recipes popular in Kenya using commonly available ingredients.
        Include specific quantities and measurements.
        
        Return JSON with this exact format:
        {
          "id": "${recipeId}",
          "name": "Recipe Name",
          "description": "Brief description",
          "cuisine": "cuisine type",
          "difficulty": "easy|medium|hard",
          "cookingTime": number_in_minutes,
          "servings": number,
          "instructions": ["detailed step 1", "detailed step 2"],
          "tags": ["tag1", "tag2"],
          "ingredients": [
            {
              "name": "ingredient name",
              "quantity": "amount",
              "unit": "unit (kg, g, pieces, cups, etc)",
              "isOptional": false,
              "notes": "preparation notes if any"
            }
          ],
          "nutritionalInfo": {
            "calories": number,
            "protein": "amount",
            "carbs": "amount",
            "fat": "amount"
          }
        }
        
        Return ONLY the JSON object, no additional text.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const cleanedText = text.replace(/```json|```/g, '').trim()
      const recipe = JSON.parse(cleanedText)

      // Add image using our image service
      return {
        ...recipe,
        name: recipe.name || 'Unknown Recipe',
        description: recipe.description || 'No description available',
        cuisine: recipe.cuisine || 'International',
        difficulty: recipe.difficulty || 'medium',
        cookingTime: recipe.cookingTime || 30,
        servings: recipe.servings || 4,
        image: this.getRecipeImage(recipe.name || 'default'),
        tags: recipe.tags || [],
        instructions: recipe.instructions || [],
        nutritionalInfo: recipe.nutritionalInfo || {
          calories: 0,
          protein: '0g',
          carbs: '0g',
          fat: '0g',
        },
      }
    } catch (error) {
      console.error('Error generating recipe ingredients:', error)
      return null
    }
  }

  // Match recipe ingredients with available products
  private async matchIngredientsWithProducts(
    ingredients: RecipeIngredient[],
    products: ApiProduct[],
  ): Promise<RecipeIngredient[]> {
    return ingredients.map((ingredient) => {
      // Try to find exact or close matches
      const matches = products.filter((product) => {
        const productName = product.name.toLowerCase()
        const ingredientName = ingredient.name.toLowerCase()

        // Check for exact match
        if (
          productName.includes(ingredientName) ||
          ingredientName.includes(productName)
        ) {
          return true
        }

        // Check for partial matches (e.g., "tomato" matches "fresh tomatoes")
        const ingredientWords = ingredientName.split(' ')
        const productWords = productName.split(' ')

        return ingredientWords.some((word) =>
          productWords.some((pWord) => word.length > 3 && pWord.includes(word)),
        )
      })

      // Select the best match (prefer exact matches, then by rating)
      const bestMatch =
        matches.length > 0
          ? matches.sort(
              (a, b) => parseFloat(b.rating) - parseFloat(a.rating),
            )[0]
          : undefined

      return {
        ...ingredient,
        product: bestMatch,
        productId: bestMatch?.product_id,
      }
    })
  }

  // Get recipe suggestions based on available ingredients
  async getRecipesByIngredients(
    availableIngredients: string[],
  ): Promise<Recipe[]> {
    if (!this.model) {
      return this.getFallbackRecipes(3)
    }

    try {
      const prompt = `
        Suggest 5 recipes that can be made with these available ingredients:
        ${availableIngredients.join(', ')}
        
        Focus on popular Kenyan dishes and international recipes.
        Prioritize recipes that use most of the available ingredients.
        It's okay if recipes need 1-2 additional common ingredients.
        
        Return recipes as JSON array with the same format as before.
        Return ONLY the JSON array, no additional text.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const cleanedText = text.replace(/```json|```/g, '').trim()
      const recipes = JSON.parse(cleanedText) as Recipe[]

      return recipes.map((recipe) => ({
        ...recipe,
        id: recipe.id || `ingredient-recipe-${Date.now()}-${Math.random()}`,
        name: recipe.name || 'Unknown Recipe',
        description: recipe.description || 'No description available',
        cuisine: recipe.cuisine || 'International',
        difficulty: recipe.difficulty || 'medium',
        cookingTime: recipe.cookingTime || 30,
        servings: recipe.servings || 4,
        image: this.getRecipeImage(recipe.name || 'default'),
        tags: recipe.tags || [],
        instructions: recipe.instructions || [],
        nutritionalInfo: recipe.nutritionalInfo || {
          calories: 0,
          protein: '0g',
          carbs: '0g',
          fat: '0g',
        },
      }))
    } catch (error) {
      console.error('Error getting recipes by ingredients:', error)
      return this.getFallbackRecipes(3)
    }
  }

  // Add all recipe ingredients to cart
  async addRecipeToCart(recipe: RecipeWithIngredients): Promise<{
    success: boolean
    addedItems: ApiProduct[]
    unavailableItems: RecipeIngredient[]
    totalCost: number
  }> {
    const addedItems: ApiProduct[] = []
    const unavailableItems: RecipeIngredient[] = []
    let totalCost = 0

    for (const ingredient of recipe.ingredients) {
      if (ingredient.product) {
        try {
          const success = await this.apiService.addToCart(
            ingredient.product.product_id,
            1,
          )
          if (success) {
            addedItems.push(ingredient.product)
            totalCost += parseFloat(ingredient.product.price)
          } else {
            unavailableItems.push(ingredient)
          }
        } catch (error) {
          console.error(`Error adding ${ingredient.name} to cart:`, error)
          unavailableItems.push(ingredient)
        }
      } else {
        unavailableItems.push(ingredient)
      }
    }

    return {
      success: addedItems.length > 0,
      addedItems,
      unavailableItems,
      totalCost,
    }
  }

  // Get recipe image using free image sources
  private getRecipeImage(recipeName: string): string {
    // Handle undefined or null recipe names
    if (!recipeName || typeof recipeName !== 'string') {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80'
    }

    // Create different images based on recipe type for variety
    const recipeImageMap: Record<string, string> = {
      // Kenyan dishes
      pilau:
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&q=80',
      ugali:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=80',
      chapati:
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop&q=80',
      'nyama choma':
        'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&q=80',
      samosa:
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop&q=80',

      // General food categories
      chicken:
        'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop&q=80',
      beef: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&q=80',
      fish: 'https://tse4.mm.bing.net/th/id/OIP.p006NeEuWI0z2PwBywOlQgHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
      rice: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&q=80',
      pasta:
        'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=300&fit=crop&q=80',
      curry:
        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&q=80',
      soup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&q=80',
      salad:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80',
      bread: 'https://www.clubfitnessny.com/images/bread.jpg',
      vegetable:
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&q=80',
    }

    // Try to find a matching image based on recipe name keywords
    const lowerRecipeName = recipeName.toLowerCase()
    for (const [keyword, imageUrl] of Object.entries(recipeImageMap)) {
      if (lowerRecipeName.includes(keyword)) {
        return imageUrl
      }
    }

    // Default to a general food image if no specific match
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80'
  }

  // Fallback recipes when AI is not available
  private getFallbackRecipes(limit: number): Recipe[] {
    const fallbackRecipes: Recipe[] = [
      {
        id: 'pilau-1',
        name: 'Beef Pilau',
        description: 'Traditional Kenyan spiced rice dish with tender beef',
        cuisine: 'Kenyan',
        difficulty: 'medium',
        cookingTime: 60,
        servings: 6,
        instructions: [
          'Heat oil and brown the beef pieces',
          'Add onions and cook until golden',
          'Add pilau masala and cook for 2 minutes',
          'Add rice and mix well',
          'Add water and salt, bring to boil',
          'Reduce heat and simmer for 45 minutes',
        ],
        tags: ['kenyan', 'rice', 'beef', 'spicy'],
        image:
          'https://i.pinimg.com/originals/e9/f7/32/e9f732df68e63fd37e647dc6d7ab7285.jpg',
        nutritionalInfo: {
          calories: 450,
          protein: '25g',
          carbs: '45g',
          fat: '20g',
        },
      },
      {
        id: 'ugali-sukuma-2',
        name: 'Ugali with Sukuma Wiki',
        description:
          'Classic Kenyan meal with cornmeal and sautéed collard greens',
        cuisine: 'Kenyan',
        difficulty: 'easy',
        cookingTime: 30,
        servings: 4,
        instructions: [
          'Boil water in a heavy-bottomed pot',
          'Gradually add maize flour while stirring',
          'Cook and stir until thick and smooth',
          'In another pan, sauté onions and tomatoes',
          'Add chopped sukuma wiki and cook until tender',
          'Season with salt and serve hot',
        ],
        tags: ['kenyan', 'traditional', 'healthy', 'vegetarian'],
        image:
          'https://th.bing.com/th/id/R.0c7135cecd1b1c21ef2761c05bfa1cdf?rik=oGBigAxwvfIt%2fA&pid=ImgRaw&r=0',
        nutritionalInfo: {
          calories: 320,
          protein: '12g',
          carbs: '55g',
          fat: '8g',
        },
      },
      {
        id: 'chapati-3',
        name: 'Soft Chapati',
        description: 'Soft and flaky Kenyan flatbread perfect with any meal',
        cuisine: 'Kenyan',
        difficulty: 'medium',
        cookingTime: 45,
        servings: 8,
        instructions: [
          'Mix flour, salt, and oil in a bowl',
          'Add warm water gradually to form soft dough',
          'Knead for 10 minutes until smooth',
          'Rest for 30 minutes covered',
          'Roll out thin circles',
          'Cook on hot griddle until spotted',
        ],
        tags: ['kenyan', 'bread', 'vegetarian', 'side'],
        image:
          'https://judywanderi.net/wp-content/uploads/2021/03/20210224-IMG_7820-1536x1024.jpg',
        nutritionalInfo: {
          calories: 180,
          protein: '5g',
          carbs: '32g',
          fat: '4g',
        },
      },
    ]

    return fallbackRecipes.slice(0, limit)
  }

  // Search recipes by name or ingredients
  async searchRecipes(query: string): Promise<Recipe[]> {
    if (!this.model) {
      const fallback = this.getFallbackRecipes(10)
      return fallback.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query.toLowerCase()) ||
          recipe.description.toLowerCase().includes(query.toLowerCase()) ||
          recipe.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase()),
          ),
      )
    }

    try {
      const prompt = `
        Search for recipes related to: "${query}"
        
        Return 5 relevant recipes that match the search term.
        Include popular Kenyan and international dishes.
        
        Return recipes as JSON array with the standard format.
        Return ONLY the JSON array, no additional text.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const cleanedText = text.replace(/```json|```/g, '').trim()
      const recipes = JSON.parse(cleanedText) as Recipe[]

      return recipes.map((recipe) => ({
        ...recipe,
        id: recipe.id || `search-recipe-${Date.now()}-${Math.random()}`,
        name: recipe.name || 'Unknown Recipe',
        description: recipe.description || 'No description available',
        cuisine: recipe.cuisine || 'International',
        difficulty: recipe.difficulty || 'medium',
        cookingTime: recipe.cookingTime || 30,
        servings: recipe.servings || 4,
        image: this.getRecipeImage(recipe.name || 'default'),
        tags: recipe.tags || [],
        instructions: recipe.instructions || [],
        nutritionalInfo: recipe.nutritionalInfo || {
          calories: 0,
          protein: '0g',
          carbs: '0g',
          fat: '0g',
        },
      }))
    } catch (error) {
      console.error('Error searching recipes:', error)
      return this.getFallbackRecipes(3)
    }
  }
}

export default RecipeService
