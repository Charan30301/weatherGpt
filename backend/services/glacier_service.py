import math
from services.satellite_service import (
    search_sentinel_scenes,
    format_satellite_scene,
)
GLACIERS = [
    {
        "id": "south_lhonak",
        "name": "South Lhonak Glacier",
        "country": "India",
        "state": "Sikkim",
        "latitude": 27.9320,
        "longitude": 88.0700,
        "type": "Himalayan glacier and glacial-lake system",
        "priority": "CRITICAL",
    },
    {
        "id": "shako_chho",
        "name": "Shako Chho Glacial Lake System",
        "country": "India",
        "state": "Sikkim",
        "latitude": 27.9500,
        "longitude": 88.5600,
        "type": "High-risk glacial-lake system",
        "priority": "CRITICAL",
    },
    {
        "id": "khangchung",
        "name": "Khangchung Glacier/Lake System",
        "country": "India",
        "state": "Sikkim",
        "latitude": 27.8500,
        "longitude": 88.5500,
        "type": "High-risk glacial-lake system",
        "priority": "CRITICAL",
    },
    {
        "id": "gurudongmar",
        "name": "Gurudongmar Glacier/Lake System",
        "country": "India",
        "state": "Sikkim",
        "latitude": 28.0100,
        "longitude": 88.7100,
        "type": "High-risk glacial-lake system",
        "priority": "CRITICAL",
    },
    {
        "id": "ghepan",
        "name": "Ghepan Glacier/Lake System",
        "country": "India",
        "state": "Himachal Pradesh",
        "latitude": 32.7600,
        "longitude": 77.6500,
        "type": "Glacier and glacial-lake system",
        "priority": "CRITICAL",
    },
    {
        "id": "chorabari",
        "name": "Chorabari Glacier",
        "country": "India",
        "state": "Uttarakhand",
        "latitude": 30.7350,
        "longitude": 79.0660,
        "type": "Himalayan valley glacier",
        "priority": "CRITICAL",
    },
    {
        "id": "gangotri",
        "name": "Gangotri Glacier",
        "country": "India",
        "state": "Uttarakhand",
        "latitude": 30.8500,
        "longitude": 79.1500,
        "type": "Himalayan valley glacier",
        "priority": "HIGH",
    },
    {
        "id": "siachen",
        "name": "Siachen Glacier",
        "country": "India",
        "state": "Ladakh",
        "latitude": 35.4210,
        "longitude": 77.1090,
        "type": "Himalayan valley glacier",
        "priority": "HIGH",
    },
    {
        "id": "zemu",
        "name": "Zemu Glacier",
        "country": "India",
        "state": "Sikkim",
        "latitude": 27.7250,
        "longitude": 88.3500,
        "type": "Himalayan valley glacier",
        "priority": "HIGH",
    },
]
def list_glaciers():
    return GLACIERS


def get_glacier(glacier_id: str):
    for glacier in GLACIERS:
        if glacier["id"] == glacier_id:
            return glacier

    return None


def distance_km(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
):
    radius = 6371.0

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    return radius * 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a),
    )


def find_nearest_glacier(
    latitude: float,
    longitude: float,
):
    nearest = None
    nearest_distance = float("inf")

    for glacier in GLACIERS:
        distance = distance_km(
            latitude,
            longitude,
            glacier["latitude"],
            glacier["longitude"],
        )

        if distance < nearest_distance:
            nearest_distance = distance
            nearest = glacier

    if nearest is None:
        return None

    return {
        **nearest,
        "distance_km": round(
            nearest_distance,
            2,
        ),
    }

async def get_glacier_satellite_history(
    glacier_id: str,
    start_date: str,
    end_date: str,
):
    glacier = get_glacier(glacier_id)

    if not glacier:
        return None

    data = await search_sentinel_scenes(
        latitude=glacier["latitude"],
        longitude=glacier["longitude"],
        start_date=start_date,
        end_date=end_date,
        collection="sentinel-2-l2a",
    )

    scenes = [
        format_satellite_scene(scene)
        for scene in data.get("features", [])
    ]

    return {
        "glacier": glacier,
        "count": len(scenes),
        "scenes": scenes,
    }
