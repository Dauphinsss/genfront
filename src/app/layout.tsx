"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { DesktopOnlyScreen } from "@/components/desktop-only-screen";
import { useEffect, useState } from "react";
import { Loading } from "@/components/ui/loading";
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const uaData = (
        navigator as Navigator & {
          userAgentData?: { mobile?: boolean };
        }
      ).userAgentData;

      const matchesMobileUA =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      const hasTouch = navigator.maxTouchPoints > 1;
      const verySmallViewport = width < 640;

      const isMobileDevice = Boolean(
        uaData?.mobile || matchesMobileUA || (hasTouch && verySmallViewport)
      );

      setIsDesktop(!isMobileDevice);
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return (
    <html lang="es">
      <head>
        <title>Pyson - Plataforma de Aprendizaje</title>
        <meta
          name="description"
          content="Plataforma de aprendizaje de programación"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isDesktop === null ? (
          <Loading fullScreen />
        ) : isDesktop === false ? (
          <DesktopOnlyScreen />
        ) : (
          <ToastProvider>
              {children}
              <Toaster />
          </ToastProvider>
        )}
      </body>
    </html>
  );
}
