# User Registration and Authentication Setup

## ✅ What Has Been Implemented

### 1. Database Table
- **Users Table** (`users`) - Stores user registration and authentication data
  - Fields: `id`, `name`, `email`, `password` (hashed), `role`, `created_at`, `updated_at`
  - Email is unique (prevents duplicate registrations)
  - Role can be 'admin' or 'user' (default: 'user')
  - Password is hashed using bcrypt before storing

### 2. API Routes Updated
- **POST /api/auth/register** - User registration
  - Validates input (name, email, password)
  - Checks if user already exists
  - Hashes password with bcrypt
  - Stores user in MySQL database
  
- **POST /api/auth/[...nextauth]** - User sign-in
  - Authenticates user against MySQL database
  - Verifies password using bcrypt
  - Creates session with NextAuth
  - Supports role-based access (admin/user)

- **GET /api/user/details** - Get user details
  - Retrieves current user information from MySQL
  - Requires authentication
  
- **POST /api/user/update-password** - Update password
  - Allows users to change their password
  - Verifies current password before updating
  - Requires authentication

## 🚀 Setup Instructions

### Step 1: Update Database
If you already ran the initial `database_setup.sql`, the users table should already be created. If not:

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Select the `jewellery_store` database
3. Go to SQL tab
4. Run the SQL from `database_setup.sql` (includes users table)
   - OR run `users_table_setup.sql` if you only need the users table

### Step 2: Verify Environment Variables
Ensure your `.env.local` file has MySQL configuration:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=jewellery_store
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Test Registration and Sign-In

1. **Register a New User:**
   - Navigate to: `http://localhost:3000/auth/register`
   - Fill in: Name, Email, Password (min 6 characters)
   - Click "Register"
   - You should be redirected to sign-in page

2. **Sign In:**
   - Navigate to: `http://localhost:3000/auth/signin`
   - Enter: Email and Password
   - Click "Sign in"
   - You should be redirected based on your role (admin → /admin, user → /)

3. **Verify in Database:**
   - Open phpMyAdmin
   - Go to `jewellery_store` database
   - Click on `users` table
   - Click "Browse" to see registered users
   - Password should be hashed (not visible as plain text)

## 📋 Features

### Registration
- ✅ Name, Email, Password validation
- ✅ Email format validation
- ✅ Password length validation (min 6 characters)
- ✅ Duplicate email prevention
- ✅ Password hashing with bcrypt
- ✅ Default role assignment (user)
- ✅ Error handling and user feedback

### Sign-In
- ✅ Email and password authentication
- ✅ Password verification with bcrypt
- ✅ Session management with NextAuth
- ✅ Role-based redirect (admin/user)
- ✅ Error handling for invalid credentials

### Security
- ✅ Passwords are hashed (never stored in plain text)
- ✅ Bcrypt with salt rounds (12)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Email uniqueness constraint
- ✅ Session-based authentication

## 🔍 Database Schema

### users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);
```

## 🐛 Troubleshooting

### Registration Fails
- **Check database connection:** Ensure MySQL is running in XAMPP
- **Check table exists:** Verify `users` table exists in `jewellery_store` database
- **Check email uniqueness:** Email must be unique (not already registered)
- **Check password length:** Password must be at least 6 characters

### Sign-In Fails
- **Check credentials:** Verify email and password are correct
- **Check database:** Ensure user exists in `users` table
- **Check password hash:** Passwords are hashed, cannot compare directly
- **Check session:** Verify NextAuth secret is set in `.env.local`

### Database Errors
- **Connection error:** Check MySQL service is running
- **Table not found:** Run `database_setup.sql` or `users_table_setup.sql`
- **Permission error:** Ensure MySQL user has proper permissions

## 📝 API Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Sign In (NextAuth)
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get User Details
```bash
GET /api/user/details
Authorization: Bearer <session_token>
```

### Update Password
```bash
POST /api/user/update-password
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## ✅ Migration from MongoDB

All user-related functionality has been migrated from MongoDB to MySQL:
- ✅ Registration now uses MySQL
- ✅ Sign-in now uses MySQL
- ✅ User details now uses MySQL
- ✅ Password update now uses MySQL
- ✅ No MongoDB dependencies for authentication

The existing MongoDB User model is no longer used for authentication. All authentication is now handled through MySQL database.

