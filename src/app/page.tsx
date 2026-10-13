"use client";

import { useEffect, useState } from "react";
import { menuApi } from "@/lib/api";
import type { MenuNode } from "@/types/menu";

export default function Home() {
  const [tree, setTree] = useState<MenuNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    menuApi
      .getTree()
      .then(setTree)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Cek koneksi API</h1>
      {error && <p className="mt-4 text-red-600">Gagal: {error}</p>}
      {tree && (
        <pre className="mt-4 rounded bg-gray-100 p-4 text-sm">
          {JSON.stringify(tree, null, 2)}
        </pre>
      )}
      {!tree && !error && <p className="mt-4">Memuat...</p>}
    </main>
  );
}