import { Trash2, X } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Button } from "../ui/Button";

export interface DeleteConfirmDialogProps {
  open: boolean;
  menuName: string;
  descendantCount: number;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  menuName,
  descendantCount,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
        className="relative w-full max-w-sm rounded-[20px] bg-white p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150"
      >
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 p-1 text-[#667085] hover:text-[#101828] rounded-md transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-11 h-11 rounded-full bg-[#FEF3F2] text-[#D92D20] flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5" />
        </div>

        <h3
          id="delete-dialog-title"
          className="text-base font-bold text-[#101828] mb-1.5"
        >
          Delete menu?
        </h3>

        <p id="delete-dialog-desc" className="text-xs sm:text-sm text-[#667085] leading-relaxed mb-6">
          Are you sure you want to delete{" "}
          <strong className="text-[#101828] font-semibold">{menuName}</strong>?
          {descendantCount > 0 && (
            <span className="block mt-1 text-[#D92D20] font-medium">
              ⚠️ {descendantCount} descendant{descendantCount > 1 ? "s" : ""}{" "}
              will also be deleted permanently.
            </span>
          )}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center text-xs sm:text-sm px-5 py-2.5 rounded-full font-semibold bg-[#D92D20] text-white hover:bg-[#B42318] active:bg-[#912018] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
