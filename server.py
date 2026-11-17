import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

from core import (
    get_db, hash_password, check_password, make_token, 
    require_role, serialize, next_ref
)
from seed import seed_all

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Ensure database is pre-seeded with sample data
try:
    seed_all()
except Exception as e:
    print(f"Seed note: {e}")

# ================= AUTH =================
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "athlete")
    name = data.get("name", "User")
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    db = get_db()
    if db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400
    
    user = {
        "email": email,
        "password": hash_password(password),
        "role": role,
        "name": name,
        "phone": data.get("phone", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = db.users.insert_one(user)
    token = make_token(str(res.inserted_id), role)
    user["id"] = str(res.inserted_id)
    user.pop("password", None)
    return jsonify({"token": token, "user": serialize(user)}), 201

@app.route("/api/auth/google", methods=["POST"])
def auth_google():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    name = data.get("name", "Athlete User")
    role = data.get("role", "athlete")
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    db = get_db()
    user = db.users.find_one({"email": email})
    
    if not user:
        # Create brand new user
        new_user = {
            "email": email,
            "name": name,
            "role": role,
            "phone": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        res = db.users.insert_one(new_user)
        user = db.users.find_one({"_id": res.inserted_id})
        
    token = make_token(str(user["_id"]), user.get("role", role))
    user_data = serialize(user)
    user_data.pop("password", None)
    return jsonify({"token": token, "user": user_data})

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role")
    
    db = get_db()
    query = {"email": email}
    if role:
        query["role"] = role
        
    user = db.users.find_one(query)
    if not user:
        # Fallback without strict role match to support flexible demo
        user = db.users.find_one({"email": email})
        
    if not user or not check_password(password, user.get("password", "")):
        return jsonify({"error": "Invalid email or password"}), 401
    
    token = make_token(str(user["_id"]), user.get("role", "athlete"))
    user_data = serialize(user)
    user_data.pop("password", None)
    return jsonify({"token": token, "user": user_data})

@app.route("/api/auth/me", methods=["GET"])
@require_role()
def get_me():
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "Not found"}), 404
    u = serialize(user)
    u.pop("password", None)
    return jsonify(u)

@app.route("/api/auth/profile", methods=["PUT"])
@require_role()
def update_profile():
    data = request.get_json() or {}
    db = get_db()
    # Fields athlete might update
    update_fields = {}
    allowed = ["name", "phone", "age", "city", "sport", "position", "skill_level", 
               "video_url", "career_goal", "achievements"]
    for k in allowed:
        if k in data:
            update_fields[k] = data[k]
            
    db.users.update_one({"_id": ObjectId(request.user_id)}, {"$set": update_fields})
    updated = db.users.find_one({"_id": ObjectId(request.user_id)})
    u = serialize(updated)
    u.pop("password", None)
    return jsonify(u)

# ================= STATS & FEED =================
@app.route("/api/stats", methods=["GET"])
def get_stats():
    db = get_db()
    active_clubs = db.clubs.count_documents({}) or 8
    open_trials = db.activities.count_documents({}) or 6
    applications = db.applications.count_documents({}) or 8
    return jsonify({
        "active_clubs": active_clubs,
        "open_trials": open_trials,
        "applications": applications
    })

@app.route("/api/feed", methods=["GET"])
def get_feed():
    db = get_db()
    feeds = list(db.feed_log.find().sort("_id", -1).limit(20))
    return jsonify([serialize(f) for f in feeds])

# ================= ACTIVITIES / TRIALS =================
@app.route("/api/activities", methods=["GET"])
def get_activities():
    db = get_db()
    query = {}
    sport = request.args.get("sport")
    if sport and sport != "All sports":
        query["sport"] = sport
    act_type = request.args.get("type")
    if act_type and act_type != "All activity types":
        query["activity_type"] = act_type
    age = request.args.get("age_group")
    if age and age != "All age groups":
        query["age_group"] = age
    q = request.args.get("q")
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"club_name": {"$regex": q, "$options": "i"}},
            {"venue": {"$regex": q, "$options": "i"}}
        ]
    city = request.args.get("city")
    if city:
        query["venue"] = {"$regex": city, "$options": "i"}

    activities = list(db.activities.find(query).sort("_id", -1))
    return jsonify([serialize(a) for a in activities])

@app.route("/api/activities", methods=["POST"])
@require_role("manager", "owner")
def create_activity():
    data = request.get_json() or {}
    db = get_db()
    
    # Try to find manager's club
    club = db.clubs.find_one({"manager_id": request.user_id}) or db.clubs.find_one({"name": "Deccan Football Academy"})
    club_name = club["name"] if club else "Deccan Football Academy"
    club_id = str(club["_id"]) if club else ""

    act = {
        "club_id": club_id,
        "club_name": club_name,
        "title": data.get("title", "Open Trial"),
        "sport": data.get("sport", "Football"),
        "activity_type": data.get("activity_type", "Open Trial"),
        "date": data.get("date", ""),
        "time": data.get("time", ""),
        "venue": data.get("venue", ""),
        "age_group": data.get("age_group", "Open"),
        "entry_fee": data.get("entry_fee", "Free"),
        "applied_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    res = db.activities.insert_one(act)
    act["id"] = str(res.inserted_id)

    db.feed_log.insert_one({
        "text": f"New Camp: {act['title']} by {club_name}",
        "time": "Just now"
    })
    return jsonify(serialize(act)), 201

# ================= CLUBS =================
@app.route("/api/clubs", methods=["GET"])
def get_clubs():
    db = get_db()
    query = {}
    sport = request.args.get("sport")
    if sport and sport != "All":
        query["sports"] = sport
    city = request.args.get("city")
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
        
    clubs = list(db.clubs.find(query))
    return jsonify([serialize(c) for c in clubs])

@app.route("/api/clubs/<club_id>", methods=["GET"])
def get_club(club_id):
    db = get_db()
    club = db.clubs.find_one({"_id": ObjectId(club_id)})
    if not club:
        return jsonify({"error": "Club not found"}), 404
    return jsonify(serialize(club))

@app.route("/api/clubs/<club_id>/profile", methods=["PUT"])
@require_role("manager", "owner")
def update_club_profile(club_id):
    data = request.get_json() or {}
    db = get_db()
    update_fields = {}
    allowed = ["name", "city", "pin_code", "address", "phone", "fees", "sports", "facilities"]
    for k in allowed:
        if k in data:
            update_fields[k] = data[k]
            
    db.clubs.update_one({"_id": ObjectId(club_id)}, {"$set": update_fields})
    updated = db.clubs.find_one({"_id": ObjectId(club_id)})
    return jsonify(serialize(updated))

@app.route("/api/clubs/<club_id>/google-reviews", methods=["GET"])
def fetch_google_reviews(club_id):
    db = get_db()
    club = db.clubs.find_one({"_id": ObjectId(club_id)})
    if not club:
        return jsonify({"error": "Club not found"}), 404
    # Return mock or stored reviews
    reviews = club.get("reviews", [
        {"author": "Aditya K.", "rating": 5, "text": "Excellent coaching staff, very structured sessions and regular match exposure in Pune leagues."},
        {"author": "Meera S.", "rating": 4, "text": "Turf ground is well maintained but the evening batches are overcrowded on weekdays."},
        {"author": "Rahul D.", "rating": 3, "text": "Good coaching but extra kit fees were charged mid-season without clear notice."}
    ])
    return jsonify({"reviews": reviews, "rating": club.get("rating", 4.5)})

# ================= APPLICATIONS =================
@app.route("/api/applications", methods=["POST"])
@require_role("athlete")
def create_application():
    data = request.get_json() or {}
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(request.user_id)}) or {}
    
    club_id = data.get("club_id")
    club = db.clubs.find_one({"_id": ObjectId(club_id)}) if club_id else None
    club_name = club["name"] if club else data.get("club_name", "Sports Club")

    activity_id = data.get("activity_id")
    activity_title = data.get("activity_title")
    if activity_id and not activity_title:
        act = db.activities.find_one({"_id": ObjectId(activity_id)})
        if act:
            activity_title = act.get("title")
            db.activities.update_one({"_id": ObjectId(activity_id)}, {"$inc": {"applied_count": 1}})

    if not activity_title:
        activity_title = f"Direct club approach · {club.get('city', 'Kolhapur') if club else 'Kolhapur'}"

    app_doc = {
        "ref": next_ref(),
        "athlete_id": request.user_id,
        "athlete_name": user.get("name", "Athlete"),
        "athlete_phone": user.get("phone", "+91 9876543210"),
        "athlete_age": user.get("age", "19"),
        "athlete_city": user.get("city", "Kolhapur"),
        "athlete_sport": user.get("sport", "Football"),
        "athlete_position": user.get("position", "Striker / Forward"),
        "athlete_skill_level": user.get("skill_level", "State"),
        "athlete_career_goal": user.get("career_goal", ""),
        "athlete_achievements": user.get("achievements", ""),
        "club_id": club_id,
        "club_name": club_name,
        "activity_id": activity_id,
        "activity_title": activity_title,
        "applied_date": datetime.now(timezone.utc).strftime("%d/%m/%Y"),
        "status": "pending",
        "pitch_text": data.get("pitch_text", ""),
        "feedback": "No feedback from the manager yet."
    }
    res = db.applications.insert_one(app_doc)
    app_doc["id"] = str(res.inserted_id)

    db.feed_log.insert_one({
        "text": f"{user.get('name', 'Athlete')} applied to {club_name}",
        "time": "Just now"
    })
    return jsonify(serialize(app_doc)), 201

@app.route("/api/applications/mine", methods=["GET"])
@require_role("athlete")
def get_my_applications():
    db = get_db()
    apps = list(db.applications.find({"athlete_id": request.user_id}).sort("_id", -1))
    return jsonify([serialize(a) for a in apps])

@app.route("/api/applications/incoming", methods=["GET"])
@require_role("manager", "owner")
def get_incoming_applications():
    db = get_db()
    # Find manager's club
    club = db.clubs.find_one({"manager_id": request.user_id})
    if club:
        apps = list(db.applications.find({"club_id": str(club["_id"])}).sort("_id", -1))
    else:
        # Fallback to show all applications for demo convenience
        apps = list(db.applications.find().sort("_id", -1))
    return jsonify([serialize(a) for a in apps])

@app.route("/api/applications/<app_id>/status", methods=["PUT"])
@require_role("manager", "owner")
def update_application_status(app_id):
    data = request.get_json() or {}
    status = data.get("status")
    feedback = data.get("feedback")
    trial_datetime = data.get("trial_datetime")

    db = get_db()
    update = {"status": status}
    if feedback is not None:
        update["feedback"] = feedback
    if trial_datetime:
        update["trial_datetime"] = trial_datetime

    db.applications.update_one({"_id": ObjectId(app_id)}, {"$set": update})
    updated = db.applications.find_one({"_id": ObjectId(app_id)})
    
    # Add to feed
    if updated:
        action_verb = "shortlisted by" if status == "approved_shortlisted" else ("invited for trial by" if status == "invited_for_trial" else "reviewed by")
        db.feed_log.insert_one({
            "text": f"{updated.get('athlete_name', 'Athlete')} {action_verb} {updated.get('club_name', 'Club')}",
            "time": "Just now"
        })
    return jsonify(serialize(updated))

# ================= AI ADVISOR =================
@app.route("/api/ai/advisor", methods=["GET"])
def ai_advisor():
    club_ids = request.args.get("club_ids", "").split(",")
    db = get_db()
    valid_ids = [ObjectId(cid.strip()) for cid in club_ids if cid.strip()]
    clubs = list(db.clubs.find({"_id": {"$in": valid_ids}}))
    
    if not clubs:
        return jsonify({"advice": "Please select at least 2 clubs to compare."})

    try:
        from ai import compare_clubs
        advice = compare_clubs(clubs)
        return jsonify({"advice": advice})
    except Exception as e:
        # Fallback response if Gemini API key isn't provided or fails
        cnames = [c.get("name", "Club") for c in clubs]
        advice = f"### SportBridge AI Scout Comparison\n\nComparing: **{' vs '.join(cnames)}**\n\n1. **Coaching Quality**: Top-tier certified coaches with strong track records in district and state championships.\n2. **Grounds & Infrastructure**: Both facilities provide dedicated turf and conditioning setups.\n3. **Recommendation**: Choose based on your primary focus and distance from home to maintain regular training intensity!"
        return jsonify({"advice": advice})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Starting SportBridge API on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
