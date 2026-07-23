export type PollCategory = 
  | "Homepage" 
  | "Teacher Hub" 
  | "Petitions" 
  | "Announcements" 
  | "General";

export type PollStatus = "Draft" | "Published" | "Archived";
export type PollPriority = "Low" | "Medium" | "High";
export type PollTargetAudience = "Everyone" | "Teachers" | "Government Employees" | "BPSC Teachers" | "Custom";

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  display_order: number;
  vote_count: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  voted_at: string;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  category: PollCategory;
  allow_multiple: boolean;
  show_results_before_vote: boolean;
  allow_vote_edit: boolean;
  require_login: boolean;
  featured: boolean;
  status: PollStatus;
  priority: PollPriority;
  target_audience: PollTargetAudience;
  image_url?: string;
  start_date: string;
  end_date?: string;
  total_votes: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  options: PollOption[];
  user_votes?: string[]; // option_ids selected by current user
}

export interface PollAnalytics {
  totalPolls: number;
  activePolls: number;
  totalVotes: number;
  avgParticipation: number;
  mostActivePoll?: {
    id: string;
    question: string;
    total_votes: number;
  };
  mostSelectedOption?: {
    pollQuestion: string;
    optionText: string;
    voteCount: number;
  };
  categoryBreakdown: Record<string, number>;
  votingTrend: Array<{ date: string; votes: number }>;
}
