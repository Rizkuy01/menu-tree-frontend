import { Button } from "../ui/Button";

export interface TreeToolbarProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function TreeToolbar({
  onExpandAll,
  onCollapseAll,
}: TreeToolbarProps) {
  return (
    <div className="flex items-center gap-2.5 my-4 sm:my-5">
      <Button
        variant="dark"
        size="sm"
        onClick={onExpandAll}
        className="px-5 py-2 font-medium"
      >
        Expand All
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onCollapseAll}
        className="px-5 py-2 font-medium"
      >
        Collapse All
      </Button>
    </div>
  );
}
