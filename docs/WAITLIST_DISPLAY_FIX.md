# Waitlist Display Fix - BookingDetailsDialog

## Issue

Waitlist bookings were not showing in the BookingDetailsDialog even though waitlist entries existed in the database.

## Root Cause

In `BookingDetailsDialog.vue`, the `loadWaitlistEntries()` function was only being called when `showAdminFeatures` was true:

```javascript
// OLD CODE (Line 2924-2927) - BUGGY
// Load waitlist entries (only for admin/staff)
if (props.showAdminFeatures) {
  loadWaitlistEntries()
}
```

This meant:
- ❌ Non-admin users couldn't see waitlist entries
- ❌ Even when viewing as admin, if `showAdminFeatures` prop wasn't passed, waitlist wouldn't load

## The Fix

Changed line 2924 to ALWAYS load waitlist entries:

```javascript
// NEW CODE (Line 2924-2925) - FIXED
// Load waitlist entries (for all users to see who's waiting)
loadWaitlistEntries()
```

## What This Enables

### Display Sections

There are TWO waitlist display sections in the dialog:

#### 1. Admin-Only Detailed View (Line 579)
```vue
<div v-if="showAdminFeatures && !loadingWaitlist && waitlistEntries.length > 0">
  <!-- Detailed cards with full information -->
</div>
```

**Shows:**
- Full user details
- Court information with surface type
- Time slots
- Number of players
- Notification timestamps
- Expiration deadlines
- Notes

#### 2. General Waitlist Queue (Line 1108)
```vue
<div v-if="waitlistEntries.length > 0 || loadingWaitlist">
  <!-- List view for all users -->
</div>
```

**Shows:**
- Queue position badges (#1, #2, etc.)
- User name and email
- Status (Pending, Notified, Converted)
- Price
- Join date
- Notification/Expiration times

## Database State (Current)

```
Booking #1 (admin, pending)
    ↓ linked via pending_booking_id
Waitlist #1 (user, pending, position 1)
    ↓
Cart Transaction #2 (user, has cart items)
```

## How to Verify the Fix

### Test Steps:

1. **Open the app** (make sure frontend is running)

2. **Navigate to Admin Dashboard** or Calendar View

3. **Click on Booking #1** (the admin's pending booking)

4. **Scroll down in the BookingDetailsDialog**

5. **Look for "Waitlist Queue" section**

**Expected Result:**
```
┌────────────────────────────────────┐
│ 📋 Waitlist Queue    1 person      │
│         waiting                     │
├────────────────────────────────────┤
│                                     │
│ #1  👤 Karlo Alfonso  📋 Pending  │
│     📧 email@example.com           │
│     ⏰ Joined X minutes ago        │
│     💰 ₱500.00                     │
│                                     │
└────────────────────────────────────┘
```

## Technical Details

### API Endpoint

When booking is viewed, frontend calls:

```
GET /api/bookings/1/waitlist
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 2,
      "pending_booking_id": 1,
      "court_id": 1,
      "position": 1,
      "status": "pending",
      "user": {
        "name": "Karlo Alfonso",
        "email": "user@example.com"
      },
      "court": {
        "name": "Court 1"
      }
    }
  ]
}
```

### Backend Endpoint

```php
// app/Http/Controllers/Api/BookingController.php
public function getWaitlistEntries($id)
{
    $booking = Booking::findOrFail($id);

    $waitlistEntries = $booking->waitlistEntries()
        ->with(['user', 'court', 'sport'])
        ->orderBy('position', 'asc')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $waitlistEntries
    ]);
}
```

### Model Relationship

```php
// app/Models/Booking.php
public function waitlistEntries(): HasMany
{
    return $this->hasMany(BookingWaitlist::class, 'pending_booking_id');
}
```

## Files Modified

| File | Line | Change |
|------|------|--------|
| `src/components/BookingDetailsDialog.vue` | 2924-2925 | Removed `if (props.showAdminFeatures)` condition |

## Status Colors

The waitlist entries display with color-coded status:

| Status | Color | Icon |
|--------|-------|------|
| Pending | Warning (Orange) | ⏰ mdi-clock-alert |
| Notified | Info (Blue) | 🔔 mdi-bell-ring |
| Converted | Success (Green) | ✅ mdi-check |
| Expired | Grey | ⌛ mdi-clock-alert |
| Cancelled | Error (Red) | ❌ mdi-close |

## Summary

**Problem**: Waitlist data wasn't loading because it was gated behind `showAdminFeatures` check
**Solution**: Remove the conditional and always load waitlist data
**Result**: Waitlist section now displays for all users when viewing a booking with waitlist entries

**Status**: 🟢 **FIXED**

Refresh your browser and check Booking #1 - you should now see the waitlist section!
