import EraNavbar from '@/components/era/EraNavbar';
import Footer from '@/components/layout/Footer';

export default function EraLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EraNavbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
