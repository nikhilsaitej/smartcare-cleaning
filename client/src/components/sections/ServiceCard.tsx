import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Check, Plus, Minus, Clock, Shield } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion } from "framer-motion";

interface ServiceProps {
  id: string;
  title: string;
  description: string;
  price: string;
  rating: number;
  image: string;
  features: string[];
}

export default function ServiceCard({ id, title, description, price, rating, image, features }: ServiceProps) {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find(item => item.id === id);
  const quantity = cartItem?.quantity || 0;

  const numericPrice = parseInt(price.replace(/[^0-9]/g, ''));

  const handleAddToCart = () => {
    addToCart({ 
      id, 
      title, 
      price: numericPrice, 
      image, 
      category: "Service",
      rating: rating || 4.8
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="group overflow-hidden border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        {/* Image Section with Premium Overlay */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-gray-200">
          {/* Decorative accent */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl"></div>
          
          {/* Image with overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 group-hover:from-black/10 transition-colors"></div>
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          />
          
          {/* Rating Badge - Premium Style */}
          <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 font-bold">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-900">{rating}</span>
          </div>

          {/* Professional Badge */}
          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold">
            Professional Service
          </Badge>
        </div>
        
        {/* Header Section */}
        <CardHeader className="p-6 pb-3">
          <h3 className="font-display font-bold text-2xl text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        </CardHeader>

        {/* Features Section */}
        <CardContent className="p-6 pt-2 flex-grow">
          <div className="space-y-3">
            {features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-white font-bold" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Info Pills */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 font-semibold">
              <Clock className="h-3.5 w-3.5" />
              Quick Service
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-green-50 px-3 py-1.5 rounded-full text-green-700 font-semibold">
              <Shield className="h-3.5 w-3.5" />
              Guaranteed
            </div>
          </div>
        </CardContent>

        {/* Footer with Pricing and CTA */}
        <CardFooter className="p-6 pt-3 flex items-center justify-between border-t border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50 mt-auto flex-col gap-4">
          <div className="w-full">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Service Starts From</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{price}</p>
          </div>
          
          {/* Action Button */}
          {quantity > 0 ? (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-100 rounded-lg p-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-white"
                onClick={() => updateQuantity(id, quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-bold w-8 text-center text-lg">{quantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-white"
                onClick={() => updateQuantity(id, quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold h-11 text-base shadow-lg"
              onClick={handleAddToCart}
            >
              <Plus className="h-5 w-5 mr-2" />
              Book Service
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
