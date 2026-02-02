import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ShoppingBag, Trash2, Plus, Minus, CreditCard, 
  MapPin, Clock, Calendar, ChevronRight, Info,
  CheckCircle2, AlertCircle, Phone, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const { user, session } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  const taxes = Math.round(subtotal * 0.05); // 5% GST
  const deliveryFee = subtotal > 1000 ? 0 : 50;
  const totalAmount = subtotal + taxes + deliveryFee;

  useEffect(() => {
    if (items.length === 0) {
      setLocation("/products");
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
      // 1. Get Razorpay Key
      const configRes = await fetch("/api/payment/config", {
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      const { keyId } = await configRes.json();

      // 2. Create Order
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

      // 3. Open Razorpay
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SmartCare Cleaning",
        description: "Professional Cleaning Services",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // 4. Verify Payment
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
            toast({ title: "Order Placed!", description: "Your cleaning service has been booked successfully." });
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: { color: "#1e3a8a" } // Blue-900 (Primary)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900">Checkout</h1>
            <Badge variant="outline" className="ml-2 font-medium">{items.length} items</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-7 space-y-4">
              {/* Phone Verification Status */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Send booking details to</p>
                      <p className="font-bold">{user?.email || "User Account"}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </CardContent>
              </Card>

              {/* Address Selection */}
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="address-input" className="text-sm font-semibold text-gray-700">Enter Service Address</Label>
                    <textarea 
                      id="address-input"
                      className="w-full min-h-[100px] bg-slate-50 border-gray-200 rounded-xl p-4 text-sm focus:ring-primary focus:border-primary"
                      placeholder="House No, Area, Landmark, Vijayawada..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Slot Selection */}
              <Card className="border-none shadow-sm">
                <CardHeader className="bg-white border-b py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Select Time Slot
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {["09:00 AM", "12:00 PM", "03:00 PM"].map((slot) => (
                      <div key={slot} className="relative">
                        <RadioGroupItem value={slot} id={slot} className="peer sr-only" />
                        <Label
                          htmlFor={slot}
                          className="flex flex-col items-center justify-center p-4 bg-white border-2 border-gray-100 rounded-xl cursor-pointer hover:border-blue-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50 transition-all"
                        >
                          <Clock className="h-5 w-5 mb-2 text-gray-400 group-peer-checked:text-primary" />
                          <span className="font-bold text-sm">{slot}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Cancellation Policy */}
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Cancellation policy
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Free cancellations if done more than 12 hrs before the service. 
                  A fee of ₹100 will be charged for last-minute cancellations.
                </p>
                <Link href="/policy" className="text-primary text-sm font-bold hover:underline inline-flex items-center">
                  Read full policy <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-none shadow-lg sticky top-24 overflow-hidden">
                <CardHeader className="bg-white border-b py-4">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Items List */}
                  <div className="max-h-[300px] overflow-y-auto px-5 py-4 space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 rounded-lg shrink-0">
                          <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-bold text-sm truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center border rounded-md h-6">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 text-gray-500 hover:text-primary"><Minus className="h-3 w-3" /></button>
                              <span className="px-2 text-xs font-bold border-x">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 text-gray-500 hover:text-primary"><Plus className="h-3 w-3" /></button>
                            </div>
                            <span className="text-sm font-bold ml-auto">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Frequently Added (Mockup Recommendation) */}
                  <div className="p-5 bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Frequently added together</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      <Card className="shrink-0 w-48 border-none shadow-sm">
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="h-10 w-10 bg-white rounded-md shrink-0"></div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">Premium Disinfectant</p>
                            <p className="text-xs text-primary font-bold">₹249</p>
                          </div>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-primary font-bold ml-auto">Add</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Summary */}
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Item total</span>
                      <span className="font-semibold">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1 underline decoration-dotted underline-offset-4">Taxes and Fee <Info className="h-3 w-3" /></span>
                      <span className="font-semibold">₹{taxes}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee</span>
                      <span className={deliveryFee === 0 ? "text-green-600 font-bold" : "font-semibold"}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total amount</span>
                      <span>₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <div className="p-5 bg-white border-t">
                    <Button 
                      onClick={handleCheckout}
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 h-14 text-xl font-bold shadow-xl shadow-blue-900/10 rounded-xl"
                    >
                      {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `Pay ₹${totalAmount}`}
                    </Button>
                    <p className="text-[10px] text-center text-gray-400 mt-4 px-6 leading-tight">
                      By proceeding, you agree to SmartCare's terms of service and privacy policy.
                    </p>
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
