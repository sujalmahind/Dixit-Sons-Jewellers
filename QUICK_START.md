# Quick Start Guide - Contact Forms with MySQL Database

## ✅ What Has Been Implemented

1. **Database Setup SQL** (`database_setup.sql`)
   - Creates `jewellery_store` database
   - Creates `feedback_enquiry` table
   - Creates `offline_visit_booking` table
   - Creates `users` table for registration and authentication

2. **MySQL Connection** (`src/lib/db/mysql.ts`)
   - Connection pool for efficient database connections
   - Error handling and connection management

3. **API Routes**
   - `/api/contact/feedback` - Handles feedback/enquiry submissions
   - `/api/contact/visit-booking` - Handles offline visit bookings

4. **UI Components**
   - Updated `ContactFeedbackForm` - Now submits to database
   - New `OfflineVisitBooking` - Booking form for store visits
   - Updated contact page layout

5. **Authentication System**
   - User registration - Stores users in MySQL database
   - User sign-in - Authenticates against MySQL database
   - Password hashing with bcrypt
   - Role-based access (admin/user)

## 🚀 Setup Steps

### 1. Database Setup (XAMPP)
```bash
# Open phpMyAdmin: http://localhost/phpmyadmin
# Go to SQL tab
# Copy and paste contents from database_setup.sql
# Click "Go"
```

### 2. Environment Variables
Create `.env.local` in project root:
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=jewellery_store
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test
- Navigate to: `http://localhost:3000/contact`
- Submit feedback form
- Submit visit booking form
- Check database in phpMyAdmin to verify data

## 📋 Features

### Feedback/Enquiry Form
- Name, Email, Message fields
- Validates email format
- Shows success/error messages
- Saves to `feedback_enquiry` table

### Offline Visit Booking
- Name, Email, Visit Date fields
- Date picker (prevents past dates)
- Validates email format
- Saves to `offline_visit_booking` table

## 🔍 Verification

Check data in phpMyAdmin:
1. Open `http://localhost/phpmyadmin`
2. Select `jewellery_store` database
3. Browse `feedback_enquiry` table
4. Browse `offline_visit_booking` table

## 🐛 Troubleshooting

**Connection Error:**
- Ensure XAMPP MySQL is running
- Check `.env.local` configuration
- Verify database exists

**Table Not Found:**
- Run `database_setup.sql` script
- Verify tables were created

**Form Not Submitting:**
- Check browser console for errors
- Check server logs
- Verify API routes are accessible

## 📝 API Endpoints

### POST /api/contact/feedback
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Feedback message"
}
```

### POST /api/contact/visit-booking
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "visitDate": "2024-12-25"
}
```

### GET /api/contact/feedback
Retrieve all feedback submissions

### GET /api/contact/visit-booking
Retrieve all visit bookings

### POST /api/auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/auth/[...nextauth]
Sign in with email and password

### GET /api/user/details
Get current user details (requires auth)

### POST /api/user/update-password
Update user password (requires auth)

