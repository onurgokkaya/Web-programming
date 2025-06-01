"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MutercimLogo from "@/Components/MutercimLogo";
import SixInputsForm from "@/Components/SixInputsForm";
import TranslateImage from "@/Components/TranslateImage";
import InputField from "@/Components/InputField";

export default function Register() {
  const [eMail, setEMail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();

  const handlePasswordChange = (value) => {
    setConfirmPassword(value);
    if (value.length >= 8 && /[A-Z]/.test(value)) {
      setPasswordValid(true);
    } else {
      setPasswordValid(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/existMail/${eMail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && !data.user) {
        setError("");
        const verifyResponse = await fetch("/api/verifyMail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mail: eMail,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok) {
          setCode(verifyData.code);
          setShowCodeInput(true);
        } else {
          setError("Failed to send verification code");
        }
      } else {
        setError("Email already exists");
      }
    } catch (error) {
      setError("An error occurred: " + error.message);
    }
  };

  const handleCodeSubmit = async (isVerified) => {
    if (isVerified) {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "x-api-key": process.env.ADMIN_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mail: eMail,
            password: password,
          }),
        });

        if (response.ok) {
          console.log("User registered successfully");
          router.push("/auth/register");
        } else {
          setError("Failed to register user");
        }
      } catch (error) {
        setError("An error occurred: " + error.message);
      }
    } else {
      setError("Invalid verification code");
    }
  };

  return (
    <div className="relative container flex flex-row p-4 h-screen w-full">
      <MutercimLogo absolute={true} />
      <TranslateImage />
      <div className="sm:w-full md:w-1/2 h-full px-4 pt-48 sm:justify-center md:justify-start">
        <h1 className="mb-8 text-2xl font-bold text-center w-4/5 text-blue-300">
          Sign Up
        </h1>
        {!showCodeInput && (
          <form
            onSubmit={handleEmailSubmit}
            className="h-72 justify-center w-4/5 flex flex-col md:pl-8 space-y-8"
          >
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
            <InputField
              name="Confirm Password"
              type="password"
              value={confirmPassword}
              handleChange={handlePasswordChange}
              placeholder="Confirm your password"
            />
            {!passwordValid && password.length > 0 && (
              <p className="w-3/5 h-4 py-2 text-xs">
                The password must be at least 8 characters and contain at least
                one uppercase letter.
              </p>
            )}
            {error && <div className="text-gray-900">{error}</div>}
            <div className="w-full h-full flex justify-end">
              <button
                type="submit"
                className={`sm:h-8 md:h-10 w-2/5 rounded-md p-2 flex items-center justify-center bg-blue-300 text-gray-600 hover:bg-blue-200 ${
                  password !== confirmPassword || !passwordValid
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={password !== confirmPassword || !passwordValid}
              >
                Register
              </button>
            </div>
          </form>
        )}
        {showCodeInput && (
          <div>
            <p>Verification code has been sent to your email.</p>
            <SixInputsForm code={code} onVerification={handleCodeSubmit} />
            {error && <p className="text-red-500">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
