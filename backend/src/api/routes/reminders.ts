import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { RemindersService } from '../../services/reminders';
import { ReminderCreateSchema } from '@govalert/validation';

export const remindersRouter = Router();

remindersRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const reminders = RemindersService.list(req.user!.id);
  res.json({ success: true, reminders });
});

remindersRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = ReminderCreateSchema.parse(req.body);
    const reminder = RemindersService.create(
      req.user!.id,
      validated.opportunityId,
      validated.daysBefore,
      validated.notificationType
    );
    res.status(201).json({ success: true, reminder });
  } catch (err) {
    next(err);
  }
});

remindersRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const removed = RemindersService.remove(req.user!.id, req.params.id);
  res.json({ success: true, removed });
});
