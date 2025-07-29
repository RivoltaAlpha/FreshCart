import React, { useState, useRef, useEffect } from 'react'
import {
    Send,
    Bot,
    User,
    ShoppingCart,
    Search,
    Filter,
    Sun,
    Moon,
    X,
    Store,
    CreditCard,
    GroupIcon,
} from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ChatbotApiService, {
    type ApiProduct,
} from '../services/chatbotApiService'
import { getStoreHavingProduct } from '@/services/storeService'
import { storeActions } from '@/store/store'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategory'
import { useStores } from '@/hooks/useStore'

interface ChatMessage {
    id: string
    type: 'user' | 'bot'
    content: string
    timestamp: Date
    products?: ApiProduct[]
    suggestions?: string[]
    actions?: Array<{
        label: string
        action: () => void
        icon?: React.ReactNode
    }>
}

interface EnhancedChatbotProps {
    apiService?: ChatbotApiService
    onProductSelect?: (product: ApiProduct) => void
    onAddToCart?: (product: ApiProduct) => void
    onNavigateToProducts?: () => void
    onNavigateToCategory?: (categoryId: number) => void
    onNavigateToStores?: () => void
    onNavigateToCart?: () => void
    onNavigateToCheckout?: () => void
    userId?: number
}

const EnhancedChatbot: React.FC<EnhancedChatbotProps> = ({
    apiService = new ChatbotApiService(),
    onProductSelect,
    onAddToCart,
    onNavigateToCategory,
    onNavigateToStores,
    onNavigateToCart,
    onNavigateToCheckout,
    userId,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { data: products = [] } = useProducts()
    const { data: categories = [], refetch: refetchCategories } = useCategories()
    const [dataLoaded, setDataLoaded] = useState(false)
    const [loadingError, setLoadingError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isDarkMode, setIsDarkMode] = useState(false)

    // Initialize Gemini AI
    const getApiKey = (): string => {
        const envApiKey = import.meta.env?.VITE_GEMINI_API
        return envApiKey
    }

    const apiKey = getApiKey()
    const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
    const model = genAI
        ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
        : null

    // Load initial data from backend only
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true)
                setLoadingError(null)

                await Promise.all([
                    apiService.getAllProducts(),
                    apiService.getCategories(),
                    apiService.getStores(),
                ])

                // Data will be updated by hooks
                setDataLoaded(true)
            } catch (error) {
                console.error('Error loading initial data:', error)
                setLoadingError('Failed to load data from backend. Please try again.')
                setDataLoaded(false)
            } finally {
                setIsLoading(false)
            }
        }

        loadInitialData()
    }, [apiService])

    const stores = useStores()

    // Scroll to bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Initialize chatbot with welcome message only after data is loaded
    useEffect(() => {
        if (messages.length === 0 && dataLoaded && categories.length > 0) {
            const welcomeMessage: ChatMessage = {
                id: '1',
                type: 'bot',
                content: `Hello! 👋 I'm your FreshCart shopping assistant. I can help you:
            🛍️ Shop directly from stores: Browse stores → Select products → Checkout
            ✨ Shop directly from product pages: Select products → Checkout
            🔍 Find products: Search by name, category, or price range
            📦 Add to cart: Add items and manage your shopping cart
            💡 Get recommendations: Popular items and personalized suggestions

        We have ${categories.length} categories, ${Array.isArray(products) ? products.length : 0} products, and ${Array.isArray(stores.stores) ? stores.stores.length : 0} stores available.`,
                timestamp: new Date(),
                suggestions: [
                    'Show me all stores',
                    'Browse categories',
                    'Find fruits',
                    'Products under KSh 100',
                    "What's popular today?",
                    'How do I checkout?',
                    'Help me shop',
                    'Search all products',
                ],
            }
            setMessages([welcomeMessage])
        } else if (messages.length === 0 && dataLoaded && categories.length === 0) {
            const errorMessage: ChatMessage = {
                id: '1',
                type: 'bot',
                content:
                    "Hello! I'm your FreshCart shopping assistant. It seems we're having trouble loading our product catalog right now. Please try again later or contact support.",
                timestamp: new Date(),
                suggestions: ['Retry loading', 'Contact support', 'Try again later'],
            }
            setMessages([errorMessage])
        }
    }, [categories, products, messages.length, dataLoaded, stores])

    // Generate AI response using Gemini
    const generateAIResponse = async (
        userMessage: string,
        context: string = '',
    ): Promise<string> => {
        if (!model) {
            return "I'm currently unable to provide AI-powered responses. Let me help you with basic product search instead."
        }

        try {
            const prompt = `
            You are a helpful shopping assistant for FreshCart, a grocery delivery app.
            
            Shopping Process:
            1. Users can browse stores and select one to shop from
            2. They can add products to cart or shop directly from a store
            3. Checkout process: Store selection → Product selection → Add to cart → Checkout
            4. Direct shopping: Click "Shop" on any product in the product's page → Takes you to the store → Select products → Checkout
            
            Available data:
            - Categories: ${categories.map((c) => c.name).join(', ')}
            - Total products: ${Array.isArray(products) ? products.length : 0}
            - Available stores: ${Array.isArray(stores?.stores) ? stores.stores.length : 0}
            ${context}
            
            User message: "${userMessage}"
            
            Provide a helpful, conversational response that:
            - Is concise and friendly (max 2-3 sentences)
            - Guides users through the shopping process
            - Mentions specific features like direct store shopping or shopping directly from product pages
            - Uses emojis to enhance engagement
            - Encourages exploration of products and stores
            - Explains checkout process when relevant
            `

            const result = await model.generateContent(prompt)
            const response = result.response
            return response.text()
        } catch (error) {
            console.error('Error generating AI response:', error)
            return "I'm having trouble processing that request. Let me help you search for products instead."
        }
    }

    const handleQuery = async (
        query: string,
    ): Promise<{
        products: ApiProduct[]
        response: string
        suggestions?: string[]
    }> => {
        const lowerQuery = query.toLowerCase()
        const normalQuery = query.trim()

        // Check if data is loaded
        if (!dataLoaded) {
            return {
                products: [],
                response:
                    "I'm still loading our product catalog. Please wait a moment and try again.",
                suggestions: ['Try again', 'Wait for loading'],
            }
        }

        // Handle checkout-related queries
        if (
            lowerQuery.includes('checkout') ||
            lowerQuery.includes('how to buy') ||
            lowerQuery.includes('how do i checkout')
        ) {
            return {
                products: [],
                response: `Here's how to checkout on FreshCart:

            1. Click "Shop" on any product → Takes you to the store
            2. Browse and select products in that store
            3. Click "Go to Checkout" → Complete your purchase
            Both methods are quick and secure! 🛒`,
                suggestions: [
                    'Show me all stores',
                    'Add items to cart',
                    'Browse products',
                    'View my cart',
                ],
            }
        }

        // Handle store-related queries
        if (
            lowerQuery.includes('show me all stores') ||
            lowerQuery.includes('show stores') ||
            lowerQuery.includes('Show me stores') ||
            lowerQuery.includes('all stores') ||
            lowerQuery.includes('browse stores')
        ) {
            const storeCount = Array.isArray(stores?.stores)
                ? stores.stores.length
                : 0
            if (storeCount === 0) {
                return {
                    products: [],
                    response:
                        "I don't have any stores loaded right now. Please try refreshing.",
                    suggestions: ['Retry loading', 'Contact support'],
                }
            }

            onNavigateToStores?.()
            setIsOpen(false)
            return {
                products: [],
                response: `Great! I'm taking you to browse our ${storeCount} available stores. You can select any store and start shopping directly from there. Each store offers different products and delivery options.`,
                suggestions: [
                    'Browse products',
                    'Search specific item',
                    'View popular stores',
                    'How to checkout?',
                ],
            }
        }

        // Handle retry loading
        if (lowerQuery.includes('retry') || lowerQuery.includes('try again')) {
            try {
                setIsLoading(true)
                await Promise.all([
                    apiService.getAllProducts(),
                    apiService.getCategories(),
                    apiService.getStores(),
                ])
                if (refetchCategories) await refetchCategories()
                setDataLoaded(true)
                setLoadingError(null)

                return {
                    products: [],
                    response: `Perfect! I've reloaded our catalog. We now have ${categories.length} categories, ${Array.isArray(products) ? products.length : 0} products, and ${Array.isArray(stores?.stores) ? stores.stores.length : 0} stores available.`,
                    suggestions: [
                        'Show me stores',
                        'Browse categories',
                        'Search products',
                        'Get recommendations',
                    ],
                }
            } catch (error) {
                return {
                    products: [],
                    response:
                        "I'm still having trouble loading data. Please check your connection and try again.",
                    suggestions: ['Try again', 'Contact support'],
                }
            } finally {
                setIsLoading(false)
            }
        }

        // Handle "Show me all products" query
        if (
            lowerQuery.includes('show me all products') ||
            lowerQuery.includes('all products')
            || lowerQuery.includes('browse products') ||
            lowerQuery.includes('search products')
        ) {
            onNavigateToCategory?.(0) // Navigate to all products category
            setIsOpen(false)
        }

        // Handle "Show me all categories" query
        if (
            lowerQuery.includes('show me all categories') ||
            lowerQuery.includes('all categories') ||
            lowerQuery.includes('browse categories')
        ) {
            if (categories.length === 0) {
                return {
                    products: [],
                    response:
                        "I don't have any categories loaded right now. Please try refreshing.",
                    suggestions: ['Retry loading', 'Contact support'],
                }
            }

            return {
                products: [],
                response: `Here are our ${categories.length} available categories: ${categories.map((c) => c.name).join(', ')}. Which category interests you most?`,
                suggestions: categories
                    .slice(0, 5)
                    .map((c) => c.name)
                    .concat(['Show me stores']),
            }
        }

        // Handle "What's popular today?" query
        if (
            lowerQuery.includes('popular') ||
            lowerQuery.includes('trending') ||
            lowerQuery.includes('recommend')
        ) {
            try {
                const popularProducts = await apiService.getPopularProducts()

                if (popularProducts.length === 0) {
                    return {
                        products: [],
                        response:
                            'No popular products found right now. Try browsing our stores or categories instead.',
                        suggestions: [
                            'Show me stores',
                            'Browse categories',
                            'Search products',
                        ],
                    }
                }

                return {
                    products: popularProducts.slice(0, 6),
                    response:
                        "Here are today's most popular products! Click 'Shop' on any item to go directly to its store and add it to your cart.",
                    suggestions: [
                        'View more popular',
                        'Show me stores',
                        'Browse categories',
                    ],
                }
            } catch (error) {
                console.error('Error getting popular products:', error)
                return {
                    products: [],
                    response:
                        "I'm having trouble loading popular products right now. Try browsing our stores or categories instead.",
                    suggestions: [
                        'Show me stores',
                        'Browse categories',
                        'Search products',
                    ],
                }
            }
        }

        // Enhanced price-based queries
        const priceMatch = lowerQuery.match(
            /(?:under|below|less than|cheaper than)\s*(?:ksh?\s*)?(\d+)/i,
        )
        if (priceMatch) {
            const maxPrice = parseInt(priceMatch[1])

            if (isNaN(maxPrice)) {
                return {
                    products: [],
                    response:
                        'I couldn\'t understand the price range. Please try again with a specific number like "Products under KSh 100".',
                    suggestions: [
                        'Products under KSh 100',
                        'Products under KSh 200',
                        'Show stores',
                    ],
                }
            }

            try {
                let priceFilteredProducts: ApiProduct[] = []
                if (Array.isArray(products)) {
                    priceFilteredProducts = products.filter((product: ApiProduct) => {
                        const price = parseFloat(product.price)
                        return !isNaN(price) && price <= maxPrice
                    })
                }

                if (priceFilteredProducts.length === 0) {
                    return {
                        products: [],
                        response: `I couldn't find any products under KSh ${maxPrice} right now. Try a different price range or browse our stores for more options.`,
                        suggestions: [
                            'Different price range',
                            'Show me stores',
                            'Browse categories',
                        ],
                    }
                }

                return {
                    products: priceFilteredProducts.slice(0, 6),
                    response: `Found ${priceFilteredProducts.length} products under KSh ${maxPrice}! Click "Shop" on any item to purchase directly from its store.`,
                    suggestions: ['Show more', 'Different price range', 'Show me stores'],
                }
            } catch (error) {
                console.error('Error filtering by price:', error)
                return {
                    products: [],
                    response:
                        'Sorry, I had trouble filtering by price. Please try browsing our stores or searching for specific products instead.',
                    suggestions: [
                        'Show me stores',
                        'Search products',
                        'Browse categories',
                    ],
                }
            }
        }

        // Enhanced category-specific searches
        const matchedCategory = categories.find((cat) => {
            const categoryName = cat.name.toLowerCase()
            const searchTerm = lowerQuery.toLowerCase()

            return (
                categoryName.includes(searchTerm) ||
                searchTerm.includes(categoryName) ||
                (cat.description && cat.description.toLowerCase().includes(searchTerm))
            )
        })

        if (matchedCategory) {
            try {
                const categoryProducts = await apiService.getProductsByCategoryName(
                    matchedCategory.name,
                )

                if (categoryProducts.length === 0) {
                    return {
                        products: [],
                        response: `I couldn't find any products in ${matchedCategory.name} right now. Try browsing our stores or a different category.`,
                        suggestions: [
                            'Show me stores',
                            'Different category',
                            'Browse categories',
                        ],
                    }
                }

                return {
                    products: categoryProducts.slice(0, 6),
                    response: `Here are ${matchedCategory.name} products! Click "Shop" on any item to go directly to its store and complete your purchase.`,
                    suggestions: [
                        'Show all products',
                        'Show me stores',
                        'Different category',
                    ],
                }
            } catch (error) {
                console.error('Error fetching category products:', error)
                return {
                    products: [],
                    response: `Sorry, I had trouble loading products from ${matchedCategory.name}. Please try again or browse our stores.`,
                    suggestions: ['Try again', 'Show me stores', 'Different category'],
                }
            }
        }

        // Enhanced shopping assistance
        if (
            lowerQuery.includes('help me shop') ||
            lowerQuery.includes('shop for me') ||
            lowerQuery.includes('how to shop')
        ) {
            return {
                products: [],
                response: `I'd love to help you shop! Here are your options:

🏪 Browse Stores: View all available stores and shop directly from them
🛒 Add to Cart: Build your cart from multiple stores, then checkout
🔍 Search Products: Find specific items across all stores

Which approach would you prefer?`,
                suggestions: [
                    'Show me stores',
                    'Browse categories',
                    'Search specific product',
                    'How to checkout?',
                ],
            }
        }

        // Enhanced store finding
        if (
            lowerQuery.includes('find store') ||
            lowerQuery.includes('where to buy') ||
            lowerQuery.includes('stores') ||
            lowerQuery.includes('where can i buy')
        ) {
            return {
                products: [],
                response: `To find stores and shop:

1. Browse All Stores: See all available stores and their products
2. Product-Specific: Click "Shop" on any product to go to its store
3. Store Selection: Choose a store → Browse products → Checkout directly

Would you like to see all available stores?`,
                suggestions: [
                    'Show me stores',
                    'Browse products',
                    'Search specific item',
                    'How to checkout?',
                ],
            }
        }

        // Enhanced cart navigation
        if (
            lowerQuery.includes('go to cart') ||
            lowerQuery.includes('view my cart') ||
            lowerQuery.includes('my cart')
        ) {
            onNavigateToCart?.()
            setIsOpen(false)
            return {
                products: [],
                response:
                    'Taking you to your cart! From there, you can select delivery methods and proceed to secure checkout. 🛒',
                suggestions: [
                    'Continue shopping',
                    'Show me stores',
                    'Browse categories',
                    'Get recommendations',
                ],
            }
        }

        // Enhanced checkout navigation
        if (
            lowerQuery.includes('go to checkout') ||
            lowerQuery.includes('view checkout')
        ) {
            onNavigateToCheckout?.()
            return {
                products: [],
                response:
                    'Taking you to checkout! Complete your purchase securely and choose your preferred delivery method. 💳',
                suggestions: [
                    'Continue shopping',
                    'View cart',
                    'Show me stores',
                    'Browse more items',
                ],
            }
        }

        // Enhanced product search with better matching
        if (
            normalQuery.length > 2 &&
            !['search specific product', 'do you have this product'].includes(
                lowerQuery,
            )
        ) {
            const productNameMatch = normalQuery.match(
                /^(?:find|search|show me|do you have|what is|which is|where is)\s*(.*)$/i,
            )
            const productName = productNameMatch
                ? productNameMatch[1].trim()
                : normalQuery

            // Try to find products locally first
            const foundProducts = products.filter(
                (p: any) =>
                    p.name.toLowerCase() === productName.toLowerCase() ||
                    p.name.toLowerCase().includes(productName.toLowerCase()),
            )

            if (foundProducts.length > 0) {
                return {
                    products: foundProducts.slice(0, 6),
                    response: `Found "${productName}"! Click "Shop" on any item to go directly to its store and purchase it.`,
                    suggestions: [
                        'Show me stores',
                        'View similar',
                        'Browse category',
                        'How to checkout?',
                    ],
                }
            }

            try {
                const apiProducts = await apiService.searchProductByName(productName)
                if (Array.isArray(apiProducts) && apiProducts.length > 0) {
                    return {
                        products: apiProducts.slice(0, 6),
                        response: `Found ${apiProducts.length} product(s) matching "${productName}". Click "Shop" to purchase directly from the store!`,
                        suggestions: [
                            'Show me stores',
                            'View similar',
                            'Browse category',
                            'How to checkout?',
                        ],
                    }
                }
            } catch (error) {
                console.error('Error searching products by name:', error)
            }
        }

        // General fallback with AI assistance
        try {
            const searchResults = await apiService.getAllProducts()
            const productsArray = Array.isArray(searchResults) ? searchResults : []

            if (productsArray.length === 0) {
                const aiResponse = await generateAIResponse(
                    normalQuery,
                    `No products found for: ${normalQuery}`,
                )
                return {
                    products: [],
                    response: aiResponse,
                    suggestions: [
                        'Show me stores',
                        'Browse categories',
                        'Try different search',
                    ],
                }
            }

            const aiResponse = await generateAIResponse(
                normalQuery,
                `Showing search results for: ${normalQuery}`,
            )
            return {
                products: productsArray.slice(0, 6),
                response: aiResponse,
                suggestions: [
                    'Show me stores',
                    'Browse categories',
                    'How to checkout?',
                ],
            }
        } catch (error) {
            console.error('Error searching products:', error)
            const aiResponse = await generateAIResponse(
                normalQuery,
                `Search error for: ${normalQuery}`,
            )
            return {
                products: [],
                response: aiResponse,
                suggestions: ['Try again', 'Show me stores', 'Browse categories'],
            }
        }
    }

    // Handle user input and generate responses
    const handleSendMessage = async () => {
        if (!input.trim()) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: input,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        const currentInput = input
        setInput('')
        setIsLoading(true)

        try {
            const {
                products: foundProducts,
                response,
                suggestions,
            } = await handleQuery(currentInput)

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: response,
                timestamp: new Date(),
                products: foundProducts,
                suggestions,
            }

            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error('Error processing message:', error)
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content:
                    'Sorry, I encountered an error while processing your request. Please try again or browse our stores directly.',
                timestamp: new Date(),
                suggestions: [
                    'Try again',
                    'Show me stores',
                    'Browse categories',
                    'Contact support',
                ],
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    // Handle suggestion clicks
    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion)
    }

    // Enhanced product selection with better actions
    const handleProductClick = (product: ApiProduct) => {
        onProductSelect?.(product)

        const message: ChatMessage = {
            id: Date.now().toString(),
            type: 'bot',
            content: `You selected ${product.name} (KSh ${parseFloat(product.price).toFixed(2)}). What would you like to do?`,
            timestamp: new Date(),
            actions: [
                {
                    label: 'Shop Now',
                    action: () => handleShopProduct(product),
                    icon: <Store className="h-4 w-4" />,
                },
                {
                    label: 'Add to Cart',
                    action: () => handleAddToCart(product),
                    icon: <ShoppingCart className="h-4 w-4" />,
                },
                {
                    label: 'View Category',
                    action: () => handleViewCategory(product.category_id),
                    icon: <Filter className="h-4 w-4" />,
                },
                {
                    label: 'Similar Products',
                    action: () => handleFindSimilar(product),
                    icon: <Search className="h-4 w-4" />,
                },
            ],
            suggestions: ['How to checkout?', 'Show me stores', 'Browse categories'],
        }

        setMessages((prev) => [...prev, message])
    }

    // Enhanced add to cart with better feedback
    const handleAddToCart = async (product: ApiProduct) => {
        try {
            const success = await apiService.addToCart(product.product_id, 1, userId)

            if (success) {
                onAddToCart?.(product)
                const message: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'bot',
                    content: `✅ ${product.name} added to cart! You can continue shopping or go to checkout. Remember, you can also shop directly from stores for faster checkout! 🛒`,
                    timestamp: new Date(),
                    actions: [
                        {
                            label: 'View Cart',
                            action: () => onNavigateToCart?.(),
                            icon: <ShoppingCart className="h-4 w-4" />,
                        },
                        {
                            label: 'Checkout Now',
                            action: () => onNavigateToCheckout?.(),
                            icon: <CreditCard className="h-4 w-4" />,
                        },
                    ],
                    suggestions: [
                        'Continue shopping',
                        'Show me stores',
                        'Browse categories',
                        'View similar items',
                    ],
                }
                setMessages((prev) => [...prev, message])
            } else {
                throw new Error('Failed to add to cart')
            }
        } catch (error) {
            console.error('Error adding to cart:', error)
            const message: ChatMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: `Sorry, I couldn't add ${product.name} to your cart. Try clicking "Shop" on the product to go directly to its store instead.`,
                timestamp: new Date(),
                suggestions: [
                    'Try again',
                    'Shop directly from store',
                    'Browse other products',
                    'Contact support',
                ],
            }
            setMessages((prev) => [...prev, message])
        }
    }

    // Handle view category
    const handleViewCategory = (categoryId: number) => {
        onNavigateToCategory?.(categoryId)
        const category = categories.find((c) => c.category_id === categoryId)

        const message: ChatMessage = {
            id: Date.now().toString(),
            type: 'bot',
            content: `Taking you to ${category?.name || 'the category'} page! You can browse all products and click "Shop" on any item to go directly to its store.`,
            timestamp: new Date(),
            suggestions: [
                'Back to chat',
                'Show me stores',
                'How to checkout?',
                'Other categories',
            ],
        }
        setMessages((prev) => [...prev, message])
    }

    // Enhanced find similar products
    const handleFindSimilar = async (product: ApiProduct) => {
        try {
            const similarProducts = await apiService.getProductsByCategory(
                product.category_id,
            )
            const filteredSimilar = similarProducts
                .filter((p) => p.product_id !== product.product_id)
                .slice(0, 4)

            if (filteredSimilar.length === 0) {
                const message: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'bot',
                    content: `I couldn't find similar products to ${product.name} right now. Try browsing the category or exploring our stores.`,
                    timestamp: new Date(),
                    suggestions: [
                        'Browse category',
                        'Show me stores',
                        'Search products',
                        'Try different category',
                    ],
                }
                setMessages((prev) => [...prev, message])
                return
            }

            const message: ChatMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: `Here are similar products to ${product.name}. Click "Shop" on any item to purchase directly from its store!`,
                timestamp: new Date(),
                products: filteredSimilar,
                suggestions: [
                    'Show me stores',
                    'How to checkout?',
                    'View more',
                    'Different category',
                ],
            }
            setMessages((prev) => [...prev, message])
        } catch (error) {
            console.error('Error finding similar products:', error)
            const message: ChatMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: `Sorry, I had trouble finding similar products. Try browsing our stores or categories instead.`,
                timestamp: new Date(),
                suggestions: [
                    'Show me stores',
                    'Browse categories',
                    'Search products',
                    'Try again',
                ],
            }
            setMessages((prev) => [...prev, message])
        }
    }

    const navigate = useNavigate()

    // Enhanced navigation to store with product and checkout guidance
    const handleShopProduct = async (product: any) => {
        try {
            const store = await getStoreHavingProduct(product.product_id)

            // Save store in your storeActions (or context)
            storeActions.saveStore(store)

            // Navigate to shop-store page
            navigate({ to: '/shop-store' })

            // Add helpful message about the shopping process
            const message: ChatMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: `🏪 Great! I'm taking you to ${store.name || 'the store'} where you can find ${product.name}. 

Next steps:
1. Browse the store's products
2. Add items to your cart
3. Click "Go to Checkout" to complete your purchase

The store page has everything you need for a quick checkout! 🛒`,
                timestamp: new Date(),
                suggestions: [
                    'Back to chat',
                    'Find other stores',
                    'Browse categories',
                    'How to checkout?',
                ],
            }
            setMessages((prev) => [...prev, message])
        } catch (err) {
            console.error('Error finding store:', err)
            toast.error('Could not find store for this product.')

            const errorMessage: ChatMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: `Sorry, I couldn't find a store that has ${product.name} in stock right now. Try browsing our other stores or adding it to your cart for delivery.`,
                timestamp: new Date(),
                suggestions: [
                    'Show me stores',
                    'Add to cart instead',
                    'Browse similar products',
                    'Try again',
                ],
            }
            setMessages((prev) => [...prev, errorMessage])
        }
    }

    const renderProductCard = (product: ApiProduct, idx?: number) => (
        <div
            key={product.product_id + (idx !== undefined ? `-${idx}` : '')}
            className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[200px] group"
            onClick={() => handleProductClick(product)}
        >
            <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-24 object-cover rounded mb-2 group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm mb-1 line-clamp-2 flex-1">
                    {product.name}
                </h4>
                <button
                    className="bg-gradient-to-r from-[#75E6DA] to-[#189AB4] text-white px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 hover:from-[#189AB4] hover:to-[#05445E] transform hover:scale-105 ml-2"
                    onClick={(e) => {
                        e.stopPropagation()
                        handleShopProduct(product)
                    }}
                    title="Shop directly from store"
                >
                    <Store className="inline-block mr-1" size={12} />
                    Shop
                </button>
            </div>
            <p className="text-[#189AB4] font-bold text-sm">
                KSh {parseFloat(product.price).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
                Click "Shop" for direct checkout
            </p>
        </div>
    )

    if (!dataLoaded && isLoading) {
        return (
            <>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-[#0074B7] to-[#60A3D9] hover:from-[#005A8F] hover:to-[#4A8BC2] text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
                >
                    <Bot className="h-6 w-6" />
                </button>

                {isOpen && (
                    <div className="fixed bottom-20 right-6 lg:w-[650px] w-80 h-[700px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
                        <div className="bg-gradient-to-r from-[#0074B7] to-[#60A3D9] text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="font-semibold">FreshCart Assistant</span>
                                    <p className="text-xs opacity-80">Loading shopping data...</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0074B7] mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading stores and products...</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Setting up your shopping experience
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    if (!products || products.length === 0) {
        return (
            <>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed bottom-6 right-10 bg-gradient-to-r from-[#0074B7] to-[#60A3D9] hover:from-[#005A8F] hover:to-[#4A8BC2] text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
                >
                    <Bot className="h-6 w-6" />
                </button>

                {isOpen && (
                    <div className="fixed bottom-20 right-10 lg:w-[650px] w-80 h-[700px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
                        <div className="bg-gradient-to-r from-[#0074B7] to-[#60A3D9] text-white p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <span className="font-semibold">FreshCart Assistant</span>
                                    <p className="text-xs opacity-80">Connection issues</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center p-6">
                                <div className="text-gray-400 mb-4">
                                    <ShoppingCart className="h-12 w-12 mx-auto" />
                                </div>
                                <p className="text-gray-600 mb-2">Unable to load products</p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Please check your connection and try again
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-[#0074B7] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#005A8F] transition-colors"
                                >
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )
    }

    return (
        <>
            {/* Enhanced Chatbot Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-16 bg-gradient-to-r from-[#0074B7] to-[#60A3D9] hover:from-[#005A8F] hover:to-[#4A8BC2] text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50 group"
                title="FreshCart Shopping Assistant"
            >
                <Bot className="h-6 w-6 group-hover:animate-pulse" />
            </button>

            {/* Enhanced Chatbot Window */}
            {isOpen && (
                <div
                    className={`fixed bottom-20 right-16 lg:w-[650px] w-80 h-[700px] 
                               ${isDarkMode ? 'bg-gray-900' : 'bg-white'} 
                               border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
                               rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden
                               transform transition-all duration-300 animate-in slide-in-from-bottom-5`}
                >
                    {/* Enhanced Header */}
                    <div className="bg-gradient-to-r from-[#0074B7] to-[#60A3D9] text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-semibold">FreshCart Assistant</span>
                                <p className="text-xs opacity-80">
                                    {loadingError
                                        ? 'Connection issues'
                                        : 'Your shopping companion 🛒'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                title="Toggle dark mode"
                            >
                                {isDarkMode ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                title="Close chat"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Messages Section */}
                    <div
                        className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[90%] ${message.type === 'user'
                                        ? 'bg-gradient-to-r from-[#0074B7] to-[#60A3D9] text-white'
                                        : isDarkMode
                                            ? 'bg-gray-800 text-gray-100 border border-gray-700'
                                            : 'bg-white text-gray-800 border border-gray-200'
                                        } rounded-2xl p-4 shadow-sm`}
                                >
                                    <div className="flex items-start gap-3">
                                        {message.type === 'bot' && (
                                            <div
                                                className={`${isDarkMode ? 'bg-[#60A3D9]' : 'bg-[#BFD7ED]'} p-2 rounded-full flex-shrink-0`}
                                            >
                                                <Bot
                                                    className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-[#0074B7]'}`}
                                                />
                                            </div>
                                        )}
                                        {message.type === 'user' && (
                                            <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
                                                <User className="h-4 w-4 text-white" />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <div className="text-sm leading-relaxed whitespace-pre-line">
                                                {message.content}
                                            </div>

                                            {/* Enhanced Products Display */}
                                            {message.products && message.products.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    <div className="text-xs font-medium opacity-75">
                                                        {message.products.length} product
                                                        {message.products.length > 1 ? 's' : ''} found
                                                    </div>
                                                    <div className="grid gap-3 overflow-y-auto">
                                                        {message.products.map(renderProductCard)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Enhanced Action Buttons */}
                                            {message.actions && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {message.actions.map((action, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={action.action}
                                                            className="flex items-center gap-2 text-xs bg-[#0074B7] hover:bg-[#005A8F] text-white px-3 py-2 rounded-full transition-all duration-200 transform hover:scale-105"
                                                        >
                                                            {action.icon}
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Enhanced Suggestions */}
                                            {message.suggestions && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {message.suggestions.map((suggestion, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                            className={`text-xs px-3 py-2 rounded-full transition-all duration-200 border transform hover:scale-105
                                                                      ${isDarkMode
                                                                    ? 'bg-gray-700 text-[#60A3D9] border-gray-600 hover:bg-gray-600'
                                                                    : 'bg-[#BFD7ED] text-[#0074B7] border-[#60A3D9] hover:bg-[#60A3D9] hover:text-white'
                                                                }`}
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Enhanced Loading Animation */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div
                                    className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
                                               border rounded-2xl p-4 shadow-sm`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`${isDarkMode ? 'bg-[#60A3D9]' : 'bg-[#BFD7ED]'} p-2 rounded-full`}
                                        >
                                            <Bot
                                                className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-[#0074B7]'}`}
                                            />
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-[#0074B7] rounded-full animate-bounce"></div>
                                            <div
                                                className="w-2 h-2 bg-[#60A3D9] rounded-full animate-bounce"
                                                style={{ animationDelay: '0.1s' }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-[#BFD7ED] rounded-full animate-bounce"
                                                style={{ animationDelay: '0.2s' }}
                                            ></div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            Finding the best options...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Enhanced Input Section */}
                    <div
                        className={`p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}
                    >
                        {/* Quick Action Buttons */}
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            <button
                                onClick={() => setInput('Show me stores')}
                                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                            >
                                <Store className="h-3 w-3" />
                                Stores
                            </button>
                            <button
                                onClick={() => setInput('How to checkout?')}
                                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                            >
                                <CreditCard className="h-3 w-3" />
                                Checkout
                            </button>
                            <button
                                onClick={() => setInput('Browse categories')}
                                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                            >
                                <GroupIcon className="h-3 w-3" />
                                Categories
                            </button>
                            <button
                                onClick={() => setInput('Search all products')}
                                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                            >
                                <Search className="h-3 w-3" />
                                Our Products
                            </button>
                            <button
                                onClick={() => setInput('Popular products')}
                                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
                            >
                                <Search className="h-3 w-3" />
                                Popular
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask about products, stores, checkout process..."
                                className={`flex-1 px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0074B7] transition-all duration-200
                                          ${isDarkMode
                                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                                        : 'bg-gray-50 text-gray-800 border-gray-300 placeholder-gray-500'
                                    } 
                                          border`}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !input.trim()}
                                className="bg-gradient-to-r from-[#0074B7] to-[#60A3D9] hover:from-[#005A8F] hover:to-[#4A8BC2] 
                                         disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-full transition-all duration-200 
                                         transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                                title="Send message"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            💡 Tip: Click "Shop" on products for direct store checkout
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}

export default EnhancedChatbot
