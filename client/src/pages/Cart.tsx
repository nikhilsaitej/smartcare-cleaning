import { Link } from "wouter";
import { ShoppingBag, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-display font-bold text-primary mb-8 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-orange-500" />
            Your Shopping Cart
          </h1>

          {items.length === 0 ? (
            <Card className="text-center py-20">
              <CardContent>
                <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-600 mb-2">Your cart is empty</h2>
                <p className="text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link href="/products">
                  <Button className="bg-primary hover:bg-primary/90 px-8" data-testid="button-continue-shopping">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Item List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="border-none shadow-sm overflow-hidden" data-testid={`cart-item-${item.id}`}>
                    <CardContent className="p-4 flex items-center gap-6">
                      <div className="h-24 w-24 bg-white rounded-lg p-2 shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-grow">
                        <span className="text-[10px] font-bold text-orange-500 uppercase">{item.category}</span>
                        <h3 className="font-bold text-primary text-lg mb-1">{item.title}</h3>
                        <p className="text-primary font-bold">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-white"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold w-4 text-center" data-testid={`text-quantity-${item.id}`}>{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-white"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeFromCart(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="border-none shadow-lg sticky top-24">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-bold" data-testid="text-subtotal">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery Fee</span>
                        <span className="font-bold text-green-600" data-testid="text-delivery">{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                      </div>
                      <div className="border-t pt-4 flex justify-between text-xl font-bold text-primary">
                        <span>Total</span>
                        <span data-testid="text-total">₹{total}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold shadow-lg shadow-orange-500/20" data-testid="button-checkout">
                      Checkout <CreditCard className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                      Taxes calculated at checkout. Same-day delivery available in Vijayawada.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
