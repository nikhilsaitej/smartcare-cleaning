import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Minus, CreditCard, MapPin, Clock, ChevronRight, Info,
  Phone, Loader2, X, Search, Percent, Package, Truck, Home
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
  DialogDescription,
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
import AddressModal, { SavedAddress, useAddresses } from "@/components/AddressModal";

export default function CheckoutPage() {
  const { items, updateQuantity, addToCart, subtotal, clearCart } = useCart();
  const { user, session } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const { addresses, saveAddress, deleteAddress } = useAddresses();
  
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [breakupModalOpen, setBreakupModalOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [avoidCalling, setAvoidCalling] = useState(false);

  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; flatDiscount?: number; maxDiscount: number } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tipParam = params.get("tip");
    if (tipParam) {
      const tipValue = parseInt(tipParam);
      if ([50, 75, 100].includes(tipValue)) {
        setSelectedTip(tipValue);
      } else if (tipValue > 0) {
        setSelectedTip(-1);
        setCustomTip(tipValue.toString());
      }
    }
  }, []);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses, selectedAddress]);

  const hasServices = useMemo(() => items.some(item => item.category === "Service"), [items]);
  const hasProducts = useMemo(() => items.some(item => item.category !== "Service"), [items]);
  const isProductsOnly = hasProducts && !hasServices;

  const tipAmount = selectedTip === -1 ? (parseInt(customTip) || 0) : (selectedTip || 0);
  const taxes = Math.round(subtotal * 0.05);
  const platformFee = 10;
  const deliveryFee = subtotal > 1000 ? 0 : (isProductsOnly ? 40 : 50);
  
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.flatDiscount) {
      return Math.min(appliedCoupon.flatDiscount, appliedCoupon.maxDiscount);
    }
    if (appliedCoupon.discountPercent) {
      const discount = Math.round(subtotal * appliedCoupon.discountPercent / 100);
      return Math.min(discount, appliedCoupon.maxDiscount);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const totalAmount = subtotal + taxes + platformFee + deliveryFee + tipAmount - couponDiscount;

  const handleTipClick = (amount: number) => {
    if (selectedTip === amount) {
      setSelectedTip(null);
      setCustomTip("");
    } else {
      setSelectedTip(amount);
      setCustomTip("");
    }
  };

  const handleApplyCoupon = (coupon: typeof coupons[0]) => {
    let discountPercent: number | undefined;
    let flatDiscount: number | undefined;
    const maxDiscount = parseInt(coupon.maxDiscount.replace("₹", ""));

    if (coupon.discount.includes("% off")) {
      discountPercent = parseInt(coupon.discount.replace("% off", ""));
    } else if (coupon.discount.includes("₹")) {
      flatDiscount = parseInt(coupon.discount.replace("₹", "").replace(" off", ""));
    }

    if (coupon.code === "SMART100" && subtotal < 999) {
      toast({ title: "Coupon not applicable", description: "This coupon is valid for orders above ₹999", variant: "destructive" });
      return;
    }

    setAppliedCoupon({ code: coupon.code, discountPercent, flatDiscount, maxDiscount });
    setCouponModalOpen(false);
    toast({ title: "Coupon applied!", description: `${coupon.code} - ${coupon.discount}` });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast({ title: "Coupon removed" });
  };

  const frequentlyAdded = useMemo(() => {
    if (hasServices) {
      return [
        { id: "service-addon-1", title: "Deep Cleaning Add-on", price: 349, category: "Service" },
        { id: "service-addon-2", title: "Sanitization Spray", price: 199, category: "Product" },
        { id: "service-addon-3", title: "Bathroom Deep Clean", price: 299, category: "Service" },
        { id: "service-addon-4", title: "Kitchen Chimney Cleaning", price: 449, category: "Service" },
      ];
    } else {
      return [
        { id: "product-addon-1", title: "Floor Cleaner 1L", price: 249, category: "Product" },
        { id: "product-addon-2", title: "Microfiber Cloth Set", price: 149, category: "Product" },
        { id: "product-addon-3", title: "Glass Cleaner 500ml", price: 129, category: "Product" },
        { id: "product-addon-4", title: "Toilet Cleaner 1L", price: 179, category: "Product" },
      ];
    }
  }, [hasServices]);

  const handleAddFrequentItem = (item: { id: string; title: string; price: number; category: string }) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      category: item.category,
      rating: 4.5,
      image: ""
    });
    toast({ title: "Added to cart", description: `${item.title} added successfully` });
  };

  const coupons = [
    { code: "FIRST50", discount: "50% off", description: "For first-time users", maxDiscount: "₹100" },
    { code: "CLEAN20", discount: "20% off", description: "On all services", maxDiscount: "₹200" },
    { code: "SMART100", discount: "₹100 off", description: "On orders above ₹999", maxDiscount: "₹100" },
    { code: "WEEKEND", discount: "15% off", description: "Weekend special", maxDiscount: "₹150" },
    { code: "REFER10", discount: "₹50 off", description: "Referral discount", maxDiscount: "₹50" },
  ];

  useEffect(() => {
    if (items.length === 0) {
      setLocation("/cart");
    }
  }, [items, setLocation]);

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
        full: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        isToday: i === 0
      });
    }
    return dates;
  };

  const timeSlotRanges = [
    { id: "slot-1", label: "08:00 AM - 10:00 AM", startHour: 8 },
    { id: "slot-2", label: "10:00 AM - 12:00 PM", startHour: 10 },
    { id: "slot-3", label: "12:00 PM - 02:00 PM", startHour: 12 },
    { id: "slot-4", label: "02:00 PM - 04:00 PM", startHour: 14 },
    { id: "slot-5", label: "04:00 PM - 06:00 PM", startHour: 16 },
    { id: "slot-6", label: "06:00 PM - 08:00 PM", startHour: 18 },
  ];

  const getAvailableTimeSlots = () => {
    if (selectedDateIndex === null) return timeSlotRanges;
    
    if (selectedDateIndex === 0) {
      const currentHour = new Date().getHours();
      const bufferHours = 2;
      return timeSlotRanges.filter(slot => slot.startHour > currentHour + bufferHours);
    }
    
    return timeSlotRanges;
  };

  const handleOpenSlotModal = () => {
    setSlotModalOpen(true);
    setLoadingSlots(true);
    setSlotsLoaded(false);
    setTimeout(() => {
      setLoadingSlots(false);
      setSlotsLoaded(true);
    }, 1200);
  };

  const handleSelectDate = (date: typeof dates[0], index: number) => {
    setSelectedDate(date.full);
    setSelectedDateIndex(index);
    setSelectedTime(null);
  };

  const handleConfirmSlot = () => {
    if (selectedDate && selectedTime) {
      setSlotModalOpen(false);
      toast({ title: "Slot Selected", description: `${selectedDate} at ${selectedTime}` });
    }
  };

  const handleAddressSelect = (address: SavedAddress) => {
    setSelectedAddress(address);
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast({ title: "Address Required", description: "Please select a delivery address.", variant: "destructive" });
      return;
    }
    if (!isProductsOnly && (!selectedDate || !selectedTime)) {
      toast({ title: "Slot Required", description: "Please select a time slot.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (!(window as any).Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

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
            price: item.price,
            category: item.category
          })),
          tip: tipAmount,
          address: selectedAddress,
          slot: !isProductsOnly ? { date: selectedDate, time: selectedTime } : null,
          avoidCalling: avoidCalling,
          idempotencyKey: `checkout_${Date.now()}_${user?.id}_${totalAmount}`
        })
      });

      const orderData = await orderRes.json();

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SmartCare Cleaning",
        description: isProductsOnly ? "Product Order" : "Professional Cleaning Services",
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
            setLocation(`/payment-confirmation?order_id=${response.razorpay_order_id}&payment_id=${response.razorpay_payment_id}`);
          } else {
            setLocation(`/payment-confirmation?order_id=${response.razorpay_order_id}&status=failed`);
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
  const availableTimeSlots = getAvailableTimeSlots();
  const canProceed = selectedAddress && (isProductsOnly || (selectedDate && selectedTime));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <Badge variant="secondary" className="text-sm">{items.length} {items.length === 1 ? 'item' : 'items'}</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 flex items-center gap-4">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Send booking details to</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email || user?.phone || "+91 XXXXXXXXXX"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Address</p>
                        {selectedAddress && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Home className="h-3 w-3 text-gray-400" />
                            <p className="text-sm text-gray-500 truncate">{selectedAddress.fullAddress}</p>
                          </div>
                        )}
                      </div>
                      {selectedAddress && (
                        <Button variant="outline" size="sm" onClick={() => setAddressModalOpen(true)} className="shrink-0">
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    {!selectedAddress && (
                      <Button 
                        onClick={() => setAddressModalOpen(true)}
                        className="w-full mt-4 bg-violet-600 hover:bg-violet-700 h-11 font-semibold rounded-lg text-white"
                      >
                        Select address
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {!isProductsOnly && (
                    <>
                      <div className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Slot</p>
                            {selectedDate && selectedTime ? (
                              <p className="text-sm text-gray-500">{selectedDate} - {selectedTime}</p>
                            ) : (
                              <p className="text-sm text-gray-400">Select time & date</p>
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
                            className="w-full mt-4 bg-violet-600 hover:bg-violet-700 h-11 font-semibold text-white rounded-lg"
                          >
                            Select time & date
                          </Button>
                        )}
                      </div>
                      <Separator />
                    </>
                  )}

                  {isProductsOnly && (
                    <>
                      <div className="p-5 flex items-center gap-4">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                          <Truck className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Delivery</p>
                          <p className="text-sm text-green-600">Expected in 2-3 business days</p>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  <div className="p-5 flex items-center gap-4">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400">Payment Method</p>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <Button 
                      onClick={handleCheckout}
                      disabled={loading || !canProceed}
                      className="w-full bg-violet-600 hover:bg-violet-700 h-12 font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Proceed to pay"}
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                      By proceeding, you agree to our{" "}
                      <button onClick={() => setPolicyModalOpen(true)} className="underline">T&C</button>,{" "}
                      <button onClick={() => setPolicyModalOpen(true)} className="underline">Privacy</button> and{" "}
                      <button onClick={() => setPolicyModalOpen(true)} className="underline">Cancellation Policy</button>.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm mt-4 overflow-hidden">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {isProductsOnly ? "Return & Refund Policy" : "Cancellation policy"}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">
                    {isProductsOnly 
                      ? "Easy 7-day returns on all products. Refund will be processed within 5-7 business days after pickup."
                      : "Free cancellations if done more than 12 hrs before the service or if a professional isn't assigned. A fee will be charged otherwise."
                    }
                  </p>
                  <button 
                    onClick={() => setPolicyModalOpen(true)}
                    className="text-primary text-sm font-semibold underline hover:no-underline"
                  >
                    Read full policy
                  </button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 space-y-4 max-h-[280px] overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {item.category === "Service" ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-violet-200 text-violet-600">Service</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-600">Product</Badge>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900 leading-tight mt-1">{item.title}</p>
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
                        <p className="font-bold text-gray-900 shrink-0">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="p-5 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Frequently added together</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {frequentlyAdded.filter(fa => !items.some(i => i.id === fa.id)).slice(0, 4).map((item) => (
                        <div key={item.id} className="shrink-0 flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl min-w-[200px]">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-sm font-bold text-primary">₹{item.price}</p>
                          </div>
                          <button 
                            onClick={() => handleAddFrequentItem(item)}
                            className="text-violet-600 text-sm font-semibold hover:text-violet-700 px-2 py-1 rounded hover:bg-violet-50"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isProductsOnly && (
                    <>
                      <Separator />
                      <div className="p-5">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id="avoid-calling-checkout" 
                            checked={avoidCalling} 
                            onCheckedChange={(checked) => setAvoidCalling(!!checked)} 
                          />
                          <Label htmlFor="avoid-calling-checkout" className="text-sm text-gray-700 cursor-pointer">
                            Avoid calling before reaching the location
                          </Label>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className={`border-none shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow ${appliedCoupon ? 'ring-2 ring-green-500' : ''}`} onClick={() => setCouponModalOpen(true)}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Percent className={`h-5 w-5 ${appliedCoupon ? 'text-green-600' : 'text-gray-500'}`} />
                      {appliedCoupon ? (
                        <div>
                          <span className="font-semibold text-green-600">{appliedCoupon.code} applied</span>
                          <p className="text-sm text-green-600">You save ₹{couponDiscount}</p>
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900">Coupons and offers</span>
                      )}
                    </div>
                    {appliedCoupon ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => { e.stopPropagation(); handleRemoveCoupon(); }}
                      >
                        Remove
                      </Button>
                    ) : (
                      <span className="text-violet-600 font-semibold text-sm">{coupons.length} offers &gt;</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-gray-900">Payment summary</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Item total</span>
                      <span className="font-medium">₹{subtotal}</span>
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
                      <span className="font-medium">₹{taxes + platformFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className={deliveryFee === 0 ? "font-medium text-green-600" : "font-medium"}>
                        {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                      </span>
                    </div>
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tip for professional</span>
                        <span className="font-medium text-green-600">₹{tipAmount}</span>
                      </div>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 flex items-center gap-1">
                          <Percent className="h-3.5 w-3.5" />
                          Coupon discount ({appliedCoupon?.code})
                        </span>
                        <span className="font-medium text-green-600">-₹{couponDiscount}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Amount to pay</span>
                      <span className="text-violet-600">₹{totalAmount}</span>
                    </div>
                  </div>

                  {hasServices && (
                    <>
                      <Separator />
                      <div className="p-5">
                        <p className="font-medium text-gray-900 mb-3">Add a tip to thank the Professional</p>
                        <div className="flex gap-2 flex-wrap">
                          {[50, 75, 100].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => handleTipClick(amount)}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all relative ${
                                selectedTip === amount 
                                  ? 'border-gray-900 bg-gray-900 text-white' 
                                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              ₹{amount}
                              {amount === 75 && (
                                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-green-600 font-bold">
                                  POPULAR
                                </span>
                              )}
                            </button>
                          ))}
                          <Input
                            type="number"
                            placeholder="Custom"
                            value={customTip}
                            onChange={(e) => { setCustomTip(e.target.value); setSelectedTip(-1); }}
                            className={`w-20 h-10 text-sm text-center ${selectedTip === -1 && customTip ? 'border-gray-900' : ''}`}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-4">100% of the tip goes to the professional.</p>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="p-5 flex items-center justify-between bg-gray-50/50">
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

      <AddressModal
        open={addressModalOpen}
        onOpenChange={setAddressModalOpen}
        onAddressSelect={handleAddressSelect}
        savedAddresses={addresses}
        onSaveAddress={saveAddress}
        onDeleteAddress={deleteAddress}
      />

      <Dialog open={slotModalOpen} onOpenChange={setSlotModalOpen}>
        <DialogContent className="max-w-lg p-0 gap-0">
          <DialogDescription className="sr-only">Select a date and time slot for your service</DialogDescription>
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

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {dates.slice(0, 5).map((date, index) => (
                    <button
                      key={date.id}
                      onClick={() => handleSelectDate(date, index)}
                      className={`flex flex-col items-center justify-center min-w-[70px] p-3 rounded-xl border-2 transition-all ${
                        selectedDate === date.full 
                          ? 'border-violet-600 bg-violet-600 text-white' 
                          : 'border-gray-200 bg-white hover:border-violet-300'
                      }`}
                    >
                      <span className="text-xs font-medium">{date.isToday ? "Today" : date.day}</span>
                      <span className="text-lg font-bold">{date.date}</span>
                      <span className="text-[10px]">{date.month}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <CreditCard className="h-4 w-4" />
                  Online payment only for selected date
                </div>

                <h4 className="font-semibold text-gray-900 mb-3">Select start time of service</h4>

                {availableTimeSlots.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">No slots available for today</p>
                    <p className="text-sm">Please select another date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedTime(slot.label)}
                        className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                          selectedTime === slot.label 
                            ? 'border-violet-600 bg-violet-600 text-white' 
                            : 'border-gray-200 bg-white hover:border-violet-300 text-gray-700'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}

                <Button 
                  onClick={handleConfirmSlot}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-violet-600 hover:bg-violet-700 h-12 font-semibold rounded-xl disabled:opacity-50"
                >
                  Proceed to checkout
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <Dialog open={policyModalOpen} onOpenChange={setPolicyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isProductsOnly ? "Return & Refund Policy" : "Cancellation & Refund Policy"}</DialogTitle>
            <DialogDescription className="sr-only">Policy information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-600">
            {isProductsOnly ? (
              <>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">7-Day Easy Returns</h4>
                  <p>Return any product within 7 days of delivery for a full refund.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Refund Processing</h4>
                  <p>Refunds are processed within 5-7 business days after product pickup.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Condition</h4>
                  <p>Products must be unused and in original packaging with all tags attached.</p>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={breakupModalOpen} onOpenChange={setBreakupModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Price Breakup</DialogTitle>
            <DialogDescription className="sr-only">Detailed price breakdown</DialogDescription>
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
            {tipAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tip</span>
                <span className="font-medium text-green-600">₹{tipAmount}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={couponModalOpen} onOpenChange={setCouponModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Available Offers</DialogTitle>
            <DialogDescription className="sr-only">Available coupon codes and offers</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {coupons.map((coupon, idx) => (
              <div key={idx} className={`p-4 border rounded-xl transition-colors ${appliedCoupon?.code === coupon.code ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-violet-300'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{coupon.discount}</Badge>
                      {appliedCoupon?.code === coupon.code && (
                        <Badge className="bg-green-500 text-white">Applied</Badge>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">{coupon.code}</p>
                    <p className="text-sm text-gray-500">{coupon.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Max discount: {coupon.maxDiscount}</p>
                  </div>
                  {appliedCoupon?.code === coupon.code ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-violet-600 border-violet-200"
                      onClick={() => handleApplyCoupon(coupon)}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
