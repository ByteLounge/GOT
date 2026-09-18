import { Router, Response } from 'express';
import { OpportunityService } from '../../services/opportunities';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { OpportunityQuerySchema } from '@govalert/validation';

export const opportunitiesRouter = Router();

opportunitiesRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = OpportunityQuerySchema.parse(req.query);
    const result = OpportunityService.list(validated, req.profile);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

opportunitiesRouter.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const item = OpportunityService.getById(req.params.id, req.profile);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Opportunity not found.' });
  }
  res.json({ success: true, opportunity: item });
});

opportunitiesRouter.get('/:id/versions', (req, res) => {
  const versions = OpportunityService.getVersions(req.params.id);
  res.json({ success: true, versions });
});
