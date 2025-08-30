import type { Metadata } from 'next';
import '../globals.css';
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Netababu — India Political Data',
  description: 'Discover politicians, parties, comparisons, and verified sources.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      // inside <body> wrapper add a top border and light nav background
<body className="min-h-screen bg-cream-200 text-ink-700">
  <div className="h-2 bg-saffron-500" />
  <header className="sticky top-0 z-40 bg-cream-200/90 backdrop-blur border-b border-black/10">
    <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
      <div className="text-xl font-semibold">Netababu</div>
      <div className="flex-1" />
      {/* your existing nav links */}
    </nav>
  </header>
  <main className="mx-auto max-w-6xl px-4 py-10">
    {children}
  </main>
  <footer className="mx-auto max-w-6xl px-4 py-10 text-ink-600/80">
    Powered by data, spiced with masala.
  </footer>
</body>

    </html>
  );
}
