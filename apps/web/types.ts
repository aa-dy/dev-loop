
export type WeekTag = string; // e.g., "2025-W43"

export type Proposal = {
  id: string;
  userEmail: string;
  rawTopic: string;
  notes?: string;
  weekTag: WeekTag;
  createdAt: string; // ISO
};

export type CuratedTopic = {
  canonicalTitle: string;
  rationale: string; // 1-2 lines summarizing why it matters
  aliases: string[];
  supportCount: number;
  submissionCount: number;
  weekTag: WeekTag;
};

export type Poll = {
  id: string;
  weekTag: WeekTag;
  topics: CuratedTopic[];
  status: "not_open" | "open" | "closed";
  openAt: string;  // ISO
  closeAt: string; // ISO
};

export type Vote = {
  pollId: string;
  userEmail:string;
  topic: string; // canonicalTitle
  createdAt: string; // ISO
};

export type StudyPack = {
  weekTag: WeekTag;
  topic: string;
  overview: string;
  recommendedResources: { title: string; url: string; why: string }[];
  practiceProblems: { title: string; url: string; difficulty: "Easy"|"Medium"|"Hard" }[];
  rerankedBy?: "gpu-service";
  assetUrl?: string;
};

export type WeeklyDigest = {
  weekTag: WeekTag;
  topic: string;
  keyTakeaways: string[];
  commonPitfalls: string[];
  nextSteps: string[];
  createdAt: string; // ISO
};

export type SessionInfo = {
  weekTag: WeekTag;
  topic?: string;
  startsAt: string;  // next Saturday 18:00 local
  locationLabel: string; // "Google Meet" or venue name
  meetingUrl?: string;
};

export interface ApiClient {
  submitProposal(input: { email: string; topic: string; notes?: string }): Promise<{ ok: boolean; proposalId: string; weekTag: WeekTag }>;
  getCurrentPoll(): Promise<Poll>;
  vote(pollId: string, input: { email: string; topic: string }): Promise<{ ok: boolean }>;
  getCurrentPack(): Promise<StudyPack | null>;
  getCurrentDigest(): Promise<WeeklyDigest | null>;
  getSessionInfo(): Promise<SessionInfo>;
  // Mock-adapter specific methods for admin panel
  mock_cycleState?(): void;
  mock_generatePack?(): void;
  mock_publishRecap?(): void;
  mock_curateTopics?(): void;
}