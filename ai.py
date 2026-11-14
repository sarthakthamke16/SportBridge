import os
import google.generativeai as genai


def compare_clubs(club_docs: list) -> str:
    """Use Gemini to compare clubs and return structured markdown advice."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    club_summaries = []
    for c in club_docs:
        name = c.get("name", "Unknown Club")
        city = c.get("city", "")
        sports = ", ".join(c.get("sports", [])) if c.get("sports") else c.get("sport", "")
        facilities = ", ".join(c.get("facilities", [])) if c.get("facilities") else "Not listed"
        fees = c.get("fees", "Not listed")
        rating = c.get("rating", "N/A")
        phone = c.get("phone", "Not listed")

        club_summaries.append(
            f"**{name}** ({city})\n"
            f"- Sports: {sports}\n"
            f"- Fees: {fees}\n"
            f"- Rating: {rating}/5\n"
            f"- Facilities: {facilities}\n"
            f"- Contact: {phone}"
        )

    clubs_text = "\n\n".join(club_summaries)

    prompt = f"""You are SportBridge AI Advisor, helping young Maharashtra athletes choose the best sports club.

Compare the following clubs on these dimensions:
1. **Coaching Quality** — infer from rating, sport specialisation, and any available info
2. **Grounds & Facilities** — based on listed facilities
3. **Fees & Affordability** — compare monthly/entry fees
4. **Transparency & Communication** — based on contact info availability and profile completeness
5. **Overall Recommendation** — which club suits different athlete goals

Here are the clubs to compare:

{clubs_text}

Provide a clear, structured markdown response with headers for each dimension, a comparison table if helpful, and a final recommendation paragraph. Be specific, practical, and encouraging for young athletes.
"""

    response = model.generate_content(prompt)
    return response.text
