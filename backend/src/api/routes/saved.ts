import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { BookmarksService } from '../../services/bookmarks';

export const savedRouter = Router();

savedRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const saved = BookmarksService.list(req.user!.id);
  res.json({ success: true, saved });
});

savedRouter.post('/:opportunityId', requireAuth, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const saved = BookmarksService.save(req.user!.id, req.params.opportunityId);
    res.status(201).json({ success: true, saved });
  } catch (err) {
    next(err);
  }
});

savedRouter.delete('/:opportunityId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const removed = BookmarksService.remove(req.user!.id, req.params.opportunityId);
  res.json({ success: true, removed });
});
