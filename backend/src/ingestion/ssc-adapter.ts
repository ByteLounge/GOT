import { SourceAdapter } from './source-adapter';
import { Opportunity } from '@govalert/types';

export class SSCAdapter extends SourceAdapter {
  constructor() {
    super('src-ssc', 'Staff Selection Commission (SSC)', 'https://ssc.gov.in');
  }

  async fetch(): Promise<any> {
    return [
      {
        title: 'Multi-Tasking (Non-Technical) Staff, and Havaldar (CBIC & CBN) Examination 2026',
        organization: 'Staff Selection Commission',
        category: 'Government Jobs',
        description: 'Recruitment of General Central Service Group C Non-Gazetted, Non-Ministerial post in various Ministries and Departments.',
        applicationStartDate: '2026-06-27T00:00:00Z',
        applicationDeadline: '2026-08-03T23:00:00Z',
        examDate: '2026-10-15T09:00:00Z',
        vacancyCount: 9583,
        educationRequirements: ['10th Pass'],
        branchRequirements: ['All'],
        ageLimit: { min: 18, max: 27 },
        salaryMin: 18000,
        salaryMax: 56900,
        officialNotificationUrl: 'https://ssc.gov.in/api/notices/MTS_Notice_2026.pdf',
        officialApplicationUrl: 'https://ssc.gov.in',
        officialSourceUrl: 'https://ssc.gov.in',
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
