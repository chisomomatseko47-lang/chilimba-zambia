import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Chilimba Zambia',
  description: 'Transparent digital savings groups for Zambia.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
