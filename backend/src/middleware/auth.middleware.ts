import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'No authentication token, access denied' });
    return;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    (req as any).adminId = (verified as any).id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid, access denied' });
  }
};

export const verifyAdmin = authMiddleware;
