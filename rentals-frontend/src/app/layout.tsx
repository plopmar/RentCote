import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ModalProvider } from "@/components/ModalProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentCote · SaaS de Gestión de Alquileres",
  description:
    "Plataforma SaaS integral para gestionar alquileres, inquilinos, contratos y finanzas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ModalProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            style: { background: "#1e1e2e", color: "#eee", border: "1px solid #3b3b52" }
          }} />
        </ModalProvider>
      </body>
    </html>
  );
}
