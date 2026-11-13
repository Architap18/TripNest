# TripNest — Repository Audit & Sprint Architecture Plan

**Author:** Shriyash (Senior Full-Stack Engineer & Architect)  
**Date:** November 2026  
**Sprint Branch:** `feat/tripnest-enhancements`  
**Repository Root:** `/Users/shriyasdeshmukh/TRIP_NEST_ASD/TripNest`

---

## 1. Existing Project Architecture

TripNest is structured as a full-stack JavaScript monorepo separated into two isolated workspaces:
- **`backend/`**: Express 5.3 server with CommonJS modules, Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`), PostgreSQL database, HTTP-only cookie JWT authentication (`jsonwebtoken`, `cookie-parser`, `bcryptjs`), Multer file uploads to Vercel Blob (`@vercel/blob`), Groq AI SDK (`openai/gpt-oss-20b`), and Unsplash API for automated cover images. Server entry point: `src/server.js`, Express app: `src/app.js`, Serverless handler: `src/api/index.js`.
- **`frontend/`**: Vite 8 with React 19.3, React Router DOM v7 (`BrowserRouter`), Leaflet / React-Leaflet 5 for interactive destination maps, Lucide React icons, and custom CSS design systems (`Dashboard.css`, `FeaturePage.css`, `Profile.css`, `TripNestAI.css`).

---

## 2. Complete Feature Inventory

| Area | Feature | Current State |
| :--- | :--- | :--- |
| **Auth** | User Registration & Login | Implemented & Working |
| **Auth** | Session Check (`/me`) & Logout | Implemented & Working |
| **Dashboard** | Carousel & Quick Actions | Implemented & Working |
| **Dashboard** | Trip Filter Tabs (All / Upcoming / Ongoing / Completed) | Working (Client-side) |
| **Dashboard** | Mini Calendar with Trip Highlighting | Working (Basic) |
| **Dashboard** | Popular Destinations Carousel & Save | Implemented & Working |
| **Dashboard** | Recent Activities Stream | Implemented & Working |
| **Dashboard** | Create Trip Modal with Unsplash Cover Image | Implemented & Working |
| **Trips** | Get My Trips & Get Trip By ID | Implemented & Working |
| **Trips** | Update Trip & Delete Trip | **Missing Backend Route & Controller** (Frontend calls DELETE `/api/trips/:id` which fails with 404) |
| **Trips** | Trip Search, Multi-criteria Sorting, Duplication | **Missing** |
| **Itinerary** | Day-wise schedule & Map geocoding markers | Implemented & Working |
| **Itinerary** | Itinerary Export (PDF / Print) & Sharing | **Missing** |
| **Expenses** | Add, Update, Delete Expenses | Implemented & Working |
| **Expenses** | Category totals and budget summary | Basic calculation |
| **Expenses** | Spending Visualizations & Date/Category Filters | **Missing** |
| **Expenses** | Multi-Currency Conversion Utility | **Missing** |
| **Packing** | Item Add, Toggle Packed, Delete | Implemented (embedded in Itinerary) |
| **Packing** | Standalone trip selector, templates, batch actions | **Missing** |
| **Collaboration**| Member invitation & role management | Implemented & Working |
| **Documents** | File upload to Vercel Blob, listing, download, delete | Implemented & Working |
| **Saved Places** | List and delete saved places | Implemented & Working |
| **Profile** | Details, stats, preferences, notification settings, avatar/cover upload | Implemented & Working |
| **AI Assistant**| TripNest AI with Groq API integration | Implemented & Working |
| **Notifications**| Centralized notification center with reminders | **Missing UI & logic** |

---

## 3. Features Already Implemented and Working
- JWT authentication flow with secure cookies and route guards.
- User profile editing, avatar & cover image uploads, travel preferences, and notification preferences.
- Trip creation with automated destination photography via Unsplash API.
- Day-wise itinerary planning with OpenStreetMap geocoding and Leaflet map markers.
- Expense tracking with category tags and remaining budget calculation.
- Collaboration with member invitations and role checks (OWNER, EDITOR, VIEWER).
- Travel document storage supporting PDFs, images, and Word documents via Vercel Blob.
- Saved places / bucket list bookmarking.
- TripNest AI chat with conversational travel suggestions.

---

## 4. Partially Implemented Features
1. **Trip Deletion & Editing**: The frontend Dashboard provides a delete button calling `DELETE /api/trips/:tripId`, but the backend lacks the route and controller function. No trip editing endpoint exists.
2. **Packing Checklist Page**: `/packing` route exists in `App.jsx`, but `Packing.jsx` strictly expects `{ tripId, tripTitle, destination }` as props; navigating to `/packing` directly lacks trip selection.
3. **Explore Page**: `frontend/src/pages/Explore.jsx` is an empty 0-byte stub.
4. **Dashboard Mini Calendar**: Shows basic trip markers for the current month but lacks activity markers, trip details preview, or countdowns.

---

## 5. Missing Features (Sprint Scope)
1. **Advanced Trip Management**: Full-text destination/title search, multi-criteria sorting (departure date, created date, budget), date-range filtering, trip duplication, progress indicators.
2. **Expense Intelligence & Analytics**: Interactive category breakdown charts, planned vs actual spend progress, date/category filters, daily & monthly spending summaries, multi-currency conversion utility.
3. **Interactive Travel Calendar**: Monthly navigation with day-by-day activity timelines, itinerary markers, and upcoming trip countdown widget.
4. **Smart Packing Experience**: Categorized packing starter templates (Weekend Getaway, International Travel, Beach Vacation, Business Trip, Monsoon/Trekking), standalone trip selector, batch toggle/clear.
5. **Itinerary Export & Sharing**: Print-friendly itinerary export, PDF summary generator, secure read-only tokenized trip sharing.
6. **Notifications & User Experience**: In-app notification center bell dropdown, upcoming departure reminders, budget alerts, reusable skeletons, empty states, and enhanced error feedback.

---

## 6. Existing UI and Design Patterns
- **Color Palette**: Primary Indigo (`#402697` / `#6945db`), Deep Dark (`#211b43`), Muted Lavender (`#89839e`), Soft Border (`#eee9f6`), Warm Page Background (`#faf9fe`), Pure White (`#ffffff`).
- **Typography**: `DM Sans` (primary body and UI), `Montserrat` & `Playfair Display` (editorial headings and highlights).
- **Navigation**: Floating pill navbar with glassmorphism blur (`backdrop-filter: blur(18px)`), rounded borders (`border-radius: 35px`), and brand lockup.
- **Components**: Pill buttons, badge tags, icon buttons, soft shadows (`0 6px 25px rgba(43, 25, 83, 0.09)`), and Lucide React icons.

---

## 7. Database Models and Relationships
- `User`: owns `Trip` (`TripOwner`), participates in `TripMember`, authors `ItineraryItem`, saves `SavedPlace`, records `Expense`, generates `Activity`, uploads `TripDocument`, configures `TravelPreference` & `NotificationSetting`.
- `Trip`: central aggregate root connected to `User`, `TripMember`, `ItineraryItem`, `Expense`, `Activity`, `PackingItem`, and `TripDocument`.
- `TripStatus`: `PLANNING`, `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`.
- `MemberRole`: `OWNER`, `EDITOR`, `VIEWER`.
- `ExpenseCategory`: `TRANSPORT`, `ACCOMMODATION`, `FOOD`, `ACTIVITIES`, `SHOPPING`, `OTHER`.

---

## 8. Existing API Endpoints
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `POST /api/trips`, `GET /api/trips`, `GET /api/trips/:id`
- `GET /api/itinerary/:tripId`, `POST /api/itinerary/:tripId`, `PUT /api/itinerary/:tripId/:itemId`, `DELETE /api/itinerary/:tripId/:itemId`
- `GET /api/expenses/:tripId`, `POST /api/expenses/:tripId`, `PUT /api/expenses/:tripId/:expenseId`, `DELETE /api/expenses/:tripId/:expenseId`
- `GET /api/collaboration/:tripId`, `POST /api/collaboration/:tripId/invite`, `DELETE /api/collaboration/:tripId/members/:memberId`
- `GET /api/packing/:tripId`, `POST /api/packing/:tripId`, `PATCH /api/packing/:tripId/:itemId`, `DELETE /api/packing/:tripId/:itemId`
- `GET /api/documents/:tripId`, `POST /api/documents/:tripId`, `GET /api/documents/:tripId/download/:documentId`, `DELETE /api/documents/:tripId/:documentId`
- `GET /api/saved-places`, `POST /api/saved-places`, `DELETE /api/saved-places/:id`
- `GET /api/activity`
- `POST /api/ai/chat`
- `GET /api/profile`, `PUT /api/profile`, `GET /api/profile/stats`, `PUT /api/profile/preferences`, `PUT /api/profile/notifications`, `POST /api/profile/avatar`, `GET /api/profile/avatar`, `POST /api/profile/cover`, `GET /api/profile/cover`

---

## 9. Potential Bugs & Technical Debt Identified
1. **Missing Trip Delete & Update Endpoints**: Frontend attempts `DELETE /api/trips/:id`, resulting in 404 errors.
2. **Direct Route for Packing**: `/packing` lacks trip selection when accessed outside of the Itinerary tab.
3. **Unused / Empty Explore Page**: `Explore.jsx` is 0 bytes; routing directs to TripNestAI.
4. **React Hook Hoisting Warnings**: `Collaboration.jsx` and others call fetch functions inside `useEffect` before their declaration.
5. **No Backend Request Sanitization**: Payloads in several controllers assume well-formed inputs without sanitizing types or stripping unexpected keys.

---

## 10. Dependencies Already Installed
- **Frontend**: `react` (19.3), `react-dom` (19.3), `react-router-dom` (7.18), `leaflet` (1.9.4), `react-leaflet` (5.0.0), `lucide-react` (1.67), `axios` (1.21), `vite` (8.3.5), `eslint` (10.13).
- **Backend**: `express` (5.3), `@prisma/client` & `prisma` (7.10), `@prisma/adapter-pg` (7.10), `@vercel/blob` (2.9), `bcryptjs` (3.0), `cookie-parser` (1.4), `cors` (2.8), `dotenv` (18.0), `jsonwebtoken` (9.0), `multer` (2.5), `pg` (8.23).

---

## 11. Safe Opportunities for New Functionality
1. Enhance trip controllers with `deleteTrip`, `updateTrip`, `duplicateTrip`, and `searchTrips`.
2. Add spending analytics with SVG-rendered category bars, breakdown metrics, and a standalone multi-currency converter.
3. Enrich the interactive calendar with month navigation, day-wise activity cards, and an upcoming trip countdown.
4. Upgrade Packing with pre-populated packing templates (5 travel personas), trip selector, and batch completion.
5. Provide a print/PDF-optimized itinerary view and secure tokenized read-only trip sharing.
6. Create an in-app notification center bell dropdown with trip reminders and budget alerts.

---

## 12. Recommended Implementation Order
1. **Module 1**: Advanced Trip Management (Delete, Update, Search, Filters, Sorting, Duplication, Progress).
2. **Module 2**: Expense Intelligence & Analytics (Breakdown, Analytics, Date/Category Filters, Multi-currency Converter).
3. **Module 3**: Interactive Travel Calendar (Full Calendar View, Activity markers, Countdown).
4. **Module 4**: Smart Packing Experience (Standalone Selector, Templates, Analytics, Batch Actions).
5. **Module 5**: Itinerary Export & Sharing (Print-friendly format, PDF layout, Secure tokenized read-only sharing).
6. **Module 6**: Notifications & UX (Notification Center, Reminders, Skeletons, Error states).
7. **Engineering Quality**: Payload Validation, Backend Integration Tests, Build Verification.

---

## 13. Estimated Meaningful Git Commits
Targeting 25 clean, independently verifiable commits following the Conventional Commits specification.
