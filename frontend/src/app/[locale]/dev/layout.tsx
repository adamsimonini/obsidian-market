import { DevBanner } from '@/components/DevBanner';

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DevBanner />
      {children}
    </>
  );
}
