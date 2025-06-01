"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import TranslateImage from "@/Components/TranslateImage";
import googleIcon from "@/public/google.png";
import InputField from "@/Components/InputField";

export default function Login() {
  const [eMail, setEMail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("◌");

    const result = await signIn("credentials", {
      mail: eMail,
      password: password,
      redirect: false,
    });
    if (result.ok) {
      router.push("/");
      router.refresh();
    } else if (result.error) {
      setError("Hatalı kullanıcı adı veya şifre");
    }
  };
  const handleGoogleSignIn = async () => {
    setError("◌");
    await signIn("google", { callbackUrl: "/" });
  };
  return (
    <div className="container flex flex-row p-4 h-screen w-full items-center sm:justify-center md:justify-between">
      <TranslateImage />
      <div className="sm:w-full md:w-1/2 h-full flex items-center sm:justify-center md:justify-start">
        <form
          onSubmit={handleSubmit}
          className="h-72 w-4/5 sm:text-xs md:text-base sm:pl-4 md:pl-8 lg:pl-12"
        >
          <h1 className="text-2xl font-bold mb-4 text-blue-300 text-center">
            Login
          </h1>
          <div>
            <div className="space-y-8">
              <InputField
                name="E-Mail"
                type="text"
                value={eMail}
                handleChange={setEMail}
                placeholder="Enter your email"
              />
              <InputField
                name="Password"
                type="password"
                value={password}
                handleChange={setPassword}
                placeholder="Enter your password"
              />
            </div>
            <div className="flex justify-end">
              <Link
                href="forgetPass"
                className="p-1 sm:text-2xs md:text-xs text-gray-600 hover:underline"
              >
                Forgot Password
              </Link>
            </div>
          </div>
          {error && (
            <div
              className={`${
                error.length === 1 ? "text-blue-500" : "text-red-500"
              }`}
            >
              {error}
            </div>
          )}
          <div className="flex space-x-4 mt-12 justify-end w-full h-full">
            <button
              type="submit"
              className="mb-4 p-2 text-gray-600 bg-blue-300 hover:bg-blue-200 sm:h-8 md:h-10 w-2/5 rounded-md"
            >
              Sign in
            </button>
            {/* <button
              onClick={handleGoogleSignIn}
              className="flex flex-row items-center justify-center p-2 bg-blue-300 text-gray-600 hover:bg-blue-200 h-10 w-52 rounded-lg"
            >
              <Image
                className="p-1 rounded-md"
                src={googleIcon}
                width={24}
                height={24}
                alt="Google Icon"
              />
              <span className="pl-2 text-xs">Sign in with Google</span>
            </button> */}
          </div>

          {/* <Link href="register" className="text-gray-600 hover:underline">
            Sign Up
          </Link> */}
        </form>
      </div>
    </div>
  );
}
