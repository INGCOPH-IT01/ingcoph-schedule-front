# Staff Booking Permission Fix - Final Solution

## Problem
Staff users were seeing "Booking creation is disabled for user accounts" error even though:
- localStorage showed their role as "staff"
- They should bypass the booking restriction

## Root Cause
The computed property `canUsersBook` was checking `user.value?.role`, but if the API call to load user data failed or was delayed, `user.value` would be `null`, and the role check would fail. This caused staff users to be treated as regular users.

## Solution: localStorage Fallback in Computed Properties

Updated all `canUsersBook` computed properties to check localStorage as a fallback when `user.value` is not available:

```javascript
const canUsersBook = computed(() => {
  let role = user.value?.role

  // If user.value is not loaded yet, try localStorage as fallback
  if (!role) {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        role = parsedUser?.role
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Admin and Staff bypass the user booking restriction
  if (role === 'admin' || role === 'staff') {
    return true
  }

  // Regular users depend on the company setting
  const userBookingEnabled = companySettings.value?.user_booking_enabled
  return userBookingEnabled === undefined ? true : (userBookingEnabled === '1' || userBookingEnabled === true || userBookingEnabled === 1)
})
```

## How It Works

### Flow:
1. **First attempt**: Check `user.value?.role` (from API)
2. **Fallback**: If not available, check `localStorage.getItem('user')` and parse the role
3. **Permission check**:
   - If role is `'admin'` or `'staff'` → return `true` (can always book)
   - If role is `'user'` → check company setting `user_booking_enabled`
   - If role is undefined/null → default to checking company setting (fail-safe)

### Benefits:
✅ **Immediate access**: Staff users can create bookings even if API is slow/fails
✅ **No race conditions**: Works regardless of API timing
✅ **Fail-safe**: Falls back gracefully if data unavailable
✅ **Reactive**: Updates automatically when data changes
✅ **Consistent**: All views use the same logic

## Files Modified

1. ✅ **`src/views/Bookings.vue`** - Added localStorage fallback + debug logging
2. ✅ **`src/views/Sports.vue`** - Added localStorage fallback
3. ✅ **`src/views/Home.vue`** - Added localStorage fallback
4. ✅ **`src/views/Courts.vue`** - Added localStorage fallback
5. ✅ **`src/views/CourtDetails.vue`** - Added localStorage fallback

## Debug Logging

Added console logging in `Bookings.vue` to help debug:
```javascript
console.log('[Bookings] Using localStorage role fallback:', role)
console.log('[Bookings] Using user.value role:', role)
console.log('[Bookings] canUsersBook = true (admin/staff role)')
console.log('[Bookings] canUsersBook =', result, '(regular user, setting:', userBookingEnabled, ')')
```

Check your browser console to see which role is being used and what the permission result is.

## Testing

### Test Case 1: Staff User Creating Booking
1. ✅ Log in as staff user
2. ✅ Open booking dialog
3. ✅ Check console - should show: `[Bookings] canUsersBook = true (admin/staff role)`
4. ✅ No error message should appear
5. ✅ Booking creation should work

### Test Case 2: API Failure Scenario
1. ✅ Log in as staff user (localStorage populated)
2. ✅ Disable network in DevTools
3. ✅ Refresh page (API will fail)
4. ✅ Try to create booking
5. ✅ Should still work using localStorage fallback
6. ✅ Console shows: `[Bookings] Using localStorage role fallback: staff`

### Test Case 3: Regular User with Setting Disabled
1. ✅ Log in as regular user
2. ✅ Admin disables user booking (set `user_booking_enabled` to `'0'`)
3. ✅ Open booking dialog
4. ✅ Should see error message
5. ✅ Console shows: `[Bookings] canUsersBook = false (regular user, setting: 0)`

## Backend Security

**Important**: The frontend permission check is for UX only. Backend always validates:

```php
// In BookingController.php
if ($request->user()->isUser()) {
    $userBookingEnabled = CompanySetting::get('user_booking_enabled', '1') === '1';
    if (!$userBookingEnabled) {
        return response()->json([
            'message' => 'Booking creation is currently disabled for user accounts.'
        ], 403);
    }
}
```

Staff/Admin bypass this check because `$request->user()->isUser()` returns `false` for them.

## Troubleshooting

### If staff still can't book:

1. **Check localStorage**:
   ```javascript
   // In browser console:
   JSON.parse(localStorage.getItem('user'))
   // Should show: { role: 'staff', ... }
   ```

2. **Check console logs**:
   - Look for `[Bookings]` logs
   - Verify role is correctly detected
   - Check what canUsersBook value is

3. **Check backend**:
   - Ensure user's role in database is 'staff'
   - Check API response: `/api/user` should return `{ role: 'staff' }`

4. **Clear cache**:
   ```javascript
   // In browser console:
   localStorage.clear()
   // Then log in again
   ```

## Additional Improvements Made

1. **Periodic user data refresh** (`App.vue`): Refreshes every 2 minutes to detect role changes
2. **Event system**: Dispatches `user-role-changed` event when role updates
3. **Better error handling**: Graceful fallbacks throughout
4. **Improved authService**: No longer returns fake user data

## Status

🟢 **RESOLVED**: Staff users can now create bookings regardless of the user booking setting.
