import type { Metadata, Viewport } from 'next';
import '../globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Analytics } from '@vercel/analytics/next';

export const viewport: Viewport = {
  themeColor: '#fff7ed',
  colorScheme: 'light',
};

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
        <header className="sticky top-0 z-[10000]">
          <div aria-hidden className="h-[6px] bg-saffron-500 pointer-events-none" />
          <div className="bg-cream-200/90 backdrop-blur border-b border-black/10">
            <Nav />
          </div>
        </header>

        <main className="flex-1 pt-10 md:pt-12">{children}</main>

        <Footer />
        <Analytics /> {/* ← add this */}
      </body>
    </html>
  );
}
