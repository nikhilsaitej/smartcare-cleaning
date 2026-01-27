import { PRODUCTS } from "@/lib/constants";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Filter } from "lucide-react";

export default function Products() {
  return (
    <section id="products" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-orange-500 font-bold tracking-wider text-sm uppercase">Our Store</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mt-2">
              Housekeeping Supplies
            </h2>
            <p className="text-gray-600 mt-2">
              Professional grade cleaning products delivered to your door.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-white">
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              View All Products <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
