# Image Validation Guide

## Frontend Image Validation Features

### ✅ What's Validated

1. **File Type**: Only JPEG, JPG, PNG, and GIF images are allowed
2. **File Size**: Maximum 2MB (2,048 KB)
3. **File Validity**: Must be a valid File object

### 🎯 Where Validation Happens

#### 1. **Real-time Validation** (as you select the file)
When you click the file input and select an image:
- ✅ Immediate validation feedback
- ✅ Red error text appears if invalid
- ✅ Green checkmark if valid

#### 2. **Pre-submission Validation** (when you click Save)
Before sending to the server:
- ✅ Form validation check
- ✅ Image double-check validation
- ✅ Error snackbar notification if issues found

### 📋 Validation Messages

#### File Size Error
```
❌ Image size must be less than 2MB. Current size: 3.5MB
```

#### File Type Error
```
❌ Invalid file type. Allowed types: JPEG, PNG, GIF. Got: image/bmp
```

or when submitting:
```
❌ Invalid file type: image/webp. Allowed: JPEG, PNG, GIF
```

#### Success
```
✅ Product created successfully
```

### 🧪 Testing Scenarios

#### Scenario 1: Upload Too Large File
1. Go to Product Management → Add Product
2. Fill required fields
3. Try to upload a 5MB image
4. **Expected**: Error message appears below file input
5. **Expected**: "Please fix validation errors" when trying to save

#### Scenario 2: Upload Wrong File Type
1. Go to Product Management → Add Product
2. Fill required fields
3. Try to upload a .bmp, .webp, or .svg file
4. **Expected**: Error message appears below file input
5. **Expected**: Cannot submit form

#### Scenario 3: Upload Valid Image
1. Go to Product Management → Add Product
2. Fill required fields
3. Upload a JPEG/PNG/GIF under 2MB
4. **Expected**: No error, file size shown
5. **Expected**: Successfully saves and image displays in table

### 🎨 UI Elements

#### File Input Display
```
┌─────────────────────────────────────────────┐
│ 📷 Product Image                            │
│                                              │
│  [Select file...]  "image.jpg (1.2 MB)"     │
│                                              │
│  Max 2MB. Supported: JPEG, PNG, GIF         │
└─────────────────────────────────────────────┘
```

#### With Error
```
┌─────────────────────────────────────────────┐
│ 📷 Product Image                            │
│                                              │
│  [Select file...]  "large.jpg (3.5 MB)"     │
│                                              │
│  ❌ Image size must be less than 2MB.       │
│     Current size: 3.5MB                     │
└─────────────────────────────────────────────┘
```

### 💡 Best Practices

#### For Users:
1. **Resize images before upload** if they're larger than 2MB
2. **Use common formats** (JPEG, PNG, GIF)
3. **Check file size** - shown next to file name
4. **Read error messages** - they tell you exactly what's wrong

#### For Developers:
1. Validation happens at **two levels**:
   - Real-time (on file selection)
   - Pre-submission (before API call)
2. Both frontend AND backend validate
3. Clear, user-friendly error messages
4. No wasted API calls for invalid files

### 🔍 Technical Details

#### Validation Rules Function
```javascript
const imageRules = [
  (value) => {
    // 1. Optional field check
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return true // Image is optional
    }

    // 2. Extract File object
    const file = Array.isArray(value) ? value[0] : value

    // 3. Type check
    if (!(file instanceof File)) {
      return true // Not a file, skip validation
    }

    // 4. Size validation
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      return `Image size must be less than 2MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }

    // 5. Type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: JPEG, PNG, GIF. Got: ${file.type}`
    }

    return true // All checks passed
  }
]
```

#### File Input Configuration
```vue
<v-file-input
  v-model="productImage"
  label="Product Image"
  accept="image/jpeg,image/jpg,image/png,image/gif"
  :rules="imageRules"
  show-size
  hint="Max 2MB. Supported: JPEG, PNG, GIF"
  persistent-hint
/>
```

### 📊 Supported vs Unsupported Formats

#### ✅ Supported (Will Work)
- `.jpg` / `.jpeg` (image/jpeg)
- `.png` (image/png)
- `.gif` (image/gif)

#### ❌ Not Supported (Will Be Rejected)
- `.bmp` (image/bmp)
- `.webp` (image/webp)
- `.svg` (image/svg+xml)
- `.tiff` (image/tiff)
- `.ico` (image/x-icon)
- Any non-image files

### 🚀 Quick Reference

| Validation | Max Size | Allowed Types | When Validated |
|------------|----------|---------------|----------------|
| Real-time  | 2MB      | JPEG, PNG, GIF | On file selection |
| Pre-submit | 2MB      | JPEG, PNG, GIF | Before API call |
| Backend    | 2MB      | JPEG, PNG, GIF | On server receipt |

### 🐛 Troubleshooting

#### Problem: Validation not showing
**Solution**: Check browser console for JavaScript errors

#### Problem: Valid file rejected
**Solution**:
1. Check file size (must be < 2MB)
2. Check file extension and MIME type
3. Check browser console logs

#### Problem: Large file takes too long
**Solution**:
- Validation catches this BEFORE upload
- Error shown immediately
- No API call is made

### 📝 Notes

- Image field is **optional** - products can be created without images
- Validation is case-insensitive for file extensions
- File size is shown in human-readable format (KB/MB)
- Validation errors are user-friendly, not technical
