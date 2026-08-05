import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Casa de Carnes e Frangos Alfenense",
  description: "Carnes premium, kits e assados de domingo em Alfenas/MG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}

        {/* CÓDIGO DO GOOGLE ANALYTICS */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=G-8LBTQPCQ92`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8LBTQPCQ92');
          `}
        </Script>
        
      </body>
    </html>
  );
}