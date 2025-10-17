# Theme System Implementation

## Overview
Implemented a real-time theme customization system that allows administrators to customize the background gradient and have changes reflect immediately across the entire application.

## Features

### 1. **Real-time Theme Changes**
- Changes to theme colors and gradient angle apply instantly
- No page reload required
- Live preview in the System Settings

### 2. **Theme Customization Options**
- **Primary Color**: Main background color (typically white or light color)
- **Secondary Color**: Middle gradient color
- **Accent Color**: End gradient color
- **Gradient Angle**: Direction of the gradient (0-360 degrees)
  - Quick angle buttons: 0°, 45°, 90°, 135°, 180°

### 3. **Theme Presets**
Quick-apply preset themes:
- 🔴 **Red** (Default): White → Light Red → Pink
- 🔵 **Blue**: White → Light Blue → Sky Blue
- 🟢 **Green**: White → Light Green → Mint Green
- 🟣 **Purple**: White → Light Purple → Lavender
- 🟠 **Orange**: White → Light Orange → Peach

### 4. **Reset to Default**
- One-click reset to the original light red theme
- Removes custom theme from localStorage
- Restores default gradient and colors

## Technical Implementation

### File Changes

#### 1. **CompanySettings.vue** (`src/views/CompanySettings.vue`)
- Added tabbed interface with "Theme Settings" tab
- Implemented color pickers for gradient customization
- Added gradient angle slider with quick buttons
- Live preview of gradient
- Real-time theme application with `watch`
- `applyTheme()` function dynamically injects CSS
- `resetToDefaultTheme()` function to restore defaults
- Theme settings saved to localStorage

#### 2. **App.vue** (`src/App.vue`)
- Updated global background styles to be overridable
- Added `.custom-theme-active` class condition
- Default theme only applies when no custom theme exists
- Added `checkCustomTheme()` function
- Listens for `theme-changed` events
- Applies custom theme on mount if saved

### How It Works

1. **Initial Load (Page Refresh)**:
   - **App.vue** runs `applyCustomTheme()` immediately during script initialization
   - Reads theme settings from localStorage
   - If found, dynamically injects CSS into `<head>` with id `custom-theme-gradient`
   - Adds `.custom-theme-active` class to `.v-main` element
   - Re-applies theme after component mount (50ms delay) to ensure DOM is ready
   - If not found, uses default light red theme

2. **Real-time Updates (While Editing)**:
   - User changes colors/angle in System Settings
   - Vue `watch` detects changes in `themeSettings` (CompanySettings.vue)
   - `applyTheme()` function is called automatically
   - Dynamic `<style>` tag created/updated in `<head>`
   - `.custom-theme-active` class added to `.v-main`
   - Changes reflect immediately without reload

3. **Persistence**:
   - Theme settings saved to localStorage on "Save Theme Settings" button click
   - Dispatches `theme-changed` event to notify App.vue
   - Persists across sessions and page reloads
   - Each browser/device can have their own theme preference

4. **Reset to Default**:
   - Removes theme from localStorage
   - Dispatches `theme-changed` event
   - App.vue detects no saved theme and removes custom styles
   - Default light red theme is restored

4. **Custom Theme CSS Injection**:
   ```css
   .v-main.custom-theme-active {
     background: linear-gradient(135deg, #FFFFFF 0%, #FFF5F5 50%, #FFEBEE 100%);
   }
   
   .v-main.custom-theme-active::before {
     /* Radial gradient overlays based on middle color */
   }
   
   .v-main.custom-theme-active::after {
     /* Dot pattern based on middle color */
   }
   ```

5. **Default Theme Fallback**:
   ```css
   .v-main:not(.custom-theme-active) {
     /* Default light red theme */
   }
   ```

### Event System

**Custom Events**:
- `theme-changed`: Fired when theme is updated or reset
  - Payload: `{ gradient, colors: { c1, c2, c3 }, angle }`
  - Triggers `checkCustomTheme()` in App.vue
  - Updates `.custom-theme-active` class

### localStorage Structure

```javascript
// Theme Settings
{
  "gradientColor1": "#FFFFFF",
  "gradientColor2": "#FFF5F5",
  "gradientColor3": "#FFEBEE",
  "gradientAngle": 135
}
```

## User Experience

### Navigation
1. Login as Admin
2. Navigate to **System Settings** in sidebar
3. Click on **Theme Settings** tab

### Customizing Theme
1. **Pick Colors**:
   - Click color pickers to choose colors
   - Or use preset buttons for quick themes
2. **Adjust Angle**:
   - Use slider (0-360°)
   - Or click quick angle buttons
3. **Live Preview**:
   - See changes in preview card
   - Changes also apply to background immediately
4. **Save**:
   - Click "Save Theme Settings" to persist
   - Theme saved to localStorage

### Resetting Theme
1. Click "Reset to Default" button
2. Theme immediately reverts to light red
3. Custom theme removed from localStorage

## Benefits

### For Users
- ✅ Personalized experience
- ✅ Instant visual feedback
- ✅ Easy to experiment with colors
- ✅ Quick preset options
- ✅ Simple reset mechanism

### For Developers
- ✅ No backend required for theme storage
- ✅ Clean separation of concerns
- ✅ Event-driven architecture
- ✅ Reactive updates via Vue `watch`
- ✅ Scoped CSS with `.custom-theme-active`
- ✅ Easy to extend with more theme options

## Future Enhancements

Possible additions:
- 🎨 More color customization (text colors, button colors)
- 🌓 Dark mode toggle
- 💾 Save multiple theme presets
- 📤 Export/import theme configurations
- 🎭 Theme templates library
- 🔄 Animated gradient transitions
- 📱 Mobile-specific theme adjustments

## Testing

### Manual Testing Steps
1. Navigate to System Settings → Theme Settings
2. Change gradient colors → Verify immediate update
3. Change gradient angle → Verify direction changes
4. Apply a preset theme → Verify colors update
5. Save theme → Refresh page → Verify persistence
6. Reset to default → Verify theme resets
7. Log out and log back in → Verify theme persists

## Code Locations

### Main Files
- `/src/views/CompanySettings.vue` - Theme customization UI
- `/src/App.vue` - Global theme application logic

### Key Functions

**In App.vue:**
- `applyCustomTheme()` - Reads from localStorage and applies custom theme dynamically (runs on app initialization and after mount)
- `checkCustomTheme()` - Wrapper that calls `applyCustomTheme()` (triggered by theme-changed events)

**In CompanySettings.vue:**
- `applyTheme()` - Applies theme in real-time while editing (injects CSS and adds class)
- `saveThemeSettings()` - Saves theme to localStorage and dispatches event
- `resetToDefaultTheme()` - Removes theme from localStorage and dispatches event
- `applyPreset()` - Applies preset theme colors

### Key Classes
- `.custom-theme-active` - Indicates custom theme is active
- `.v-main` - Main content area where theme is applied

## Notes
- Theme changes are client-side only (localStorage)
- Each browser/device can have different theme
- Admin theme doesn't affect other users
- Future: Could sync theme to backend for cross-device support

