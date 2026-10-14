import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { countDescendants, findNode, isInSubtree } from "@/lib/tree";
import type { MenuNode } from "@/types/menu";
import { MenuNodeItem } from "./MenuNodeItem";
import { SearchInput } from "./SearchInput";

export interface MenuTreeProps {
  rootNode: MenuNode | null;
  filteredNode: MenuNode | null;
  fullTree: MenuNode[];
  search: string;
  expandedIds: Set<string>;
  selectedId: string | null;
  onSearchChange: (query: string) => void;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onAddChild: (id: string) => void;
  onMove: (id: string, parentId: string | null, position?: number) => Promise<boolean>;
  onReorder: (id: string, position: number) => Promise<boolean>;
}

export function MenuTree({
  rootNode,
  filteredNode,
  fullTree,
  search,
  expandedIds,
  selectedId,
  onSearchChange,
  onToggle,
  onSelect,
  onAddChild,
  onMove,
  onReorder,
}: MenuTreeProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "inside" | "after">("inside");
  const autoExpandTimerRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const activeNode = activeId ? findNode(fullTree, activeId) : null;
  const isInvalidDrop =
    Boolean(activeNode && overId && (activeNode.id === overId || isInSubtree(activeNode, overId)));

  // Auto-expand collapsed node when hovering with "inside" intention
  useEffect(() => {
    if (autoExpandTimerRef.current) {
      window.clearTimeout(autoExpandTimerRef.current);
      autoExpandTimerRef.current = null;
    }

    if (activeId && overId && dropPosition === "inside" && !isInvalidDrop) {
      const targetNode = findNode(fullTree, overId);
      if (targetNode && targetNode.children.length > 0 && !expandedIds.has(overId)) {
        autoExpandTimerRef.current = window.setTimeout(() => {
          onToggle(overId);
        }, 550);
      }
    }

    return () => {
      if (autoExpandTimerRef.current) {
        window.clearTimeout(autoExpandTimerRef.current);
      }
    };
  }, [activeId, overId, dropPosition, isInvalidDrop, fullTree, expandedIds, onToggle]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    setOverId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverId(null);
      return;
    }

    const currentOverId = String(over.id);
    setOverId(currentOverId);

    // Calculate whether the drag position is before, inside, or after
    if (over.rect) {
      const activeY = active.rect.current.translated?.top ?? 0;
      const overTop = over.rect.top;
      const overHeight = over.rect.height || 34;
      const relativeY = activeY + 16 - overTop;

      if (relativeY < overHeight * 0.28) {
        setDropPosition("before");
      } else if (relativeY > overHeight * 0.72) {
        setDropPosition("after");
      } else {
        setDropPosition("inside");
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const draggedNode = findNode(fullTree, String(active.id));
    const targetNode = findNode(fullTree, String(over.id));

    if (!draggedNode || !targetNode) return;

    // Reject cycle or invalid drop client-side
    if (isInSubtree(draggedNode, targetNode.id)) {
      return;
    }

    if (dropPosition === "inside") {
      // Re-parent draggedNode as a child of targetNode
      await onMove(draggedNode.id, targetNode.id);
    } else if (dropPosition === "before") {
      // Insert before targetNode at targetNode.position under targetNode.parent_id
      if (draggedNode.parent_id === targetNode.parent_id) {
        await onReorder(draggedNode.id, targetNode.position);
      } else {
        await onMove(draggedNode.id, targetNode.parent_id, targetNode.position);
      }
    } else if (dropPosition === "after") {
      // Insert after targetNode under targetNode.parent_id
      const newPos = targetNode.position + 1;
      if (draggedNode.parent_id === targetNode.parent_id) {
        await onReorder(draggedNode.id, newPos);
      } else {
        await onMove(draggedNode.id, targetNode.parent_id, newPos);
      }
    }
  };

  const dropTargetState = overId
    ? {
        id: overId,
        position: dropPosition,
        isInvalid: isInvalidDrop,
      }
    : null;

  return (
    <section className="p-4 sm:p-5 rounded-[18px] border border-[#EAECF0] bg-white shadow-2xs min-h-[380px] flex flex-col">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs sm:text-sm font-bold text-[#101828]">
          Menu Tree
        </h2>
        {rootNode && (
          <span className="text-[11px] text-[#667085] font-medium">
            Root: {rootNode.name}
          </span>
        )}
      </div>

      {/* Search Input */}
      <SearchInput value={search} onChange={onSearchChange} />

      {/* Tree Node List with Drag and Drop */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[580px] pr-1 py-1">
        {filteredNode ? (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div role="tree" aria-label="Hierarchical Menu Tree" className="space-y-0.5">
              <MenuNodeItem
                node={filteredNode}
                level={0}
                query={search}
                expandedIds={expandedIds}
                selectedId={selectedId}
                dropTarget={dropTargetState}
                onToggle={onToggle}
                onSelect={onSelect}
                onAddChild={onAddChild}
              />
            </div>

            {/* Drag Overlay Ghost */}
            <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
              {activeNode ? (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border-2 shadow-2xl text-xs font-semibold select-none ${
                    isInvalidDrop
                      ? "border-[#D92D20] text-[#D92D20] bg-red-50/90"
                      : "border-[#0B4FB8] text-[#0B4FB8]"
                  }`}
                >
                  <GripVertical className="w-3.5 h-3.5 opacity-60" />
                  <span>{activeNode.name}</span>
                  {activeNode.children.length > 0 && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
                      +{countDescendants(activeNode)}
                    </span>
                  )}
                  {isInvalidDrop && (
                    <span className="text-[10px] text-red-600 font-normal ml-1">
                      (Cannot drop into itself or child)
                    </span>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-[#667085]">
            <p>No menus matching &quot;{search}&quot;</p>
            <button
              onClick={() => onSearchChange("")}
              className="mt-2 text-[#0B4FB8] font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
