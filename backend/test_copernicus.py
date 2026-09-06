import os
import httpx
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("COPERNICUS_CLIENT_ID")
CLIENT_SECRET = os.getenv("COPERNICUS_CLIENT_SECRET")
TOKEN_URL = os.getenv("COPERNICUS_TOKEN_URL")

print("Client ID loaded:", bool(CLIENT_ID))
print("Client Secret loaded:", bool(CLIENT_SECRET))
print("Token URL:", TOKEN_URL)

if not CLIENT_ID:
    raise RuntimeError("COPERNICUS_CLIENT_ID is missing")

if not CLIENT_SECRET:
    raise RuntimeError("COPERNICUS_CLIENT_SECRET is missing")

data = {
    "grant_type": "client_credentials",
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
}

with httpx.Client(timeout=30) as client:
    response = client.post(TOKEN_URL, data=data)

print("HTTP Status:", response.status_code)

if response.is_success:
    result = response.json()
    print("SUCCESS! Copernicus authentication is working.")
    print("Token received:", bool(result.get("access_token")))
else:
    print("FAILED!")
    print(response.text)
