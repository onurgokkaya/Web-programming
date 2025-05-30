"use server"
import { connectDB, disconnectDB } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { User } from '@/app/models/User';

export async function POST(req) {
  
  const body = await req.json();  
  const { mail } = body;  

  try {
    await connectDB()
    const existingUser = await User.findOne({ mail: mail });
 
    if (existingUser) {
      await disconnectDB()
      return NextResponse.json({ user: existingUser });
    } 
    else {
      await disconnectDB()
      return NextResponse.json({ user: null });
    } 
  }
  catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ message: 'Error adding user' });
  }
}   

