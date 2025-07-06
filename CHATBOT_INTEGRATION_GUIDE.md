# FreshCart Chatbot Integration Guide

## Overview

The FreshCart chatbot system provides AI-powered product recommendations and search functionality. It consists of three main components:

1. **ChatbotApiService** - Handles API communication with your backend
2. **EnhancedChatbot** - The main chatbot UI component with AI integration
3. **ChatbotIntegration** - Integration wrapper for your app

## Features

### 🤖 AI-Powered Conversations
- Natural language processing using Google Gemini AI
- Context-aware responses based on user queries
- Intelligent product recommendations

### 🔍 Smart Product Search
- Search by product name, category, or description
- Price-based filtering ("products under KSh 200")
- Category-specific browsing

### 🛒 Shopping Integration
- Add products to cart directly from chat
- Navigate to product categories
- View product details and ratings

### 📱 Interactive UI
- Floating chatbot button
- Collapsible chat window
- Product cards with images and details
- Quick suggestion buttons
- Action buttons for cart operations

## Data Structure

The chatbot works with your API data structure:

```typescript
interface ApiProduct {
  product_id: number;
  category_id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  image_url: string;
  weight: string;
  unit: string;
  rating: string;
  review_count: number;
  discount: number;
  expiry_date: string | null;
  created_at: string;
  updatedAt: string;
  category: Category;
}

interface Category {
  category_id: number;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @google/generative-ai lucide-react
```

### 2. Set up Environment Variables

Create a `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Configure API Service

Update the `ChatbotApiService` constructor with your backend URL:

```typescript
const apiService = new ChatbotApiService('https://your-api-domain.com/api');
```

### 4. Add to Your App

```tsx
// In your main app component or layout
import ChatbotIntegration from './components/ChatbotIntegration';

function App() {
  const userId = getCurrentUserId(); // Get from your auth system
  
  return (
    <div className="app">
      {/* Your existing app content */}
      
      {/* Add the chatbot */}
      <ChatbotIntegration userId={userId} />
    </div>
  );
}
```

## API Endpoints

The chatbot expects these API endpoints:

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category_id=1` - Get products by category
- `GET /api/products?store_id=1` - Get products by store
- `GET /api/products/search?q=tomato` - Search products
- `GET /api/products?min_price=50&max_price=200` - Filter by price

### Categories
- `GET /api/categories` - Get all categories

### Stores
- `GET /api/stores` - Get all stores

### Cart
- `POST /api/cart` - Add item to cart
  ```json
  {
    "product_id": 9,
    "quantity": 1,
    "user_id": 123
  }
  ```

### Recommendations
- `GET /api/recommendations?user_id=123` - Get personalized recommendations

## Customization

### Styling
The chatbot uses Tailwind CSS classes. You can customize the appearance by modifying the className attributes in the components.

### AI Responses
Modify the `generateAIResponse` function in `EnhancedChatbot` to customize AI behavior:

```typescript
const prompt = `
  You are a helpful shopping assistant for FreshCart.
  // Customize the prompt here
`;
```

### Product Card Layout
Customize the `renderProductCard` function to change how products are displayed in the chat.

### Conversation Flow
Add new query handlers in the `handleQuery` function for custom conversation flows.

## Integration with Existing Cart System

### Method 1: Using localStorage (Current Implementation)
```typescript
const handleAddToCart = (product: ApiProduct) => {
  const currentCart = JSON.parse(localStorage.getItem('freshcart-cart') || '{}');
  currentCart[product.product_id] = (currentCart[product.product_id] || 0) + 1;
  localStorage.setItem('freshcart-cart', JSON.stringify(currentCart));
};
```

### Method 2: Using React Context
```typescript
import { useCart } from './context/CartContext';

const handleAddToCart = (product: ApiProduct) => {
  const { addToCart } = useCart();
  addToCart({
    id: product.product_id,
    name: product.name,
    price: parseFloat(product.price),
    // ... other product properties
  });
};
```

### Method 3: Using State Management (Redux, Zustand, etc.)
```typescript
import { useCartStore } from './store/cartStore';

const handleAddToCart = (product: ApiProduct) => {
  const addToCart = useCartStore(state => state.addToCart);
  addToCart(product);
};
```

## Navigation Integration

### Example: Handle Category Navigation
```typescript
// In your products page
useEffect(() => {
  const selectedCategoryId = localStorage.getItem('selectedCategoryId');
  if (selectedCategoryId) {
    const categoryId = parseInt(selectedCategoryId);
    // Set the selected category filter
    setSelectedCategory(categoryId);
    localStorage.removeItem('selectedCategoryId');
  }
}, []);
```

### Example: Handle Product Selection
```typescript
// In your products page
useEffect(() => {
  const selectedProduct = localStorage.getItem('selectedProduct');
  if (selectedProduct) {
    const product = JSON.parse(selectedProduct);
    // Scroll to product, highlight it, or show details
    scrollToProduct(product.product_id);
    localStorage.removeItem('selectedProduct');
  }
}, []);
```

## Testing

### With Sample Data
The `ChatbotApiService` includes sample data for testing:

```typescript
const apiService = new ChatbotApiService();
const sampleProducts = apiService.getSampleProducts();
const sampleCategories = apiService.getSampleCategories();
```

### Mock API Responses
For development, you can modify the API service methods to return sample data instead of making actual API calls.

## Error Handling

The chatbot includes comprehensive error handling:

- **API Failures**: Falls back to sample data
- **AI Service Errors**: Uses rule-based responses
- **Network Issues**: Graceful degradation
- **Invalid Queries**: Helpful error messages

## Performance Considerations

- **Product Limiting**: Results are limited to 6 products per response
- **Image Lazy Loading**: Product images include error handling
- **Message History**: Consider implementing message cleanup for long conversations
- **API Caching**: Consider caching frequently requested data

## Troubleshooting

### Common Issues

1. **Chatbot not responding**: Check your Gemini API key
2. **No products showing**: Verify API endpoints are working
3. **Images not loading**: Check image URLs and add error handling
4. **Cart not updating**: Verify cart integration methods

### Debug Mode
Enable console logging by uncommenting debug statements in the components.

## Future Enhancements

1. **Voice Integration**: Add speech-to-text and text-to-speech
2. **Order Tracking**: Integrate with order status APIs
3. **User Preferences**: Save user preferences and conversation history
4. **Analytics**: Track chatbot usage and popular queries
5. **Multi-language**: Add support for multiple languages
6. **Rich Responses**: Add support for images, videos, and carousel cards

## Support

For issues or questions about the chatbot integration, check:

1. Console logs for error messages
2. Network tab for API call failures
3. Gemini AI API documentation for AI-related issues
4. This documentation for integration guidance
