import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  original_price?: number;
  rating: number;
  image: string;
  tag?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        const sortedProducts = data
          .sort((a: Product, b: Product) => {
            const tagPriority = (tag?: string) => tag === "Bestseller" ? 3 : tag === "Top Seller" ? 2 : tag === "Popular" ? 1 : 0;
            return tagPriority(b.tag) - tagPriority(a.tag) || (b.rating || 0) - (a.rating || 0);
          })
          .slice(0, 15);
        setProducts(sortedProducts);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-slate-500">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">No products available</h3>
            <p className="text-slate-500">Check back soon for our cleaning products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id}
                title={product.title}
                category={product.category}
                price={product.price}
                originalPrice={product.original_price}
                rating={product.rating || 4.5}
                image={product.image}
                tag={product.tag}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
