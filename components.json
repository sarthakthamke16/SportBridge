# SportBridge security audit verification + core regression (iteration 2)
import os
import uuid
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
DEMO_PW = "Demo@1234"
OWNER = ("sarthakthamke0207@gmail.com", "SportBridge@2026")
PW = "TestPass@123"
mdb = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]

CREATED_USERS, CREATED_APPS, CREATED_ACTS, CREATED_CLUBS = [], [], [], []


def H(t):
    return {"Authorization": f"Bearer {t}"}


def login(email, role, pw=DEMO_PW):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw, "role": role})
    assert r.status_code == 200, r.text
    return r.json()["token"]
