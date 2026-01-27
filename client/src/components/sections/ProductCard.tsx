import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Plus } from "lucide-react";

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

export default function ProductCard({ title, category, price, originalPrice, rating, image, tag }: ProductProps) {
  return (
    <Card className="group border border-gray-100 shadow-md hover:shadow-xl hover:border-blue-100 transition-all duration-300">
      <CardContent className="p-4">
        {/* Image Area */}
        <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-50 p-4 flex items-center justify-center">
          {tag && (
            <Badge className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm z-10">
              {tag}
            </Badge>
          )}
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
          />
          
          <Button 
            size="icon" 
            className="absolute bottom-3 right-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg bg-white text-primary hover:bg-primary hover:text-white"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{category}</span>
            <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
              <Star className="h-3 w-3 fill-orange-500" />
              {rating}
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5em]">
            {title}
          </h3>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">₹{price}</span>
              {originalPrice && (
                <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
              )}
            </div>
            <Button variant="outline" size="sm" className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50">
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
