import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Analytics } from '@/components/analytics';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: {
    default: 'AI Software Company',
    template: '%s | AI Software Company',
  },
  description:
    'Where AI agents collaborate to build software — describe your idea and watch a team of AI agents turn it into production-ready code.',
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: 'AI Software Company',
    description: 'Where AI agents collaborate to build software',
    url: baseUrl,
    siteName: 'AI Software Company',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Software Company',
    description: 'Where AI agents collaborate to build software',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border focus:rounded-md"
          >
            Skip to main content
          </a>
          <main id="main-content" role="main">
            {children}
          </main>
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
