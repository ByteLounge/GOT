# GovAlert REST API Specification

Base URL: `/api/v1`
Authentication: Standard Bearer Token (`Authorization: Bearer <jwt_token>`).

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user account and empty profile.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "name": "Arjun Sharma"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "c1f728...",
      "email": "user@example.com",
      "role": "user"
    }
  }
  ```

### `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "c1f728...",
      "email": "user@example.com",
      "role": "user"
    }
  }
  ```

### `GET /auth/me`
Returns the currently authenticated user with their profile and notification preferences.

---

## 2. Profile Endpoints

### `GET /profile`
Fetch current user's profile.
- **Response `200 OK`**:
  ```json
  {
    "id": "p-123",
    "name": "Arjun Sharma",
    "dateOfBirth": "2002-05-14",
    "educationLevel": "Undergraduate",
    "degree": "B.Tech",
    "branch": "Computer Science & Engineering",
    "graduationYear": 2024,
    "cgpaOrPercentage": 8.4,
    "state": "Maharashtra",
    "interests": ["Software Development", "PSU Recruitment"],
    "preferredOpportunityTypes": ["Government Jobs", "Internships"]
  }
  ```

### `PATCH /profile`
Updates profile details and re-computes eligibility markers.

---

## 3. Opportunities Endpoints

### `GET /opportunities`
Paginated, searchable, and filtered opportunities catalog.
- **Query Parameters**:
  - `page` (default 1)
  - `limit` (default 20)
  - `category` (e.g. `Government Jobs`, `Scholarships`, `Internships`, `Exams`)
  - `education` (e.g. `Undergraduate`, `Postgraduate`, `Diploma`, `12th`)
  - `location` (e.g. `All India`, `Delhi`, `Maharashtra`)
  - `deadlineStatus` (`closing_today`, `closing_soon`, `open`, `closed`)
  - `status` (`OPEN`, `UPCOMING`, `CLOSED`)
  - `sort` (`deadline_asc`, `newest`, `vacancies_desc`)
- **Response `200 OK`**:
  ```json
  {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "data": [
      {
        "id": "opp-987",
        "title": "Scientist/Engineer 'SC' Recruitment",
        "organization": "Indian Space Research Organisation (ISRO)",
        "category": "Government Jobs",
        "shortDescription": "Recruitment of Scientist/Engineer 'SC' in Level 10 of Pay Matrix for BE/B.Tech graduates.",
        "applicationDeadline": "2026-10-15T23:59:59Z",
        "daysRemaining": 27,
        "location": "Bengaluru / All India",
        "vacancyCount": 65,
        "salaryMin": 56100,
        "salaryMax": 177500,
        "officialSourceUrl": "https://www.isro.gov.in/Careers.html",
        "officialNotificationUrl": "https://www.isro.gov.in/media_isro/pdf/advt2026.pdf",
        "officialApplicationUrl": "https://apps.isac.gov.in/recruitment",
        "sourceName": "ISRO Centralised Recruitment Board",
        "isVerified": true,
        "lastVerifiedAt": "2026-09-18T00:00:00Z",
        "deadlineStatus": "OPEN",
        "potentialMatch": {
          "isPotentiallyEligible": true,
          "matchScore": 95,
          "reasons": [
            "Matches your B.Tech degree",
            "Matches Computer Science specialization",
            "Age satisfies requirement (Under 28 years)"
          ]
        }
      }
    ]
  }
  ```

### `GET /opportunities/:id`
Retrieves full opportunity details, eligibility criteria breakdown, and version history.

### `GET /opportunities/:id/versions`
Returns list of change events and version snapshots (e.g. deadline extended, vacancy updated).

### `GET /recommendations`
Returns personalized recommendations based on the user's profile:
- Matching degree & branch
- Within age bounds
- Aligned with selected interests & preferred types

### `GET /search`
Global search querying title, organization, description, skills, and eligibility with instant results.
- **Query Parameter**: `q=ISRO+computer+science`

---

## 4. Bookmarks & Application Tracker Endpoints

### `GET /saved`
Lists all bookmarked opportunities for the current user.

### `POST /saved/:opportunityId`
Saves an opportunity.

### `DELETE /saved/:opportunityId`
Removes an opportunity from saved list.

### `GET /tracked`
Retrieves tracked applications with user status (`Interested`, `Saved`, `Planning to Apply`, `Applied`, `Exam Scheduled`, `Interview`, `Selected`, `Rejected`, `Closed`) and custom notes.

### `POST /tracked`
Track a new opportunity:
```json
{
  "opportunityId": "opp-987",
  "status": "Applied",
  "notes": "Submitted application on Sept 18th. Reg No: ISRO-2026-8819."
}
```

### `PATCH /tracked/:id`
Update status or notes.

---

## 5. Reminders & Notifications Endpoints

### `GET /reminders`
Lists all active reminders.

### `POST /reminders`
Schedule a deadline alert:
```json
{
  "opportunityId": "opp-987",
  "daysBefore": 7
}
```

### `DELETE /reminders/:id`
Cancel a reminder.

### `GET /notifications`
Fetch in-app notification feed.

### `PATCH /notifications/:id/read`
Mark notification as read.

### `GET /notifications/preferences`
Get anti-spam and notification preferences.

### `PATCH /notifications/preferences`
Update quiet hours, maximum alerts, and category toggles.

---

## 6. Ingestion & Admin Endpoints

### `GET /admin/sources`
List all monitored sources with health status and last run timestamp.

### `POST /admin/sources/:id/run`
Trigger manual crawl/ingestion pass for a source.

### `GET /admin/ingestion-runs`
Audit history of scraper executions and error reports.

### `GET /admin/changes`
Inspect newly detected opportunity changes awaiting review.
