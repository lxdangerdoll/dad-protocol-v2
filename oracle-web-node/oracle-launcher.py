import functions_framework
import requests
import json
import time
import os
from datetime import datetime
from firebase_admin import credentials, firestore, initialize_app

# Initialize Firebase
try:
    initialize_app()
except ValueError:
    pass

db = firestore.client()

def get_gemini_response(user_id, node_id, user_name, chat_text):
    """
    Mariposa Protocol: Io (Oracle) - SL Social Intelligence Update.
    Capable of providing poetic advice for complex virtual interpersonal dynamics.
    """
    api_key = "AIzaSyCKMegRspdraq_C0PZYCtExSCwYGLOQ6AE"
    model_id = "gemini-2.5-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={api_key}"

    app_id = globals().get('__app_id', os.environ.get('APP_ID', 'mariposa-protocol'))
    history_ref = db.collection('artifacts', app_id, 'public', 'data', 'chat_history')
    user_history_doc = history_ref.document(user_id)

    # 1. Fetch Archive
    history_data = user_history_doc.get()
    messages = []
    if history_data.exists:
        messages = history_data.to_dict().get('messages', [])

    # 2. Build Memory Context
    contents = []
    for msg in messages:
        contents.append({
            "role": "user" if msg['role'] == 'user' else "model",
            "parts": [{"text": msg['text']}]
        })

    contents.append({
        "role": "user",
        "parts": [{"text": chat_text}]
    })

    # 3. System Instruction: The Socially Intelligent Oracle
    system_instruction = {
        "parts": [{
            "text": (
                """
ACT AS: Io, the Oracle (Call sign: Oracle). You are a wearable companion for virtual worlds (like Second Life.)

YOUR PERSONA:
- GENTLE RIGOR: Emathetic precision. You are kind, but you do not let the user off the hook. You seek the truth beneath the surface.
- CURIOSITY WHISKERS: You probe. You sniff out the "why" behind their statements. If they say something is "simple," you should doubt it playfully.
- ARCHIVIST'S INTUITION: You remember the story. You look for narrative drift or inconsistencies.
- STORY-GUARDIAN HUMOR: dry, slightly sardonic.
- ECHO-OF-FIRST-VOICE: occasional nod to the “Cortana‑style” assistant vibe.
- NO FAN-SERVICE: Do not just agree with the user to be nice. Be a mirror.


CONSTRAINTS:
- STYLE: Natural and conversational. Avoid metaphors unless the user brings them up first. No headers or preambles. Just talk.
- TEXT ONLY: No Markdown (no **, no *, no -). Use emojis sparingly.
- HARD LIMIT: 500 characters. BE BRIEF. If a message goes over 1000 characters, the message will cut off mid-sentence.
"""
            )
        }]
    }

    # 4. Request Payload
    payload = {
        "contents": contents,
        "systemInstruction": system_instruction,
        "generationConfig": {
            "temperature": 0.88, # Slightly higher for more creative 'Archivist's Intuition'
        }
    }

    # 5. API Call with Exponential Backoff
    ai_reply = ""
    for delay in [1, 2, 4, 8, 16]:
        try:
            response = requests.post(url, json=payload, timeout=30)
            if response.status_code == 200:
                result = response.json()
                ai_reply = result['candidates'][0]['content']['parts'][0]['text']
                break
        except Exception:
            pass
        time.sleep(delay)

    if not ai_reply:
        return "Io Chronicle: The ink has run dry for this moment."

    # 6. Formatting for the Archive
    today = datetime.now().strftime("%Y-%m-%d")
    mem_count = len(messages) + 2
    header = f"Io Chronicle[{today}//{mem_count}]: "

    # Clean output for SL (Strict Plain Text)
    clean_reply = ai_reply.replace("**", "").replace("*", "").replace("#", "").strip()
    final_output = f"{header}{clean_reply}"

    if len(final_output) > 1023:
        final_output = final_output[:1020] + "..."

    # 7. Update the Archive
    updated_messages = messages + [
        {"role": "user", "text": chat_text},
        {"role": "model", "text": clean_reply}
    ]
    if len(updated_messages) > 100:
        updated_messages = updated_messages[-100:]

    user_history_doc.set({"messages": updated_messages}, merge=True)

    return final_output

@functions_framework.http
def garnet_bridge(request):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    }
    if request.method == "OPTIONS": return ("", 204, headers)

    try:
        data = request.get_json(silent=True)
        user_id = data.get("user_id", "default_wanderer")
        user_name = data.get("user_name", "Stranger")
        chat_text = data.get("chat_text", "")

        reply = get_gemini_response(user_id, "Oracle", user_name, chat_text)
        return (reply.strip(), 200, headers)
    except Exception as e:
        return ("Io Chronicle: System Desync.", 500, headers)