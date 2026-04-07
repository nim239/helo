import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nam — Motion Designer & CGI Artist',
  description: 'Portfolio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}