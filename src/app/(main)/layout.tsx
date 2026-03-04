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
      <main className="pt-16 px-3 sm:px-4 lg:px-6 pb-24 md:pb-8 min-h-screen">
        {children}
      </main>
      <Navbar />
    </AuthGuard>
  );
}
