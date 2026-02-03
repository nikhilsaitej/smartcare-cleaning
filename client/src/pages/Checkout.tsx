import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  ShoppingBag, Plus, Minus, CreditCard, MapPin, Clock, ChevronRight, Info,
  CheckCircle2, AlertCircle, Phone, Loader2, Shield, Sparkles, Gift,
  ArrowLeft, Check, Star, Percent, Lock, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function CheckoutPage() {
  const { items, updateQuantity, subtotal, clearCart } = useCart();
  const { user, session } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("today");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const taxes = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 1000 ? 0 : 50;
  const totalAmount = subtotal + taxes + deliveryFee;
  const savings = items.reduce((acc, item) => acc + ((item.originalPrice || item.price) - item.price) * item.quantity, 0);

  useEffect(() => {
    if (items.length === 0) {
      setLocation("/cart");
    }
  }, [items, setLocation]);

  const handleCheckout = async () => {
    if (!address || !selectedSlot) {
      toast({
        title: "Missing Details",
        description: "Please provide delivery address and select a time slot.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const configRes = await fetch("/api/payment/config", {
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const { keyId } = await configRes.json();

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${session?.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          idempotencyKey: `checkout_${Date.now()}_${user?.id}`
        })
      });

      const orderData = await orderRes.json();

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SmartCare Cleaning",
        description: "Professional Cleaning Services",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { 
              "Authorization": `Bearer ${session?.access_token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          if (verifyRes.ok) {
            clearCart();
            setLocation("/dashboard?success=true");
            toast({ title: "Order Placed!", description: "Your order has been confirmed successfully." });
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: { color: "#1e40af" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    { id: "morning", time: "9:00 AM - 12:00 PM", label: "Morning" },
    { id: "afternoon", time: "12:00 PM - 3:00 PM", label: "Afternoon" },
    { id: "evening", time: "3:00 PM - 6:00 PM", label: "Evening" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div {...fadeInUp} className="mb-8">
            <Link href="/cart">
              <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Cart</span>
              </button>
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Secure Checkout</h1>
                <p className="text-gray-500 mt-1">Complete your order in just a few steps</p>
              </div>
              {/* Progress Steps */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-primary">Cart</span>
                </div>
                <div className="w-8 h-0.5 bg-primary"></div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-sm font-medium text-primary">Checkout</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-sm font-medium text-gray-400">Payment</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Contact Section */}
              <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Logged in as</p>
                      <p className="font-bold text-green-900">{user?.email || "Guest User"}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Delivery Address */}
              <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden">
                <div className="px-6 py-4 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Delivery Address</h3>
                      <p className="text-sm text-gray-500">Where should we deliver?</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Complete Address</Label>
                      <textarea 
                        className="w-full min-h-[100px] bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        placeholder="House/Flat No, Building, Street, Area, Landmark..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">Pincode</Label>
                      <Input 
                        type="text"
                        placeholder="520001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-400 mt-2">Vijayawada, AP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time Selection */}
              <Card className="border-0 shadow-lg shadow-gray-100/50 overflow-hidden">
                <div className="px-6 py-4 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Schedule Service</h3>
                      <p className="text-sm text-gray-500">Pick a date and time slot</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Date Selection */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Select Date</Label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {["today", "tomorrow", "day3"].map((day, idx) => {
                        const date = new Date();
                        date.setDate(date.getDate() + idx);
                        const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dateNum = date.getDate();
                        const month = date.toLocaleDateString('en-US', { month: 'short' });
                        
                        return (
                          <button
                            key={day}
                            onClick={() => setSelectedDate(day)}
                            className={`flex flex-col items-center justify-center min-w-[90px] p-4 rounded-2xl border-2 transition-all ${
                              selectedDate === day 
                                ? 'border-primary bg-blue-50 shadow-lg shadow-blue-100' 
                                : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                          >
                            <span className={`text-xs font-medium ${selectedDate === day ? 'text-primary' : 'text-gray-500'}`}>
                              {dayName}
                            </span>
                            <span className={`text-2xl font-bold ${selectedDate === day ? 'text-primary' : 'text-gray-900'}`}>
                              {dateNum}
                            </span>
                            <span className={`text-xs ${selectedDate === day ? 'text-primary' : 'text-gray-400'}`}>
                              {month}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Select Time Slot</Label>
                    <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {timeSlots.map((slot) => (
                        <div key={slot.id}>
                          <RadioGroupItem value={slot.id} id={slot.id} className="peer sr-only" />
                          <Label
                            htmlFor={slot.id}
                            className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-100 rounded-2xl cursor-pointer hover:border-primary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-blue-100 transition-all"
                          >
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{slot.label}</span>
                            <span className="font-bold text-gray-900 mt-1">{slot.time}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-gray-100">
                  <Shield className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-xs font-semibold text-gray-700">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-gray-100">
                  <Star className="h-8 w-8 text-orange-500 mb-2" />
                  <span className="text-xs font-semibold text-gray-700">Verified Experts</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-gray-100">
                  <Truck className="h-8 w-8 text-primary mb-2" />
                  <span className="text-xs font-semibold text-gray-700">On-Time Service</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Order Summary */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <Card className="border-0 shadow-2xl shadow-gray-200/50 sticky top-24 overflow-hidden rounded-3xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-blue-700 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Order Summary</h2>
                    <Badge className="bg-white/20 text-white hover:bg-white/30">{items.length} items</Badge>
                  </div>
                </div>

                <CardContent className="p-0">
                  {/* Items */}
                  <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-100">
                    {items.map((item, idx) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex gap-4">
                          <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-3 py-1.5 text-sm font-bold text-gray-900 bg-white">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Coupon Section */}
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-y border-orange-100">
                    <div className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                          <Percent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Apply Coupon</p>
                          <p className="text-xs text-orange-600 font-medium">5 offers available</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-5 space-y-3 bg-gray-50/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Item Total</span>
                      <span className="font-medium text-gray-900">₹{subtotal}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> You Save
                        </span>
                        <span className="font-medium text-green-600">-₹{savings}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        Taxes & Fees
                        <Info className="h-3 w-3 text-gray-400" />
                      </span>
                      <span className="font-medium text-gray-900">₹{taxes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Terms & Pay Button */}
                  <div className="p-5 bg-white border-t space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        id="terms" 
                        checked={agreeTerms}
                        onCheckedChange={(c) => setAgreeTerms(!!c)}
                        className="mt-0.5"
                      />
                      <Label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                        I agree to the <span className="text-primary font-medium hover:underline">Terms of Service</span> and <span className="text-primary font-medium hover:underline">Privacy Policy</span>
                      </Label>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      disabled={loading || !agreeTerms}
                      className="w-full bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-700/90 h-14 text-lg font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:shadow-2xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Pay ₹{totalAmount}
                        </span>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 pt-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-5 opacity-50" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 opacity-50" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5 opacity-50" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
