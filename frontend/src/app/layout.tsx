import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'AI Software Company',
  description: 'Multi-agent AI orchestration platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
