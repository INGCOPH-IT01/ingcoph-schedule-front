# Status Service Refactoring

## Overview
Refactored status color and icon logic into a centralized service following the sportService pattern to eliminate code duplication and ensure consistency across all components.

## Changes Made

### Service Format (Following sportService Pattern)
- **File**: `src/services/statusService.js`
- **Export**: Single `statusService` object with methods
- **Methods**:
  - `statusService.getStatusColor(status)` - Returns Vuetify color name for a given status
  - `statusService.getStatusIcon(status)` - Returns Material Design icon name for a given status

### Status Colors Mapping
```javascript
{
  in_cart: 'purple',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  cancelled: 'error',
  completed: 'info'
}
```

### Status Icons Mapping
```javascript
{
  pending: 'mdi-clock-alert',
  approved: 'mdi-check-circle',
  rejected: 'mdi-close-circle'
}
```

## Components Updated

### Views
1. ✅ **Bookings.vue**
   - Added import: `import { statusService } from '../services/statusService'`
   - Removed local `getStatusColor` and `getStatusIcon` methods
   - Added `statusService` to return statement
   - Updated template: `getStatusColor()` → `statusService.getStatusColor()`

2. ✅ **CourtDetails.vue**
   - Added import: `import { statusService } from '../services/statusService'`
   - Removed local methods
   - Added `statusService` to return statement
   - Updated template: `getStatusColor()` → `statusService.getStatusColor()`
   - Updated template: `getStatusIcon()` → `statusService.getStatusIcon()`

3. ✅ **StaffDashboard.vue**
   - Added import: `import { statusService } from '../services/statusService'`
   - Removed local `getStatusColor` method
   - Added `statusService` to return statement
   - Updated template: `getStatusColor()` → `statusService.getStatusColor()`

4. ✅ **CourtDetail.vue**
   - Added import: `import { statusService } from '../services/statusService'`
   - Removed local `getStatusColor` method
   - Added `statusService` to return statement
   - Updated template: `getStatusColor()` → `statusService.getStatusColor()`

5. ✅ **BookingsClean.vue**
   - Added import: `import { statusService } from '../services/statusService'`
   - Removed local `getStatusColor` method
   - Added `statusService` to return statement
   - Updated template: `getStatusColor()` → `statusService.getStatusColor()`

### Components
1. ✅ **BookingDetailsDialog.vue**
   - Added import: `import { statusService } from '../services/statusService'`
   - Updated computed property to use `statusService.getStatusColor()`
   - Added `statusService` to return statement

2. ✅ **QrCodeScanner.vue**
   - Added import: `import { statusService } from '../services/statusService'`
   - Removed local `getStatusColor` method
   - Added `statusService` to return statement
   - Updated template: `getStatusColor()` → `statusService.getStatusColor()`

3. ✅ **QrCodeDisplay.vue**
   - Added import: `import { statusService } from '../services/statusService'`
   - Removed local `getStatusColor` method
   - Added `statusService` to return statement
   - Updated template: `getStatusColor()` → `statusService.getStatusColor()`

## Benefits
1. **Single Source of Truth**: All status colors and icons are now defined in one place
2. **Consistency**: All components use the same color and icon mappings
3. **Maintainability**: Changes to status styling can be made in one location
4. **Reduced Code Duplication**: Removed ~10 duplicate implementations
5. **Follows Established Pattern**: Matches the sportService pattern for consistency
6. **Template-Accessible**: Service is exported to templates for direct usage

## Pattern Consistency
The statusService now follows the exact same pattern as sportService:
- Single object export with methods
- Service object added to component return statements
- Template usage: `statusService.getStatusColor()` (same as `sportService.getSportColor()`)

## Notes
- Backup files (`.backup`, `.broken`) were not modified as they are not active code
- All template usages updated to use `statusService.methodName()` pattern
- No linter errors introduced
- Service is available directly in templates

## Usage Example
```javascript
import { statusService } from '../services/statusService'

export default {
  setup() {
    // ... component logic

    return {
      // ... other returns
      statusService  // Export to template
    }
  }
}
```

```vue
<!-- In template -->
<v-chip :color="statusService.getStatusColor(booking.status)">
  {{ booking.status }}
</v-chip>

<v-icon>{{ statusService.getStatusIcon(booking.status) }}</v-icon>
```
