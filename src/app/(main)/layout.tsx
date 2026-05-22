import type { Metadata } from "next";
import Header from "@/components/header";
import Navbar from "@/components/navbar";
import { AuthGuard } from "@/lib/auth/auth-guard";

export const metadata: Metadata = {
  title: {
    template: "%s | HotlineS3",
    default: "HotlineS3",
  },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Header />
      <main className="app-smart-gradient safe-main-offset safe-bottom-nav-offset min-h-screen xl:pb-8">
        {children}
      </main>
      <Navbar />
    </AuthGuard>
  );
}
