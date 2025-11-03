# 🧪 Image Upload Testing Guide

## Critical Fix Applied

**The root cause was the axios Content-Type header conflict with FormData.**

### What Was Wrong:
- Default axios config set `Content-Type: application/json`
- When sending FormData, this header was overriding the multipart boundary
- Laravel couldn't parse the file data without the boundary parameter

### What Was Fixed:
- Axios interceptor now detects FormData and removes the Content-Type header
- Browser automatically sets `Content-Type: multipart/form-data; boundary=...`
- Laravel can now properly parse the file upload

## 🔍 Step-by-Step Testing

### 1. Clear Browser Cache & Reload
```bash
# In your browser:
- Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) for hard reload
- Or open DevTools → Network tab → Check "Disable cache"
```

### 2. Clear Laravel Cache (Already Done)
```bash
cd /path/to/backend
php artisan config:cache
php artisan route:cache
```

### 3. Clear Laravel Log
```bash
cd /path/to/backend
> storage/logs/laravel.log
# or
echo "" > storage/logs/laravel.log
```

### 4. Open Browser DevTools
- Press F12
- Go to **Console** tab (for frontend logs)
- Go to **Network** tab (for HTTP requests)

### 5. Test Product Creation with Image

#### A. Go to Product Management
- Navigate to the Product Management page
- Click "Add Product" button

#### B. Fill Form
- **Name**: Test Product
- **SKU**: TEST123
- **Price**: 100
- **Track Inventory**: ON
- **Active**: ON

#### C. Select Image File
- Click "Product Image" file input
- Select a JPEG/PNG/GIF file (under 2MB)
- **Watch Console** - you should see:

```javascript
productImage.value: File {name: "test.jpg", ...}
Image file to upload: {
  name: "test.jpg",
  type: "image/jpeg",
  size: 123456,
  sizeInMB: "0.12MB"
}
```

#### D. Click Save Button
**Watch Console** - you should see:

```javascript
Adding file image: test.jpg image/jpeg 123456
FormData contents:
  name : Test Product
  sku : TEST123
  price : 100
  track_inventory : 1
  is_active : 1
  image : File(test.jpg, 123456 bytes)

🚀 FormData detected, removing Content-Type header
📦 FormData entries: [
  "name: Test Product",
  "sku: TEST123",
  "price: 100",
  "image: File(test.jpg, 123456 bytes)",
  ...
]
✅ Headers after modification: {Authorization: "Bearer ...", Accept: "application/json"}
```

**Watch Network Tab:**
1. Find the POST request to `/api/pos/products`
2. Click on it
3. Check **Headers** tab:
   - Request Headers should show: `Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...`
   - You should see the boundary parameter!
4. Check **Payload** tab:
   - Should show the multipart form data structure

### 6. Check Laravel Log

```bash
cd /path/to/backend
tail -f storage/logs/laravel.log
```

**You should see:**
```
[timestamp] local.INFO: Product creation request received
{
  "has_file": true,
  "all_files": ["image"],
  "all_inputs": ["name", "sku", "price", ..., "image"],
  "content_type": "multipart/form-data; boundary=----..."
}

[timestamp] local.INFO: Image upload detected
{
  "original_name": "test.jpg",
  "mime_type": "image/jpeg",
  "size": 123456
}

[timestamp] local.INFO: Image saved to: products/xyz123abc456.jpg
```

### 7. Verify Success

#### A. Check UI
- Product appears in the list
- Image thumbnail is displayed
- No error messages

#### B. Check File System
```bash
cd /path/to/backend
ls -lh storage/app/public/products/
# Should show your uploaded image file
```

#### C. Check Database
```bash
cd /path/to/backend
php artisan tinker
>>> \App\Models\Product::latest()->first()->image
# Should show: "products/xyz123abc456.jpg"
```

## ❌ Troubleshooting

### Problem: Console shows "No image file selected"
**Solution:**
- Make sure you actually selected a file in the file input
- Check that `productImage.value` is not null

### Problem: Console shows validation error for image
**Solution:**
- Check file size (must be < 2MB)
- Check file type (must be JPEG, PNG, or GIF)
- Check the error message for specific details

### Problem: Network tab shows "application/json" Content-Type
**Solution:**
- Clear browser cache and hard reload
- Check that the axios interceptor fix is in place
- Restart the dev server

### Problem: Backend log shows "has_file: false"
**Solution:**
- Check Network tab → Request Headers → Content-Type
- Should have `boundary=` parameter
- If not, the FormData isn't being sent correctly

### Problem: Backend validation error
**Solution:**
Check the actual error in the response:
```javascript
// In browser console, check the error response
error.response.data.errors
```

Common issues:
- `image.image`: File type validation failed
- `image.mimes`: Wrong file extension
- `image.max`: File too large

## ✅ What Should Work Now

1. ✅ Select image file → Validation runs immediately
2. ✅ Large file (>2MB) → Error shown before upload
3. ✅ Wrong type (.bmp, .webp) → Error shown before upload
4. ✅ Valid image → Uploads successfully
5. ✅ Image appears in product list
6. ✅ Image file saved in storage directory
7. ✅ Image displays correctly in all components

## 🎯 Expected Results

### Browser Console (Success):
```
✅ productImage.value: File
✅ Image file to upload: {...}
✅ Adding file image: filename.jpg
✅ FormData detected, removing Content-Type
✅ Product created successfully (snackbar)
```

### Network Tab (Success):
```
✅ Status: 201 Created
✅ Content-Type: multipart/form-data; boundary=----...
✅ Response contains product data with image path
```

### Laravel Log (Success):
```
✅ Product creation request received (has_file: true)
✅ Image upload detected
✅ Image saved to: products/...
```

### File System (Success):
```
✅ storage/app/public/products/xyz123.jpg exists
✅ File size matches uploaded file
✅ File is a valid image
```

## 🚨 If Still Not Working

### 1. Check ALL the following:
- [ ] Browser cache cleared (hard reload)
- [ ] Dev server restarted
- [ ] Laravel cache cleared
- [ ] Axios interceptor has FormData detection
- [ ] productService.js doesn't set Content-Type manually
- [ ] Network tab shows multipart/form-data with boundary

### 2. Provide These Details:
1. **Browser Console Output** (copy all logs)
2. **Network Tab Screenshot** (Request Headers section)
3. **Laravel Log** (`storage/logs/laravel.log` last 50 lines)
4. **Error Message** (exact text)

### 3. Quick Debug Checklist:
```javascript
// In browser console, test these:
console.log('FormData test:', new FormData() instanceof FormData)
// Should be: true

console.log('File test:', new File(['test'], 'test.txt') instanceof File)
// Should be: true
```

## 📚 Additional Resources

- See `PRODUCT_IMAGE_UPLOAD_FIX.md` for detailed implementation
- See `IMAGE_VALIDATION_GUIDE.md` for validation details
- Check browser network tab for actual request details
- Check Laravel log for server-side processing

## 🎬 Quick Start Video Steps

1. Open Product Management
2. Click Add Product
3. Fill: Name, SKU, Price
4. Upload image (JPEG/PNG/GIF, <2MB)
5. Toggle switches ON
6. Click Save
7. ✅ Should work!

If you see the product with its image in the list → **SUCCESS!** 🎉

