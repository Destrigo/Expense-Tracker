import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string; // existing
  user?: any;      // new: full user object
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify JWT and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;

    // Fetch full user object (excluding password)
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
