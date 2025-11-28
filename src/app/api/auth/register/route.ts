import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db/mysql";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 },
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const checkUserQuery = "SELECT id FROM users WHERE email = ?";
    const existingUsers = await executeQuery(checkUserQuery, [email]);

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user with default role 'user'
    const insertUserQuery = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, 'user')
    `;

    const result = await executeQuery(insertUserQuery, [
      name,
      email,
      hashedPassword,
    ]);

    // Return success without sending password
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: (result as any).insertId,
          name: name,
          email: email,
          role: "user",
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle duplicate email error
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "Failed to register user", details: error.message },
      { status: 500 },
    );
  }
}
