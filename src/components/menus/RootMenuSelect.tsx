import { ChevronDown, Plus } from "lucide-react";
import type { MenuNode } from "@/types/menu";

export interface RootMenuSelectProps {
  tree: MenuNode[];
  rootId: string | null;
  onSelectRoot: (id: string) => void;
  onAddRoot: () => void;
}

export function RootMenuSelect({
  tree,
  rootId,
  onSelectRoot,
  onAddRoot,
}: RootMenuSelectProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full">
      {/* Root Select with custom floating label */}
      <div className="relative w-full sm:w-[350px]">
        <label
          htmlFor="root-menu-select"
          className="block text-[11px] font-medium text-[#475467] pl-1 mb-1 select-none"
        >
          Menu
        </label>
        <div className="relative">
          <select
            id="root-menu-select"
            value={rootId ?? ""}
            onChange={(e) => onSelectRoot(e.target.value)}
            disabled={tree.length === 0}
            className="w-full h-11 pl-4 pr-10 text-xs sm:text-sm font-medium rounded-[14px] bg-[#F2F4F7] text-[#344054] appearance-none outline-none border border-transparent focus:border-[#0B4FB8]/40 focus:ring-2 focus:ring-[#0B4FB8]/10 disabled:opacity-50 transition-all cursor-pointer"
          >
            {tree.length === 0 ? (
              <option value="" disabled>
                No root menus available
              </option>
            ) : (
              tree.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.name}
                </option>
              ))
            )}
          </select>
          <ChevronDown className="w-4 h-4 text-[#98A2B3] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* New Root Button */}
      <button
        onClick={onAddRoot}
        className="h-11 px-4 rounded-full border border-[#B2CCED] bg-white text-[#0B4FB8] text-xs sm:text-sm font-semibold hover:bg-blue-50/50 active:bg-blue-100/50 transition-colors inline-flex items-center justify-center gap-1.5 shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>New root</span>
      </button>
    </div>
  );
}
