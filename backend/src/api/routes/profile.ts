import { Router, Response } from 'express';
import { ProfileUpdateSchema } from '@govalert/validation';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { dbStore } from '../../db';

export const profileRouter = Router();

profileRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const state = dbStore.getState();
  const profile = state.profiles.find(p => p.userId === req.user!.id);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Profile not found' });
  }
  res.json({ success: true, profile });
});

profileRouter.patch('/', requireAuth, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = ProfileUpdateSchema.parse(req.body);
    const state = dbStore.getState();
    let profile = state.profiles.find(p => p.userId === req.user!.id);

    if (!profile) {
      profile = {
        id: `prf-${req.user!.id}`,
        userId: req.user!.id,
        name: validated.name || req.user!.email,
        email: req.user!.email,
        skills: [],
        interests: [],
        preferredLocations: ['All India'],
        preferredOpportunityTypes: ['Government Jobs'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.profiles.push(profile);
    }

    Object.assign(profile, validated, { updatedAt: new Date().toISOString() });
    dbStore.save();

    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});
