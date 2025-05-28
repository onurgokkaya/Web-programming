"use client";
import { useState } from "react";
import SixInputsForm from "@/Components/SixInputsForm";
import { useRouter } from "next/navigation";
import TranslateImage from "@/Components/TranslateImage";
import MutercimLogo from "@/Components/MutercimLogo";
import InputField from "@/Components/InputField";

export default function ForgetPass() {
  const [eMail, setEMail] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState(0);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(null);
  const router = useRouter();

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

      if (data.user) {
        const verifyResponse = await fetch("/api/verifyMail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mail: eMail }),
        });

        const verifyData = await verifyResponse.json();
        setCode(verifyData.code);
        if (verifyResponse.ok) {
          setShowCodeInput(true);
        } else {
          setError(verifyResponse.error || "Kod gönderilemedi");
        }
      } else {
        setError("Mail adresi bulunamadı");
      }
    } catch (error) {
      setError("Bir hata oluştu: " + error.message);
    }
  };

  const handleVerification = (isVerified) => {
    if (isVerified) {
      setShowPasswordInput(true);
    } else {
      setError("Kod yanlış");
    }
  };
  const handlePasswordChange = (value) => {
    setNewPassword(value);
    if (value.length >= 8 && /[A-Z]/.test(value)) {
      setPasswordValid(true);
    } else {
      setPasswordValid(false);
    }
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    try {
      const response = await fetch("/api/resetPassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mail: eMail, password: newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/auth/login");
      } else {
        setError(data.error || "Şifre sıfırlama başarısız oldu");
      }
    } catch (error) {
      setError("Bir hata oluştu: " + error.message);
    }
  };

  return (
    <div className="container relative flex md:flex-row p-4 h-screen w-full">
      <MutercimLogo absolute={true} />
      <TranslateImage />
      <div className="flex items-center h-full sm:w-full sm:text-xs md:w-1/3 md:text-base sm:justify-center md:justify-start">
        {!showCodeInput && !showPasswordInput && (
          <form
            onSubmit={handleEmailSubmit}
            className="h-60 w-full flex flex-col items-center sm:pl-4 md:pl-8 lg:pl-12 space-y-6"
          >
            <InputField
              name="E-Mail"
              value={eMail}
              handleChange={setEMail}
              type="text"
            />
            <br />
            <div className="flex justify-end w-full">
              {error && <p className="text-red-500 w-3/5">{error}</p>}
              <button
                className="text-gray-600 bg-blue-300 hover:bg-blue-200 sm:h-8 md:h-10 w-2/5 rounded-lg"
                type="submit"
              >
                Gönder
              </button>
            </div>
          </form>
        )}
        {showCodeInput && !showPasswordInput && (
          <SixInputsForm code={code} onVerification={handleVerification} />
        )}
        {showPasswordInput && (
          <form
            onSubmit={handlePasswordSubmit}
            className="flex flex-col justify-center items-center w-full sm:pl-4 md:pl-8 lg:pl-12 sm:space-y-3 md:space-y-4 lg:space-y-5"
          >
            <InputField
              name="Yeni Şifre"
              type="password"
              value={newPassword}
              handleChange={handlePasswordChange}
              placeholder="Yeni Şifre"
            />
            <br />
            <InputField
              name="Yeni Şifreyi Onayla"
              type="password"
              value={confirmPassword}
              handleChange={setConfirmPassword}
              placeholder="Yeni Şifreyi Onayla"
            />
            <br />
            {!passwordValid && newPassword.length > 0 && (
              <div className="flex items-start">
                <p className="w-2/3 h-4 p-2 sm:text-xs md:text-s text-gray-900">
                  The password must be at least 8 characters and contain at
                  least one uppercase letter.
                </p>
              </div>
            )}

            <br />
            <div className="h-full w-full flex justify-end">
              <button
                className={`h-1/3 w-2/5 p-2 text-gray-600 bg-blue-300 hover:bg-blue-200 rounded-md
                ${
                  newPassword !== confirmPassword || !passwordValid
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                type="submit"
                disabled={newPassword !== confirmPassword || !passwordValid}
              >
                Şifreyi Sıfırla
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
