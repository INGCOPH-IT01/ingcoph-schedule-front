# Booking Details View Feature for Admin/Staff

## Overview
This feature enables admin and staff users to view detailed booking information by clicking on bookings in the "Recent Bookings" tab of court detail pages.

## Implementation Date
October 17, 2025

## Files Modified

### 1. `/src/views/CourtDetails.vue`
**Changes:**
- Added role-based access control for viewing booking details
- Made booking list items clickable for admin/staff users with visual indicators (chevron icon)
- Added comprehensive booking details dialog with:
  - Customer information (name, email, phone)
  - Booking information (ID, court, date, time, status)
  - Time slots breakdown with individual prices
  - Payment information (method, total amount, creation date)
  - Notes section (if available)
- Added hover effects and cursor pointer for clickable bookings
- Imported `authService` for role checking
- Added computed property `isAdminOrStaff` to check user roles
- Added function `viewBookingDetailsDialog()` to open the dialog
- Added function `checkUserRole()` to fetch user role on component mount

### 2. `/src/views/CourtDetail.vue`
**Changes:**
- Applied the same changes as CourtDetails.vue for consistency
- Made booking list items clickable for admin/staff users
- Added booking details dialog with similar structure
- Added role checking functionality
- Added hover effects and visual indicators

## Features

### For Admin and Staff Users:
1. **Visual Indicators:**
   - Chevron icon (→) displayed on the right side of each booking
   - Hover effect with background color change and slide animation
   - Cursor changes to pointer on hover

2. **Booking Details Dialog Contains:**
   - **Customer Information Section:**
     - Full name
     - Email address
     - Phone number

   - **Booking Information Section:**
     - Unique booking ID
     - Court name
     - Booking date
     - Time range
     - Current status with color-coded chip

   - **Time Slots Section** (for CourtDetails.vue):
     - Individual time slot breakdown
     - Price per time slot
     - Start and end times formatted in 12-hour format

   - **Payment Information Section:**
     - Payment method used
     - Total amount in bold with success color
     - Creation timestamp

   - **Notes Section:**
     - Displays any additional notes if available

3. **User Experience:**
   - Click anywhere on the booking item to view details
   - Dialog can be closed via:
     - Close button in header (X icon)
     - Close button in footer
   - Dialog is persistent (won't close by clicking outside)
   - Responsive design adapts to different screen sizes

### For Regular Users:
- Booking list items remain non-clickable
- No chevron icon displayed
- View-only access to booking list

## Technical Implementation

### Role Checking:
```javascript
// Computed property to check if user is admin or staff
const isAdminOrStaff = computed(() => {
  return userRole.value === 'admin' || userRole.value === 'staff'
})

// Function to fetch user role
const checkUserRole = async () => {
  try {
    userRole.value = await authService.getUserRole()
  } catch (error) {
    console.error('Failed to get user role:', error)
    userRole.value = 'user'
  }
}
```

### Conditional Rendering:
```vue
<!-- Visual indicator only shown for admin/staff -->
<v-icon v-if="isAdminOrStaff" size="small" color="primary">mdi-chevron-right</v-icon>

<!-- Click handler only active for admin/staff -->
@click="isAdminOrStaff ? viewBookingDetailsDialog(booking) : null"
```

## Styling

### Dialog Theme:
- **Primary Color:** Blue gradient (#1976d2 to #1565c0)
- **Background:** White with outlined cards
- **Accent Color:** Primary blue for section titles and icons
- **Status Chips:** Color-coded based on booking status
- **Success Color:** Green for monetary amounts

### Interactive Elements:
- **Hover Effect:** Light gray background (#f8fafc) with 4px slide animation
- **Cursor:** Pointer for clickable items
- **Transition:** Smooth 0.3s ease for all animations

## Dependencies
- `authService` - For user role checking
- `courtService` - For fetching booking data
- Vuetify components (v-dialog, v-card, v-list, v-chip, etc.)

## Security Considerations
- Role checking is performed on component mount
- Click handlers are conditionally applied based on user role
- Falls back to 'user' role if role checking fails
- All user data is safely accessed with optional chaining (?.)

## Browser Compatibility
- Modern browsers with ES6+ support
- Responsive design for mobile, tablet, and desktop
- Tested with Vuetify 3.x components

## Future Enhancements (Potential)
- Add ability to edit bookings from the dialog (admin only)
- Add ability to cancel/approve bookings (admin/staff only)
- Add booking history timeline
- Add email/SMS notification buttons
- Export booking details as PDF
- Add filters for booking status in the Recent Bookings tab

## Testing Recommendations
1. Test with admin role - verify bookings are clickable and details display correctly
2. Test with staff role - verify same functionality as admin
3. Test with regular user role - verify bookings are not clickable
4. Test with invalid/missing role - verify graceful fallback
5. Test responsive design on mobile devices
6. Test dialog close functionality
7. Test with bookings that have missing data fields
8. Test performance with large number of bookings

## Notes
- The implementation maintains consistency across both CourtDetails.vue and CourtDetail.vue files
- All changes preserve existing functionality for non-admin users
- The feature is role-based and secure, only activating for authorized users
- Styling matches the existing application theme and design patterns
