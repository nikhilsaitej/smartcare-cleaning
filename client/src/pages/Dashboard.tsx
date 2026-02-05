import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Package, User, ShoppingBag, RotateCcw, ArrowRightLeft, Loader2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  razorpay_order_id: string;
  status: string;
  amount: number;
  items: OrderItem[];
  created_at: string;
  address?: any;
}

interface ReturnRequest {
  id: string;
  order_id: string;
  request_type: "return" | "exchange";
  status: string;
  items: OrderItem[];
  reason: string;
  refund_amount: number;
  created_at: string;
}

interface Booking {
  id: string;
  service_name: string;
  date: string;
  time_slot: string;
  address: string;
  status: string;
}

export default function Dashboard() {
  const { user, session } = useAuth();
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${session?.access_token || ""}`,
    "Content-Type": "application/json",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("bookings");
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [requestType, setRequestType] = useState<"return" | "exchange">("return");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings", { user_id: user?.id }],
    queryFn: async () => {
      const res = await fetch(`/api/bookings?user_id=${user?.id}`, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const { data: returnRequests = [] } = useQuery<ReturnRequest[]>({
    queryKey: ["/api/return-requests"],
    queryFn: async () => {
      const res = await fetch("/api/return-requests", { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user?.id,
  });

  const createReturnMutation = useMutation({
    mutationFn: async (data: {
      order_id: string;
      request_type: string;
      items: any[];
      reason: string;
      customer_name: string;
      customer_phone: string;
    }) => {
      const res = await fetch("/api/return-requests", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create request");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Request Submitted", description: "Your return/exchange request has been submitted successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/return-requests"] });
      setReturnDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setSelectedOrder(null);
    setRequestType("return");
    setSelectedItems([]);
    setReason("");
  };

  const openReturnDialog = (order: Order) => {
    setSelectedOrder(order);
    setReturnDialogOpen(true);
  };

  const handleSubmitRequest = () => {
    if (!selectedOrder || selectedItems.length === 0 || !reason.trim()) {
      toast({ title: "Error", description: "Please select items and provide a reason.", variant: "destructive" });
      return;
    }

    const items = selectedOrder.items
      .filter((item) => selectedItems.includes(item.productId))
      .map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

    createReturnMutation.mutate({
      order_id: selectedOrder.id,
      request_type: requestType,
      items,
      reason,
      customer_name: user?.email?.split("@")[0] || "Customer",
      customer_phone: "",
    });
  };

  const toggleItemSelection = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const getOrderReturnRequest = (orderId: string) => {
    return returnRequests.find((req) => req.order_id === orderId);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      processing: "bg-purple-100 text-purple-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      paid: "bg-green-100 text-green-700",
      created: "bg-gray-100 text-gray-700",
      approved: "bg-blue-100 text-blue-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-green-100 text-green-700",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700";
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar/Profile */}
            <div className="md:col-span-1">
              <Card className="border-none shadow-md overflow-hidden">
                <div className="bg-primary h-20" />
                <CardContent className="pt-0 -mt-10 text-center">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full border-4 border-white bg-slate-200 mb-4">
                    <User className="h-10 w-10 text-slate-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{user.email?.split("@")[0]}</h2>
                  <p className="text-slate-500 text-sm mb-4">{user.email}</p>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="mt-4 space-y-3">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Bookings</p>
                      <p className="text-lg font-bold">{bookings?.length || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Orders</p>
                      <p className="text-lg font-bold">{orders.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold text-slate-900 mb-6">My Dashboard</h1>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="bookings" className="gap-2" data-testid="tab-bookings">
                    <Calendar className="h-4 w-4" />
                    Bookings
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="gap-2" data-testid="tab-orders">
                    <ShoppingBag className="h-4 w-4" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="returns" className="gap-2" data-testid="tab-returns">
                    <RotateCcw className="h-4 w-4" />
                    Returns & Exchanges
                  </TabsTrigger>
                </TabsList>

                {/* Bookings Tab */}
                <TabsContent value="bookings">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      My Bookings
                    </h2>

                    {bookingsLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg" />
                        ))}
                      </div>
                    ) : bookings && bookings.length > 0 ? (
                      <div className="grid gap-4">
                        {bookings.map((booking: any) => (
                          <Card key={booking.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                      {booking.service_name}
                                    </Badge>
                                    <span className="text-xs text-slate-400">ID: #{booking.id.toString().slice(0, 8)}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {booking.date ? format(new Date(booking.date), "PPP") : "TBD"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {booking.time_slot || "Anytime"}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {booking.address}
                                    </div>
                                  </div>
                                </div>
                                <Badge className={`${getStatusBadge(booking.status)} self-start md:self-center`}>
                                  {booking.status || "Scheduled"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-dashed border-2 bg-transparent text-center py-12">
                        <div className="text-slate-400 mb-2">No bookings found</div>
                        <p className="text-sm text-slate-500">You haven't booked any services yet.</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      My Orders
                    </h2>

                    {ordersLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-lg" />
                        ))}
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="grid gap-4">
                        {orders.map((order) => {
                          const existingRequest = getOrderReturnRequest(order.id);
                          const canRequestReturn = order.status === "delivered" && !existingRequest;
                          
                          return (
                            <Card key={order.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex flex-col gap-4">
                                  {/* Order Header */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Package className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <p className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-xs text-slate-500">
                                          {format(new Date(order.created_at), "PPP 'at' p")}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getStatusBadge(order.status)}>
                                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                      </Badge>
                                      <span className="font-bold text-lg">₹{order.amount}</span>
                                    </div>
                                  </div>

                                  {/* Order Items */}
                                  <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-slate-700 mb-2">Items:</p>
                                    <div className="space-y-2">
                                      {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                          <span className="text-slate-600">
                                            {item.name || "Product"} × {item.quantity}
                                          </span>
                                          <span className="font-medium">₹{item.price * item.quantity}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Return/Exchange Section */}
                                  <div className="border-t pt-4">
                                    {existingRequest ? (
                                      <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                        <span className="text-slate-600">
                                          {existingRequest.request_type === "return" ? "Return" : "Exchange"} Request:{" "}
                                          <Badge className={getStatusBadge(existingRequest.status)} variant="secondary">
                                            {existingRequest.status}
                                          </Badge>
                                        </span>
                                      </div>
                                    ) : canRequestReturn ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openReturnDialog(order)}
                                        className="gap-2"
                                        data-testid={`btn-return-${order.id}`}
                                      >
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Return or Exchange
                                      </Button>
                                    ) : order.status !== "delivered" ? (
                                      <p className="text-xs text-slate-400 italic">
                                        Return/Exchange available after delivery
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <Card className="border-dashed border-2 bg-transparent text-center py-12">
                        <div className="text-slate-400 mb-2">No orders found</div>
                        <p className="text-sm text-slate-500">You haven't placed any orders yet.</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Returns & Exchanges Tab */}
                <TabsContent value="returns">
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-primary" />
                      Returns & Exchanges
                    </h2>

                    {returnRequests.length > 0 ? (
                      <div className="grid gap-4">
                        {returnRequests.map((request) => (
                          <Card key={request.id} className="border-none shadow-sm">
                            <CardContent className="p-6">
                              <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                        request.request_type === "return" ? "bg-orange-100" : "bg-purple-100"
                                      }`}
                                    >
                                      {request.request_type === "return" ? (
                                        <RotateCcw className="h-5 w-5 text-orange-600" />
                                      ) : (
                                        <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold capitalize">{request.request_type} Request</p>
                                      <p className="text-xs text-slate-500">
                                        Order #{request.order_id.slice(0, 8).toUpperCase()} • {format(new Date(request.created_at), "PPP")}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={getStatusBadge(request.status)}>{request.status}</Badge>
                                </div>

                                <div className="border-t pt-4">
                                  <p className="text-sm font-medium text-slate-700 mb-2">Items:</p>
                                  <div className="space-y-1">
                                    {request.items?.map((item, idx) => (
                                      <div key={idx} className="text-sm text-slate-600">
                                        {item.name} × {item.quantity}
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-sm mt-3">
                                    <span className="font-medium">Reason:</span> {request.reason}
                                  </p>
                                  {request.refund_amount > 0 && request.request_type === "return" && (
                                    <p className="text-sm mt-2 font-medium text-green-600">
                                      Refund Amount: ₹{request.refund_amount}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-dashed border-2 bg-transparent text-center py-12">
                        <div className="text-slate-400 mb-2">No return or exchange requests</div>
                        <p className="text-sm text-slate-500">
                          You can request returns or exchanges for delivered orders from the Orders tab.
                        </p>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Return/Exchange Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Return or Exchange</DialogTitle>
            <DialogDescription>
              Select the items you want to return or exchange from this order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Request Type */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">What would you like to do?</Label>
              <RadioGroup value={requestType} onValueChange={(v) => setRequestType(v as "return" | "exchange")}>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="return" id="return" />
                  <Label htmlFor="return" className="cursor-pointer flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium">Return for Refund</p>
                      <p className="text-xs text-slate-500">Get your money back</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="exchange" id="exchange" />
                  <Label htmlFor="exchange" className="cursor-pointer flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="font-medium">Exchange Product</p>
                      <p className="text-xs text-slate-500">Replace with another product</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Select Items */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select items to {requestType}</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedOrder?.items?.map((item) => (
                  <div
                    key={item.productId}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedItems.includes(item.productId) ? "bg-primary/5 border-primary" : "hover:bg-slate-50"
                    }`}
                    onClick={() => toggleItemSelection(item.productId)}
                  >
                    <Checkbox
                      checked={selectedItems.includes(item.productId)}
                      onCheckedChange={() => toggleItemSelection(item.productId)}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity} • ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">Reason for {requestType}</Label>
              <Textarea
                id="reason"
                placeholder={`Please explain why you want to ${requestType} these items...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={createReturnMutation.isPending || selectedItems.length === 0 || !reason.trim()}
              className="gap-2"
            >
              {createReturnMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
