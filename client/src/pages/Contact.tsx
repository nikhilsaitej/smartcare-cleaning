import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { COMPANY_INFO } from "@/lib/constants";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast({
        title: "Message Sent!",
        description: "We'll get back to you soon.",
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">Contact Us</h1>
              <p className="text-gray-600 text-lg">We're here to help! Reach out for bookings, product inquiries, or feedback.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-primary">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Call Us</h3>
                      <p className="text-gray-600">{COMPANY_INFO.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Email Us</h3>
                      <p className="text-gray-600">{COMPANY_INFO.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Visit Us</h3>
                      <p className="text-gray-600">{COMPANY_INFO.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <Card className="shadow-xl border-gray-100">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Full Name</label>
                      <Input 
                        placeholder="John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        data-testid="input-contact-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Email Address</label>
                      <Input 
                        type="email" 
                        placeholder="john@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        data-testid="input-contact-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Message</label>
                      <Textarea 
                        placeholder="How can we help you?" 
                        className="min-h-[120px]" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        data-testid="input-contact-message"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold"
                      disabled={loading}
                      data-testid="button-contact-submit"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>Send Message <Send className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </form>
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
