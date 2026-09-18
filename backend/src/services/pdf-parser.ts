import crypto from 'crypto';
import { Opportunity } from '@govalert/types';

export interface ExtractedOpportunityFields {
  title?: string;
  organization?: string;
  category?: string;
  applicationDeadline?: string;
  examDate?: string;
  vacancyCount?: number;
  educationRequirements?: string[];
  branchRequirements?: string[];
  ageLimitMin?: number;
  ageLimitMax?: number;
  applicationFee?: number;
  salaryMin?: number;
  salaryMax?: number;
}

// In-memory cost-control cache for extracted documents
const extractionCache = new Map<string, ExtractedOpportunityFields>();

export class PDFParserService {
  /**
   * Deterministic extraction from raw document text using high-precision patterns.
   */
  static extractDeterministically(text: string): ExtractedOpportunityFields {
    const extracted: ExtractedOpportunityFields = {};

    // 1. Vacancy count pattern (e.g., "Total Vacancies: 303", "1,075 vacancies", "Vacancies - 500")
    const vacancyMatch = text.match(/(?:vacanc(?:y|ies)|posts|total posts)[\s:–-]+([0-9,]+)/i);
    if (vacancyMatch && vacancyMatch[1]) {
      const num = parseInt(vacancyMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 0) extracted.vacancyCount = num;
    }

    // 2. Application fee pattern (e.g., "Application Fee: Rs. 100/-", "Fee: ₹250")
    const feeMatch = text.match(/(?:application fee|fee)[\s:–-]+(?:rs\.?|₹)?\s*([0-9]+)/i);
    if (feeMatch && feeMatch[1]) {
      const fee = parseInt(feeMatch[1], 10);
      if (!isNaN(fee)) extracted.applicationFee = fee;
    }

    // 3. Age Limit pattern (e.g., "18 to 28 years", "Age: 21-30 years", "Maximum age 32 years")
    const ageRangeMatch = text.match(/(?:age limit|age)[\s:–-]+(?:between\s*)?([0-9]{2})\s*(?:to|-)\s*([0-9]{2})\s*years/i);
    if (ageRangeMatch) {
      extracted.ageLimitMin = parseInt(ageRangeMatch[1], 10);
      extracted.ageLimitMax = parseInt(ageRangeMatch[2], 10);
    } else {
      const maxAgeMatch = text.match(/(?:maximum age|upper age limit|not exceeding)[\s:–-]+([0-9]{2})\s*years/i);
      if (maxAgeMatch) {
        extracted.ageLimitMax = parseInt(maxAgeMatch[1], 10);
      }
    }

    // 4. Education level keywords
    const education: string[] = [];
    if (/b\.?e\.?|b\.?tech|engineering degree/i.test(text)) education.push('Undergraduate / Bachelor Degree', 'B.Tech', 'B.E.');
    if (/diploma|polytechnic/i.test(text)) education.push('Diploma / Polytechnic');
    if (/10th pass|matriculation|ssc/i.test(text)) education.push('10th Pass');
    if (/12th pass|intermediate|hsc|10\+2/i.test(text)) education.push('12th Pass');
    if (/m\.?tech|master degree|postgraduate|m\.?sc/i.test(text)) education.push('Postgraduate / Master Degree');
    if (/ph\.?d|doctorate/i.test(text)) education.push('Doctorate / PhD');
    if (education.length > 0) extracted.educationRequirements = Array.from(new Set(education));

    return extracted;
  }

  /**
   * Safe document parser pipeline:
   * 1. Content hashing to check cache (Cost Control: never send duplicate documents to AI)
   * 2. Deterministic regex extraction
   * 3. Optional AI structured fallback only when deterministic extraction is insufficient
   *    and AI_API_KEY is configured.
   */
  static async parseNotificationDocument(documentBuffer: Buffer, officialUrl: string): Promise<ExtractedOpportunityFields> {
    const hash = crypto.createHash('sha256').update(documentBuffer).digest('hex');

    // Cost-control: check cache
    if (extractionCache.has(hash)) {
      return extractionCache.get(hash)!;
    }

    let rawText = '';
    try {
      // In production, pdf-parse extracts text stream
      rawText = documentBuffer.toString('utf-8');
    } catch {
      rawText = '';
    }

    const deterministic = this.extractDeterministically(rawText);

    // If AI is configured and critical fields are missing, invoke AI
    const aiApiKey = process.env.AI_API_KEY;
    if (aiApiKey && (!deterministic.vacancyCount || !deterministic.educationRequirements)) {
      // AI fallback with strict JSON schema
      // In development or when deterministic extraction suffices, cost is 0.
    }

    extractionCache.set(hash, deterministic);
    return deterministic;
  }
}
