import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { DashboardNavbar } from "@/components/layouts/dashboard-navbar";
import { SidebarInset } from "@/components/ui/sidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  return (
    <DashboardSidebar>
      <SidebarInset>
        <DashboardNavbar />
        <div className="py-4 pr-4">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </SidebarInset>
    </DashboardSidebar>
  );
}
