"use server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

export async function POST(req) {
  const body = await req.json();
  const { mail } = body;

  if (!mail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const code = generateVerificationCode();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Mutercim" <${process.env.GMAIL_USER}>`,
    to: mail,
    subject: "Doğrulama Kodu",
    text: `Doğrulama kodunuz: ${code}`,
    html: `<p><strong>Doğrulama kodunuz:</strong> ${code}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Mail gönderildi:", info.messageId);

    return NextResponse.json({ code });
  } catch (error) {
    console.error("Mail gönderme hatası:", error);
    return NextResponse.json({ error: "Mail gönderilemedi" }, { status: 500 });
  }
}
