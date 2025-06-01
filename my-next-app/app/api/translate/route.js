"use server";
import OpenAI from "openai";
import { connectDB, disconnectDB } from "@/app/lib/db";
import { User, userOAuth } from "@/app/models/User";
import { NextResponse } from "next/server";
import { userControl } from "@/app/lib/apiControl";

export async function POST(req) {
  const response = await userControl(req);
  if (response) {
    return response;
  }
  if (!process.env.GPT4o_API_KEY) {
    return new NextResponse(
      JSON.stringify({ error: "Api anahtarı boş bırakılamaz !" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  try {
    const {
      text,
      sourceLanguage,
      targetLanguage,
      sourceLanguageName,
      targetLanguageName,
      mail,
      provider,
    } = await req.json();
    const openai = new OpenAI({ apiKey: process.env.GPT4o_API_KEY });

    if (!text) {
      const translatedText = "Please enter text";
      return new NextResponse(JSON.stringify({ translatedText }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    let resp;
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "assistant",
            content: `Translate this text from ${sourceLanguageName} to ${targetLanguageName}: ${text}`,
          },
        ],
        model: "gpt-4o",
      });
      resp = completion.choices[0];
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: "Geçersiz api anahtarı !" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!resp) {
      return new NextResponse(
        JSON.stringify({ error: "Internal Server Error" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const translatedText = resp.message.content;
    await connectDB();

    let user;
    if (provider === "google") user = await userOAuth.findOne({ mail: mail });
    else user = await User.findOne({ mail: mail });

    if (user) {
      user.text.push({
        originalText: text,
        translatedText,
        sourceLanguage,
        targetLanguage,
      });
      await user.save();
      // await disconnectDB();
    }

    return new NextResponse(JSON.stringify({ translatedText }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
