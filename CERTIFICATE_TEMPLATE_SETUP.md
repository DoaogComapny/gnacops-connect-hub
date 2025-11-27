# Certificate Template Setup Guide

## Overview
The certificate generation system now uses your template image to create personalized PDF certificates with the user's name and GNACOPS ID.

## Template Upload Options

### Option 1: Upload via Supabase Storage (Recommended)
1. Go to your Supabase Dashboard → Storage
2. Navigate to the `site-assets` bucket
3. Upload your certificate template image as `certificate-template.jpg`
4. Make sure the file is publicly accessible

### Option 2: Set Environment Variable
Set the `CERTIFICATE_TEMPLATE_URL` environment variable in your Supabase Edge Function settings:
- Go to Supabase Dashboard → Edge Functions → Settings
- Add environment variable: `CERTIFICATE_TEMPLATE_URL` with the full URL to your template image

## Template Requirements
- **Format**: JPG or PNG
- **Recommended Size**: 8.5" x 11" (US Letter) or A4 size
- **Resolution**: 300 DPI for best quality
- **Content**: Should include all static elements (logo, borders, signatures, etc.)

## Text Positioning
The current implementation places text at these default positions (you can adjust via environment variables):

- **Name**: 55% from bottom, centered horizontally, size 28pt
- **GNACOPS ID**: 48% from bottom, centered horizontally, size 18pt
- **Certificate Number**: 80 points from bottom, 50 points from left, size 12pt
- **Issue Date**: 55 points from bottom, 50 points from left, size 12pt

## Customizing Text Positions via Environment Variables
You can adjust text positions without modifying code by setting these environment variables in your Supabase Edge Function settings:

### Name Position
- `CERT_NAME_Y_PERCENT`: Vertical position as percentage from bottom (default: 0.55 = 55%)
- `CERT_NAME_SIZE`: Font size in points (default: 28)

### GNACOPS ID Position
- `CERT_ID_Y_PERCENT`: Vertical position as percentage from bottom (default: 0.48 = 48%)
- `CERT_ID_SIZE`: Font size in points (default: 18)

### Certificate Number Position
- `CERT_NUM_Y`: Vertical position in points from bottom (default: 80)
- `CERT_NUM_X`: Horizontal position in points from left (default: 50)
- `CERT_NUM_SIZE`: Font size in points (default: 12)

### Issue Date Position
- `CERT_DATE_X`: Horizontal position in points from left (default: same as cert number)
- `CERT_DATE_SIZE`: Font size in points (default: 12)

### Example Configuration
To move the name higher and make it larger:
```
CERT_NAME_Y_PERCENT=0.60
CERT_NAME_SIZE=32
```

**Note**: All text is automatically centered horizontally. The Y positions use percentages (0.0 to 1.0) for name and ID to scale with template size, while certificate number and date use fixed point values.

## Testing
After uploading your template:
1. Complete a payment for a membership
2. The certificate should be automatically generated
3. Check the `certificates` storage bucket for the generated PDF
4. Verify the text positioning matches your template design

## Notes
- If no template is found, the system will generate a simple text-only certificate
- The template image should have transparent areas or white space where text will be placed
- Text is currently black; you can modify colors in the code if needed

