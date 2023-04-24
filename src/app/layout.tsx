import "./globals.css";
import "reactflow/dist/style.css";
import { Providers } from "./providers";

export const metadata = {
  title: "LoL Math Esports",
  description: "League of Legends Esports",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Providers>
        <body>{children}</body>
      </Providers>
    </html>
  );
}
