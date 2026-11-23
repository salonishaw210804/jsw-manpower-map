import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata = { title: 'India manpower potential map', icons: { icon: '/favicon.svg' } };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
