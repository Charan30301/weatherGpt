import math


def distance_km(
    lat1,
    lon1,
    lat2,
    lon2,
):
    earth_radius_km = 6371.0

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_rad)
        * math.cos(lat2_rad)
        * math.sin(dlon / 2) ** 2
    )

    return (
        earth_radius_km
        * 2
        * math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a),
        )
    )


def is_user_near_glacier(
    user_latitude,
    user_longitude,
    glacier,
    radius_km=10,
):
    distance = distance_km(
        user_latitude,
        user_longitude,
        glacier["latitude"],
        glacier["longitude"],
    )

    return {
        "near_glacier": distance <= radius_km,
        "distance_km": round(distance, 2),
        "glacier_id": glacier["id"],
        "glacier_name": glacier["name"],
    }

