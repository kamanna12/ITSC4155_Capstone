# app_utils.py
from datetime import datetime

def compute_age(birth_str: str) -> int | None:
    if not birth_str or birth_str.count("-") != 2:
        return None
    bdate = datetime.strptime(birth_str, "%Y-%m-%d")
    today = datetime.now()
    return today.year - bdate.year - ((today.month, today.day) < (bdate.month, bdate.day))

def team_logo_url(team_id: int|None) -> str:
    if team_id:
        return f"https://cdn.nba.com/logos/nba/{team_id}/primary/L/logo.svg"
    return "/static/images/fallback-team.png"
