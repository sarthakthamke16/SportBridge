import os
import googlemaps


def _client():
    key = os.getenv("GOOGLE_MAPS_KEY", "")
    return googlemaps.Client(key=key)


def get_nearby_clubs(lat: float, lng: float, radius: int = 5000) -> list:
    """Return nearby sports clubs from Google Maps Places API."""
    gmaps = _client()
    results = gmaps.places_nearby(
        location=(lat, lng),
        radius=radius,
        keyword="sports club",
        type="establishment",
    )

    places = []
    for place in results.get("results", []):
        geometry = place.get("geometry", {}).get("location", {})
        places.append({
            "name": place.get("name", ""),
            "address": place.get("vicinity", ""),
            "rating": place.get("rating", None),
            "lat": geometry.get("lat"),
            "lng": geometry.get("lng"),
            "place_id": place.get("place_id", ""),
        })

    return places


def get_google_reviews(place_id: str) -> dict:
    """Return place details including reviews for a given place_id."""
    gmaps = _client()
    details = gmaps.place(
        place_id=place_id,
        fields=["name", "rating", "reviews", "formatted_address", "url"],
    )
    result = details.get("result", {})

    reviews = []
    for r in result.get("reviews", []):
        reviews.append({
            "author": r.get("author_name", ""),
            "rating": r.get("rating"),
            "text": r.get("text", ""),
            "time": r.get("relative_time_description", ""),
        })

    return {
        "name": result.get("name", ""),
        "address": result.get("formatted_address", ""),
        "rating": result.get("rating"),
        "google_maps_url": result.get("url", ""),
        "reviews": reviews,
    }
