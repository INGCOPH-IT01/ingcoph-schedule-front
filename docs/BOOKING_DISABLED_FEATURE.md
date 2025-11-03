# Booking Disabled Feature Implementation

## Overview
This feature checks the company setting `user_booking_enabled` when loading sports in the NewBookingDialog component. If booking is disabled for regular users, a snackbar notification is displayed.

## Changes Made

### 1. New Component: `BookingDisabledSnackbar.vue`
Created a reusable snackbar component that displays booking disabled messages.

**Features:**
- Customizable title, message, color, icon, timeout, and location
- Uses v-model for two-way binding
- Consistent UI following Vuetify standards
- Reusable across multiple components

**Props:**
- `modelValue` (Boolean): Controls visibility
- `title` (String): Snackbar title (default: "Booking Unavailable")
- `message` (String): Snackbar message
- `color` (String): Snackbar color (default: "error")
- `icon` (String): Icon to display (default: "mdi-alert-circle")
- `timeout` (Number): Auto-hide timeout in ms (default: 5000)
- `location` (String): Position on screen (default: "top")

### 2. Updated: `NewBookingDialog.vue`

**Added imports:**
```javascript
import BookingDisabledSnackbar from './BookingDisabledSnackbar.vue'
```

**Added reactive variables:**
```javascript
const bookingDisabledSnackbar = ref(false)
const bookingDisabledMessage = ref('')
```

**Updated `fetchSports()` function:**
The function now:
1. Checks if user booking is enabled via `companySettingService.isUserBookingEnabled()`
2. If disabled, checks the current user's role
3. Shows snackbar for regular users (not admin/staff)
4. Allows admin/staff to proceed even if booking is disabled
5. Prevents fetching sports if booking is disabled for regular users

**Added to template:**
```vue
<BookingDisabledSnackbar
  v-model="bookingDisabledSnackbar"
  :message="bookingDisabledMessage"
/>
```

### 3. Updated: `Home.vue`

**Refactored to use reusable component:**
Replaced the inline snackbar implementation with the new `BookingDisabledSnackbar` component for consistency across the application.

## User Flow

### Regular Users
1. User opens the booking dialog
2. `fetchSports()` is called
3. System checks `user_booking_enabled` setting
4. If disabled:
   - Snackbar appears with message: "Booking is currently disabled. Please contact the administrator for more information."
   - Sports list is not loaded
   - User cannot proceed with booking

### Admin/Staff Users
1. User opens the booking dialog
2. `fetchSports()` is called
3. System checks `user_booking_enabled` setting
4. Even if disabled:
   - No snackbar appears
   - Sports list loads normally
   - Admin/staff can create bookings

## Technical Details

### Company Setting Service
The implementation uses `companySettingService.isUserBookingEnabled()` which:
- Fetches the `user_booking_enabled` setting from the backend
- Uses caching to avoid repetitive API calls
- Defaults to `true` if the setting is missing (backward compatibility)

### Role-Based Permissions
- **Regular users**: Affected by the `user_booking_enabled` setting
- **Admin**: Can always create bookings regardless of setting
- **Staff**: Can always create bookings regardless of setting

## Testing

To test this feature:

1. **Enable Booking:**
   - Set `user_booking_enabled` to `true` in company settings
   - Regular users should be able to open booking dialog and see sports
   - Admin/staff should function normally

2. **Disable Booking:**
   - Set `user_booking_enabled` to `false` in company settings
   - Regular users should see the snackbar when opening booking dialog
   - Sports list should not load for regular users
   - Admin/staff should still be able to create bookings

## Benefits

1. **Reusability**: The `BookingDisabledSnackbar` component can be used in other parts of the application
2. **Consistency**: UI/UX is consistent across Home.vue and NewBookingDialog.vue
3. **Maintainability**: Centralized snackbar logic makes future updates easier
4. **Role-Based Control**: Admins can always manage bookings even when user booking is disabled
5. **User Experience**: Clear messaging when booking is unavailable

## Files Modified

- `src/components/BookingDisabledSnackbar.vue` (New)
- `src/components/NewBookingDialog.vue` (Modified)
- `src/views/Home.vue` (Modified)

## Related Services

- `companySettingService.js`: Handles company settings and caching
- Backend API: `/company-settings` endpoint provides the `user_booking_enabled` flag
