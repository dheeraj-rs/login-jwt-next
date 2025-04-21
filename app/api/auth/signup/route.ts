import { NextRequest, NextResponse } from "next/server";
import { createToken, setAuthCookie } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password, isAdmin } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("auth-app");
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user with role
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date(),
    });

    // Create JWT token
    const token = await createToken({
      id: result.insertedId.toString(),
      email,
      role: isAdmin ? 'admin' : 'user'
    });

    // Return success response with token
    const response = NextResponse.json(
      {
        user: {
          id: result.insertedId.toString(),
          email,
          role: isAdmin ? 'admin' : 'user'
        },
        message: "User created successfully",
      },
      { status: 201 }
    );

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}