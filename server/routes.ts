import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase } from "./supabase";

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
      const { data, error } = await supabase
        .from("bookings")
        .insert([req.body])
        .select()
        .single();
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from("contacts")
        .insert([req.body])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
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

  return httpServer;
}
