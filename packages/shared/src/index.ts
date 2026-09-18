export const INDIAN_STATES = [
  'All India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Chandigarh',
  'Puducherry',
] as const;

export const OPPORTUNITY_CATEGORIES = [
  'Government Jobs',
  'Government Internships',
  'Scholarships',
  'Fellowships',
  'Competitive Exams',
  'PSU Recruitment',
  'Research Opportunities',
  'Apprenticeships',
  'Government Schemes',
  'Grants',
  'Competitions',
  'Other',
] as const;

export const EDUCATION_LEVELS = [
  '10th Pass',
  '12th Pass',
  'Diploma / Polytechnic',
  'Undergraduate (Pursuing)',
  'Undergraduate / Bachelor Degree',
  'Postgraduate (Pursuing)',
  'Postgraduate / Master Degree',
  'Doctorate / PhD',
] as const;

export const SOCIAL_CATEGORIES = [
  'General / Unreserved',
  'OBC (Non-Creamy Layer)',
  'OBC (Creamy Layer)',
  'SC',
  'ST',
  'EWS',
  'PwD (Persons with Disabilities)',
  'Ex-Servicemen',
] as const;

export interface DeadlineInfo {
  status: 'OPEN' | 'CLOSING_TODAY' | 'CLOSING_TOMORROW' | 'CLOSING_SOON' | 'CLOSED' | 'UPCOMING';
  daysRemaining: number | null;
  label: string;
  badgeColor: string;
}

export function calculateDeadlineInfo(
  deadlineDateStr?: string | null,
  startDateStr?: string | null,
  referenceDate: Date = new Date()
): DeadlineInfo {
  if (!deadlineDateStr) {
    return {
      status: 'OPEN',
      daysRemaining: null,
      label: 'Ongoing / Open',
      badgeColor: '#10B981', // green
    };
  }

  const now = referenceDate.getTime();
  const deadline = new Date(deadlineDateStr).getTime();

  if (startDateStr) {
    const start = new Date(startDateStr).getTime();
    if (now < start) {
      const daysUntilOpen = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
      return {
        status: 'UPCOMING',
        daysRemaining: daysUntilOpen,
        label: `Opens in ${daysUntilOpen} day${daysUntilOpen === 1 ? '' : 's'}`,
        badgeColor: '#3B82F6', // blue
      };
    }
  }

  const diffMs = deadline - now;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) {
    return {
      status: 'CLOSED',
      daysRemaining: 0,
      label: 'Closed',
      badgeColor: '#6B7280', // gray
    };
  }

  if (daysRemaining <= 1) {
    return {
      status: 'CLOSING_TODAY',
      daysRemaining: 1,
      label: 'Closing Today',
      badgeColor: '#EF4444', // red
    };
  }

  if (daysRemaining === 2) {
    return {
      status: 'CLOSING_TOMORROW',
      daysRemaining: 2,
      label: 'Closing Tomorrow',
      badgeColor: '#F97316', // orange
    };
  }

  if (daysRemaining <= 7) {
    return {
      status: 'CLOSING_SOON',
      daysRemaining,
      label: `${daysRemaining} days left`,
      badgeColor: '#F59E0B', // amber
    };
  }

  return {
    status: 'OPEN',
    daysRemaining,
    label: `${daysRemaining} days left`,
    badgeColor: '#10B981', // green
  };
}

export function calculateUserAge(dobString?: string | null, referenceDate: Date = new Date()): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;

  let age = referenceDate.getFullYear() - dob.getFullYear();
  const m = referenceDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && referenceDate.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export interface EligibilityResult {
  isPotentiallyEligible: boolean;
  matchScore: number;
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  missingProfileFields: string[];
  disclaimer: string;
}

export function evaluateEligibility(
  profile: {
    educationLevel?: string | null;
    degree?: string | null;
    branch?: string | null;
    dateOfBirth?: string | null;
    state?: string | null;
    category?: string | null;
    interests?: string[];
    preferredOpportunityTypes?: string[];
  } | null | undefined,
  opportunity: {
    category?: string;
    educationRequirements?: string[];
    branchRequirements?: string[];
    ageLimit?: { min?: number | null; max?: number | null };
    location?: string | null;
    categoryRequirements?: string[];
  }
): EligibilityResult {
  const matchedCriteria: string[] = [];
  const unmatchedCriteria: string[] = [];
  const missingProfileFields: string[] = [];

  const disclaimer = 'Potentially eligible based on your profile. Check official notification for final eligibility.';

  if (!profile) {
    return {
      isPotentiallyEligible: true,
      matchScore: 50,
      matchedCriteria: [],
      unmatchedCriteria: [],
      missingProfileFields: ['Complete your profile to see accurate eligibility match'],
      disclaimer,
    };
  }

  let totalRules = 0;
  let passedRules = 0;

  // 1. Education requirements
  if (opportunity.educationRequirements && opportunity.educationRequirements.length > 0) {
    totalRules++;
    if (!profile.educationLevel && !profile.degree) {
      missingProfileFields.push('Education / Degree');
    } else {
      const userDegree = (profile.degree || '').toLowerCase();
      const userEdu = (profile.educationLevel || '').toLowerCase();
      const matches = opportunity.educationRequirements.some(req => {
        const r = req.toLowerCase();
        return (
          userDegree.includes(r) ||
          r.includes(userDegree) ||
          userEdu.includes(r) ||
          r.includes(userEdu) ||
          (r.includes('graduate') && (userEdu.includes('bachelor') || userEdu.includes('undergraduate'))) ||
          (r.includes('engineering') && (userDegree.includes('b.tech') || userDegree.includes('b.e')))
        );
      });

      if (matches) {
        passedRules++;
        matchedCriteria.push(`Degree requirement matched (${profile.degree || profile.educationLevel})`);
      } else {
        unmatchedCriteria.push(`Requires: ${opportunity.educationRequirements.join(', ')}`);
      }
    }
  }

  // 2. Branch requirements
  if (opportunity.branchRequirements && opportunity.branchRequirements.length > 0) {
    totalRules++;
    if (!profile.branch) {
      missingProfileFields.push('Branch / Specialization');
    } else {
      const userBranch = profile.branch.toLowerCase();
      const matches = opportunity.branchRequirements.some(req => {
        const r = req.toLowerCase();
        return (
          userBranch.includes(r) ||
          r.includes(userBranch) ||
          r === 'all' ||
          r === 'any engineering' ||
          (r.includes('computer') && (userBranch.includes('cs') || userBranch.includes('it') || userBranch.includes('software')))
        );
      });

      if (matches) {
        passedRules++;
        matchedCriteria.push(`Branch requirement matched (${profile.branch})`);
      } else {
        unmatchedCriteria.push(`Specific branch requirement: ${opportunity.branchRequirements.join(', ')}`);
      }
    }
  }

  // 3. Age limit
  if (opportunity.ageLimit && (opportunity.ageLimit.min != null || opportunity.ageLimit.max != null)) {
    totalRules++;
    const age = calculateUserAge(profile.dateOfBirth);
    if (age === null) {
      missingProfileFields.push('Date of Birth for Age validation');
    } else {
      const min = opportunity.ageLimit.min ?? 0;
      const max = opportunity.ageLimit.max ?? 100;
      if (age >= min && age <= max) {
        passedRules++;
        matchedCriteria.push(`Age requirement (${age} years fits ${min}-${max} years range)`);
      } else {
        unmatchedCriteria.push(`Age limit: ${min}-${max} years (Your age: ${age})`);
      }
    }
  }

  // 4. Location match
  if (opportunity.location && opportunity.location !== 'All India') {
    if (profile.state && opportunity.location.toLowerCase().includes(profile.state.toLowerCase())) {
      matchedCriteria.push(`Location matched (${profile.state})`);
    }
  }

  const matchScore = totalRules === 0 ? 80 : Math.round((passedRules / totalRules) * 100);
  const isPotentiallyEligible = unmatchedCriteria.length === 0;

  return {
    isPotentiallyEligible,
    matchScore,
    matchedCriteria,
    unmatchedCriteria,
    missingProfileFields,
    disclaimer,
  };
}

export function formatDateIndian(dateStr?: string | null): string {
  if (!dateStr) return 'Not specified';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatSalary(min?: number | null, max?: number | null, stipend?: string | null): string {
  if (stipend) return stipend;
  if (min && max) {
    return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')} / month`;
  }
  if (min) return `From ₹${min.toLocaleString('en-IN')} / month`;
  if (max) return `Up to ₹${max.toLocaleString('en-IN')} / month`;
  return 'As per government norms';
}
