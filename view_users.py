#Command to run database: python view_users.py

from app import app, db, User

def view_users():
    with app.app_context():
        users = User.query.all()
        for user in users:
            print(f"ID: {user.id}, Username: {user.username}")

if __name__ == "__main__":
    view_users()
