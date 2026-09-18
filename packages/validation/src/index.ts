import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  dateOfBirth: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  educationLevel: z.string().nullable().optional(),
  degree: z.string().nullable().optional(),
  branch: z.string().nullable().optional(),
  college: z.string().nullable().optional(),
  graduationYear: z.number().int().min(1970).max(2040).nullable().optional(),
  cgpaOrPercentage: z.number().min(0).max(100).nullable().optional(),
  experience: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  preferredLocations: z.array(z.string()).optional(),
  preferredOpportunityTypes: z.array(z.string()).optional(),
  category: z.string().nullable().optional(),
});

export const OpportunityQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  education: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSING_TODAY', 'CLOSING_TOMORROW', 'CLOSING_SOON', 'CLOSED', 'UPCOMING']).optional(),
  deadlineStatus: z.string().optional(),
  organization: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['deadline_asc', 'newest', 'vacancies_desc']).default('deadline_asc'),
});

export const TrackOpportunitySchema = z.object({
  opportunityId: z.string().uuid('Invalid opportunity ID'),
  status: z.enum([
    'Interested',
    'Saved',
    'Planning to Apply',
    'Applied',
    'Exam Scheduled',
    'Interview',
    'Selected',
    'Rejected',
    'Closed'
  ]),
  notes: z.string().max(2000).nullable().optional(),
});

export const TrackOpportunityUpdateSchema = z.object({
  status: z.enum([
    'Interested',
    'Saved',
    'Planning to Apply',
    'Applied',
    'Exam Scheduled',
    'Interview',
    'Selected',
    'Rejected',
    'Closed'
  ]).optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const ReminderCreateSchema = z.object({
  opportunityId: z.string().uuid('Invalid opportunity ID'),
  daysBefore: z.number().int().min(0).max(60),
  notificationType: z.enum(['deadline', 'exam']).default('deadline'),
});

export const NotificationPreferencesSchema = z.object({
  dailyMax: z.number().int().min(1).max(20).default(5),
  quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM').default('22:00'),
  quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM').default('07:00'),
  newOpportunities: z.boolean().default(true),
  deadlineReminders: z.boolean().default(true),
  updatesAndCorrigenda: z.boolean().default(true),
  examAlerts: z.boolean().default(true),
  pushAlerts: z.boolean().default(true),
  emailAlerts: z.boolean().default(false),
});
