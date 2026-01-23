"""
Smart Link Hub - Authentication Service
Handles user registration, login, and token management
"""
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token
from app.utils.security import (
    hash_password, verify_password, create_tokens, verify_refresh_token
)


class AuthService:
    """Service for authentication operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def register(self, user_data: UserCreate) -> Tuple[Optional[User], str]:
        """
        Register a new user
        
        Returns:
            Tuple of (user, error_message)
        """
        # Check if email already exists
        existing = self.db.query(User).filter(User.email == user_data.email).first()
        if existing:
            return None, "Email already registered"
        
        # Create user
        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            name=user_data.name
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user, ""
    
    def login(self, credentials: UserLogin) -> Tuple[Optional[Token], str]:
        """
        Authenticate user and return tokens
        
        Returns:
            Tuple of (tokens, error_message)
        """
        # Find user
        user = self.db.query(User).filter(User.email == credentials.email).first()
        if not user:
            return None, "Invalid email or password"
        
        # Verify password
        if not verify_password(credentials.password, user.password_hash):
            return None, "Invalid email or password"
        
        # Create tokens
        access_token, refresh_token = create_tokens(user.id)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token
        ), ""
    
    def refresh_tokens(self, refresh_token: str) -> Tuple[Optional[Token], str]:
        """
        Refresh access token using refresh token
        
        Returns:
            Tuple of (new_tokens, error_message)
        """
        user_id = verify_refresh_token(refresh_token)
        if not user_id:
            return None, "Invalid or expired refresh token"
        
        # Verify user still exists
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None, "User not found"
        
        # Create new tokens
        access_token, new_refresh_token = create_tokens(user.id)
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token
        ), ""
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            return self.db.query(User).filter(User.id == user_id).first()
        except Exception:
            return None
