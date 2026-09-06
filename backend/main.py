import asyncio
import os
from fastapi import FastAPI
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
from datetime import date, timedelta
from fastapi import Query
load_dotenv()

COPERNICUS_CLIENT_ID = os.getenv(
    "COPERNICUS_CLIENT_ID"
)

COPERNICUS_CLIENT_SECRET = os.getenv(
    "COPERNICUS_CLIENT_SECRET"
)
COPERNICUS_TOKEN_URL = (
    "https://identity.dataspace.copernicus.eu/"
    "auth/realms/CDSE/protocol/openid-connect/token"
)
COPERNICUS_PROCESS_URL = (
    "https://sh.dataspace.copernicus.eu/"
    "api/v1/process"
)

# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="WeatherGPT API",
    description="AI Weather and Disaster Intelligence API",
    version="1.0"
)
async def get_copernicus_token():
    if not COPERNICUS_CLIENT_ID:
        raise RuntimeError(
            "COPERNICUS_CLIENT_ID is missing"
        )

    if not COPERNICUS_CLIENT_SECRET:
        raise RuntimeError(
            "COPERNICUS_CLIENT_SECRET is missing"
        )

    data = {
        "grant_type": "client_credentials",
        "client_id": COPERNICUS_CLIENT_ID,
        "client_secret": COPERNICUS_CLIENT_SECRET,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            COPERNICUS_TOKEN_URL,
            data=data,
        )

        response.raise_for_status()

        result = response.json()

        return result["access_token"]

# ==========================================
# CORS
# Allows Next.js frontend to connect
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# HTTP CLIENT
# ==========================================

client = httpx.AsyncClient()


# ==========================================
# HOME API
# ==========================================

@app.get("/")
async def home():

    return {
        "message": "WeatherGPT Backend Running Successfully"
    }


# ==========================================
# CURRENT WEATHER API
# ==========================================

@app.get("/weather")
async def get_weather(
    latitude: float,
    longitude: float
):

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "weather_code,"
            "wind_speed_10m"
        ),

        "timezone": "auto"
    }


    try:

        response = await client.get(
            url,
            params=params
        )

        response.raise_for_status()

        return response.json()


    except Exception as error:

        return {
            "error": str(error)
        }


# ==========================================
# 7 DAY WEATHER FORECAST API
# ==========================================
@app.get("/forecast")
async def get_forecast(
    latitude: float,
    longitude: float
):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "wind_speed_10m"
        ),

        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "precipitation_probability_max,"
            "wind_speed_10m_max"
        ),

        "forecast_days": 7,
        "timezone": "auto",
    }

    try:
        response = await client.get(
            url,
            params=params,
            timeout=15.0
        )

        response.raise_for_status()

        data = response.json()

        if "daily" not in data:
            return {
                "error": "Forecast data unavailable for this location.",
                "latitude": latitude,
                "longitude": longitude,
                "open_meteo_response": data
            }

        return data

    except httpx.HTTPError as error:
        return {
            "error": f"Weather service error: {str(error)}"
        }

    except Exception as error:
        return {
            "error": str(error)
        }


@app.get("/farmer")
async def get_farmer_intelligence(
    latitude: float,
    longitude: float
):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation,"
            "wind_speed_10m"
        ),
        "daily": (
            "temperature_2m_max,"
            "temperature_2m_min,"
            "precipitation_sum,"
            "precipitation_probability_max"
        ),
        "forecast_days": 7,
        "timezone": "auto",
    }

    try:
        response = await client.get(
            url,
            params=params,
            timeout=10.0
        )

        response.raise_for_status()

        data = response.json()

        current = data.get("current", {})
        daily = data.get("daily", {})

        temperature = current.get(
            "temperature_2m"
        )

        humidity = current.get(
            "relative_humidity_2m"
        )

        rain = current.get(
            "precipitation"
        )

        wind = current.get(
            "wind_speed_10m"
        )

        rain_probability = daily.get(
            "precipitation_probability_max",
            []
        )

        max_rain_probability = max(
            rain_probability
        ) if rain_probability else 0

        if max_rain_probability >= 70:
            irrigation = "Low irrigation need due to expected rain."
        elif max_rain_probability >= 40:
            irrigation = "Monitor soil moisture before irrigation."
        else:
            irrigation = "Irrigation may be needed. Check soil moisture."

        if temperature is not None and temperature >= 35:
            heat_advice = "High heat risk. Protect crops from heat stress."
        elif temperature is not None and temperature >= 32:
            heat_advice = "Warm conditions. Monitor crop water needs."
        else:
            heat_advice = "Temperature conditions are generally moderate."

        if wind is not None and wind >= 30:
            wind_advice = "Strong winds possible. Secure vulnerable crops."
        else:
            wind_advice = "Wind conditions are generally manageable."

        return {
            "current": {
                "temperature": temperature,
                "humidity": humidity,
                "rain": rain,
                "wind": wind
            },
            "rain_probability": max_rain_probability,
            "advice": {
                "irrigation": irrigation,
                "heat": heat_advice,
                "wind": wind_advice
            },
            "daily": daily
        }

    except Exception as error:
        return {
            "error": str(error)
        }

@app.get("/disasters")
async def get_disaster_alerts(
    latitude: float,
    longitude: float
):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,"
            "precipitation,"
            "wind_speed_10m"
        ),
        "daily": (
            "weather_code,"
            "precipitation_probability_max,"
            "precipitation_sum,"
            "wind_speed_10m_max"
        ),
        "forecast_days": 7,
        "timezone": "auto",
    }

    try:
        response = await client.get(
            url,
            params=params,
            timeout=10.0
        )

        response.raise_for_status()

        data = response.json()

        current = data.get("current", {})
        daily = data.get("daily", {})

        alerts = []

        rain_probability = daily.get(
            "precipitation_probability_max",
            []
        )

        rain_amount = daily.get(
            "precipitation_sum",
            []
        )

        wind_values = daily.get(
            "wind_speed_10m_max",
            []
        )

        weather_codes = daily.get(
            "weather_code",
            []
        )

        if rain_probability:
            highest_rain = max(rain_probability)

            if highest_rain >= 80:
                alerts.append({
                    "type": "Heavy Rain Risk",
                    "level": "HIGH",
                    "message": (
                        "High probability of rain "
                        "during the forecast period."
                    )
                })

            elif highest_rain >= 60:
                alerts.append({
                    "type": "Rain Risk",
                    "level": "MODERATE",
                    "message": (
                        "Moderate to high probability "
                        "of rain."
                    )
                })

        if wind_values:
            highest_wind = max(wind_values)

            if highest_wind >= 40:
                alerts.append({
                    "type": "Strong Wind Risk",
                    "level": "HIGH",
                    "message": (
                        "Strong winds are possible."
                    )
                })

            elif highest_wind >= 30:
                alerts.append({
                    "type": "Wind Risk",
                    "level": "MODERATE",
                    "message": (
                        "Elevated wind speeds are possible."
                    )
                })

        thunderstorm_codes = [
            95,
            96,
            99
        ]

        if any(
            code in thunderstorm_codes
            for code in weather_codes
        ):
            alerts.append({
                "type": "Thunderstorm Risk",
                "level": "HIGH",
                "message": (
                    "Thunderstorm conditions "
                    "appear in the forecast."
                )
            })

        if not alerts:
            alerts.append({
                "type": "No Major Weather Risk",
                "level": "LOW",
                "message": (
                    "No major weather-related "
                    "risk detected from the forecast."
                )
            })

        return {
            "current": current,
            "alerts": alerts,
            "daily": daily
        }

    except Exception as error:
        return {
            "error": str(error),
            "alerts": []
        }

# ==========================================
# CHATBOT MODEL
# ==========================================

class ChatRequest(BaseModel):

    message: str


# ==========================================
# WEATHER CHATBOT API
# ==========================================

@app.post("/chat")
async def chat(request: ChatRequest):

    message = request.message.lower()


    if "rain" in message:

        answer = (
            "I can check rainfall forecasts for your "
            "current or searched location."
        )


    elif "temperature" in message:

        answer = (
            "Please provide a location and I can check "
            "the current temperature."
        )


    elif "cyclone" in message:

        answer = (
            "I can monitor cyclone and severe weather alerts."
        )


    elif "earthquake" in message:

        answer = (
            "I can provide earthquake safety information "
            "and monitor disaster alerts."
        )


    elif "weather" in message:

        answer = (
            "I can help you check current weather and "
            "7 day forecasts."
        )


    else:

        answer = (
            "I am WeatherGPT. I can help with weather forecasts, "
            "disaster alerts, travel planning and farming advice."
        )


    return {
        "response": answer
    }
@app.get("/search")
async def search_location(q: str):
    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": q,
        "format": "jsonv2",
        "addressdetails": 1,
        "limit": 10,
        "accept-language": "en",
    }

    headers = {
        "User-Agent": "WeatherGPT/1.0"
    }

    try:
        response = await client.get(
            url,
            params=params,
            headers=headers,
            timeout=10.0,
        )

        response.raise_for_status()

        results = response.json()

        locations = []

        for item in results:
            address = item.get("address", {})

            locations.append({
                "name": item.get("name") or item.get("display_name", "").split(",")[0],
                "latitude": float(item["lat"]),
                "longitude": float(item["lon"]),
                "display_name": item.get("display_name", ""),
                "type": item.get("type", ""),
                "category": item.get("category", ""),
                "country": address.get("country"),
                "state": address.get("state"),
                "district": (
                    address.get("state_district")
                    or address.get("district")
                    or address.get("county")
                ),
                "city": (
                    address.get("city")
                    or address.get("town")
                    or address.get("village")
                    or address.get("municipality")
                ),
                "suburb": address.get("suburb"),
                "neighbourhood": address.get("neighbourhood"),
            })

        return {
            "results": locations
        }

    except Exception as error:
        return {
            "error": str(error),
            "results": []
        }
@app.get("/shelters")
async def get_shelters(
    latitude: float,
    longitude: float,
    radius: int = 10000
):
    import httpx

    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"="shelter"](around:{radius},{latitude},{longitude});
      node["emergency"="shelter"](around:{radius},{latitude},{longitude});
      node["amenity"="hospital"](around:{radius},{latitude},{longitude});
      way["amenity"="shelter"](around:{radius},{latitude},{longitude});
    );
    out center tags;
    """

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://overpass-api.de/api/interpreter",
                data={"data": query},
                headers={
                    "User-Agent": "WeatherGPT/1.0"
                }
            )

        response.raise_for_status()

        return response.json()

    except Exception as e:
        print("Shelter API error:", e)

        return {
            "elements": [],
            "error": "Shelter service unavailable"
        }



@app.get("/route")
async def get_route(
    start_latitude: float,
    start_longitude: float,
    end_latitude: float,
    end_longitude: float
):
    url = (
        "https://router.project-osrm.org/"
        f"route/v1/driving/"
        f"{start_longitude},{start_latitude};"
        f"{end_longitude},{end_latitude}"
    )

    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "true",
        "alternatives": "false",
    }

    try:
        response = await client.get(
            url,
            params=params,
            timeout=15.0
        )

        response.raise_for_status()

        data = response.json()

        if data.get("code") != "Ok":
            return {
                "error": "No driving route found."
            }

        route = data["routes"][0]

        steps = []

        for leg in route.get("legs", []):
            for step in leg.get("steps", []):
                maneuver = step.get("maneuver", {})

                maneuver_type = maneuver.get(
                    "type",
                    "continue"
                )

                modifier = maneuver.get(
                    "modifier",
                    ""
                )

                distance = step.get(
                    "distance",
                    0
                )

                name = step.get(
                    "name",
                    ""
                )

                if maneuver_type == "depart":
                    instruction = "Start driving"

                elif maneuver_type == "arrive":
                    instruction = "You have arrived at your destination"

                elif maneuver_type == "turn":
                    if modifier:
                        instruction = (
                            f"Turn {modifier}"
                        )
                    else:
                        instruction = "Turn"

                elif maneuver_type == "fork":
                    if modifier:
                        instruction = (
                            f"Keep {modifier} at the fork"
                        )
                    else:
                        instruction = "Keep at the fork"

                elif maneuver_type == "merge":
                    instruction = "Merge onto the road"

                elif maneuver_type == "off ramp":
                    instruction = "Take the exit ramp"

                elif maneuver_type == "on ramp":
                    instruction = "Take the entrance ramp"

                elif maneuver_type == "roundabout":
                    instruction = "Enter the roundabout"

                elif maneuver_type == "exit roundabout":
                    if modifier:
                        instruction = (
                            f"Take the {modifier} exit from the roundabout"
                        )
                    else:
                        instruction = (
                            "Exit the roundabout"
                        )

                elif maneuver_type == "new name":
                    instruction = "Continue on the road"

                elif modifier:
                    instruction = (
                        f"Continue {modifier}"
                    )

                else:
                    instruction = "Continue on the route"

                if name:
                    instruction = (
                        f"{instruction} onto {name}"
                    )

                steps.append(
                    {
                        "instruction": instruction,
                        "distance": distance,
                        "type": maneuver_type,
                        "modifier": modifier,
                        "location": maneuver.get(
                            "location",
                            [
                                end_longitude,
                                end_latitude,
                            ]
                        ),
                    }
                )

        return {
            "distance": route["distance"],
            "duration": route["duration"],
            "geometry": route["geometry"],
            "steps": steps,
        }

    except httpx.HTTPError as error:
        return {
            "error": f"Routing service error: {str(error)}"
        }

    except Exception as error:
        return {
            "error": str(error)
        }



@app.get("/traveller")
async def get_traveller_weather(
    latitude: float,
    longitude: float
):
    weather_url = "https://api.open-meteo.com/v1/forecast"

    air_url = "https://air-quality-api.open-meteo.com/v1/air-quality"

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation,"
            "weather_code,"
            "wind_speed_10m,"
            "wind_direction_10m,"
            "visibility"
        ),

        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "apparent_temperature,"
            "precipitation_probability,"
            "precipitation,"
            "weather_code,"
            "wind_speed_10m"
        ),

        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "apparent_temperature_max,"
            "apparent_temperature_min,"
            "precipitation_probability_max,"
            "precipitation_sum,"
            "wind_speed_10m_max,"
            "sunrise,"
            "sunset"
        ),

        "past_days": 7,
        "forecast_days": 8,
        "timezone": "auto",
    }

    air_params = {
        "latitude": latitude,
        "longitude": longitude,

        "hourly": (
            "european_aqi,"
            "us_aqi,"
            "pm2_5,"
            "pm10,"
            "ozone,"
            "grass_pollen,"
            "birch_pollen,"
            "olive_pollen,"
            "ragweed_pollen,"
            "mugwort_pollen"
        ),

        "forecast_days": 4,
        "timezone": "auto",
    }

    try:
        weather_response, air_response = await asyncio.gather(
            client.get(
                weather_url,
                params=weather_params,
                timeout=15.0
            ),
            client.get(
                air_url,
                params=air_params,
                timeout=15.0
            )
        )

        weather_response.raise_for_status()
        air_response.raise_for_status()

        weather = weather_response.json()
        air = air_response.json()

        current = weather.get("current", {})
        daily = weather.get("daily", {})
        hourly = weather.get("hourly", {})
        air_hourly = air.get("hourly", {})

        # -----------------------------
        # FIND CURRENT AIR QUALITY HOUR
        # -----------------------------

        current_time = current.get("time", "")

        air_times = air_hourly.get("time", [])

        air_index = 0

        if current_time and air_times:
            current_hour = current_time[:13]

            for index, time_value in enumerate(air_times):
                if time_value[:13] == current_hour:
                    air_index = index
                    break

        def get_air_value(name):
            values = air_hourly.get(name, [])

            if not values:
                return None

            if air_index >= len(values):
                return None

            return values[air_index]

        european_aqi = get_air_value("european_aqi")
        pm25 = get_air_value("pm2_5")

        # -----------------------------
        # AIR QUALITY LABEL
        # -----------------------------

        if european_aqi is None:
            air_label = "Unavailable"
        elif european_aqi <= 20:
            air_label = "Good"
        elif european_aqi <= 40:
            air_label = "Fair"
        elif european_aqi <= 60:
            air_label = "Moderate"
        elif european_aqi <= 80:
            air_label = "Poor"
        elif european_aqi <= 100:
            air_label = "Very poor"
        else:
            air_label = "Extremely poor"

        # -----------------------------
        # POLLEN
        # -----------------------------

        pollen_values = [
            get_air_value("grass_pollen"),
            get_air_value("birch_pollen"),
            get_air_value("olive_pollen"),
            get_air_value("ragweed_pollen"),
            get_air_value("mugwort_pollen"),
        ]

        available_pollen = [
            value
            for value in pollen_values
            if value is not None
        ]

        if not available_pollen:
            pollen_level = "Information unavailable"
        else:
            maximum_pollen = max(available_pollen)

            if maximum_pollen < 10:
                pollen_level = "Very low pollen count"
            elif maximum_pollen < 50:
                pollen_level = "Low pollen count"
            elif maximum_pollen < 100:
                pollen_level = "Moderate pollen count"
            elif maximum_pollen < 200:
                pollen_level = "High pollen count"
            else:
                pollen_level = "Very high pollen count"

        # -----------------------------
        # HISTORICAL WEATHER
        # -----------------------------

        dates = daily.get("time", [])
        weather_codes = daily.get("weather_code", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        rain_probability = daily.get(
            "precipitation_probability_max",
            []
        )
        precipitation = daily.get(
            "precipitation_sum",
            []
        )
        wind_max = daily.get(
            "wind_speed_10m_max",
            []
        )

        current_date = current_time[:10]

        history_weather = []
        forecast_weather = []

        for index, date in enumerate(dates):

            day = {
                "date": date,
                "weather_code": (
                    weather_codes[index]
                    if index < len(weather_codes)
                    else None
                ),
                "temperature_max": (
                    max_temps[index]
                    if index < len(max_temps)
                    else None
                ),
                "temperature_min": (
                    min_temps[index]
                    if index < len(min_temps)
                    else None
                ),
                "rain_probability": (
                    rain_probability[index]
                    if index < len(rain_probability)
                    else 0
                ),
                "precipitation": (
                    precipitation[index]
                    if index < len(precipitation)
                    else 0
                ),
                "wind_max": (
                    wind_max[index]
                    if index < len(wind_max)
                    else None
                ),
            }

            if date < current_date:
                history_weather.append(day)
            else:
                forecast_weather.append(day)

        # Keep exactly 7 past days
        history_weather = history_weather[-7:]

        # Keep today + next 7 days
        forecast_weather = forecast_weather[:8]

        # -----------------------------
        # HISTORY SUMMARY
        # -----------------------------

        rain_days = sum(
            1
            for day in history_weather
            if day["precipitation"] >= 1
        )

        hot_days = sum(
            1
            for day in history_weather
            if day["temperature_max"] is not None
            and day["temperature_max"] >= 35
        )

        cold_days = sum(
            1
            for day in history_weather
            if day["temperature_min"] is not None
            and day["temperature_min"] <= 15
        )

        thunderstorm_days = sum(
            1
            for day in history_weather
            if day["weather_code"] in [95, 96, 99]
        )

        total_precipitation = sum(
            day["precipitation"]
            for day in history_weather
        )

        # -----------------------------
        # FUTURE CONDITIONS
        # -----------------------------

        future_rain_probability = max(
            [
                day["rain_probability"]
                for day in forecast_weather
            ],
            default=0
        )

        future_wind = max(
            [
                day["wind_max"]
                for day in forecast_weather
                if day["wind_max"] is not None
            ],
            default=0
        )

        current_temperature = current.get(
            "temperature_2m"
        )

        current_humidity = current.get(
            "relative_humidity_2m"
        )

        current_weather_code = current.get(
            "weather_code"
        )

        current_wind = current.get(
            "wind_speed_10m"
        )

        # -----------------------------
        # SMART SUGGESTIONS
        # -----------------------------

        suggestions = []

        if future_rain_probability >= 70:
            suggestions.append({
                "category": "Rain",
                "icon": "🌧️",
                "level": "HIGH",
                "title": "Carry rain protection",
                "message": (
                    "Rain is likely during your travel period. "
                    "Carry an umbrella or rain jacket."
                )
            })

        elif future_rain_probability >= 40:
            suggestions.append({
                "category": "Rain",
                "icon": "🌦️",
                "level": "MODERATE",
                "title": "Prepare for possible rain",
                "message": (
                    "There is a chance of rain. "
                    "Keep rain protection available."
                )
            })

        else:
            suggestions.append({
                "category": "Outdoor",
                "icon": "☀️",
                "level": "LOW",
                "title": "Good outdoor potential",
                "message": (
                    "Rain chances are relatively low "
                    "during the forecast period."
                )
            })

        if (
            current_temperature is not None
            and current_temperature >= 35
        ):
            suggestions.append({
                "category": "Heat",
                "icon": "🥵",
                "level": "HIGH",
                "title": "High heat",
                "message": (
                    "Stay hydrated and avoid prolonged "
                    "exposure during the hottest hours."
                )
            })

        elif (
            current_temperature is not None
            and current_temperature >= 32
        ):
            suggestions.append({
                "category": "Heat",
                "icon": "🌡️",
                "level": "MODERATE",
                "title": "Warm conditions",
                "message": (
                    "Stay hydrated and take breaks "
                    "during outdoor activities."
                )
            })

        if current_weather_code in [95, 96, 99]:
            suggestions.append({
                "category": "Safety",
                "icon": "⛈️",
                "level": "HIGH",
                "title": "Thunderstorm conditions",
                "message": (
                    "Avoid exposed outdoor areas "
                    "during thunderstorms."
                )
            })

        if thunderstorm_days > 0:
            suggestions.append({
                "category": "History",
                "icon": "⚡",
                "level": "MODERATE",
                "title": "Recent thunderstorms",
                "message": (
                    f"{thunderstorm_days} of the recent "
                    "days had thunderstorm conditions."
                )
            })

        if future_wind >= 40:
            suggestions.append({
                "category": "Wind",
                "icon": "💨",
                "level": "HIGH",
                "title": "Strong winds possible",
                "message": (
                    "Be careful with exposed outdoor "
                    "activities and two-wheel travel."
                )
            })

        elif future_wind >= 30:
            suggestions.append({
                "category": "Wind",
                "icon": "🌬️",
                "level": "MODERATE",
                "title": "Windy conditions",
                "message": (
                    "Expect noticeable winds during "
                    "parts of the forecast."
                )
            })

        if current_weather_code in [45, 48]:
            suggestions.append({
                "category": "Visibility",
                "icon": "🌫️",
                "level": "MODERATE",
                "title": "Reduced visibility",
                "message": (
                    "Fog is present. Drive carefully "
                    "and allow extra travel time."
                )
            })

        if (
            current_humidity is not None
            and current_humidity >= 80
        ):
            suggestions.append({
                "category": "Comfort",
                "icon": "💧",
                "level": "MODERATE",
                "title": "High humidity",
                "message": (
                    "It may feel warmer and less comfortable "
                    "than the temperature suggests."
                )
            })

        if rain_days >= 4:
            suggestions.append({
                "category": "History",
                "icon": "🌧️",
                "level": "MODERATE",
                "title": "Recently wet conditions",
                "message": (
                    f"{rain_days} of the last 7 days had "
                    "at least 1 mm of precipitation."
                )
            })

        if total_precipitation > 0:
            suggestions.append({
                "category": "History",
                "icon": "💦",
                "level": "LOW",
                "title": "Recent rainfall",
                "message": (
                    f"The last 7 days received about "
                    f"{total_precipitation:.1f} mm of precipitation."
                )
            })

        return {
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },

            "current": current,

            "hourly": hourly,

            "daily": daily,

            "history": {
                "days": len(history_weather),
                "weather": history_weather,
                "summary": {
                    "rain_days": rain_days,
                    "hot_days": hot_days,
                    "cold_days": cold_days,
                    "thunderstorm_days": thunderstorm_days,
                    "total_precipitation": round(
                        total_precipitation,
                        1
                    )
                }
            },

            "forecast": {
                "days": len(forecast_weather),
                "weather": forecast_weather
            },

            "air_quality": {
                "european_aqi": european_aqi,
                "label": air_label,
                "pm2_5": pm25
            },

            "pollen": {
                "level": pollen_level,
                "grass": get_air_value("grass_pollen"),
                "olive": get_air_value("olive_pollen")
            },

            "suggestions": suggestions
        }

    except httpx.HTTPError as error:
        return {
            "error": f"Weather service error: {str(error)}"
        }

    except Exception as error:
        return {
            "error": str(error)
        }


@app.get("/satellite/risk")
async def satellite_risk(
    latitude: float,
    longitude: float,
):
    try:
        token = await get_copernicus_token()

        # Small area around the user's location.
        size = 512

        delta = 0.025

        bbox = [
            longitude - delta,
            latitude - delta,
            longitude + delta,
            latitude + delta,
        ]

        evalscript = """
        //VERSION=3

        function setup() {
            return {
                input: [
                    {
                        bands: [
                            "B04",
                            "B08",
                            "SCL"
                        ]
                    }
                ],
                output: {
                    bands: 1,
                    sampleType: "FLOAT32"
                }
            };
        }

        function evaluatePixel(sample) {

            // Ignore obvious clouds/shadows.
            if (
                sample.SCL === 3 ||
                sample.SCL === 8 ||
                sample.SCL === 9 ||
                sample.SCL === 10
            ) {
                return [NaN];
            }

            var denominator =
                sample.B08 + sample.B04;

            if (denominator === 0) {
                return [NaN];
            }

            var ndvi =
                (sample.B08 - sample.B04) /
                denominator;

            return [ndvi];
        }
        """

        request_body = {
            "input": {
                "bounds": {
                    "bbox": bbox,
                    "properties": {
                        "crs":
                            "http://www.opengis.net/"
                            "def/crs/OGC/1.3/CRS84"
                    },
                },
                "data": [
                    {
                        "type": "S2L2A",
                        "dataFilter": {
                            "timeRange": {
                                "from":
                                    "2026-01-01T00:00:00Z",
                                "to":
                                    "2026-12-31T23:59:59Z",
                            },
                            "mosaickingOrder":
                                "leastCC",
                        },
                    }
                ],
            },
            "output": {
                "width": size,
                "height": size,
                "responses": [
                    {
                        "identifier": "default",
                        "format": {
                            "type": "image/tiff"
                        },
                    }
                ],
            },
            "evalscript": evalscript,
        }

        headers = {
            "Authorization":
                f"Bearer {token}",
            "Content-Type":
                "application/json",
        }

        async with httpx.AsyncClient(
            timeout=90
        ) as client:

            response = await client.post(
                COPERNICUS_PROCESS_URL,
                headers=headers,
                json=request_body,
            )

            response.raise_for_status()

            satellite_bytes = response.content

        return {
            "status": "ok",
            "latitude": latitude,
            "longitude": longitude,
            "source": "Copernicus Sentinel-2",
            "message":
                "Latest available cloud-filtered satellite observation retrieved.",
            "bytes": len(satellite_bytes),
        }

    except Exception as error:

        print(
            "Satellite risk error:",
            error
        )

        return {
            "status": "error",
            "message": str(error),
        }
@app.get("/satellite/image")
async def satellite_image(
    latitude: float,
    longitude: float,
):
    try:
        token = await get_copernicus_token()

        # Area around the user's location
        delta = 0.025

        bbox = [
            longitude - delta,
            latitude - delta,
            longitude + delta,
            latitude + delta,
        ]

        # Sentinel-2 True Color:
        # B04 = Red
        # B03 = Green
        # B02 = Blue
        #
        # SCL is used to hide obvious clouds and shadows.
        evalscript = """
        //VERSION=3

        function setup() {
            return {
                input: [
                    {
                        bands: [
                            "B02",
                            "B03",
                            "B04",
                            "SCL",
                            "dataMask"
                        ]
                    }
                ],
                output: {
                    bands: 4,
                    sampleType: "AUTO"
                }
            };
        }

        function evaluatePixel(sample) {

            // Hide cloud shadows
            // medium/high probability clouds
            // cirrus
            if (
                sample.SCL === 3 ||
                sample.SCL === 8 ||
                sample.SCL === 9 ||
                sample.SCL === 10
            ) {
                return [0, 0, 0, 0];
            }

            return [
                2.5 * sample.B04,
                2.5 * sample.B03,
                2.5 * sample.B02,
                sample.dataMask
            ];
        }
        """

        request_body = {
            "input": {
                "bounds": {
                    "bbox": bbox,
                    "properties": {
                        "crs":
                            "http://www.opengis.net/"
                            "def/crs/OGC/1.3/CRS84"
                    },
                },
                "data": [
                    {
                        "type": "S2L2A",
                        "dataFilter": {
                            "timeRange": {
                                "from":
                                    "2026-01-01T00:00:00Z",
                                "to":
                                    "2026-12-31T23:59:59Z",
                            },
                            "mosaickingOrder":
                                "leastCC",
                        },
                    }
                ],
            },
            "output": {
                "width": 512,
                "height": 512,
                "responses": [
                    {
                        "identifier": "default",
                        "format": {
                            "type": "image/png"
                        },
                    }
                ],
            },
            "evalscript": evalscript,
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(
            timeout=90
        ) as client:

            response = await client.post(
                COPERNICUS_PROCESS_URL,
                headers=headers,
                json=request_body,
            )

            response.raise_for_status()

            image_bytes = response.content

        return Response(
            content=image_bytes,
            media_type="image/png",
        )

    except Exception as error:

        print(
            "Satellite image error:",
            error
        )

        return {
            "status": "error",
            "message": str(error),
        }
# ==============================
# EMERGENCY SAFE PLACE FINDER
# ==============================

SAFE_PLACES = [
    {
        "name": "Government Relief Centre",
        "type": "Relief Centre",
        "latitude": 17.3855,
        "longitude": 78.4870,
    },
    {
        "name": "Emergency Shelter",
        "type": "Shelter",
        "latitude": 17.3900,
        "longitude": 78.4800,
    },
    {
        "name": "Emergency Hospital",
        "type": "Hospital",
        "latitude": 17.3800,
        "longitude": 78.4900,
    },
]


def calculate_distance(lat1, lon1, lat2, lon2):
    from math import radians, sin, cos, sqrt, atan2

    earth_radius = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return earth_radius * c


@app.get("/emergency/safe-place")
async def find_safe_place(
    latitude: float,
    longitude: float,
    emergency_type: str = "general",
):
    try:
        places = []

        for place in SAFE_PLACES:
            distance = calculate_distance(
                latitude,
                longitude,
                place["latitude"],
                place["longitude"],
            )

            places.append(
                {
                    **place,
                    "distance_km": round(distance, 2),
                }
            )

        places.sort(key=lambda x: x["distance_km"])

        recommended = places[0]

        return {
            "status": "ok",
            "emergency_type": emergency_type,
            "user_location": {
                "latitude": latitude,
                "longitude": longitude,
            },
            "recommended_safe_place": recommended,
            "other_safe_places": places[1:],
            "message": (
                "Nearest available safe place "
                "recommended. Verify local emergency "
                "instructions before travelling."
            ),
        }

    except Exception as error:
        print("Safe place error:", error)

        return {
            "status": "error",
            "message": str(error),
        }
