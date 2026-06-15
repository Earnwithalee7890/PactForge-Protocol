export type MilestoneState = 0 | 1 | 2 | 3 | 4 | 5;

export interface Milestone {
  id: number;
  title: string;
  description: string;
  amount: string; // e.g. "1,000 STX" or raw number representation
  state: MilestoneState;
}

export type PactState = 'created' | 'funded' | 'active' | 'completed' | 'disputed' | 'cancelled';

export interface Pact {
  id: number;
  title: string;
  description: string;
  client: string;
  provider: string;
  totalAmount: string; // e.g. "5,000 STX"
  fundedAmount: string;
  releasedAmount: string;
  state: PactState;
  deadline: string;
  createdAt: string;
  milestones: Milestone[];
  disputeId?: number;
}

export interface Dispute {
  id: number;
  pactId: number;
  title: string;
  reason: string;
  status: 'open' | 'resolved_client' | 'resolved_provider';
  votesClient: number;
  votesProvider: number;
  voters: string[]; // addresses of arbiters who voted
}

export interface ReputationProfile {
  address: string;
  score: number;
  completedPacts: number;
  disputedPacts: number;
  totalEarned: string; // e.g. "12,400 STX"
}
