import type { Metadata } from "next";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "Dashboard · Dialogue AI",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-wrapper min-h-screen w-full">
      {children}
    </div>
  );
}
