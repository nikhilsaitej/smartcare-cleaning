import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, XCircle, Clock, Package, MapPin, Calendar, 
  Phone, ArrowRight, Home, ShoppingBag, Loader2, AlertTriangle,
  Sparkles, IndianRupee
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface OrderDetails {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  status: string;
  items: Array<{
    productId: string;
    name?: string;
    quantity: number;
    price: number;
    category?: string;
  }>;
  tip?: number;
  address?: {
    fullAddress: string;
    landmark?: string;
    type?: string;
  };
  slot?: {
    date: string;
    time: string;
  };
  avoid_calling?: boolean;
  created_at: string;
}

const statusConfig: Record<string, { 
  icon: React.ElementType; 
  color: string; 
  bgColor: string; 
  borderColor: string;
  title: string; 
  description: string;
}> = {
  paid: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    title: "Payment Successful!",
    description: "Your order has been confirmed and is being processed."
  },
  captured: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    title: "Payment Successful!",
    description: "Your payment has been captured successfully."
  },
  created: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    title: "Payment Pending",
    description: "Your payment is being processed. Please wait a moment."
  },
  attempted: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    title: "Payment Attempted",
    description: "Your payment attempt was made. Confirming status..."
  },
  failed: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    title: "Payment Failed",
    description: "We couldn't process your payment. Please try again."
  },
  refunded: {
    icon: IndianRupee,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "Payment Refunded",
    description: "Your payment has been refunded to your account."
  }
};

export default function PaymentConfirmation() {
  const [, setLocation] = useLocation();
  const { session, user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("order_id");
  const paymentId = urlParams.get("payment_id");
  const statusFromUrl = urlParams.get("status");

  useEffect(() => {
    if (statusFromUrl === "failed" && orderId) {
      setOrder({
        id: "",
        razorpay_order_id: orderId,
        amount: 0,
        status: "failed",
        items: [],
        created_at: new Date().toISOString()
      });
      setLoading(false);
      return;
    }

    if (!session) {
      setLoading(false);
      setError("Please log in to view your order");
      return;
    }

    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders/${orderId}/status`, {
          headers: {
            "Authorization": `Bearer ${session?.access_token}`
          }
        });

        if (!res.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await res.json();
        setOrder(data);

        if (data.status === "paid" || data.status === "captured") {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Unable to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchOrderDetails();
    }
  }, [orderId, session]);

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.created;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50">
        <Navbar />
        <main className="pt-24 pb-20 flex items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Verifying your payment...</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
        <Navbar />
        <main className="pt-24 pb-20 flex items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error || "Unable to load order details"}</p>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  const config = getStatusConfig(order.status);
  const StatusIcon = config.icon;
  const isSuccess = order.status === "paid" || order.status === "captured";
  const hasServices = order.items?.some(item => item.category === "Service");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50">
      <Navbar />
      
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ["#7c3aed", "#f97316", "#3b82f6", "#10b981", "#f59e0b"][Math.floor(Math.random() * 5)]
              }}
              initial={{ y: -20, opacity: 1 }}
              animate={{ 
                y: window.innerHeight + 20, 
                opacity: 0,
                x: Math.random() * 200 - 100
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`border-2 ${config.borderColor} ${config.bgColor} overflow-hidden mb-6`}>
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className={`w-24 h-24 rounded-full ${isSuccess ? 'bg-emerald-100' : config.bgColor} flex items-center justify-center mx-auto mb-6 relative`}
                >
                  {isSuccess && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-emerald-400"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  <StatusIcon className={`h-12 w-12 ${config.color}`} />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {isSuccess && (
                    <div className="flex items-center justify-center gap-2 text-violet-600 mb-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-medium">Order Confirmed</span>
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{config.title}</h1>
                  <p className="text-gray-600 text-lg">{config.description}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 inline-flex items-center gap-3 bg-white/80 backdrop-blur rounded-xl px-6 py-3 shadow-sm"
                >
                  <span className="text-gray-500">Order ID:</span>
                  <Badge variant="secondary" className="font-mono text-sm">
                    {order.razorpay_order_id}
                  </Badge>
                </motion.div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-none shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-violet-600" />
                      </div>
                      <h2 className="font-semibold text-lg text-gray-900">Order Summary</h2>
                    </div>
                    
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="font-medium text-gray-900">{item.name || `Item ${index + 1}`}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      {order.tip && order.tip > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tip for Professional</span>
                          <span className="text-emerald-600 font-medium">+₹{order.tip}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold pt-2">
                        <span className="text-gray-900">Total Paid</span>
                        <span className="text-violet-600">₹{order.amount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-none shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <h2 className="font-semibold text-lg text-gray-900">Delivery Details</h2>
                    </div>

                    {order.address && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{order.address.fullAddress}</p>
                            {order.address.landmark && (
                              <p className="text-sm text-gray-500 mt-1">Landmark: {order.address.landmark}</p>
                            )}
                            {order.address.type && (
                              <Badge variant="secondary" className="mt-2 text-xs">{order.address.type}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {hasServices && order.slot && (
                      <div className="bg-violet-50 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-violet-600" />
                          <div>
                            <p className="font-medium text-gray-900">{order.slot.date}</p>
                            <p className="text-sm text-violet-600">{order.slot.time}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {order.avoid_calling && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 rounded-lg px-3 py-2">
                        <Phone className="h-4 w-4 text-amber-600" />
                        <span>No call preference noted</span>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mt-4">
                      Order placed on {formatDate(order.created_at)} at {formatTime(order.created_at)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 mt-8 justify-center"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLocation("/dashboard")}
                className="border-gray-300 hover:bg-gray-50"
                data-testid="button-view-orders"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                View My Orders
              </Button>
              <Button
                size="lg"
                onClick={() => setLocation("/")}
                className="bg-violet-600 hover:bg-violet-700"
                data-testid="button-continue-shopping"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center mt-8"
              >
                <p className="text-gray-500 text-sm">
                  A confirmation email has been sent to your registered email address.
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
