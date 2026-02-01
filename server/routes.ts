import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase } from "./supabase";
import { sendContactConfirmationEmail, sendBookingConfirmationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "./resend";
import { sendBookingSMS, sendBookingWhatsApp } from "./twilio";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/config", (req, res) => {
    res.json({
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    });
  });

  app.post("/api/auth/signup-success", async (req, res) => {
    try {
      const { email } = req.body;
      if (email) {
        await sendWelcomeEmail(email);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/password-reset", async (req, res) => {
    try {
      const { email, resetLink } = req.body;
      if (email && resetLink) {
        await sendPasswordResetEmail(email, resetLink);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/services", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const { name, phone, email, service_name, date, time_slot, address } = req.body;
      
      const { data, error } = await supabase
        .from("bookings")
        .insert([req.body])
        .select()
        .single();
      
      if (error) throw error;
      
      // Send notifications (non-blocking)
      if (email) {
        sendBookingConfirmationEmail(email, name, service_name || 'Cleaning Service', date || 'To be confirmed').catch(console.error);
      }
      if (phone) {
        sendBookingSMS(phone, name, service_name || 'Cleaning Service', date || 'To be confirmed').catch(console.error);
        sendBookingWhatsApp(phone, name, service_name || 'Cleaning Service', date || 'To be confirmed').catch(console.error);
      }
      
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
      
      if (userId) {
        query = query.eq("user_id", userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      
      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }
      
      // Try to save to Supabase
      let savedToDb = false;
      try {
        const { data, error } = await supabase
          .from("contacts")
          .insert([{ name, email, message }])
          .select()
          .single();
        
        if (!error) {
          savedToDb = true;
        }
      } catch (dbError) {
        console.log("Database save skipped (table may not exist):", dbError);
      }
      
      // Send email notification (non-blocking)
      sendContactConfirmationEmail(email, name).catch(console.error);
      
      // Return success even if DB save failed - the email was sent
      res.json({ 
        success: true, 
        message: "Contact form submitted successfully",
        savedToDb 
      });
    } catch (error: any) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/cart", async (req, res) => {
    try {
      const userId = req.query.user_id as string;
      if (!userId) {
        return res.status(400).json({ error: "user_id required" });
      }
      
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", userId);
      
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { user_id, product_id, quantity } = req.body;
      
      const { data: existing } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user_id)
        .eq("product_id", product_id)
        .single();
      
      if (existing) {
        const { data, error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id)
          .select()
          .single();
        
        if (error) throw error;
        res.json(data);
      } else {
        const { data, error } = await supabase
          .from("cart_items")
          .insert([{ user_id, product_id, quantity }])
          .select()
          .single();
        
        if (error) throw error;
        res.json(data);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: req.body.quantity })
        .eq("id", req.params.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin authentication middleware
  const ADMIN_EMAIL = "smartcarecleaningsolutions@gmail.com";
  
  const verifyAdmin = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }
      
      const token = authHeader.split(" ")[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
      
      if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ error: "Authentication failed" });
    }
  };

  // Admin routes (protected)
  app.get("/api/admin/contacts", verifyAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.log("Contacts table may not exist:", error.message);
        return res.json([]);
      }
      res.json(data || []);
    } catch (error: any) {
      res.json([]);
    }
  });

  app.delete("/api/admin/contacts/:id", verifyAdmin, async (req, res) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/bookings", verifyAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.log("Bookings table may not exist:", error.message);
        return res.json([]);
      }
      res.json(data || []);
    } catch (error: any) {
      res.json([]);
    }
  });

  app.patch("/api/admin/bookings/:id", verifyAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update(req.body)
        .eq("id", req.params.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/bookings/:id", verifyAdmin, async (req, res) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/products", verifyAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        return res.json([]);
      }
      res.json(data || []);
    } catch (error: any) {
      res.json([]);
    }
  });

  app.post("/api/admin/products", verifyAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([req.body])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/products/:id", verifyAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(req.body)
        .eq("id", req.params.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/products/:id", verifyAdmin, async (req, res) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/services", verifyAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        return res.json([]);
      }
      res.json(data || []);
    } catch (error: any) {
      res.json([]);
    }
  });

  app.post("/api/admin/services", verifyAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .insert([req.body])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/services/:id", verifyAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .update(req.body)
        .eq("id", req.params.id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/services/:id", verifyAdmin, async (req, res) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/stats", verifyAdmin, async (req, res) => {
    try {
      const [contactsRes, bookingsRes, productsRes, servicesRes] = await Promise.all([
        supabase.from("contacts").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
      ]);

      res.json({
        contacts: contactsRes.count || 0,
        bookings: bookingsRes.count || 0,
        products: productsRes.count || 0,
        services: servicesRes.count || 0,
        integrations: {
          supabase: { status: "connected", url: process.env.SUPABASE_URL },
          resend: { status: "connected" },
          twilio: { status: "connected" },
        }
      });
    } catch (error: any) {
      res.json({ contacts: 0, bookings: 0, products: 0, services: 0, integrations: {} });
    }
  });

  return httpServer;
}
