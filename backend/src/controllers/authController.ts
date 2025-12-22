import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, currency } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        currency: currency || 'USD',
      });

      await user.save();

      // Generate token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: '30d',
      });

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          currency: user.currency,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async getMe(req: AuthRequest, res: any) {
    try {
      if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
        const user = await User.findById(req.userId).select('-password'); // exclude password
      if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      });
      } catch (err) {
      console.error('getMe error:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: '30d',
      });

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          currency: user.currency,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
}