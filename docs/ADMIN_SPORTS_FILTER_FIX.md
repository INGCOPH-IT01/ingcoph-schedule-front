# Admin Panel Sports Filter Fix

## Issue
The sports filter dropdown in the Admin Dashboard was not displaying all available sports from the database. It was only showing sports that currently had bookings/transactions, which meant:
- If a sport had no bookings, it wouldn't appear in the filter
- The dropdown options were dynamic based on current bookings rather than all available sports

## Root Cause
The `sportOptions` computed property was extracting sport names from the `pendingBookings` (cart transactions) instead of fetching all sports from the database:

```javascript
// OLD CODE - Only showed sports with bookings
const sportOptions = computed(() => {
  const sports = new Set()
  pendingBookings.value.forEach(transaction => {
    if (transaction.cart_items && transaction.cart_items.length > 0) {
      transaction.cart_items.forEach(item => {
        if (item.court?.sport?.name) {
          sports.add(item.court.sport.name)
        }
      })
    }
  })
  return ['All Sports', ...Array.from(sports).sort()]
})
```

## Solution

### 1. Import courtService
Added the `courtService` import to access the `getSports()` method:

```javascript
import { courtService } from '../services/courtService'
```

### 2. Add sports ref
Created a reactive reference to store all sports from the database:

```javascript
const sports = ref([])
```

### 3. Create loadSports function
Added a function to fetch all sports from the database:

```javascript
const loadSports = async () => {
  try {
    sports.value = await courtService.getSports()
  } catch (error) {
    console.error('Failed to load sports:', error)
    showSnackbar('Failed to load sports', 'error')
  }
}
```

### 4. Update sportOptions computed property
Changed the computed property to use the database sports instead of extracting from bookings:

```javascript
// NEW CODE - Shows all sports from database
const sportOptions = computed(() => {
  if (!sports.value || sports.value.length === 0) {
    return ['All Sports']
  }
  const sportNames = sports.value.map(sport => sport.name).sort()
  return ['All Sports', ...sportNames]
})
```

### 5. Call loadSports on mount
Added `loadSports()` to the `onMounted` lifecycle hook:

```javascript
onMounted(() => {
  loadStats()
  loadSports()  // Added this line
  loadPendingBookings()
  
  // ... event listeners
})
```

## Benefits

✅ **Complete Sport List**: All sports from the database are now available in the filter dropdown, regardless of whether they have bookings or not

✅ **Consistent Filtering**: Admins can filter by any sport in the system, even if there are no current bookings for that sport

✅ **Better UX**: The filter dropdown shows all available options immediately when the page loads

✅ **Database-Driven**: The dropdown stays synchronized with the sports table in the database

## Technical Details

- **API Endpoint Used**: `GET /api/sports` via `courtService.getSports()`
- **Data Structure**: Returns an array of sport objects with `id` and `name` properties
- **Filtering Logic**: The existing filter logic remains unchanged and works with sport names

## Testing

To verify the fix:
1. Navigate to Admin Dashboard
2. Open the "Filter by Sport" dropdown
3. Verify all sports from the database are listed (not just those with bookings)
4. Select a sport to filter bookings
5. Clear filter to show all bookings again

## Files Modified

- ✅ `src/views/AdminDashboard.vue`
  - Added `courtService` import
  - Added `sports` ref
  - Added `loadSports()` function
  - Updated `sportOptions` computed property
  - Updated `onMounted()` to call `loadSports()`

