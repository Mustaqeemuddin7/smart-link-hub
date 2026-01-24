"""
Smart Link Hub - URL Shortening Service
"""
import random
import string
from typing import Optional
from sqlalchemy.orm import Session
from app.models.short_url import ShortURL
from app.models.hub import Hub


def generate_short_code(length: int = 6) -> str:
    """Generate a random short code"""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))


def get_unique_short_code(db: Session, length: int = 6, max_attempts: int = 10) -> str:
    """Generate a unique short code that doesn't exist in database"""
    for _ in range(max_attempts):
        code = generate_short_code(length)
        existing = db.query(ShortURL).filter(ShortURL.short_code == code).first()
        if not existing:
            return code
    # If all attempts fail, try longer code
    return generate_short_code(length + 2)


def create_short_url(db: Session, hub_id: str) -> ShortURL:
    """Create a short URL for a hub"""
    from uuid import UUID
    
    # Check if hub already has a short URL
    existing = db.query(ShortURL).filter(ShortURL.hub_id == UUID(hub_id)).first()
    if existing:
        return existing
    
    # Generate new short code
    short_code = get_unique_short_code(db)
    
    short_url = ShortURL(
        hub_id=UUID(hub_id),
        short_code=short_code
    )
    db.add(short_url)
    db.commit()
    db.refresh(short_url)
    
    return short_url


def get_short_url_by_code(db: Session, code: str) -> Optional[ShortURL]:
    """Get short URL by code"""
    return db.query(ShortURL).filter(
        ShortURL.short_code == code,
        ShortURL.is_active.is_(True)
    ).first()


def get_short_url_by_hub(db: Session, hub_id: str) -> Optional[ShortURL]:
    """Get short URL by hub ID"""
    from uuid import UUID
    return db.query(ShortURL).filter(ShortURL.hub_id == UUID(hub_id)).first()


def increment_click_count(db: Session, short_url: ShortURL) -> None:
    """Increment the click count for a short URL"""
    short_url.click_count += 1
    db.commit()


def delete_short_url(db: Session, hub_id: str) -> bool:
    """Delete short URL for a hub"""
    from uuid import UUID
    short_url = db.query(ShortURL).filter(ShortURL.hub_id == UUID(hub_id)).first()
    if short_url:
        db.delete(short_url)
        db.commit()
        return True
    return False


def toggle_short_url(db: Session, hub_id: str, active: bool) -> Optional[ShortURL]:
    """Enable or disable a short URL"""
    from uuid import UUID
    short_url = db.query(ShortURL).filter(ShortURL.hub_id == UUID(hub_id)).first()
    if short_url:
        short_url.is_active = active
        db.commit()
        db.refresh(short_url)
    return short_url
