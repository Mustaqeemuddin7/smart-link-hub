# 🔗 Smart Link Hub

> **JPD HUB Hackathon 2026** | IIT Ropar TechFest 2026

A smart Link-in-Bio platform with dynamic rule-based link prioritization, real-time analytics, and a stunning black-green UI.

![Smart Link Hub](https://img.shields.io/badge/Status-Hackathon%20Ready-22c55e?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-3776ab?style=flat-square&logo=python)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169e1?style=flat-square&logo=postgresql)

## ✨ Features

### Core Features
- 🔗 **Link Hub Creation** - Create beautiful link pages with unique URLs
- 📊 **Real-Time Analytics** - Track visits, clicks, and CTR
- 🎨 **Custom Themes** - Black-green theme with glassmorphism design

### Smart Rule Engine
- ⏰ **Time-Based Rules** - Show links during business hours only
- 📱 **Device Detection** - Different links for mobile vs desktop
- 🌍 **Geo-Targeting** - Show payment links based on visitor's country
- 📈 **Performance Boost** - Auto-promote high-CTR links

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Primary database
- **SQLAlchemy 2.0** - ORM with async support
- **Alembic** - Database migrations
- **JWT Auth** - Secure authentication

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Analytics charts

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp ../.env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000  
API Docs: http://localhost:8000/docs

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Set up environment
cp ../.env.example .env.local
# Edit .env.local if needed

# Start development server
npm run dev
```

Frontend runs at: http://localhost:3000

## 📁 Project Structure

```
smart-link-hub/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # API client & utils
│   │   └── types/            # TypeScript types
│   └── package.json
│
└── .env.example
```

## 🔑 Environment Variables

```env
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/smartlinkhub
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Hubs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hubs` | List user's hubs |
| POST | `/api/hubs` | Create hub |
| GET | `/api/hubs/{id}` | Get hub |
| PUT | `/api/hubs/{id}` | Update hub |
| DELETE | `/api/hubs/{id}` | Delete hub |

### Links
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hubs/{id}/links` | List links |
| POST | `/api/hubs/{id}/links` | Add link |
| PUT | `/api/links/{id}` | Update link |
| DELETE | `/api/links/{id}` | Delete link |

### Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hubs/{id}/rules` | List rules |
| POST | `/api/hubs/{id}/rules` | Add rule |
| PUT | `/api/rules/{id}` | Update rule |
| DELETE | `/api/rules/{id}` | Delete rule |

### Public & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/{slug}` | Get public hub |
| POST | `/api/track/visit/{slug}` | Track visit |
| POST | `/api/track/click/{id}` | Track click |
| GET | `/api/analytics/hubs/{id}` | Hub analytics |

## 🎯 Rule Engine Examples

### Time-Based Rule
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
  }
}
```

### Device-Based Rule
```json
{
  "name": "Mobile First",
  "rule_type": "device",
  "condition": {
    "devices": ["mobile"]
  },
  "action": {
    "action": "show",
    "priority_boost": 20,
    "highlight": true
  }
}
```

### Location-Based Rule
```json
{
  "name": "India UPI",
  "rule_type": "location",
  "condition": {
    "countries": ["IN"]
  },
  "action": {
    "action": "show",
    "priority_boost": 50,
    "highlight": true
  }
}
```

## 🚢 Deployment

### Backend (Render/Railway)
1. Create PostgreSQL database
2. Set environment variables
3. Deploy from GitHub
4. Run migrations: `alembic upgrade head`

### Frontend (Vercel)
1. Connect GitHub repository
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy

## 📊 Demo

1. **Register** a new account
2. **Create** your first hub with a unique slug
3. **Add links** to your hub
4. **Configure rules** for smart display
5. **Share** your public hub URL
6. **Track** analytics in the dashboard

## 🏆 Hackathon Submission

- **Project Name:** Smart Link Hub Generator
- **Event:** JPD HUB Hackathon 2026 - IIT Ropar TechFest
- **Category:** Full-Stack Web Application

## 📄 License

MIT License - Built for JPD HUB Hackathon 2026
