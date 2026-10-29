import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Negócio de Pé — proteção que entende o seu negócio",
    template: "%s · Negócio de Pé",
  },
  description:
    "Conte um pouco sobre sua empresa e descubra quais proteções fazem sentido para o seu negócio. Protótipo do Datathon BB Seguros.",
  icons: { icon: "/geniobb/favicon.ico" },
  applicationName: "Negócio de Pé",
  keywords: ["seguro empresarial", "proteção do negócio", "pequenas empresas", "Datathon BB Seguros"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Negócio de Pé",
    title: "Seu negócio é único. Sua proteção também deveria ser.",
    description:
      "Uma conversa simples para descobrir quais proteções fazem sentido para a sua empresa.",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#003087",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
