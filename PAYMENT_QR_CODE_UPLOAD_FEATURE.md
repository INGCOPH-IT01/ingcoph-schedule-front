# Payment QR Code Upload Feature

## Overview
Enhanced the Payment Settings module to allow admin users to upload a custom GCash QR code image. This QR code will be displayed to users during checkout instead of a dynamically generated one.

## What Was Implemented

### Backend Changes

#### 1. Database Migration
**File:** `ingcoph-schedule-back/database/migrations/2025_10_17_054135_add_payment_qr_code_to_company_settings.php`
- Added `payment_qr_code` field to `company_settings` table
- Stores the file path to the uploaded QR code image
- Default value: null (will generate dynamic QR code)

#### 2. Controller Updates
**File:** `ingcoph-schedule-back/app/Http/Controllers/Api/CompanySettingController.php`
- **index() method**: Returns `payment_qr_code_url` if QR code exists
- **update() method**:
  - Added validation for `payment_qr_code` image upload
  - Handles file upload to `storage/app/public/payment-qr-codes/`
  - Deletes old QR code when new one is uploaded
  - Returns QR code URL in response
- **deletePaymentQrCode() method** (NEW):
  - Deletes the uploaded QR code image
  - Removes the setting from database
  - Admin-only endpoint

#### 3. API Routes
**File:** `ingcoph-schedule-back/routes/api.php`
- Added route: `DELETE /api/admin/company-settings/payment-qr-code`
- Protected with admin middleware

### Frontend Changes

#### 1. Payment Setting Service Updates
**File:** `ingcoph-schedule-front/src/services/paymentSettingService.js`
- **getPaymentSettings()**: Now returns `payment_qr_code` and `payment_qr_code_url`
- **updatePaymentSettingsFull()**: Enhanced to handle QR code file upload
  - Uses FormData when QR code file is provided
  - Falls back to JSON for text-only updates
- **deletePaymentQrCode()** (NEW): Deletes the uploaded QR code

#### 2. Payment Settings View Updates
**File:** `ingcoph-schedule-front/src/views/PaymentSettings.vue`
- Added QR code upload section with:
  - File input for image upload (accepts JPEG, PNG, GIF, SVG, WEBP)
  - Live preview of uploaded QR code
  - Current QR code display (if already uploaded)
  - Remove QR code button
  - Helpful hint about dynamic QR generation
- New reactive variables:
  - `qrCodeFile`: Stores selected file
  - `qrCodePreview`: Shows preview of new upload
  - `currentQrCodeUrl`: Shows existing QR code
- New methods:
  - `handleQrCodeChange()`: Generates preview when file selected
  - `clearQrCode()`: Clears file selection
  - `removeQrCode()`: Deletes uploaded QR code from server

#### 3. Booking Cart Updates
**File:** `ingcoph-schedule-front/src/components/BookingCart.vue`
- Updated QR code display logic:
  - Shows uploaded QR code image if exists (`v-img`)
  - Falls back to dynamic canvas generation if no upload
- Updated `loadPaymentSettings()`: Constructs full URL for QR code image
- Updated payment dialog watcher: Only generates dynamic QR if no custom upload exists

## How to Use

### For Admin Users

1. **Upload Custom QR Code:**
   - Navigate to Payment Settings (`/#/admin/payment-settings`)
   - Scroll to "GCash QR Code" section
   - Click "Upload GCash QR Code"
   - Select your QR code image (max 2MB)
   - Preview appears immediately
   - Click "Save Payment Settings" to upload

2. **Remove Custom QR Code:**
   - In Payment Settings, if a QR code is uploaded, it will display
   - Click "Remove QR Code" button
   - System will revert to dynamic QR code generation

3. **What Happens:**
   - **With Custom QR**: Users see your uploaded image during checkout
   - **Without Custom QR**: System generates QR based on GCash number and amount

### For Users

- No change to user experience
- During checkout, they see either:
  - Custom uploaded QR code (if admin uploaded one)
  - Dynamically generated QR code (if no custom upload)
- Both QR codes are functional and can be scanned

## Technical Details

### File Storage
- **Location**: `storage/app/public/payment-qr-codes/`
- **Public URL**: `/storage/payment-qr-codes/{filename}`
- **Max Size**: 2MB
- **Formats**: JPEG, JPG, PNG, GIF, SVG, WEBP

### QR Code Priority
1. **Custom Upload** (if exists): Display uploaded image
2. **Dynamic Generation** (fallback): Generate QR with format `gcash://pay?number={phone}&amount={total}&name={account_name}`

### API Endpoints

#### Get Payment Settings
```
GET /api/company-settings
Response includes:
- payment_qr_code: string|null (file path)
- payment_qr_code_url: string|null (public URL)
```

#### Upload QR Code
```
POST /api/admin/company-settings
Content-Type: multipart/form-data
Body:
- company_name: string (required)
- payment_gcash_number: string
- payment_gcash_name: string
- payment_instructions: string
- payment_qr_code: file (optional)
- _method: PUT
```

#### Delete QR Code
```
DELETE /api/admin/company-settings/payment-qr-code
Auth: Admin only
```

## Files Modified

### Backend
1. `database/migrations/2025_10_17_054135_add_payment_qr_code_to_company_settings.php` (new)
2. `app/Http/Controllers/Api/CompanySettingController.php` (modified)
3. `routes/api.php` (modified)

### Frontend
1. `src/services/paymentSettingService.js` (modified)
2. `src/views/PaymentSettings.vue` (modified)
3. `src/components/BookingCart.vue` (modified)

## Security Considerations

- Only admin users can upload/delete QR codes
- File type validation on both client and server
- File size limit: 2MB
- Old QR codes are automatically deleted when new ones are uploaded
- Proper storage permissions for uploaded files

## Benefits

1. **Branding**: Use official bank QR codes with logos
2. **Flexibility**: Switch between dynamic and static QR codes
3. **Consistency**: Ensure QR code matches official account
4. **Easy Management**: Simple upload/remove interface
5. **Fallback**: Automatic dynamic generation if no upload

## Testing Checklist

- [x] QR code upload works with various image formats
- [x] Preview displays correctly before save
- [x] Uploaded QR code displays in BookingCart
- [x] Dynamic QR generation works when no upload
- [x] Remove QR code functionality works
- [x] File size validation works
- [x] Admin-only access enforced
- [x] Old QR codes deleted on new upload
- [x] No linter errors

## Backward Compatibility

- Existing payment settings continue to work
- If no QR code uploaded, system generates dynamic QR (existing behavior)
- No breaking changes to API or database structure

## Future Enhancements (Optional)

1. Multiple QR codes for different payment methods
2. QR code analytics (scan tracking)
3. QR code expiration dates
4. Batch upload for multiple locations
5. QR code validation before upload

## Conclusion

The Payment QR Code Upload feature is fully functional and seamlessly integrated. Admin users can now upload custom QR codes that will be displayed during checkout, with automatic fallback to dynamic generation when no custom QR exists.
