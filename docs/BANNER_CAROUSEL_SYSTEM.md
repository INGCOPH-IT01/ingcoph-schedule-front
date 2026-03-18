# Banner Carousel System

## Overview
The Banner Carousel System allows you to display multiple banner images in a carousel/slider on the homepage, similar to the INGCO example. Banners auto-rotate and include navigation dots for manual control.

## Features
- ✅ Upload multiple banner images
- ✅ Auto-rotating carousel (5 seconds per slide)
- ✅ Manual navigation with dots and arrows
- ✅ Active/Inactive status for each banner
- ✅ Custom display order
- ✅ Responsive design (works on all devices)
- ✅ Optional titles for each banner
- ✅ Admin-only management interface

## How to Use

### For Admin Users

#### 1. Access Banner Management
- Login as an admin user
- Click on **"Banner Management"** in the sidebar navigation
- You'll see all existing banners in a grid layout

#### 2. Add a New Banner
1. Click the **"Add Banner"** button in the top-right corner
2. Fill in the form:
   - **Banner Title** (Optional): A descriptive name for the banner
   - **Banner Image** (Required): Upload an image file (JPG, PNG, GIF, WEBP, max 5MB)
   - **Display Order**: Lower numbers appear first (0, 1, 2, etc.)
   - **Active**: Toggle to make the banner visible or hidden
3. Click **"Create"** to save

#### 3. Edit a Banner
1. Find the banner you want to edit
2. Click the **"Edit"** button
3. Update any fields:
   - Change the title
   - Upload a new image (optional - leave empty to keep current)
   - Change the display order
   - Toggle active/inactive status
4. Click **"Update"** to save

#### 4. Activate/Deactivate a Banner
- Click the **"Activate"** or **"Deactivate"** button on any banner card
- Inactive banners won't appear on the homepage but remain in your library

#### 5. Delete a Banner
1. Click the **trash icon** (🗑️) on the banner card
2. Confirm the deletion in the dialog
3. The banner and its image will be permanently deleted

### For Public Users
- Banners automatically appear at the top of the homepage
- Banners auto-rotate every 5 seconds
- Click on the dots at the bottom to navigate manually
- Hover over the carousel to see arrow navigation

## Technical Details

### Backend (Laravel)
- **Migration**: `2026_01_28_000000_create_banners_table.php`
- **Model**: `App\Models\Banner`
- **Controller**: `App\Http\Controllers\Api\BannerController`
- **Routes**:
  - `GET /api/banners` - Public: Get active banners
  - `GET /api/admin/banners` - Admin: Get all banners
  - `POST /api/admin/banners` - Admin: Create banner
  - `POST /api/admin/banners/{id}` - Admin: Update banner
  - `DELETE /api/admin/banners/{id}` - Admin: Delete banner
  - `POST /api/admin/banners/reorder` - Admin: Reorder banners

### Frontend (Vue.js)
- **Component**: `src/components/BannerCarousel.vue` - Public carousel display
- **View**: `src/views/BannerManagement.vue` - Admin management interface
- **Service**: `src/services/bannerService.js` - API calls
- **Router**: Added route `/admin/banners` for management

### Database Schema
```sql
CREATE TABLE banners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NULL,
    image_path VARCHAR(255) NOT NULL,
    order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Best Practices

### Image Specifications
- **Recommended Resolution**: 1920x800px (widescreen)
- **Aspect Ratio**: 21:9 or 16:9
- **File Format**: JPG or WebP for best performance
- **File Size**: Under 500KB (optimized)
- **Maximum Size**: 5MB

### Design Tips
1. Use high-quality images with clear focus
2. Ensure text on images is readable on all devices
3. Keep important content in the center (safe area)
4. Test on mobile devices to ensure readability
5. Use consistent styling across all banners
6. Limit to 3-5 banners for best user experience

### Order Management
- Use incremental numbers (0, 10, 20, 30) to allow easy reordering
- Banner with order 0 appears first
- Multiple banners can have the same order (sorted by creation date)

## Troubleshooting

### Banner Not Showing
1. Check if banner is marked as **Active**
2. Verify the image uploaded correctly
3. Check browser console for errors
4. Clear browser cache

### Image Upload Failed
1. Check file size (must be under 5MB)
2. Verify file format (JPG, PNG, GIF, WEBP only)
3. Check server storage permissions
4. Ensure Laravel storage is linked: `php artisan storage:link`

### Carousel Not Auto-Rotating
1. Check if there are multiple active banners
2. Verify JavaScript is enabled in browser
3. Check browser console for errors

## Future Enhancements (Not Implemented Yet)
- Link URLs for each banner
- Scheduled start/end dates
- Click tracking analytics
- Drag-and-drop reordering
- Bulk upload
- Image cropping tool
- Video banner support

## Support
For issues or questions, contact the development team.
