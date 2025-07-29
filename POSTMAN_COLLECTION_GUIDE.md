# Geo-Fencing Admin Panel API - Postman Collection Guide

## 📋 Overview

This document provides comprehensive information about the Postman collection for the Geo-Fencing Location Detection App Admin Panel API. The collection includes all available endpoints for authentication, user management, coordinate management, slider management, feedback management, content management, and file uploads.

## 🚀 Getting Started

### 1. Import the Collection

1. Open Postman
2. Click on "Import" button
3. Select the `Geo-Fencing_Admin_Panel_API.postman_collection.json` file
4. The collection will be imported with all folders and requests

### 2. Set Environment Variables

The collection uses the following variables:

- **baseUrl**: Set to your server URL (default: `http://localhost:3000/api`)
- **authToken**: JWT token (automatically set after successful login)

#### Setting Base URL:
1. Go to the collection settings
2. Navigate to "Variables" tab
3. Update the `baseUrl` value to match your server:
   - Development: `http://localhost:3000/api`
   - Production: `https://your-domain.com/api`

## 🔐 Authentication Workflow

### Step 1: Register or Login
1. **Register**: Use "Register User" request to create a new account
2. **Login**: Use "Login User" request with valid credentials
3. The login request automatically saves the JWT token to the `authToken` variable

### Step 2: Verify Authentication
- Use "Get User Profile" to verify your token is working correctly
- All subsequent requests will automatically use the saved token

## 📁 Collection Structure

### 🔐 Authentication
- **Register User**: Create new user account
- **Login User**: Authenticate and get JWT token
- **Get User Profile**: Get current user information

### 📊 Dashboard
- **Get Dashboard Stats**: Retrieve admin dashboard statistics

### 👥 User Management (Admin Only)
- **Get All Users**: List all registered users
- **Create User**: Add new user
- **Update User**: Modify user information
- **Delete User**: Remove user account

### 📍 Coordinate Management (Admin Only)
- **Get All Coordinates**: List all geo-fencing polygons
- **Create Coordinate**: Add new polygon area
- **Update Coordinate**: Modify polygon information
- **Delete Coordinate**: Remove polygon
- **Check Location in Polygon**: Verify if coordinates are within any polygon

### 🖼️ Slider Management
- **Get Public Sliders**: Retrieve active sliders (public endpoint)
- **Get All Sliders (Admin)**: List all sliders including inactive ones
- **Create Slider**: Add new image slider
- **Update Slider**: Modify slider information
- **Delete Slider**: Remove slider

### 💬 Feedback Management
- **Get All Feedbacks**: List all user feedback (admin only)
- **Create Feedback**: Submit new feedback
- **Delete Feedback**: Remove feedback (admin only)

### ⚙️ Settings Management (Admin Only)
- **Get Settings**: Retrieve app configuration
- **Update Settings**: Modify app settings
- **Get Statistics Link**: Get analytics URL (public endpoint)

### 📝 Content Management
- **Get Public Contents**: Retrieve active content (public endpoint)
- **Get All Contents (Admin)**: List all content including inactive
- **Create Content**: Add new text content (max 30 words)
- **Update Content**: Modify content information
- **Delete Content**: Remove content

### 📁 File Upload (Admin Only)
- **Upload Image**: Upload image files for sliders (max 5MB)

### 🏥 Health Check
- **Ping Server**: Verify server status

## 🛠️ Usage Examples

### Example 1: Complete User Workflow
1. Register a new user
2. Login to get JWT token
3. Create some content or sliders
4. Update settings
5. Check dashboard stats

### Example 2: Content Management
1. Login as admin
2. Create new content with "Create Content"
3. Update content status with "Update Content"
4. View all content with "Get All Contents (Admin)"

### Example 3: File Upload for Sliders
1. Login as admin
2. Upload image using "Upload Image" (select file in form-data)
3. Copy the returned `imageUrl`
4. Create slider using "Create Slider" with the image URL

## 📝 Request Examples

### Create Coordinate Polygon
```json
{
  "name": "Office Building",
  "coordinates": [
    [77.5946, 12.9716],
    [77.5950, 12.9716],
    [77.5950, 12.9720],
    [77.5946, 12.9720],
    [77.5946, 12.9716]
  ],
  "description": "Main office perimeter"
}
```

### Create Content
```json
{
  "title": "Welcome Message",
  "content": "Welcome to our geo-fencing app! Track locations easily.",
  "order": 1
}
```

### Create Slider
```json
{
  "title": "App Promotion",
  "imageUrl": "/uploads/slider-123456789.jpg",
  "order": 1
}
```

## 🔒 Security Notes

1. **JWT Tokens**: Tokens are automatically included in requests after login
2. **Admin Routes**: Most management endpoints require admin privileges
3. **File Uploads**: Limited to 5MB image files only
4. **Content Validation**: Text content is limited to 30 words

## 🐛 Troubleshooting

### Common Issues:

1. **401 Unauthorized**: 
   - Ensure you're logged in and token is valid
   - Check if your account has admin privileges for admin-only endpoints

2. **File Upload Issues**:
   - Verify file size is under 5MB
   - Check file type is supported (JPG, PNG, GIF, WebP)
   - Ensure you're using form-data, not raw JSON

3. **Validation Errors**:
   - Content must be 30 words or less
   - Coordinate arrays must form valid polygons
   - Required fields must be provided

4. **Connection Issues**:
   - Verify server is running on correct port
   - Check baseUrl variable is set correctly
   - Ensure server endpoints match collection URLs

## 📞 Support

If you encounter issues with the API or Postman collection:

1. Check server logs for detailed error messages
2. Verify all required fields are included in requests
3. Ensure proper authentication for protected endpoints
4. Review the API response for specific error details

## 🔄 Collection Updates

This collection is version 1.0.0. Updates may include:
- New endpoints as features are added
- Enhanced error handling examples
- Additional pre-request scripts
- More comprehensive test scripts

---

**Happy Testing! 🚀**
