// src/app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      // bodyタグじゃなくdiv！
      className="antialiased bg-gray-50"
      style={{
        paddingTop: 0,
        minHeight: "100vh",
      }}
    >
      {/* MegaMenuなし */}
      <main>
        {children}
      </main>
    </div>
  );
}
