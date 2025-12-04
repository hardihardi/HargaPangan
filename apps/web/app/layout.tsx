import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ReactQueryProvider } from "./providers/react-query-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { AuthProvider } from "./providers/auth-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Pangan Insight",
  description: "Dashboard prediksi harga bahan pangan Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-slate-100`}
      >
        <ThemeProvider>
          <ReactQueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
