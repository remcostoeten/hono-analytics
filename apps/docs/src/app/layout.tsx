import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import { DocsAnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <DocsAnalyticsProvider>
            {children}
          </DocsAnalyticsProvider>
        </RootProvider>
      </body>
    </html>
  );
}
