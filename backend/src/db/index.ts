import fs from 'fs';
import path from 'path';
import { Opportunity, UserProfile, SavedOpportunity, TrackedOpportunity, Reminder, InAppNotification, NotificationPreferences, Source, SourceChange, IngestionRun } from '@govalert/types';
import { SEED_OPPORTUNITIES, SEED_SOURCES } from '../data/seedOpportunities';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseState {
  users: UserRecord[];
  profiles: UserProfile[];
  opportunities: Opportunity[];
  savedOpportunities: SavedOpportunity[];
  trackedOpportunities: TrackedOpportunity[];
  reminders: Reminder[];
  notifications: InAppNotification[];
  notificationPreferences: NotificationPreferences[];
  sources: Source[];
  sourceChanges: SourceChange[];
  ingestionRuns: IngestionRun[];
  opportunityVersions: any[];
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'govalert_db.json');

class DatabaseStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): DatabaseState {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure seeds are present
        if (!parsed.opportunities || parsed.opportunities.length === 0) {
          parsed.opportunities = [...SEED_OPPORTUNITIES];
        }
        if (!parsed.sources || parsed.sources.length === 0) {
          parsed.sources = [...SEED_SOURCES];
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse govalert_db.json, initializing default state:', err);
      }
    }

    const defaultState: DatabaseState = {
      users: [],
      profiles: [],
      opportunities: [...SEED_OPPORTUNITIES],
      savedOpportunities: [],
      trackedOpportunities: [],
      reminders: [],
      notifications: [],
      notificationPreferences: [],
      sources: [...SEED_SOURCES],
      sourceChanges: [],
      ingestionRuns: [],
      opportunityVersions: [],
    };

    this.persist(defaultState);
    return defaultState;
  }

  private persist(dataToSave?: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing govalert_db.json:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public save() {
    this.persist();
  }
}

export const dbStore = new DatabaseStore();
