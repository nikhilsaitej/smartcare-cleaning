import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Check } from "lucide-react";

interface ServiceProps {
  id: string;
  title: string;
  description: string;
  price: string;
  rating: number;
  image: string;
  features: string[];
}

export default function ServiceCard({ title, description, price, rating, image, features }: ServiceProps) {
  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10" />
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm flex items-center gap-1 text-xs font-bold text-primary">
          <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
          {rating}
        </div>
      </div>
      
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-xl text-primary group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">
          {description}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-2 flex-grow">
        <div className="space-y-2 mt-4">
          {features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
              <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="h-2.5 w-2.5 text-green-600" />
              </div>
              {feature}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-gray-50 bg-gray-50/50 mt-auto">
        <div>
          <span className="text-xs text-gray-500 font-medium uppercase display-block">Starting at</span>
          <span className="text-lg font-bold text-primary block leading-none">{price}</span>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm">
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}
