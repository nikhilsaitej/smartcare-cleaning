import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Minus, CreditCard, MapPin, Clock, ChevronRight, Info,
  CheckCircle2, Phone, Loader2, Shield, X, Search, Percent,
  Lock, ChevronDown, Edit2, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { items, updateQuantity, subtotal, clearCart } = useCart();
  const { user, session } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [addressSaved, setAddressSaved] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  
  // Slot Selection State
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Other Modals
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [breakupModalOpen, setBreakupModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [avoidCalling, setAvoidCalling] = useState(false);

  const taxes = Math.round(subtotal * 0.05);
  const platformFee = 10;
  const deliveryFee = subtotal > 1000 ? 0 : 50;
  const totalAmount = subtotal + taxes + platformFee + deliveryFee;

  useEffect(() => {
    if (items.length === 0) {
      setLocation("/cart");
    }
  }, [items, setLocation]);

  // Generate dates for next 7 days
  const getNextDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        id: `day-${i}`,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        full: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const timeSlots = [
    "08:00 AM", "08:30 AM", "09:00 AM",
    "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM",
    "12:30 PM", "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM",
    "03:30 PM", "04:00 PM"
  ];

  const coupons = [
    { code: "FIRST50", discount: "50% off", description: "For first-time users", maxDiscount: "₹100" },
    { code: "CLEAN20", discount: "20% off", description: "On all services", maxDiscount: "₹200" },
    { code: "SMART100", discount: "₹100 off", description: "On orders above ₹999", maxDiscount: "₹100" },
    { code: "WEEKEND", discount: "15% off", description: "Weekend special", maxDiscount: "₹150" },
    { code: "REFER10", discount: "₹50 off", description: "Referral discount", maxDiscount: "₹50" },
  ];

  const handleOpenSlotModal = () => {
    setSlotModalOpen(true);
    setLoadingSlots(true);
    setSlotsLoaded(false);
    
    // Simulate loading slots
    setTimeout(() => {
      setLoadingSlots(false);
      setSlotsLoaded(true);
    }, 1500);
  };

  const handleConfirmSlot = () => {
    if (selectedDate && selectedTime) {
      setSlotModalOpen(false);
      toast({ title: "Slot Selected", description: `${selectedDate} at ${selectedTime}` });
    }
  };

  const handleSaveAddress = () => {
    if (address.trim().length > 10) {
      setAddressSaved(true);
      setEditingAddress(false);
      toast({ title: "Address Saved", description: "Your delivery address has been saved." });
    } else {
      toast({ title: "Invalid Address", description: "Please enter a complete address.", variant: "destructive" });
    }
  };

  const handleCheckout = async () => {
    if (!addressSaved) {
      toast({ title: "Address Required", description: "Please save your delivery address.", variant: "destructive" });
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast({ title: "Slot Required", description: "Please select a time slot.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const configRes = await fetch("/api/payment/config", {
        headers: { "Authorization": `Bearer ${session?.access_token}` }
      });
      
      if (!configRes.ok) {
        toast({ title: "Payment Setup", description: "Razorpay will be configured with your API keys.", variant: "default" });
        setLoading(false);
        return;
      }
      
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
            toast({ title: "Order Placed!", description: "Your order has been confirmed." });
          }
        },
        prefill: {
          name: user?.user_metadata?.full_name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: { color: "#7c3aed" }
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

  const dates = getNextDates();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-3">
              {/* Contact Info */}
              <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Send booking details to</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email || user?.phone || "+91 XXXXXXXXXX"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      {addressSaved && !editingAddress ? (
                        <p className="text-sm text-gray-500 truncate">{address}</p>
                      ) : null}
                    </div>
                    {addressSaved && !editingAddress && (
                      <Button variant="outline" size="sm" onClick={() => setEditingAddress(true)} className="shrink-0">
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {(!addressSaved || editingAddress) && (
                    <div className="mt-4 space-y-3">
                      <Input
                        placeholder="House No, Building, Street, Area, Vijayawada..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-gray-50"
                      />
                      <Button 
                        onClick={handleSaveAddress}
                        className="w-full bg-primary hover:bg-primary/90 h-11 font-semibold rounded-lg"
                      >
                        Save Address
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Time Slot */}
              <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Slot</p>
                      {selectedDate && selectedTime && (
                        <p className="text-sm text-gray-500">{selectedDate} - {selectedTime}</p>
                      )}
                    </div>
                    {selectedDate && selectedTime && (
                      <Button variant="outline" size="sm" onClick={handleOpenSlotModal} className="shrink-0">
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {(!selectedDate || !selectedTime) && (
                    <Button 
                      onClick={handleOpenSlotModal}
                      className="w-full mt-4 bg-violet-600 hover:bg-violet-700 h-11 font-semibold rounded-lg"
                    >
                      Select time & date
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Payment Method</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCheckout}
                    disabled={loading || !addressSaved || !selectedDate || !selectedTime}
                    className="w-full mt-4 bg-violet-600 hover:bg-violet-700 h-12 font-semibold rounded-lg disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Proceed to pay"}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-3">
                    By proceeding, you agree to our{" "}
                    <button onClick={() => setPolicyModalOpen(true)} className="underline hover:text-primary">T&C</button>,{" "}
                    <button onClick={() => setPolicyModalOpen(true)} className="underline hover:text-primary">Privacy</button> and{" "}
                    <button onClick={() => setPolicyModalOpen(true)} className="underline hover:text-primary">Cancellation Policy</button>.
                  </p>
                </CardContent>
              </Card>

              {/* Cancellation Policy */}
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Cancellation policy</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  Free cancellations if done more than 12 hrs before the service or if a professional isn't assigned. A fee will be charged otherwise.
                </p>
                <button 
                  onClick={() => setPolicyModalOpen(true)}
                  className="text-primary text-sm font-semibold underline hover:no-underline"
                >
                  Read full policy
                </button>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-5">
              <Card className="border border-gray-100 shadow-lg rounded-xl sticky top-24 overflow-hidden">
                <CardContent className="p-0">
                  {/* Items */}
                  <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.id} className="p-4 flex gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="inline-flex items-center border border-violet-500 rounded-md overflow-hidden">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 text-violet-600 hover:bg-violet-50"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3 py-1 text-sm font-semibold text-violet-600 bg-white">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 text-violet-600 hover:bg-violet-50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <p className="text-xs text-gray-400 line-through">₹{item.originalPrice * item.quantity}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Frequently Added */}
                  <div className="p-4 bg-gray-50/50">
                    <p className="text-sm font-medium text-gray-700 mb-3">Frequently added together</p>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                      {[
                        { name: "Deep Clean Add-on", price: 349 },
                        { name: "Sanitization", price: 199 }
                      ].map((item, idx) => (
                        <div key={idx} className="shrink-0 flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg min-w-[180px]">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-sm font-semibold text-primary">₹{item.price}</p>
                          </div>
                          <button className="text-violet-600 text-sm font-semibold">Add</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Avoid Calling */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="avoid-call" 
                        checked={avoidCalling} 
                        onCheckedChange={(c) => setAvoidCalling(!!c)} 
                      />
                      <Label htmlFor="avoid-call" className="text-sm text-gray-700 cursor-pointer">
                        Avoid calling before reaching the location
                      </Label>
                    </div>
                  </div>

                  <Separator />

                  {/* Coupons */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setCouponModalOpen(true)}
                  >
                    <div className="flex items-center gap-3">
                      <Percent className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Coupons and offers</span>
                    </div>
                    <span className="text-violet-600 text-sm font-semibold">{coupons.length} offers &gt;</span>
                  </div>

                  <Separator />

                  {/* Payment Summary */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900">Payment summary</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Item total</span>
                      <span className="font-medium text-gray-900">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        Taxes and Fee
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="text-xs">GST (5%): ₹{taxes}</p>
                            <p className="text-xs">Platform Fee: ₹{platformFee}</p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="font-medium text-gray-900">₹{taxes + platformFee}</span>
                    </div>
                    {deliveryFee > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium text-gray-900">₹{deliveryFee}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium text-green-600">FREE</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total amount</span>
                      <span className="font-semibold text-gray-900">₹{totalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Amount to pay</span>
                      <span className="font-semibold text-gray-900">₹{totalAmount}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Final Amount */}
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Amount to pay</p>
                      <p className="text-2xl font-bold text-gray-900">₹{totalAmount}</p>
                    </div>
                    <button 
                      onClick={() => setBreakupModalOpen(true)}
                      className="text-violet-600 text-sm font-semibold underline"
                    >
                      View breakup
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Slot Selection Modal */}
      <Dialog open={slotModalOpen} onOpenChange={setSlotModalOpen}>
        <DialogContent className="max-w-lg p-0 gap-0">
          <AnimatePresence mode="wait">
            {loadingSlots ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 flex flex-col items-center justify-center"
              >
                <div className="h-20 w-20 rounded-full bg-violet-100 flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-violet-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Finding available time slots.</h3>
                <p className="text-gray-500">This may take a while</p>
              </motion.div>
            ) : slotsLoaded ? (
              <motion.div 
                key="slots"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6"
              >
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl">When should the professional arrive?</DialogTitle>
                  <p className="text-sm text-gray-500">Service will take approx. 1 hr & 50 mins</p>
                </DialogHeader>

                {/* Date Selection */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {dates.slice(0, 5).map((date) => (
                    <button
                      key={date.id}
                      onClick={() => setSelectedDate(date.full)}
                      className={`flex flex-col items-center justify-center min-w-[70px] p-3 rounded-lg border-2 transition-all ${
                        selectedDate === date.full 
                          ? 'border-gray-900 bg-gray-900 text-white' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-medium">{date.day}</span>
                      <span className="text-lg font-bold">{date.date}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <CreditCard className="h-4 w-4" />
                  Online payment only for selected date
                </div>

                <h4 className="font-semibold text-gray-900 mb-3">Select start time of service</h4>

                {/* Time Slots Grid */}
                <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto mb-6">
                  {timeSlots.map((slot, idx) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all relative ${
                        selectedTime === slot 
                          ? 'border-gray-900 bg-gray-900 text-white' 
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {idx === 1 && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-green-600 font-semibold">
                          + ₹100
                        </span>
                      )}
                      {slot}
                    </button>
                  ))}
                </div>

                <Button 
                  onClick={handleConfirmSlot}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-violet-600 hover:bg-violet-700 h-12 font-semibold rounded-lg disabled:opacity-50"
                >
                  Proceed to checkout
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Policy Modal */}
      <Dialog open={policyModalOpen} onOpenChange={setPolicyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancellation & Refund Policy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Free Cancellation</h4>
              <p>Cancel for free if done more than 12 hours before the scheduled service time.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Partial Refund</h4>
              <p>Cancellations made 2-12 hours before service: 50% refund.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">No Refund</h4>
              <p>Cancellations made less than 2 hours before service are non-refundable.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Professional Not Assigned</h4>
              <p>Full refund if we're unable to assign a professional for your service.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Breakup Modal */}
      <Dialog open={breakupModalOpen} onOpenChange={setBreakupModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Price Breakup</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.title} x{item.quantity}</span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (5%)</span>
              <span className="font-medium">₹{taxes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform Fee</span>
              <span className="font-medium">₹{platformFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery</span>
              <span className={deliveryFee === 0 ? "font-medium text-green-600" : "font-medium"}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coupons Modal */}
      <Dialog open={couponModalOpen} onOpenChange={setCouponModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Available Offers</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {coupons.map((coupon, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-xl hover:border-violet-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{coupon.discount}</Badge>
                    </div>
                    <p className="font-semibold text-gray-900">{coupon.code}</p>
                    <p className="text-sm text-gray-500">{coupon.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Max discount: {coupon.maxDiscount}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-violet-600 border-violet-200">
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
