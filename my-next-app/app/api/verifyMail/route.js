"use server"
import { NextResponse } from 'next/server';
import mailjet from 'node-mailjet';

const mailjetClient = mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

export async function POST(req) {
  const body = await req.json();
  const { mail } = body;

  if (!mail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const code = generateVerificationCode();

  const emailData = {
    Messages: [
      {
        From: {
          Email: "alganemre.8@gmail.com",
          Name: "Mutercim"
        },
        To: [
          {
            Email: mail,
            Name: "Recipient"
          }
        ],
        Subject: "Verification Code",
        HTMLPart: `<p>Your verification code is: <strong>${code}</strong></p>`
      }
    ]
  };

  try {
    const request = mailjetClient.post("send", { version: 'v3.1' }).request(emailData);
    const result = await request;

    console.log('Mailjet API response:', result.body); // Logging the result

    if (result.body.Messages[0].Status === 'success') {
      return NextResponse.json({code: code});
    } 
    else {
      console.error('Failed to send email:', result.body);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } 
  catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

