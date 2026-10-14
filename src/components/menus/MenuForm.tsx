import { Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { countDescendants, findNode, findParent } from "@/lib/tree";
import { useMenuStore } from "@/store/menuStore";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";

export function MenuForm() {
  const {
    tree,
    selectedId,
    mode,
    addParentId,
    saving,
    formError,
    success,
    saveMenu,
    deleteMenu,
    cancelAdd,
    clearSuccess,
  } = useMenuStore();

  const selected = selectedId ? findNode(tree, selectedId) : null;
  const parent = selected
    ? findParent(tree, selected.id)
    : addParentId
    ? findNode(tree, addParentId)
    : null;

  const [name, setName] = useState(mode === "add" ? "" : selected?.name ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Auto-dismiss success notification
  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(clearSuccess, 3500);
    return () => window.clearTimeout(timer);
  }, [success, clearSuccess]);

  const depth =
    mode === "add"
      ? (parent?.depth ?? -1) + 1
      : selected?.depth ?? 0;

  const trimmedName = name.trim();
  const isValid = trimmedName.length > 0 && trimmedName.length <= 255;
  const isUnchanged = mode === "view" && trimmedName === (selected?.name ?? "");
  const canSave = isValid && !isUnchanged && !saving;
  const descendantCount = selected ? countDescendants(selected) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    await saveMenu(name);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    setDeleteOpen(false);
    await deleteMenu(selected.id);
  };

  return (
    <>
      <section className="p-6 sm:p-7 rounded-[18px] border border-[#EAECF0] bg-white shadow-2xs flex flex-col justify-between min-h-[380px]">
        <div>
          {/* Header */}
          <div className="pb-4 border-b border-[#F0F1F3]">
            <h2 className="text-sm sm:text-base font-bold text-[#101828]">
              {mode === "add"
                ? addParentId
                  ? "Add Child Menu"
                  : "New Root Menu"
                : "Menu Details"}
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              {mode === "add"
                ? "Enter a name to create this menu item."
                : "View or update details of the selected menu."}
            </p>
          </div>

          {/* Form Fields */}
          <form id="menu-form" onSubmit={handleSubmit} className="space-y-4 pt-5">
            <Field
              label="Menu ID"
              value={mode === "add" ? "— (Assigned on save)" : selected?.id ?? "—"}
              readOnly
            />

            <Field
              label="Depth"
              value={String(depth)}
              readOnly
              narrow
            />

            <Field
              label="Parent Data"
              value={
                mode === "add"
                  ? parent?.name ?? "— (Root level)"
                  : parent?.name ?? "— (Root level)"
              }
              readOnly
            />

            <div className="flex flex-col gap-1 w-full">
              <span className="text-[11px] font-medium text-[#475467] pl-1 select-none">
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={255}
                placeholder="Enter menu name"
                aria-label="Name"
                className="w-full h-11 px-4 text-xs sm:text-sm rounded-[14px] bg-[#F2F4F7] text-[#101828] border border-transparent focus:border-[#0B4FB8]/40 focus:bg-white focus:ring-2 focus:ring-[#0B4FB8]/10 transition-all outline-none"
              />
            </div>
          </form>

          {/* Feedback Messages */}
          {formError && (
            <div
              role="alert"
              className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200"
            >
              {formError}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 animate-in fade-in"
            >
              ✓ {success}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 mt-4 border-t border-[#F2F4F7] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Button
              type="submit"
              form="menu-form"
              variant="primary"
              disabled={!canSave}
              loading={saving}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold"
            >
              Save
            </Button>

            {mode === "add" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelAdd}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
          </div>

          {mode === "view" && selected && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border border-[#FDA29B] text-[#D92D20] bg-white hover:bg-red-50 active:bg-red-100 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </section>

      {/* Delete Dialog */}
      {selected && (
        <DeleteConfirmDialog
          open={deleteOpen}
          menuName={selected.name}
          descendantCount={descendantCount}
          loading={saving}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}
