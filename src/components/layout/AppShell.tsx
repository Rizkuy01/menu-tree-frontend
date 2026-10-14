import { Menu as MenuIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { Sidebar, type NavView } from "./Sidebar";
import type { MenuNode } from "@/types/menu";

export interface AppShellProps {
  children: React.ReactNode;
  activeView: NavView;
  activeLabel?: string;
  tree: MenuNode[];
  onNavigate: (view: NavView) => void;
}

export function AppShell({
  children,
  activeView,
  activeLabel = "Menu Hierarchy",
  tree,
  onNavigate,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigate = (view: NavView) => {
    setSidebarOpen(false);
    onNavigate(view);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-[#101828] flex flex-col antialiased">
      <Sidebar
        open={sidebarOpen}
        activeView={activeView}
        tree={tree}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[254px] flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 lg:h-18 px-5 lg:px-10 border-b border-[#F2F4F7] bg-white/80 backdrop-blur-xs sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1 text-[#475467] hover:text-[#101828] rounded-lg lg:hidden"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <Breadcrumb current={activeView === "api" ? "API Documentation" : activeLabel} />
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 max-w-[1140px] w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
