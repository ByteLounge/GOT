import crypto from 'crypto';
import { Opportunity } from '@govalert/types';
import { dbStore } from '../db';
import { ChangeDetectorService } from '../services/change-detector';

export abstract class SourceAdapter {
  protected sourceId: string;
  protected sourceName: string;
  protected baseUrl: string;

  constructor(sourceId: string, sourceName: string, baseUrl: string) {
    this.sourceId = sourceId;
    this.sourceName = sourceName;
    this.baseUrl = baseUrl;
  }

  abstract fetch(): Promise<string | any>;
  abstract parse(rawPayload: any): Promise<Partial<Opportunity>[]>;

  computeContentHash(opp: Partial<Opportunity>): string {
    const raw = `${opp.title}|${opp.organization}|${opp.category}|${opp.applicationDeadline || ''}|${opp.vacancyCount || ''}|${opp.officialNotificationUrl || ''}`;
    return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
  }

  async normalize(items: Partial<Opportunity>[]): Promise<Opportunity[]> {
    const normalized: Opportunity[] = [];
    const now = new Date().toISOString();

    for (const item of items) {
      const hash = this.computeContentHash(item);
      const opp: Opportunity = {
        id: item.id || `opp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: item.title || 'Untitled Government Opening',
        organization: item.organization || this.sourceName,
        category: item.category || 'Government Jobs',
        description: item.description || 'Detailed official description is available in the official notification document.',
        shortDescription: item.shortDescription || item.title || null,
        applicationStartDate: item.applicationStartDate || null,
        applicationDeadline: item.applicationDeadline || null,
        examDate: item.examDate || null,
        resultDate: item.resultDate || null,
        location: item.location || 'All India',
        workMode: item.workMode || 'On-site',
        employmentType: item.employmentType || 'Full-time',
        vacancyCount: item.vacancyCount || null,
        salaryMin: item.salaryMin || null,
        salaryMax: item.salaryMax || null,
        stipend: item.stipend || null,
        eligibility: item.eligibility || 'Check official notification for exact eligibility terms.',
        ageLimit: item.ageLimit || null,
        educationRequirements: item.educationRequirements || ['Undergraduate / Bachelor Degree'],
        branchRequirements: item.branchRequirements || ['All'],
        experienceRequirements: item.experienceRequirements || null,
        categoryRequirements: item.categoryRequirements || ['General', 'OBC', 'SC', 'ST', 'EWS'],
        applicationFee: item.applicationFee || 0,
        officialNotificationUrl: item.officialNotificationUrl || null,
        officialApplicationUrl: item.officialApplicationUrl || null,
        officialSourceUrl: item.officialSourceUrl || this.baseUrl,
        sourceType: item.sourceType || 'Official Portal',
        sourceName: this.sourceName,
        status: item.status || 'OPEN',
        deadlineStatus: item.deadlineStatus || 'OPEN',
        isVerified: true,
        lastVerifiedAt: now,
        contentHash: hash,
        version: 1,
        isSeed: false,
        createdAt: now,
        updatedAt: now,
      };
      normalized.push(opp);
    }

    return normalized;
  }

  validate(item: Opportunity): boolean {
    if (!item.title || item.title.trim().length < 3) return false;
    if (!item.officialSourceUrl) return false;
    if (!item.organization) return false;
    return true;
  }

  async store(normalizedItems: Opportunity[]): Promise<{ created: number; updated: number }> {
    const state = dbStore.getState();
    let created = 0;
    let updated = 0;

    for (const item of normalizedItems) {
      if (!this.validate(item)) continue;

      // Deduplication check: match existing opportunity by contentHash OR (organization + title)
      const existing = state.opportunities.find(o =>
        o.contentHash === item.contentHash ||
        (o.organization.toLowerCase() === item.organization.toLowerCase() && o.title.toLowerCase() === item.title.toLowerCase())
      );

      if (existing) {
        // Run change detection
        const result = ChangeDetectorService.applyChangesAndNotify(existing.id, item);
        if (result.updated) {
          updated++;
        }
      } else {
        state.opportunities.push(item);
        created++;
      }
    }

    dbStore.save();
    return { created, updated };
  }

  async run(): Promise<{ created: number; updated: number; scanned: number }> {
    const raw = await this.fetch();
    const parsed = await this.parse(raw);
    const normalized = await this.normalize(parsed);
    const result = await this.store(normalized);
    return {
      scanned: parsed.length,
      created: result.created,
      updated: result.updated,
    };
  }
}
