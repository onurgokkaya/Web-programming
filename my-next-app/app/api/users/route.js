"use server";
import { connectDB, disconnectDB } from "@/app/lib/db";
import { adminControl } from "@/app/lib/apiControl";
import { User } from "@/app/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  const response = await adminControl(req);
  if (response) {
    return response;
  }
  try {
    await connectDB();
    const users = await User.find(
      {},
      { mail: 1, isAdmin: 1, isActive: 1, _id: 1 }
    );

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.status(500).json({ message: "Internal Server Error" });
  } finally {
    await disconnectDB();
  }
}
