"use server";
import { connectDB, disconnectDB } from "@/app/lib/db";
import { User, userOAuth } from "@/app/models/User";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req, { params }) {
  const { mail, provider } = params;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  try {
    if (mail !== token.email && !token.isAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await connectDB();
    let user;
    if (provider === "google") user = await userOAuth.findOne({ mail: mail });
    else user = await User.findOne({ mail: mail });

    // await disconnectDB();

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    if (user.text.length === 0) {
      return new NextResponse(JSON.stringify({ history: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(JSON.stringify({ history: user.text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
