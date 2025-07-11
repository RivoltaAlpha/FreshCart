# Cloudinary Image Upload Setup Guide

This guide explains how to set up Cloudinary for image uploads in the FreshCart application.

## Quick Start (Using Your Existing Account)

Your Cloudinary account is already configured in the `.env` file with:

- Cloud Name: `dvs1ubd5c`
- API Key: `947871941966783`

**You just need to create an upload preset:**

1. **Go to your Cloudinary Dashboard:**
   - Visit [https://console.cloudinary.com/console/](https://console.cloudinary.com/console/)
   - Log in with your existing account

2. **Create an Upload Preset:**
   - Go to Settings → Upload → Upload Presets
   - Click "Add upload preset"
   - Set "Preset name" to `ml_default` (or change the .env value to match)
   - Set "Signing Mode" to **"Unsigned"** (this is crucial for frontend uploads)
   - Set "Folder" to `freshcart/products` (optional, for organization)
   - Save the preset

3. **Test the upload:**
   - Start your development server: `npm run dev`
   - Go to the "Create Product" page
   - Try uploading an image using the "Upload Image" option

## Alternative Setup (New Account)

If you want to use a different Cloudinary account:

1. **Sign up for Cloudinary:**
   - Go to [https://cloudinary.com/](https://cloudinary.com/)
   - Create a free account

2. **Update your `.env` file:**
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   ```

## Features Implemented

- ✅ File upload with progress tracking
- ✅ File validation (type and size)
- ✅ Error handling and user feedback
- ✅ Immediate preview while uploading
- ✅ Support for JPEG, PNG, and WebP formats
- ✅ 5MB file size limit
- ✅ Organized uploads in folders (`freshcart/products/`)
- ✅ Fallback to demo account for testing

## File Upload Flow

1. User selects a file
2. File is validated (type and size)
3. Immediate preview is shown using FileReader
4. File is uploaded to Cloudinary in the background
5. Progress is shown to the user
6. On success, the form is updated with the Cloudinary URL
7. On error, user-friendly error messages are displayed

## Troubleshooting

### "Upload preset not found" error

- Go to your Cloudinary console: Settings → Upload → Upload Presets
- Create a new preset named `ml_default`
- Make sure "Signing Mode" is set to "Unsigned"
- Save the preset and try again

### "Upload failed" error

- Check that your Cloud Name is correct in the .env file
- Ensure your Upload Preset exists and is set to "Unsigned"
- Check browser console for detailed error messages

### "Network error" or CORS issues

- Cloudinary should handle CORS automatically for unsigned uploads
- If issues persist, check your upload preset settings

### File size or type errors

- Maximum file size is 5MB
- Supported formats: JPEG, PNG, WebP
- These limits can be adjusted in the code if needed

## Code Location

The upload functionality is implemented in:

- `src/routes/store/create-product.tsx` - Main upload logic
- Environment variables in `.env` file

## Current Configuration

Your `.env` file is configured with:

```env
VITE_CLOUDINARY_CLOUD_NAME=dvs1ubd5c
VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
```

This should work once you create the `ml_default` upload preset in your Cloudinary console.

## Security Notes

- Upload presets are used for unsigned uploads from the frontend
- All uploads go to the `freshcart/products/` folder for organization
- Consider implementing additional server-side validation for production
- Monitor your Cloudinary usage to stay within free tier limits
