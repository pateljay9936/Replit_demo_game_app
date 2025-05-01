import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Get high scores
  app.get('/api/scores', async (_req: Request, res: Response) => {
    try {
      const scores = await storage.getTopScores();
      res.json(scores);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch scores' });
    }
  });

  // Submit a score
  const submitScoreSchema = z.object({
    gameId: z.string(),
    score: z.number().int().positive(),
    username: z.string().optional()
  });

  app.post('/api/scores', async (req: Request, res: Response) => {
    try {
      const result = submitScoreSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid score data' });
      }
      
      const { gameId, score, username } = result.data;
      
      // If username provided, find or create user
      let userId: number | undefined;
      
      if (username) {
        const existingUser = await storage.getUserByUsername(username);
        
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const newUser = await storage.createUser({ 
            username, 
            password: 'guest' // Guest users don't need real passwords
          });
          userId = newUser.id;
        }
      }
      
      // Save the score
      const newScore = await storage.saveScore({
        gameId,
        score,
        userId
      });
      
      res.status(201).json(newScore);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save score' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
