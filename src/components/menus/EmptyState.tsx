import { CirclePlus } from "lucide-react";
import { Button } from "../ui/Button";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "No menus yet",
  description = "Get started by creating your first root menu.",
  actionText = "+ New root menu",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 border border-dashed border-[#D0D5DD] rounded-[16px] bg-white text-center">
      <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0B4FB8] flex items-center justify-center mb-3">
        <CirclePlus className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#101828] mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-[#667085] max-w-xs mb-5">
        {description}
      </p>
      {onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
