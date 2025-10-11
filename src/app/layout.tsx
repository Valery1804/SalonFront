// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SalonClick",
  description: "Tu estilo, tu tiempo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-900 text-white`}>
        {/* Header global */}
        <Header />

        {/* Contenido principal de cada página */}
        <main className="pt-24">
          {children}
        </main>

        {/* Footer global */}
        <Footer />
      </body>
    </html>
  );
}
