"""
Smart Link Hub - Schemas Package
"""
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token, TokenPayload
)
from app.schemas.hub import (
    HubCreate, HubUpdate, HubResponse, HubListResponse, 
    HubPublicResponse, ProcessedLinkResponse, ThemeConfig
)
from app.schemas.link import (
    LinkCreate, LinkUpdate, LinkResponse, LinkListResponse, LinkReorderRequest
)
from app.schemas.rule import (
    RuleCreate, RuleUpdate, RuleResponse, RuleListResponse, RulePresets
)
from app.schemas.analytics import (
    AnalyticsSummary, LinkPerformance, LinkPerformanceList,
    DailyStats, DailyStatsResponse, TopLinksResponse
)

__all__ = [
    # User
    "UserCreate", "UserLogin", "UserResponse", "Token", "TokenPayload",
    # Hub
    "HubCreate", "HubUpdate", "HubResponse", "HubListResponse",
    "HubPublicResponse", "ProcessedLinkResponse", "ThemeConfig",
    # Link
    "LinkCreate", "LinkUpdate", "LinkResponse", "LinkListResponse", "LinkReorderRequest",
    # Rule
    "RuleCreate", "RuleUpdate", "RuleResponse", "RuleListResponse", "RulePresets",
    # Analytics
    "AnalyticsSummary", "LinkPerformance", "LinkPerformanceList",
    "DailyStats", "DailyStatsResponse", "TopLinksResponse"
]
