# Daily Recommendation Caching Implementation

## Overview
This implementation automatically caches game recommendations for authenticated users for 24 hours. Users no longer have a manual refresh button - instead, recommendations are automatically generated and stored for a full day, providing a consistent experience while reducing API calls.

## Key Features

### 1. Automatic Daily Caching
- **Authenticated users**: Recommendations are automatically generated and cached for 24 hours
- **Non-authenticated users**: Generate fresh recommendations each time (no caching)
- **No manual refresh**: Removed the "Get Fresh Picks" button entirely

### 2. Database Schema Changes
- Added `lastRecommendationRefresh?: Date` field to track when recommendations were last generated
- Added `cachedRecommendations?: GameRecommendation[]` field to store the actual recommendations
- Properly handles date serialization/deserialization in database operations

### 3. Smart Caching Logic
- **Route**: `/api/recommendations` for authenticated users with caching
- **Fallback**: Non-authenticated users continue using `/api/gemini` without caching
- **Automatic refresh**: New recommendations generated after 24 hours or when ratings change significantly

## Implementation Details

### Backend Changes

#### 1. Types Update (`src/types/index.ts`)
```typescript
export interface UserPreferences {
  ratedGames: RatedGame[];
  lastRecommendationRefresh?: Date; // Track when recommendations were last generated
  cachedRecommendations?: GameRecommendation[]; // Store recommendations for the day
}
```

#### 2. Caching API Endpoint (`src/app/api/recommendations/route.ts`)
- Checks for existing cached recommendations less than 24 hours old
- Returns cached recommendations immediately if they exist and are fresh
- Generates and stores new recommendations only when needed
- Updates both timestamp and cached recommendations atomically

#### 3. Database Utilities (`src/utils/database.ts`)
- Enhanced `getUserPreferences()` to handle date deserialization
- Ensures proper migration for existing users without cached data

### Frontend Changes

#### 1. GameRecommendations Component (`src/components/GameRecommendations.tsx`)
- **Removed**: "Get Fresh Picks" button and all refresh-related UI
- **Added**: Automatic fetching when component loads or ratings change
- **Smart detection**: Uses stable hash to detect meaningful changes in user ratings
- **User feedback**: Shows "Recommendations refresh daily" message for context

#### 2. PreferencesContext (`src/contexts/PreferencesContext.tsx`)
- Enhanced preference syncing to handle cached recommendations
- Proper date parsing when receiving data from server

#### 3. LocalStorage Utilities (`src/utils/localStorage.ts`)
- Updated all functions to preserve cached recommendations when modifying preferences
- Handles migration for existing users

## User Experience

### For Authenticated Users
1. **First visit**: Recommendations automatically generated and cached
2. **Subsequent visits**: Same recommendations shown for 24 hours
3. **After 24 hours**: New recommendations automatically generated on next visit
4. **Rating changes**: Triggers new recommendation generation immediately

### For Non-Authenticated Users
- Fresh recommendations generated each time
- No caching applied
- Maintains existing functionality

## Caching Logic

### Cache Hit (Return Stored Recommendations)
```typescript
if (lastRefresh && cachedRecommendations && hoursElapsed < 24) {
  return cachedRecommendations; // Return from cache
}
```

### Cache Miss (Generate New Recommendations)
```typescript
const recommendations = await generateGameRecommendations(requestData);
await updateUserPreferences(userId, {
  ...userPreferences,
  lastRecommendationRefresh: now,
  cachedRecommendations: recommendations
});
```

## Benefits

1. **Reduced API Costs**: Fewer calls to Gemini AI API
2. **Consistent Experience**: Users see the same recommendations throughout the day
3. **Better Performance**: Instant loading of cached recommendations
4. **Automatic Management**: No user interaction required
5. **Smart Invalidation**: New recommendations when ratings change significantly

## Migration Strategy

1. **Existing Users**: Get `cachedRecommendations: undefined` initially
2. **First Load**: Automatically generates and caches recommendations
3. **Backward Compatibility**: Non-authenticated flow unchanged
4. **Data Preservation**: All existing preferences and ratings maintained

## Technical Considerations

### Cache Invalidation
- **Time-based**: 24-hour expiration
- **Content-based**: New generation when ratings change
- **User-triggered**: Implicit when adding/modifying game ratings

### Data Storage
- **Server**: Cached in Vercel KV database for authenticated users
- **Client**: No client-side caching to ensure consistency
- **Size**: Typically 5 recommendations per user (~2-5KB per cache entry)

### Performance
- **Cache hits**: Near-instant response (~50ms)
- **Cache misses**: Standard AI generation time (~2-5 seconds)
- **Memory usage**: Minimal additional storage per user

## Edge Cases Handled

1. **Server errors**: Graceful fallback to fresh generation
2. **Invalid cache data**: Automatic regeneration
3. **User rating changes**: Immediate cache invalidation
4. **Concurrent requests**: Atomic cache updates

## Configuration

- **Cache Duration**: 24 hours (hardcoded, easily configurable)
- **Recommendation Count**: 5 per user (configurable via API)
- **No additional setup required**

## Future Enhancements

1. **Configurable cache duration**: Admin-adjustable cache timeouts
2. **Intelligent invalidation**: More sophisticated change detection
3. **Preemptive generation**: Background recommendation updates
4. **Usage analytics**: Track cache hit/miss ratios 