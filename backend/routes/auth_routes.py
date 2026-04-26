from flask import Blueprint, request
import random
from datetime import datetime
import jwt
from config import Config
from models.user_model import create_user, get_user_by_email, verify_password, hash_password
from utils.token_utils import generate_access_token, generate_refresh_token
from utils.validators import require_fields, valid_email, valid_password
from services.db import get_db
from services.email_service import send_otp_email

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """Handles new user registration with enriched details."""
    data = request.json

    missing = require_fields(data, ["name", "email", "password", "phone", "city"])

    if missing:
        return {
            "success": False,
            "message": f"Missing fields: {missing}"
        }, 400

    if not valid_email(data["email"]):
        return {"success": False, "message": "Invalid email"}, 400

    if not valid_password(data["password"]):
        return {"success": False, "message": "Password too short"}, 400

    try:
        user_id = create_user(data)

        return {
            "success": True,
            "message": "User created",
            "data": {"user_id": user_id}
        }, 201

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }, 400

@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticates users and returns tokens."""
    data = request.json

    if not data or not data.get("email") or not data.get("password"):
        return {"error": "Email and password required"}, 400

    if verify_password(data["email"], data["password"]):

        user = get_user_by_email(data["email"])

        access_token = generate_access_token(
            user["email"],
            user.get("role", "buyer")
        )

        refresh_token = generate_refresh_token(user["email"])

        return {
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token
        }, 200

    return {"error": "Invalid credentials"}, 401


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    """Refreshes an expired access token using a refresh token."""
    token = request.json.get("refresh_token")

    if not token:
        return {"error": "Missing refresh token"}, 400

    try:
        data = jwt.decode(
            token,
            Config.JWT_SECRET,
            algorithms=["HS256"]
        )

        if data.get("type") != "refresh":
            return {"error": "Invalid token type"}, 401

        user = get_user_by_email(data["email"])

        access_token = generate_access_token(
            user["email"],
            user.get("role", "buyer")
        )

        return {"access_token": access_token}

    except:
        return {"error": "Invalid refresh token"}, 401


@auth_bp.route("/user/<email>", methods=["GET"])
def get_user(email):
    """Retrieves user profile information."""
    user = get_user_by_email(email)

    if not user:
        return {"error": "User not found"}, 404

    return user

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Generates and sends an OTP for password reset."""
    data = request.json
    email = data.get("email")
    
    db = get_db()
    users = db.users
    otps = db.otps

    user = users.find_one({"email": email})
    if not user:
        return {"message": "If an account exists for this email, you will receive reset instructions."}, 200
    
    otp = str(random.randint(100000, 999999))
    otps.update_one(
        {"email": email},
        {"$set": {"otp": otp, "created_at": datetime.utcnow()}},
        upsert=True
    )
    
    print(f"\n--- DEBUG OTP ---\nTarget: {email}\nCode: {otp}\n-----------------\n")

    success = send_otp_email(email, otp)
    if success:
        return {"message": "OTP has been sent to your email."}, 200
    else:
        return {"message": "Email sending failed. (Check backend terminal for OTP)"}, 200

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    """Verifies the OTP provided by the user."""
    data = request.json
    email = data.get("email")
    otp = data.get("otp")

    db = get_db()
    otps = db.otps

    otp_record = otps.find_one({"email": email, "otp": otp})
    if not otp_record:
        return {"error": "Invalid or expired OTP"}, 400
    
    return {"message": "OTP verified successfully"}, 200

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Resets the user's password using a verified OTP."""
    data = request.json
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    db = get_db()
    users = db.users
    otps = db.otps

    otp_record = otps.find_one({"email": email, "otp": otp})
    if not otp_record:
        return {"error": "Invalid or expired OTP"}, 400
    
    hashed_pw = hash_password(new_password)
    users.update_one(
        {"email": email},
        {"$set": {"password": hashed_pw}}
    )
    
    otps.delete_one({"email": email})
    
    return {"message": "Password reset successfully"}, 200
