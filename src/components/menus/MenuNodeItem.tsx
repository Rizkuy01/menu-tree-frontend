import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, GripVertical, Plus } from "lucide-react";
import React from "react";
import type { MenuNode } from "@/types/menu";

export interface MenuNodeItemProps {
  node: MenuNode;
  level: number;
  query: string;
  expandedIds: Set<string>;
  selectedId: string | null;
  dropTarget: {
    id: string;
    position: "before" | "inside" | "after";
    isInvalid: boolean;
  } | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onAddChild: (id: string) => void;
}

export function MenuNodeItem({
  node,
  level,
  query,
  expandedIds,
  selectedId,
  dropTarget,
  onToggle,
  onSelect,
  onAddChild,
}: MenuNodeItemProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: node.id,
    data: { node },
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: node.id,
    data: { node },
  });

  const isCurrentDropTarget = dropTarget?.id === node.id;
  const dropPosition = isCurrentDropTarget ? dropTarget.position : null;
  const isInvalidDrop = isCurrentDropTarget && dropTarget.isInvalid;

  // Search match highlighting
  const trimmedQuery = query.trim().toLowerCase();
  const matchIndex = trimmedQuery ? node.name.toLowerCase().indexOf(trimmedQuery) : -1;
  const parts =
    matchIndex >= 0
      ? [
          node.name.slice(0, matchIndex),
          node.name.slice(matchIndex, matchIndex + trimmedQuery.length),
          node.name.slice(matchIndex + trimmedQuery.length),
        ]
      : [node.name];

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      ref={setDropRef}
      className={`relative select-none ${isDragging ? "opacity-35" : ""}`}
    >
      {/* Drop Before Indicator Line */}
      {isCurrentDropTarget && dropPosition === "before" && (
        <div
          className={`absolute -top-1 left-2 right-2 h-0.5 rounded-full z-20 pointer-events-none ${
            isInvalidDrop ? "bg-[#D92D20]" : "bg-[#0B4FB8]"
          }`}
        />
      )}

      {/* Node Row */}
      <div
        className={`group relative flex items-center min-h-[34px] py-1 px-1.5 rounded-lg transition-all cursor-pointer ${
          isSelected
            ? "bg-[#EBF3FF] text-[#0B4FB8] font-semibold"
            : "hover:bg-[#F8FAFC] text-[#344054]"
        } ${
          isCurrentDropTarget && dropPosition === "inside"
            ? isInvalidDrop
              ? "ring-2 ring-[#D92D20] bg-[#FEF3F2] cursor-not-allowed"
              : "ring-2 ring-[#0B4FB8] bg-[#EBF3FF]/80"
            : ""
        }`}
        style={{ paddingLeft: `${Math.max(level * 18, 4)}px` }}
      >
        {/* Drag Handle */}
        <button
          type="button"
          ref={setDragRef}
          {...attributes}
          {...listeners}
          className="opacity-25 group-hover:opacity-80 hover:!opacity-100 p-0.5 -ml-0.5 mr-0.5 text-[#98A2B3] hover:text-[#475467] cursor-grab active:cursor-grabbing rounded transition-opacity"
          title="Drag to reorder or move"
          aria-label={`Drag ${node.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* Expand / Collapse Chevron */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            className="w-5 h-5 flex items-center justify-center text-[#98A2B3] hover:text-[#344054] rounded transition-colors mr-1 shrink-0"
            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
          </button>
        ) : (
          <span className="w-5 h-5 mr-1 shrink-0" aria-hidden="true" />
        )}

        {/* Node Name */}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          title={node.name}
          className="text-left text-xs sm:text-[13px] truncate flex-1 tracking-tight"
        >
          {parts.length === 3 ? (
            <>
              <span>{parts[0]}</span>
              <mark className="bg-[#FFEBA5] text-[#101828] font-bold rounded-xs px-0.5">
                {parts[1]}
              </mark>
              <span>{parts[2]}</span>
            </>
          ) : (
            node.name
          )}
        </button>

        {/* Selected indicator + Add Child Button */}
        {isSelected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            className="w-5 h-5 rounded-full bg-[#0B4FB8] text-white flex items-center justify-center shadow-xs hover:bg-[#093e92] active:scale-95 transition-all ml-2 shrink-0"
            title="Add sub-menu"
            aria-label={`Add child to ${node.name}`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Drop After Indicator Line */}
      {isCurrentDropTarget && dropPosition === "after" && (
        <div
          className={`absolute -bottom-1 left-2 right-2 h-0.5 rounded-full z-20 pointer-events-none ${
            isInvalidDrop ? "bg-[#D92D20]" : "bg-[#0B4FB8]"
          }`}
        />
      )}

      {/* Children Subtree with connector guide lines */}
      {hasChildren && isExpanded && (
        <div className="relative pl-3 border-l border-[#E4E7EC] ml-4 mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <MenuNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              query={query}
              expandedIds={expandedIds}
              selectedId={selectedId}
              dropTarget={dropTarget}
              onToggle={onToggle}
              onSelect={onSelect}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
