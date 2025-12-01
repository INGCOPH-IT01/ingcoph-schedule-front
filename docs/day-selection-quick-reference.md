# Day Selection - Quick Reference Card

## 🎯 Quick Start

### Access the Feature
1. Go to **Sports Management**
2. Click **Manage Pricing** on any sport
3. Click **Add Pricing Rule**
4. Look for **"Applicable Days"** section

## 🚀 Quick Select Buttons

Click these buttons for instant selection:

| Button | Selects | Best For |
|--------|---------|----------|
| **💼 Weekdays** | Mon-Fri | Regular business pricing |
| **☀️ Weekends** | Sat-Sun | Weekend premiums |
| **📅 All Days** | None (all days) | Default pricing |

## 📝 Common Scenarios

### Scenario 1: Weekend Pricing
```
✓ Click "Weekends" button
✓ Set higher price (e.g., ₱350)
✓ Time: 00:00 - 23:59
✓ Priority: 10
```
**Result**: Weekend bookings cost more

### Scenario 2: Weekday Discount
```
✓ Click "Weekdays" button
✓ Set lower price (e.g., ₱150)
✓ Time: 00:00 - 23:59
✓ Priority: 5
```
**Result**: Weekday bookings cost less

### Scenario 3: Peak Hours (Mon-Fri mornings)
```
✓ Click "Weekdays" button
✓ Set peak price (e.g., ₱300)
✓ Time: 06:00 - 10:00
✓ Priority: 15
```
**Result**: Weekday morning rush pricing

### Scenario 4: Custom Days
```
✓ Use dropdown to select specific days
✓ Example: Tue, Thu only
✓ Set your pricing
```
**Result**: Pricing applies only on selected days

## 🎨 Visual Guide

### Form View
```
┌─────────────────────────────────┐
│ Applicable Days (ℹ️)            │
├─────────────────────────────────┤
│ [💼 Weekdays] [☀️ Weekends]    │
│ [📅 All Days]                   │
│                                 │
│ Select specific days:           │
│ [Mon ×] [Tue ×] [Wed ×] ...    │
└─────────────────────────────────┘
```

### List Display
```
Rule Name
₱300/hr
🕐 06:00 - 10:00
📅 [Mon] [Tue] [Wed] [Thu] [Fri]  ← Day chips
⚡ Priority: 5
```

## 🔢 Day Numbers Reference

| Number | Day |
|--------|-----|
| 0 | Sunday |
| 1 | Monday |
| 2 | Tuesday |
| 3 | Wednesday |
| 4 | Thursday |
| 5 | Friday |
| 6 | Saturday |

## ⚡ Priority Rules

- **Higher number = higher priority**
- Example: Priority 10 beats Priority 5
- Use high priority for exceptions
- Use low priority for defaults

### Priority Examples
```
Priority 20: Holiday pricing
Priority 15: Peak hours
Priority 10: Weekend premium
Priority 5:  Weekday standard
Priority 0:  Default fallback
```

## ✅ Quick Checklist

Before saving a pricing rule:

- [ ] Rule name is clear and descriptive
- [ ] Start time is before end time
- [ ] Price is correct (₱)
- [ ] Days are selected (or empty for all)
- [ ] Priority is set appropriately
- [ ] Effective date (if scheduling change)

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Days not showing | Click dropdown and select manually |
| Wrong price charged | Check rule priority (higher wins) |
| Not working on weekend | Verify days include 0 (Sun) and 6 (Sat) |
| Can't remove day | Click × on chip or use "All Days" button |

## 💡 Pro Tips

1. **Combine wisely**: Use days + time for precise control
2. **Test first**: Create with low priority, verify, then adjust
3. **Use priority**: Higher priority for exceptions/overrides
4. **Name clearly**: "Weekend Morning Premium" vs "Rule 1"
5. **All Days = Empty**: Leave days empty for universal pricing

## 📊 Example Pricing Strategy

```
┌────────────────────────────────────────┐
│ Weekend All Day                        │
│ ₱350/hr, Sat-Sun, 00:00-23:59, P:10  │
├────────────────────────────────────────┤
│ Weekday Peak (Morning)                 │
│ ₱250/hr, Mon-Fri, 06:00-10:00, P:15   │
├────────────────────────────────────────┤
│ Weekday Peak (Evening)                 │
│ ₱280/hr, Mon-Fri, 17:00-22:00, P:15   │
├────────────────────────────────────────┤
│ Weekday Off-Peak                       │
│ ₱180/hr, Mon-Fri, 10:00-17:00, P:5    │
├────────────────────────────────────────┤
│ Default                                │
│ ₱200/hr, All days, 00:00-23:59, P:0   │
└────────────────────────────────────────┘
```

## 🎓 Training Tips

For new staff:
1. Show them the quick select buttons
2. Create a test rule together
3. Book a test reservation
4. Verify the price calculation
5. Edit and delete practice rules

## 📱 Mobile Use

On mobile devices:
- Quick select buttons stack vertically
- Chips wrap to multiple lines
- Dropdown works with native select
- All features fully functional

## 🔗 Related Features

- **Time Ranges**: Combine with day selection
- **Priority System**: Control rule precedence
- **Effective Dates**: Schedule future changes
- **Price History**: Track all changes

## 📞 Need Help?

1. Check tooltips (ℹ️ icons)
2. Read persistent hints in form
3. Review full documentation in `/docs/`
4. Test with low-priority rules first

---

**Remember**: Leave days empty to apply pricing to ALL days!

**Quick Test**:
1. Create "Weekend Test" rule
2. Click "Weekends" button
3. Set ₱999 (easy to spot)
4. Save
5. Try booking on Saturday
6. Should see ₱999/hr rate
7. Delete test rule

**Happy Pricing! 🎉**
