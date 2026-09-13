import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import HeaderNavigation from '@/components/HeaderNavigation';

export const metadata: Metadata = {
  title: 'Campus Pulse — College Event Management System',
  description:
    'Next-generation collegiate event experience platform. Public zero-login registration, admin verification, QR turnstile check-ins, and verified certificates.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>
        <ToastProvider>
          <HeaderNavigation />
          <main className="view-container">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
