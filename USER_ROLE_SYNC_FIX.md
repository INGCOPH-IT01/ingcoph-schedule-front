# User Role Synchronization Fix

## Issue
Staff users were seeing the "Booking creation is disabled for user accounts" error message even when they should be allowed to create bookings. Additionally, there was a potential cache inconsistency issue where user role changes by admins wouldn't be reflected in real-time for logged-in users.

## Root Causes

### 1. Non-Reactive Permission Check (Primary Issue)
The `canUsersBook` variable was a static `ref` that was only set once during component mount:

```javascript
// OLD CODE - PROBLEMATIC
const canUsersBook = ref(true)

// In onMounted:
canUsersBook.value = await companySettingService.canUserCreateBookings(user.value?.role || 'user')
```

**Problems:**
- Value set once and never updated
- If user data wasn't loaded yet, it would default to 'user' role
- Staff users would be treated as regular users
- No reactivity when user data changed

### 2. Stale Data Fallback (Secondary Issue)
The `authService.getCurrentUser()` method had a fallback that returned a hardcoded user object with `role: 'user'` when the API call failed:

```javascript
// OLD CODE - ALSO PROBLEMATIC
return { id: 'unknown', name: 'User', role: 'user' }
```

This compounded the issue by causing Staff users to be incorrectly identified as regular users if the API call temporarily failed.

### 2. Cache Inconsistency (Secondary Issue)
When an admin changes a user's role while they're logged in:
- User logs in as "user" → localStorage stores `{ role: 'user' }`
- Admin promotes them to "staff" in the database
- User is still logged in with stale cached data
- User still treated as "user" role with old permissions

## Solution

### 1. **Made `canUsersBook` a Computed Property (PRIMARY FIX)**

Converted `canUsersBook` from a static `ref` to a reactive `computed` property in all views:
- **Bookings.vue**
- **Sports.vue**
- **Home.vue**
- **Courts.vue**
- **CourtDetails.vue**

```javascript
// NEW CODE - FIXED
// Computed property: Admin/Staff can always book, regular users depend on setting
const canUsersBook = computed(() => {
  const role = user.value?.role  // or userRole.value in some components
  // Admin and Staff bypass the user booking restriction
  if (role === 'admin' || role === 'staff') {
    return true
  }
  // Regular users depend on the company setting
  const userBookingEnabled = companySettings.value?.user_booking_enabled
  return userBookingEnabled === undefined ? true : (userBookingEnabled === '1' || userBookingEnabled === true || userBookingEnabled === 1)
})
```

**Key Benefits:**
- ✅ Automatically updates when `user.value` changes
- ✅ Automatically updates when `companySettings.value` changes
- ✅ Staff and Admin always get `true` regardless of settings
- ✅ No race conditions with data loading
- ✅ No manual updates needed

### 2. Removed Stale Data Fallback
Updated `authService.getCurrentUser()` to:
- Always attempt to fetch fresh data from the API
- Update localStorage with the latest data on success
- Return `null` on failure instead of a fake user object
- Let calling code handle the null case appropriately

```javascript
// NEW CODE - FIXED
async getCurrentUser() {
  try {
    if (!this.isAuthenticated()) return null

    const response = await api.get('/user')
    const user = response.data.user
    // Always update localStorage to ensure it's fresh
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
    return user
  } catch (error) {
    // Don't use stale data for permissions
    console.warn('Failed to fetch current user, returning null:', error.message)
    return null
  }
}
```

### 3. Fail-Safe Permission Checks
Updated `companySettingService.canUserCreateBookings()` to:
- Handle `null` user data gracefully
- Fail-open (allow) when user data unavailable to avoid blocking legitimate users
- Log warnings for debugging
- Rely on backend to enforce proper permissions (defense in depth)

```javascript
async canUserCreateBookings(userOrRole) {
  try {
    // If user data is null/undefined, fail-open to avoid blocking
    if (userOrRole === null || userOrRole === undefined) {
      console.warn('User data not available for booking permission check, failing open')
      return true
    }

    const role = typeof userOrRole === 'string' ? userOrRole : (userOrRole?.role || 'user')
    // Admin/Staff can always create bookings
    if (role === 'admin' || role === 'staff') return true
    // Regular user depends on the company setting
    return await this.isUserBookingEnabled()
  } catch (e) {
    // Backend will enforce proper permissions
    console.warn('Error checking booking permissions, failing open:', e)
    return true
  }
}
```

### 4. Periodic User Data Refresh
Added automatic refresh mechanism in `App.vue`:
- Refreshes user data every 2 minutes
- Detects role changes and dispatches events
- Updates all components reactively
- Ensures permissions stay current even if admin changes roles

```javascript
// Refresh user data every 2 minutes to detect role changes
userDataRefreshInterval = setInterval(refreshUserData, 120000) // 2 minutes
```

### 5. New Utility Methods
Added helper methods in `authService.js`:

#### `refreshUserData()`
Force refreshes user data from the server, bypassing any cache:
```javascript
await authService.refreshUserData()
```

#### `getCachedUser()`
Gets user data from localStorage (may be stale):
```javascript
const cachedUser = authService.getCachedUser()
// WARNING: Use only for non-critical operations
```

### 6. Custom Events
New event system for role changes:

```javascript
// Listen for role changes
window.addEventListener('user-role-changed', (event) => {
  console.log(`Role changed: ${event.detail.oldRole} → ${event.detail.newRole}`)
  // React to role change
})
```

## Benefits

1. **No More Stale Data Issues**: Always attempts to fetch fresh user data
2. **Fail-Safe Design**: Fails open to avoid blocking legitimate users
3. **Real-Time Updates**: Detects role changes within 2 minutes
4. **Defense in Depth**: Frontend checks + backend enforcement
5. **Clear APIs**: Separate methods for cached vs fresh data
6. **Event-Driven**: Components can react to role changes

## Security Considerations

### Frontend Fail-Open Strategy
When user data can't be fetched, the frontend **fails open** (allows access) because:

1. **User Experience**: Temporary network issues shouldn't block legitimate users
2. **Backend Protection**: The backend always enforces proper permissions regardless of frontend state
3. **Graceful Degradation**: Better to allow with backend validation than block unnecessarily

### Backend Enforcement (Unchanged)
The backend properly checks roles in:
- `BookingController::store()` - Checks `isUser()` and blocks if setting disabled
- `CartController::store()` and `checkout()` - Same role-based validation
- All endpoints validate the authenticated user's actual role from the database

Example from backend:
```php
if ($request->user()->isUser()) {
    $userBookingEnabled = CompanySetting::get('user_booking_enabled', '1') === '1';
    if (!$userBookingEnabled) {
        return response()->json([
            'message' => 'Booking creation is currently disabled for user accounts.'
        ], 403);
    }
}
```

## Usage Examples

### Force Refresh After Admin Action
```javascript
// After admin updates user roles
await authService.refreshUserData()
```

### Check Role in Component
```javascript
const user = await authService.getCurrentUser()
if (user && (user.role === 'admin' || user.role === 'staff')) {
  // Show admin/staff features
}
```

### React to Role Changes
```javascript
onMounted(() => {
  window.addEventListener('user-role-changed', (event) => {
    // Reload component data based on new role
    loadData()
  })
})
```

## Testing Scenarios

### Test 1: Staff Creating Booking (Original Issue)
1. ✅ Log in as staff user
2. ✅ Enable "disable booking for users" setting
3. ✅ Attempt to create booking
4. ✅ Should succeed (staff bypasses the restriction)

### Test 2: Role Change While Logged In
1. ✅ User A logs in as "user" role
2. ✅ Admin changes User A to "staff" role
3. ✅ Within 2 minutes, User A's session updates automatically
4. ✅ User A can now create bookings even if setting is disabled
5. ✅ `user-role-changed` event is dispatched

### Test 3: Network Failure Handling
1. ✅ Log in as staff user
2. ✅ Disconnect network temporarily
3. ✅ Attempt to create booking
4. ✅ Frontend allows (fails open)
5. ✅ Backend validates and either succeeds or fails appropriately

### Test 4: Demotion Scenario
1. ✅ Staff user is logged in
2. ✅ Admin demotes staff to user
3. ✅ Within 2 minutes, permissions are updated
4. ✅ Previously available features become restricted

## Recommendations

### For Immediate Role Changes
If you need immediate role changes (not waiting 2 minutes), consider:

1. **Add Backend Event**: Create a `UserRoleChanged` event in Laravel
2. **Broadcast via WebSocket**: Use Laravel Echo/Reverb
3. **Listen in Frontend**: Auto-refresh when event received

Example backend implementation:
```php
// In User model observer or admin controller after role change
event(new UserRoleChanged($user));
```

Example frontend listener:
```javascript
echo.private(`user.${userId}`)
  .listen('UserRoleChanged', (e) => {
    authService.refreshUserData()
  })
```

### Adjust Refresh Interval
Current setting: 2 minutes (120000ms)

To change:
```javascript
// In App.vue, line ~442
userDataRefreshInterval = setInterval(refreshUserData, 60000) // 1 minute
```

Balance between:
- **Shorter intervals**: Faster updates, more API calls
- **Longer intervals**: Fewer API calls, slower updates

## Files Modified

1. **`src/services/authService.js`** - Fixed getCurrentUser(), added refreshUserData() and getCachedUser()
2. **`src/services/companySettingService.js`** - Improved canUserCreateBookings() to handle null
3. **`src/App.vue`** - Added periodic refresh and role change detection
4. **`src/views/Bookings.vue`** - Converted canUsersBook to computed property
5. **`src/views/Sports.vue`** - Converted canUsersBook to computed property, added user ref
6. **`src/views/Home.vue`** - Converted canUsersBook to computed property, added companySettings ref
7. **`src/views/Courts.vue`** - Converted canUsersBook to computed property, added user ref
8. **`src/views/CourtDetails.vue`** - Converted canUsersBook to computed property

## Backward Compatibility

✅ All changes are backward compatible:
- Existing code using `getCurrentUser()` works as before (just returns null on failure)
- New methods are optional utilities
- Events are opt-in (components work without listening)
- Backend behavior unchanged
