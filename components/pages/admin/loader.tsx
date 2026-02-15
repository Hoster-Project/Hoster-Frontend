"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AdminDashboard = dynamic(() => import("./admin-dashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

export default function AdminLoader() {
  return <AdminDashboard />;
}
