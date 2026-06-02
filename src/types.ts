export type SubmissionCategory =
  | 'Technical Support'
  | 'Billing'
  | 'Feedback'
  | 'Security'
  | 'Partnerships';

export type SubmissionPriority = 'Low' | 'Medium' | 'High';

export type SubmissionStatus = 'New' | 'In Progress' | 'Resolved' | 'Archived';

export interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: SubmissionCategory;
  priority: SubmissionPriority;
  description: string;
  status: SubmissionStatus;
  createdAt: string;
}

export type ActivePage = 'home' | 'submit' | 'admin' | '404';

export interface DashboardStats {
  total: number;
  newCount: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
}

export type SortField = 'createdAt' | 'name' | 'subject' | 'category' | 'priority' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  categoryFilter: string;
  priorityFilter: string;
  statusFilter: string;
}

