import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ShoppingBag, Plus, Minus, CreditCard, MapPin, Clock, 
  Phone, ChevronRight, Info, CheckCircle2, Percent, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Cart() {
  const { items, updateQuantity, subtotal } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [avoidCalling, setAvoidCalling] = useState(false);
  
  const taxes = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 1000 ? 0 : 50;
  const total = subtotal + taxes + deliveryFee;

  const handleProceedToCheckout = () => {
    if (!user) {
      setLocation("/login?redirect=/checkout");
      return;
    }
    setLocation("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="text-center py-16 border-none shadow-lg">
              <CardContent className="space-y-6">
                <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-12 w-12 text-primary/40" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                  <p className="text-gray-500">Looks like you haven't added anything yet.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Link href="/services">
                    <Button variant="outline" className="w-full sm:w-auto px-8">
                      Browse Services
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-8">
                      Shop Products
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <Badge variant="secondary" className="text-sm">{items.length} {items.length === 1 ? 'item' : 'items'}</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-4">
              {/* Contact Info */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Send booking details to</p>
                      <p className="font-semibold truncate">{user?.email || user?.phone || "Login to continue"}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* Address Placeholder */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Address</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full mt-4 bg-primary hover:bg-primary/90 h-12 font-semibold"
                  >
                    Select address
                  </Button>
                </CardContent>
              </Card>

              {/* Slot Placeholder */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Slot</p>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-violet-600 hover:bg-violet-700 h-12 font-semibold text-white rounded-lg"
                  >
                    Select time & date
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Method Placeholder */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-400">Payment Method</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-5">
              <Card className="border-none shadow-lg sticky top-24 overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 space-y-4 max-h-[320px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 leading-tight">{item.title}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="inline-flex items-center border border-primary rounded-md overflow-hidden">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 text-primary hover:bg-primary/5 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3 py-1 text-sm font-bold text-primary border-x border-primary">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 text-primary hover:bg-primary/5 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 shrink-0">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="p-5 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Frequently added together</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      <div className="shrink-0 flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl min-w-[200px]">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Deep Cleaning</p>
                          <p className="text-sm font-bold text-primary">₹599</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-primary font-semibold shrink-0">Add</Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="avoid-calling" 
                        checked={avoidCalling} 
                        onCheckedChange={(checked) => setAvoidCalling(!!checked)} 
                      />
                      <Label htmlFor="avoid-calling" className="text-sm text-gray-700 cursor-pointer">
                        Avoid calling before reaching the location
                      </Label>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-5">
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-5 px-5 py-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <Percent className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-gray-900">Coupons and offers</span>
                      </div>
                      <span className="text-primary font-semibold text-sm">5 offers &gt;</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-gray-900 mb-4">Payment summary</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Item total</span>
                      <span className="font-medium">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        Taxes and Fee
                        <Info className="h-3 w-3 text-gray-400" />
                      </span>
                      <span className="font-medium">₹{taxes}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">₹{deliveryFee}</span>
                      </div>
                    )}
                    <Separator className="my-3" />
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total amount</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount to pay</p>
                        <p className="text-2xl font-bold text-gray-900">₹{total}</p>
                      </div>
                      <button className="text-primary text-sm font-semibold hover:underline">
                        View breakup
                      </button>
                    </div>
                    <Button 
                      onClick={handleProceedToCheckout}
                      className="w-full bg-primary hover:bg-primary/90 h-14 text-lg font-bold rounded-xl shadow-lg"
                    >
                      {user ? "Proceed to Checkout" : "Login to Continue"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
