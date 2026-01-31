import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Calendar, User, Phone, MapPin, Clock, MessageSquare, Package, Loader2 } from "lucide-react";

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

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [contactsRes, bookingsRes] = await Promise.all([
          fetch("/api/admin/contacts"),
          fetch("/api/admin/bookings")
        ]);
        
        if (contactsRes.ok) {
          const contactsData = await contactsRes.json();
          setContacts(contactsData);
        }
        
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData);
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-gray-600">View customer inquiries and bookings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{contacts.length}</p>
                      <p className="text-gray-600 text-sm">Contact Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{bookings.length}</p>
                      <p className="text-gray-600 text-sm">Total Bookings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
                      <p className="text-gray-600 text-sm">Pending Bookings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="contacts" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
              </TabsList>

              <TabsContent value="contacts">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : contacts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No contact messages yet</p>
                      <p className="text-gray-400 text-sm mt-1">Messages will appear here when customers submit the contact form</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <Card key={contact.id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold">{contact.name}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline text-sm">
                                  {contact.email}
                                </a>
                              </div>
                              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{contact.message}</p>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(contact.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bookings">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : bookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No bookings yet</p>
                      <p className="text-gray-400 text-sm mt-1">Bookings will appear here when customers book services</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="font-semibold">{booking.name}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {booking.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <a href={`tel:${booking.phone}`} className="hover:text-primary">{booking.phone}</a>
                                </div>
                                {booking.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <a href={`mailto:${booking.email}`} className="hover:text-primary">{booking.email}</a>
                                  </div>
                                )}
                                {booking.service_name && (
                                  <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-400" />
                                    <span>{booking.service_name}</span>
                                  </div>
                                )}
                                {booking.date && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>{booking.date} {booking.time_slot && `at ${booking.time_slot}`}</span>
                                  </div>
                                )}
                                {booking.address && (
                                  <div className="flex items-center gap-2 md:col-span-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{booking.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(booking.created_at).toLocaleDateString()}
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
