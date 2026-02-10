import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obsidian Market',
  description: 'Privacy-focused prediction market built on Aleo',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Obsidian Market',
  },
  icons: {
    icon: '/obsidian-logo.png',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
