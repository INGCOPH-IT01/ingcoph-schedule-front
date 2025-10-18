# BookingDetailsDialog Component Refactoring

## Overview
The `BookingDetailsDialog` component has been created as a reusable, dynamic component to display booking details across the application. This refactoring eliminates code duplication and provides a consistent user experience.

## Implementation Date
October 17, 2025

## Component Location
`/src/components/BookingDetailsDialog.vue`

## Component Features

### Props
- **`isOpen`** (Boolean, required): Controls dialog visibility
- **`booking`** (Object): The booking object containing all booking data
- **`courtName`** (String): Name of the court for display

### Emits
- **`update:isOpen`**: Emitted when dialog visibility changes (v-model support)
- **`close`**: Emitted when dialog is closed

### Data Displayed

1. **Customer Information Section:**
   - Customer name
   - Email address
   - Phone number

2. **Booking Information Section:**
   - Booking ID
   - Court name
   - Booking date
   - Time range
   - Status with color-coded chip

3. **Time Slots Section** (conditionally displayed):
   - Individual time slot breakdown
   - Start and end times for each slot
   - Price per time slot
   - Only shown if `booking.cart_items` exists

4. **Payment Information Section:**
   - Payment method
   - Total amount (bold, success color)
   - Creation timestamp

5. **Notes Section** (conditionally displayed):
   - Additional booking notes
   - Only shown if `booking.notes` exists

### Built-in Formatting Functions
The component includes internal formatting functions:
- `formatTimeSlot()` - Converts 24h to 12h format with AM/PM
- `formatPrice()` - Formats currency with 2 decimal places
- `formatBookingDate()` - Formats date in readable format
- `formatDateTime()` - Formats full datetime
- `getBookingDate()` - Extracts booking date from cart items or created_at
- `getBookingTimeRange()` - Calculates time range from cart items
- `getTotalPrice()` - Calculates total from cart items or uses total_price
- `getStatusColor()` - Returns appropriate color for status chips

## Files Using BookingDetailsDialog

### 1. `/src/views/CourtDetails.vue`
**Context:** Recent Bookings tab in court detail pages
**Usage:**
```vue
<BookingDetailsDialog
  v-model:is-open="bookingViewDialog"
  :booking="selectedBookingForView"
  :court-name="court?.name"
  @close="bookingViewDialog = false"
/>
```

**Access:** Admin and Staff users only
**Trigger:** Clicking on a booking item in the Recent Bookings tab

### 2. `/src/views/CourtDetail.vue`
**Context:** Recent Bookings tab in alternate court detail view
**Usage:**
```vue
<BookingDetailsDialog
  v-model:is-open="bookingViewDialog"
  :booking="selectedBookingForView"
  :court-name="court?.name"
  @close="bookingViewDialog = false"
/>
```

**Access:** Admin and Staff users only
**Trigger:** Clicking on a booking item in the Recent Bookings tab

## Implementation Pattern

### Step 1: Import Component
```javascript
import BookingDetailsDialog from '../components/BookingDetailsDialog.vue'
```

### Step 2: Register Component
```javascript
export default {
  name: 'YourComponent',
  components: {
    BookingDetailsDialog
  },
  // ...
}
```

### Step 3: Add Required State
```javascript
const bookingViewDialog = ref(false)
const selectedBookingForView = ref(null)
```

### Step 4: Create Click Handler
```javascript
const viewBookingDetailsDialog = (booking) => {
  selectedBookingForView.value = booking
  bookingViewDialog.value = true
}
```

### Step 5: Use Component in Template
```vue
<BookingDetailsDialog
  v-model:is-open="bookingViewDialog"
  :booking="selectedBookingForView"
  :court-name="court?.name"
  @close="bookingViewDialog = false"
/>
```

## Styling
The component includes its own scoped styles:
- **Primary Color:** Blue gradient (#1976d2 to #1565c0)
- **Background:** White cards with outlined variants
- **Section Titles:** Primary blue color with icons
- **Status Chips:** Color-coded based on status
- **Success Color:** Green for monetary amounts
- **Responsive:** Mobile-friendly with flex direction changes

## Removed Duplicate Code

### From CourtDetails.vue
- Removed ~150 lines of template code for the dialog
- Removed ~40 lines of CSS specific to booking view dialog
- Retained only necessary state management and click handlers

### From CourtDetail.vue
- Removed ~130 lines of template code for the dialog
- Removed ~55 lines of CSS specific to booking view dialog
- Retained only necessary state management and click handlers

## Total Code Reduction
- **Template Code:** ~280 lines removed
- **CSS Code:** ~95 lines removed
- **Total:** ~375 lines of duplicate code eliminated
- **New Component:** ~345 lines (reusable across multiple files)

## Benefits

1. **Code Reusability:** Single source of truth for booking details display
2. **Maintainability:** Changes only need to be made in one place
3. **Consistency:** Same UI/UX across all pages using the component
4. **Testability:** Component can be tested in isolation
5. **Performance:** Component can be lazy-loaded if needed
6. **Scalability:** Easy to extend with new features

## Data Structure Requirements

The component expects booking objects with the following structure:

```javascript
{
  id: Number,
  user: {
    name: String,
    email: String,
    phone: String
  },
  cart_items: [  // Optional
    {
      start_time: String,
      end_time: String,
      price: Number,
      booking_date: String
    }
  ],
  payment_method: String,
  total_price: Number,
  created_at: String (ISO date),
  approval_status: String,  // or status
  notes: String,  // Optional
  start_time: String (ISO date),  // Fallback if cart_items not present
  end_time: String (ISO date)  // Fallback if cart_items not present
}
```

## Other Booking Detail Dialogs in the Application

### Not Refactored (Different Requirements)

1. **AdminDashboard.vue** - `detailsDialog`
   - **Reason:** More complex dialog with additional features:
     - Court images gallery with error handling
     - Transaction-specific details
     - Cart items display
     - Frequency booking details
     - Different layout and sections
   - **Recommendation:** Keep as is due to complexity

2. **StaffDashboard.vue** - `bookingDialog`
   - **Reason:** Includes court images gallery component
   - **Note:** Could potentially be refactored in future with extended component

3. **Bookings.vue** - `viewDialog`
   - **Reason:** Different context and layout
   - **Note:** User's own bookings view with different information priority

## Future Enhancement Opportunities

1. **Extended Component Variant:**
   - Create `BookingDetailsDialogExtended.vue` for admin dashboard
   - Include slots for custom sections (images, frequency details, etc.)
   - Support different layouts via props

2. **Action Support:**
   - Add props for action buttons (edit, cancel, approve)
   - Emit events for actions
   - Support different action sets based on user role

3. **Loading State:**
   - Add loading prop for async data fetching
   - Show skeleton loaders

4. **Print Support:**
   - Add print button
   - Optimized print stylesheet

5. **Export Support:**
   - Export as PDF
   - Export as email

## Testing Recommendations

1. **Unit Tests:**
   - Test prop validation
   - Test all formatting functions
   - Test conditional rendering
   - Test event emissions

2. **Integration Tests:**
   - Test with different booking data structures
   - Test with missing optional fields
   - Test with null/undefined values

3. **Visual Regression:**
   - Test different screen sizes
   - Test with long text content
   - Test with missing data

4. **Accessibility:**
   - Test keyboard navigation
   - Test screen reader compatibility
   - Test color contrast

## Migration Guide for New Pages

To use `BookingDetailsDialog` in a new page:

1. Import and register the component
2. Create reactive refs for dialog state
3. Create click handler function
4. Add component to template with proper props
5. Remove any duplicate dialog code
6. Remove duplicate CSS styles
7. Test thoroughly with different booking data

## Version History

- **v1.0.0** (October 17, 2025): Initial component creation and refactoring
  - Created reusable BookingDetailsDialog component
  - Refactored CourtDetails.vue and CourtDetail.vue
  - Eliminated ~375 lines of duplicate code
  - Added comprehensive documentation

## Notes

- The component uses Vue 3 Composition API
- Requires Vuetify 3.x for UI components
- All formatting functions are self-contained
- Component is fully responsive
- Supports both cart-based and single bookings
- Gracefully handles missing data with fallbacks

## Maintenance

When updating the component:
1. Test all pages using the component
2. Ensure backward compatibility
3. Update this documentation
4. Add migration notes if breaking changes
5. Update version number
