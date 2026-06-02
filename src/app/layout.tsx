import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/lib/providers';

export const metadata: Metadata = {
  title: 'ZEN F&B - Trà & Cà Phê Nguyên Bản',
  description: 'Đặt trà, sữa tươi đường đen và cà phê thốt nốt ngon nhất tại ZEN F&B. Trải nghiệm mượt mà, giao hàng tiện lợi.',
  keywords: 'ZEN F&B, trà sữa thốt nốt, trà chanh mật ong, đặt trà sữa Biên Hòa',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-neutral-100 min-h-screen flex justify-center overflow-x-hidden">
        {/* Mobile Mockup Wrapper for Premium Feel */}
        <div className="w-full max-w-2xl bg-background min-h-screen flex flex-col shadow-premium border-x border-border/30 relative">
          <Providers>
            <main className="flex-grow flex flex-col">
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  );
}
