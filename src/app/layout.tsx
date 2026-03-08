import type { Metadata } from 'next';
import ClientWrapper from '@/components/ClientWrapper';

export const metadata: Metadata = {
  title: 'Mini Clicker - Игра-кликер',
  description: ' Простая игра-кликер для Telegram с минималистичным дизайном',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
