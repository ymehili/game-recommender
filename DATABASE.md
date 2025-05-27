# Database Management Guide

This guide explains how to set up, view, and manage the database for your Game Recommender app deployed on Vercel.

## Current Database Setup

The app has been migrated from in-memory storage to **Vercel KV** (Redis) for persistent data storage. This ensures user data persists between deployments and server restarts.

## Setting Up the Database

### 1. Add Vercel KV to Your Project

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to the "Storage" tab
4. Click "Create Database"
5. Select "KV" (Key-Value Store)
6. Give it a name (e.g., "game-recommender-db")
7. Create the database

Vercel will automatically add the required environment variables to your project:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 2. Set Admin Secret

Add an admin secret to your environment variables for database access:

1. In your Vercel project settings
2. Go to "Environment Variables"
3. Add `ADMIN_SECRET` with a secure random value
4. Redeploy your app

## Viewing and Managing the Database

### Option 1: Web Admin Panel

Visit `https://your-app-url.vercel.app/admin` to access the web-based admin panel.

**Features:**
- View database statistics (total users, preferences)
- List all users with details
- Delete users
- Real-time data refresh

**Authentication:**
- Enter your `ADMIN_SECRET` to access the panel
- The secret is set in your Vercel environment variables

### Option 2: API Endpoints

You can interact with the database using HTTP requests:

#### Get Database Stats
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  "https://your-app-url.vercel.app/api/admin/database?action=stats"
```

#### Get All Users
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  "https://your-app-url.vercel.app/api/admin/database?action=users"
```

#### Delete a User
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  "https://your-app-url.vercel.app/api/admin/database?userId=USER_ID"
```

### Option 3: Command Line Tool

Use the included CLI tool for database management:

#### Basic Usage
```bash
# View database statistics
node scripts/db-admin.js stats

# List all users
node scripts/db-admin.js users

# Delete a specific user
node scripts/db-admin.js delete-user USER_ID

# Show help
node scripts/db-admin.js help
```

#### Environment Setup for CLI
```bash
export ADMIN_SECRET="your-admin-secret"
export VERCEL_URL="your-app-url.vercel.app"
```

## Database Structure

### Data Storage Pattern

The database uses the following key patterns:

- `user:${userId}` - User account data (with hashed password)
- `user_email:${email}` - Email to user ID mapping
- `preferences:${userId}` - User game preferences and ratings

### Data Types Stored

1. **User Accounts**
   - ID, username, email, creation date
   - Hashed passwords (bcrypt)

2. **User Preferences**
   - Rated games with scores (1-5 stars)
   - Game metadata (name, cover, etc.)
   - Rating timestamps

## Migration from In-Memory Storage

The app automatically handles migration from the old in-memory system. The migration:

1. Converts liked games to 4-star ratings
2. Converts disliked games to 2-star ratings  
3. Preserves all game metadata
4. Maintains user authentication

## Security Considerations

1. **Admin Access**: Protected by `ADMIN_SECRET` environment variable
2. **Password Security**: Uses bcrypt hashing with salt rounds of 12
3. **JWT Tokens**: 7-day expiration with configurable secret
4. **Data Isolation**: Each user's data is stored separately

## Backup and Recovery

### Manual Backup (via API)
```bash
# Export all users
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  "https://your-app-url.vercel.app/api/admin/database?action=users" \
  > users_backup.json
```

### Vercel KV Built-in Features
- Automatic replication across regions
- Point-in-time recovery (Enterprise plans)
- High availability and durability

## Monitoring and Alerts

### Database Statistics
- Monitor user growth through the admin panel
- Track preferences storage usage
- Monitor API response times

### Vercel KV Dashboard
- Access through Vercel dashboard → Storage → Your KV database
- View key count, memory usage, and operations
- Set up usage alerts

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Check `ADMIN_SECRET` environment variable
   - Ensure the secret matches in all requests

2. **Connection errors**
   - Verify KV database is properly configured
   - Check environment variables are set

3. **Data not persisting**
   - Confirm migration from in-memory to KV is complete
   - Check Vercel deployment logs

### Debug Commands
```bash
# Test admin API access
curl -v -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  "https://your-app-url.vercel.app/api/admin/database?action=stats"

# Check environment variables (in Vercel dashboard)
# Settings → Environment Variables
```

## Performance Considerations

- **Read Operations**: Optimized with direct key lookups
- **Write Operations**: Atomic updates for consistency
- **Memory Usage**: Efficient JSON storage in Redis
- **Scaling**: Vercel KV handles scaling automatically

## Cost Monitoring

Vercel KV pricing is based on:
- Storage used (keys and data size)
- Operations per month (reads/writes)
- Bandwidth

Monitor usage in the Vercel dashboard to track costs.

---

For additional help, check the Vercel KV documentation or contact support through your Vercel dashboard. 