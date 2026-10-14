"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import type { NavView } from "@/components/layout/Sidebar";
import { ApiList } from "@/components/menus/ApiList";
import { EmptyState } from "@/components/menus/EmptyState";
import { ErrorBanner } from "@/components/menus/ErrorBanner";
import { MenuForm } from "@/components/menus/MenuForm";
import { MenuTree } from "@/components/menus/MenuTree";
import { RootMenuSelect } from "@/components/menus/RootMenuSelect";
import { TreeSkeleton } from "@/components/menus/TreeSkeleton";
import { TreeToolbar } from "@/components/menus/TreeToolbar";
import { filterTree, findNode } from "@/lib/tree";
import { useMenuStore } from "@/store/menuStore";

export default function MenusPage() {
  const {
    tree,
    rootId,
    selectedId,
    mode,
    addParentId,
    expandedIds,
    search,
    loading,
    error,
    fetchTree,
    setRoot,
    select,
    toggle,
    expandAll,
    collapseAll,
    setSearch,
    startAddChild,
    startAddRoot,
    moveMenu,
    reorderMenu,
  } = useMenuStore();

  const [activeView, setActiveView] = useState<NavView>("menus");

  // Load tree data on initial mount
  useEffect(() => {
    void fetchTree();
  }, [fetchTree]);

  // Find currently active root node
  const activeRoot = useMemo(() => {
    return tree.find((item) => item.id === rootId) ?? tree[0] ?? null;
  }, [tree, rootId]);

  // Find currently selected node in tree
  const activeSelected = useMemo(() => {
    return selectedId ? findNode(tree, selectedId) : null;
  }, [tree, selectedId]);

  // Label for breadcrumb
  const activeLabel = useMemo(() => {
    if (activeView === "api") return "API Documentation";
    return activeSelected?.name ?? "Menu Hierarchy";
  }, [activeView, activeSelected]);

  // Compute filtered tree and required expanded nodes when searching
  const filtered = useMemo(() => {
    if (!activeRoot) return null;
    return filterTree(activeRoot, search);
  }, [activeRoot, search]);

  // Combine user expanded IDs with IDs expanded by search matches
  const visibleExpandedIds = useMemo(() => {
    const ids = new Set(expandedIds);
    filtered?.expandIds.forEach((id) => ids.add(id));
    return ids;
  }, [expandedIds, filtered]);

  // Handle sidebar navigation — just switches views
  const handleNavigate = (view: NavView) => {
    setActiveView(view);
  };

  return (
    <AppShell
      activeView={activeView}
      activeLabel={activeLabel}
      tree={tree}
      onNavigate={handleNavigate}
    >
      <PageHeader
        title={activeView === "api" ? "API Documentation" : activeLabel || "Menu Hierarchy"}
        description={
          activeView === "api"
            ? "Inspect backend endpoints documented via Swagger/OpenAPI"
            : "Manage and customize your application menu hierarchy"
        }
      />

      {activeView === "api" ? (
        <ApiList />
      ) : (
        <div className="space-y-6">
          {/* Error Banner */}
          {error && (
            <ErrorBanner
              message={error}
              onRetry={() => void fetchTree()}
            />
          )}

          {/* Controls: Root Select + New Root */}
          <RootMenuSelect
            tree={tree}
            rootId={rootId}
            onSelectRoot={setRoot}
            onAddRoot={startAddRoot}
          />

          {/* Expand/Collapse Actions */}
          <TreeToolbar
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
          />

          {/* Workspace Body */}
          {loading ? (
            <TreeSkeleton />
          ) : tree.length === 0 ? (
            mode === "add" ? (
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,340px)_minmax(420px,560px)] gap-6 items-start">
                <EmptyState
                  title="Create your first menu"
                  description="Fill out the details on the right to set up the root menu."
                />
                <MenuForm />
              </div>
            ) : (
              <EmptyState
                title="No menus yet"
                description="Get started by creating your first root menu."
                actionText="+ New root menu"
                onAction={startAddRoot}
              />
            )
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,340px)_minmax(420px,560px)] gap-6 items-start">
              {/* Left Column: Hierarchical Tree */}
              <MenuTree
                rootNode={activeRoot}
                filteredNode={filtered?.tree ?? null}
                fullTree={tree}
                search={search}
                expandedIds={visibleExpandedIds}
                selectedId={selectedId}
                onSearchChange={setSearch}
                onToggle={toggle}
                onSelect={select}
                onAddChild={startAddChild}
                onMove={moveMenu}
                onReorder={reorderMenu}
              />

              {/* Right Column: Menu Detail & Form Actions */}
              <MenuForm
                key={`${mode}-${selectedId ?? addParentId ?? "new"}-${
                  activeSelected?.name ?? ""
                }-${activeRoot?.id ?? ""}`}
              />
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}


