"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();

  // Automatically redirect to admin dashboard
  // since authentication has been disabled
  useEffect(() => {
    router.push("/admin");
  }, [router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-xl font-bold text-yellow-400">
          Redirecting to Admin Dashboard...
        </h1>
        <p className="text-gray-400">
          Authentication has been disabled. You will be redirected
          automatically.
        </p>
      </div>
    </div>
  );
}
