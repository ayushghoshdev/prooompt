import AuthNavbar from "./components/AuthNavbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AuthNavbar />
      <main className="flex items-center justify-center min-h-[calc(100vh-200px)] px-6">
        {children}
      </main>
    </div>
  );
}
