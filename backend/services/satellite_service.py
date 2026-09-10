import os
import httpx
from dotenv import load_dotenv

load_dotenv()

COPERNICUS_CLIENT_ID = os.getenv("COPERNICUS_CLIENT_ID")
COPERNICUS_CLIENT_SECRET = os.getenv("COPERNICUS_CLIENT_SECRET")

TOKEN_URL = (
    "https://identity.dataspace.copernicus.eu/auth/realms/"
    "CDSE/protocol/openid-connect/token"
)


async def get_copernicus_token():
    if not COPERNICUS_CLIENT_ID or not COPERNICUS_CLIENT_SECRET:
        raise RuntimeError(
            "Copernicus credentials are not configured."
        )

    data = {
        "client_id": COPERNICUS_CLIENT_ID,
        "client_secret": COPERNICUS_CLIENT_SECRET,
        "grant_type": "client_credentials",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            TOKEN_URL,
            data=data,
        )

    response.raise_for_status()

    token_data = response.json()

    return token_data["access_token"]
# ADD search_sentinel_scenes() HERE
async def search_sentinel_scenes(
    latitude: float,
    longitude: float,
    start_date: str,
    end_date: str,
    collection: str = "sentinel-2-l2a",
):
    token = await get_copernicus_token()

    delta = 0.1

    url = "https://stac.dataspace.copernicus.eu/v1/search"

    payload = {
        "collections": [collection],
        "datetime": (
            f"{start_date}T00:00:00Z/"
            f"{end_date}T23:59:59Z"
        ),
        "bbox": [
            longitude - delta,
            latitude - delta,
            longitude + delta,
            latitude + delta,
        ],
        "limit": 20,
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            url,
            json=payload,
            headers=headers,
        )

    if response.status_code >= 400:
        print("Copernicus response:")
        print(response.text)

    response.raise_for_status()

    result = response.json()
    scenes = result.get("features", [])

    scenes.sort(
       key=lambda scene: (
         scene.get("properties", {}).get(
            "eo:cloud_cover", 100
        )
        if scene.get("properties", {}).get(
            "eo:cloud_cover"
        ) is not None
        else 100
    )
)

    result["features"] = scenes

    return result
def format_satellite_scene(scene: dict) -> dict:
    properties = scene.get("properties", {})
    assets = scene.get("assets", {})

    thumbnail = assets.get("thumbnail", {})
    tci = assets.get("TCI_10m", {})

    thumbnail_url = thumbnail.get("href")

    if not thumbnail_url:
        thumbnail_url = (
            thumbnail.get("alternate", {})
            .get("https", {})
            .get("href")
        )

    tci_url = (
        tci.get("alternate", {})
        .get("https", {})
        .get("href")
    )

    if not tci_url:
        tci_url = tci.get("href")

    return {
        "id": scene.get("id"),
        "satellite": properties.get("platform"),
        "acquired_at": properties.get("datetime"),
        "cloud_cover": properties.get("eo:cloud_cover"),
        "ground_resolution_m": properties.get("gsd"),
        "processing_level": properties.get("processing:level"),
        "orbit": properties.get("sat:relative_orbit"),
        "geometry": scene.get("geometry"),
        "bbox": scene.get("bbox"),
        "thumbnail_url": thumbnail_url,
        "true_color_url": tci_url,
    }
if __name__ == "__main__":
    import asyncio

    async def test():
        data = await search_sentinel_scenes(
            latitude=28.6,
            longitude=77.2,
            start_date="2026-08-01",
            end_date="2026-09-01",
            collection="sentinel-2-l2a",
        )

        scenes = data.get("features", [])

        print("SENTINEL FEATURES:", len(scenes))

        if scenes:
            clean_scene = format_satellite_scene(
                scenes[0]
            )

            print("CLEAN SCENE:")
            print(clean_scene)

    asyncio.run(test())
