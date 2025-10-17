# Sports "Book Now" Feature Implementation

## Overview
Enhanced the Sports page to allow users to directly book a court by clicking the "Book Now" button on any sport card. The button now opens the NewBookingDialog component with the selected sport pre-selected and automatically advances to step 2 (Court & Time Slot selection).

## Changes Made

### 1. NewBookingDialog.vue Component
**File:** `/src/components/NewBookingDialog.vue`

#### Added New Prop
- **`preselectedSport`** (Object, optional): Allows passing a sport object to pre-select when the dialog opens

```javascript
props: {
  isOpen: {
    type: Boolean,
    default: false
  },
  preselectedSport: {
    type: Object,
    default: null
  }
}
```

#### Enhanced Dialog Behavior
- Modified the `watch(() => props.isOpen)` handler to:
  - Fetch sports and courts data
  - If `preselectedSport` is provided, automatically:
    - Find the matching sport in the loaded sports list
    - Select that sport using the `selectSport()` method
    - Advance to step 2 (Court & Time Slot selection)

- Updated `onMounted` with the same logic for consistency

### 2. Sports.vue Page
**File:** `/src/views/Sports.vue`

#### Imported NewBookingDialog Component
```javascript
import NewBookingDialog from '../components/NewBookingDialog.vue'
```

#### Added State Management
- **`bookingDialogOpen`**: Controls the visibility of the booking dialog
- **`selectedSportForBooking`**: Stores the sport selected for booking

#### Updated handleBookNowClick Function
```javascript
const handleBookNowClick = (sport) => {
  // Check if user is authenticated
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  // Open booking dialog with the selected sport
  selectedSportForBooking.value = sport
  bookingDialogOpen.value = true
}
```

#### Added Dialog Management Functions
- **`closeBookingDialog()`**: Closes the dialog and clears the selected sport
- **`handleBookingCreated()`**: Handles successful booking creation

#### Added Dialog Component to Template
```vue
<NewBookingDialog
  :is-open="bookingDialogOpen"
  :preselected-sport="selectedSportForBooking"
  @close="closeBookingDialog"
  @booking-created="handleBookingCreated"
/>
```

## User Flow

1. **User views Sports page**: Sees all available sports with "Book Now" buttons
2. **User clicks "Book Now"** on a specific sport (e.g., Badminton)
3. **Authentication check**: If not logged in, redirects to login page
4. **Dialog opens**: NewBookingDialog opens with:
   - The selected sport already highlighted
   - Step 2 (Court & Time Slot selection) displayed
   - Available courts for that sport shown
5. **User selects court and time slots**: Can immediately choose desired time slots
6. **User proceeds to confirmation**: Reviews and completes booking with payment

## Benefits

1. **Improved UX**: Users can book directly from the Sports page without extra navigation
2. **Faster booking process**: Skips step 1 (sport selection) since the sport is already known
3. **Contextual flow**: Users who know which sport they want can book immediately
4. **Maintains flexibility**: The Courts page and manual booking flow still work as before
5. **Authentication preserved**: Login check ensures only authenticated users can book

## Technical Notes

- The dialog maintains its original functionality when opened without a preselected sport
- The sport selection is based on sport ID matching to ensure accuracy
- Uses Vue 3 composition API with refs and watchers for reactive state management
- No breaking changes to existing booking flows
- Properly handles dialog lifecycle (open/close/reset)

## Testing Recommendations

1. Click "Book Now" on different sports and verify correct sport is pre-selected
2. Test authentication redirect when not logged in
3. Verify step 2 shows correct courts for the selected sport
4. Complete a booking end-to-end from Sports page
5. Test on mobile devices to ensure dialog is responsive
6. Verify existing booking flows (from Courts page) still work correctly
