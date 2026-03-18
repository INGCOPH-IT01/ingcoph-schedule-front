# Promotion System Implementation

## Overview
A complete promotion management system has been added to allow Admins to advertise promotions with images/videos and styled HTML content, displayed on the home page.

## Backend Implementation

### 1. Database Migration
**File**: `database/migrations/2026_01_27_150214_create_promotions_table.php`
- Creates `promotions` table with fields:
  - `id`: Primary key
  - `title`: Promotion title
  - `content`: HTML content (longText)
  - `media`: JSON array of image/video URLs
  - `is_active`: Boolean for active status
  - `display_order`: Integer for ordering
  - `published_at`: Optional publish date
  - `expires_at`: Optional expiration date
  - `created_by`: Foreign key to users table
  - `timestamps`: Created/updated timestamps

### 2. Model
**File**: `app/Models/Promotion.php`
- Fillable fields for mass assignment
- Casts media to array, dates to datetime
- Relationship: `creator()` belongs to User
- Scopes:
  - `active()`: Filters active, published, and non-expired promotions
  - `ordered()`: Orders by display_order and created_at

### 3. Controller
**File**: `app/Http/Controllers/Api/PromotionController.php`
- RESTful API endpoints:
  - `index()`: Get all promotions (admin)
  - `store()`: Create new promotion with file uploads
  - `show()`: Get single promotion
  - `update()`: Update promotion with file uploads
  - `destroy()`: Delete promotion and associated media
  - `active()`: Get active promotions (public)
- Handles file uploads (images/videos up to 50MB)
- Validates input data
- Manages existing media URLs on updates

### 4. Routes
**File**: `routes/api.php`
- Public route: `GET /api/promotions/active`
- Admin routes (protected):
  - `GET /api/admin/promotions`
  - `POST /api/admin/promotions`
  - `GET /api/admin/promotions/{id}`
  - `POST /api/admin/promotions/{id}` (for multipart updates)
  - `DELETE /api/admin/promotions/{id}`

## Frontend Implementation

### 1. Service
**File**: `src/services/promotionService.js`
- Methods:
  - `getPromotions()`: Get all promotions (admin)
  - `getActivePromotions()`: Get active promotions (public)
  - `getPromotion(id)`: Get single promotion
  - `createPromotion(data)`: Create with FormData for file uploads
  - `updatePromotion(id, data)`: Update with FormData
  - `deletePromotion(id)`: Delete promotion

### 2. Admin Component
**File**: `src/views/PromotionManagement.vue`
- Features:
  - Data table showing all promotions with status, dates, and media count
  - Create/Edit dialog with:
    - Title field
    - Rich HTML editor (Quill) with full toolbar
    - Publish/expiration date pickers
    - Display order field
    - Active status toggle
    - Multiple image/video file upload
    - Existing media management (view and remove)
  - Delete confirmation
  - Beautiful Vuetify UI with cards and animations

### 3. Home Page Display
**File**: `src/views/Home.vue`
- New promotions section added after announcement banner
- Features:
  - Responsive grid layout (3 columns on desktop, 1 on mobile)
  - Card-based design matching site theme
  - Media carousel for multiple images/videos
  - HTML content rendering with proper styling
  - Fade-in animations
  - Hover effects

### 4. Navigation
**File**: `src/App.vue`
- Added "Promotion Management" menu item
- Icon: `mdi-bullhorn`
- Visible only to Admin users
- Located in admin section of navigation

### 5. Router
**File**: `src/router/index.js`
- Route: `/admin/promotions`
- Name: `PromotionManagement`
- Protected: Admin only
- Lazy loaded for code splitting

## Features

### Public Features
- **Interactive Promotion Cards**: Click any promotion to view full details
- **Rich Detail Dialog**:
  - Large media carousel display
  - Full HTML content with enhanced formatting
  - Date information display
  - Smooth animations
  - Mobile-optimized viewing
- **Keyboard Accessible**: Navigate and activate with keyboard

### Admin Capabilities
1. **Create Promotions**:
   - Add title and rich HTML content
   - Upload multiple images/videos (max 50MB each)
   - Set publish and expiration dates
   - Set display order
   - Toggle active status
   - **Enable auto-popup on home page visit**
   - **Set popup interval (1-168 hours)**

2. **Edit Promotions**:
   - Update all fields
   - Add new media files
   - Remove existing media
   - Change dates and status

3. **Delete Promotions**:
   - Confirmation dialog
   - Automatically deletes associated media files

4. **View All Promotions**:
   - Sortable data table
   - Status indicators
   - Media count display
   - Quick edit/delete actions

### User Experience
1. **Home Page Display**:
   - Only active, published, non-expired promotions shown
   - Ordered by display_order and creation date
   - Beautiful card layout in hero section
   - Image/video carousel support
   - Styled HTML content rendering
   - **Click-to-view full details dialog**

2. **Promotion Details Dialog**:
   - Opens when clicking any promotion card
   - Full-screen media carousel (400px height on desktop)
   - Complete HTML content with enhanced typography
   - Publication and expiration date display
   - Smooth animations and transitions
   - Scrollable content for long promotions
   - Close button and overlay click to dismiss

3. **Responsive Design**:
   - Mobile-friendly dialog (250px media height on mobile)
   - Adaptive grid layout
   - Touch-optimized
   - Keyboard accessible (Tab/Enter navigation)

## HTML Editor Features
The Quill editor includes:
- Text formatting (bold, italic, underline, strikethrough)
- Headings (H1-H6)
- Lists (ordered/unordered)
- Text alignment
- Colors and backgrounds
- Links, images, and videos
- Code blocks and quotes
- Font sizes and families

## File Upload Support
- **Image formats**: JPEG, JPG, PNG, GIF, WebP
- **Video formats**: MP4, MOV, AVI
- **Max file size**: 50MB per file
- **Multiple files**: Yes
- **Storage**: Laravel public disk
- **Automatic cleanup**: Files deleted when promotion is removed

## Access Control
- **Admin**: Full CRUD access to promotions
- **Staff**: No access
- **Cashier**: No access
- **User**: Can view active promotions on home page
- **Guest**: Can view active promotions on home page

## Usage Instructions

### For Admins:
1. Log in as admin
2. Navigate to "Promotion Management" in the menu
3. Click "New Promotion" button
4. Fill in title and content using the HTML editor
5. Upload images/videos (optional)
6. Set dates and display order (optional)
7. Toggle active status
8. Click "Save"

### For Users:
- Visit the home page to see active promotions
- Promotions appear in the hero section before the operating hours
- Click through image carousels if multiple images are present
- **Click on any promotion card to view full details in a dialog**
- The dialog shows:
  - Full-size media carousel (if available)
  - Complete HTML content with proper formatting
  - Publication and expiration dates
- Close the dialog to return to browsing

## Technical Notes
- Backend uses Laravel 11.x
- Frontend uses Vue 3 with Composition API
- UI framework: Vuetify 3
- Rich text editor: Vue Quill
- File storage: Laravel public disk
- Date handling: datetime-local input type
- Content sanitization: Browser's built-in XSS protection

## Auto-Popup Feature

### Overview
Promotions can be configured to automatically display when users visit the home page, with customizable intervals to control frequency.

### Configuration
- **Enable/Disable**: Toggle switch in promotion form
- **Interval**: 1 to 168 hours (1 hour to 1 week)
- **Quick Presets**: Every hour, 4 hours, 12 hours, daily, 3 days, weekly

### Behavior
- Shows automatically after page loads (1.5 second delay)
- Respects interval - only shows again after time expires
- Tracks via localStorage (per promotion)
- Shows one popup at a time (priority by display_order)
- Works with hybrid display (banner + full section)

### Use Cases
- Flash sales (1-4 hour intervals)
- Daily specials (24 hour intervals)
- Event announcements (48-72 hour intervals)
- Seasonal promotions (weekly intervals)

**See**: `PROMOTION_AUTO_POPUP_FEATURE.md` for complete details

---

## Next Steps (Optional Enhancements)
1. Add promotion categories/tags
2. Add view count tracking
3. Add advanced targeting (new visitors, user roles)
4. Add promotion templates
5. Add email notifications for new promotions
6. Add social media sharing buttons
7. Add analytics dashboard for promotion views
8. Add A/B testing for auto-popup intervals
