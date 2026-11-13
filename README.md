# TripNest – Organized Travel

TripNest is a web-based travel planning application designed to help users discover destinations, organize trips, manage itineraries, collaborate with other travelers, and track travel expenses in one place.

The application focuses on making travel planning simple, organized, and flexible. Users can plan their journeys manually, while AI-powered assistance can be used as an optional feature.

## Features

### 1. Authentication
- User registration and login.
- JWT-based authentication.
- Protected application routes.
- Secure password hashing.

### 2. Dashboard & Interactive Calendar
- Personalized dashboard with quick statistics.
- Dynamic upcoming trip departure countdown and progress indicators.
- Interactive monthly travel calendar (`/calendar`) with month navigation, day inspection, and day-wise activity timeline.
- Dynamic destination images for trip cards via Unsplash.

### 3. Explore & Saved Places
- Interactive destination discovery page (`/explore`) with category filters (Tropical, Cultural, Mountain, Coastal, Metropolitan).
- Real-time destination search and instant one-click bucket list bookmarking.
- Saved places management with direct trip planning transitions.

### 4. Advanced Trip Management
- Create, view, update, and delete trips with backend data integrity.
- Full-text instant search by destination, title, and description.
- Status filters: Upcoming, Ongoing, Completed, or All.
- Date range filters: Next 30 Days, Next 90 Days, This Year, Any Date.
- Multi-criteria sorting: Departure Date, Creation Date, Budget (Low/High).
- One-click trip duplication cloning destination, dates, budget, and itinerary activities.

### 5. Itinerary Planner & Printable Export
- Day-wise activity schedules with locations, start times, and durations.
- Print-optimized trip dossier (`/trips/:id/share`) with clean typography and `@media print` styling for PDF generation.
- Read-only shared trip overview for non-authenticated guests and collaborators.

### 6. Team Collaboration & Role Management
- Multi-user trip collaboration with email invites.
- Role management (`VIEWER`, `EDITOR`, `ADMIN`) with backend role update endpoint.
- Contextual permissions matrix guide for transparent access control.

### 7. Expense Intelligence & Multi-Currency Analytics
- Category-wise expense tracking (Transport, Accommodation, Food, Activities, Shopping, Other).
- Visual stacked progress bar displaying category expenditure distributions.
- Real-time budget utilization tracker with warning (>90%) and over-budget alert banners.
- Date and category filter controls on expense records.
- Built-in multi-currency conversion utility supporting 10 global currencies (INR, USD, EUR, GBP, JPY, AUD, CAD, SGD, AED, THB).

### 8. Smart Packing Experience
- Standalone packing checklist hub (`/packing`) with trip selector.
- Predefined categorized packing templates (Clothing, Electronics, Toiletries, Documents, Essentials).
- Batch packing item insertion (`POST /api/packing/:tripId/batch`).
- Real-time completion percentage analytics and status filters.

### 9. Notifications & Travel Documents
- In-app notification center modal with departure alerts and scheduled activity reminders.
- Upload and manage travel documents with Vercel Blob private storage.
- Document preview, download, and deletion.

### 10. Profile & Settings
- Manage personal information, avatars, and cover photos.
- Travel preferences and notification toggles.
- Secure password update.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | CSS |
| Routing | React Router |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcryptjs |
| File Storage | Vercel Blob |
| Destination Images | Unsplash API |
| Deployment | Vercel |

## Project Structure

```text
TripNest/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   ├── prisma.config.js
│   └── package.json
│
└── README.md
```

## Environment Variables


PORT=5001

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret

UNSPLASH_ACCESS_KEY=your_unsplash_access_key

BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

## Destination Image Integration

TripNest uses the Unsplash API to retrieve destination-related travel images.

When a user creates a trip:

1. The backend receives the trip details.
2. It checks whether a cover image was provided.
3. If no cover image was provided, it searches Unsplash using the destination name.
4. The selected image URL is stored in the PostgreSQL database in the `coverImage` field.
5. The frontend displays the saved image in the trip card.


## Database

TripNest uses PostgreSQL with Prisma ORM.

The database includes models for:

- Users
- Trips
- Trip members
- Itinerary items
- Saved places
- Expenses
- Activities
- Packing items
- Travel documents
- Travel preferences
- Notification settings

## Deployment

The application can be deployed separately:

- **Frontend:** Vercel
- **Backend:** Vercel
- **Database:** Neon PostgreSQL
- **File Storage:** Vercel Blob

## Security

- Passwords are hashed before storage.
- Protected routes require authentication.
- JWT secrets remain on the backend.
- Environment variables are not committed to Git.
- Trip documents are stored using private file access.
- Backend endpoints validate access to protected trip resources.

## Testing & Quality Assurance

TripNest includes a comprehensive native test suite covering input sanitization, API validation, and core travel business logic.

To run the backend test suite:

```bash
cd backend
npm test
```

Tests run with Node's native test runner (`node --test`), verifying 19 test cases across validation middleware, trip status classifications, budget utilization analytics, and packing list calculations without extra external test dependencies.

## Future Enhancements

- More advanced AI-powered travel recommendations.
- Improved destination discovery.
- Enhanced collaborative planning.
- Additional expense analytics.
- Weather-based travel suggestions.
- More detailed travel statistics.

## Author

Developed as a major academic project.

**TripNest – Organized Travel**