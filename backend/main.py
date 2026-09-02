from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx


app = FastAPI(
    title="WeatherGPT API",
    description="AI Weather and Disaster Intelligence API",
    version="1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- HOME ----------------

@app.get("/")
async def home():
    return {
        "message": "WeatherGPT API is running"
    }


# ---------------- WEATHER API ----------------

@app.get("/weather")
async def get_weather(latitude: float, longitude: float):

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitude}"
        f"&longitude={longitude}"
        "&current=temperature_2m,relative_humidity_2m,"
        "apparent_temperature,precipitation,rain,"
        "weather_code,wind_speed_10m"
        "&daily=weather_code,temperature_2m_max,"
        "temperature_2m_min,precipitation_probability_max"
        "&timezone=auto"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    return response.json()


# ---------------- LOCATION SEARCH ----------------

@app.get("/search-location")
async def search_location(query: str):

    url = (
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?name={query}&count=5&language=en&format=json"
    )

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

    return response.json()


# ---------------- CHATBOT ----------------

class ChatRequest(BaseModel):
    message: str


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

    else:
        answer = (
            "I am WeatherGPT. I can help with weather forecasts, "
            "disaster alerts, travel planning and farming advice."
        )

    return {
        "response": answer
    }
