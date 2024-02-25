import "./globals.css";
import "reactflow/dist/style.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { Metadata, Viewport } from "next";

const APP_NAME = "lolmath esports";
const APP_DEFAULT_TITLE = "lolmath esports";
const APP_TITLE_TEMPLATE = "%s - lolmath esports";
const APP_DESCRIPTION = "League of Legends esports History By lolmath";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },

  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <Providers>
        <body>{children}</body>
      </Providers>
      <Analytics />
    </html>
  );
}
