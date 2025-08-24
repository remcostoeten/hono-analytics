import '@/app/global.css';
import { DocsAnalyticsProvider } from '@/components/analytics/analytics-provider';
import { RootProvider } from 'fumadocs-ui/provider';
import { Outfit } from 'next/font/google';

const outfit =  Outfit({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={outfit.className} suppressHydrationWarning>
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
