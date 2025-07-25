import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import EnhancedChatbot from '../Gemini/enhancedChatbot';
import ChatbotApiService, { type ApiProduct } from '../services/chatbotApiService';

interface ChatbotIntegrationProps {
    userId?: number;
}

const ChatbotIntegration: React.FC<ChatbotIntegrationProps> = ({ userId }) => {
    const navigate = useNavigate();

    const apiService = new ChatbotApiService();
    const handleProductSelect = (product: ApiProduct) => {
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        navigate({ to: '/products' });
    };

    // Handle add to cart from chatbot
    const handleAddToCart = (product: ApiProduct) => {
        const currentCart = JSON.parse(localStorage.getItem('freshcart-cart') || '{}');
        const productId = product.product_id;
        currentCart[productId] = (currentCart[productId] || 0) + 1;
        localStorage.setItem('freshcart-cart', JSON.stringify(currentCart));
    };

    // handle navigate to cart
    const handleNavigateToCart = () => {
        navigate({ to: '/customer/cart' });
    };

    // Handle checkout process
    const handleCheckout = () => {
        navigate({ to: '/customer/checkout-order' });
    };

    // Handle navigation to category
    const handleNavigateToCategory = (categoryId: number) => {
        localStorage.setItem('selectedCategoryId', categoryId.toString());
        navigate({ to: '/products' });
    };

    // Handle navigate to stores
    const handleNavigateToStores = () => {
        navigate({ to: '/stores' });
    };

    return (
        <EnhancedChatbot
            apiService={apiService}
            onProductSelect={handleProductSelect}
            onAddToCart={handleAddToCart}
            onNavigateToCategory={handleNavigateToCategory}
            onNavigateToStores={handleNavigateToStores}
            onNavigateToCart={handleNavigateToCart}
            onNavigateToCheckout={handleCheckout}
            userId={userId}
        />
    );
};

export default ChatbotIntegration;
