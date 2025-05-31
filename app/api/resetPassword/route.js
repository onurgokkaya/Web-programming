"use server";
import { connectDB, disconnectDB } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { User } from "@/app/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  const body = await req.json();
  const { mail, password } = body;

  try {
    await connectDB();
    const existingUser = await User.findOne({ mail: mail });

    if (existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      existingUser.password = hashedPassword;
      await existingUser.save();

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "User not found" });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  } finally {
    await disconnectDB();
  }
}
