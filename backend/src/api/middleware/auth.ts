import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth';
import { dbStore } from '../../db';
import { UserProfile } from '@govalert/types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  profile?: UserProfile;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required. Missing or malformed token.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = AuthService.verifyToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    const state = dbStore.getState();
    req.profile = state.profiles.find(p => p.userId === payload.userId);
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message || 'Invalid token.' });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = AuthService.verifyToken(token);
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
      const state = dbStore.getState();
      req.profile = state.profiles.find(p => p.userId === payload.userId);
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}
