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
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 container max-w-6xl py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
