# tests/test_search_and_autocomplete.py
import pytest
from urllib.parse import quote_plus
from app import app, ALL_PLAYERS

@pytest.fixture
def client():
    app.config['TESTING'] = True
    return app.test_client()

@pytest.fixture
def logged_in_client(client):
    # Bypass @login_required by faking a session user
    with client.session_transaction() as sess:
        sess['user'] = 'testuser'
    return client

def test_search_page_get(logged_in_client):
    rv = logged_in_client.get('/search')
    assert rv.status_code == 200
    assert b"Search for an NBA Player" in rv.data

def test_search_empty_input(logged_in_client):
    rv = logged_in_client.post('/search', data={'player_name': ''})
    assert rv.status_code == 200
    assert b"Please enter a player name." in rv.data

def test_autocomplete_and_valid_search(logged_in_client, monkeypatch):
    fake_players = [
        {'full_name': 'Stephen Curry'},
        {'full_name': 'Stephon Marbury'},
        {'full_name': 'Klay Thompson'},
    ]
    monkeypatch.setattr('app.ALL_PLAYERS', fake_players)

    rv_auto = logged_in_client.get('/autocomplete?q=ste')
    assert rv_auto.status_code == 200
    names = [p['full_name'] for p in rv_auto.get_json()]
    assert names == ['Stephen Curry', 'Stephon Marbury']

    rv_search = logged_in_client.post(
        '/search',
        data={'player_name': 'Stephen Curry'}
    )
    assert rv_search.status_code == 302
    assert '/player?name=Stephen+Curry' in rv_search.headers['Location']

def test_sql_injection_login_prevent_bypass(client):
    # Attempt classic "' OR '1'='1" trick on login
    payload = "' OR '1'='1"
    rv = client.post('/login', data={'username': payload, 'password': payload})
    # Should not log in or crash—just show invalid credentials
    assert rv.status_code == 200
    assert b"Invalid credentials" in rv.data

def test_xss_protection_in_player_error(logged_in_client):
    """
    Ensure that a script‐tag payload in the 'name' param
    is escaped, not rendered, in the HTML.
    """
    payload = "<script>alert('xss')</script>"
    escaped = "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"

    rv = logged_in_client.get(f"/player?name={quote_plus(payload)}")
    html = rv.data.decode('utf-8')

    # 1) The raw payload must NOT appear
    assert payload not in html

    # 2) The *exact* Jinja2-escaped version *must* appear
    assert escaped in html


def test_html_injection_in_error_message(logged_in_client):
    # Inject an HTML tag into the name param
    payload = "<b>evil</b>"
    rv = logged_in_client.get(f"/player?name={quote_plus(payload)}")
    html = rv.data.decode('utf-8')
    assert payload not in html
    assert "&lt;b&gt;evil&lt;/b&gt;" in html

def test_command_injection_attempt_search(logged_in_client):
    payload = "`rm -rf /`"
    rv = logged_in_client.post('/search', data={'player_name': payload})
    assert rv.status_code == 302

    location = rv.headers['Location']
    # 1) No raw backticks in the URL
    assert "`" not in location

    # 2) The backticks ARE percent‐encoded (%60)
    assert "%60rm" in location

    # 3) The slash remains unencoded (Werkzeug treats '/' as safe)
    #    so we expect "...%2F%60" NOT necessarily; instead we see "/"
    assert location.startswith("/player?name=%60")
