import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Package, User } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/bookings", { user_id: user?.id }],
    enabled: !!user?.id,
  });

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
                  <h2 className="text-xl font-bold text-slate-900">{user.email?.split('@')[0]}</h2>
                  <p className="text-slate-500 text-sm mb-4">{user.email}</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">My Dashboard</h1>

              <div className="space-y-8">
                {/* Recent Bookings */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      My Bookings
                    </h2>
                  </div>

                  {isLoading ? (
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
                                  <span className="text-xs text-slate-400">
                                    ID: #{booking.id.toString().slice(0, 8)}
                                  </span>
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
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 self-start md:self-center">
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
                </section>

                {/* Account Details Placeholder */}
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Account Summary
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border-none shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase">Member Since</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{format(new Date(user.created_at || Date.now()), "MMMM yyyy")}</div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase">Total Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{bookings?.length || 0}</div>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
