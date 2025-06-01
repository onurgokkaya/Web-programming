"use server"
import { connectDB, disconnectDB } from '@/app/lib/db';
import { User, userOAuth } from '@/app/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();  
  const { mail, provider } = body;  

  try {
    await connectDB();
    let user;
    if(provider === 'google')
      user = await userOAuth.findOne({ mail: mail })
    else
      user = await User.findOne({ mail: mail });
    await disconnectDB();

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }
    if(user.translatedText.length === 0 )
      return new NextResponse(JSON.stringify({ history: [] }), {
        headers: { 'Content-Type': 'application/json' },
      });
    
      return new NextResponse(JSON.stringify({ history: user.translatedText }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } 
  catch (error) {
    console.error('Error fetching history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
