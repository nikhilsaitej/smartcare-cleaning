import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/sections/ProductCard";
import { PRODUCTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ShoppingCart, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Disinfectants", "Phenyl", "Floor Cleaners", "Cleaning Tools", "Other"];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Banner */}
        <div className="bg-primary text-white py-12 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center md:text-left">
                <nav className="text-xs font-medium text-blue-200 mb-4 uppercase tracking-widest">Home • Products</nav>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">HOUSEKEEPING SUPPLIES</h1>
                <p className="text-blue-100 text-lg">Top Quality Cleaners, Disinfectants & Cleaning Tools</p>
                <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Same-Day Delivery
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Affordable Pricing
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center">
                  <div className="h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                     <ShoppingCart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Trusted by</h3>
                  <p className="text-3xl font-extrabold text-orange-400">100+ Local</p>
                  <p className="text-sm font-medium uppercase tracking-wider">Customers</p>
                </div>
              </div>
            </div>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 mt-12">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-6 font-bold transition-all",
                  selectedCategory === cat ? "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20" : "bg-white hover:bg-slate-50"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1 space-y-8">
              <Card className="border-none shadow-md overflow-hidden sticky top-24">
                <div className="bg-primary/5 p-4 border-b">
                  <h3 className="font-bold flex items-center gap-2 text-primary">
                    <Filter className="h-4 w-4" /> Filter Products
                  </h3>
                </div>
                <CardContent className="p-6 space-y-8">
                  {/* Search */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase text-slate-500">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search products..." 
                        className="pl-10 bg-slate-50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold uppercase text-slate-500">Price Range</Label>
                      <span className="text-xs font-bold text-primary">₹0 - ₹{priceRange[1]}</span>
                    </div>
                    <Slider
                      defaultValue={[1500]}
                      max={5000}
                      step={50}
                      value={[priceRange[1]]}
                      onValueChange={(val) => setPriceRange([0, val[0]])}
                      className="py-4"
                    />
                  </div>

                  {/* Categories List */}
                  <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase text-slate-500">Quick Categories</Label>
                    <div className="space-y-3">
                      {CATEGORIES.slice(1).map((cat) => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`cat-${cat}`} 
                            checked={selectedCategory === cat}
                            onCheckedChange={() => setSelectedCategory(selectedCategory === cat ? "All" : cat)}
                          />
                          <label 
                            htmlFor={`cat-${cat}`} 
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 font-bold" onClick={() => {
                    setSelectedCategory("All");
                    setPriceRange([0, 5000]);
                    setSearchQuery("");
                  }}>
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-3 space-y-8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  Showing <span className="text-primary font-bold">{filteredProducts.length}</span> products
                </p>
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-slate-400 uppercase">Sort By:</span>
                   <Select defaultValue="popularity">
                      <SelectTrigger className="w-[180px] bg-white border-none shadow-sm">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="low-to-high">Price: Low to High</SelectItem>
                        <SelectItem value="high-to-low">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Average Rating</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                   <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-slate-200" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                   <p className="text-slate-500">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
