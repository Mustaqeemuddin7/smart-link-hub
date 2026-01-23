"""
Smart Link Hub - Device Detection Utility
Detects device type from User-Agent header
"""
import re
from typing import Literal

DeviceType = Literal["mobile", "tablet", "desktop"]


class DeviceDetector:
    """Simple device detection from user agent string"""
    
    # Regex patterns for device detection
    MOBILE_PATTERNS = [
        r"Android.*Mobile",
        r"iPhone",
        r"iPod",
        r"BlackBerry",
        r"Windows Phone",
        r"webOS",
        r"Mobile.*Firefox",
        r"Opera Mini",
        r"Opera Mobi",
        r"IEMobile",
    ]
    
    TABLET_PATTERNS = [
        r"iPad",
        r"Android(?!.*Mobile)",
        r"Tablet",
        r"Kindle",
        r"Silk",
        r"PlayBook",
    ]
    
    def __init__(self):
        self.mobile_regex = re.compile("|".join(self.MOBILE_PATTERNS), re.IGNORECASE)
        self.tablet_regex = re.compile("|".join(self.TABLET_PATTERNS), re.IGNORECASE)
    
    def detect(self, user_agent: str) -> DeviceType:
        """
        Detect device type from user agent string
        
        Args:
            user_agent: Browser user agent string
            
        Returns:
            'mobile', 'tablet', or 'desktop'
        """
        if not user_agent:
            return "desktop"
        
        # Check tablet first (before mobile, since some tablets match mobile patterns)
        if self.tablet_regex.search(user_agent):
            return "tablet"
        
        if self.mobile_regex.search(user_agent):
            return "mobile"
        
        return "desktop"


# Singleton instance
device_detector = DeviceDetector()


def get_device_type(user_agent: str) -> DeviceType:
    """Convenience function to detect device type"""
    return device_detector.detect(user_agent)
