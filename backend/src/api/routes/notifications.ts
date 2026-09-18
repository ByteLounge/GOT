import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { NotificationsService } from '../../services/notifications';
import { NotificationPreferencesSchema } from '@govalert/validation';

export const notificationsRouter = Router();

notificationsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifications = NotificationsService.list(req.user!.id);
  res.json({ success: true, notifications });
});

notificationsRouter.patch('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const marked = NotificationsService.markAsRead(req.user!.id, req.params.id);
  res.json({ success: true, marked });
});

notificationsRouter.post('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const count = NotificationsService.markAllAsRead(req.user!.id);
  res.json({ success: true, count });
});

notificationsRouter.get('/preferences', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const preferences = NotificationsService.getPreferences(req.user!.id);
  res.json({ success: true, preferences });
});

notificationsRouter.patch('/preferences', requireAuth, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = NotificationPreferencesSchema.partial().parse(req.body);
    const updated = NotificationsService.updatePreferences(req.user!.id, validated);
    res.json({ success: true, preferences: updated });
  } catch (err) {
    next(err);
  }
});
