# Student Success Navigator - System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT & SOURCE CONTROL                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │                  │
                              │     GitHub       │
                              │   Repository     │
                              │                  │
                              │ ramkdataeng-lab/ │
                              │student-success-  │
                              │   navigator      │
                              │                  │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    │ Auto-deploy on push (main branch)   │
                    │                                     │
          ┌─────────▼─────────┐              ┌───────────▼──────────┐
          │                   │              │                      │
          │   VERCEL          │              │    RENDER            │
          │   (Frontend)      │              │    (Backend)         │
          │                   │              │                      │
          └───────────────────┘              └──────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRODUCTION ENVIRONMENT                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┐         ┌─────────────────────────────────┐
│   VERCEL (Frontend Hosting)    │         │   RENDER (Backend Hosting)      │
│                                │         │                                 │
│  ┌──────────────────────────┐  │         │  ┌───────────────────────────┐  │
│  │  React Application       │  │         │  │  FastAPI Application      │  │
│  │  - Vite Build            │  │         │  │  - Python 3.11            │  │
│  │  - React Router          │  │         │  │  - SQLModel ORM           │  │
│  │  - Axios HTTP Client     │  │         │  │  - JWT Authentication     │  │
│  │  - Framer Motion         │  │         │  │  - CORS Middleware        │  │
│  └──────────────────────────┘  │         │  └───────────────────────────┘  │
│                                │         │                                 │
│  URL:                          │         │  URL:                           │
│  studentsuccess-nu.vercel.app  │◄───────►│  student-success-backend-      │
│                                │  HTTPS  │  cnya.onrender.com             │
│  Environment Variables:        │  REST   │                                 │
│  - VITE_API_URL               │   API   │  Environment Variables:         │
│                                │         │  - GOOGLE_API_KEY               │
│                                │         │  - DATABASE_URL                 │
│                                │         │  - CANVAS_API_TOKEN             │
│                                │         │  - CANVAS_BASE_URL              │
└────────────────────────────────┘         └─────────────┬───────────────────┘
                                                         │
                                                         │
                    ┌────────────────────────────────────┼────────────────┐
                    │                                    │                │
                    │                                    │                │
┌───────────────────▼──────────┐    ┌────────────────────▼─────┐   ┌─────▼──────────────┐
│                              │    │                          │   │                    │
│   GOOGLE GEMINI AI           │    │   NEON DATABASE          │   │   CANVAS LMS       │
│                              │    │   (PostgreSQL)           │   │   (Optional)       │
│  Model: gemini-flash-latest  │    │                          │   │                    │
│                              │    │  Tables:                 │   │  Integration for:  │
│  Services:                   │    │  - user                  │   │  - Course data     │
│  - Flashcard Generation      │    │  - chatsession           │   │  - Assignments     │
│  - Audio Transcription       │    │  - chatmessage           │   │  - Grades          │
│  - Text Summarization        │    │  - course                │   │  - Calendar        │
│  - Get Aura (Chat)       │    │  - tutor                 │   │                    │
│                              │    │  - formrequest           │   │                    │
│  API Key: GOOGLE_API_KEY     │    │  - advisor               │   │                    │
│                              │    │  - studygroup            │   │                    │
│                              │    │  - mentorship            │   │                    │
│                              │    │  - marketplaceitem       │   │                    │
│                              │    │  - lecturenote           │   │                    │
│                              │    │                          │   │                    │
│                              │    │  Connection String:      │   │                    │
│                              │    │  DATABASE_URL            │   │                    │
└──────────────────────────────┘    └──────────────────────────┘   └────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER ACCESS LAYER                               │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │                                 │
                    │      End Users                  │
                    │                                 │
                    │  - Students                     │
                    │  - Administrators               │
                    │                                 │
                    │  Access via:                    │
                    │  - Web Browsers (Chrome, etc)   │
                    │  - Mobile Browsers              │
                    │  - Desktop                      │
                    │                                 │
                    └────────────┬────────────────────┘
                                 │
                                 │ HTTPS
                                 │
                    ┌────────────▼────────────────────┐
                    │                                 │
                    │  studentsuccess-nu.vercel.app   │
                    │                                 │
                    └─────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌──────┐     1. Login      ┌─────────┐     2. Validate    ┌──────────┐
│      │  ───────────────► │         │  ────────────────► │          │
│ User │                   │ Vercel  │                    │  Render  │
│      │  ◄─────────────── │ Frontend│  ◄──────────────── │  Backend │
└──────┘   5. Dashboard    └─────────┘   4. JWT Token     └────┬─────┘
                                                                │
                                                                │ 3. Query
                                                                │
                                                           ┌────▼─────┐
                                                           │   Neon   │
                                                           │ Database │
                                                           └──────────┘
```

### 2. Flashcard Generation Flow

```
┌──────┐  1. Request Topic  ┌─────────┐  2. API Call   ┌──────────┐
│      │  ────────────────► │         │  ────────────► │          │
│ User │                    │ Vercel  │                │  Render  │
│      │  ◄──────────────── │ Frontend│  ◄──────────── │  Backend │
└──────┘  6. Display Cards  └─────────┘  5. Return JSON└────┬─────┘
                                                             │
                                                             │ 3. Generate
                                                             │    Flashcards
                                                        ┌────▼──────┐
                                                        │  Google   │
                                                        │  Gemini   │
                                                        │    AI     │
                                                        └───────────┘
                                                             │
                                                             │ 4. AI Response
                                                             ▼
```

### 3. Lecture Note Save Flow

```
┌──────┐  1. Record Audio  ┌─────────┐  2. Upload     ┌──────────┐
│      │  ───────────────► │         │  ────────────► │          │
│ User │                   │ Vercel  │                │  Render  │
│      │                   │ Frontend│                │  Backend │
└──────┘                   └─────────┘                └────┬─────┘
    ▲                                                      │
    │                                                      │ 3. Transcribe
    │                                                      │
    │                                                 ┌────▼──────┐
    │                                                 │  Google   │
    │                                                 │  Gemini   │
    │                                                 │    AI     │
    │                                                 └────┬──────┘
    │                                                      │
    │                                                      │ 4. Save
    │                                                      │
    │                                                 ┌────▼─────┐
    │                                                 │   Neon   │
    │                                                 │ Database │
    │                                                 └────┬─────┘
    │                                                      │
    │  7. Display Results                                  │
    └──────────────────────────────────────────────────────┘
         5. Return Transcript/Summary
```

---

## Technology Stack

### Frontend (Vercel)
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Animations:** Framer Motion
- **Styling:** CSS Modules + Vanilla CSS
- **State Management:** React Hooks (useState, useEffect)

### Backend (Render)
- **Framework:** FastAPI
- **Language:** Python 3.11
- **ORM:** SQLModel
- **Authentication:** JWT (python-jose)
- **Password Hashing:** bcrypt
- **AI Integration:** google-generativeai
- **Server:** Uvicorn (ASGI)

### Database (Neon)
- **Type:** PostgreSQL 15
- **Hosting:** Neon (Serverless Postgres)
- **Connection:** psycopg2-binary
- **SSL:** Required

### AI Services (Google)
- **Provider:** Google Gemini
- **Model:** gemini-flash-latest
- **Use Cases:**
  - Flashcard generation
  - Audio transcription
  - Text summarization
  - Conversational AI

### External Integrations
- **Canvas LMS:** Course and assignment data (optional)
- **GitHub:** Source control and CI/CD trigger
- **Vercel:** Automatic frontend deployment
- **Render:** Automatic backend deployment

---

## Deployment Pipeline

```
Developer
    │
    │ git push
    ▼
┌─────────────┐
│   GitHub    │
│ Repository  │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       │ Webhook          │ Webhook
       │ Trigger          │ Trigger
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Render    │
│   Build     │    │   Build     │
└──────┬──────┘    └──────┬──────┘
       │                  │
       │ Deploy           │ Deploy
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  Frontend   │    │  Backend    │
│ Production  │    │ Production  │
└─────────────┘    └─────────────┘
```

### Build Process

**Vercel (Frontend):**
1. Detect push to `main` branch
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Deploy to CDN
5. Update DNS (studentsuccess-nu.vercel.app)

**Render (Backend):**
1. Detect push to `main` branch
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `python migrate_lecture_notes.py`
4. Start server: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Health check
6. Route traffic to new instance

---

## Security Architecture

### Authentication & Authorization
```
┌──────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. HTTPS/TLS Encryption (All traffic)                   │
│     - Vercel: Auto SSL                                   │
│     - Render: Auto SSL                                   │
│                                                          │
│  2. JWT Token Authentication                             │
│     - HS256 Algorithm                                    │
│     - 30-minute expiration                               │
│     - Stored in localStorage                             │
│                                                          │
│  3. Password Security                                    │
│     - bcrypt hashing                                     │
│     - Salt rounds: 12                                    │
│     - Never stored in plaintext                          │
│                                                          │
│  4. API Key Protection                                   │
│     - Environment variables only                         │
│     - Never committed to Git                             │
│     - Rotated periodically                               │
│                                                          │
│  5. CORS Configuration                                   │
│     - Allowed origins: Vercel domain                     │
│     - Credentials: true                                  │
│     - Methods: GET, POST, PUT, DELETE                    │
│                                                          │
│  6. Database Security                                    │
│     - SSL/TLS required                                   │
│     - Connection pooling                                 │
│     - Prepared statements (SQL injection prevention)     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Scalability & Performance

### Current Architecture Limits
- **Vercel:** Unlimited bandwidth, 100GB/month
- **Render (Free):** 750 hours/month, sleeps after 15min inactivity
- **Neon (Free):** 3GB storage, 1 project
- **Gemini API:** Rate limits apply (varies by tier)

### Optimization Strategies
1. **Frontend:**
   - Code splitting (Vite)
   - Lazy loading components
   - Asset optimization
   - CDN delivery

2. **Backend:**
   - Database connection pooling
   - Query optimization
   - Caching (future: Redis)
   - Async operations

3. **Database:**
   - Indexed columns (email, user_id, created_at)
   - Efficient queries (SQLModel)
   - Connection pooling

---

## Monitoring & Logging

### Vercel
- **Analytics:** Page views, performance metrics
- **Logs:** Build logs, function logs
- **Alerts:** Build failures, deployment issues

### Render
- **Logs:** Application logs, system logs
- **Metrics:** CPU, memory, requests/sec
- **Health Checks:** HTTP endpoint monitoring
- **Alerts:** Service down, high error rate

### Database (Neon)
- **Metrics:** Query performance, connections
- **Logs:** Slow queries, errors
- **Backups:** Automatic daily backups

---

## Disaster Recovery

### Backup Strategy
1. **Database:** Neon automatic backups (daily)
2. **Code:** Git repository (GitHub)
3. **Environment Variables:** Documented in secure location

### Recovery Procedures
1. **Frontend Failure:** Redeploy from GitHub
2. **Backend Failure:** Redeploy from GitHub, restore DB if needed
3. **Database Failure:** Restore from Neon backup
4. **Complete Outage:** Rebuild from Git + DB backup

---

## Future Architecture Enhancements

### Planned Improvements
1. **Redis Caching:** Reduce database load
2. **CDN for Assets:** Faster global delivery
3. **Load Balancer:** Multiple backend instances
4. **Monitoring:** Sentry for error tracking
5. **Analytics:** Mixpanel or Amplitude
6. **Email Service:** SendGrid for notifications
7. **File Storage:** AWS S3 for uploads
8. **Search:** Elasticsearch for advanced search

---

**Document Version:** 1.0  
**Last Updated:** December 29, 2025  
**Maintained By:** Development Team
