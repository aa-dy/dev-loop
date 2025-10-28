flowchart TB
  %% === Clients ===
  U[Developers (Web/Discord/Slack)]
  subgraph FE[Frontend (React/Tailwind) — Cloud Run or Static Hosting]
    FEUI[Submit Topics • Vote • View Study Pack • Weekly Digest]
  end

  %% === Gateway ===
  GW[API Gateway (FastAPI) — Cloud Run\nAuth • REST Endpoints • Validation]

  %% === Messaging & Data ===
  PUB[Pub/Sub — Event Bus]
  FS[(Firestore — Users • Submissions • Topics • Polls • Votes • Sessions • Digests)]
  GCS[(Cloud Storage — Study Packs • Digests)]
  CS[Cloud Scheduler — Weekly Triggers]

  %% === Agents (Cloud Run microservices) ===
  subgraph AGENTS[AI Agents — Cloud Run (stateless)]
    A1[Onboarding Agent]
    A2[Topic Curator Agent\n(Gemini 1.5 Pro)]
    A3[Poll Agent]
    A4[Knowledge Pack Agent\n(Gemini 1.5 Pro)]
    A5[Session Host Agent\n(Calendar/Reminders)]
    A6[Summarizer Agent\n(Gemini 1.5 Pro)]
  end

  %% === Optional Integrations ===
  DIS[(Discord/Slack Bot)]
  CAL[(Google Calendar)]
  EMAIL[(Email/Notification Service)]

  %% === Flows ===
  U -->|Browser/App| FEUI --> GW
  GW --> FS
  GW --> PUB

  %% Submission -> Curation
  PUB -->|topic_submitted| A2
  A2 --> FS
  A2 -->|topics_curated| PUB

  %% Polling
  PUB --> A3
  A3 --> FS

  %% Scheduler and lifecycle
  CS -->|weekly events\n(open/close)| A2
  CS -->|weekly events\n(open/close)| A3
  CS -->|after poll closes| A4
  CS -->|before session| A5
  CS -->|after session| A6

  %% Study Pack
  A4 --> GCS
  A4 --> FS

  %% Session hosting & notifications
  A5 --> CAL
  A5 --> EMAIL
  A5 --> DIS

  %% Weekly Digest
  A6 --> GCS
  A6 --> FS
  A6 --> DIS
  A6 --> EMAIL

  %% Frontend reads
  FEUI -->|Fetch: poll, topics, packs, digest| GW
  GW --> FS
  GW --> GCS