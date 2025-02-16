import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.db import db  # MongoDB connection
from bson import ObjectId

# Create a router instance
router = APIRouter()

# JWT Configuration
SECRET_KEY = "your-secret-key"  # Replace with a strong secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Token expiry time

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

### 📌 **Schemas**
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

### 📌 **Helper Functions**
def hash_password(password: str) -> str:
    """ Hashes a password before storing it. """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """ Verifies a password against its hash. """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """ Generates a JWT token. """
    to_encode = data.copy()
    
    if "sub" not in to_encode:
        raise ValueError("❌ 'sub' field missing in JWT payload!")

    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    
    logging.info(f"🔑 Creating JWT Token with: {to_encode}")  # ✅ Debugging

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/login")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "your-secret-key"  # Replace this with an actual secret key
ALGORITHM = "HS256"

# Enable logging
logging.basicConfig(level=logging.INFO)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Extracts the current user from the JWT token."""
    try:
        logging.info(f"🔑 Received Token: {token}")  # ✅ Debugging

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logging.info(f"📌 Decoded JWT Payload: {payload}")  # ✅ Debugging

        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")

        # ✅ Get user from MongoDB using email
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        # ✅ Use MongoDB `_id` directly
        user_data = {
            "id": user["_id"],  # **MongoDB ID as ObjectId**
            "username": user["username"],
            "email": user["email"]
        }
        logging.info(f"✅ Token valid, user authenticated: {user_data}")
        return user_data

    except JWTError as e:
        logging.error(f"❌ JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

### 📌 **Signup Endpoint**
@router.post("/signup", response_model=Token)
async def signup(user: UserCreate):
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user.password)
    new_user = await db.users.insert_one({"username": user.username, "email": user.email, "hashed_password": hashed_password})

    # Generate JWT Token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


### 📌 **Login Endpoint**
@router.post("/login", response_model=Token)
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email})
    if not user or not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate JWT Token
    access_token = create_access_token(data={"sub": request.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"])  # ✅ Include user_id in response
    }

@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """ Verify JWT token and return user info """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": str(user["_id"]), "username": user["username"], "email": user["email"]}

### 📌 **Get User Info (Protected)**
@router.get("/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"id": str(user["_id"]), "username": user["username"], "email": user["email"]}
