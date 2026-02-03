import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { 
  ShoppingBag, Plus, Minus, CreditCard, MapPin, Clock, 
  Phone, ChevronRight, Info, Percent, Truck, Package, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import AddressModal, { SavedAddress, useAddresses } from "@/components/AddressModal";

export default function Cart() {
  const { items, updateQuantity, subtotal } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [avoidCalling, setAvoidCalling] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  
  // Address state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const { addresses, saveAddress, deleteAddress } = useAddresses();
  
  // Determine cart type
  const hasServices = useMemo(() => items.some(item => item.category === "Service"), [items]);
  const hasProducts = useMemo(() => items.some(item => item.category !== "Service"), [items]);
  const isProductsOnly = hasProducts && !hasServices;
  
  // Calculate totals
  const tipAmount = selectedTip === -1 ? (parseInt(customTip) || 0) : (selectedTip || 0);
  const taxes = Math.round(subtotal * 0.05);
  const platformFee = 10;
  const deliveryFee = subtotal > 1000 ? 0 : (isProductsOnly ? 40 : 50);
  const total = subtotal + taxes + platformFee + deliveryFee + tipAmount;

  // Frequently added items based on cart content
  const frequentlyAdded = useMemo(() => {
    if (hasServices) {
      return [
        { id: "fa1", name: "Deep Cleaning Add-on", price: 349 },
        { id: "fa2", name: "Sanitization Spray", price: 199 }
      ];
    } else {
      return [
        { id: "fa3", name: "Floor Cleaner 1L", price: 249 },
        { id: "fa4", name: "Microfiber Cloth Set", price: 149 }
      ];
    }
  }, [hasServices]);

  const handleProceedToCheckout = () => {
    if (!user) {
      setLocation("/login?redirect=/checkout");
      return;
    }
    const tipParam = tipAmount > 0 ? `?tip=${tipAmount}` : "";
    setLocation(`/checkout${tipParam}`);
  };

  const handleAddressSelect = (address: SavedAddress) => {
    setSelectedAddress(address);
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
                    <Button variant="outline" className="w-full sm:w-auto px-8">Browse Services</Button>
                  </Link>
                  <Link href="/products">
                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 px-8">Shop Products</Button>
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <Badge variant="secondary" className="text-sm">{items.length} {items.length === 1 ? 'item' : 'items'}</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Single Card with Divisions */}
            <div className="lg:col-span-7">
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Contact Info */}
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

                  {/* Address */}
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
                        className="w-full mt-4 bg-primary hover:bg-primary/90 h-11 font-semibold rounded-lg"
                      >
                        Select address
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* Slot - Only show for services */}
                  {!isProductsOnly && (
                    <>
                      <div className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Slot</p>
                            <p className="text-sm text-gray-500">Select time & date</p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleProceedToCheckout}
                          className="w-full mt-4 bg-violet-600 hover:bg-violet-700 h-11 font-semibold text-white rounded-lg"
                        >
                          Select time & date
                        </Button>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Delivery Info - Only for products */}
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

                  {/* Payment Method */}
                  <div className="p-5 flex items-center gap-4">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-400">Payment Method</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </div>

                  {/* Proceed Button */}
                  <div className="px-5 pb-5">
                    <Button 
                      onClick={handleProceedToCheckout}
                      disabled={!selectedAddress}
                      className="w-full bg-violet-600 hover:bg-violet-700 h-12 font-semibold text-white rounded-lg disabled:opacity-50"
                    >
                      Proceed to {isProductsOnly ? "checkout" : "pay"}
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                      By proceeding, you agree to our <span className="underline cursor-pointer">T&C</span>, <span className="underline cursor-pointer">Privacy</span> and <span className="underline cursor-pointer">Cancellation Policy</span>.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Policy Card */}
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
                  <button className="text-primary text-sm font-semibold underline hover:no-underline">
                    Read full policy
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Three Separate Cards */}
            <div className="lg:col-span-5 space-y-4">
              {/* Card 1: Items + Frequently Added + Avoid Calling */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Items */}
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

                  {/* Frequently Added Together */}
                  <div className="p-5 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Frequently added together</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {frequentlyAdded.map((item) => (
                        <div key={item.id} className="shrink-0 flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl min-w-[180px]">
                          <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-sm font-bold text-primary">₹{item.price}</p>
                          </div>
                          <button className="text-violet-600 text-sm font-semibold">Add</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Avoid Calling - Only for services */}
                  {!isProductsOnly && (
                    <>
                      <Separator />
                      <div className="p-5">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            id="avoid-calling-cart" 
                            checked={avoidCalling} 
                            onCheckedChange={(checked) => setAvoidCalling(!!checked)} 
                          />
                          <Label htmlFor="avoid-calling-cart" className="text-sm text-gray-700 cursor-pointer">
                            Avoid calling before reaching the location
                          </Label>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: Coupons */}
              <Card className="border-none shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Percent className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Coupons and offers</span>
                    </div>
                    <span className="text-violet-600 font-semibold text-sm">5 offers &gt;</span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Payment Summary + Tip + Total */}
              <Card className="border-none shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Payment Summary */}
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
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total amount</span>
                      <span>₹{total}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Amount to pay</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  {/* Tip Section - Only for services */}
                  {!isProductsOnly && (
                    <>
                      <Separator />
                      <div className="p-5">
                        <p className="font-medium text-gray-900 mb-3">Add a tip to thank the Professional</p>
                        <div className="flex gap-2 flex-wrap">
                          {[50, 75, 100].map((amount) => (
                            <button
                              key={amount}
                              onClick={() => { setSelectedTip(amount); setCustomTip(""); }}
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

                  {/* Final Amount */}
                  <div className="p-5 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <p className="text-sm text-gray-500">Amount to pay</p>
                      <p className="text-2xl font-bold text-gray-900">₹{total}</p>
                    </div>
                    <button className="text-violet-600 text-sm font-semibold underline">
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

      {/* Address Modal */}
      <AddressModal
        open={addressModalOpen}
        onOpenChange={setAddressModalOpen}
        onAddressSelect={handleAddressSelect}
        savedAddresses={addresses}
        onSaveAddress={saveAddress}
        onDeleteAddress={deleteAddress}
      />
    </div>
  );
}
