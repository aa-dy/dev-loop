
# 🧠 DevLoop – DSA Community Automation (Cloud Run + ADK)

**DevLoop** automates how DSA (Data Structures & Algorithms) learners run weekly study meetups.  
Members propose topics → agents curate → community votes → winning topic becomes the weekend study focus.

---

## 🌐 Live Services

| Service | URL | Description |
|----------|-----|-------------|
| **Gateway API** | https://devloop-api-81155917163.us-central1.run.app | FastAPI backend for submissions & events |
| **Curator Agent** | https://curator-agent-81155917163.us-central1.run.app | AI agent that clusters weekly submissions into canonical topics (Gemini) |
| *(UI)* | Local or Vite build (connects to Gateway API) | Community frontend for submitting & voting |

---

## 🏗️ Architecture Overview

```
User / UI
   │
   ├── POST /api/submit (Gateway API)
   │       ↓
   │   Firestore (submissions)
   │       ↓
   │   Pub/Sub → topic_submitted
   │       ↓ (push)
Curator Agent (Cloud Run, Gemini)
   │   • Reads all submissions for the week
   │   • Generates 3–6 canonical DSA topics
   │   • Writes to Firestore topics/{weekTag}
   │   • Publishes topics_curated
   │
   └── Next: Poll Agent (ADK) → opens polls → votes → winner
```

---

## ⚙️ Services Deployed

### 1. Gateway API
**Stack:** FastAPI + Firestore + Pub/Sub  
**Purpose:** Entry point for the community or UI to submit topics.

Endpoints:
- `GET /health` → basic health check
- `POST /api/submit` → accepts `{email, topic, notes}`  
  Saves to Firestore (`submissions`) and publishes Pub/Sub event `topic_submitted`
- (Next) `/api/vote` → upcoming feature for weekly polls

How to test:
```bash
curl https://devloop-api-81155917163.us-central1.run.app/health

curl -s -X POST "https://devloop-api-81155917163.us-central1.run.app/api/submit"   -H "Content-Type: application/json"   -d '{"email":"tester@devloop.app","topic":"Binary Search","notes":"parametric search"}'
```

Swagger UI:  
👉 [https://devloop-api-81155917163.us-central1.run.app/docs](https://devloop-api-81155917163.us-central1.run.app/docs)

---

### 2. Curator Agent
**Stack:** FastAPI + Firestore + Gemini API + Pub/Sub  
**Purpose:** Clusters all weekly submissions into 3–6 canonical DSA topics using Gemini.

Triggered by Pub/Sub push on `topic_submitted` → `/inbox`  
Writes curated topics to Firestore → `topics/{weekTag}`  
Publishes `topics_curated` event for the next agent (Poll Agent).

---

## 🧩 GCP Resources

| Resource | Name / ID | Purpose |
|-----------|------------|----------|
| Firestore (Native) | `dev-loop-476416` | Stores submissions, topics, polls |
| Pub/Sub Topics | `topic_submitted`, `topics_curated` | Event bus between services |
| Pub/Sub Subscriptions | `topic_submitted-to-curator` (push) | Push to Curator Agent `/inbox` |
| Service Account | `devloop-run-sa@dev-loop-476416.iam.gserviceaccount.com` | Used by all Cloud Run services |
| Secret | `GEMINI_API_KEY` | Stored Gemini API key (Secret Manager) |
| Cloud Run Region | `us-central1` | Deployment region for all services |

---

## ✅ How to Test End-to-End

1. **Submit a topic**
   ```bash
   curl -s -X POST "https://devloop-api-81155917163.us-central1.run.app/api/submit"      -H "Content-Type: application/json"      -d '{"email":"you@devloop.app","topic":"Dijkstra Basics","notes":"graphs"}'
   ```

2. **Check Firestore (Console)**
   - Collection: `submissions` → your topic appears
   - Collection: `topics` → new doc `2025-W44` with clustered topics

3. **Logs**
   ```bash
   gcloud run services logs read devloop-api --region us-central1 --limit 100
   gcloud run services logs read curator-agent --region us-central1 --limit 100
   ```

4. **Pub/Sub verification**
   ```bash
   gcloud pubsub topics list
   gcloud pubsub topics list-subscriptions topic_submitted
   ```

---

## 👥 Team Notes (for collaborators)

Tell teammates:
> “Gateway API + Curator Agent are deployed on Cloud Run.  
> You can test live with Swagger `/docs` or the curl commands above.  
> New submissions automatically trigger the curator agent, which writes weekly topics into Firestore.”

If your teammate doesn’t have gcloud, they can:
- Use [https://devloop-api-81155917163.us-central1.run.app/docs](https://devloop-api-81155917163.us-central1.run.app/docs)
- Check results in Firestore via the GCP Console.

---

## 🛠️ Next Planned Steps

| Step | Description |
|------|--------------|
| 🗳️ **Poll Agent (ADK)** | Listen to `topics_curated` → open weekly polls automatically |
| 👍 **/api/vote Endpoint** | Publish vote events to Pub/Sub `topic_vote` |
| 🎓 **Study Pack Agent** | Generate detailed study packs via Gemini |
| 🧾 **Summarizer Agent** | Create weekly recap (AI-generated) |
| 💻 **UI Enhancements** | Display curated topics, live polls, and weekly winner |

---

## 📦 Repo Structure

```
dev-loop/
├─ apps/web/                 # React frontend (connects to Gateway API)
├─ services/
│  ├─ gateway/               # FastAPI backend (Cloud Run)
│  ├─ agents/
│  │  ├─ curator/            # Gemini-powered clustering agent
│  │  ├─ poll/               # (upcoming) handles voting
│  │  └─ summarizer/         # (upcoming) generates recaps
│  └─ mcp/                   # (optional) MCP tool server
├─ docs/                     # Architecture, API, flow diagrams
└─ infra/                    # Deployment scripts, IAM setup
```

---

## 💡 Tech Stack

- **Google Cloud Run** — serverless deployment for all microservices  
- **Pub/Sub** — asynchronous agent communication  
- **Firestore (Native)** — structured data store for week-wise records  
- **Gemini 1.5 Flash** — topic clustering, content generation  
- **FastAPI** — lightweight Python web framework  
- **Google ADK** — (next step) for multi-agent orchestration  

---

## 🧑‍💻 Authors
- **Sai Charan** – Cloud Run & Gateway API  
- **Team DevLoop** – Curator Agent, ADK integration, and UI

---

## 📜 License
MIT License © 2025 DevLoop Team
