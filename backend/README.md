# Home Away Backend API

Node.js + Express server for Home Away trip planning application.

## Features

- ✅ User authentication (Email/Password & Google OAuth)
- ✅ JWT token management
- ✅ Persistent MySQL database
- ✅ Trip management with collaborative features
- ✅ RESTful API design
- ✅ CORS support
- ✅ Error handling & validation

## Prerequisites

- Node.js 16+ or higher
- MySQL 5.7+ or higher (or MySQL 8.0+)
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root
DB_NAME=homeaway
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d

# Google OAuth (optional, configure later)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Create MySQL Database

```bash
# Using MySQL CLI
mysql -u root -p

# In MySQL:
CREATE DATABASE homeaway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Or use MySQL Workbench or your preferred database tool.

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

```
POST   /api/auth/register              Register new user
POST   /api/auth/login                 Login with credentials
GET    /api/auth/me                    Get current user (requires token)
POST   /api/auth/logout                Logout
GET    /api/auth/google/auth-url       Get Google OAuth URL
POST   /api/auth/google/callback       Handle Google OAuth callback
```

### Trips

```
GET    /api/trips                      List user's trips
GET    /api/trips/:id                  Get trip details
POST   /api/trips                      Create new trip
PUT    /api/trips/:id                  Update trip
DELETE /api/trips/:id                  Delete trip
```

## Example Requests

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "message": "Account created successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Trip

```bash
curl -X POST http://localhost:5000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Paris Summer 2026",
    "description": "Amazing trip to Paris",
    "start_date": "2026-06-01",
    "end_date": "2026-06-15",
    "location_name": "Paris, France",
    "location_lat": 48.8566,
    "location_lng": 2.3522
  }'
```

## Database Schema

The following tables are automatically created:

- **users** - User accounts with authentication
- **trips** - Trip records
- **trip_members** - Trip collaborators
- **trip_steps** - Itinerary items
- **documents** - Uploaded files
- **expenses** - Trip expenses
- **expense_splits** - Expense splitting
- **accommodations** - Lodging info
- **transports** - Flight/train info
- **activities** - Things to do
- **messages** - Group chat
- **invitations** - Collaboration invites

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login/register, include the token in request headers:

```
Authorization: Bearer <your_jwt_token>
```

Tokens expire according to `JWT_EXPIRY` setting (default: 7 days).

## Error Responses

```json
{
  "error": "Email already registered"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `409` - Conflict (e.g., email exists)
- `500` - Server error

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

- Check MySQL is running
- Verify credentials in `.env`
- Verify database `homeaway` exists

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

Change port in `.env` or kill the process using port 5000.

### JWT Token Errors

- Token might be expired
- Check `JWT_SECRET` matches if redeploying
- Include `Bearer` prefix in Authorization header

## Development

### Project Structure

```
backend/
├── config/
│   └── database.js        Database configuration
├── middleware/
│   └── auth.js           JWT middleware
├── routes/
│   ├── auth.js           Authentication routes
│   └── trips.js          Trip routes
├── server.js             Main server file
└── .env                  Environment variables
```

### Adding New Routes

1. Create file in `routes/` folder
2. Use Express Router
3. Import and use in `server.js`
4. Add authentication middleware as needed

## Deployment

### Environment Variables for Production

⚠️ **CHANGE THESE BEFORE DEPLOYING!**

```env
NODE_ENV=production
JWT_SECRET=generate-a-random-secret
DB_HOST=your-production-db-host
DB_PASSWORD=your-strong-password
FRONTEND_URL=https://your-domain.com
```

### Deployment Platforms

- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **aws EC2**: Deploy manually or using CI/CD

## License

MIT

## Support

For issues, please create an issue in the GitHub repository.
