// app/(site)/layout.tsx
import type { Metadata } from 'next';
import '../globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = {
  title: "Netababu",
  description: "Netas, parties, drama — all in one place.",
  manifest: "/site.webmanifest",
  themeColor: "#fff7ed",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png"
  }
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-200 text-ink-700">
        {/* saffron top bar */}
        <div className="h-2 bg-saffron-500" />

        {/* light nav */}
        <header className="sticky top-0 z-40 bg-cream-200/90 backdrop-blur border-b border-black/10">
          <nav className="mx-auto max-w-6xl px-4 py-3">
            <Nav />
          </nav>
        </header>

        {/* page content */}
        <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>

        {/* footer */}
        <footer className="mx-auto max-w-6xl px-4 py-10 text-ink-600/80">
          <Footer />
          <div className="mt-4">Powered by data, spiced with masala.</div>
        </footer>
      </body>
    </html>
  );
}
