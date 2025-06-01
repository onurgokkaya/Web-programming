import { NextResponse } from "next/server";

export async function adminControl(req) {
  const apiKey = req.headers.get('x-api-key');
  console.log("Admin control API key:", apiKey);
  if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function userControl(req) {
  const apiKey = req.headers.get('x-api-key');

  if (!apiKey || apiKey !== process.env.NEXT_PUBLIC_USER_KEY) {
    return new NextResponse("Forbidden", { status: 403 });
  }
}