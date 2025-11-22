import { z } from 'zod';

// Universal validation schemas for production-ready forms

export const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Invalid email address' })
  .max(255, { message: 'Email must be less than 255 characters' });

export const phoneSchema = z
  .string()
  .trim()
  .min(10, { message: 'Phone number must be at least 10 digits' })
  .max(20, { message: 'Phone number must be less than 20 digits' })
  .regex(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(100, { message: 'Name must be less than 100 characters' })
  .regex(/^[a-zA-Z\s\-'.]+$/, { message: 'Name contains invalid characters' });

export const textAreaSchema = z
  .string()
  .trim()
  .min(10, { message: 'Description must be at least 10 characters' })
  .max(5000, { message: 'Description must be less than 5000 characters' });

export const amountSchema = z
  .number()
  .positive({ message: 'Amount must be positive' })
  .max(999999999, { message: 'Amount is too large' });

export const urlSchema = z
  .string()
  .trim()
  .url({ message: 'Invalid URL format' })
  .max(2048, { message: 'URL must be less than 2048 characters' });

export const policySchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  content: textAreaSchema,
  deadline: z.string().optional(),
  implementation_progress: z.number().min(0).max(100).optional(),
});

export const inspectionSchema = z.object({
  school_id: z.string().uuid({ message: 'Invalid school ID' }),
  inspection_date: z.string().min(1, { message: 'Inspection date is required' }),
  compliance_score: z
    .number()
    .min(0, { message: 'Score must be between 0 and 100' })
    .max(100, { message: 'Score must be between 0 and 100' })
    .optional(),
  findings: textAreaSchema.optional(),
  recommendations: textAreaSchema.optional(),
});

export const grantSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  amount: amountSchema,
  applicant_school_id: z.string().uuid().optional(),
  deadline: z.string().optional(),
});

export const supportCaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(200, { message: 'Title must be less than 200 characters' }),
  description: textAreaSchema,
  case_type: z.enum(['welfare', 'dispute', 'complaint', 'assistance', 'advocacy']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  school_id: z.string().uuid().optional(),
});

export const registrationSchema = z.object({
  school_name: nameSchema,
  owner_name: nameSchema,
  owner_email: emailSchema,
  owner_phone: phoneSchema,
  school_address: z
    .string()
    .trim()
    .min(10, { message: 'Address must be at least 10 characters' })
    .max(500, { message: 'Address must be less than 500 characters' }),
  registration_number: z
    .string()
    .trim()
    .min(3, { message: 'Registration number must be at least 3 characters' })
    .max(50, { message: 'Registration number must be less than 50 characters' })
    .optional(),
});

// Sanitization helpers
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
}
