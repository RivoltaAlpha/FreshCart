import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShoppingCart, Search, Filter, Sun, Moon, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatbotApiService, { type ApiProduct } from '../services/chatbotApiService';
import { getStoreHavingProduct } from '@/services/storeService';
import { storeActions } from '@/store/store';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategory';
import { useStores } from '@/hooks/useStore';

interface ChatMessage {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    products?: ApiProduct[];
    suggestions?: string[];
    actions?: Array<{
        label: string;
        action: () => void;
        icon?: React.ReactNode;
    }>;
}

interface EnhancedChatbotProps {
    apiService?: ChatbotApiService;
    onProductSelect?: (product: ApiProduct) => void;
    onAddToCart?: (product: ApiProduct) => void;
    onNavigateToProducts?: () => void;
    onNavigateToCategory?: (categoryId: number) => void;
    onNavigateToStores?: () => void;
    userId?: number;
}

const EnhancedChatbot: React.FC<EnhancedChatbotProps> = ({
    apiService = new ChatbotApiService(),
    onProductSelect,
    onAddToCart,
    onNavigateToCategory,
    onNavigateToStores,
    userId
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { data: products = [] } = useProducts();
    const { data: categories = [], refetch: refetchCategories } = useCategories();
    const [dataLoaded, setDataLoaded] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Initialize Gemini AI
    const getApiKey = (): string => {
        const envApiKey = import.meta.env?.VITE_GEMINI_API;
        return envApiKey;
    };

    const apiKey = getApiKey();
    const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) : null;

    // Load initial data from backend only
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setIsLoading(true);
                setLoadingError(null);

                await Promise.all([
                    apiService.getAllProducts(),
                    apiService.getCategories(),
                    apiService.getStores()
                ]);

                // Data will be updated by hooks
                setDataLoaded(true);
            } catch (error) {
                console.error('Error loading initial data:', error);
                setLoadingError('Failed to load data from backend. Please try again.');
                setDataLoaded(false);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [apiService]);

    const stores = useStores();

    // Scroll to bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chatbot with welcome message only after data is loaded
    useEffect(() => {
        if (messages.length === 0 && dataLoaded && categories.length > 0) {
            const welcomeMessage: ChatMessage = {
                id: '1',
                type: 'bot',
                content: `Hello! 👋 I'm your FreshCart shopping assistant. I can help you find products by category, search for specific items, or get recommendations. \
                We have ${categories.length} categories and ${(Array.isArray(products) ? products.length : 0)} products available.`,
                timestamp: new Date(),
                suggestions: [
                    'Show me all categories',
                    'Fruits',
                    'Vegetables',
                    'Products under KSh 100',
                    'What\'s popular today?',
                    'Recommend something for me',
                    'help me shop',
                ]
            };
            setMessages([welcomeMessage]);
        } else if (messages.length === 0 && dataLoaded && categories.length === 0) {
            const errorMessage: ChatMessage = {
                id: '1',
                type: 'bot',
                content: 'Hello! I\'m your FreshCart shopping assistant. It seems we\'re having trouble loading our product catalog right now. Please try again later or contact support.',
                timestamp: new Date(),
                suggestions: [
                    'Retry loading',
                    'Contact support',
                    'Try again later'
                ]
            };
            setMessages([errorMessage]);
        }
    }, [categories, products, messages.length, dataLoaded]);

    // Generate AI response using Gemini
    const generateAIResponse = async (userMessage: string, context: string = ''): Promise<string> => {
        if (!model) {
            return 'I\'m currently unable to provide AI-powered responses. Let me help you with basic product search instead.';
        }

        try {
            const prompt = `
      You are a helpful shopping assistant for FreshCart, a grocery delivery app.
      
      Available categories: ${categories.map(c => c.name).join(', ')}
      Total products: ${Array.isArray(products) ? products.length : 0}
      Available Stores a user can shop from: ${Array.isArray(stores) ? stores.length : 0}
      ${context}
      
      User message: "${userMessage}"
      
      Based on the user's message, provide a helpful, conversational response. Keep it:
      - Concise and friendly
      - Focused on helping them find products
      - Encouraging them to explore categories or search
      - Helpful for grocery shopping needs
      
      If they ask about specific products, categories, or stores, guide them appropriately.
      Don't mention specific product names unless you're certain they exist.
      `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text();
        } catch (error) {
            console.error('Error generating AI response:', error);
            return 'I\'m having trouble processing that request. Let me help you search for products instead.';
        }
    };

    // Handle different types of queries
    const handleQuery = async (query: string): Promise<{ products: ApiProduct[], response: string, suggestions?: string[] }> => {
        const lowerQuery = query.toLowerCase();
        const normalQuery = query.trim();

        // Check if data is loaded
        if (!dataLoaded) {
            return {
                products: [],
                response: 'I\'m still loading our product catalog. Please wait a moment and try again.',
                suggestions: ['Try again', 'Wait for loading']
            };
        }

        // Handle retry loading
        if (lowerQuery.includes('retry') || lowerQuery.includes('try again')) {
            try {
                setIsLoading(true);
                await Promise.all([
                    apiService.getAllProducts(),
                    apiService.getCategories()
                ]);
                if (refetchCategories) await refetchCategories();
                setDataLoaded(true);
                setLoadingError(null);

                return {
                    products: [],
                    response: `Great! I've reloaded our catalog. We now have ${categories.length} categories and ${Array.isArray(products) ? products.length : 0} products available.`,
                    suggestions: ['Show me all categories', 'Search products', 'Get recommendations']
                };
            } catch (error) {
                return {
                    products: [],
                    response: 'I\'m still having trouble loading data. Please check your connection and try again.',
                    suggestions: ['Try again', 'Contact support']
                };
            } finally {
                setIsLoading(false);
            }
        }

        // Handle "Show me all products" query
        if (lowerQuery.includes('show me all products') || lowerQuery.includes('all products')) {
            if (!Array.isArray(products) || products.length === 0) {
                return {
                    products: [],
                    response: 'I don\'t have any products loaded right now. Please try refreshing.',
                    suggestions: ['Retry loading', 'Contact support']
                };
            }

            return {
                products: products.slice(0, 6),
                response: `Here are all our available products:`,
                suggestions: ['View more', 'Show all categories', 'Vegetables', 'Fruits']
            };
        }

        // Handle "Show me all categories" query
        if (lowerQuery.includes('show me all categories') || lowerQuery.includes('all categories')) {
            if (categories.length === 0) {
                return {
                    products: [],
                    response: 'I don\'t have any categories loaded right now. Please try refreshing.',
                    suggestions: ['Retry loading', 'Contact support']
                };
            }

            return {
                products: [],
                response: `Here are our available categories: ${categories.map(c => c.name).join(', ')}. Which category would you like to explore?`,
                suggestions: categories.slice(0, 5).map(c => c.name)
            };
        }

        // Handle "What's popular today?" query
        if (lowerQuery.includes('popular') || lowerQuery.includes('trending') || lowerQuery.includes('recommend')) {
            try {
                const popularProducts = await apiService.getPopularProducts();

                if (popularProducts.length === 0) {
                    return {
                        products: [],
                        response: 'No popular products found right now. Try browsing categories instead.',
                        suggestions: ['Show me all categories', 'Search products', 'Try again']
                    };
                }

                return {
                    products: popularProducts.slice(0, 6),
                    response: "Here are today's popular products:",
                    suggestions: ['View Fruits', 'Show all categories']
                };
            } catch (error) {
                console.error('Error getting popular products:', error);
                return {
                    products: [],
                    response: "I'm having trouble loading popular products right now. Try browsing categories instead.",
                    suggestions: ['Show me all categories', 'Search products', 'Try again']
                };
            }
        }

        // Price-based queries - Fixed regex and parsing
        const priceMatch = lowerQuery.match(/(?:under|below|less than|cheaper than)\s*(?:ksh?\s*)?(\d+)/i);
        if (priceMatch) {
            const maxPrice = parseInt(priceMatch[1]);

            if (isNaN(maxPrice)) {
                return {
                    products: [],
                    response: 'I couldn\'t understand the price range. Please try again with a specific number like "Products under KSh 100".',
                    suggestions: ['Products under KSh 100', 'Products under KSh 200', 'Show categories']
                };
            }

            try {
                // Filter products by price instead of API call if the API doesn't support price filtering
                interface PriceFilteredProduct extends ApiProduct {
                    price: string;
                }

                let priceFilteredProducts: PriceFilteredProduct[] = [];
                if (Array.isArray(products)) {
                    priceFilteredProducts = products.filter((product: ApiProduct): product is PriceFilteredProduct => {
                        const price = parseFloat(product.price);
                        return !isNaN(price) && price <= maxPrice;
                    });
                }

                if (priceFilteredProducts.length === 0) {
                    return {
                        products: [],
                        response: `I couldn't find any products under KSh ${maxPrice} right now. Try a different price range or browse our categories.`,
                        suggestions: ['Different price range', 'Show categories', 'Search products']
                    };
                }

                return {
                    products: priceFilteredProducts.slice(0, 6),
                    response: `I found ${priceFilteredProducts.length} products under KSh ${maxPrice}:`,
                    suggestions: ['Show more', 'Different price range', 'Show categories']
                };
            } catch (error) {
                console.error('Error filtering by price:', error);
                return {
                    products: [],
                    response: 'Sorry, I had trouble filtering by price. Please try searching for specific products instead.',
                    suggestions: ['Search products', 'Show categories', 'Try again']
                };
            }
        }

        // Category-specific searches - Fixed to handle partial matches
        const matchedCategory = categories.find(cat => {
            const categoryName = cat.name.toLowerCase();
            const searchTerm = lowerQuery.toLowerCase();

            return categoryName.includes(searchTerm) ||
                searchTerm.includes(categoryName) ||
                (cat.description && cat.description.toLowerCase().includes(searchTerm));
        });

        if (matchedCategory) {
            try {
                const categoryProducts = await apiService.getProductsByCategoryName(matchedCategory.name);

                if (categoryProducts.length === 0) {
                    return {
                        products: [],
                        response: `I couldn't find any products in ${matchedCategory.name} right now. Try a different category or search for specific products.`,
                        suggestions: ['Different category', 'Search products', 'Show all categories']
                    };
                }

                return {
                    products: categoryProducts.slice(0, 6),
                    response: `Here are products from ${matchedCategory.name}:`,
                    suggestions: ['Show all products', 'Different category', 'Add to cart']
                };
            } catch (error) {
                console.error('Error fetching category products:', error);
                return {
                    products: [],
                    response: `Sorry, I had trouble loading products from ${matchedCategory.name}. Please try again.`,
                    suggestions: ['Try again', 'Different category', 'Search products']
                };
            }
        }

        // navigate to products
        if (lowerQuery.includes('help me shop') || lowerQuery.includes('shop for me ')) {
            if (!onNavigateToCategory) {
                return {
                    products: [],
                    response: 'I can help you find products, but I need to know which category you want to explore first.',
                    suggestions: ['Show me all categories', 'Search products', 'Get recommendations']
                };
            }

            onNavigateToCategory(0); // Navigate to all products or a default category
            return {
                products: [],
                response: 'Sure! I\'m taking you to our product catalog. You can browse through all available products.',
                suggestions: ['Show all categories', 'Search specific product', 'Get recommendations']
            };
        }

        // navigate to stores
        if (lowerQuery.includes('find store') || lowerQuery.includes('where to buy') || lowerQuery.includes('where can i buy')) {
            handleStores();
            if (!onNavigateToStores) {
                return {
                    products: [],
                    response: 'I can help you find stores, but I need to know which product you are looking for.',
                    suggestions: ['Search products', 'Show me all categories', 'Get recommendations']
                };
            }
        }

        // Search for specific product(s) by name (local match first)
        if (normalQuery.length > 2 && !['search specific product', 'do you have this product'].includes(lowerQuery)) {
            const productNameMatch = normalQuery.match(/^(?:find|search|show me| do you have|what is|which is|where is)\s*(.*)$/i);
            const productName = productNameMatch ? productNameMatch[1].trim() : normalQuery;

            // Try to find products locally first
            const foundProducts = products.filter(
                (p: any) =>
                    p.name.toLowerCase() === productName.toLowerCase() ||
                    p.name.toLowerCase().includes(productName.toLowerCase())
            );
            if (foundProducts.length > 0) {
                return {
                    products: foundProducts.slice(0, 6),
                    response: `Yes, we have ${productName}:`,
                    suggestions: ['Add to cart', 'View similar', 'Browse category'],
                };
            }
            try {
                const apiProducts = await apiService.searchProductByName(productName);
                if (Array.isArray(apiProducts) && apiProducts.length > 0) {
                    return {
                        products: apiProducts.slice(0, 6),
                        response: `I found ${apiProducts.length} product(s) matching "${productName}":`,
                        suggestions: ['Add to cart', 'View similar', 'Browse category'],
                    };
                }
            } catch (error) {
                console.error('Error searching products by name:', error);
            }
        }

        // General product search
        try {
            const searchResults = await apiService.getAllProducts();

            const productsArray = Array.isArray(searchResults) ? searchResults : [];

            if (productsArray.length === 0) {
                const aiResponse = await generateAIResponse(normalQuery, `No products found for: ${normalQuery}`);
                return {
                    products: [],
                    response: aiResponse,
                    suggestions: ['Show all categories', 'Try different search', 'Browse popular items']
                };
            }

            return {
                products: productsArray.slice(0, 6),
                response: `I found ${productsArray.length} products matching your search:`,
                suggestions: ['Browse popular items', 'Show all categories']
            };
        } catch (error) {
            console.error('Error searching products:', error);

            const aiResponse = await generateAIResponse(normalQuery, `Search error for: ${normalQuery}`);
            return {
                products: [],
                response: aiResponse,
                suggestions: ['Try again', 'Show all categories', 'Browse popular items']
            };
        }
    };

    // Handle user input and generate responses
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const { products: foundProducts, response, suggestions } = await handleQuery(currentInput);

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: response,
                timestamp: new Date(),
                products: foundProducts,
                suggestions
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error processing message:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: 'Sorry, I encountered an error while processing your request. Please try again.',
                timestamp: new Date(),
                suggestions: ['Try again', 'Show all categories', 'Contact support']
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle suggestion clicks
    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    };

    // Handle product selection
    const handleProductClick = (product: ApiProduct) => {
        onProductSelect?.(product);

        const message: ChatMessage = {
            id: Date.now().toString(),
            type: 'bot',
            content: `You selected ${product.name} (KSh ${parseFloat(product.price).toFixed(2)}). What would you like to do?`,
            timestamp: new Date(),
            actions: [
                {
                    label: 'Add to Cart',
                    action: () => handleAddToCart(product),
                    icon: <ShoppingCart className="h-4 w-4" />
                },
                {
                    label: 'View Category',
                    action: () => handleViewCategory(product.category_id),
                    icon: <Filter className="h-4 w-4" />
                },
                {
                    label: 'Similar Products',
                    action: () => handleFindSimilar(product),
                    icon: <Search className="h-4 w-4" />
                }
            ]
        };

        setMessages(prev => [...prev, message]);
    };

    const handleStores = () => {
        const message: ChatMessage = {
            id: Date.now().toString(),
            type: 'bot',
            content: `To shop for products in this app, follow these steps:
                        2. Browse the products to find what you're looking for.
            3. Use the search bar to quickly find specific products.
            4. Click on a product to view its details and add it to your cart.
            5. Proceed to checkout when you're ready to purchase.
            6. Enjoy your shopping experience!`,

            timestamp: new Date(),
            suggestions: ['Browse products', 'Search products', 'View cart']
        };
        setMessages(prev => [...prev, message]);
        onNavigateToStores?.();
        setInput(''); // Clear input after providing steps
    }

    // Handle add to cart
    const handleAddToCart = async (product: ApiProduct) => {
        try {
            const success = await apiService.addToCart(product.product_id, 1, userId);

            if (success) {
                onAddToCart?.(product);
                const message: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'bot',
                    content: `✅ ${product.name} has been added to your cart! Continue shopping or check out when ready.`,
                    timestamp: new Date(),
                    suggestions: ['Continue shopping', 'View cart', 'Get more recommendations', 'Show all categories']
                };
                setMessages(prev => [...prev, message]);
            } else {
                throw new Error('Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            const message: ChatMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: `Sorry, I couldn't add ${product.name} to your cart. Please try again.`,
                timestamp: new Date(),
                suggestions: ['Try again', 'Continue shopping', 'Contact support']
            };
            setMessages(prev => [...prev, message]);
        }
    };

    // Handle view category
    const handleViewCategory = (categoryId: number) => {
        onNavigateToCategory?.(categoryId);
        const category = categories.find(c => c.category_id === categoryId);

        const message: ChatMessage = {
            id: Date.now().toString(),
            type: 'bot',
            content: `Taking you to ${category?.name || 'the category'} page to see all products!`,
            timestamp: new Date(),
            suggestions: ['Back to chat', 'Search products', 'Other categories']
        };
        setMessages(prev => [...prev, message]);
    };

    // Handle find similar products
    const handleFindSimilar = async (product: ApiProduct) => {
        try {
            const similarProducts = await apiService.getProductsByCategory(product.category_id);
            const filteredSimilar = similarProducts.filter(p => p.product_id !== product.product_id).slice(0, 4);

            if (filteredSimilar.length === 0) {
                const message: ChatMessage = {
                    id: Date.now().toString(),
                    type: 'bot',
                    content: `I couldn't find similar products to ${product.name} right now. Try browsing the category or searching for specific items.`,
                    timestamp: new Date(),
                    suggestions: ['Browse category', 'Search products', 'Try different category']
                };
                setMessages(prev => [...prev, message]);
                return;
            }

            const message: ChatMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: `Here are similar products to ${product.name}:`,
                timestamp: new Date(),
                products: filteredSimilar,
                suggestions: ['Add to cart', 'View more', 'Different category']
            };
            setMessages(prev => [...prev, message]);
        } catch (error) {
            console.error('Error finding similar products:', error);
            const message: ChatMessage = {
                id: Date.now().toString(),
                type: 'bot',
                content: `Sorry, I had trouble finding similar products. Please try again.`,
                timestamp: new Date(),
                suggestions: ['Try again', 'Browse category', 'Search products']
            };
            setMessages(prev => [...prev, message]);
        }
    };

    const navigate = useNavigate();

    // navigation to store with product
    const handleShopProduct = async (product: any) => {
        try {
            const store = await getStoreHavingProduct(product.product_id)

            console.log(store)

            // Save store in your storeActions (or context)
            storeActions.saveStore(store);

            // Navigate to shop-store page
            navigate({ to: '/shop-store' });
        } catch (err) {
            toast.error('Could not find store for this product.');
        }
    };

    // Render product card
    const renderProductCard = (product: ApiProduct, idx?: number) => (
        <div
            key={product.product_id + (idx !== undefined ? `-${idx}` : '')}
            className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-[200px]"
            onClick={() => handleProductClick(product)}
        >
            <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-24 object-cover rounded mb-2"
                onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/200x200?text=Product+Image';
                }}
            />
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h4>
                <button
                    className="bg-gradient-to-r from-[#75E6DA] to-[#189AB4] text-white px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 hover:from-[#189AB4] hover:to-[#05445E]"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleShopProduct(product);
                    }}
                >
                    <ShoppingCart className="inline-block mr-1" size={16} />
                    Shop
                </button>
            </div>
            <p className="text-[#189AB4] font-bold text-sm">KSh {parseFloat(product.price).toFixed(2)}</p>
        </div>
    );

    // Show loading state while data is being fetched
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
                                    <p className="text-xs opacity-80">Loading...</p>
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
                                <p className="text-gray-600">Loading product catalog...</p>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Example: React component snippet
    if (!products || products.length === 0) {
        return <div>Product not found</div>
    }

    return (
        <>
            {/* Chatbot Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-[#0074B7] to-[#60A3D9] hover:from-[#005A8F] hover:to-[#4A8BC2] text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
            >
                <Bot className="h-6 w-6" />
            </button>

            {/* Chatbot Window */}
            {isOpen && (
                <div className={`fixed bottom-20 right-6 lg:w-[650px] w-64 h-[700px] 
                               ${isDarkMode ? 'bg-gray-900' : 'bg-white'} 
                               border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
                               rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden`}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0074B7] to-[#60A3D9] text-white p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="font-semibold">FreshCart Assistant</span>
                                <p className="text-xs opacity-80">
                                    {loadingError ? 'Connection issues' : 'Always here to help'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`w-[90%] ${message.type === 'user'
                                    ? 'bg-gradient-to-r from-[#0074B7] to-[#60A3D9] text-white'
                                    : isDarkMode
                                        ? 'bg-gray-800 text-gray-100 border border-gray-700'
                                        : 'bg-white text-gray-800 border border-gray-200'
                                    } rounded-2xl p-4 shadow-sm`}>

                                    <div className="flex items-start gap-3">
                                        {message.type === 'bot' && (
                                            <div className={`${isDarkMode ? 'bg-[#60A3D9]' : 'bg-[#BFD7ED]'} p-2 rounded-full flex-shrink-0`}>
                                                <Bot className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-[#0074B7]'}`} />
                                            </div>
                                        )}
                                        {message.type === 'user' && (
                                            <div className="bg-white/20 p-2 rounded-full flex-shrink-0">
                                                <User className="h-4 w-4 text-white" />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <p className="text-sm leading-relaxed">{message.content}</p>

                                            {/* Render products if available */}
                                            {message.products && message.products.length > 0 && (
                                                <div className="mt-4 space-y-3 ">
                                                    <div className="grid gap-3">
                                                        {message.products.map(renderProductCard)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Render action buttons if available */}
                                            {message.actions && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {message.actions.map((action, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={action.action}
                                                            className="flex items-center gap-2 text-xs bg-[#0074B7] hover:bg-[#005A8F] text-white px-3 py-2 rounded-full transition-colors duration-200"
                                                        >
                                                            {action.icon}
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Render suggestions if available */}
                                            {message.suggestions && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {message.suggestions.map((suggestion, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                            className={`text-xs px-3 py-2 rounded-full transition-colors duration-200 border
                                                                      ${isDarkMode
                                                                    ? 'bg-gray-700 text-[#60A3D9] border-gray-600 hover:bg-gray-600'
                                                                    : 'bg-[#BFD7ED] text-[#0074B7] border-[#60A3D9] hover:bg-[#60A3D9] hover:text-white'}`}
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

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
                                               border rounded-2xl p-4 shadow-sm`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`${isDarkMode ? 'bg-[#60A3D9]' : 'bg-[#BFD7ED]'} p-2 rounded-full`}>
                                            <Bot className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-[#0074B7]'}`} />
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-[#0074B7] rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-[#60A3D9] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-[#BFD7ED] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Section */}
                    <div className={`p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask about products, categories, or get recommendations..."
                                className={`flex-1 px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0074B7] transition-all duration-200
                                          ${isDarkMode
                                        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                                        : 'bg-gray-50 text-gray-800 border-gray-300 placeholder-gray-500'} 
                                          border`}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !input.trim()}
                                className="bg-gradient-to-r from-[#0074B7] to-[#60A3D9] hover:from-[#005A8F] hover:to-[#4A8BC2] 
                                         disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-full transition-all duration-200 
                                         transform hover:scale-105 disabled:transform-none"
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EnhancedChatbot;