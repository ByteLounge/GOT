export type OpportunityCategory =
  | 'Government Jobs'
  | 'Government Internships'
  | 'Scholarships'
  | 'Fellowships'
  | 'Competitive Exams'
  | 'PSU Recruitment'
  | 'Research Opportunities'
  | 'Apprenticeships'
  | 'Government Schemes'
  | 'Grants'
  | 'Competitions'
  | 'Other';

export type OpportunityStatus =
  | 'OPEN'
  | 'CLOSING_TODAY'
  | 'CLOSING_TOMORROW'
  | 'CLOSING_SOON'
  | 'CLOSED'
  | 'UPCOMING';

export type ApplicationTrackingStatus =
  | 'Interested'
  | 'Saved'
  | 'Planning to Apply'
  | 'Applied'
  | 'Exam Scheduled'
  | 'Interview'
  | 'Selected'
  | 'Rejected'
  | 'Closed';

export type NotificationCategory =
  | 'NEW_OPPORTUNITY'
  | 'DEADLINE_ALERT'
  | 'DEADLINE_TOMORROW'
  | 'DEADLINE_CHANGE'
  | 'IMPORTANT_UPDATE'
  | 'EXAM_ALERT';

export interface AgeLimit {
  min?: number | null;
  max?: number | null;
  relaxation?: Record<string, number>;
}

export interface PotentialMatch {
  isPotentiallyEligible: boolean;
  matchScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  missingProfileFields?: string[];
  disclaimer: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  description: string;
  shortDescription?: string | null;

  applicationStartDate?: string | null;
  applicationDeadline?: string | null;

  examDate?: string | null;
  resultDate?: string | null;

  location?: string | null;
  workMode?: string | null;
  employmentType?: string | null;

  vacancyCount?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  stipend?: string | null;

  eligibility?: string | null;
  ageLimit?: AgeLimit | null;
  educationRequirements: string[];
  branchRequirements: string[];
  experienceRequirements?: string | null;
  categoryRequirements?: string[];

  applicationFee?: number | null;

  officialNotificationUrl?: string | null;
  officialApplicationUrl?: string | null;
  officialSourceUrl: string;

  sourceType: string;
  sourceName: string;

  status: OpportunityStatus;
  deadlineStatus: OpportunityStatus;
  daysRemaining?: number | null;

  isVerified: boolean;
  lastVerifiedAt: string;

  contentHash: string;
  version: number;
  isSeed?: boolean;

  potentialMatch?: PotentialMatch;

  createdAt: string;
  updatedAt: string;
}

export interface OpportunityVersion {
  id: string;
  opportunityId: string;
  versionNumber: number;
  snapshotData: Partial<Opportunity>;
  changesSummary?: string | null;
  createdAt: string;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  dateOfBirth?: string | null;
  state?: string | null;
  district?: string | null;

  educationLevel?: string | null;
  degree?: string | null;
  branch?: string | null;
  college?: string | null;
  graduationYear?: number | null;

  cgpaOrPercentage?: number | null;
  experience?: string | null;

  skills: string[];
  interests: string[];
  preferredLocations: string[];
  preferredOpportunityTypes: OpportunityCategory[];

  category?: string | null; // e.g. General, OBC, SC, ST, EWS
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationPreferences {
  id?: string;
  userId?: string;
  dailyMax: number;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
  newOpportunities: boolean;
  deadlineReminders: boolean;
  updatesAndCorrigenda: boolean;
  examAlerts: boolean;
  pushAlerts: boolean;
  emailAlerts: boolean;
}

export interface SavedOpportunity {
  id: string;
  userId: string;
  opportunityId: string;
  opportunity?: Opportunity;
  createdAt: string;
}

export interface TrackedOpportunity {
  id: string;
  userId: string;
  opportunityId: string;
  opportunity?: Opportunity;
  status: ApplicationTrackingStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  opportunityId: string;
  opportunity?: Opportunity;
  reminderDate: string;
  daysBefore: number;
  notificationType: 'deadline' | 'exam';
  isSent: boolean;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  opportunityId?: string | null;
  opportunity?: Opportunity;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface SourceChange {
  id: string;
  opportunityId: string;
  opportunityTitle?: string;
  fieldName: string;
  oldValue?: string | null;
  newValue?: string | null;
  detectedAt: string;
  isNotified: boolean;
}

export interface Source {
  id: string;
  name: string;
  code: string;
  baseUrl: string;
  adapterType: string;
  checkIntervalHours: number;
  isActive: boolean;
  lastRunAt?: string | null;
  lastStatus: string;
  errorMessage?: string | null;
  createdAt: string;
}

export interface IngestionRun {
  id: string;
  sourceId: string;
  sourceName?: string;
  startTime: string;
  endTime?: string | null;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  itemsScanned: number;
  itemsCreated: number;
  itemsUpdated: number;
  errorMessage?: string | null;
}
