import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShoppingCart, Search, Filter } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ChatbotApiService, { type ApiProduct, type Category } from '../services/chatbotApiService';

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
    userId?: number;
}

const EnhancedChatbot: React.FC<EnhancedChatbotProps> = ({
    apiService = new ChatbotApiService(),
    onProductSelect,
    onAddToCart,
    onNavigateToCategory,
    userId
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Gemini AI
    const getApiKey = (): string => {
        const envApiKey = import.meta.env?.VITE_GEMINI_API_KEY;
        return envApiKey || 'AIzaSyDvNxPUmA6uA3aQ8suP8529nOZzU_iobC0';
    };

    const apiKey = getApiKey();
    const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }) : null;

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    apiService.getAllProducts(),
                    apiService.getCategories()
                ]);

                // Use sample data if API returns empty
                setProducts(productsData.length > 0 ? productsData : apiService.getSampleProducts());
                setCategories(categoriesData.length > 0 ? categoriesData : apiService.getSampleCategories());
            } catch (error) {
                console.error('Error loading initial data:', error);
                // Fallback to sample data
                setProducts(apiService.getSampleProducts());
                setCategories(apiService.getSampleCategories());
            }
        };

        loadInitialData();
    }, [apiService]);

    // Scroll to bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize chatbot with welcome message
    useEffect(() => {
        if (messages.length === 0 && categories.length > 0) {
            const welcomeMessage: ChatMessage = {
                id: '1',
                type: 'bot',
                content: `Hello! 👋 I'm your FreshCart shopping assistant. I can help you find products by category, search for specific items, or get recommendations. We have ${categories.length} categories and ${products.length} products available.`,
                timestamp: new Date(),
                suggestions: [
                    'Show me all categories',
                    'Find fresh produce',
                    'Products under KSh 100',
                    'What\'s popular today?',
                    'Recommend something for me'
                ]
            };
            setMessages([welcomeMessage]);
        }
    }, [categories, products, messages.length]);

    // Generate AI response using Gemini
    const generateAIResponse = async (userMessage: string, context: string = ''): Promise<string> => {
        if (!model) {
            return 'I\'m currently unable to provide AI-powered responses. Let me help you with basic product search instead.';
        }

        try {
            const prompt = `
      You are a helpful shopping assistant for FreshCart, a grocery delivery app.
      
      Available categories: ${categories.map(c => c.name).join(', ')}
      Total products: ${products.length}
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

    // Search products based on user query
    const searchProducts = async (query: string): Promise<ApiProduct[]> => {
        try {
            // Try API search first
            const searchResults = await apiService.searchProducts(query);
            if (searchResults.length > 0) {
                return searchResults;
            }

            // Fallback to local search
            const searchTerm = query.toLowerCase();
            return products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.name.toLowerCase().includes(searchTerm)
            );
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    };

    // Handle different types of queries
    const handleQuery = async (query: string): Promise<{ products: ApiProduct[], response: string, suggestions?: string[] }> => {
        const lowerQuery = query.toLowerCase();

        // Category queries
        if (lowerQuery.includes('categories') || lowerQuery.includes('category')) {
            return {
                products: [],
                response: `Here are our available categories: ${categories.map(c => c.name).join(', ')}. Which category would you like to explore?`,
                suggestions: categories.map(c => `Show me ${c.name.toLowerCase()}`)
            };
        }

        // Price-based queries
        const priceMatch = lowerQuery.match(/under|below|less than|cheaper than.*?(\d+)/);
        if (priceMatch) {
            const maxPrice = parseInt(priceMatch[1]);
            try {
                const priceFilteredProducts = await apiService.getProductsByPriceRange(0, maxPrice);
                const productsToShow = priceFilteredProducts.length > 0 ? priceFilteredProducts :
                    products.filter(p => parseFloat(p.price) <= maxPrice);

                return {
                    products: productsToShow.slice(0, 6),
                    response: `I found ${productsToShow.length} products under KSh ${maxPrice}:`,
                    suggestions: ['Show me more', 'Different price range', 'Show categories']
                };
            } catch (error) {
                console.error('Error filtering by price:', error);
                return { products: [], response: 'Sorry, I had trouble filtering by price. Try searching for specific products instead.' };
            }
        }

        // Category-specific searches
        const matchedCategory = categories.find(cat =>
            lowerQuery.includes(cat.name.toLowerCase()) ||
            cat.description.toLowerCase().includes(lowerQuery.split(' ')[0])
        );

        if (matchedCategory) {
            try {
                const categoryProducts = await apiService.getProductsByCategory(matchedCategory.category_id);
                const productsToShow = categoryProducts.length > 0 ? categoryProducts :
                    products.filter(p => p.category_id === matchedCategory.category_id);

                return {
                    products: productsToShow.slice(0, 6),
                    response: `Here are products from ${matchedCategory.name}:`,
                    suggestions: ['Show all products', 'Different category', 'Add to cart']
                };
            } catch (error) {
                console.error('Error fetching category products:', error);
            }
        }

        // General product search
        const searchResults = await searchProducts(query);
        if (searchResults.length > 0) {
            return {
                products: searchResults.slice(0, 6),
                response: `I found ${searchResults.length} products matching "${query}":`,
                suggestions: ['Show more results', 'Refine search', 'Browse categories']
            };
        }

        // AI-powered response for complex queries
        const aiResponse = await generateAIResponse(query, `User is looking for: ${query}`);
        return {
            products: [],
            response: aiResponse,
            suggestions: ['Show all categories', 'Search products', 'Get recommendations', 'Browse popular items']
        };
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
                content: 'Sorry, I encountered an error. Please try again or search for specific products.',
                timestamp: new Date(),
                suggestions: ['Show all categories', 'Search products', 'Get help']
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
                    suggestions: ['Continue shopping', 'View cart', 'Get more recommendations', 'Browse categories']
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
                suggestions: ['Try again', 'Continue shopping', 'Get help']
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
        }
    };

    // Render product card
    const renderProductCard = (product: ApiProduct) => (
        <div
            key={product.product_id}
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
            <h4 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h4>
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center">
                <span className="font-bold text-green-600">KSh {parseFloat(product.price).toFixed(2)}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    ⭐ {parseFloat(product.rating).toFixed(1)}
                </span>
            </div>
            {product.discount > 0 && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-1 inline-block">
                    {product.discount}% OFF
                </span>
            )}
            <div className="text-xs text-gray-500 mt-1">
                Stock: {product.stock_quantity} {product.unit}
            </div>
        </div>
    );

    return (
        <>
            {/* Chatbot Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all z-50"
            >
                <Bot className="h-6 w-6" />
            </button>

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 lg:w-[600px] w-64 h-[600px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col">
                    {/* Header */}
                    <div className="bg-gray-900 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <span className="font-semibold">FreshCart Assistant</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] ${message.type === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                    } rounded-lg p-3`}>
                                    <div className="flex items-start gap-2">
                                        {message.type === 'bot' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                                        {message.type === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm">{message.content}</p>

                                            {/* Render products if available */}
                                            {message.products && message.products.length > 0 && (
                                                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                                    {message.products.map(renderProductCard)}
                                                </div>
                                            )}

                                            {/* Render action buttons if available */}
                                            {message.actions && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {message.actions.map((action, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={action.action}
                                                            className="flex items-center gap-1 text-xs bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors"
                                                        >
                                                            {action.icon}
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Render suggestions if available */}
                                            {message.suggestions && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {message.suggestions.map((suggestion, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleSuggestionClick(suggestion)}
                                                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
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
                                <div className="bg-gray-100 rounded-lg p-3">
                                    <div className="flex items-center gap-2">
                                        <Bot className="h-4 w-4" />
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask about products, categories, or stores..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !input.trim()}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EnhancedChatbot;
