from datetime import datetime, timezone
from bson import ObjectId
from core import get_db, hash_password

def seed_all():
    db = get_db()
    
    # Check if already seeded
    if db.users.count_documents({}) > 0:
        return

    # 1. Users
    owner = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60001"),
        "email": "sarthakthamke0207@gmail.com",
        "password": hash_password("SportBridge@2026"),
        "role": "owner",
        "name": "Sarthak Thamke (Owner)"
    }
    
    athlete = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60002"),
        "email": "demo_athlete@sportbridge.in",
        "password": hash_password("Demo@1234"),
        "role": "athlete",
        "name": "Rohan Patil",
        "phone": "+91 9876543210",
        "age": "19",
        "city": "Kolhapur",
        "sport": "Football",
        "position": "Striker / Forward",
        "skill_level": "State",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "career_goal": "Play in the I-League for a professional club within 3 years",
        "achievements": "Top scorer, Kolhapur District U-19 League 2025; Maharashtra State U-19 squad"
    }
    
    manager = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60003"),
        "email": "demo_manager@sportbridge.in",
        "password": hash_password("Demo@1234"),
        "role": "manager",
        "name": "Coach Vikram Pawar",
        "phone": "+91 9822000001"
    }
    
    db.users.insert_many([owner, athlete, manager])

    # 2. Clubs
    c1 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60011"),
        "name": "Kolhapur Kings Cricket Academy",
        "city": "Kolhapur",
        "pin_code": "416008",
        "address": "Rajarampuri, Kolhapur",
        "phone": "+91 9822112233",
        "fees": "₹2,000/month",
        "sports": ["Cricket"],
        "rating": 4.3,
        "facilities": ["Turf Wickets", "Floodlights", "Bowling Machines"],
        "quote": "Coaches focus on technique and video analysis. Transparent fee structure, receipts every month.",
        "lat": 16.6913,
        "lng": 74.2433,
        "on_sportbridge": True
    }
    c2 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60012"),
        "name": "Shahu Stadium Athletics Club",
        "city": "Kolhapur",
        "pin_code": "416002",
        "address": "Chhatrapati Shahu Stadium, Kolhapur",
        "phone": "+91 9822445566",
        "fees": "₹1,500/month",
        "sports": ["Athletics"],
        "rating": 4.1,
        "facilities": ["Synthetic Track", "Gym", "Physiotherapy Center"],
        "quote": "Experienced sprint coach, my 100m timing improved a lot in 6 months.",
        "lat": 16.7020,
        "lng": 74.2380,
        "on_sportbridge": True
    }
    c3 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60013"),
        "name": "Deccan Football Academy",
        "manager_id": str(manager["_id"]),
        "city": "Pune",
        "pin_code": "411004",
        "address": "Near Deccan Gymkhana, Pune",
        "phone": "+91 9822000001",
        "fees": "₹2,500/month",
        "sports": ["Football"],
        "rating": 4.5,
        "facilities": ["FIFA Standard Turf", "Video Analysis Room", "Strength & Conditioning"],
        "quote": "Top tier scouting pathways to I-League and national divisions.",
        "lat": 18.5167,
        "lng": 73.8415,
        "on_sportbridge": True,
        "reviews": [
            {"author": "Aditya K.", "rating": 5, "text": "Excellent coaching staff, very structured sessions and regular match exposure in Pune leagues."},
            {"author": "Meera S.", "rating": 4, "text": "Turf ground is well maintained but the evening batches are overcrowded on weekdays."},
            {"author": "Rahul D.", "rating": 3, "text": "Good coaching but extra kit fees were charged mid-season without clear notice."}
        ]
    }
    c4 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60014"),
        "name": "Rajaram Cricket Stadium",
        "city": "Kolhapur",
        "pin_code": "416004",
        "address": "Shivaji University Road, Kolhapur",
        "phone": "+91 9822778899",
        "fees": "₹1,800/month",
        "sports": ["Cricket"],
        "rating": 4.2,
        "facilities": ["Cricket Ground", "Indoor Nets"],
        "quote": "Historic venue with extensive district match hosting.",
        "lat": 16.6800,
        "lng": 74.2500,
        "on_sportbridge": True
    }
    
    db.clubs.insert_many([c1, c2, c3, c4])

    # 3. Activities / Trials
    a1 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60021"),
        "club_id": str(c2["_id"]),
        "club_name": c2["name"],
        "title": "SPRINT & MIDDLE DISTANCE COACHING CAMP",
        "sport": "Athletics",
        "activity_type": "Coaching Camp",
        "date": "Sun, 22 Nov, 2026",
        "time": "06:30",
        "venue": "Chhatrapati Shahu Stadium, Kolhapur",
        "age_group": "U-19",
        "entry_fee": "₹500",
        "applied_count": 1
    }
    a2 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60022"),
        "club_id": str(c3["_id"]),
        "club_name": c3["name"],
        "title": "U-21 OPEN FOOTBALL SELECTION",
        "sport": "Football",
        "activity_type": "Open Trial",
        "date": "Sat, 28 Nov, 2026",
        "time": "07:00",
        "venue": "Deccan Gymkhana Turf, Pune",
        "age_group": "U-21",
        "entry_fee": "Free",
        "applied_count": 1
    }
    a3 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60023"),
        "club_id": str(c3["_id"]),
        "club_name": c3["name"],
        "title": "TEST_TRIAL U17",
        "sport": "Football",
        "activity_type": "Open Trial",
        "date": "Tue, 1 Dec, 2026",
        "time": "09:00",
        "venue": "Deccan Gymkhana Turf, Pune",
        "age_group": "U-17",
        "entry_fee": "Free",
        "applied_count": 1
    }
    db.activities.insert_many([a1, a2, a3])

    # 4. Applications
    app1 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60031"),
        "ref": "#SB-2026-001",
        "athlete_id": str(athlete["_id"]),
        "athlete_name": athlete["name"],
        "athlete_phone": athlete["phone"],
        "athlete_age": athlete["age"],
        "athlete_city": athlete["city"],
        "athlete_sport": athlete["sport"],
        "athlete_position": athlete["position"],
        "athlete_skill_level": athlete["skill_level"],
        "athlete_career_goal": athlete["career_goal"],
        "athlete_achievements": athlete["achievements"],
        "club_id": str(c3["_id"]),
        "club_name": c3["name"],
        "activity_id": str(a2["_id"]),
        "activity_title": "U-21 Open Football Selection",
        "applied_date": "13/11/2026",
        "status": "rejected",
        "feedback": "Not needed"
    }
    app2 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60032"),
        "ref": "#SB-2026-003",
        "athlete_id": str(athlete["_id"]),
        "athlete_name": athlete["name"],
        "athlete_phone": athlete["phone"],
        "athlete_age": athlete["age"],
        "athlete_city": athlete["city"],
        "athlete_sport": athlete["sport"],
        "athlete_position": athlete["position"],
        "athlete_skill_level": athlete["skill_level"],
        "athlete_career_goal": athlete["career_goal"],
        "athlete_achievements": athlete["achievements"],
        "club_id": str(c3["_id"]),
        "club_name": c3["name"],
        "activity_title": "Direct club approach · Pune",
        "applied_date": "13/11/2026",
        "status": "invited_for_trial",
        "trial_datetime": "2026-11-28 07:00",
        "feedback": "Please report at the Deccan turf with boots and ID proof."
    }
    app3 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60033"),
        "ref": "#SB-2026-004",
        "athlete_id": "other_athlete_sneha",
        "athlete_name": "Sneha Jadhav",
        "athlete_phone": "+91 8765432109",
        "athlete_age": "17",
        "athlete_city": "Sangli",
        "athlete_sport": "Cricket",
        "athlete_position": "Wicket-keeper Batter",
        "athlete_skill_level": "District",
        "athlete_career_goal": "Get selected for Maharashtra U-19 women's cricket team",
        "athlete_achievements": "Best wicket-keeper, Sangli District Inter-School 2025",
        "club_id": str(c3["_id"]),
        "club_name": c3["name"],
        "activity_id": str(a3["_id"]),
        "activity_title": "TEST_TRIAL U17",
        "applied_date": "14/11/2026",
        "status": "approved_shortlisted",
        "pitch_text": "TEST pitch"
    }
    app4 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60034"),
        "ref": "#SB-2026-005",
        "athlete_id": str(athlete["_id"]),
        "athlete_name": athlete["name"],
        "club_id": str(c2["_id"]),
        "club_name": c2["name"],
        "activity_title": "Sprint & Middle Distance Coaching Camp · Kolhapur",
        "applied_date": "13/11/2026",
        "status": "pending",
        "feedback": "No feedback from the manager yet."
    }
    app5 = {
        "_id": ObjectId("673752e2a1b2c3d4e5f60035"),
        "ref": "#SB-2026-006",
        "athlete_id": str(athlete["_id"]),
        "athlete_name": athlete["name"],
        "club_id": str(c4["_id"]),
        "club_name": c4["name"],
        "activity_title": "Direct club approach · Kolhapur",
        "applied_date": "13/11/2026",
        "status": "pending",
        "feedback": "No feedback from the manager yet."
    }
    db.applications.insert_many([app1, app2, app3, app4, app5])

    # 5. Feed Log (Ticker)
    feed_items = [
        {"text": "Rohan P. applied to Shahu Stadium Athletics Club", "time": "1d ago"},
        {"text": "Sneha J. invited for trial by Deccan Football Academy", "time": "1d ago"},
        {"text": "Rohan P. applied to Rajaram Cricket Stadium", "time": "1d ago"},
        {"text": "New Camp: Sangli Junior Badminton Selection Camp", "time": "1d ago"},
        {"text": "Sneha J. shortlisted by Kolhapur Kings Cricket Academy", "time": "1d ago"},
        {"text": "Rohan P. applied to Deccan Football Academy", "time": "1d ago"},
        {"text": "TEST_ITI U. applied to Silver Sports Club", "time": "1d ago"},
        {"text": "TEST_ITI U. applied to Sangli Shuttlers Badminton Academy", "time": "1d ago"}
    ]
    db.feed_log.insert_many(feed_items)

if __name__ == "__main__":
    seed_all()
    print("Database seeded successfully!")
