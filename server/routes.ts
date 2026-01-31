import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase } from "./supabase";
import { sendContactConfirmationEmail, sendBookingConfirmationEmail } from "./resend";
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

  // Admin routes
  app.get("/api/admin/contacts", async (req, res) => {
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

  app.get("/api/admin/bookings", async (req, res) => {
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

  return httpServer;
}
