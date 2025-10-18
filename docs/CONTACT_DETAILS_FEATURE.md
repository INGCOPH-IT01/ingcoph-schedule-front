# Contact Details Feature

## Overview
Added UI for managing contact details in Company Settings, allowing administrators to configure email, mobile, and Viber contact information.

## Implementation Date
October 18, 2025

## Changes Made

### Frontend (`CompanySettings.vue`)

#### 1. New UI Section
Added a "Contact Details" section in the Company Information card with three fields:
- **Email Address** - Primary email for customer inquiries
- **Mobile Number** - Contact mobile number
- **Viber Number** - Viber contact number (if different from mobile)

#### 2. Data Properties
Added reactive refs for contact information:
```javascript
const contactEmail = ref('')
const originalContactEmail = ref('')
const contactMobile = ref('')
const originalContactMobile = ref('')
const contactViber = ref('')
const originalContactViber = ref('')
```

#### 3. Email Validation
Added email validation rule:
```javascript
email: value => {
  if (!value) return true // Allow empty email
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || 'Invalid email address'
}
```

#### 4. Load Settings
Updated `loadSettings()` to load contact details from the API:
```javascript
contactEmail.value = settings.contact_email || ''
contactMobile.value = settings.contact_mobile || ''
contactViber.value = settings.contact_viber || ''
```

#### 5. Save Settings
Updated `saveSettings()` to include contact details in the payload:
```javascript
const settingsData = {
  company_name: companyName.value,
  contact_email: contactEmail.value,
  contact_mobile: contactMobile.value,
  contact_viber: contactViber.value
}
```

#### 6. Reset Form
Updated `resetForm()` to reset contact fields:
```javascript
contactEmail.value = originalContactEmail.value
contactMobile.value = originalContactMobile.value
contactViber.value = originalContactViber.value
```

### Frontend Service (`companySettingService.js`)

Updated the FormData builder to include contact fields when uploading files:
```javascript
if (settingsData.contact_email !== undefined) {
  payload.append('contact_email', settingsData.contact_email || '')
}
if (settingsData.contact_mobile !== undefined) {
  payload.append('contact_mobile', settingsData.contact_mobile || '')
}
if (settingsData.contact_viber !== undefined) {
  payload.append('contact_viber', settingsData.contact_viber || '')
}
```

### Backend (Already Implemented)

The backend already had support for contact details:

1. **API Controller** (`CompanySettingController.php`)
   - Lines 92-99: Default values in `index()` method
   - Lines 161-163: Validation rules in `update()` method
   - Lines 263-272: Save logic in `update()` method
   - Lines 293-295: Response data includes contact fields

2. **Database Structure**
   - Uses key-value storage in `company_settings` table
   - Contact fields are stored as:
     - `contact_email`
     - `contact_mobile`
     - `contact_viber`

## UI Features

### Field Details
1. **Email Address**
   - Icon: mdi-email
   - Placeholder: "company@example.com"
   - Validation: Email format (optional field)
   - Hint: "Primary email for customer inquiries"

2. **Mobile Number**
   - Icon: mdi-cellphone
   - Placeholder: "+63 XXX XXX XXXX"
   - Hint: "Contact mobile number"

3. **Viber Number**
   - Icon: mdi-message-text
   - Placeholder: "+63 XXX XXX XXXX"
   - Hint: "Viber contact number (if different from mobile)"

### User Experience
- Fields are clearly labeled with icons
- Helpful placeholders guide users on format
- Persistent hints provide context
- Visual separator (divider) between company name and contact details
- All fields are optional
- Loading and saving states are properly handled
- Reset button restores original values

## API Endpoints

### Get Settings
```
GET /api/company-settings
```
Returns all settings including contact details.

### Update Settings
```
PUT /api/admin/company-settings
POST /api/admin/company-settings (with file upload)
```
Accepts contact_email, contact_mobile, and contact_viber fields.

## Usage

### For Administrators
1. Navigate to Company Settings
2. Scroll to the Contact Details section
3. Enter email, mobile, and/or Viber contact information
4. Click "Save Changes" to update
5. Use "Reset" to revert to saved values

### Integration Points
The contact details can be used throughout the application for:
- Customer support information
- Booking inquiries
- Payment confirmation
- General communications

## Files Modified

### Frontend
- `/src/views/CompanySettings.vue` - Added UI and logic
- `/src/services/companySettingService.js` - Updated FormData handling

### Backend
- No changes needed (already implemented)

## Testing Checklist

- [ ] Contact fields load correctly from API
- [ ] Email validation works (accepts valid emails, rejects invalid)
- [ ] All three contact fields save correctly
- [ ] Empty values are handled properly
- [ ] Reset button restores original values
- [ ] File upload with contact fields works
- [ ] Non-file updates with contact fields work
- [ ] Contact details persist across page reloads

## Future Enhancements

Potential improvements:
1. Phone number formatting/validation
2. Click-to-call functionality
3. Display contact info on public pages
4. Multiple contact methods
5. Contact hours/availability
6. Department-specific contacts
