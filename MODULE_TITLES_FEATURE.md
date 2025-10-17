# Module Titles Customization Feature 🎨

## ✅ Implementation Complete!

The Module Titles customization feature is now **fully implemented and real-time enabled**! Admins can customize module titles and colors, and changes reflect instantly across all pages.

---

## 📋 Features

### 1. **Company Settings - Module Titles Tab**
Navigate to: **Company Settings → Module Titles**

Customize 4 modules:
- **Courts Module** 🏟️
- **Sports Module** 🎾
- **Bookings Module** 📅
- **Users Module** 👥

For each module, you can customize:
- ✏️ **Title Text** - Change the main heading (e.g., "Manage Courts" → "Our Court Facilities")
- 🎨 **Title Color** - Choose the color for the heading
- 🏷️ **Badge Color** - Choose the color for the badge/icon

### 2. **Live Preview**
Each module shows a **real-time preview** of how it will look with your customizations:
```
┌─────────────────────────┐
│  [Icon] Badge Text      │  ← Badge with semi-transparent background
│  Module Title           │  ← Large heading in selected color
└─────────────────────────┘
```

### 3. **Instant Reflection**
Changes reflect **immediately** without page reload:
- Save settings in Company Settings
- All modules update their titles and colors instantly
- No need to refresh the page

---

## 🎯 Module Details

### Courts Module
- **Default Title**: "Manage Courts"
- **Default Title Color**: #B71C1C (Red)
- **Default Badge Color**: #D32F2F (Light Red)
- **Badge Text**: "Court Management"
- **Icon**: mdi-stadium

### Sports Module
- **Default Title**: "Manage Sports"
- **Default Title Color**: #B71C1C (Red)
- **Default Badge Color**: #D32F2F (Light Red)
- **Badge Text**: "Multi-Sport Facility"
- **Icon**: mdi-racquetball

### Bookings Module
- **Default Title**: "My Bookings"
- **Default Title Color**: #B71C1C (Red)
- **Default Badge Color**: #D32F2F (Light Red)
- **Badge Text**: "Transaction Management"
- **Icon**: mdi-receipt-text-check

### Users Module
- **Default Title**: "Manage Users"
- **Default Title Color**: #B71C1C (Red)
- **Default Badge Color**: #D32F2F (Light Red)
- **Badge Text**: "User Management"
- **Icon**: mdi-account-group

---

## 🔧 Technical Implementation

### Storage
- **Location**: Browser `localStorage`
- **Key**: `moduleTitles`
- **Format**: JSON object
```json
{
  "courts": {
    "text": "Manage Courts",
    "color": "#B71C1C",
    "badgeColor": "#D32F2F"
  },
  "sports": { ... },
  "bookings": { ... },
  "users": { ... }
}
```

### Real-time Updates
- **Event**: `module-titles-updated` (CustomEvent)
- **Trigger**: When user saves changes in Company Settings
- **Listeners**: All 4 module pages listen for this event
- **Result**: Instant update without page reload

### Files Modified

#### Frontend (Vue Components)
1. **CompanySettings.vue**
   - Added "Module Titles" tab
   - Color pickers for each module
   - Live preview
   - Save/Reset functionality

2. **Courts.vue**
   - Dynamic title and badge colors
   - Event listener for real-time updates
   - Loads settings from localStorage on mount

3. **Sports.vue**
   - Dynamic title and badge colors
   - Event listener for real-time updates
   - Loads settings from localStorage on mount

4. **Bookings.vue**
   - Dynamic title and badge colors
   - Event listener for real-time updates
   - Loads settings from localStorage on mount

5. **UserManagement.vue**
   - Dynamic title and badge colors
   - Event listener for real-time updates
   - Loads settings from localStorage on mount

---

## 📱 User Guide

### How to Customize Module Titles

1. **Navigate to Company Settings**
   - Click "Company Settings" in the sidebar
   - Select the "Module Titles" tab

2. **Choose a Module**
   - You'll see 4 cards: Courts, Sports, Bookings, Users
   - Each card has its own customization options

3. **Customize**
   - **Title Text**: Type your custom title in the text field
   - **Title Color**: Click the color picker to choose title color
   - **Badge Color**: Click the color picker to choose badge color
   - **Preview**: See the live preview below each module

4. **Save Changes**
   - Click "Save Module Titles" button at the bottom
   - Changes apply instantly to all pages

5. **Reset to Default** (Optional)
   - Click "Reset to Default" to restore original settings

---

## 🎨 Example Customizations

### Corporate Branding
```
Courts: "Premium Facilities" - Navy Blue (#1E3A8A)
Sports: "Athletic Programs" - Forest Green (#166534)
Bookings: "Reservations" - Royal Purple (#7C3AED)
Users: "Member Directory" - Burgundy (#9F1239)
```

### Playful Theme
```
Courts: "Let's Play!" - Bright Orange (#EA580C)
Sports: "Sports Zone" - Hot Pink (#EC4899)
Bookings: "My Sessions" - Lime Green (#65A30D)
Users: "Team Members" - Sky Blue (#0EA5E9)
```

### Minimalist Theme
```
Courts: "Courts" - Charcoal (#374151)
Sports: "Sports" - Slate (#475569)
Bookings: "Bookings" - Gray (#6B7280)
Users: "Users" - Stone (#78716C)
```

---

## ✨ Benefits

1. **Branding Consistency**: Match your company's brand colors
2. **User Experience**: Clear, customized labels for better navigation
3. **Flexibility**: Change anytime without code changes
4. **Real-time**: See changes instantly
5. **Easy Reset**: Restore defaults with one click

---

## 🚀 Future Enhancements (Ideas)

- Add subtitle customization
- Icon customization (choose different icons)
- Font size adjustment
- Export/Import settings
- Multiple theme presets
- Role-based customization

---

## 🐛 Troubleshooting

**Q: Changes don't reflect immediately?**
- A: Make sure you clicked "Save Module Titles"
- A: Check browser console for errors
- A: Try refreshing the page

**Q: Settings reset after browser closes?**
- A: Settings are stored in localStorage, which persists across sessions
- A: If cleared, they'll reset to defaults

**Q: Colors look different than expected?**
- A: Ensure you're using the color picker, not typing values
- A: Some browsers may render colors slightly differently

---

## 📝 Code Examples

### Dispatching the Event (CompanySettings.vue)
```javascript
window.dispatchEvent(new CustomEvent('module-titles-updated', {
  detail: moduleTitles.value
}))
```

### Listening for Updates (Any Module)
```javascript
window.addEventListener('module-titles-updated', (event) => {
  const titles = event.detail
  if (titles.courts) {
    moduleTitle.value = titles.courts.text
    titleColor.value = titles.courts.color
    badgeColor.value = titles.courts.badgeColor
  }
})
```

### Template Usage
```vue
<div class="header-badge" :style="{ 
  backgroundColor: badgeColor + '20', 
  borderColor: badgeColor 
}">
  <v-icon :color="badgeColor">mdi-stadium</v-icon>
  <span :style="{ color: badgeColor }">Court Management</span>
</div>
<h1 class="title" :style="{ color: titleColor }">
  {{ moduleTitle }}
</h1>
```

---

## ✅ Testing Checklist

- [x] Create custom titles for all 4 modules
- [x] Change title colors
- [x] Change badge colors
- [x] Verify live preview updates
- [x] Save changes
- [x] Navigate to each module and verify changes
- [x] Test reset to default
- [x] Refresh page and verify persistence
- [x] Test on different browsers

---

**Created**: October 17, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅

