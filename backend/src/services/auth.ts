import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore, UserRecord } from '../db';
import { UserProfile, NotificationPreferences } from '@govalert/types';

const JWT_SECRET = process.env.JWT_SECRET || 'govalert_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  static async register(email: string, passwordPlain: string, name: string) {
    const state = dbStore.getState();
    const existing = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const user: UserRecord = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      role: 'user',
      createdAt: now,
      updatedAt: now,
    };

    const profile: UserProfile = {
      id: `prf-${userId}`,
      userId,
      name,
      email: email.toLowerCase(),
      dateOfBirth: null,
      state: null,
      district: null,
      educationLevel: null,
      degree: null,
      branch: null,
      college: null,
      graduationYear: null,
      cgpaOrPercentage: null,
      experience: null,
      skills: [],
      interests: [],
      preferredLocations: ['All India'],
      preferredOpportunityTypes: ['Government Jobs', 'Scholarships'],
      category: 'General / Unreserved',
      createdAt: now,
      updatedAt: now,
    };

    const notifPrefs: NotificationPreferences = {
      id: `np-${userId}`,
      userId,
      dailyMax: 5,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      newOpportunities: true,
      deadlineReminders: true,
      updatesAndCorrigenda: true,
      examAlerts: true,
      pushAlerts: true,
      emailAlerts: false,
    };

    state.users.push(user);
    state.profiles.push(profile);
    state.notificationPreferences.push(notifPrefs);
    dbStore.save();

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: profile.name,
        role: user.role,
      },
      profile,
    };
  }

  static async login(email: string, passwordPlain: string) {
    const state = dbStore.getState();
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const valid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password.');
    }

    const profile = state.profiles.find(p => p.userId === user.id) || {
      name: 'User',
      skills: [],
      interests: [],
      preferredLocations: [],
      preferredOpportunityTypes: [],
    };

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: profile.name,
        role: user.role,
      },
      profile,
    };
  }

  static verifyToken(token: string): { userId: string; email: string; role: string } {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch {
      throw new Error('Invalid or expired authentication token.');
    }
  }

  static getMe(userId: string) {
    const state = dbStore.getState();
    const user = state.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    const profile = state.profiles.find(p => p.userId === userId);
    const prefs = state.notificationPreferences.find(p => p.userId === userId);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile,
      notificationPreferences: prefs,
    };
  }
}
