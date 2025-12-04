# Debugging Guide - MongoDB Schema Not Creating

## Common Issues and Solutions

### 1. Check MongoDB Connection

First, verify your MongoDB connection is working:

```bash
# Test the database connection endpoint
curl http://localhost:5000/api/auth/test
```

Expected response:
```json
{
  "success": true,
  "message": "Database test successful",
  "data": {
    "connectionStatus": "connected",
    "isConnected": true,
    "userCount": 0,
    "databaseName": "kadarla-designs"
  }
}
```

### 2. Check Environment Variables

Make sure your `.env` file has the correct MongoDB URI:

```env
MONGODB_URI=mongodb://localhost:27017/kadarla-designs
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kadarla-designs
```

### 3. Check Server Logs

When you start the server, you should see:
```
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully
📊 Database: kadarla-designs
🏠 Host: localhost
🚀 Server running on port 5000
```

### 4. Check Registration Request

When registering, check the server console for:
```
📝 Signup request received: { fullName: '...', email: '...', phone: '...' }
💾 Attempting to save user...
✅ User saved successfully: <user_id>
✅ User registered successfully
```

### 5. Common Errors

#### Error: "MongoDB URI not found"
- **Solution**: Make sure `.env` file exists in the root directory
- **Solution**: Check that `MONGODB_URI` or `MONGO_URI` is set

#### Error: "Database not connected"
- **Solution**: Wait a few seconds after starting the server for MongoDB to connect
- **Solution**: Check if MongoDB is running (for local MongoDB)
- **Solution**: Verify your MongoDB URI is correct

#### Error: "Phone number must be 10 digits"
- **Solution**: The phone number is automatically cleaned (non-digits removed)
- **Solution**: Make sure you're entering exactly 10 digits

#### Error: "User with this email already exists"
- **Solution**: This means the user was actually created! Try logging in instead
- **Solution**: Use a different email address

### 6. Verify Data in MongoDB

#### Using MongoDB Compass or CLI:

```javascript
// Connect to your database
use kadarla-designs

// Check if users collection exists
show collections

// View all users
db.users.find().pretty()

// Count users
db.users.countDocuments()
```

### 7. Manual Testing

Test the signup endpoint directly:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "fullName": "Test User",
      "email": "test@example.com",
      "phone": "1234567890",
      "role": "user"
    },
    "token": "..."
  }
}
```

### 8. Check Browser Console

Open browser DevTools (F12) and check:
- Network tab: Look for the `/api/auth/signup` request
- Console tab: Check for any JavaScript errors
- Check the response status and body

### 9. Server Console Debugging

The server now logs detailed information:
- When a signup request is received
- When attempting to save the user
- When the user is saved successfully
- Any errors that occur

Watch your server console for these messages!

### 10. Still Not Working?

1. **Restart the server**: Stop and restart with `npm run dev:server`
2. **Check MongoDB is running**: For local MongoDB, ensure the service is running
3. **Check firewall/network**: For MongoDB Atlas, ensure your IP is whitelisted
4. **Check MongoDB logs**: Look at MongoDB server logs for connection issues
5. **Try a simple test**: Use the `/api/auth/test` endpoint to verify connection

