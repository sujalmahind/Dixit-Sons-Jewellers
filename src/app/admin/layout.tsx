"use client";

import AdminSideBar from "@/components/AdminSideBar";

function AdminLayout({ children }: { children: React.ReactNode }) {
  // Authentication has been disabled - all admin content is accessible
  return (
    <div className="flex flex-row gap-8">
      <AdminSideBar />
      <div className="container grid place-items-center">{children}</div>
    </div>
  );
}

export default AdminLayout;
