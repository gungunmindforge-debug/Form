import type { Submission } from './types';

// Starter data used for AdminView rendering when backend is unavailable.
// AdminView expects: name, phone, email, subject, description, status, category, priority, createdAt.

export const INITIAL_SEEDED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-mock-001',
    name: 'Chaitanya',
    phone: '8882061417',
    email: 'chaitanya23.purohit@example.com',
    subject: 'B.tech',
    category: 'Billing',
    priority: 'Low',
    description:
      'When requesting a password reset, no email arrives. Tried multiple browsers and networks. Please investigate the reset email delivery flow.',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  }
]; 