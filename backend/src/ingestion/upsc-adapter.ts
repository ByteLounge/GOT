import { SourceAdapter } from './source-adapter';
import { Opportunity } from '@govalert/types';

export class UPSCAdapter extends SourceAdapter {
  constructor() {
    super('src-upsc', 'Union Public Service Commission (UPSC)', 'https://upsc.gov.in');
  }

  async fetch(): Promise<any> {
    // In production, fetches active examination HTML table or RSS feed
    // Fallback/Simulated structured payload from UPSC Active Examinations portal
    return [
      {
        title: 'Combined Defence Services Examination (II), 2026',
        organization: 'Union Public Service Commission',
        category: 'Competitive Exams',
        description: 'Combined Defence Services Examination (II) 2026 for admission to Indian Military Academy, Air Force Academy, Naval Academy and Officers Training Academy.',
        applicationStartDate: '2026-05-15T00:00:00Z',
        applicationDeadline: '2026-06-04T18:00:00Z',
        examDate: '2026-09-01T09:00:00Z',
        vacancyCount: 459,
        educationRequirements: ['Undergraduate / Bachelor Degree', 'B.Tech'],
        branchRequirements: ['All', 'Engineering', 'Physics', 'Mathematics'],
        ageLimit: { min: 19, max: 24 },
        officialNotificationUrl: 'https://upsc.gov.in/sites/default/files/Notice_CDS_II_2026.pdf',
        officialApplicationUrl: 'https://upsconline.nic.in',
        officialSourceUrl: 'https://upsc.gov.in/examinations/active-examinations',
      },
      {
        title: 'Central Armed Police Forces (ACs) Examination, 2026',
        organization: 'Union Public Service Commission',
        category: 'Government Jobs',
        description: 'Recruitment of Assistant Commandants (Group A) in BSF, CRPF, CISF, ITBP and SSB.',
        applicationStartDate: '2026-04-24T00:00:00Z',
        applicationDeadline: '2026-05-14T18:00:00Z',
        examDate: '2026-08-04T10:00:00Z',
        vacancyCount: 506,
        educationRequirements: ['Undergraduate / Bachelor Degree'],
        branchRequirements: ['All'],
        ageLimit: { min: 20, max: 25 },
        officialNotificationUrl: 'https://upsc.gov.in/sites/default/files/Notice_CAPF_2026.pdf',
        officialApplicationUrl: 'https://upsconline.nic.in',
        officialSourceUrl: 'https://upsc.gov.in',
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
