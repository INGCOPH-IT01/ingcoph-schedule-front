# Frontend Waitlist Display Fix

## Issue
Time slots with pending bookings were showing as "Booked" and were unselectable (disabled) in the frontend, even though the backend API correctly returned `is_waitlist_available: true`.

## Root Cause
The frontend was only checking the `slot.available` flag to determine:
1. If a slot should be clickable (`@click="slot.available && ..."`)
2. If a slot should be disabled (`:disabled="!slot.available"`)
3. If a slot should be marked as unavailable (`'unavailable': !slot.available`)
4. What label to show (`slot.available ? 'Available' : 'Booked'`)

Since waitlist slots have `available: false` but `is_waitlist_available: true`, they were incorrectly being treated as booked/unavailable.

## Solution
Updated the frontend to check **both** `slot.available` and `slot.is_waitlist_available` flags to properly handle three states:
1. **Available** - No bookings, can book directly
2. **Waitlist** - Pending bookings, can join waitlist
3. **Booked** - Approved bookings, cannot book

## Changes Made

### File: `NewBookingDialog.vue`

#### 1. Updated Slot Card Classes (Lines 240-244)

**Before:**
```vue
:class="['time-slot-card', {
  'selected': isTimeSlotSelected(court.id, slot.start),
  'unavailable': !slot.available
}]"
```

**After:**
```vue
:class="['time-slot-card', {
  'selected': isTimeSlotSelected(court.id, slot.start),
  'unavailable': !slot.available && !slot.is_waitlist_available,
  'waitlist': slot.is_waitlist_available
}]"
```

#### 2. Updated Click Handler (Line 245)

**Before:**
```vue
@click="slot.available && toggleTimeSlot(court.id, slot)"
```

**After:**
```vue
@click="(slot.available || slot.is_waitlist_available) && toggleTimeSlot(court.id, slot)"
```

#### 3. Updated Disabled State (Line 246)

**Before:**
```vue
:disabled="!slot.available"
```

**After:**
```vue
:disabled="!slot.available && !slot.is_waitlist_available"
```

#### 4. Updated Chip Color (Lines 260-261)

**Before:**
```vue
:color="slot.available ? 'success' : 'error'"
```

**After:**
```vue
:color="slot.is_booked ? 'error' : (slot.is_waitlist_available ? 'warning' : 'success')"
```

#### 5. Updated Chip Label (Lines 264-265)

**Before:**
```vue
{{ slot.available ? 'Available' : 'Booked' }}
```

**After:**
```vue
{{ slot.is_booked ? 'Booked' : (slot.is_waitlist_available ? 'Waitlist' : 'Available') }}
```

#### 6. Added Waitlist CSS Styling (Lines 2449-2462)

```css
.time-slot-card.waitlist {
  border-color: #ff9800;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(251, 140, 0, 0.05) 100%) !important;
}

.time-slot-card.waitlist:hover {
  border-color: #ff9800;
  box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);
}

.time-slot-card.waitlist .v-chip {
  background: #ff9800 !important;
  color: white !important;
}
```

## Visual Changes

### Before Fix
```
┌─────────────┐
│   07:00     │
│    to       │
│   08:00     │
│ [🔴 Booked] │  ← Unclickable, disabled
└─────────────┘
```

### After Fix
```
┌──────────────┐
│   07:00      │  ← Orange border
│    to        │
│   08:00      │
│ [🟠 Waitlist]│  ← Clickable, enabled
└──────────────┘
```

## Slot States

| State | available | is_booked | is_waitlist_available | Display | Color | Clickable |
|-------|-----------|-----------|----------------------|---------|-------|-----------|
| **Free** | `true` | `false` | `false` | Available | 🟢 Green | ✅ Yes |
| **Waitlist** | `false` | `false` | `true` | Waitlist | 🟠 Orange | ✅ Yes |
| **Booked** | `false` | `true` | `false` | Booked | 🔴 Red | ❌ No |

## User Experience

### Waitlist Slots
- **Visual**: Orange border, light orange background
- **Label**: "Waitlist" chip with orange color
- **Behavior**: Clickable and selectable
- **Action**: When clicked, adds to cart → triggers waitlist on checkout

### Available Slots
- **Visual**: White background, no special border
- **Label**: "Available" chip with green color
- **Behavior**: Clickable and selectable
- **Action**: When clicked, adds to cart → normal booking

### Booked Slots
- **Visual**: Gray background, reduced opacity
- **Label**: "Booked" chip with red color
- **Behavior**: Not clickable, disabled
- **Action**: None, slot is taken

## Testing

### Verify on 10/23/2025

1. **Navigate to booking page**
2. **Select date: 10/23/2025**
3. **Check 07:00-08:00 slot:**
   - Should show "Waitlist" chip (orange)
   - Should have orange border
   - Should be clickable ✅
   - Should NOT be disabled ✅

4. **Click the slot:**
   - Should be selectable
   - Should allow adding to cart
   - Backend will trigger waitlist flow

## API Flags Used

The frontend now properly uses these API response flags:

```javascript
{
  available: false,           // Whether slot is completely free
  is_booked: false,           // Whether slot is confirmed/approved
  is_waitlist_available: true, // Whether waitlist is available
  is_pending_approval: false, // Whether booking is pending approval (paid)
  is_unpaid: true,            // Whether pending booking is unpaid
  type: "waitlist_available", // Display type
  payment_status: "unpaid",   // Payment status
  approval_status: "pending"  // Approval status
}
```

## Logic Flow

```javascript
// Determine if slot is selectable
const isSelectable = slot.available || slot.is_waitlist_available;

// Determine slot status for display
const status = slot.is_booked
  ? 'Booked'
  : (slot.is_waitlist_available ? 'Waitlist' : 'Available');

// Determine chip color
const color = slot.is_booked
  ? 'error'
  : (slot.is_waitlist_available ? 'warning' : 'success');
```

## CSS Classes

- `.time-slot-card` - Base slot card
- `.time-slot-card.selected` - Selected slot (blue)
- `.time-slot-card.unavailable` - Unavailable slot (gray, disabled)
- `.time-slot-card.waitlist` - Waitlist slot (orange, enabled)

## Benefits

1. ✅ **Clear Visual Distinction** - Three different states with distinct colors
2. ✅ **Proper Functionality** - Waitlist slots are now clickable
3. ✅ **Better UX** - Users can see and select waitlist options
4. ✅ **Consistent Logic** - Frontend matches backend API response
5. ✅ **Accessible** - Orange color provides clear warning/pending indication

## Related Backend Changes

This frontend fix works with:
- `WAITLIST_DISPLAY_FIX.md` - Backend API changes
- `availableSlots` API endpoint - Returns `is_waitlist_available` flag
- `CartController` - Handles waitlist creation on booking attempt

## Summary

**Problem:** Waitlist slots showed as "Booked" and were unselectable

**Solution:** Check `is_waitlist_available` flag in addition to `available`

**Result:**
- 🟢 **Available** slots are green and clickable
- 🟠 **Waitlist** slots are orange and clickable
- 🔴 **Booked** slots are red and disabled

Users can now properly select and book waitlist-available time slots!
