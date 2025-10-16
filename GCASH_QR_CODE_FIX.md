# GCash QR Code Display Fix

## Issue
The GCash QR code was not displaying in the payment dialogs because the QR code generation function was not being triggered when the user navigated to the payment screen.

## Root Cause
1. **NewBookingDialog.vue**: The QR code generation was only triggered by the `paymentMethod` watcher, but since GCash is the default payment method, the watcher never fired when moving to step 3 (confirmation step).

2. **BookingCart.vue**: The QR code generation in `openPaymentDialog()` was called, but the timing might not have been sufficient for the canvas element to be fully rendered in the DOM.

## Solution

### 1. NewBookingDialog.vue
Added a watcher for the `step` variable to generate the QR code when the user reaches step 3 (confirmation step):

```javascript
// Watch for step changes to generate QR code on step 3
watch(step, async (newStep) => {
  if (newStep === 3) {
    // Generate QR code when reaching confirmation step
    await nextTick()
    setTimeout(() => {
      generateGCashQR()
    }, 100)
  }
})
```

### 2. BookingCart.vue
Added two improvements:

a. **Enhanced the existing `openPaymentDialog()` function** with a longer delay:
```javascript
const openPaymentDialog = async () => {
  // ... validation code ...
  paymentDialog.value = true
  // Generate QR code after dialog opens with longer delay
  await nextTick()
  setTimeout(() => {
    generateGCashQR()
  }, 150)
}
```

b. **Added a watcher for `paymentDialog`** to ensure QR code generation:
```javascript
// Watch for payment dialog open to generate QR code
watch(paymentDialog, async (newVal) => {
  if (newVal) {
    // Generate QR code when payment dialog opens
    await nextTick()
    setTimeout(() => {
      generateGCashQR()
    }, 150)
  }
})
```

## Technical Details

The fix uses:
- `nextTick()`: Ensures the DOM has updated before attempting to access the canvas element
- `setTimeout()`: Provides additional buffer time for the canvas to be fully rendered (100-150ms)
- Canvas ref: `gcashQrCanvas` - The canvas element where the QR code is drawn
- QRCode.toCanvas(): The QRCode library method that renders the QR code on the canvas

## QR Code Format
The GCash QR code uses the following format:
```
gcash://pay?number=09171234567&amount={amount}&name=CourtBookingSystem
```

## Testing
To verify the fix:
1. Open the booking dialog and proceed to step 3 - QR code should now display
2. Open the cart and click "Proceed to Checkout" - QR code should display in the payment dialog
3. The QR code should be scannable with the GCash app

## Files Modified
- `src/components/NewBookingDialog.vue`
- `src/components/BookingCart.vue`

