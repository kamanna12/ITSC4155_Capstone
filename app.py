import os;
from flask import Flask, render_template, request, redirect, url_for, session, flash
from nba_api.stats.static import players
from nba_api.stats.endpoints import commonplayerinfo, playercareerstats
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = '824ecdf1b10812100f44e23c1bace70e'
db = SQLAlchemy(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)

# Create the database
with app.app_context():
    db.create_all()

@app.route("/")
def home_page():
    return render_template("home.html")

# routing for signup
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if User.query.filter_by(username=username).first():
            flash("Username already exists", "danger")
        else:
            new_user = User(username=username, password=generate_password_hash(password))
            db.session.add(new_user)
            db.session.commit()
            flash("Account created successfully! You can now log in.", "success")
            return redirect(url_for("login"))

    return render_template("signup.html")

# routing for login
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session["user"] = username
            flash("Logged in successfully!", "success")
            return redirect(url_for("home_page"))
        else:
            flash("Invalid credentials", "danger")

    return render_template("login.html")

# routing for logout
@app.route("/logout")
def logout():
    session.pop("user", None)
    flash("You have been logged out.", "info")
    return redirect(url_for("home_page"))


@app.route("/search", methods=["GET", "POST"])
def search_page():
    if request.method == "POST":
        player_name = request.form.get("player_name", "").strip()
        if not player_name:
            return render_template("search.html", error="Please enter a player name.")
        return redirect(url_for("player_stats", name=player_name))
    
    # GET request → Just show the search form
    return render_template("search.html")

@app.route("/player")
def player_stats():
    player_name = request.args.get("name", "").strip()
    if not player_name:
        return redirect(url_for("home_page"))

    # Partial match search
    all_players = players.get_players()  # returns [{'id': int, 'full_name': str}, ...]
    matched = [p for p in all_players if player_name.lower() in p["full_name"].lower()]
    if not matched:
        return render_template("index.html", error=f"No NBA player found matching '{player_name}'")

    # Take the first match
    player_id = matched[0]["id"]

    # Basic info
    info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    row = info.common_player_info.get_dict()["data"][0]
    headers = info.common_player_info.get_dict()["headers"]

    # 1) Compute Age from BIRTHDATE
    birth_str = row[6]
    computed_age = None
    if birth_str and birth_str.count("-") == 2:
        try:
            bdate = datetime.strptime(birth_str, "%Y-%m-%d")
            today = datetime.now()
            computed_age = (
                today.year - bdate.year
                - ((today.month, today.day) < (bdate.month, bdate.day))
            )
        except ValueError:
            computed_age = None

    # 2) Build team logo URL
    #    If the player is retired / TEAM_ID=0 / no team, fallback to local
    team_id = row[16]  # might be 0 or None if no current team
    if team_id:
        # Attempt the primary L logo
        team_logo_url = f"https://cdn.nba.com/logos/nba/{team_id}/primary/L/logo.svg"
    else:
        team_logo_url = "/static/images/fallback-team.png"

    # 3) Player career stats (for the 6 charts)
    career_stats = playercareerstats.PlayerCareerStats(player_id=player_id)
    df = career_stats.get_data_frames()[0]
    df = df[df["SEASON_ID"] != "Career"]  # remove "Career" row if present

    labels = df["SEASON_ID"].tolist()
    points_per_game = df["PTS"].tolist()
    rebounds_per_game = df["REB"].tolist()
    assists_per_game = df["AST"].tolist()
    steals_per_game = df["STL"].tolist()
    blocks_per_game = df["BLK"].tolist()
    # FG_PCT is a decimal like 0.512 → multiply by 100 if you want integer percentages
    fg_percentage = (df["FG_PCT"] * 100).tolist()

    return render_template(
        "index.html",
        error=None,
        # entire player array
        player_data=row,
        computed_age=computed_age,
        # pass the prebuilt team logo URL
        team_logo_url=team_logo_url,
        # pass chart data
        chart_labels=labels,
        chart_points=points_per_game,
        chart_rebounds=rebounds_per_game,
        chart_assists=assists_per_game,
        chart_steals=steals_per_game,
        chart_blocks=blocks_per_game,
        chart_fgpct=fg_percentage
    )

if __name__ == "__main__":
    app.run(debug=True)
