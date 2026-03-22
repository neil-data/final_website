import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';

export default function AppLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
