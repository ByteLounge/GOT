import { Router, Response } from 'express';
import { RegisterSchema, LoginSchema } from '@govalert/validation';
import { AuthService } from '../../services/auth';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const result = await AuthService.register(validated.email, validated.password, validated.name);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const validated = LoginSchema.parse(req.body);
    const result = await AuthService.login(validated.email, validated.password);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const data = AuthService.getMe(req.user!.id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
});
