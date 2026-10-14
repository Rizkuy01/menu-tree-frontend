"use client";

import { BookOpen, ChevronDown, ChevronRight, LayoutDashboard, X } from "lucide-react";
import { useState } from "react";
import type { MenuNode } from "@/types/menu";

export type NavView = "menus" | "api";

export interface SidebarProps {
  open: boolean;
  activeView: NavView;
  tree: MenuNode[];
  onClose: () => void;
  onNavigate: (view: NavView) => void;
}

// Recursive read-only sidebar tree node
function SidebarTreeNode({
  node,
  depth,
}: {
  node: MenuNode;
  depth: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const indentPx = depth === 0 ? "pl-3" : depth === 1 ? "pl-6" : "pl-9";

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-1.5 pr-2 rounded-[8px] cursor-default select-none ${indentPx} hover:bg-white/10 transition-colors`}
      >
        {hasChildren ? (
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="text-white/60 hover:text-white shrink-0 transition-colors"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}

        <span
          className={`shrink-0 rounded-full ${
            depth === 0
              ? "w-1.5 h-1.5 bg-white/70"
              : depth === 1
                ? "w-1 h-1 bg-white/50"
                : "w-1 h-1 bg-white/30"
          }`}
        />

        <span
          className={`truncate leading-tight ${
            depth === 0
              ? "text-xs font-semibold text-white/90"
              : depth === 1
                ? "text-[11px] font-medium text-white/75"
                : "text-[11px] font-normal text-white/60"
          }`}
          title={node.name}
        >
          {node.name}
        </span>
      </div>

      {hasChildren && !collapsed && (
        <div>
          {node.children.map((child) => (
            <SidebarTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  open,
  activeView,
  tree,
  onClose,
  onNavigate,
}: SidebarProps) {
  const [treeExpanded, setTreeExpanded] = useState(true);

  const navItems: { view: NavView; label: string; icon: React.ElementType }[] = [
    { view: "menus", label: "Menu Hierarchy", icon: LayoutDashboard },
    { view: "api", label: "API Documentation", icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-[#101828]/40 backdrop-blur-xs transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed z-50 top-3 bottom-3 left-3 w-[230px] rounded-[20px] bg-[#0B4FB8] text-white p-5 flex flex-col shadow-xl transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0"
        }`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white text-[#0B4FB8] font-bold text-xs flex items-center justify-center shadow-sm">
              ●
            </div>
            <div className="leading-tight font-bold text-xs tracking-wide">
              Menu<br />Tree
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fixed 2-item Nav */}
        <div className="rounded-[14px] bg-[#094199]/60 p-1.5 space-y-1">
          {navItems.map(({ view, label, icon: Icon }) => {
            const isActive = activeView === view;
            return (
              <button
                key={view}
                id={`sidebar-nav-${view}`}
                onClick={() => onNavigate(view)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-xs transition-all select-none text-left font-medium ${
                  isActive
                    ? "bg-white text-[#101828] font-semibold shadow-sm"
                    : "text-white/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-[#0B4FB8]" : "text-white/80"
                  }`}
                />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        {/* Dynamic Structure Preview (read-only, collapsible) */}
        {tree.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col">
            <button
              onClick={() => setTreeExpanded((p) => !p)}
              className="flex items-center gap-2 px-1 mb-2 text-[11px] font-semibold text-white/50 uppercase tracking-wider hover:text-white/70 transition-colors select-none"
            >
              {treeExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              Structure Preview
            </button>

            {treeExpanded && (
              <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
                {tree.map((rootNode) => (
                  <SidebarTreeNode key={rootNode.id} node={rootNode} depth={0} />
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
