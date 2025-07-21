import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import type { BackendProduct } from '@/types/types';
import { Eye, ShoppingCart, Star } from 'lucide-react';

export const ProductModal = ({  isModalOpen, setIsModalOpen,  selectedProduct,  handleAddToCartFromModal, handleViewDetails}: {
  isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    selectedProduct: BackendProduct | null;
    handleAddToCartFromModal: () => void;
    handleViewDetails: () => void;
}) => {
  return (
    <>
      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogClose onClick={() => setIsModalOpen(false)} />
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#05445E]">
                  {selectedProduct.name}
                </DialogTitle>
                <DialogDescription className="text-[#189AB4] text-lg">
                  {selectedProduct.category?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Product Image */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedProduct.image_url || './market-concept-with-vegetables.jpg'}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-[#189AB4]">
                    KSh {selectedProduct.price}
                    <span className="text-sm text-gray-500 ml-2">{selectedProduct.unit}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-[#05445E] ml-1">{selectedProduct.rating}</span>
                    </div>
                    <span className="text-gray-500">({selectedProduct.review_count} reviews)</span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedProduct.stock_quantity > 10
                      ? 'bg-green-500'
                      : selectedProduct.stock_quantity > 0
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`} />
                    <span className="text-[#05445E]">
                      {selectedProduct.stock_quantity > 10
                        ? 'In Stock'
                        : selectedProduct.stock_quantity > 0
                          ? 'Low Stock'
                          : 'Out of Stock'}
                    </span>
                    <span className="text-gray-500">({selectedProduct.stock_quantity} available)</span>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#05445E]">Description</h4>
                    <p className="text-gray-600 text-sm">
                      {selectedProduct.description || 'Fresh, high-quality product.'}
                    </p>
                  </div>

                  {/* Weight/Unit Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-[#05445E] mb-2">Product Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Weight: {selectedProduct.weight}</p>
                      <p>Unit: {selectedProduct.unit}</p>
                      {(selectedProduct.discount ?? 0) > 0 && (
                        <p className="text-red-600 font-medium">Discount: {selectedProduct.discount}%</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddToCartFromModal}
                  disabled={selectedProduct.stock_quantity === 0}
                  className="flex-1 bg-[#189AB4] hover:bg-[#75E6DA] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  onClick={handleViewDetails}
                  className="flex-1 bg-[#05445E] hover:bg-[#189AB4] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={20} />
                  View Full Details
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};