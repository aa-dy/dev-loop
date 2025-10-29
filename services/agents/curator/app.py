import base64, json, os
from datetime import datetime, timezone
from fastapi import FastAPI, Request
from google.cloud import firestore, pubsub_v1, secretmanager
import google.generativeai as genai

app = FastAPI()
db = firestore.Client()
publisher = pubsub_v1.PublisherClient()

PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT")
TOPIC_CURATED = publisher.topic_path(PROJECT_ID, "topics_curated")

def now_iso(): return datetime.now(timezone.utc).isoformat()

def get_secret(name: str) -> str:
    sm = secretmanager.SecretManagerServiceClient()
    path = sm.secret_version_path(PROJECT_ID, name, "latest")
    return sm.access_secret_version(request={"name": path}).payload.data.decode("utf-8")

# Init Gemini key from env or Secret Manager
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    try:
        GEMINI_API_KEY = get_secret("GEMINI_API_KEY")
    except Exception:
        GEMINI_API_KEY = None

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def load_prompt():
    here = os.path.dirname(__file__)
    with open(os.path.join(here, "prompts/curate.md"), "r") as f:
        return f.read()

PROMPT = load_prompt()

@app.get("/health")
def health():
    return {"ok": True, "service": "curator-agent"}

@app.post("/inbox")
async def inbox(request: Request):
    """
    Pub/Sub push handler. Body:
    { "message": { "data": base64(JSON) } }
    Where decoded JSON:
    { "type":"topic_submitted", "weekTag":"YYYY-Www", "payload": { "submissionId": "..." } }
    """
    body = await request.json()
    msg = body.get("message", {})
    data_b64 = msg.get("data", "")
    if not data_b64:
        return {"ignored": True, "reason": "no data"}

    try:
        event = json.loads(base64.b64decode(data_b64).decode("utf-8"))
    except Exception:
        return {"ignored": True, "reason": "bad json"}

    if event.get("type") != "topic_submitted":
        return {"ignored": True}

    week_tag = event.get("weekTag")

    # 1) read all submissions for week
    subs = list(db.collection("submissions").where("weekTag", "==", week_tag).stream())
    items = [{"title": s.to_dict().get("rawTopic", ""), "notes": s.to_dict().get("notes")} for s in subs if s.to_dict().get("rawTopic")]

    if not items:
        # nothing yet
        db.collection("topics").document(week_tag).set({
            "weekTag": week_tag,
            "topics": [],
            "createdAt": now_iso(),
            "sourceCount": 0
        })
        return {"ok": True, "weekTag": week_tag, "topicsCount": 0}

    # 2) cluster with Gemini (fallback if key missing)
    topics = []
    if GEMINI_API_KEY:
        try:
            prompt = PROMPT + "\n\nSubmissions:\n" + json.dumps(items, ensure_ascii=False)
            model = genai.GenerativeModel("gemini-1.5-flash")
            resp = model.generate_content(prompt)
            text = (resp.text or "").strip()

            # --- sanitize to JSON (remove code fences / language tags) ---
            if text.startswith("```"):
                # strip outer fences
                text = text.strip()
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                # drop a first-line language hint like "json"
                if "\n" in text:
                    first, rest = text.split("\n", 1)
                    if first.lower().strip() in ("json", "javascript"):
                        text = rest.strip()

            # extract first {...} block
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                text = text[start:end+1]

            parsed = json.loads(text)
            topics = parsed.get("topics", [])
        except Exception:
            topics = []
    # 3) write curated topics
    db.collection("topics").document(week_tag).set({
        "weekTag": week_tag,
        "topics": topics,
        "createdAt": now_iso(),
        "sourceCount": len(items)
    })

    # 4) publish topics_curated
    evt = {"type": "topics_curated", "weekTag": week_tag, "payload": {"count": len(topics)}}
    publisher.publish(TOPIC_CURATED, json.dumps(evt).encode("utf-8"))

    return {"ok": True, "weekTag": week_tag, "topicsCount": len(topics)}
