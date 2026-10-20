import os
import uuid
import datetime
import logging
import bcrypt
import jwt
from typing import Optional, Dict, Any
from backend.app.core.db import get_database, mongo_db
from backend.app.models.schemas import UserRegister, UserLogin, UserResponse, AuthResponse

logger = logging.getLogger("safepulse.auth")

_DEFAULT_DEV_SECRET = "safepulse_dev_insecure_secret_change_me"
JWT_SECRET = os.getenv("JWT_SECRET", _DEFAULT_DEV_SECRET)
JWT_ALGORITHM = "HS256"

if os.getenv("ENV") == "production" and (not os.getenv("JWT_SECRET") or JWT_SECRET == _DEFAULT_DEV_SECRET):
    logger.warning("⚠️ [SECURITY WARNING] 프로덕션 환경에서 기본 JWT_SECRET이 사용 중입니다. .env에서 안전한 난수 키로 교체하세요.")

# 로컬 메모리 폴백 스토어
_MEMORY_USERS: Dict[str, Dict[str, Any]] = {}

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception:
        return None

async def register_user(data: UserRegister) -> AuthResponse:
    db = get_database()
    email_clean = data.email.strip().lower()

    # 1. 중복 체크
    if mongo_db.is_connected and db is not None:
        existing = await db.users.find_one({"email": email_clean})
        if existing:
            raise ValueError("이미 등록된 이메일 주소입니다.")
    else:
        if email_clean in _MEMORY_USERS:
            raise ValueError("이미 등록된 이메일 주소입니다.")

    # 2. 신규 유저 생성
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(data.password)
    user_doc = {
        "user_id": user_id,
        "email": email_clean,
        "password": hashed_pw,
        "name": data.name.strip(),
        "company_name": data.company_name.strip(),
        "has_completed_assessment": False,
        "active_session_id": None,
        "created_at": datetime.datetime.utcnow()
    }

    if mongo_db.is_connected and db is not None:
        await db.users.insert_one(user_doc)
    else:
        _MEMORY_USERS[email_clean] = user_doc

    token = create_jwt_token(user_id, email_clean)
    user_res = UserResponse(
        id=user_id,
        email=email_clean,
        name=user_doc["name"],
        company_name=user_doc["company_name"],
        has_completed_assessment=False,
        active_session_id=None
    )

    return AuthResponse(access_token=token, user=user_res)

async def login_user(data: UserLogin) -> AuthResponse:
    db = get_database()
    email_clean = data.email.strip().lower()

    user_doc = None
    if mongo_db.is_connected and db is not None:
        user_doc = await db.users.find_one({"email": email_clean})
    else:
        user_doc = _MEMORY_USERS.get(email_clean)

    if not user_doc or not verify_password(data.password, user_doc["password"]):
        raise ValueError("이메일 또는 비밀번호가 일치하지 않습니다.")

    token = create_jwt_token(user_doc["user_id"], user_doc["email"])
    user_res = UserResponse(
        id=user_doc["user_id"],
        email=user_doc["email"],
        name=user_doc["name"],
        company_name=user_doc["company_name"],
        has_completed_assessment=user_doc.get("has_completed_assessment", False),
        active_session_id=user_doc.get("active_session_id")
    )

    return AuthResponse(access_token=token, user=user_res)

async def get_current_user(token: str) -> Optional[UserResponse]:
    payload = decode_jwt_token(token)
    if not payload:
        return None

    user_id = payload.get("sub")
    db = get_database()

    user_doc = None
    if mongo_db.is_connected and db is not None:
        user_doc = await db.users.find_one({"user_id": user_id})
    else:
        for u in _MEMORY_USERS.values():
            if u["user_id"] == user_id:
                user_doc = u
                break

    if not user_doc:
        return None

    return UserResponse(
        id=user_doc["user_id"],
        email=user_doc["email"],
        name=user_doc["name"],
        company_name=user_doc["company_name"],
        has_completed_assessment=user_doc.get("has_completed_assessment", False),
        active_session_id=user_doc.get("active_session_id")
    )
