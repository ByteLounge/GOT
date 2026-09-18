import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { TrackerService } from '../../services/tracker';
import { TrackOpportunitySchema, TrackOpportunityUpdateSchema } from '@govalert/validation';

export const trackedRouter = Router();

trackedRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const tracked = TrackerService.list(req.user!.id);
  res.json({ success: true, tracked });
});

trackedRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = TrackOpportunitySchema.parse(req.body);
    const item = TrackerService.track(req.user!.id, validated.opportunityId, validated.status, validated.notes);
    res.status(201).json({ success: true, tracked: item });
  } catch (err) {
    next(err);
  }
});

trackedRouter.patch('/:id', requireAuth, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = TrackOpportunityUpdateSchema.parse(req.body);
    const updated = TrackerService.update(req.user!.id, req.params.id, validated.status, validated.notes);
    res.json({ success: true, tracked: updated });
  } catch (err) {
    next(err);
  }
});

trackedRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const removed = TrackerService.remove(req.user!.id, req.params.id);
  res.json({ success: true, removed });
});
