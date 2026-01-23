"""
Smart Link Hub - Geolocation Service
Detects visitor country from IP address using free IP-API
"""
import httpx
from functools import lru_cache
from typing import Optional


class GeoService:
    """Service for IP-based geolocation"""
    
    API_URL = "http://ip-api.com/json/{ip}?fields=countryCode,status"
    TIMEOUT = 2.0  # seconds
    
    # Cache for IP lookups (in-memory, use Redis for production)
    _cache: dict = {}
    
    def get_country(self, ip: str) -> Optional[str]:
        """
        Get ISO country code from IP address
        Uses free ip-api.com service (limited to 45 requests/minute)
        
        Args:
            ip: IP address to lookup
            
        Returns:
            2-letter ISO country code or None
        """
        if not ip:
            return None
            
        # Skip private/local IPs
        if ip.startswith(("127.", "192.168.", "10.", "172.", "0.", "localhost")):
            return None
        
        # Check cache first
        if ip in self._cache:
            return self._cache[ip]
        
        try:
            with httpx.Client(timeout=self.TIMEOUT) as client:
                response = client.get(self.API_URL.format(ip=ip))
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "success":
                        country = data.get("countryCode")
                        # Cache the result
                        self._cache[ip] = country
                        # Limit cache size
                        if len(self._cache) > 10000:
                            # Remove oldest entries (simple FIFO)
                            keys = list(self._cache.keys())[:5000]
                            for k in keys:
                                del self._cache[k]
                        return country
        except Exception:
            pass  # Fail silently, location is optional
        
        return None
    
    def get_country_safe(self, ip: str, default: str = "US") -> str:
        """
        Get country with fallback default
        
        Args:
            ip: IP address to lookup
            default: Default country code if lookup fails
            
        Returns:
            2-letter ISO country code
        """
        country = self.get_country(ip)
        return country if country else default


# Singleton instance
geo_service = GeoService()


def get_country_from_ip(ip: str) -> Optional[str]:
    """Convenience function to get country from IP"""
    return geo_service.get_country(ip)
