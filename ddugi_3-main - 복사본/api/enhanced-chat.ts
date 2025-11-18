import { VercelRequest, VercelResponse } from '@vercel/node';
import { EnhancedChatController } from '../backend/src/controllers/enhancedChatController';

const enhancedChatController = new EnhancedChatController();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      await enhancedChatController.handleChat(req as any, res as any, () => {});
    } catch (error) {
      console.error('Enhanced Chat API error:', error);
      res.status(500).json({ 
        success: false,
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error' 
        } 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}