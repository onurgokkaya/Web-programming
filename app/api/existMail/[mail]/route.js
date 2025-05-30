"use server";
import { connectDB, disconnectDB } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { User } from "@/app/models/User";

export async function GET(req, { params }) {
  const { mail } = params;

  try {
    await connectDB();
    const existingUser = await User.findOne({ mail });

    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    } else {
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ message: "Error adding user" });
  } finally {
    await disconnectDB();
  }
}
