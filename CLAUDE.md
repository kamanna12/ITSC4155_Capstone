# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run the app (debug mode, localhost)
python app.py

# Run all tests
pytest

# Run tests with coverage
pytest --cov=.

# Run a single test file
pytest tests/test_search_and_autocomplete.py

# View registered users in the database
python view_users.py
```

## Environment Setup

Requires a `.env` file in the project root:
```
OPENAI_API_KEY=sk-...
SECRET_KEY=your-secret-key
```

The SQLite database (`users.db`) is auto-created on first run via Flask-SQLAlchemy.

## Architecture

Single-file Flask app (`app.py`) with Jinja2 templates, SQLite for user auth, and two external APIs.

**Data flow:**
- Users authenticate via SQLite (`User` model with hashed passwords)
- Protected routes (`@login_required`) fetch live data from `nba_api` on each request — no caching
- Player stats use the 5 most recent playoff games per player
- The chatbot (`/chat`) proxies messages to OpenAI GPT-3.5-turbo with a DribbleData system prompt
- Autocomplete (`/autocomplete`) filters from `ALL_PLAYERS` loaded at app startup

**Key files:**
- `app.py` — all routes, DB model, `@login_required` decorator, NBA API calls
- `app_utils.py` — `calculate_age()` and `get_team_logo_url()` helpers
- `static/js/chat.js` — chatbot UI, message history, toggle behavior
- `static/js/autocomplete.js` — shared autocomplete logic wired to 3 inputs (search, compare player 1, compare player 2)
- `tests/test_search_and_autocomplete.py` — 9 tests covering security (SQLi, XSS, HTML injection, command injection) and functionality

**Route summary:**

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | No | Home page with carousel |
| `/signup`, `/login`, `/logout` | No | Auth |
| `/search`, `/player` | Yes | Single player lookup + stats charts |
| `/compare`, `/compare_results` | Yes | Side-by-side player comparison |
| `/autocomplete` | Yes | JSON player name suggestions |
| `/chat`, `/chat_page` | No | OpenAI chatbot |

**Frontend:** TailwindCSS + Chart.js for stats visualization + Slick Carousel on home page. Charts support modal expansion. Stats are passed from Flask routes as JSON embedded in template variables.

**CI:** GitHub Actions (`.github/workflows/ci.yml`) runs pytest on Python 3.11 for every push.
