import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get('/api/geocode', async (req, res) => {
    try {
      const address = req.query.q as string;
      
      if (!address) {
        return res.status(400).json({ error: 'Address query parameter (q) is required' });
      }

      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Biergartenradius/1.0 (https://biergartenradius.replit.app; contact@biergartenradius.app)',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return res.status(429).json({ error: 'Rate limit exceeded. Please wait a moment.' });
        }
        return res.status(response.status).json({ error: `Geocoding failed: ${response.statusText}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Geocoding proxy error:', error);
      res.status(500).json({ error: 'Internal server error during geocoding' });
    }
  });

  app.post('/api/pois', async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'Overpass query is required' });
      }

      const response = await fetch(OVERPASS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Biergartenradius/1.0 (https://biergartenradius.replit.app)',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 504) {
          return res.status(429).json({ error: 'API overloaded. Please try again later.' });
        }
        return res.status(response.status).json({ error: `POI search failed: ${response.statusText}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('POI search proxy error:', error);
      res.status(500).json({ error: 'Internal server error during POI search' });
    }
  });

  return httpServer;
}
