sequenceDiagram
  autonumber
  participant User as Member
  participant FE as Frontend (Web)
  participant GW as API Gateway (Cloud Run)
  participant PUB as Pub/Sub
  participant Curator as Topic Curator Agent (Cloud Run + Gemini)
  participant Poll as Poll Agent (Cloud Run)
  participant Pack as Knowledge Pack Agent (Cloud Run + Gemini)
  participant Host as Session Host Agent (Cloud Run)
  participant Sum as Summarizer Agent (Cloud Run + Gemini)
  participant FS as Firestore
  participant GCS as Cloud Storage
  participant CS as Cloud Scheduler

  rect rgb(245,245,255)
    CS->>GW: Week opens (Mon): submissions window
    User->>FE: Submit topic
    FE->>GW: POST /submit
    GW->>FS: Save submission
    GW->>PUB: publish(topic_submitted)
  end

  rect rgb(245,255,245)
    CS->>Curator: Trigger curation (Wed)
    PUB->>Curator: topic_submitted events (batch)
    Curator->>FS: Write curated topics
    Curator->>PUB: publish(topics_curated)
    PUB->>Poll: topics_curated
    Poll->>FS: Create weekly poll (open)
  end

  rect rgb(255,250,240)
    User->>FE: Vote
    FE->>GW: POST /poll/{id}/vote
    GW->>FS: Record vote
    CS->>Poll: Close poll (Sat) → determine winner
    Poll->>FS: Store winner
    CS->>Pack: Trigger study pack
    Pack->>GCS: Save pack (PDF/HTML/MD)
    Pack->>FS: Link pack to winning topic
  end

  rect rgb(240,250,255)
    CS->>Host: Trigger session setup (Sat)
    Host->>FS: Create session record
    Host-->>User: Reminders (Discord/Email/Calendar)
    CS->>Sum: Trigger recap (Sun)
    Sum->>FS: Save weekly digest
    Sum->>GCS: Store digest asset
  end

  FE->>GW: GET poll/topics/pack/digest
  GW->>FS: Read data
  GW-->>FE: Render DevLoop pages