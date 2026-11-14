import os
import jwt
import bcrypt
from datetime import datetime, timezone
from functools import wraps
from flask import request, jsonify
from pymongo import MongoClient
from bson import ObjectId

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "sportbridge")
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "changeme_sportbridge_secret_2026")

_client = None

def get_db():
    global _client
    if _client is None:
        try:
            client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=1000)
            client.server_info()
            _client = client
        except Exception:
            import mongomock
            _client = mongomock.MongoClient()
    return _client[DB_NAME]

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def check_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return pw == hashed

def make_token(user_id: str, role: str) -> str:
    payload = {"sub": str(user_id), "role": role}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

def require_role(*roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization", "")
            if not auth.startswith("Bearer "):
                return jsonify({"error": "Missing token"}), 401
            token = auth.split(" ", 1)[1]
            try:
                payload = verify_token(token)
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401
            if roles and payload.get("role") not in roles:
                return jsonify({"error": "Forbidden"}), 403
            request.user_id = payload["sub"]
            request.user_role = payload["role"]
            return f(*args, **kwargs)
        return wrapper
    return decorator

def serialize(doc: dict) -> dict:
    if doc is None:
        return None
    out = {}
    for k, v in doc.items():
        if k == "_id":
            out["id"] = str(v)
        elif isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, list):
            out[k] = [serialize(i) if isinstance(i, dict) else (str(i) if isinstance(i, ObjectId) else i) for i in v]
        elif isinstance(v, dict):
            out[k] = serialize(v)
        else:
            out[k] = v
    return out

def next_ref() -> str:
    db = get_db()
    year = datetime.now(timezone.utc).year
    prefix = f"SB-{year}-"
    count = db.applications.count_documents({})
    seq = count + 1
    return f"#{prefix}{str(seq).zfill(3)}"
