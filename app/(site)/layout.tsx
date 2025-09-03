// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import '../globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const viewport: Viewport = { themeColor: '#fff7ed', colorScheme: 'light' };

export const metadata: Metadata = {
  title: 'Netababu',
  description: 'Netas, parties, drama — all in one place.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [{ url: '/favicon.png', sizes: '32x32', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Netababu' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-200 text-ink-700 flex flex-col">
        {/* saffron top bar */}
        <div className="h-2 bg-saffron-500" />

        {/* Nav already renders <header> */}
        <Nav />

        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
