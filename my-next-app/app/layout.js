import "@/styles/global.css";
import React from "react";
import SessionProviderWrapper from "@/app/lib/SessionProvider";

export const metadata = {
  title: "Mütercim",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="w-full h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="w-full h-full">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
