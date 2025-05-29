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
  const { mail, isActive } = body;

  try {
    await connectDB();

    const user = await User.findOne({ mail });
    if (user) {
      const deleteResult = await user.updateOne({ $set: { isActive } });

      if (deleteResult.acknowledged === false) {
        return new NextResponse("Database update failed", { status: 303 });
      }
      if (deleteResult.nModified === 0) {
        return new NextResponse("No changes made", { status: 304 });
      }
      return NextResponse.json(
        { message: "User deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await disconnectDB();
  }
}
