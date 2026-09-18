import { SourceAdapter } from './source-adapter';
import { Opportunity } from '@govalert/types';

export class ScholarshipAdapter extends SourceAdapter {
  constructor() {
    super('src-nsp', 'National Scholarship Portal (NSP)', 'https://scholarships.gov.in');
  }

  async fetch(): Promise<any> {
    return [
      {
        title: 'Pre-Matric Scholarship Scheme for Minorities 2026',
        organization: 'Ministry of Minority Affairs',
        category: 'Scholarships',
        description: 'Assistance for Class 1 to Class 10 minority community students with family income less than 1 lakh/year.',
        applicationStartDate: '2026-08-01T00:00:00Z',
        applicationDeadline: '2026-10-31T23:59:59Z',
        vacancyCount: 30000,
        educationRequirements: ['10th Pass'],
        branchRequirements: ['All'],
        stipend: 'Up to ₹10,000 / year',
        officialNotificationUrl: 'https://scholarships.gov.in/public/schemeGuidelines/MOMA_Pre_Matric_Guidelines.pdf',
        officialApplicationUrl: 'https://scholarships.gov.in',
        officialSourceUrl: 'https://scholarships.gov.in',
      }
    ];
  }

  async parse(rawPayload: any[]): Promise<Partial<Opportunity>[]> {
    return rawPayload.map(item => ({
      ...item,
      sourceType: 'Official Portal',
      sourceName: this.sourceName,
      status: 'OPEN',
      deadlineStatus: 'OPEN',
    }));
  }
}
