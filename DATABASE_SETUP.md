# Database Setup Guide for XAMPP MySQL

This guide will help you set up the MySQL database for the Jewellery Store contact and booking system.

## Prerequisites
- XAMPP installed and running
- MySQL service started in XAMPP Control Panel

## Step 1: Create Database and Tables

1. Open phpMyAdmin by navigating to `http://localhost/phpmyadmin` in your browser
2. Click on the "SQL" tab
3. Copy and paste the entire content from `database_setup.sql` file
4. Click "Go" to execute the SQL script
5. Verify that three tables were created:
   - `feedback_enquiry`
   - `offline_visit_booking`
   - `users`

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root directory of your project (if it doesn't exist)
2. Add the following environment variables:

```env
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=jewellery_store
```

**Note:** 
- If your XAMPP MySQL has a password, update `MYSQL_PASSWORD` accordingly
- The default XAMPP MySQL user is `root` with no password (empty string)
- The database name should match: `jewellery_store`

## Step 3: Install Dependencies

Run the following command to install the MySQL2 package:

```bash
npm install
```

## Step 4: Test the Setup

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Navigate to the contact page: `http://localhost:3000/contact`

3. Try submitting:
   - A feedback/enquiry form
   - An offline visit booking
   - Register a new user account
   - Sign in with the registered account

4. Check your database in phpMyAdmin to verify the data was saved:
   - Go to `jewellery_store` database
   - Click on `feedback_enquiry`, `offline_visit_booking`, or `users` table
   - Click "Browse" to see the submitted data

## Troubleshooting

### Connection Error
If you get a connection error:
- Make sure XAMPP MySQL service is running
- Verify the database name is `jewellery_store`
- Check that the user and password are correct in `.env.local`
- Verify the port is `3306` (default XAMPP MySQL port)

### Table Not Found Error
If you get a "table not found" error:
- Make sure you ran the SQL script from `database_setup.sql`
- Verify the tables exist in phpMyAdmin
- Check that the database name in `.env.local` matches the database you created

### Permission Denied Error
If you get a permission error:
- Make sure the MySQL user has proper permissions
- For XAMPP, the default `root` user should have all permissions
- Try creating a new user with proper permissions if needed

## Database Schema

### feedback_enquiry Table
- `id` - Primary key (auto-increment)
- `name` - Visitor's name
- `email` - Visitor's email
- `message` - Feedback/enquiry message
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

### offline_visit_booking Table
- `id` - Primary key (auto-increment)
- `name` - Visitor's name
- `email` - Visitor's email
- `visit_date` - Date when visitor wants to visit
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

### users Table
- `id` - Primary key (auto-increment)
- `name` - User's full name
- `email` - User's email (unique)
- `password` - Hashed password (bcrypt)
- `role` - User role ('admin' or 'user', default: 'user')
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

## API Endpoints

### POST /api/contact/feedback
Submit a feedback/enquiry form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your feedback message here"
}
```

### POST /api/contact/visit-booking
Submit an offline visit booking.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "visitDate": "2024-12-25"
}
```

### GET /api/contact/feedback
Retrieve all feedback submissions (for admin use).

### GET /api/contact/visit-booking
Retrieve all visit bookings (for admin use).

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/auth/[...nextauth]
Sign in with credentials (handled by NextAuth).

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /api/user/details
Get current user details (requires authentication).

### POST /api/user/update-password
Update user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

