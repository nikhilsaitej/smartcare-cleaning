import { PRODUCTS } from "@/lib/constants";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

const TOP_PRODUCTS = PRODUCTS
  .sort((a, b) => {
    const tagPriority = (tag?: string) => tag === "Bestseller" ? 3 : tag === "Top Seller" ? 2 : tag === "Popular" ? 1 : 0;
    return tagPriority(b.tag) - tagPriority(a.tag) || b.rating - a.rating;
  })
  .slice(0, 15);

export default function Products() {
  return (
    <section id="products" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <span className="text-orange-500 font-bold tracking-wider text-sm uppercase">Our Store</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mt-2">
              Bestselling Products
            </h2>
            <p className="text-gray-600 mt-2">
              Top-rated cleaning products loved by our customers.
            </p>
          </div>
          
          <Link href="/products">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              View All Products <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {TOP_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
