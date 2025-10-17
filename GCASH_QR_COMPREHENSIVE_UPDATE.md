# GCash QR Code Comprehensive Update

## Overview
Refactored the `generateGCashQR` function in BookingCart.vue to be a comprehensive, self-contained function that retrieves all payment details from the Payment Settings module and intelligently handles both custom uploaded QR codes and dynamically generated QR codes.

## What Changed

### Before
The previous implementation had two separate functions:
1. `loadPaymentSettings()` - Loaded payment settings
2. `generateGCashQR()` - Only generated dynamic QR codes

The watcher had to:
- Call `loadPaymentSettings()` first
- Check if custom QR exists
- Conditionally call `generateGCashQR()` only if no custom QR

This split logic was confusing and error-prone.

### After
Now there's a single comprehensive `generateGCashQR()` function that:
1. ✅ Loads all payment settings from Payment Settings module
2. ✅ Checks if a custom uploaded QR code exists
3. ✅ Uses the custom QR code if available
4. ✅ Generates a dynamic QR code if no custom upload
5. ✅ Uses all details from the Payment Settings module (number, name, instructions)
6. ✅ Includes detailed console logging for debugging

## Implementation Details

### New `generateGCashQR()` Function
**File:** `src/components/BookingCart.vue`

```javascript
/**
 * Generate or load GCash QR code
 * This function retrieves all payment details from the Payment Settings module
 * and either displays the uploaded custom QR code or generates a dynamic one
 */
const generateGCashQR = async () => {
  try {
    // Step 1: Load all payment settings from Payment Details module
    const settings = await paymentSettingService.getPaymentSettings()
    paymentSettings.value = settings

    console.log('Payment settings loaded:', settings)

    // Step 2: Check if custom QR code exists
    if (settings.payment_qr_code_url) {
      // Custom QR code uploaded by admin - use it
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      paymentSettings.value.payment_qr_code_url = `${apiUrl}${settings.payment_qr_code_url}`

      console.log('Using custom uploaded QR code:', paymentSettings.value.payment_qr_code_url)

      // No need to generate canvas, v-img will display the uploaded QR
      return
    }

    // Step 3: No custom QR code - generate dynamic QR using payment settings
    await nextTick()

    if (gcashQrCanvas.value) {
      // Use all details from Payment Settings module
      const gcashNumber = settings.payment_gcash_number.replace(/-/g, '')
      const accountName = settings.payment_gcash_name.replace(/\s+/g, '')
      const amount = totalPrice.value

      console.log('Generating dynamic QR code with:', {
        number: gcashNumber,
        name: accountName,
        amount: amount
      })

      // Generate QR code with GCash payment link format
      const qrData = `gcash://pay?number=${gcashNumber}&amount=${amount}&name=${accountName}`

      await QRCode.toCanvas(gcashQrCanvas.value, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#2e7d32',  // Green color for GCash
          light: '#ffffff'
        }
      })

      console.log('Dynamic QR code generated successfully')
    }
  } catch (error) {
    console.error('Failed to load payment settings or generate QR code:', error)
    // Keep default values if loading fails
  }
}
```

### Simplified Watcher
```javascript
// Watch for payment dialog open to load payment details and generate/display QR code
watch(paymentDialog, async (newVal) => {
  if (newVal) {
    // Generate/load QR code when payment dialog opens
    // This function handles everything: loading payment settings, checking for custom QR, and generating dynamic QR if needed
    await nextTick()
    setTimeout(() => {
      generateGCashQR()
    }, 150)
  }
})
```

## Benefits

### 1. **Single Source of Truth**
- All payment details come from the Payment Settings module
- No more hardcoded values
- GCash number, account name, and QR code all retrieved dynamically

### 2. **Self-Contained Logic**
- One function does everything
- Easier to understand and maintain
- No need to coordinate multiple functions

### 3. **Intelligent Decision Making**
- Automatically detects if custom QR exists
- Uses custom QR when available
- Falls back to dynamic generation seamlessly

### 4. **Better Debugging**
- Console logs at each step
- Shows what settings were loaded
- Indicates whether using custom or dynamic QR
- Displays QR generation parameters

### 5. **Cleaner Code**
- Removed redundant `loadPaymentSettings()` function
- Simplified watcher logic
- Better function naming and documentation

## Flow Diagram

```
User Clicks Checkout
        ↓
Payment Dialog Opens
        ↓
generateGCashQR() Called
        ↓
Load Payment Settings from API
        ↓
    ┌───────────────────────┐
    │ Custom QR Uploaded?   │
    └───────────────────────┘
           ↓          ↓
         YES         NO
           ↓          ↓
    Display Custom   Generate Dynamic QR
    Uploaded Image   with Settings Data
           ↓          ↓
    ┌─────────────────────┐
    │  User Sees QR Code  │
    └─────────────────────┘
```

## Data Retrieved from Payment Settings Module

The function retrieves and uses:
1. **payment_gcash_number** - Phone number for GCash
2. **payment_gcash_name** - Account holder name
3. **payment_instructions** - Custom instructions (displayed in UI)
4. **payment_qr_code_url** - Custom uploaded QR code (if exists)

All these values are managed by admin in the Payment Settings page.

## Console Output Examples

### When Custom QR Code Exists:
```
Payment settings loaded: {
  payment_gcash_number: "0917-123-4567",
  payment_gcash_name: "Perfect Smash",
  payment_instructions: "...",
  payment_qr_code_url: "/storage/payment-qr-codes/xyz.png"
}
Using custom uploaded QR code: http://localhost:8000/storage/payment-qr-codes/xyz.png
```

### When No Custom QR Code:
```
Payment settings loaded: {
  payment_gcash_number: "0917-123-4567",
  payment_gcash_name: "Perfect Smash",
  payment_instructions: "...",
  payment_qr_code_url: null
}
Generating dynamic QR code with: {
  number: "09171234567",
  name: "PerfectSmash",
  amount: 1500
}
Dynamic QR code generated successfully
```

## Testing

### Test Cases
1. ✅ Opens payment dialog with custom QR uploaded → Shows custom image
2. ✅ Opens payment dialog without custom QR → Generates dynamic QR
3. ✅ Admin uploads new QR → Next checkout shows new QR
4. ✅ Admin removes QR → Next checkout generates dynamic QR
5. ✅ Payment settings updated → QR reflects new settings
6. ✅ API fails → Falls back to default values gracefully

## Files Modified

1. **src/components/BookingCart.vue**
   - Refactored `generateGCashQR()` function
   - Removed `loadPaymentSettings()` function (logic merged)
   - Simplified payment dialog watcher
   - Added comprehensive documentation
   - Added console logging for debugging

## Backward Compatibility

- ✅ Fully backward compatible
- ✅ Existing functionality preserved
- ✅ No breaking changes to API or data structures
- ✅ Works with or without custom QR codes
- ✅ Graceful fallback on errors

## Performance

- **Improved**: Only one API call per checkout (was potentially two)
- **Faster**: No redundant payment settings loads
- **Efficient**: Early return when custom QR exists (no canvas generation needed)

## Future Enhancements

Potential improvements (not implemented):
1. Cache payment settings to avoid repeated API calls
2. Add loading state while fetching settings
3. Add retry logic for failed API calls
4. Support multiple QR code types (GCash, PayMaya, etc.)
5. Add QR code expiration handling

## Conclusion

The refactored `generateGCashQR()` function is now a comprehensive, self-contained solution that intelligently retrieves all payment details from the Payment Settings module and handles both custom and dynamic QR codes seamlessly. The code is cleaner, more maintainable, and better documented.
