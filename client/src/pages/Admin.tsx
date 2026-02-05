import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Calendar, User, Phone, MapPin, Clock, MessageSquare, Package, Loader2, 
  Plus, Pencil, Trash2, RefreshCw, Database, Send, MessageCircle, CheckCircle,
  ShoppingBag, Wrench, Settings, ExternalLink, ImageIcon, CreditCard, Eye,
  ChevronRight, IndianRupee, Cloud, ArrowUpRight, FileText, AlertCircle,
  UserCircle, DollarSign, TrendingUp, X, Check, RotateCcw, ArrowRightLeft
} from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status?: string;
  created_at: string;
}

interface Booking {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  service_name?: string;
  date?: string;
  time_slot?: string;
  status: string;
  requirements?: string;
  order_id?: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  category?: string;
  in_stock?: boolean;
  stock_quantity?: number;
  created_at: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  duration?: string;
  is_active?: boolean;
  created_at: string;
}

interface Order {
  id: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  items: Array<{ productId: string; name?: string; quantity: number; price: number; category?: string }>;
  tip?: number;
  discount?: number;
  coupon_code?: string;
  address?: {
    fullAddress: string;
    landmark?: string;
    type?: string;
    name?: string;
    phone?: string;
  };
  slot?: {
    date: string;
    time: string;
  };
  avoid_calling?: boolean;
  created_at: string;
  paid_at?: string;
}

interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  request_type: "return" | "exchange";
  status: string;
  items: Array<{ productId: string; name?: string; quantity: number; price: number }>;
  reason: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_address?: any;
  admin_notes?: string;
  refund_amount?: number;
  refund_status?: string;
  created_at: string;
  processed_at?: string;
}

interface Stats {
  contacts: number;
  bookings: number;
  products: number;
  services: number;
  orders: number;
  returnRequests?: number;
  integrations: {
    supabase?: { status: string; url?: string };
    resend?: { status: string };
    twilio?: { status: string };
    razorpay?: { status: string };
    cloudinary?: { status: string };
  };
}

const ADMIN_EMAIL = "smartcarecleaningsolutions@gmail.com";

const formatOrderId = (order: Order): string => {
  const num = order.razorpay_order_id?.slice(-4) || order.id.slice(0, 4);
  return `SC-${num.toUpperCase()}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'captured':
    case 'completed':
    case 'confirmed':
      return "bg-green-100 text-green-700 border-green-200";
    case 'pending':
    case 'created':
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case 'failed':
    case 'cancelled':
      return "bg-red-100 text-red-700 border-red-200";
    case 'refunded':
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusDot = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'captured':
    case 'completed':
    case 'confirmed':
      return "bg-green-500";
    case 'pending':
    case 'created':
      return "bg-yellow-500";
    case 'failed':
    case 'cancelled':
      return "bg-red-500";
    case 'refunded':
      return "bg-purple-500";
    default:
      return "bg-gray-500";
  }
};

export default function Admin() {
  const { user, session, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState<ReturnRequest | null>(null);
  const [returnDetailOpen, setReturnDetailOpen] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
  const getAuthHeaders = () => ({
    "Authorization": `Bearer ${session?.access_token}`,
    "Content-Type": "application/json"
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
    if (!authLoading && user && !isAdmin) {
      setLocation("/");
    }
  }, [user, authLoading, isAdmin, setLocation]);

  const fetchAllData = async () => {
    if (!session?.access_token) return;
    try {
      const headers = getAuthHeaders();
      const [contactsRes, bookingsRes, productsRes, servicesRes, ordersRes, returnsRes, statsRes] = await Promise.all([
        fetch("/api/admin/contacts", { headers }),
        fetch("/api/admin/bookings", { headers }),
        fetch("/api/admin/products", { headers }),
        fetch("/api/admin/services", { headers }),
        fetch("/api/admin/orders", { headers }),
        fetch("/api/admin/return-requests", { headers }),
        fetch("/api/admin/stats", { headers })
      ]);
      
      if (contactsRes.ok) setContacts(await contactsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (returnsRes.ok) setReturnRequests(await returnsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin && session?.access_token) {
      fetchAllData();
    }
  }, [user, isAdmin, session]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
    toast({ title: "Data Refreshed", description: "All data has been reloaded." });
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (res.ok) {
        setContacts(contacts.filter(c => c.id !== id));
        toast({ title: "Deleted", description: "Contact message removed." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
        toast({ title: "Updated", description: `Booking status changed to ${status}.` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (res.ok) {
        setBookings(bookings.filter(b => b.id !== id));
        toast({ title: "Deleted", description: "Booking removed." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      original_price: formData.get("original_price") ? parseFloat(formData.get("original_price") as string) : null,
      image_url: formData.get("image_url") as string,
      category: formData.get("category") as string,
      stock_quantity: parseInt(formData.get("stock_quantity") as string) || 0,
      in_stock: (parseInt(formData.get("stock_quantity") as string) || 0) > 0
    };

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      
      if (res.ok) {
        const saved = await res.json();
        if (editingProduct) {
          setProducts(products.map(p => p.id === saved.id ? saved : p));
        } else {
          setProducts([saved, ...products]);
        }
        setProductDialogOpen(false);
        setEditingProduct(null);
        toast({ title: "Saved", description: `Product ${editingProduct ? "updated" : "created"}.` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        toast({ title: "Deleted", description: "Product removed." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleSaveService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serviceData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      image_url: formData.get("image_url") as string,
      duration: formData.get("duration") as string,
      is_active: true
    };

    try {
      const url = editingService ? `/api/admin/services/${editingService.id}` : "/api/admin/services";
      const method = editingService ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(serviceData)
      });
      
      if (res.ok) {
        const saved = await res.json();
        if (editingService) {
          setServices(services.map(s => s.id === saved.id ? saved : s));
        } else {
          setServices([saved, ...services]);
        }
        setServiceDialogOpen(false);
        setEditingService(null);
        toast({ title: "Saved", description: `Service ${editingService ? "updated" : "created"}.` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save service.", variant: "destructive" });
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (res.ok) {
        setServices(services.filter(s => s.id !== id));
        toast({ title: "Deleted", description: "Service removed." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleUpdateReturnRequest = async (id: string, status: string, adminNotes?: string) => {
    try {
      const res = await fetch(`/api/admin/return-requests/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, admin_notes: adminNotes })
      });
      if (res.ok) {
        const updated = await res.json();
        setReturnRequests(returnRequests.map(r => r.id === id ? updated : r));
        toast({ title: "Updated", description: `Request status changed to ${status}.` });
        setReturnDetailOpen(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update request.", variant: "destructive" });
    }
  };

  const pendingReturns = returnRequests.filter(r => r.status === 'pending').length;
  const newMessagesCount = contacts.length;
  const upcomingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
  const inStockProducts = products.filter(p => p.in_stock !== false).length;
  const activeServices = services.length;
  const recentOrders = orders.slice(0, 5);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-gradient-to-br from-primary to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Settings className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-500 text-sm">Manage all your business data and integrations</p>
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing} 
                className="gap-2 bg-primary hover:bg-primary/90 shadow-md"
                data-testid="button-refresh-data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* New Messages */}
              <Card 
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setActiveTab("messages")}
                data-testid="card-stat-messages"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold">{newMessagesCount}</p>
                      <p className="text-blue-100 text-sm font-medium">New Messages</p>
                    </div>
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-blue-100 mt-4 group-hover:text-white transition-colors">
                    <Eye className="h-4 w-4" /> View Messages <ChevronRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>

              {/* Upcoming Bookings */}
              <Card 
                className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setActiveTab("bookings")}
                data-testid="card-stat-bookings"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold">{upcomingBookings}</p>
                      <p className="text-orange-100 text-sm font-medium">Upcoming Bookings</p>
                    </div>
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-orange-100 mt-4 group-hover:text-white transition-colors">
                    <Eye className="h-4 w-4" /> View Bookings <ChevronRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>

              {/* In Stock Products */}
              <Card 
                className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setActiveTab("products")}
                data-testid="card-stat-products"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold">{inStockProducts}</p>
                      <p className="text-rose-100 text-sm font-medium">In Stock Products</p>
                    </div>
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-rose-100 mt-4 group-hover:text-white transition-colors">
                    <Eye className="h-4 w-4" /> View Products <ChevronRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>

              {/* Active Services */}
              <Card 
                className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setActiveTab("services")}
                data-testid="card-stat-services"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold">{activeServices}</p>
                      <p className="text-indigo-200 text-sm font-medium">Active Services</p>
                    </div>
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Wrench className="h-6 w-6" />
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-indigo-200 mt-4 group-hover:text-white transition-colors">
                    <Eye className="h-4 w-4" /> View Active <ChevronRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders Section */}
            <Card className="mb-8 shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <CardTitle className="text-xl font-bold text-gray-900">Recent Orders</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab("orders")}
                  className="gap-2"
                  data-testid="button-view-all-orders"
                >
                  View All Orders <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full" data-testid="table-recent-orders">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order ID</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                          <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-order-${order.id}`}>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-900">{formatOrderId(order)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {order.address?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{order.address?.name || 'Customer'}</p>
                                  <p className="text-sm text-gray-500">{order.address?.phone || 'No phone'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900">₹ {order.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${getStatusDot(order.status)}`} />
                                <span className={`text-sm font-medium capitalize ${
                                  order.status === 'paid' || order.status === 'captured' ? 'text-green-600' :
                                  order.status === 'pending' || order.status === 'created' ? 'text-yellow-600' :
                                  order.status === 'failed' ? 'text-red-600' :
                                  order.status === 'refunded' ? 'text-purple-600' : 'text-gray-600'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-600">{formatDate(order.created_at)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => { setSelectedOrder(order); setOrderDetailOpen(true); }}
                                className="text-primary hover:text-primary/80"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 flex-wrap h-auto gap-2 bg-white p-2 rounded-xl shadow-sm border">
                <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                  <TrendingUp className="h-4 w-4" /> Dashboard
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                  <CreditCard className="h-4 w-4" /> Orders
                </TabsTrigger>
                <TabsTrigger value="bookings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                  <Calendar className="h-4 w-4" /> Bookings
                </TabsTrigger>
                <TabsTrigger value="messages" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                  <MessageSquare className="h-4 w-4" /> Messages
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                  <ShoppingBag className="h-4 w-4" /> Products
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg">
                  <Wrench className="h-4 w-4" /> Services
                </TabsTrigger>
                <TabsTrigger value="returns" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg relative">
                  <RotateCcw className="h-4 w-4" /> Returns
                  {pendingReturns > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingReturns}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard">
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to SmartCare Admin</h3>
                  <p>Use the stats cards above or tabs below to navigate</p>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : orders.length === 0 ? (
                  <Card className="border-0 shadow-lg"><CardContent className="py-12 text-center">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                  </CardContent></Card>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full" data-testid="table-all-orders">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order ID</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Items</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="font-semibold text-gray-900">{formatOrderId(order)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                      {order.address?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{order.address?.name || 'Customer'}</p>
                                      <p className="text-sm text-gray-500">{order.address?.phone || 'No phone'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="max-w-xs">
                                    {order.items?.slice(0, 2).map((item, idx) => (
                                      <p key={idx} className="text-sm text-gray-600 truncate">
                                        {item.quantity}x {item.name || item.category || 'Item'}
                                      </p>
                                    ))}
                                    {order.items?.length > 2 && (
                                      <p className="text-xs text-gray-400">+{order.items.length - 2} more</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-bold text-gray-900">₹ {order.amount.toLocaleString()}</span>
                                  {order.tip && order.tip > 0 && (
                                    <span className="text-xs text-green-600 block">+₹{order.tip} tip</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <Badge className={`${getStatusColor(order.status)} border`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-gray-600">{formatDate(order.created_at)}</span>
                                  <span className="text-xs text-gray-400 block">
                                    {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => { setSelectedOrder(order); setOrderDetailOpen(true); }}
                                    className="gap-1"
                                  >
                                    <Eye className="h-4 w-4" /> View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : bookings.length === 0 ? (
                  <Card className="border-0 shadow-lg"><CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No bookings yet</p>
                  </CardContent></Card>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full" data-testid="table-bookings">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Service</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date & Time</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Address</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                              <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {bookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                      {booking.name?.charAt(0).toUpperCase() || 'C'}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{booking.name}</p>
                                      <p className="text-sm text-gray-500">{booking.phone}</p>
                                      {booking.email && <p className="text-xs text-gray-400">{booking.email}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                                    {booking.service_name || 'General Service'}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{booking.date || 'Not set'}</span>
                                  </div>
                                  {booking.time_slot && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                      <Clock className="h-3 w-3" />
                                      {booking.time_slot}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-start gap-2 max-w-xs">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-600 line-clamp-2">{booking.address || 'No address'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Select value={booking.status} onValueChange={(v) => handleUpdateBookingStatus(booking.id, v)}>
                                    <SelectTrigger className={`w-32 h-8 ${getStatusColor(booking.status)}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="assigned">Assigned</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                                    onClick={() => handleDeleteBooking(booking.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : contacts.length === 0 ? (
                  <Card className="border-0 shadow-lg"><CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No contact messages yet</p>
                  </CardContent></Card>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <Card key={contact.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {contact.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-bold text-gray-900">{contact.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {contact.status || 'new'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                  <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-primary">
                                    <Mail className="h-3 w-3" /> {contact.email}
                                  </a>
                                  {contact.phone && (
                                    <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-primary">
                                      <Phone className="h-3 w-3" /> {contact.phone}
                                    </a>
                                  )}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="text-gray-700">{contact.message}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{formatDate(contact.created_at)}</span>
                              <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteContact(contact.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Manage Products</h3>
                  <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if (!open) setEditingProduct(null); }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 shadow-md" data-testid="button-add-product">
                        <Plus className="h-4 w-4" /> Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-xl">{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSaveProduct} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Product Name *</Label>
                          <Input id="name" name="name" placeholder="e.g., Floor Cleaner 1L" defaultValue={editingProduct?.name} required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea id="description" name="description" placeholder="Product description..." defaultValue={editingProduct?.description} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Selling Price (₹) *</Label>
                            <Input id="price" name="price" type="number" step="0.01" placeholder="199" defaultValue={editingProduct?.price} required />
                          </div>
                          <div>
                            <Label htmlFor="original_price">Original Price (₹)</Label>
                            <Input id="original_price" name="original_price" type="number" step="0.01" placeholder="299" defaultValue={editingProduct?.original_price || ''} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" name="category" placeholder="e.g., Cleaning" defaultValue={editingProduct?.category} />
                          </div>
                          <div>
                            <Label htmlFor="stock_quantity">Stock Quantity</Label>
                            <Input id="stock_quantity" name="stock_quantity" type="number" placeholder="100" defaultValue={editingProduct?.stock_quantity || 0} />
                          </div>
                        </div>
                        <ImageUpload 
                          label="Product Image" 
                          folder="products"
                          defaultImage={editingProduct?.image_url}
                          onUploadSuccess={(url) => {
                            const input = document.getElementById('product-image-url') as HTMLInputElement;
                            if (input) input.value = url;
                          }}
                        />
                        <input type="hidden" id="product-image-url" name="image_url" defaultValue={editingProduct?.image_url} />
                        <Button type="submit" className="w-full">
                          {editingProduct ? "Update Product" : "Create Product"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : products.length === 0 ? (
                  <Card className="border-0 shadow-lg"><CardContent className="py-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No products yet. Add your first product!</p>
                    <Button onClick={() => setProductDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" /> Add Product
                    </Button>
                  </CardContent></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <Card key={product.id} className="border-0 shadow-md hover:shadow-xl transition-all group overflow-hidden">
                        <div className="relative">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover" />
                          ) : (
                            <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="h-8 w-8 bg-white shadow-md" onClick={() => { setEditingProduct(product); setProductDialogOpen(true); }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8 bg-white shadow-md text-red-500 hover:text-red-700" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          {product.in_stock === false && (
                            <Badge className="absolute top-2 left-2 bg-red-500">Out of Stock</Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <Badge variant="outline" className="text-xs mb-2">{product.category || 'General'}</Badge>
                          <h4 className="font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1 h-10">{product.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <span className="text-xl font-bold text-primary">₹{product.price}</span>
                              {product.original_price && product.original_price > product.price && (
                                <span className="text-sm text-gray-400 line-through ml-2">₹{product.original_price}</span>
                              )}
                            </div>
                            {product.stock_quantity !== undefined && (
                              <span className="text-xs text-gray-500">Stock: {product.stock_quantity}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Manage Services</h3>
                  <Dialog open={serviceDialogOpen} onOpenChange={(open) => { setServiceDialogOpen(open); if (!open) setEditingService(null); }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 shadow-md" data-testid="button-add-service">
                        <Plus className="h-4 w-4" /> Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-xl">{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSaveService} className="space-y-4">
                        <div>
                          <Label htmlFor="service-name">Service Name *</Label>
                          <Input id="service-name" name="name" placeholder="e.g., Home Deep Cleaning" defaultValue={editingService?.name} required />
                        </div>
                        <div>
                          <Label htmlFor="service-description">Description</Label>
                          <Textarea id="service-description" name="description" placeholder="Service description..." defaultValue={editingService?.description} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="service-price">Price (₹) *</Label>
                            <Input id="service-price" name="price" type="number" step="0.01" placeholder="4999" defaultValue={editingService?.price} required />
                          </div>
                          <div>
                            <Label htmlFor="service-duration">Duration</Label>
                            <Input id="service-duration" name="duration" placeholder="e.g., 2-3 hours" defaultValue={editingService?.duration} />
                          </div>
                        </div>
                        <ImageUpload 
                          label="Service Image" 
                          folder="services"
                          defaultImage={editingService?.image_url}
                          onUploadSuccess={(url) => {
                            const input = document.getElementById('service-image-url') as HTMLInputElement;
                            if (input) input.value = url;
                          }}
                        />
                        <input type="hidden" id="service-image-url" name="image_url" defaultValue={editingService?.image_url} />
                        <Button type="submit" className="w-full">
                          {editingService ? "Update Service" : "Create Service"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : services.length === 0 ? (
                  <Card className="border-0 shadow-lg"><CardContent className="py-12 text-center">
                    <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No services yet. Add your first service!</p>
                    <Button onClick={() => setServiceDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" /> Add Service
                    </Button>
                  </CardContent></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {services.map((service) => (
                      <Card key={service.id} className="border-0 shadow-md hover:shadow-xl transition-all group overflow-hidden">
                        <div className="relative">
                          {service.image_url ? (
                            <img src={service.image_url} alt={service.name} className="w-full h-40 object-cover" />
                          ) : (
                            <div className="w-full h-40 bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center">
                              <Wrench className="h-12 w-12 text-violet-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="h-8 w-8 bg-white shadow-md" onClick={() => { setEditingService(service); setServiceDialogOpen(true); }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8 bg-white shadow-md text-red-500 hover:text-red-700" onClick={() => handleDeleteService(service.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-bold text-gray-900 line-clamp-1">{service.name}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1 h-10">{service.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xl font-bold text-primary">₹{service.price.toLocaleString()}</span>
                            {service.duration && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" /> {service.duration}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Returns/Exchanges Tab */}
              <TabsContent value="returns">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : returnRequests.length === 0 ? (
                  <Card className="border-0 shadow-lg"><CardContent className="py-12 text-center">
                    <RotateCcw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No return or exchange requests yet</p>
                  </CardContent></Card>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left p-4 font-semibold text-gray-600">Request ID</th>
                              <th className="text-left p-4 font-semibold text-gray-600">Type</th>
                              <th className="text-left p-4 font-semibold text-gray-600">Customer</th>
                              <th className="text-left p-4 font-semibold text-gray-600">Order</th>
                              <th className="text-left p-4 font-semibold text-gray-600">Items</th>
                              <th className="text-left p-4 font-semibold text-gray-600">Refund Amount</th>
                              <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                              <th className="text-left p-4 font-semibold text-gray-600">Date</th>
                              <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {returnRequests.map((request) => (
                              <tr key={request.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                  <span className="font-mono text-sm font-semibold text-gray-700">
                                    RR-{request.id.slice(0, 6).toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <Badge className={request.request_type === 'return' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-purple-100 text-purple-700 border-purple-200'}>
                                    {request.request_type === 'return' ? (
                                      <><RotateCcw className="h-3 w-3 mr-1" /> Return</>
                                    ) : (
                                      <><ArrowRightLeft className="h-3 w-3 mr-1" /> Exchange</>
                                    )}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{request.customer_name || 'Customer'}</p>
                                      <p className="text-xs text-gray-500">{request.customer_email || request.customer_phone || '-'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    #{request.order_id.slice(0, 8)}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="text-sm text-gray-600">
                                    {request.items.slice(0, 2).map((item, idx) => (
                                      <div key={idx} className="truncate max-w-32">{item.name || 'Product'} x{item.quantity}</div>
                                    ))}
                                    {request.items.length > 2 && (
                                      <span className="text-xs text-gray-400">+{request.items.length - 2} more</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="font-bold text-green-600">₹{(request.refund_amount || 0).toLocaleString()}</span>
                                </td>
                                <td className="p-4">
                                  <Badge className={getStatusColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                  {formatDate(request.created_at)}
                                </td>
                                <td className="p-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => { setSelectedReturnRequest(request); setReturnDetailOpen(true); }}
                                    className="gap-1"
                                  >
                                    <Eye className="h-3 w-3" /> View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Integration Status Footer */}
            <Card className="mt-8 border-0 shadow-lg">
              <CardContent className="py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Supabase */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Supabase</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Connected</Badge>
                        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                          Dashboard <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Resend */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Send className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Resend <span className="text-gray-400 font-normal">(Email)</span></p>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Connected</Badge>
                    </div>
                  </div>

                  {/* Cloudinary */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Cloud className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Cloudinary <span className="text-gray-400 font-normal">(Storage)</span></p>
                      <Badge className={stats?.integrations?.cloudinary?.status === 'connected' ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs"}>
                        {stats?.integrations?.cloudinary?.status === 'connected' ? 'Connected' : 'Configure'}
                      </Badge>
                    </div>
                  </div>

                  {/* Twilio */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Twilio <span className="text-gray-400 font-normal">(SMS/WhatsApp)</span></p>
                      <Badge className={stats?.integrations?.twilio?.status === 'connected' ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs"}>
                        {stats?.integrations?.twilio?.status === 'connected' ? 'Connected' : 'Configure'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-primary" />
              Order {selectedOrder && formatOrderId(selectedOrder)}
              {selectedOrder && (
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" /> Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedOrder.address?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedOrder.address?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedOrder.address && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Delivery Address
                  </h4>
                  <p className="text-gray-700">{selectedOrder.address.fullAddress}</p>
                  {selectedOrder.address.landmark && (
                    <p className="text-sm text-gray-500 mt-1">Landmark: {selectedOrder.address.landmark}</p>
                  )}
                </div>
              )}

              {/* Service Slot */}
              {selectedOrder.slot && (
                <div className="bg-violet-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Service Schedule
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{selectedOrder.slot.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time Slot</p>
                      <p className="font-medium">{selectedOrder.slot.time}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" /> Order Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={item.category === 'Service' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}>
                          {item.category || 'Product'}
                        </Badge>
                        <span className="font-medium">{item.name || 'Item'}</span>
                        <span className="text-gray-500">x{item.quantity}</span>
                      </div>
                      <span className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-900 text-white p-4 rounded-xl">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Payment Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>₹{(selectedOrder.amount - (selectedOrder.tip || 0)).toLocaleString()}</span>
                  </div>
                  {selectedOrder.tip && selectedOrder.tip > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Tip</span>
                      <span>+₹{selectedOrder.tip}</span>
                    </div>
                  )}
                  {selectedOrder.discount && selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-yellow-400">
                      <span>Discount {selectedOrder.coupon_code && `(${selectedOrder.coupon_code})`}</span>
                      <span>-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-2 flex justify-between text-xl font-bold">
                    <span>Total Paid</span>
                    <span className="text-green-400">₹{selectedOrder.amount.toLocaleString()}</span>
                  </div>
                </div>
                {selectedOrder.razorpay_payment_id && (
                  <p className="text-xs text-gray-400 mt-3">Payment ID: {selectedOrder.razorpay_payment_id}</p>
                )}
              </div>

              {/* Extra Info */}
              <div className="flex flex-wrap gap-2">
                {selectedOrder.avoid_calling && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <Phone className="h-3 w-3 mr-1" /> Don't call before arriving
                  </Badge>
                )}
                <Badge variant="outline" className="text-gray-500">
                  Ordered: {new Date(selectedOrder.created_at).toLocaleString()}
                </Badge>
                {selectedOrder.paid_at && (
                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                    Paid: {new Date(selectedOrder.paid_at).toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return Request Detail Dialog */}
      <Dialog open={returnDetailOpen} onOpenChange={setReturnDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedReturnRequest?.request_type === 'return' ? (
                <RotateCcw className="h-5 w-5 text-orange-500" />
              ) : (
                <ArrowRightLeft className="h-5 w-5 text-purple-500" />
              )}
              {selectedReturnRequest?.request_type === 'return' ? 'Return' : 'Exchange'} Request Details
            </DialogTitle>
          </DialogHeader>
          {selectedReturnRequest && (
            <div className="space-y-4">
              {/* Request Info */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Request ID:</span>
                  <p className="font-mono font-bold">RR-{selectedReturnRequest.id.slice(0, 6).toUpperCase()}</p>
                </div>
                <Badge className={getStatusColor(selectedReturnRequest.status)}>
                  {selectedReturnRequest.status}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" /> Customer Info
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{selectedReturnRequest.customer_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedReturnRequest.customer_email || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedReturnRequest.customer_phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Order ID:</span>
                    <p className="font-mono text-xs">#{selectedReturnRequest.order_id.slice(0, 8)}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-2">Items to {selectedReturnRequest.request_type}</h4>
                <div className="space-y-2">
                  {selectedReturnRequest.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name || 'Product'}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold">₹{((item.price || 0) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <h4 className="font-semibold mb-2">Reason</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReturnRequest.reason}</p>
              </div>

              {/* Refund Amount */}
              {selectedReturnRequest.request_type === 'return' && (
                <div className="bg-green-50 p-4 rounded-xl flex justify-between items-center">
                  <span className="font-semibold text-green-700">Refund Amount</span>
                  <span className="text-2xl font-bold text-green-600">₹{(selectedReturnRequest.refund_amount || 0).toLocaleString()}</span>
                </div>
              )}

              {/* Admin Actions */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Update Status</h4>
                <div className="grid grid-cols-3 gap-2">
                  {selectedReturnRequest.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-1"
                        onClick={() => handleUpdateReturnRequest(selectedReturnRequest.id, 'approved')}
                      >
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() => handleUpdateReturnRequest(selectedReturnRequest.id, 'rejected')}
                      >
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                  {selectedReturnRequest.status === 'approved' && (
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 gap-1"
                      onClick={() => handleUpdateReturnRequest(selectedReturnRequest.id, 'processing')}
                    >
                      <RefreshCw className="h-4 w-4" /> Processing
                    </Button>
                  )}
                  {selectedReturnRequest.status === 'processing' && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 gap-1"
                      onClick={() => handleUpdateReturnRequest(selectedReturnRequest.id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4" /> Complete
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Requested: {new Date(selectedReturnRequest.created_at).toLocaleString()}
                  {selectedReturnRequest.processed_at && ` • Processed: ${new Date(selectedReturnRequest.processed_at).toLocaleString()}`}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
