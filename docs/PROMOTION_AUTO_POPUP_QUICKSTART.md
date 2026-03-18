# Auto-Popup Quick Start Guide

## For Admins: How to Enable Auto-Popup

### Step-by-Step Instructions

#### 1. Navigate to Promotion Management
- Log in as Admin
- Click "Promotion Management" in the menu

#### 2. Create or Edit a Promotion
- Click "New Promotion" or edit existing promotion
- Fill in title and content as usual

#### 3. Configure Auto-Popup
- Scroll down to **"Auto-Popup Settings"** section
- Toggle **"Enable Auto-Popup"** to ON
- Set **"Popup Interval (Hours)"**:
  - Type a number (1-168)
  - OR click the clock icon for quick presets

#### 4. Choose Your Interval

**Quick Presets Available:**
```
⏱️ Every 1 hour      - For urgent flash sales
⏱️ Every 4 hours     - DEFAULT, balanced frequency
⏱️ Every 12 hours    - Good for daily deals
⏱️ Once per day      - Standard promotion
⏱️ Every 3 days      - Low-frequency campaigns
⏱️ Once per week     - Minimal interruption
```

#### 5. Save
- Click "Save"
- Your promotion is now configured!

---

## What Happens Next?

### When Users Visit Home Page

**First Visit:**
```
User lands on page
    ↓
Page loads (1.5 second delay)
    ↓
Popup appears with your promotion!
    ↓
Timestamp saved in user's browser
```

**Return Visits:**
```
User returns to home page
    ↓
System checks: "Has [interval] hours passed?"
    ↓
NO → No popup shown
YES → Popup appears again!
```

---

## Example Scenarios

### Flash Sale (Urgent)
```
⚙️ Auto-Popup: ON
⏱️ Interval: 1 hour
📅 Duration: 6 hours

Result: Users see it up to 6 times during sale period
```

### Weekend Special
```
⚙️ Auto-Popup: ON
⏱️ Interval: 24 hours
📅 Duration: Friday-Sunday

Result: Users see it once per day over the weekend
```

### Monthly Promotion
```
⚙️ Auto-Popup: ON
⏱️ Interval: 168 hours (weekly)
📅 Duration: 30 days

Result: Users see it once per week for a month
```

---

## Tips for Success

### ✅ Do This
- Use 12-24 hour intervals for most promotions
- Enable auto-popup for time-sensitive offers
- Write compelling popup content
- Test with different intervals
- Monitor engagement metrics

### ❌ Avoid This
- Don't set interval too short (< 4 hours)
- Don't enable for ALL promotions
- Don't use for permanent features
- Don't ignore user feedback
- Don't show without value

---

## Checking Status

### In Admin Panel

Look for the **"Auto-Popup"** column in the table:

- ✅ **Yes** (Blue chip) - Auto-popup is enabled
  - Hover to see interval hours
- ❌ **No** (Gray chip) - Auto-popup is disabled

---

## Testing Your Setup

### Quick Test Steps

1. **Create promotion** with auto-popup enabled (1 hour interval)
2. **Open home page** in incognito window
3. **Wait 1.5 seconds** - popup should appear
4. **Close popup**
5. **Refresh page** - popup should NOT appear (interval not passed)
6. **Open browser console**:
   ```javascript
   localStorage.getItem('promotion_popup_1') // Check timestamp
   ```
7. **To reset for testing**:
   ```javascript
   localStorage.removeItem('promotion_popup_1')
   ```

---

## Frequently Asked Questions

### Q: Will it show every time they visit?
**A**: No, only after the interval expires (e.g., every 4 hours)

### Q: Can I have multiple auto-popup promotions?
**A**: Yes, but only ONE shows per visit (highest priority)

### Q: What if user clears their browser data?
**A**: Popup will show again (timestamp is lost)

### Q: Can users disable it permanently?
**A**: Not built-in, but they can clear localStorage each time

### Q: Does it work on mobile?
**A**: Yes! Fully responsive

### Q: Will it annoy users?
**A**: Not if you use reasonable intervals (12-24 hours recommended)

### Q: Can I see how many times it was shown?
**A**: Not yet - add analytics for this (future enhancement)

---

## Troubleshooting

### Popup Not Appearing

**Check:**
1. ✅ Is auto-popup enabled in admin?
2. ✅ Is promotion active?
3. ✅ Is it within publish/expire dates?
4. ✅ Open browser console - any errors?
5. ✅ Check localStorage - has interval passed?

**Quick Fix:**
```javascript
// In browser console
localStorage.removeItem('promotion_popup_1')
// Refresh page
```

### Showing Too Often

**Solution:**
- Increase interval hours
- Check if multiple promotions have auto-popup enabled

---

## Best Interval Recommendations

| Promotion Type | Recommended Interval | Why |
|----------------|---------------------|-----|
| Flash Sale (< 6 hours) | 1-2 hours | Urgency, multiple reminders |
| Daily Special | 12-24 hours | Once per session |
| Weekend Deal | 24-48 hours | Daily reminder |
| Weekly Promo | 72-168 hours | Avoid fatigue |
| Event Registration | 24-72 hours | Multiple opportunities |
| New Feature | 168 hours | Low pressure |

---

## Summary

✨ **Auto-Popup gives your promotions maximum visibility**
⏰ **Configurable intervals respect user experience**
🎯 **Perfect for time-sensitive offers**
📊 **Easy to configure and monitor**

**Status**: ✅ Feature Ready - Start Using Now!
