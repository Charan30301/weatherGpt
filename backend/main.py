from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx


# ==========================================
# FASTAPI APPLICATION
# ==========================================

app = FastAPI(
    title="WeatherGPT API",
    description="AI Weather and Disaster Intelligence API",
    version="1.0"
)


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

        # Make sure Open-Meteo actually returned daily data
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
