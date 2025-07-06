import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import EnhancedChatbot from '../Gemini/enhancedChatbot';
import ChatbotApiService, { type ApiProduct } from '../services/chatbotApiService';

interface ChatbotIntegrationProps {
    userId?: number;
}

const ChatbotIntegration: React.FC<ChatbotIntegrationProps> = ({ userId }) => {
    const navigate = useNavigate();

    // Initialize the API service
    const apiService = new ChatbotApiService();

    // Handle product selection from chatbot
    const handleProductSelect = (product: ApiProduct) => {
        console.log('Product selected from chatbot:', product);
        // You can store this in context, localStorage, or state management
        localStorage.setItem('selectedProduct', JSON.stringify(product));

        // Navigate to product details or products page
        navigate({ to: '/products' });
    };

    // Handle add to cart from chatbot
    const handleAddToCart = (product: ApiProduct) => {
        console.log('Adding to cart from chatbot:', product);

        // Get current cart from localStorage or your state management
        const currentCart = JSON.parse(localStorage.getItem('freshcart-cart') || '{}');

        // Add or increment product quantity
        const productId = product.product_id;
        currentCart[productId] = (currentCart[productId] || 0) + 1;

        // Save back to localStorage
        localStorage.setItem('freshcart-cart', JSON.stringify(currentCart));

        // You might want to trigger a cart update event or use your existing cart functions
        // For example, if you have a cart context:
        // cartContext.addToCart(product);

        console.log('Cart updated:', currentCart);
    };

    // Handle navigation to category
    const handleNavigateToCategory = (categoryId: number) => {
        console.log('Navigating to category:', categoryId);

        // Store the category filter and navigate to products page
        localStorage.setItem('selectedCategoryId', categoryId.toString());
        navigate({ to: '/products' });
    };

    return (
        <EnhancedChatbot
            apiService={apiService}
            onProductSelect={handleProductSelect}
            onAddToCart={handleAddToCart}
            onNavigateToCategory={handleNavigateToCategory}
            userId={userId}
        />
    );
};

export default ChatbotIntegration;
