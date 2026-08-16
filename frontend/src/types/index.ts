export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  ownerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFile {
  id: number;
  filePath: string;
  fileName: string;
  content?: string;
  sizeBytes?: number;
}

export interface ChatMessage {
  id?: number;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  createdAt?: string;
}

export interface Plan {
  id: number;
  name: string;
  maxProjects: number;
  maxTokensPerDay: number;
  unlimitedAi: boolean;
  priceMonthly?: number;
}

export interface UserUsageSummary {
  userId: number;
  planName: string;
  tokensToday: number;
  maxTokensPerDay: number;
  tokensThisMonth: number;
  monthlyTokenLimit: number;
  remainingThisMonth: number;
  percentageUsed: number;
  isLimitExceeded: boolean;
}
