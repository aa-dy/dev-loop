from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, timezone
from google.cloud import firestore, pubsub_v1
from google.api_core.exceptions import GoogleAPICallError
import os, json, logging

# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("devloop-api")

# ---------------------------
# App
# ---------------------------
app = FastAPI(title="DevLoop API", version="1.0")

# CORS: allow local UI + an optional deployed origin via env
ALLOWED_ORIGINS = {
    "http://localhost:5173",
    os.environ.get("UI_ORIGIN", "").strip(),
}
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# GCP Clients / Config
# ---------------------------
PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT")
if not PROJECT_ID:
    raise RuntimeError("GOOGLE_CLOUD_PROJECT is not set")

db = firestore.Client()
publisher = pubsub_v1.PublisherClient()
TOPIC_SUBMITTED = publisher.topic_path(PROJECT_ID, "topic_submitted")

# ---------------------------
# Utilities
# ---------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def week_tag(dt: datetime | None = None) -> str:
    d = dt or datetime.now(timezone.utc)
    return d.strftime("%G-W%V")  # ISO week

# ---------------------------
# Schemas (Pydantic v2)
# ---------------------------
class SubmitPayload(BaseModel):
    email: EmailStr = Field(..., description="User email")
    topic: str = Field(..., min_length=2, max_length=160)
    notes: str | None = Field(None, max_length=1000)

    @field_validator("topic", mode="before")
    @classmethod
    def _strip_topic(cls, v: str) -> str:
        return (v or "").strip()

    @field_validator("notes", mode="before")
    @classmethod
    def _strip_notes(cls, v: str | None) -> str | None:
        if v is None:
            return None
        v = v.strip()
        return v or None

# ---------------------------
# Health
# ---------------------------
@app.get("/health")
def health():
    return {"ok": True, "service": "devloop-api"}

# ---------------------------
# Submit Endpoint
# ---------------------------
@app.post("/api/submit")
def submit(payload: SubmitPayload, request: Request):
    """
    1) Save submission into Firestore (collection: submissions)
    2) Publish Pub/Sub event to topic_submitted
    """
    wt = week_tag()
    created_at = now_iso()

    doc = {
        "userEmail": payload.email.lower(),
        "rawTopic": payload.topic,
        "notes": payload.notes,
        "weekTag": wt,
        "createdAt": created_at,
        "userAgent": request.headers.get("user-agent"),
        "ipHint": request.client.host if request.client else None,
    }

    # 1) Firestore write
    try:
        _, ref = db.collection("submissions").add(doc)
    except GoogleAPICallError as e:
        log.exception("Firestore add failed")
        raise HTTPException(status_code=502, detail=f"firestore_error: {e.message}") from e
    except Exception as e:
        log.exception("Firestore add failed (unexpected)")
        raise HTTPException(status_code=500, detail="firestore_error") from e

    # 2) Pub/Sub publish
    event = {
        "type": "topic_submitted",
        "weekTag": wt,
        "payload": {"submissionId": ref.id},
        "meta": {"createdAt": created_at},
    }
    data = json.dumps(event).encode("utf-8")

    try:
        msg_id = publisher.publish(TOPIC_SUBMITTED, data).result(timeout=10)
        log.info("Published topic_submitted msg_id=%s weekTag=%s submissionId=%s",
                 msg_id, wt, ref.id)
    except Exception:
        log.exception("Pub/Sub publish failed")
        # Still return success to the client; curator can be retried later
        return {"ok": True, "submissionId": ref.id, "weekTag": wt, "warning": "publish_failed"}

    return {"ok": True, "submissionId": ref.id, "weekTag": wt}