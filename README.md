# Smart Link Hub

<div align="center">

![Smart Link Hub Banner](https://img.shields.io/badge/Smart_Link_Hub-Next_Gen_Link_Platform-22c55e?style=for-the-badge&labelColor=000000)

**A Next-Generation Link-in-Bio Platform with AI-Powered Smart Routing**

[![Status](https://img.shields.io/badge/Status-Production_Ready-22c55e?style=flat-square)](https://github.com/Mustaqeemuddin7/smart-link-hub)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169e1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)

[Live Demo](#demo) • [Features](#features) • [Quick Start](#quick-start) • [API Docs](#api-documentation) • [Architecture](#architecture)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Smart Rule Engine](#smart-rule-engine)
- [Analytics Dashboard](#analytics-dashboard)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

**Smart Link Hub** is a sophisticated Link-in-Bio platform that goes beyond traditional static link pages. It introduces **intelligent, context-aware link routing** powered by a dynamic rule engine that adapts to:

- **Time of Day** - Show different links during business hours
- **Device Type** - Optimize for mobile, tablet, or desktop
- **Geographic Location** - Display region-specific content
- **Performance Metrics** - Auto-promote high-performing links

### Why Smart Link Hub?

| Traditional Link Pages | Smart Link Hub |
|----------------------|----------------|
| Static, one-size-fits-all | Dynamic, context-aware |
| No analytics | Real-time analytics dashboard |
| Manual prioritization | AI-powered auto-promotion |
| Single experience | Device & location optimized |

---

## Features

### Link Hub Management
- **Create Unlimited Hubs** - Each with a unique, shareable URL
- **Custom Slugs** - SEO-friendly URLs like `yourdomain.com/your-name`
- **Theme Customization** - Black background with vibrant green accents
- **Drag & Drop Reordering** - Intuitive link organization
- **Enable/Disable Links** - Quick toggle without deletion

### Smart Rule Engine
- **Time-Based Rules** - Schedule links for specific hours
- **Device Detection** - Mobile-first or desktop-specific links
- **Geo-Targeting** - Country/region-based content
- **Performance Boost** - Auto-promote high-CTR links
- **Rule Presets** - Quick-start templates for common scenarios

### Analytics Dashboard
- **Real-Time Tracking** - Visits, clicks, and CTR
- **Device Breakdown** - Mobile vs Tablet vs Desktop
- **Geographic Insights** - Top countries visualization
- **Link Performance** - Identify top and bottom performers
- **Historical Data** - Daily/weekly/monthly trends with charts

### Premium UI/UX
- **Black & Green Theme** - Striking visual identity
- **Glassmorphism Design** - Modern, sleek aesthetic
- **Smooth Animations** - Framer Motion powered
- **Fully Responsive** - Mobile, tablet, and desktop optimized
- **QR Code Generation** - Instant shareable codes

### Security & Performance
- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - API abuse prevention
- **Input Validation** - Pydantic schema validation
- **CORS Protection** - Configurable origins
- **Password Hashing** - Bcrypt encryption

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │   Landing Page  │  │    Dashboard    │  │   Public Hub    │          │
│  │   (Next.js 14)  │  │  (React + TS)   │  │  (Dynamic SSR)  │          │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘          │
│           │                    │                    │                    │
│           └────────────────────┼────────────────────┘                    │
│                                │                                         │
│                    ┌───────────▼───────────┐                            │
│                    │     API Client        │                            │
│                    │  (src/lib/api.ts)     │                            │
│                    └───────────┬───────────┘                            │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │ HTTP/REST
┌────────────────────────────────┼────────────────────────────────────────┐
│                         API GATEWAY LAYER                                │
├────────────────────────────────┼────────────────────────────────────────┤
│                    ┌───────────▼───────────┐                            │
│                    │   FastAPI Server      │                            │
│                    │   (Uvicorn ASGI)      │                            │
│                    └───────────┬───────────┘                            │
│                                │                                         │
│  ┌─────────────┐  ┌────────────▼────────────┐  ┌─────────────┐          │
│  │   Rate      │  │     Route Handlers      │  │   JWT       │          │
│  │   Limiter   │◄─┤  /auth /hubs /links     │─►│   Auth      │          │
│  └─────────────┘  │  /rules /analytics      │  └─────────────┘          │
│                   └────────────┬────────────┘                            │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                             │
├────────────────────────────────┼────────────────────────────────────────┤
│  ┌─────────────────────────────▼─────────────────────────────┐          │
│  │                    Service Layer                          │          │
│  ├───────────────────┬───────────────────┬───────────────────┤          │
│  │  Rule Engine      │  Analytics        │  Hub Service      │          │
│  │  (Smart Routing)  │  (Tracking)       │  (CRUD)           │          │
│  └───────────────────┴───────────────────┴───────────────────┘          │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │
┌────────────────────────────────┼────────────────────────────────────────┐
│                         DATA ACCESS LAYER                                │
├────────────────────────────────┼────────────────────────────────────────┤
│                    ┌───────────▼───────────┐                            │
│                    │   SQLAlchemy 2.0      │                            │
│                    │   (ORM Models)        │                            │
│                    └───────────┬───────────┘                            │
│                                │                                         │
│                    ┌───────────▼───────────┐                            │
│                    │     PostgreSQL        │                            │
│                    │     (Database)        │                            │
│                    └───────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Visit → Public Hub → Rule Engine Processing → Personalized Links
     │
     ▼
 Analytics Tracking → Device/Location Detection → Database Storage
     │
     ▼
 Dashboard Visualization → Charts & Metrics → Actionable Insights
```

---

## Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | Web Framework | 0.109+ |
| **PostgreSQL** | Database | 15+ |
| **SQLAlchemy** | ORM | 2.0+ |
| **Alembic** | Migrations | 1.13+ |
| **Pydantic** | Validation | 2.5+ |
| **JWT (python-jose)** | Authentication | 3.3+ |
| **Bcrypt** | Password Hashing | 4.1+ |
| **Uvicorn** | ASGI Server | 0.27+ |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React Framework | 14.1+ |
| **TypeScript** | Type Safety | 5.0+ |
| **Tailwind CSS** | Styling | 3.4+ |
| **Framer Motion** | Animations | 11.0+ |
| **Recharts** | Charts | 2.10+ |
| **Radix UI** | Primitives | Latest |
| **Lucide React** | Icons | Latest |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local Development |
| **GitHub Actions** | CI/CD (optional) |
| **Vercel** | Frontend Hosting |
| **Render/Railway** | Backend Hosting |

---

## Quick Start

### Prerequisites

```bash
# Required versions
Python >= 3.11
Node.js >= 18.0
PostgreSQL >= 15.0
```

### Step 1: Clone Repository

```bash
git clone https://github.com/Mustaqeemuddin7/smart-link-hub.git
cd smart-link-hub
```

### Step 2: Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE smartlinkhub;
\q
```

### Step 3: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Edit with your database credentials
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/smartlinkhub
SECRET_KEY=your-super-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DEBUG=true
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
RATE_LIMIT_PER_MINUTE=100
PUBLIC_RATE_LIMIT_PER_MINUTE=300
EOF

# Run database migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend is now running at:** http://localhost:8000  
**API Documentation:** http://localhost:8000/docs

### Step 4: Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
EOF

# Start development server
npm run dev -- -p 3001
```

**Frontend is now running at:** http://localhost:3001

### Step 5: Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:3001 | Landing Page |
| http://localhost:3001/register | Create Account |
| http://localhost:3001/login | Login |
| http://localhost:3001/dashboard | User Dashboard |
| http://localhost:8000/docs | API Documentation (Swagger) |

---

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication

All protected endpoints require a Bearer token:
```http
Authorization: Bearer <access_token>
```

### Endpoints Overview

#### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register new user | No |
| `POST` | `/auth/login` | Login & get tokens | No |
| `POST` | `/auth/refresh` | Refresh access token | No |
| `GET` | `/auth/me` | Get current user info | Yes |

#### Hubs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/hubs` | List user's hubs | Yes |
| `POST` | `/hubs` | Create new hub | Yes |
| `GET` | `/hubs/{hub_id}` | Get hub details | Yes |
| `PUT` | `/hubs/{hub_id}` | Update hub | Yes |
| `DELETE` | `/hubs/{hub_id}` | Delete hub | Yes |
| `GET` | `/hubs/check-slug/{slug}` | Check slug availability | No |

#### Links

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/hubs/{hub_id}/links` | List hub's links | Yes |
| `POST` | `/hubs/{hub_id}/links` | Add new link | Yes |
| `PUT` | `/links/{link_id}` | Update link | Yes |
| `DELETE` | `/links/{link_id}` | Delete link | Yes |
| `PUT` | `/hubs/{hub_id}/links/reorder` | Reorder links | Yes |

#### Rules

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/hubs/{hub_id}/rules` | List hub's rules | Yes |
| `POST` | `/hubs/{hub_id}/rules` | Create new rule | Yes |
| `PUT` | `/rules/{rule_id}` | Update rule | Yes |
| `DELETE` | `/rules/{rule_id}` | Delete rule | Yes |
| `GET` | `/rules/presets` | Get rule presets | No |

#### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/analytics/hubs/{hub_id}` | Hub analytics summary | Yes |
| `GET` | `/analytics/hubs/{hub_id}/links` | Link performance | Yes |
| `GET` | `/analytics/hubs/{hub_id}/daily` | Daily statistics | Yes |
| `GET` | `/analytics/hubs/{hub_id}/top-links` | Top & bottom performers | Yes |

#### Public & Tracking

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/public/{slug}` | Get public hub | No |
| `GET` | `/public/{slug}/preview` | Preview with context | No |
| `POST` | `/track/visit/{slug}` | Track page visit | No |
| `POST` | `/track/click/{link_id}` | Track link click | No |

---

## Smart Rule Engine

The Rule Engine is the brain of Smart Link Hub. It processes visitor context and dynamically adjusts link visibility, priority, and highlighting.

### Rule Types

#### Time-Based Rules
Show or hide links based on time of day.

```json
{
  "name": "Business Hours Only",
  "rule_type": "time",
  "condition": {
    "start_hour": 9,
    "end_hour": 18,
    "timezone": "Asia/Kolkata"
  },
  "action": {
    "action": "show",
    "priority_boost": 10
  },
  "target_link_ids": ["link-uuid-here"]
}
```

#### Device-Based Rules
Optimize for specific device types.

```json
{
  "name": "Mobile App Download",
  "rule_type": "device",
  "condition": {
    "devices": ["mobile"]
  },
  "action": {
    "action": "show",
    "priority_boost": 20,
    "highlight": true
  },
  "target_link_ids": ["link-uuid-here"]
}
```

#### Location-Based Rules
Target specific countries or regions.

```json
{
  "name": "India UPI Payment",
  "rule_type": "location",
  "condition": {
    "countries": ["IN"]
  },
  "action": {
    "action": "show",
    "priority_boost": 50,
    "highlight": true
  },
  "target_link_ids": ["link-uuid-here"]
}
```

#### Performance-Based Rules
Auto-promote high-performing links.

```json
{
  "name": "Auto-Promote Popular",
  "rule_type": "performance",
  "condition": {
    "min_ctr": 0.1,
    "min_clicks": 5
  },
  "action": {
    "action": "boost",
    "priority_boost": 30,
    "highlight": true
  },
  "target_link_ids": []
}
```

### Rule Processing Flow

```
1. Visitor arrives at public hub
           │
           ▼
2. Extract visitor context
   - Device type (mobile/tablet/desktop)
   - Country (via IP geolocation)
   - Current time & timezone
           │
           ▼
3. Fetch all active rules for hub
           │
           ▼
4. Evaluate each rule's condition
   - Time check: Is current hour in range?
   - Device check: Does device match?
   - Location check: Is country in list?
   - Performance check: Does CTR meet threshold?
           │
           ▼
5. Apply matching rule actions
   - show/hide: Toggle visibility
   - priority_boost: Adjust ordering
   - highlight: Add visual emphasis
           │
           ▼
6. Sort links by final priority score
           │
           ▼
7. Return personalized link list
```

---

## Analytics Dashboard

### Metrics Tracked

| Metric | Description |
|--------|-------------|
| **Total Visits** | Unique page views to your hub |
| **Total Clicks** | Sum of all link clicks |
| **CTR (Click-Through Rate)** | Clicks / Visits × 100% |
| **Device Breakdown** | Mobile vs Tablet vs Desktop % |
| **Country Distribution** | Visitor geography |
| **Link Performance** | Per-link click counts & CTR |
| **Daily Trends** | Time-series visit/click data |

### Dashboard Views

1. **Global Overview** - Aggregate stats across all hubs
2. **Hub Analytics** - Detailed metrics for specific hub
3. **Link Performance** - Rank links by effectiveness
4. **Real-Time Data** - Live visitor tracking

---

## Project Structure

```
smart-link-hub/
│
├── backend/
│   ├── alembic/                    # Database migrations
│   │   ├── versions/               # Migration scripts
│   │   └── env.py                  # Alembic configuration
│   │
│   ├── app/
│   │   ├── api/                    # API route handlers
│   │   │   ├── auth.py             # Authentication endpoints
│   │   │   ├── hubs.py             # Hub CRUD operations
│   │   │   ├── links.py            # Link management
│   │   │   ├── rules.py            # Rule configuration
│   │   │   ├── analytics.py        # Analytics endpoints
│   │   │   ├── public.py           # Public hub access
│   │   │   ├── tracking.py         # Visit/click tracking
│   │   │   └── deps.py             # Shared dependencies
│   │   │
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── user.py             # User model
│   │   │   ├── hub.py              # Hub model
│   │   │   ├── link.py             # Link model
│   │   │   ├── rule.py             # Rule model
│   │   │   └── analytics.py        # Analytics model
│   │   │
│   │   ├── schemas/                # Pydantic validation schemas
│   │   │   ├── user.py             # User schemas
│   │   │   ├── hub.py              # Hub schemas
│   │   │   ├── link.py             # Link schemas
│   │   │   ├── rule.py             # Rule schemas
│   │   │   └── analytics.py        # Analytics schemas
│   │   │
│   │   ├── services/               # Business logic layer
│   │   │   ├── rule_engine.py      # Smart routing engine
│   │   │   ├── analytics_service.py # Analytics processing
│   │   │   └── hub_service.py      # Hub operations
│   │   │
│   │   ├── utils/                  # Utility modules
│   │   │   ├── security.py         # JWT & password hashing
│   │   │   └── rate_limiter.py     # Rate limiting
│   │   │
│   │   ├── config.py               # Configuration settings
│   │   ├── database.py             # Database connection
│   │   └── main.py                 # FastAPI application entry
│   │
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                  # Backend Docker image
│   └── .env                        # Environment variables (not in git)
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router pages
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── login/page.tsx      # Login page
│   │   │   ├── register/page.tsx   # Registration page
│   │   │   ├── [slug]/page.tsx     # Public hub display
│   │   │   └── dashboard/          # Protected dashboard
│   │   │       ├── page.tsx        # Dashboard home
│   │   │       ├── analytics/page.tsx # Global analytics
│   │   │       └── hubs/
│   │   │           ├── new/page.tsx   # Create hub
│   │   │           └── [hubId]/
│   │   │               ├── page.tsx           # Hub management
│   │   │               ├── rules/page.tsx     # Rule configuration
│   │   │               └── analytics/page.tsx # Hub analytics
│   │   │
│   │   ├── components/             # Reusable React components
│   │   │   └── QRCode.tsx          # QR code generator
│   │   │
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.ts          # Authentication hook
│   │   │   ├── useHubs.ts          # Hub management hook
│   │   │   ├── useLinks.ts         # Link management hook
│   │   │   └── useAnalytics.ts     # Analytics hook
│   │   │
│   │   ├── lib/                    # Utility libraries
│   │   │   ├── api.ts              # API client
│   │   │   └── utils.ts            # Helper functions
│   │   │
│   │   ├── styles/                 # Global styles
│   │   │   └── globals.css         # Tailwind + custom CSS
│   │   │
│   │   └── types/                  # TypeScript definitions
│   │       └── index.ts            # All type interfaces
│   │
│   ├── tailwind.config.ts          # Tailwind configuration
│   ├── next.config.js              # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── package.json                # Node dependencies
│   ├── Dockerfile                  # Frontend Docker image
│   └── .env.local                  # Environment variables (not in git)
│
├── docker-compose.yml              # Local development setup
├── .gitignore                      # Git ignore patterns
├── .env.example                    # Example environment file
└── README.md                       # This documentation
```

---

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smartlinkhub

# Security
SECRET_KEY=your-256-bit-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
PUBLIC_RATE_LIMIT_PER_MINUTE=300

# Debug
DEBUG=true
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## Deployment

### Docker Compose (Local)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Backend Deployment (Render)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`
6. Create a **PostgreSQL** database and link it

### Frontend Deployment (Vercel)

1. Import project from GitHub
2. Framework preset: **Next.js**
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = Your Render backend URL
   - `NEXT_PUBLIC_APP_URL` = Your Vercel domain
4. Deploy!

---

## Support

For issues or questions:
- Email: mustaqeemu17@gmail.com
- Issues: [GitHub Issues](https://github.com/Mustaqeemuddin7/smart-link-hub/issues)

---

## License

MIT License - Built by Mohammed Mustaqeem Uddin, Mohammed Mustafa and Mohammed Abdul Ghani Siraj

---

<div align="center">

**Star this repo if you find it helpful!**

Made by [Mustaqeem Uddin](https://github.com/Mustaqeemuddin7), [Mohammed Mustafa](https://github.com/MohammedMustafa786) and [Mohammed Abdul Ghani Siraj](https://github.com/Siraj-hp)

</div>
