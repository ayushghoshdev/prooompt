import Sidebar from "@/components/Sidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)] px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
