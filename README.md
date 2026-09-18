# GovAlert (Government Opportunities & Scholarship Alert System)

GovAlert is an Indian public-sector opportunity discovery, tracking, and notification platform. It aggregates verified openings across government recruitments (UPSC, SSC, State PSCs, Banking, Defense, PSUs), national scholarships (NSP, AICTE, UGC), internships, fellowships, and competitive examinations.

---

## Key Features

- **Source Authenticity First**: Prioritizes verified official government sources (`.gov.in`, `.nic.in`, `.ac.in`), displaying verification dates, direct links to official notification PDFs, and direct application portals.
- **Personalized Eligibility Matching**: Evaluates user profile details (education level, degree, branch, passing year, age) against opportunity criteria to display transparent, non-authoritative match breakdowns (*"Potentially eligible based on your profile"*).
- **Automated Change Detection**: Tracks changes to deadlines, exam dates, vacancy counts, and corrigenda across re-ingestion passes, creating version snapshots and alerting tracked users.
- **Deduplication Engine**: Combines content hashing and deterministic title/organization matching to ensure zero duplicate opportunities.
- **Anti-Spam Notifications**: Enforces user-configurable daily maximums and quiet hours, ensuring high signal-to-noise ratio.
- **Application Tracker**: Built-in status tracking (*Interested*, *Planning to Apply*, *Applied*, *Exam Scheduled*, *Selected*, etc.) with custom notes and calendar sync.
- **Native Android APK**: Direct standalone Android installation with dark/light themes, offline caching, and responsive design.

---

## Project Structure

```text
govalert/
├── apps/
│   ├── mobile/         # React Native + Expo Router Android Application
│   └── admin/          # React + Vite Administrative Dashboard
├── backend/            # Express + Prisma REST API & Ingestion Workers
├── packages/
│   ├── types/          # Shared TypeScript interfaces & types
│   ├── validation/     # Shared Zod validation schemas
│   └── shared/         # Constants, date helpers, status enums
├── docs/               # System architecture, database, adapters, notifications
└── README.md
```

---

## Quick Start Guide

### Prerequisites
- Node.js (v20+ LTS recommended)
- PostgreSQL (or Supabase project)
- Java 17 & Android SDK (for native Android compilation)

### 1. Environment Setup
Copy the configuration template:
```bash
cp .env.example .env
```
Update `DATABASE_URL` with your PostgreSQL connection string.

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Seed
```bash
cd backend
npx prisma db push
npm run seed
```

### 4. Running Backend
```bash
cd backend
npm run dev
```

### 5. Running Mobile App
```bash
cd apps/mobile
npm start
```

### 6. Compiling Android Release APK
```bash
cd apps/mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
The APK will be generated at:
`apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
