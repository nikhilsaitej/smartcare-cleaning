import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Plus, Minus, Zap, Award } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";

interface ProductProps {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  tag?: string;
}

export default function ProductCard({ id, title, category, price, originalPrice, rating, image, tag }: ProductProps) {
  const { items, addToCart, updateQuantity } = useCart();
  
  const cartItem = items.find(item => item.id === id);
  const quantity = cartItem?.quantity || 0;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    addToCart({ id, title, category, price, originalPrice, rating, image, tag });
  };

  const handleIncrease = () => {
    updateQuantity(id, quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(id, quantity - 1);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group h-full border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
        {/* Image Container with Enhanced Design */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
          {/* Decorative corner accent */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl"></div>
          
          {/* Badge Section */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {tag && (
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg text-xs">
                {tag}
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg text-xs">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Quality Indicator */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm">
            <Award className="h-4 w-4 text-blue-600" />
          </div>

          {/* Product Image */}
          <img 
            src={image} 
            alt={title} 
            className="w-[85%] h-[85%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Add to Cart Button */}
          <motion.div
            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <Button 
              size="icon" 
              className="rounded-full h-12 w-12 shadow-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              onClick={handleAddToCart}
              data-testid={`button-cart-icon-${id}`}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Content Section */}
        <CardContent className="p-4 flex flex-col flex-grow">
          {/* Category & Rating */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider">{category}</span>
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-900">{rating}</span>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5em] mb-3">
            {title}
          </h3>

          {/* Pricing Section */}
          <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-500">Special Price</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">₹{price}</span>
                {originalPrice && (
                  <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Controls / Add Button */}
          <div className="mt-auto">
            {quantity > 0 ? (
              <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-white"
                  onClick={handleDecrease}
                  data-testid={`button-decrease-${id}`}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-bold w-6 text-center" data-testid={`text-qty-${id}`}>{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-white"
                  onClick={handleIncrease}
                  data-testid={`button-increase-${id}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
