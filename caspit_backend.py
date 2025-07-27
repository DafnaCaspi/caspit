# Caspit Backend - Complete FastAPI System
# A comprehensive backend for schema markup validation and SEO optimization SaaS

from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
import asyncio
import aioredis
import httpx
import stripe
import uuid
import os
import re
from bs4 import BeautifulSoup
import json
from urllib.parse import urlparse
import logging
from contextlib import asynccontextmanager

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/caspit")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_...")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Initialize Stripe
stripe.api_key = STRIPE_SECRET_KEY

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Redis connection
redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global redis_client
    redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    await redis_client.close()

# FastAPI app
app = FastAPI(
    title="Caspit API",
    description="Schema markup validation and SEO optimization backend",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://caspit.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    subscription_tier = Column(String, default="free")  # free, pro, enterprise
    stripe_customer_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    analyses = relationship("SchemaAnalysis", back_populates="user")
    usage_records = relationship("UsageRecord", back_populates="user")

class SchemaAnalysis(Base):
    __tablename__ = "schema_analyses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    input_type = Column(String, nullable=False)  # "html" or "url"
    input_data = Column(Text, nullable=False)
    results = Column(JSON, nullable=False)
    schemas_found = Column(JSON, nullable=True)
    issues = Column(JSON, nullable=True)
    score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="analyses")

class UsageRecord(Base):
    __tablename__ = "usage_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # "schema_analysis", "api_call"
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="usage_records")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    stripe_subscription_id = Column(String, unique=True, nullable=False)
    status = Column(String, nullable=False)  # active, canceled, past_due
    current_period_start = Column(DateTime, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    plan_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    is_active: bool
    is_verified: bool
    subscription_tier: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class SchemaAnalysisRequest(BaseModel):
    input_type: str  # "html" or "url"
    input_data: str
    
    @validator('input_type')
    def validate_input_type(cls, v):
        if v not in ['html', 'url']:
            raise ValueError('input_type must be either "html" or "url"')
        return v

class SchemaAnalysisResponse(BaseModel):
    id: str
    schemas_found: List[Dict[str, Any]]
    issues: List[Dict[str, Any]]
    score: float
    recommendations: List[str]
    created_at: datetime

# Utility Functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

async def check_rate_limit(user: User, action: str) -> bool:
    """Check if user has exceeded rate limits based on subscription tier"""
    limits = {
        "free": {"schema_analysis": 10, "api_call": 100},
        "pro": {"schema_analysis": 1000, "api_call": 10000},
        "enterprise": {"schema_analysis": -1, "api_call": -1}  # unlimited
    }
    
    tier_limits = limits.get(user.subscription_tier, limits["free"])
    limit = tier_limits.get(action, 0)
    
    if limit == -1:  # unlimited
        return True
    
    # Check usage in Redis
    key = f"rate_limit:{user.id}:{action}:{datetime.utcnow().strftime('%Y-%m-%d')}"
    current_usage = await redis_client.get(key)
    current_usage = int(current_usage) if current_usage else 0
    
    if current_usage >= limit:
        return False
    
    # Increment usage
    await redis_client.incr(key)
    await redis_client.expire(key, 86400)  # expire after 24 hours
    return True

# Schema Analysis Engine
class SchemaAnalyzer:
    @staticmethod
    async def analyze_html(html_content: str) -> Dict[str, Any]:
        """Analyze HTML content for schema markup"""
        soup = BeautifulSoup(html_content, 'html.parser')
        schemas_found = []
        issues = []
        
        # Find JSON-LD scripts
        json_ld_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_ld_scripts:
            try:
                schema_data = json.loads(script.string)
                schemas_found.append({
                    "type": "JSON-LD",
                    "schema_type": schema_data.get('@type', 'Unknown'),
                    "data": schema_data,
                    "valid": True
                })
            except json.JSONDecodeError:
                issues.append({
                    "type": "error",
                    "message": "Invalid JSON-LD syntax found",
                    "severity": "high"
                })
        
        # Find microdata
        microdata_items = soup.find_all(attrs={"itemscope": True})
        for item in microdata_items:
            item_type = item.get('itemtype', '')
            if item_type:
                schemas_found.append({
                    "type": "Microdata",
                    "schema_type": item_type.split('/')[-1],
                    "valid": True
                })
        
        # Find RDFa
        rdfa_items = soup.find_all(attrs={"typeof": True})
        for item in rdfa_items:
            schemas_found.append({
                "type": "RDFa",
                "schema_type": item.get('typeof', 'Unknown'),
                "valid": True
            })
        
        # Generate recommendations
        recommendations = []
        if not schemas_found:
            recommendations.append("Add schema markup to improve SEO")
        if len(json_ld_scripts) == 0:
            recommendations.append("Consider using JSON-LD format for better compatibility")
        
        # Calculate score
        score = min(100, len(schemas_found) * 20 + (100 - len(issues) * 10))
        
        return {
            "schemas_found": schemas_found,
            "issues": issues,
            "score": max(0, score),
            "recommendations": recommendations
        }
    
    @staticmethod
    async def analyze_url(url: str) -> Dict[str, Any]:
        """Fetch and analyze URL for schema markup"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                return await SchemaAnalyzer.analyze_html(response.text)
        except httpx.HTTPError as e:
            return {
                "schemas_found": [],
                "issues": [{"type": "error", "message": f"Failed to fetch URL: {str(e)}", "severity": "high"}],
                "score": 0,
                "recommendations": ["Ensure the URL is accessible and returns valid HTML"]
            }

# API Endpoints

# Authentication Routes
@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create Stripe customer
    stripe_customer = stripe.Customer.create(email=user.email, name=user.full_name)
    
    # Create user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        stripe_customer_id=stripe_customer.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse.from_orm(db_user)

@app.post("/auth/login", response_model=Token)
async def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)

# Schema Analysis Routes
@app.post("/schemas/analyze", response_model=SchemaAnalysisResponse)
async def analyze_schema(
    request: SchemaAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check rate limits
    if not await check_rate_limit(current_user, "schema_analysis"):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # Perform analysis
    if request.input_type == "html":
        results = await SchemaAnalyzer.analyze_html(request.input_data)
    else:  # url
        results = await SchemaAnalyzer.analyze_url(request.input_data)
    
    # Save analysis to database
    analysis = SchemaAnalysis(
        user_id=current_user.id,
        input_type=request.input_type,
        input_data=request.input_data,
        results=results,
        schemas_found=results["schemas_found"],
        issues=results["issues"],
        score=results["score"]
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    # Record usage
    background_tasks.add_task(record_usage, current_user.id, "schema_analysis", db)
    
    return SchemaAnalysisResponse(
        id=str(analysis.id),
        schemas_found=results["schemas_found"],
        issues=results["issues"],
        score=results["score"],
        recommendations=results["recommendations"],
        created_at=analysis.created_at
    )

@app.get("/schemas/history")
async def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0
):
    analyses = db.query(SchemaAnalysis).filter(
        SchemaAnalysis.user_id == current_user.id
    ).order_by(SchemaAnalysis.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        {
            "id": str(analysis.id),
            "input_type": analysis.input_type,
            "score": analysis.score,
            "schemas_count": len(analysis.schemas_found) if analysis.schemas_found else 0,
            "issues_count": len(analysis.issues) if analysis.issues else 0,
            "created_at": analysis.created_at
        }
        for analysis in analyses
    ]

# Subscription Routes
@app.post("/subscriptions/create-checkout-session")
async def create_checkout_session(
    price_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        checkout_session = stripe.checkout.Session.create(
            customer=current_user.stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://caspit.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://caspit.com/pricing',
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/subscriptions/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event['type'] == 'customer.subscription.created':
        subscription = event['data']['object']
        # Update user subscription tier
        user = db.query(User).filter(User.stripe_customer_id == subscription['customer']).first()
        if user:
            user.subscription_tier = "pro"  # or determine from price_id
            db.commit()
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        user = db.query(User).filter(User.stripe_customer_id == subscription['customer']).first()
        if user:
            user.subscription_tier = "free"
            db.commit()
    
    return {"status": "success"}

# Analytics Routes
@app.get("/analytics/usage")
async def get_usage_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = 30
):
    start_date = datetime.utcnow() - timedelta(days=days)
    
    usage_records = db.query(UsageRecord).filter(
        UsageRecord.user_id == current_user.id,
        UsageRecord.timestamp >= start_date
    ).all()
    
    # Group by day and action
    daily_usage = {}
    for record in usage_records:
        day = record.timestamp.date().isoformat()
        if day not in daily_usage:
            daily_usage[day] = {}
        if record.action not in daily_usage[day]:
            daily_usage[day][record.action] = 0
        daily_usage[day][record.action] += 1
    
    return {
        "daily_usage": daily_usage,
        "total_analyses": len([r for r in usage_records if r.action == "schema_analysis"]),
        "subscription_tier": current_user.subscription_tier
    }

# Utility function for recording usage
def record_usage(user_id: str, action: str, db: Session):
    usage_record = UsageRecord(user_id=user_id, action=action)
    db.add(usage_record)
    db.commit()

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Rate limiting info
@app.get("/limits")
async def get_rate_limits(current_user: User = Depends(get_current_user)):
    limits = {
        "free": {"schema_analysis": 10, "api_call": 100},
        "pro": {"schema_analysis": 1000, "api_call": 10000},
        "enterprise": {"schema_analysis": -1, "api_call": -1}
    }
    
    user_limits = limits.get(current_user.subscription_tier, limits["free"])
    
    # Get current usage from Redis
    today = datetime.utcnow().strftime('%Y-%m-%d')
    analysis_key = f"rate_limit:{current_user.id}:schema_analysis:{today}"
    api_key = f"rate_limit:{current_user.id}:api_call:{today}"
    
    current_analysis_usage = await redis_client.get(analysis_key) or 0
    current_api_usage = await redis_client.get(api_key) or 0
    
    return {
        "subscription_tier": current_user.subscription_tier,
        "limits": user_limits,
        "current_usage": {
            "schema_analysis": int(current_analysis_usage),
            "api_call": int(current_api_usage)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)