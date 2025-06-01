"use server"
import { connectDB, disconnectDB } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { User } from '@/app/models/User';
import bcrypt from 'bcryptjs';
import { adminControl } from '@/app/lib/apiControl';

export async function POST(req) {  
  const response = await adminControl(req);
  if (response) {
    return response;
  }
  const body = await req.json();  
  const { mail, password } = body;  

  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      mail: mail,
      password: hashedPassword
    });

    const result = await newUser.save();
    
    return NextResponse.json({ message: 'User added successfully', data: result });
  } 
  catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ message: 'Error adding user', error: error.message });
  }
  finally{await disconnectDB()}
}
