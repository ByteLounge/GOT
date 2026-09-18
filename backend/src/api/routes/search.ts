import { Router, Response } from 'express';
import { OpportunityService } from '../../services/opportunities';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

export const searchRouter = Router();

searchRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const q = String(req.query.q || req.query.query || '').trim();
  const limit = Number(req.query.limit) || 20;

  if (!q) {
    return res.json({ success: true, query: '', results: [] });
  }

  const searchResults = OpportunityService.list(
    {
      search: q,
      limit,
    },
    req.profile
  );

  res.json({
    success: true,
    query: q,
    results: searchResults.data,
    total: searchResults.total,
  });
});
