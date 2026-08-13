import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://casa-de-carnes-alfenense.vercel.app"),
  title: "Casa de Carnes Alfenense",
  description: "Carnes premium, kits semanais e assados de domingo em Alfenas/MG.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Casa de Carnes Alfenense",
    description: "As melhores carnes da cidade a um clique de você. Peça agora!",
    url: "https://casa-de-carnes-alfenense.vercel.app", 
    siteName: "Casa de Carnes Alfenense",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* === GOOGLE ANALYTICS === */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-8LBTQPCQ92`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8LBTQPCQ92', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        {/* ======================== */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}