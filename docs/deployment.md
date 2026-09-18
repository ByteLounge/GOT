# GovAlert Deployment & Build Instructions

## 1. Backend Service Deployment

The backend is built as a standard Node.js/TypeScript service and can be deployed to Render, Railway, AWS ECS, Fly.io, or VPS.

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

---

## 2. Database Setup (Supabase or PostgreSQL)

1. Create a PostgreSQL 15+ database or Supabase project.
2. Configure `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/govalert?schema=public"
   ```
3. Run migrations and seed data:
   ```bash
   cd backend
   npx prisma db push
   npm run seed
   ```

---

## 3. Android APK Compilation

The mobile application is an Expo application with native Android configuration:

1. Ensure JDK 17 is active (`java -version`).
2. Ensure Android SDK is installed with `ANDROID_HOME` pointing to the SDK root.
3. Prebuild Android project:
   ```bash
   cd apps/mobile
   npm install
   npx expo prebuild --platform android
   ```
4. Build Release APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
5. Output APK location:
   `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
