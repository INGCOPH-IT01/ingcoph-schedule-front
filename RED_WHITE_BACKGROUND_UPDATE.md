# Red & White Background Update

## Overview
All module backgrounds have been updated to use a clean **Red & White** gradient scheme that matches the Perfect Smash branding.

## Color Scheme

### Base Gradient
```css
background: linear-gradient(135deg, 
  #FFFFFF 0%,      /* Pure White */
  #FFEBEE 25%,     /* Very Light Red */
  #FFCDD2 50%,     /* Light Red (center) */
  #FFEBEE 75%,     /* Very Light Red */
  #FFFFFF 100%     /* Pure White */
);
```

### Overlay Radial Gradients (Subtle Red Accents)
```css
background: 
  radial-gradient(circle at 20% 80%, rgba(183, 28, 28, 0.08) 0%, transparent 50%),
  radial-gradient(circle at 80% 20%, rgba(198, 40, 40, 0.06) 0%, transparent 50%),
  radial-gradient(circle at 40% 40%, rgba(211, 47, 47, 0.05) 0%, transparent 50%);
```

### Pattern Dots
```css
background-image: 
  radial-gradient(circle at 1px 1px, rgba(183, 28, 28, 0.03) 1px, transparent 0);
background-size: 20px 20px;
```

## Updated Modules

All the following view files now have the consistent Red & White gradient background:

### ✅ Admin Modules
- `AdminDashboard.vue` - Admin control center
- `SportsManagement.vue` - Sports management
- `UserManagement.vue` - User management
- `CompanySettings.vue` - Company settings

### ✅ User Modules
- `Bookings.vue` - My Transactions/Bookings
- `Courts.vue` - Courts listing
- `CourtDetail.vue` - Individual court details
- `Sports.vue` - Sports listing
- `UserProfile.vue` - User profile settings

### ✅ Staff Modules
- `StaffDashboard.vue` - Staff QR scanner

## Design Features

### Clean & Professional
- Pure white base creates a clean, professional look
- Subtle red tints add Perfect Smash brand identity
- Light enough to not interfere with content readability

### Layered Approach
1. **Base Layer**: White to light red gradient
2. **Overlay Layer**: Subtle radial red gradients for depth
3. **Pattern Layer**: Tiny red dots for texture

### Brand Consistency
- Uses Perfect Smash red (#B71C1C) at very low opacity
- Creates a cohesive look across all modules
- Professional appearance suitable for a sports facility

## Color Breakdown

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Pure White | #FFFFFF | RGB(255, 255, 255) | Base background |
| Very Light Red | #FFEBEE | RGB(255, 235, 238) | Soft red tint |
| Light Red | #FFCDD2 | RGB(255, 205, 210) | Center gradient |
| Perfect Smash Red | #B71C1C | RGB(183, 28, 28) | Overlay at 3-8% opacity |
| Accent Red | #C62828 | RGB(198, 40, 40) | Overlay at 6% opacity |
| Error Red | #D32F2F | RGB(211, 47, 47) | Overlay at 5% opacity |

## Benefits

### 1. Enhanced Readability
- Light background ensures all text and content is easily readable
- High contrast with dark text
- Cards and components stand out clearly

### 2. Brand Integration
- Subtle red theme matches Perfect Smash logo
- Not overwhelming - professional and clean
- Creates visual connection to brand identity

### 3. Consistency
- All modules use the same background pattern
- Unified user experience across the application
- Easy to maintain and update

### 4. Modern Aesthetic
- Gradient backgrounds are modern and stylish
- Subtle patterns add depth without distraction
- Professional sports facility appearance

## Technical Implementation

### Structure
```html
<div class="module-container">
  <!-- Perfect Smash Background -->
  <div class="sports-background">
    <div class="sports-overlay"></div>
    <div class="sports-pattern"></div>
  </div>
  
  <!-- Content goes here -->
</div>
```

### CSS Pattern
```css
.module-container {
  position: relative;
  min-height: 100vh;
}

.sports-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFFFFF 0%, #FFEBEE 25%, #FFCDD2 50%, #FFEBEE 75%, #FFFFFF 100%);
  z-index: -3;
}

.sports-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(183, 28, 28, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(198, 40, 40, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(211, 47, 47, 0.05) 0%, transparent 50%);
  z-index: -2;
}

.sports-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(183, 28, 28, 0.03) 1px, transparent 0);
  background-size: 20px 20px;
  z-index: -1;
}
```

## Before vs After

### Before
- Dark blue/gray background
- Blue accent overlays
- Dark theme overall

### After
- Clean white background with subtle red tints
- Red accent overlays matching Perfect Smash brand
- Light, professional theme

## Accessibility

### Contrast Ratios
- White background provides excellent contrast for dark text
- Subtle red tints don't affect readability
- WCAG AAA compliant for text contrast

### Visual Comfort
- Light background is easy on the eyes
- Not too bright or harsh
- Professional and welcoming

## Notes

- Background is fixed position, so it doesn't scroll with content
- Z-index layering ensures background stays behind all content
- Radial gradients create subtle depth and visual interest
- Pattern adds texture without being distracting

## Perfect Smash Identity

This background design perfectly represents Perfect Smash:
- **White**: Clean, professional sports facility
- **Red Accents**: Energy, passion, and Perfect Smash brand
- **Subtle Patterns**: Attention to detail and quality
- **Modern Gradients**: Contemporary design for modern facility

---

**Perfect Smash - Clean, Professional, Energetic! 🏸**

