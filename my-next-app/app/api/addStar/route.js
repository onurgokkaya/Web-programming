"use server";
import { connectDB, disconnectDB } from "@/app/lib/db";
import { User, userOAuth } from "@/app/models/User";
import { NextResponse } from "next/server";
import { userControl } from "@/app/lib/apiControl";

export async function PATCH(req) {
  const response = await userControl(req);
  if (response) {
    return response;
  }
  const body = await req.json();
  const { mail, provider, objectID, isAdd } = body;

  try {
    await connectDB();
    let user;
    if (provider === "google") {
      user = await userOAuth.findOne({ mail: mail });
    } else {
      user = await User.findOne({ mail: mail });
    }

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const updateQuery = {
      $set: {
        [`text.$[elem].isStar`]: isAdd,
      },
    };

    const updateResult =
      provider === "google"
        ? await userOAuth.updateOne({ mail }, updateQuery, {
            arrayFilters: [{ "elem._id": objectID }],
          })
        : await User.updateOne({ mail }, updateQuery, {
            arrayFilters: [{ "elem._id": objectID }],
          });

    if (updateResult.modifiedCount === 0) {
      return new NextResponse("No changes made", { status: 400 });
    }
    return new NextResponse("Star status updated successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating star status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await disconnectDB();
  }
}
