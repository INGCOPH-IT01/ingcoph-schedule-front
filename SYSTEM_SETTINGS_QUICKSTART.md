# System Settings Module - Quick Start Guide

## 🎉 What's New?

You now have a comprehensive **System Settings** module that allows you to customize:
- ✅ **Company Logo & Name**
- ✅ **Theme Colors** (Primary & Secondary)
- ✅ **Theme Mode** (Light & Dark)
- ✅ **Dashboard Content** (Welcome message, announcements, display options)

## 🚀 Quick Start

### Step 1: Access System Settings
1. Login as **Admin**
2. Open the sidebar navigation
3. Click on **"System Settings"** (under Admin menu)

### Step 2: Customize Your Settings

#### Tab 1: Company Info
- Upload your company logo (drag & drop or click to browse)
- Update company name
- Click **"Save Changes"**

#### Tab 2: Theme Settings
- Choose **Light** or **Dark** mode
- Pick your **Primary Color** (use color picker or choose from presets)
- Pick your **Secondary Color**
- Preview your theme
- Click **"Apply Theme"**
- 🔄 **Refresh the page** to see full changes

#### Tab 3: Dashboard Content
- Add a welcome message (e.g., "Welcome to Perfect Smash!")
- Add announcements for users
- Toggle statistics cards on/off
- Toggle recent bookings on/off
- Click **"Save Changes"**

## 🎨 Predefined Color Themes

### Primary Colors:
- **Red**: `#B71C1C` (Default - Perfect Smash)
- **Blue**: `#1976D2`
- **Green**: `#388E3C`
- **Purple**: `#7B1FA2`
- **Orange**: `#F57C00`
- **Teal**: `#00897B`

### Secondary Colors:
- **Gray**: `#5F6368` (Default)
- **Dark Gray**: `#424242`
- **Blue Gray**: `#546E7A`
- **Brown**: `#5D4037`
- **Cyan**: `#00838F`
- **Indigo**: `#3F51B5`

## 📱 Features

### Real-time Previews
- See logo preview before saving
- Preview theme colors with sample buttons and chips
- Preview dashboard content before applying

### Responsive Design
- Works perfectly on desktop, tablet, and mobile
- Touch-friendly controls
- Optimized layouts for all screen sizes

### Smart Validation
- File size limits (2MB max for logos)
- Character limits (500 for welcome, 1000 for announcements)
- Hex color validation
- Required field validation

## 🔧 Technical Details

### Files Created/Modified:

**Backend:**
- ✅ `app/Http/Controllers/Api/CompanySettingController.php` - Updated
- ✅ Uses existing `company_settings` table (key-value storage)

**Frontend:**
- ✅ `src/views/SystemSettings.vue` - NEW
- ✅ `src/router/index.js` - Updated
- ✅ `src/App.vue` - Updated
- ✅ `src/plugins/vuetify.js` - Updated
- ✅ `src/services/companySettingService.js` - Updated

### Navigation Structure:
```
Admin Menu
├── Admin Panel
├── User Management
├── Sports Management
├── Company Settings
├── System Settings ⭐ (NEW)
└── Staff Scanner
```

## 💡 Usage Tips

### Best Practices:
1. **Logo**: Use a transparent PNG or SVG for best results
2. **Colors**: Ensure good contrast between primary and secondary colors
3. **Messages**: Keep welcome messages short and friendly
4. **Announcements**: Use for important updates or promotions

### Common Use Cases:

**Branding Refresh:**
1. Go to Company Info tab
2. Upload new logo
3. Go to Theme Settings tab
4. Update colors to match new brand
5. Apply changes

**Seasonal Themes:**
1. Go to Theme Settings
2. Change colors for season (e.g., green for St. Patrick's Day)
3. Update dashboard announcement
4. Apply theme

**Dark Mode Setup:**
1. Go to Theme Settings
2. Select "Dark Mode"
3. Adjust colors if needed (they work in both modes)
4. Apply theme

## 🎯 Quick Actions

### Change Theme to Blue:
1. System Settings → Theme Settings
2. Click "Blue" chip under Primary Color
3. Click "Apply Theme"
4. Refresh page

### Add Welcome Message:
1. System Settings → Dashboard Content
2. Enter message in "Welcome Message" field
3. Click "Save Changes"

### Upload New Logo:
1. System Settings → Company Info
2. Click "Upload Company Logo"
3. Select your image file
4. Click "Save Changes"

## 🔒 Security

- Only **Admin** users can access System Settings
- All changes are logged
- File uploads are validated
- XSS protection enabled

## 🐛 Troubleshooting

**Theme doesn't change:**
- Make sure to click "Apply Theme"
- Refresh the page (F5)
- Clear browser cache

**Logo won't upload:**
- Check file size (must be under 2MB)
- Use supported formats: JPEG, PNG, GIF, SVG, WEBP
- Try a different browser

**Can't access System Settings:**
- Verify you're logged in as Admin
- Try logging out and back in

## 📚 Next Steps

After setting up your System Settings:
1. Test the changes on different devices
2. Get feedback from your team
3. Adjust colors for better accessibility
4. Update dashboard content regularly

## 🎨 Theme Examples

### Professional Blue:
- Primary: `#1976D2` (Blue)
- Secondary: `#424242` (Dark Gray)
- Mode: Light

### Energetic Orange:
- Primary: `#F57C00` (Orange)
- Secondary: `#5D4037` (Brown)
- Mode: Light

### Modern Dark:
- Primary: `#00897B` (Teal)
- Secondary: `#546E7A` (Blue Gray)
- Mode: Dark

### Classic Red (Default):
- Primary: `#B71C1C` (Red)
- Secondary: `#5F6368` (Gray)
- Mode: Light

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify you have admin privileges
3. Clear browser cache and try again
4. Check the documentation in `SYSTEM_SETTINGS_MODULE.md`

---

**Enjoy customizing your Perfect Smash booking system! 🎾🏸⚽**

