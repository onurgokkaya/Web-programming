"use server";
import { connectDB, disconnectDB } from "@/app/lib/db";
import { User } from "@/app/models/User";
import { NextResponse } from "next/server";
import { adminControl } from "@/app/lib/apiControl";

export async function PATCH(req) {
  const response = await adminControl(req);
  if (response) {
    return response;
  }
  const body = await req.json();
  const { mail, isAdmin } = body;

  try {
    await connectDB();
    const result = await User.updateOne({ mail }, { $set: { isAdmin } });

    if (result.acknowledged === false) {
      return new NextResponse("Database update failed", { status: 303 });
    }
    if (result.nModified === 0) {
      return new NextResponse("No changes made", { status: 304 });
    }

    return new NextResponse("Admin status updated successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating admin status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await disconnectDB();
  }
}
