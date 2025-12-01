# Day Selection Feature Enhancement for Time-Based Pricing

## Overview
This document describes the improvements made to the day selection feature in the time-based pricing system.

## Status
✅ **FEATURE ALREADY IMPLEMENTED** - Enhanced with better UX

The day selection feature was already fully functional in the codebase. This update focuses on making it more discoverable and user-friendly.

## What Was Already Working

### Backend (Laravel)
- ✅ Database: `days_of_week` column (JSON) in `sport_time_based_pricing` table
- ✅ Model: `SportTimeBasedPricing` with `days_of_week` in fillable and casts
- ✅ Controller: Validation and storage of `days_of_week` array (integers 0-6)
- ✅ Business Logic: Day-based pricing calculation in `Sport::getPriceForDateTime()`

### Frontend (Vue.js)
- ✅ Form field: Multi-select dropdown for day selection
- ✅ Data structure: `daysOfWeekOptions` array with all 7 days
- ✅ Display logic: Shows selected days in pricing rules list
- ✅ Helper function: `getDayNames()` to format day numbers as names

## Enhancements Made

### 1. Improved Form Interface
**Location:** `SportsManagement.vue` (lines 632-685)

#### Added Quick Select Buttons
- **Weekdays Button**: Quickly selects Mon-Fri (days 1-5)
- **Weekends Button**: Quickly selects Sat-Sun (days 0,6)
- **All Days Button**: Clears selection to apply to all days

#### Enhanced Visual Design
- Added section header with info tooltip
- Made chips closable for better interaction
- Added persistent hint explaining the feature
- Improved layout with better spacing and icons

```vue
<!-- Quick Select Buttons -->
<v-chip
  size="small"
  @click="pricingFormData.days_of_week = [1,2,3,4,5]"
  prepend-icon="mdi-briefcase"
>
  Weekdays
</v-chip>
<v-chip
  size="small"
  @click="pricingFormData.days_of_week = [0,6]"
  prepend-icon="mdi-weather-sunny"
>
  Weekends
</v-chip>
<v-chip
  size="small"
  @click="pricingFormData.days_of_week = []"
  prepend-icon="mdi-calendar-blank"
>
  All Days
</v-chip>
```

### 2. Enhanced Display in Pricing Rules List
**Location:** `SportsManagement.vue` (3 sections: Active, Scheduled, All tabs)

#### Visual Day Chips
Replaced plain text with color-coded chips for each selected day:
- Before: "Mon, Tue, Wed, Thu, Fri"
- After: Individual chips for each day in primary color

```vue
<v-chip
  v-for="day in pricing.days_of_week"
  :key="day"
  size="x-small"
  color="primary"
  variant="tonal"
>
  {{ ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] }}
</v-chip>
```

#### "All Days" Indicator
When no specific days are selected, shows an info chip instead of plain text:
```vue
<v-chip size="x-small" color="info" variant="tonal">All days</v-chip>
```

### 3. Updated Feature Highlights
**Location:** `SportsManagement.vue` (lines 261-275)

Replaced the automated pricing alert with a comprehensive feature highlights section:
- **📅 Day-specific Pricing**: Clearly states the ability to set prices for specific days
- **⏰ Time-based Rules**: Explains time range capabilities
- **🔄 Automated Changes**: Describes effective date scheduling
- **💡 Tip**: Suggests combining days with time ranges for maximum flexibility

### 4. Added Helper Function
**Location:** `SportsManagement.vue` (lines 1211-1216)

```javascript
const removeDayFromSelection = (dayValue) => {
  const index = pricingFormData.value.days_of_week.indexOf(dayValue)
  if (index > -1) {
    pricingFormData.value.days_of_week.splice(index, 1)
  }
}
```

## How It Works

### Day Numbers
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

### Example Use Cases

#### Example 1: Weekend Premium Pricing
```json
{
  "name": "Weekend Premium",
  "start_time": "00:00",
  "end_time": "23:59",
  "price_per_hour": 300,
  "days_of_week": [0, 6],  // Saturday and Sunday
  "priority": 10
}
```

#### Example 2: Weekday Morning Peak
```json
{
  "name": "Weekday Morning Peak",
  "start_time": "06:00",
  "end_time": "10:00",
  "price_per_hour": 250,
  "days_of_week": [1, 2, 3, 4, 5],  // Monday to Friday
  "priority": 5
}
```

#### Example 3: All-Day Pricing
```json
{
  "name": "Standard Rate",
  "start_time": "00:00",
  "end_time": "23:59",
  "price_per_hour": 200,
  "days_of_week": null,  // or [] - applies to all days
  "priority": 0
}
```

## User Interface Flow

1. **Navigate to Sports Management**
   - Go to Sports Management page
   - Click "Manage Pricing" on any sport

2. **Create New Pricing Rule**
   - Click "Add Pricing Rule"
   - Fill in rule name and time range
   - **Select applicable days** using:
     - Quick select buttons (Weekdays/Weekends/All Days)
     - Manual selection from dropdown
     - Remove days by clicking X on chips

3. **View Pricing Rules**
   - Selected days display as colored chips
   - "All days" shows info chip when no specific days selected
   - Easy visual identification of day-specific rules

## Testing Checklist

- [ ] Create a weekday-only pricing rule
- [ ] Create a weekend-only pricing rule
- [ ] Create an all-day pricing rule
- [ ] Edit existing rule and change days
- [ ] Verify day chips display correctly in all tabs (Active, Scheduled, All)
- [ ] Test quick select buttons
- [ ] Verify pricing calculation respects day selection
- [ ] Test with multiple overlapping rules

## Database Schema Reference

```sql
CREATE TABLE sport_time_based_pricing (
    id BIGINT PRIMARY KEY,
    sport_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    days_of_week JSON NULL,  -- [0,1,2,3,4,5,6] or null for all days
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    effective_date TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## API Reference

### Create Time-Based Pricing
```http
POST /api/sports/{sportId}/time-based-pricing
Content-Type: application/json

{
  "name": "Weekend Premium",
  "start_time": "00:00",
  "end_time": "23:59",
  "price_per_hour": 300,
  "days_of_week": [0, 6],
  "is_active": true,
  "priority": 10,
  "effective_date": null
}
```

### Update Time-Based Pricing
```http
PUT /api/sports/{sportId}/time-based-pricing/{pricingId}
Content-Type: application/json

{
  "name": "Weekend Premium Updated",
  "start_time": "00:00",
  "end_time": "23:59",
  "price_per_hour": 350,
  "days_of_week": [0, 6],
  "is_active": true,
  "priority": 10
}
```

## Impact

### User Experience
- ✅ More discoverable: Clear visual indicators and helper text
- ✅ Faster input: Quick select buttons for common patterns
- ✅ Better feedback: Color-coded chips show selected days at a glance
- ✅ Intuitive: Closable chips allow easy removal of days

### Business Value
- ✅ Flexible pricing: Different rates for weekdays vs weekends
- ✅ Automated: No manual price changes needed
- ✅ Transparent: Clear display of when each price applies
- ✅ Powerful: Combine with time ranges for complex pricing strategies

## Related Files

### Frontend
- `/src/views/SportsManagement.vue` - Main management interface
- `/src/components/NewBookingDialog.vue` - Uses pricing in booking calculations
- `/src/services/courtService.js` - API communication

### Backend
- `/app/Http/Controllers/Api/SportController.php` - CRUD operations
- `/app/Models/SportTimeBasedPricing.php` - Model definition
- `/app/Models/Sport.php` - Pricing calculation logic
- `/database/migrations/*_create_sport_time_based_pricing_table.php` - Schema

## Future Enhancements (Optional)

1. **Day Range Selection**: Allow selecting a range of consecutive days
2. **Copy/Duplicate Rules**: Quick duplication with day modification
3. **Bulk Operations**: Apply same pricing to multiple sports
4. **Visual Calendar**: Calendar view showing pricing by day/time
5. **Pricing Conflicts**: Warn about overlapping rules with same priority

## Conclusion

The day selection feature for time-based pricing is **fully functional and now enhanced** with improved UX. Users can easily create day-specific pricing rules that automatically apply based on the booking date. The improvements make the feature more discoverable and easier to use, especially for common scenarios like weekend pricing or weekday specials.
