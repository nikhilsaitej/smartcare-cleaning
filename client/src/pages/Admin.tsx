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
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Calendar, User, Phone, MapPin, Clock, MessageSquare, Package, Loader2, 
  Plus, Pencil, Trash2, RefreshCw, Database, Send, MessageCircle, CheckCircle,
  ShoppingBag, Wrench, BarChart3, Settings, ExternalLink, ImageIcon, CreditCard
} from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
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
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  in_stock?: boolean;
  created_at: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  duration?: string;
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
  items: Array<{ productId: string; quantity: number; price: number; category?: string }>;
  tip?: number;
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

interface Stats {
  contacts: number;
  bookings: number;
  products: number;
  services: number;
  orders: number;
  integrations: {
    supabase?: { status: string; url?: string };
    resend?: { status: string };
    twilio?: { status: string };
    razorpay?: { status: string };
    cloudinary?: { status: string };
  };
}

const ADMIN_EMAIL = "smartcarecleaningsolutions@gmail.com";

export default function Admin() {
  const { user, session, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

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
      const [contactsRes, bookingsRes, productsRes, servicesRes, ordersRes, statsRes] = await Promise.all([
        fetch("/api/admin/contacts", { headers }),
        fetch("/api/admin/bookings", { headers }),
        fetch("/api/admin/products", { headers }),
        fetch("/api/admin/services", { headers }),
        fetch("/api/admin/orders", { headers }),
        fetch("/api/admin/stats", { headers })
      ]);
      
      if (contactsRes.ok) setContacts(await contactsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
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
      image_url: formData.get("image_url") as string,
      category: formData.get("category") as string,
      in_stock: true
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
      duration: formData.get("duration") as string
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                  <Settings className="h-8 w-8" />
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage all your business data and integrations</p>
              </div>
              <Button onClick={handleRefresh} disabled={refreshing} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{stats?.contacts || contacts.length}</p>
                      <p className="text-blue-100 text-sm">Messages</p>
                    </div>
                    <MessageSquare className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{stats?.bookings || bookings.length}</p>
                      <p className="text-green-100 text-sm">Bookings</p>
                    </div>
                    <Calendar className="h-10 w-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{stats?.products || products.length}</p>
                      <p className="text-purple-100 text-sm">Products</p>
                    </div>
                    <ShoppingBag className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{stats?.services || services.length}</p>
                      <p className="text-orange-100 text-sm">Services</p>
                    </div>
                    <Wrench className="h-10 w-10 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration Status */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Integration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Database className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold">Supabase</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Connected</Badge>
                        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          Dashboard <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Send className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-semibold">Resend (Email)</p>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Connected</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-semibold">Twilio (SMS/WhatsApp)</p>
                      <Badge className={stats?.integrations?.twilio?.status === 'connected' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                        {stats?.integrations?.twilio?.status === 'connected' ? 'Connected' : 'Not Configured'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <ImageIcon className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="font-semibold">Cloudinary (Storage)</p>
                      <Badge className={stats?.integrations?.cloudinary?.status === 'connected' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                        {stats?.integrations?.cloudinary?.status === 'connected' ? 'Connected' : 'Not Configured'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="mb-6 flex-wrap h-auto gap-2">
                <TabsTrigger value="orders" className="gap-2"><CreditCard className="h-4 w-4" /> Orders</TabsTrigger>
                <TabsTrigger value="bookings" className="gap-2"><Calendar className="h-4 w-4" /> Bookings</TabsTrigger>
                <TabsTrigger value="contacts" className="gap-2"><MessageSquare className="h-4 w-4" /> Messages</TabsTrigger>
                <TabsTrigger value="products" className="gap-2"><ShoppingBag className="h-4 w-4" /> Products</TabsTrigger>
                <TabsTrigger value="services" className="gap-2"><Wrench className="h-4 w-4" /> Services</TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : orders.length === 0 ? (
                  <Card><CardContent className="py-12 text-center">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders yet</p>
                  </CardContent></Card>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-bold text-lg">Order #{order.razorpay_order_id?.slice(-8) || order.id.slice(0, 8)}</span>
                                <Badge className={
                                  order.status === 'paid' || order.status === 'captured' ? "bg-green-100 text-green-700" :
                                  order.status === 'failed' ? "bg-red-100 text-red-700" :
                                  order.status === 'refunded' ? "bg-purple-100 text-purple-700" :
                                  "bg-yellow-100 text-yellow-700"
                                }>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                                <span className="text-xl font-bold text-primary">₹{order.amount}</span>
                              </div>
                              <div className="text-sm text-gray-400">
                                {new Date(order.created_at).toLocaleString()}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              {order.address && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Delivery Address
                                  </p>
                                  {order.address.name && <p className="text-gray-600">{order.address.name}</p>}
                                  {order.address.phone && <p className="text-gray-600">{order.address.phone}</p>}
                                  <p className="text-gray-600">{order.address.fullAddress}</p>
                                  {order.address.landmark && <p className="text-gray-500 text-xs">Landmark: {order.address.landmark}</p>}
                                </div>
                              )}

                              {order.slot && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <p className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Service Slot
                                  </p>
                                  <p className="text-gray-600">{order.slot.date}</p>
                                  <p className="text-gray-600">{order.slot.time}</p>
                                </div>
                              )}

                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                  <Package className="h-4 w-4" /> Order Items
                                </p>
                                {order.items?.map((item, idx) => (
                                  <p key={idx} className="text-gray-600 text-xs">
                                    {item.quantity}x {item.category || 'Item'} - ₹{item.price}
                                  </p>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-2 border-t">
                              {order.tip && order.tip > 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Tip: ₹{order.tip}
                                </Badge>
                              )}
                              {order.avoid_calling && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                  <Phone className="h-3 w-3 mr-1" /> Don't call before arriving
                                </Badge>
                              )}
                              {order.razorpay_payment_id && (
                                <Badge variant="outline" className="text-gray-500">
                                  Payment ID: {order.razorpay_payment_id}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : bookings.length === 0 ? (
                  <Card><CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No bookings yet</p>
                  </CardContent></Card>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-bold text-lg">{booking.name}</span>
                                <Select value={booking.status} onValueChange={(v) => handleUpdateBookingStatus(booking.id, v)}>
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /><a href={`tel:${booking.phone}`} className="hover:text-primary">{booking.phone}</a></div>
                                {booking.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4" /><a href={`mailto:${booking.email}`} className="hover:text-primary">{booking.email}</a></div>}
                                {booking.service_name && <div className="flex items-center gap-2"><Package className="h-4 w-4" />{booking.service_name}</div>}
                                {booking.date && <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{booking.date} {booking.time_slot && `at ${booking.time_slot}`}</div>}
                                {booking.address && <div className="flex items-center gap-2 md:col-span-2"><MapPin className="h-4 w-4" />{booking.address}</div>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{new Date(booking.created_at).toLocaleDateString()}</span>
                              <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteBooking(booking.id)}>
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

              {/* Contacts Tab */}
              <TabsContent value="contacts">
                {loading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : contacts.length === 0 ? (
                  <Card><CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No contact messages yet</p>
                  </CardContent></Card>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <Card key={contact.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold">{contact.name}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline text-sm">{contact.email}</a>
                              </div>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{contact.message}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{new Date(contact.created_at).toLocaleDateString()}</span>
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Manage Products</h3>
                  <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if (!open) setEditingProduct(null); }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSaveProduct} className="space-y-4">
                        <Input name="name" placeholder="Product Name" defaultValue={editingProduct?.name} required />
                        <Textarea name="description" placeholder="Description" defaultValue={editingProduct?.description} />
                        <div className="grid grid-cols-2 gap-4">
                          <Input name="price" type="number" step="0.01" placeholder="Price" defaultValue={editingProduct?.price} required />
                          <Input name="category" placeholder="Category" defaultValue={editingProduct?.category} />
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
                  <Card><CardContent className="py-12 text-center">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No products yet. Add your first product!</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
                          <h4 className="font-bold">{product.name}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold text-primary">Rs. {product.price}</span>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => { setEditingProduct(product); setProductDialogOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteProduct(product.id)}>
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

              {/* Services Tab */}
              <TabsContent value="services">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Manage Services</h3>
                  <Dialog open={serviceDialogOpen} onOpenChange={(open) => { setServiceDialogOpen(open); if (!open) setEditingService(null); }}>
                    <DialogTrigger asChild>
                      <Button className="gap-2"><Plus className="h-4 w-4" /> Add Service</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSaveService} className="space-y-4">
                        <Input name="name" placeholder="Service Name" defaultValue={editingService?.name} required />
                        <Textarea name="description" placeholder="Description" defaultValue={editingService?.description} />
                        <div className="grid grid-cols-2 gap-4">
                          <Input name="price" type="number" step="0.01" placeholder="Price" defaultValue={editingService?.price} required />
                          <Input name="duration" placeholder="Duration (e.g., 2-3 hours)" defaultValue={editingService?.duration} />
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
                  <Card><CardContent className="py-12 text-center">
                    <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No services yet. Add your first service!</p>
                  </CardContent></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <Card key={service.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          {service.image_url && <img src={service.image_url} alt={service.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
                          <h4 className="font-bold">{service.name}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                          {service.duration && <p className="text-xs text-gray-400 mt-1">Duration: {service.duration}</p>}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold text-primary">Rs. {service.price}</span>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => { setEditingService(service); setServiceDialogOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteService(service.id)}>
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
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
