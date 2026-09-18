import { Router, Response } from 'express';
import { OpportunityService } from '../../services/opportunities';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { dbStore } from '../../db';

export const recommendationsRouter = Router();

recommendationsRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  let profile = req.profile;
  if (!profile) {
    // Return standard top highlighted opportunities if guest
    const state = dbStore.getState();
    const guestProfile = state.profiles[0] || {
      name: 'Student',
      skills: [],
      interests: [],
      preferredLocations: ['All India'],
      preferredOpportunityTypes: ['Government Jobs', 'Scholarships'],
    };
    profile = guestProfile;
  }

  const limit = Number(req.query.limit) || 10;
  const recommendations = OpportunityService.getRecommendations(profile, limit);

  res.json({
    success: true,
    recommendations,
  });
});
