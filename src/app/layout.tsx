import { TRPCReactProvider } from "~/trpc/react";
import { headers } from "next/headers";
import "~/styles/globals.css";

export const metadata = {
  title: 'Plumber SaaS - Modern AI Chat Widget',
  description: 'AI-powered chatbot widget for plumbing businesses with voice invoice generation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider headers={headers()}>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  )
}
