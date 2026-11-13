# TripNest – Organized Travel

TripNest is a web-based travel planning application designed to help users discover destinations, organize trips, manage itineraries, collaborate with other travelers, and track travel expenses in one place.

The application focuses on making travel planning simple, organized, and flexible. Users can plan their journeys manually, while AI-powered assistance can be used as an optional feature.

## Features

### 1. Authentication
- User registration and login.
- JWT-based authentication.
- Protected application routes.
- Secure password hashing.

### 2. Dashboard
- Personalized dashboard.
- Upcoming, ongoing, and completed trips.
- Recent activity.
- Popular destinations.
- Dynamic destination images for trip cards.
- Quick access to trip planning features.

### 3. Explore Destinations
- Discover travel destinations.
- Save destinations for future reference.

### 4. Trip Management
- Create and manage trips.
- Add trip titles, destinations, descriptions, dates, and budgets.
- View trip details.
- Manage trip information.

### 5. Itinerary Planner
- Create day-wise travel schedules.
- Add activities and locations.
- Organize travel plans by date and time.

### 6. Collaboration
- Plan trips with other travelers.
- Invite members to collaborate.
- Manage trip participants.

### 7. Expense Management
- Add and track trip expenses.
- Organize expenses.
- Manage travel budgets.

### 8. Packing Checklist
- Create packing lists.
- Add and manage packing items.
- Track completed items.

### 9. Travel Documents
- Upload and manage travel documents.
- Store flight tickets, hotel bookings, and other travel files.
- Preview supported documents.
- Download and delete uploaded files.

### 10. Saved Places
- Bookmark destinations.
- View saved destinations.
- Remove saved places.

### 11. Profile & Settings
- Manage personal information.
- Update profile pictures and cover images.
- Manage preferences and notification settings.
- Change passwords.

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