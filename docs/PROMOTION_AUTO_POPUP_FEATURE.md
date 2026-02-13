# Auto-Popup Promotion Feature

## Overview

The Auto-Popup feature allows admins to configure promotions to automatically display in a dialog when users visit the home page. The system respects user-defined intervals to avoid showing popups too frequently.

---

## How It Works

### User Experience Flow

1. **User visits home page**
2. **System checks** for promotions with auto-popup enabled
3. **System verifies** if enough time has passed since last shown
4. **Popup displays** automatically (1.5 second delay after page load)
5. **Timestamp recorded** in localStorage
6. **Next visit** - popup only shows again after interval expires

### Key Features

✅ **Configurable Intervals** - 1 hour to 168 hours (1 week)
✅ **Smart Timing** - Only shows one popup at a time
✅ **Respects User Time** - Tracks when last shown per promotion
✅ **Graceful Loading** - 1.5 second delay for better UX
✅ **Priority System** - Shows highest priority eligible promotion
✅ **Persistent Tracking** - Uses localStorage to remember

---

## Admin Configuration

### Creating/Editing Promotions

In the Promotion Management interface:

1. **Enable Auto-Popup** (Toggle Switch)
   - Turn on to enable automatic display
   - Default: Off

2. **Set Popup Interval** (Hours)
   - Range: 1 - 168 hours
   - Default: 4 hours
   - Quick presets available:
     - Every 1 hour
     - Every 4 hours (Default)
     - Every 12 hours
     - Once per day (24 hours)
     - Every 3 days (72 hours)
     - Once per week (168 hours)

3. **Other Settings** (Standard)
   - Active/Inactive status
   - Publish date
   - Expiration date
   - Display order

---

## Technical Implementation

### Backend

#### Database Fields
```php
auto_popup_enabled: boolean (default: false)
auto_popup_interval_hours: integer (default: 4, range: 1-168)
```

#### Validation Rules
- `auto_popup_enabled`: boolean
- `auto_popup_interval_hours`: integer, min:1, max:168

#### Model (Promotion.php)
- Fields added to `$fillable` array
- Cast to appropriate types in `$casts`

---

### Frontend

#### Admin Interface (PromotionManagement.vue)

**Form Fields**:
```vue
<v-switch v-model="formData.auto_popup_enabled" />
<v-text-field v-model.number="formData.auto_popup_interval_hours" />
```

**Data Table**:
- New column: "Auto-Popup"
- Shows Yes/No with icon
- Tooltip displays interval hours

**Quick Presets Menu**:
- Dropdown with common intervals
- One-click selection
- Improves admin UX

---

#### Home Page Logic (Home.vue)

**Auto-Popup System**:

```javascript
checkAndShowAutoPopup() {
  // 1. Find promotions with auto_popup_enabled = true
  // 2. Check localStorage for last shown timestamp
  // 3. Calculate if interval has passed
  // 4. Show eligible promotion
  // 5. Record timestamp
}
```

**LocalStorage Keys**:
- Format: `promotion_popup_{id}`
- Value: ISO timestamp of last shown
- Example: `promotion_popup_1` = "2026-01-27T17:30:00.000Z"

**Timing**:
- 1.5 second delay after page load
- Allows page to render first
- Better user experience

---

## User Scenarios

### Scenario 1: First Time Visitor
```
1. User visits home page (first time)
2. Auto-popup promotion appears after 1.5 seconds
3. Timestamp saved: "2026-01-27 10:00:00"
4. User views or closes popup
```

### Scenario 2: Return Visitor (Before Interval)
```
1. User visits home page at 11:00 AM
2. Last shown: 10:00 AM (1 hour ago)
3. Interval: 4 hours
4. NOT SHOWN (only 1 hour passed, need 4)
5. No popup displays
```

### Scenario 3: Return Visitor (After Interval)
```
1. User visits home page at 3:00 PM
2. Last shown: 10:00 AM (5 hours ago)
3. Interval: 4 hours
4. SHOWN (5 hours > 4 hours)
5. Popup displays
6. New timestamp saved: "2026-01-27 15:00:00"
```

### Scenario 4: Multiple Auto-Popup Promotions
```
1. Promotion A: interval 4 hours, last shown 5 hours ago ✓
2. Promotion B: interval 12 hours, last shown 20 hours ago ✓
3. System shows ONLY Promotion A (first in order)
4. Next visit may show Promotion B
```

---

## Best Practices

### Recommended Intervals

| Use Case | Recommended Interval | Reasoning |
|----------|---------------------|-----------|
| Flash Sale | 1-2 hours | High urgency, frequent updates |
| Daily Special | 12-24 hours | Once per session |
| Weekly Promo | 72-168 hours | Avoid fatigue |
| Event Announcement | 24-48 hours | Balance visibility & annoyance |
| General Offer | 24-72 hours | Standard marketing |

### Do's ✅
- Set reasonable intervals (12-24 hours for most cases)
- Use auto-popup for time-sensitive offers
- Monitor user engagement metrics
- Test different intervals
- Combine with compelling content

### Don'ts ❌
- Don't set interval too short (< 4 hours)
- Don't enable for all promotions simultaneously
- Don't use for permanent content
- Don't ignore user feedback
- Don't show without compelling offer

---

## Priority Logic

When multiple promotions are eligible for auto-popup:

1. **First eligible promotion is shown** (based on iteration order)
2. Order determined by: `display_order ASC, created_at DESC`
3. Only ONE popup shows per page visit
4. Other eligible promotions wait for next visit

### Strategy for Multiple Promotions

**Option A: Stagger Intervals**
- Promotion A: 4 hours
- Promotion B: 8 hours
- Promotion C: 12 hours
- Result: Different promotions show at different times

**Option B: Use Display Order**
- Promotion A: display_order = 1, interval 24 hours
- Promotion B: display_order = 2, interval 24 hours
- Result: A shows first when eligible, B shows when A was recently shown

---

## localStorage Management

### Data Stored
```json
{
  "promotion_popup_1": "2026-01-27T17:30:00.000Z",
  "promotion_popup_2": "2026-01-27T10:00:00.000Z",
  "promotion_popup_5": "2026-01-26T14:20:00.000Z"
}
```

### Clearing History (For Testing)
```javascript
// Clear all promotion popup history
Object.keys(localStorage)
  .filter(key => key.startsWith('promotion_popup_'))
  .forEach(key => localStorage.removeItem(key))

// Clear specific promotion
localStorage.removeItem('promotion_popup_1')
```

### Privacy Note
- Data stored locally on user's device
- Not sent to server
- User controls via browser settings
- No personal information stored

---

## Analytics Considerations

### Metrics to Track

1. **Popup Display Rate**
   - How often popups are shown
   - Per promotion breakdown

2. **Engagement Rate**
   - Clicks vs displays
   - Time spent viewing
   - Conversion actions

3. **Dismissal Rate**
   - How quickly users close
   - Does interval affect this?

4. **Booking Impact**
   - Booking rate before/after popup
   - Does popup help or hinder?

### Recommended Tools
- Google Analytics events
- Custom event tracking
- A/B testing platforms
- Heatmap tools

---

## Troubleshooting

### Popup Not Showing

**Check**:
1. Is `auto_popup_enabled` = true?
2. Is promotion active?
3. Is it within publish/expire dates?
4. Check localStorage - enough time passed?
5. Is another promotion showing instead?

**Debug**:
```javascript
// Check what's in localStorage
console.log(localStorage.getItem('promotion_popup_1'))

// Manually trigger popup
const promotion = promotions.value[0]
showAutoPopup(promotion)
```

### Popup Showing Too Often

**Solution**:
1. Increase interval hours
2. Check if multiple promotions have auto-popup enabled
3. Verify localStorage is working properly

### Popup Never Showing

**Check**:
1. Promotions loaded successfully?
2. Browser blocking localStorage?
3. JavaScript errors in console?
4. checkAndShowAutoPopup() being called?

---

## Migration Guide

### Database Migration
```bash
php artisan migrate
```

Creates:
- `auto_popup_enabled` column (boolean, default: false)
- `auto_popup_interval_hours` column (integer, default: 4)

### Existing Promotions
- All existing promotions: `auto_popup_enabled` = false
- No automatic popups until admin enables
- Backward compatible - no breaking changes

---

## Future Enhancements (Ideas)

1. **Advanced Targeting**
   - Show to new visitors only
   - Show to logged-in users only
   - Show based on user role

2. **Frequency Capping**
   - Max X times per user total
   - Stop after user converted

3. **A/B Testing**
   - Test different intervals
   - Measure impact on conversions

4. **Analytics Dashboard**
   - View counts per promotion
   - Click-through rates
   - Conversion tracking

5. **Smart Timing**
   - Show at specific times of day
   - Don't show during checkout flow
   - Pause after booking

6. **Multi-Promotion Strategy**
   - Round-robin display
   - Weighted priority
   - Category-based rotation

---

## Code Examples

### Check Popup Status (For Debugging)
```javascript
// Check when promotion #1 was last shown
const lastShown = localStorage.getItem('promotion_popup_1')
if (lastShown) {
  console.log('Last shown:', new Date(lastShown))

  const hours = (Date.now() - new Date(lastShown)) / (1000 * 60 * 60)
  console.log('Hours since last shown:', hours)
}
```

### Manually Reset for Testing
```javascript
// Reset all popup timestamps
localStorage.removeItem('promotion_popup_1')
localStorage.removeItem('promotion_popup_2')

// Or clear all at once
Object.keys(localStorage)
  .filter(k => k.startsWith('promotion_popup_'))
  .forEach(k => localStorage.removeItem(k))
```

### Force Show Popup (Testing)
```javascript
// In browser console on home page
const testPromotion = {
  id: 1,
  title: 'Test Promotion',
  content: '<p>Test content</p>',
  media: []
}
// Call the open function directly
// openPromotionDialog(testPromotion)
```

---

## Summary

The auto-popup feature provides a powerful way to ensure important promotions are seen by visitors without obstructing the primary booking flow. The configurable interval system respects users' time while maximizing promotional visibility.

**Key Success Factors**:
- ✅ Use reasonable intervals (12-24 hours recommended)
- ✅ Enable for 1-2 promotions maximum
- ✅ Create compelling, valuable content
- ✅ Monitor metrics and adjust
- ✅ Respect user experience

**Status**: ✅ Fully Implemented and Ready for Use
