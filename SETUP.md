# Setup Guide for MongoDB Authentication

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas account)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/kadarla-designs
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kadarla-designs?retryWrites=true&w=majority

# Server Port
PORT=5000

# JWT Secret (Change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend API URL (optional, defaults to http://localhost:5000/api)
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Backend Server
```bash
# Development mode with auto-reload
npm run dev:server

# OR production mode
npm run server
```

The server will start on `http://localhost:5000`

### 4. Start the Frontend
In a separate terminal:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current user (requires authentication token in header)
```
Authorization: Bearer <token>
```

## User Schema

The User model includes:
- `fullName`: String (required)
- `email`: String (required, unique)
- `phone`: String (required, 10 digits)
- `password`: String (required, min 8 characters, hashed)
- `role`: String (enum: 'user' | 'admin', default: 'user')
- `createdAt`: Date
- `updatedAt`: Date

## Features

- ✅ User registration with validation
- ✅ User login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Email and phone uniqueness validation
- ✅ Token-based authentication
- ✅ Protected routes support

## Notes

- Passwords are automatically hashed before saving
- JWT tokens expire after 7 days
- User passwords are never returned in API responses
- All API responses follow a consistent format with `success`, `message`, and `data` fields

