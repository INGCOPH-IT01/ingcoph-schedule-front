# Perfect Smash Theme - Quick Start Guide

## What Was Changed?

Your application has been completely rebranded from a generic multi-sport facility to **Perfect Smash - Badminton and Pickleball Court** booking system.

## Summary of Changes

### 🎨 Visual Branding
- **Primary Color**: Changed from blue to Perfect Smash red (#B71C1C)
- **Secondary Color**: Changed to Perfect Smash gray (#5F6368)
- **All Gradients**: Updated to use red and gray color schemes
- **All Buttons**: Now feature red gradients with matching shadows
- **Navigation**: Active and hover states use red colors

### 📝 Content Updates
- **Company Name**: "Perfect Smash" throughout the application
- **Hero Section**: "Perfect Smash" branding with badminton/pickleball focus
- **Feature Descriptions**: Updated to emphasize badminton and pickleball
- **Icons**: Changed to badminton icon where appropriate
- **Page Title**: "Perfect Smash - Badminton & Pickleball Court Booking"

### 📁 Files Modified
1. `src/plugins/vuetify.js` - Theme configuration
2. `src/App.vue` - Main layout and branding
3. `src/views/Home.vue` - Landing page content and colors
4. `src/views/Login.vue` - Login page colors
5. `src/views/Register.vue` - Registration page colors
6. `index.html` - Page title

## How to View Changes

### Development Server
```bash
# Navigate to frontend directory
cd C:\Users\admin\Desktop\Github\ingcoph-schedule-front

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

## What You'll See

### 🏠 Home Page
- Bold "Perfect Smash" title with red gradient
- "Badminton & Pickleball Courts" badge
- Red action buttons instead of blue/green
- Red-themed feature cards
- Perfect Smash branded court information

### 🧭 Navigation
- Red accent bars on active items
- Light red hover states
- Red gradient for selected items
- "Perfect Smash" in the app header

### 🔐 Login/Register
- Red-themed buttons and links
- "Sign in to Perfect Smash" messaging
- "Join Perfect Smash" on registration

### 🎯 All Buttons & CTAs
- Vibrant red gradient backgrounds
- Red shadows and hover effects
- Consistent red theme throughout

## Color Palette Quick Reference

```
🔴 Primary Red:    #B71C1C (main brand color)
🔴 Accent Red:     #C62828 (hover states)
⚫ Secondary Gray: #5F6368 (supporting elements)
```

## Next Steps

### Recommended Enhancements

1. **Add Logo Image**
   - Place your Perfect Smash logo in `/public/images/`
   - Update `App.vue` to use the logo
   - Update favicon with Perfect Smash branding

2. **Custom Court Images**
   - Add photos of your actual badminton/pickleball courts
   - Replace generic icons with real facility images
   - Showcase your venue in the home page gallery

3. **Update Backend Settings**
   - Set company name to "Perfect Smash" in company settings
   - Upload Perfect Smash logo through admin panel
   - Update email templates with Perfect Smash branding

4. **Additional Pages to Review**
   - Courts listing page
   - Booking pages
   - Admin dashboard
   - User profile pages

## Testing Checklist

- [ ] Home page displays "Perfect Smash" branding
- [ ] All buttons show red gradient
- [ ] Navigation shows red active/hover states
- [ ] Login page has red theme
- [ ] Register page has red theme
- [ ] Page title shows "Perfect Smash"
- [ ] All text is readable with good contrast
- [ ] Mobile view looks correct
- [ ] All links are red colored

## Troubleshooting

### Colors Not Showing?
1. Clear browser cache (Ctrl + F5)
2. Restart the development server
3. Check browser console for errors

### Old Blue Theme Still Showing?
1. Ensure all files were saved
2. Check if you're viewing the correct port
3. Hard refresh the browser (Ctrl + Shift + R)

### Need to Revert?
All changes are tracked in Git. You can:
```bash
git status              # See modified files
git diff <filename>     # See specific changes
git checkout <filename> # Revert specific file
```

## Documentation Files

For detailed information, refer to:
- `PERFECT_SMASH_THEME.md` - Complete theme implementation details
- `COLOR_REFERENCE.md` - Comprehensive color usage guide

## Support

If you need to adjust colors or content:
1. **Theme Colors**: Edit `src/plugins/vuetify.js`
2. **Content**: Edit respective Vue component files
3. **Global Styles**: Edit `src/App.vue` style section

## Production Deployment

Before deploying to production:

1. **Test Thoroughly**
   ```bash
   npm run build
   npm run preview
   ```

2. **Update Environment Variables**
   - Ensure VITE_API_URL points to production backend
   - Update any third-party API keys

3. **Deploy**
   ```bash
   npm run build
   # Deploy the 'dist' folder to your hosting
   ```

## Congratulations! 🎉

Your Perfect Smash branded booking system is ready to go. The theme perfectly matches your logo's red and gray color scheme, and all content emphasizes your focus on badminton and pickleball courts.

---

**Perfect Smash** - Where Champions Are Made! 🏸

