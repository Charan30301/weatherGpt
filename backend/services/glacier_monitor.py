import asyncio
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

import httpx

from services.glacier_service import (
    list_glaciers,
    get_glacier_satellite_history,
)

MONITOR_INTERVAL_SECONDS = 300
LAST_SATELLITE_SCENES = {}
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

HISTORY_FILE = Path("glacier_temperature_history.json")

TEMPERATURE_HISTORY = {}
GLACIER_ALERTS = []
LAST_ALERT_TIME = {}

ALERT_COOLDOWN_FILE = (
    Path(__file__).resolve().parent.parent
    / "glacier_alert_cooldowns.json"
)


def save_alert_cooldowns():
    with open(ALERT_COOLDOWN_FILE, "w") as file:
        json.dump(
            LAST_ALERT_TIME,
            file,
            indent=2,
        )


def load_alert_cooldowns():
    global LAST_ALERT_TIME

    if not ALERT_COOLDOWN_FILE.exists():
        return

    try:
        with open(
            ALERT_COOLDOWN_FILE,
            "r",
        ) as file:
            LAST_ALERT_TIME = json.load(file)

    except Exception as e:
        print(
            f"[GLACIER COOLDOWN ERROR] {e}"
        )
ALERTS_FILE = Path(__file__).resolve().parent.parent / "glacier_alerts.json"

def save_glacier_alerts():
    with open(ALERTS_FILE, "w") as file:
        json.dump(
            GLACIER_ALERTS,
            file,
            indent=2,
        )


def load_glacier_alerts():
    global GLACIER_ALERTS

    if not ALERTS_FILE.exists():
        return

    try:
        with open(ALERTS_FILE, "r") as file:
            GLACIER_ALERTS = json.load(file)

        print(
            f"[GLACIER ALERTS] "
            f"Loaded {len(GLACIER_ALERTS)} alerts."
        )

    except Exception as e:
        print(
            f"[GLACIER ALERTS ERROR] {e}"
        )

def create_glacier_alert(
    glacier,
    temperature,
    temperature_change,
):
    alert = {
        "time": datetime.now(timezone.utc).isoformat(),
        "glacier_id": glacier["id"],
        "glacier_name": glacier["name"],
        "priority": glacier.get(
            "priority",
            "UNKNOWN",
        ),
        "type": "TEMPERATURE_CHANGE",
        "temperature": temperature,
        "temperature_change": temperature_change,
        "severity": (
            "WARNING"
            if abs(temperature_change) < 4.0
            else "HIGH"
        ),
    }

    GLACIER_ALERTS.append(alert)
    save_glacier_alerts()
    # Keep only the latest 100 alerts
    if len(GLACIER_ALERTS) > 100:
        GLACIER_ALERTS.pop(0)

    print(
        f"[GLACIER ALERT CREATED] "
        f"{glacier['name']} | "
        f"severity={alert['severity']}"
    )

    return alert

def save_temperature_history():
    with open(HISTORY_FILE, "w") as file:
        json.dump(
            TEMPERATURE_HISTORY,
            file,
            indent=2,
        )


def load_temperature_history():
    global TEMPERATURE_HISTORY

    if not HISTORY_FILE.exists():
        return

    try:
        with open(HISTORY_FILE, "r") as file:
            TEMPERATURE_HISTORY = json.load(file)

        print(
            f"[GLACIER MONITOR] "
            f"Loaded temperature history for "
            f"{len(TEMPERATURE_HISTORY)} glaciers."
        )

    except Exception as e:
        print(
            f"[GLACIER HISTORY ERROR] "
            f"{e}"
        )


async def get_glacier_temperature(glacier):
    params = {
        "latitude": glacier["latitude"],
        "longitude": glacier["longitude"],
        "current": "temperature_2m",
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(
            WEATHER_URL,
            params=params,
        )

    response.raise_for_status()

    data = response.json()

    return data["current"]["temperature_2m"]


async def check_glacier(glacier):
    now = datetime.now(timezone.utc)

    print(
        f"[GLACIER MONITOR] "
        f"{now.isoformat()} | "
        f"{glacier["name"]} | "
        f"priority={glacier.get("priority", "UNKNOWN")}"
    )

    try:
        temperature = await get_glacier_temperature(
            glacier
        )

        history = TEMPERATURE_HISTORY.setdefault(
            glacier["id"],
            [],
        )

        history.append(
            {
                "time": now.isoformat(),
                "temperature": temperature,
            }
        )

        if len(history) > 100:
            history.pop(0)

        save_temperature_history()

        print(
            f"[GLACIER TEMPERATURE] "
            f"{glacier["name"]} | "
            f"{temperature}°C"
        )

        if len(history) >= 7:
            baseline_temperature = history[-7][
                "temperature"
            ]

            temperature_change = (
                temperature - baseline_temperature
            )

            print(
                f"[GLACIER 30MIN CHANGE] "
                f"{glacier["name"]} | "
                f"{temperature_change:+.1f}°C"
            )

            if abs(temperature_change) >= 2.0:
                last_alert = LAST_ALERT_TIME.get(
                    glacier["id"]
                )

                now_timestamp = now.timestamp()

                if (
                    last_alert is None
                    or now_timestamp - last_alert >= 3600
                ):
                    create_glacier_alert(
                        glacier,
                        temperature,
                        temperature_change,
                    )

                    LAST_ALERT_TIME[
                        glacier["id"]
                    ] = now_timestamp

                    save_alert_cooldowns()

        data = await get_glacier_satellite_history(
            glacier_id=glacier["id"],
            start_date=(now - timedelta(days=30)).strftime("%Y-%m-%d"),
            end_date=now.strftime("%Y-%m-%d"),
        )

        scenes = (
            data.get("scenes", [])
            if data
            else []
        )

        print(
            f"[GLACIER SATELLITE] "
            f"{glacier["name"]} | "
            f"scenes={len(scenes)}"
        )

    except Exception as e:
        print(
            f"[GLACIER MONITOR ERROR] "
            f"{glacier["name"]}: {e}"
        )


async def monitor_glaciers():
    print("========================================")
    print(" WEATHERGPT GLACIER MONITOR")
    print(" 24/7 AUTOMATIC MONITORING")
    print("========================================")

    load_temperature_history()
    load_glacier_alerts()
    load_alert_cooldowns()
    while True:
        glaciers = list_glaciers()

        for glacier in glaciers:
            await check_glacier(glacier)

        print(
            f"[GLACIER MONITOR] "
            f"Next check in "
            f"{MONITOR_INTERVAL_SECONDS} seconds."
        )

        await asyncio.sleep(
            MONITOR_INTERVAL_SECONDS
        )


if __name__ == "__main__":
    asyncio.run(monitor_glaciers())
