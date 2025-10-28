// FIX: Manually define types for import.meta.env for environments where vite/client types are not available.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_BASE_URL?: string;
    }
  }
}

import type { ApiClient, Poll, Proposal, SessionInfo, StudyPack, WeeklyDigest, WeekTag, CuratedTopic } from '../types';
import { getNextOccurrence, getWeekTag } from '../utils/date';
import { SCHEDULE } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// --- Mock Adapter ---
class MockAdapter implements ApiClient {
  private proposals: Proposal[] = [];
  private votes: Map<string, string> = new Map(); // userEmail -> topic
  private poll: Poll;
  private studyPack: StudyPack | null = null;
  private weeklyDigest: WeeklyDigest | null = null;
  private sessionInfo: SessionInfo;
  private topicSubmissionStats: Map<string, { rationale: string; aliases: string[]; submissionCount: number; }> = new Map();

  constructor() {
    this.initializeState();
  }

  private initializeState() {
    const weekTag = getWeekTag();
    this.proposals = [];
    this.votes.clear();
    this.poll = this.createInitialPoll(weekTag);
    this.studyPack = null;
    this.weeklyDigest = null;
    this.sessionInfo = this.createSessionInfo(weekTag);
    this.initializeTopicStats();
  }

  private initializeTopicStats() {
    this.topicSubmissionStats.clear();
    const topics = [
      { canonicalTitle: 'Binary Search on Answers', rationale: 'A powerful technique for solving optimization problems.', aliases: ['BS on Answers'], submissionCount: 2 },
      { canonicalTitle: 'Topological Sort with Kahn\'s Algorithm', rationale: 'Essential for dependency resolution and scheduling tasks.', aliases: ['Topo Sort'], submissionCount: 1 },
      { canonicalTitle: 'Dynamic Programming on Trees', rationale: 'Covers a common pattern for tree-based DP problems.', aliases: ['Tree DP'], submissionCount: 1 },
      { canonicalTitle: 'Sliding Window Maximum (Deque)', rationale: 'An efficient way to find maximums in a moving window.', aliases: ['Deque Sliding Window'], submissionCount: 0 },
      { canonicalTitle: 'Tries for String Problems', rationale: 'An efficient tree data structure for string searching and prefix matching.', aliases: ['Trie', 'Prefix Tree'], submissionCount: 0 },
    ];
    topics.forEach(t => {
      this.topicSubmissionStats.set(t.canonicalTitle, {
        rationale: t.rationale,
        aliases: t.aliases,
        submissionCount: t.submissionCount,
      });
    });
  }
  
  private createInitialPoll(weekTag: WeekTag): Poll {
    return {
      id: uuidv4(),
      weekTag,
      topics: [],
      status: 'not_open',
      openAt: getNextOccurrence(SCHEDULE.POLL_OPEN.day, SCHEDULE.POLL_OPEN.hour, SCHEDULE.POLL_OPEN.minute).toISOString(),
      closeAt: getNextOccurrence(SCHEDULE.POLL_CLOSE.day, SCHEDULE.POLL_CLOSE.hour, SCHEDULE.POLL_CLOSE.minute).toISOString(),
    };
  }

  private createSessionInfo(weekTag: WeekTag, topic?: string): SessionInfo {
    return {
      weekTag,
      topic,
      startsAt: getNextOccurrence(SCHEDULE.SESSION_START.day, SCHEDULE.SESSION_START.hour, SCHEDULE.SESSION_START.minute).toISOString(),
      locationLabel: 'Google Meet',
      meetingUrl: 'https://meet.google.com/lookup/devloop-session',
    };
  }

  private delay = <T,>(data: T, ms = 200): Promise<T> =>
    new Promise(resolve => setTimeout(() => resolve(data), ms));

  async submitProposal({ email, topic, notes }: { email: string; topic: string; notes?: string }): Promise<{ ok: boolean; proposalId: string; weekTag: WeekTag; }> {
    const weekTag = getWeekTag();
    const proposal: Proposal = {
      id: uuidv4(),
      userEmail: email,
      rawTopic: topic,
      notes,
      weekTag,
      createdAt: new Date().toISOString(),
    };
    this.proposals.push(proposal);

    // Increment submission count for matching topic
    for (const [canonicalTitle, stats] of this.topicSubmissionStats.entries()) {
        const lowerTopic = topic.toLowerCase().trim();
        if (
            canonicalTitle.toLowerCase() === lowerTopic ||
            stats.aliases.some(alias => alias.toLowerCase() === lowerTopic)
        ) {
            stats.submissionCount += 1;
            this.topicSubmissionStats.set(canonicalTitle, stats);
            break;
        }
    }
    
    // If this is the first submission for a week with no poll, create one automatically for the demo.
    if (this.poll.topics.length === 0) {
        console.log('First proposal of the week: auto-curating and creating poll.');
        this.mock_curateTopics();
    }


    console.log('Mock DB - Proposals:', this.proposals);
    console.log('Mock DB - Topic Submission Stats:', this.topicSubmissionStats);
    return this.delay({ ok: true, proposalId: proposal.id, weekTag });
  }

  async getCurrentPoll(): Promise<Poll> {
    // Simulate real-time status check
    const now = new Date();
    const openAt = new Date(this.poll.openAt);
    const closeAt = new Date(this.poll.closeAt);

    if (this.poll.status !== 'closed' && now >= closeAt) {
      this.poll.status = 'closed';
    } else if (this.poll.status === 'not_open' && now >= openAt && now < closeAt) {
      this.poll.status = 'open';
    }

    return this.delay({ ...this.poll });
  }

  async vote(pollId: string, { email, topic }: { email: string; topic: string; }): Promise<{ ok: boolean; }> {
    if (this.votes.has(email)) {
      return this.delay({ ok: false }); // Already voted
    }
    const targetTopic = this.poll.topics.find(t => t.canonicalTitle === topic);
    if (!targetTopic || this.poll.status !== 'open') {
      return this.delay({ ok: false });
    }

    this.votes.set(email, topic);
    targetTopic.supportCount += 1;
    console.log('Mock DB - Votes:', this.votes);
    return this.delay({ ok: true });
  }

  async getCurrentPack(): Promise<StudyPack | null> {
    return this.delay(this.studyPack);
  }

  async getCurrentDigest(): Promise<WeeklyDigest | null> {
    return this.delay(this.weeklyDigest);
  }
  
  async getSessionInfo(): Promise<SessionInfo> {
    return this.delay(this.sessionInfo);
  }

  // --- Admin Methods ---
  mock_curateTopics(): void {
    console.log('Admin: Closing submissions and curating topics...');
    const weekTag = getWeekTag();
    
    const curatedTopics: CuratedTopic[] = [];
    for (const [canonicalTitle, stats] of this.topicSubmissionStats.entries()) {
        curatedTopics.push({
            canonicalTitle,
            rationale: stats.rationale,
            aliases: stats.aliases,
            supportCount: 0,
            submissionCount: stats.submissionCount,
            weekTag,
        });
    }

    this.poll = {
      id: uuidv4(),
      weekTag,
      topics: curatedTopics.sort((a,b) => b.submissionCount - a.submissionCount).slice(0, 4),
      status: 'not_open',
      openAt: new Date().toISOString(),
      closeAt: getNextOccurrence(SCHEDULE.POLL_CLOSE.day, SCHEDULE.POLL_CLOSE.hour, SCHEDULE.POLL_CLOSE.minute).toISOString(),
    };
    this.votes.clear();
    this.studyPack = null;
    this.weeklyDigest = null;
    this.sessionInfo = this.createSessionInfo(weekTag);
  }
  
  mock_cycleState(): void {
      switch(this.poll.status) {
          case 'not_open':
              console.log('Admin: Opening Poll...');
              this.poll.status = 'open';
              this.poll.openAt = new Date().toISOString();
              break;
          case 'open':
              console.log('Admin: Closing Poll & Picking Winner...');
              this.poll.status = 'closed';
              this.poll.closeAt = new Date().toISOString();
              // Pick a winner (the one with most votes, or first if tied)
              const winner = [...this.poll.topics].sort((a, b) => b.supportCount - a.supportCount)[0];
              if (winner) {
                this.sessionInfo.topic = winner.canonicalTitle;
              }
              break;
          case 'closed':
              console.log('Admin: Resetting for next week...');
              this.initializeState();
              break;
      }
  }

  mock_generatePack(): void {
    if (this.sessionInfo.topic) {
      console.log(`Admin: Generating study pack for ${this.sessionInfo.topic}...`);
      this.studyPack = {
        weekTag: this.poll.weekTag,
        topic: this.sessionInfo.topic,
        overview: 'This is a mock overview for the winning topic. It typically contains 120-160 words explaining the core concept, its importance, and common use cases in interviews and competitive programming. The real content will be generated by an AI agent.',
        recommendedResources: [
          { title: 'GeeksforGeeks Article', url: '#', why: 'A comprehensive text-based explanation with code examples.' },
          { title: 'NeetCode YouTube Video', url: '#', why: 'A clear visual and verbal walkthrough of the concept and problem-solving patterns.' },
          { title: 'CP-Algorithms Entry', url: '#', why: 'A more theoretical and in-depth look, great for advanced understanding.' },
        ],
        practiceProblems: [
          { title: 'LeetCode Problem #1', url: '#', difficulty: 'Easy' },
          { title: 'LeetCode Problem #2', url: '#', difficulty: 'Medium' },
          { title: 'LeetCode Problem #3', url: '#', difficulty: 'Hard' },
        ],
        rerankedBy: 'gpu-service',
      };
    }
  }

  mock_publishRecap(): void {
    if (this.sessionInfo.topic) {
        console.log(`Admin: Publishing recap for ${this.sessionInfo.topic}...`);
        this.weeklyDigest = {
            weekTag: this.poll.weekTag,
            topic: this.sessionInfo.topic,
            keyTakeaways: [
                "Key takeaway number one from the session.",
                "Another important point that was discussed.",
                "The core formula or algorithm to remember.",
                "A subtle nuance that is easy to miss.",
                "How this topic connects to other DSA concepts."
            ],
            commonPitfalls: [
                "A common off-by-one error to watch out for.",
                "Forgetting to handle a specific edge case.",
                "Choosing a suboptimal data structure that affects performance."
            ],
            nextSteps: [
                "Practice more Medium-level problems on this topic.",
                "Try to implement the algorithm from scratch without looking.",
                "Read about advanced variations of this technique."
            ],
            createdAt: new Date().toISOString(),
        };
    }
  }
}

// --- HTTP Adapter ---
class HttpAdapter implements ApiClient {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

  private async request<T,>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async submitProposal(input: { email: string; topic: string; notes?: string; }): Promise<{ ok: boolean; proposalId: string; weekTag: WeekTag; }> {
    return this.request('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  }

  async getCurrentPoll(): Promise<Poll> {
    return this.request<Poll>('/poll/current');
  }
  
  async vote(pollId: string, input: { email: string; topic: string; }): Promise<{ ok: boolean; }> {
     return this.request(`/poll/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  }

  async getCurrentPack(): Promise<StudyPack | null> {
    return this.request<StudyPack | null>('/pack/current');
  }

  async getCurrentDigest(): Promise<WeeklyDigest | null> {
    return this.request<WeeklyDigest | null>('/digest/current');
  }
  
  async getSessionInfo(): Promise<SessionInfo> {
    return this.request<SessionInfo>('/session/current');
  }
}

// --- Factory ---
const mockAdapter = new MockAdapter();

export const getApiClient = (adapterType: 'mock' | 'http' = 'mock'): ApiClient => {
  if (adapterType === 'http') {
    return new HttpAdapter();
  }
  return mockAdapter;
};
