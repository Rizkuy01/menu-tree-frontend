"use client";

import { create } from "zustand";
import { ApiError, menuApi } from "@/lib/api";
import { collectIds, findNode, findParent } from "@/lib/tree";
import type { MenuNode } from "@/types/menu";

type Mode = "view" | "add";

interface MenuState {
  tree: MenuNode[];
  loading: boolean;
  error: string | null;
  rootId: string | null;
  selectedId: string | null;
  mode: Mode;
  addParentId: string | null;
  expandedIds: Set<string>;
  search: string;
  saving: boolean;
  formError: string | null;
  success: string | null;
  fetchTree: () => Promise<void>;
  setRoot: (id: string) => void;
  select: (id: string) => void;
  toggle: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setSearch: (query: string) => void;
  startAddChild: (parentId: string) => void;
  startAddRoot: () => void;
  cancelAdd: () => void;
  saveMenu: (name: string) => Promise<boolean>;
  deleteMenu: (id: string) => Promise<boolean>;
  moveMenu: (id: string, parentId: string | null, position?: number) => Promise<boolean>;
  reorderMenu: (id: string, position: number) => Promise<boolean>;
  clearSuccess: () => void;
}

const currentRoot = (state: MenuState) =>
  state.tree.find((root) => root.id === state.rootId) ?? state.tree[0];

export const useMenuStore = create<MenuState>((set, get) => ({
  tree: [],
  loading: true,
  error: null,
  rootId: null,
  selectedId: null,
  mode: "view",
  addParentId: null,
  expandedIds: new Set(),
  search: "",
  saving: false,
  formError: null,
  success: null,

  fetchTree: async () => {
    set({ loading: true, error: null });
    try {
      const tree = await menuApi.getTree();
      const state = get();
      const rootId = tree.some((root) => root.id === state.rootId)
        ? state.rootId
        : tree[0]?.id ?? null;
      const selectedId =
        state.selectedId && findNode(tree, state.selectedId)
          ? state.selectedId
          : rootId;
      const existing = new Set(state.expandedIds);
      if (rootId && state.tree.length === 0) existing.add(rootId);
      set({ tree, rootId, selectedId, expandedIds: existing, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Gagal memuat menu",
      });
    }
  },

  setRoot: (id) => {
    const root = get().tree.find((item) => item.id === id);
    if (root) set({ rootId: id, selectedId: id, mode: "view", search: "" });
  },

  select: (id) => set({ selectedId: id, mode: "view", formError: null, success: null }),

  toggle: (id) => {
    const expanded = new Set(get().expandedIds);
    if (expanded.has(id)) expanded.delete(id);
    else expanded.add(id);
    set({ expandedIds: expanded });
  },

  expandAll: () => {
    const root = currentRoot(get());
    set({ expandedIds: root ? new Set(collectIds(root)) : new Set() });
  },

  collapseAll: () => set({ expandedIds: new Set() }),
  setSearch: (search) => set({ search }),

  startAddChild: (parentId) => {
    const expanded = new Set(get().expandedIds);
    expanded.add(parentId);
    set({
      mode: "add",
      addParentId: parentId,
      selectedId: null,
      expandedIds: expanded,
      formError: null,
      success: null,
    });
  },

  startAddRoot: () =>
    set({ mode: "add", addParentId: null, selectedId: null, formError: null, success: null }),

  cancelAdd: () =>
    set({ mode: "view", selectedId: get().rootId, addParentId: null, formError: null }),

  saveMenu: async (rawName) => {
    const name = rawName.trim();
    if (!name) {
      set({ formError: "Nama menu wajib diisi." });
      return false;
    }
    if (name.length > 255) {
      set({ formError: "Nama menu maksimal 255 karakter." });
      return false;
    }

    const state = get();
    set({ saving: true, formError: null, success: null });
    try {
      const saved =
        state.mode === "add"
          ? await menuApi.create(name, state.addParentId)
          : state.selectedId
            ? await menuApi.update(state.selectedId, name)
            : null;
      await get().fetchTree();
      if (saved) set({ selectedId: saved.id, mode: "view", addParentId: null, success: "Menu berhasil disimpan." });
      set({ saving: false });
      return Boolean(saved);
    } catch (error) {
      set({
        saving: false,
        formError: error instanceof ApiError ? error.message : "Gagal menyimpan menu.",
      });
      return false;
    }
  },

  deleteMenu: async (id) => {
    const state = get();
    const node = findNode(state.tree, id);
    const parent = findParent(state.tree, id);
    set({ saving: true, formError: null });
    try {
      await menuApi.remove(id);
      await get().fetchTree();
      const next = parent?.id ?? get().tree.find((root) => root.id !== id)?.id ?? null;
      set({ selectedId: next, mode: "view", saving: false, success: "Menu berhasil dihapus." });
      return Boolean(node);
    } catch (error) {
      set({
        saving: false,
        formError: error instanceof ApiError ? error.message : "Gagal menghapus menu.",
      });
      return false;
    }
  },

  moveMenu: async (id, parentId, position) => {
    set({ saving: true, formError: null, error: null });
    try {
      await menuApi.move(id, parentId, position);
      await get().fetchTree();
      set({ saving: false, success: "Menu berhasil dipindahkan." });
      return true;
    } catch (error) {
      set({
        saving: false,
        error: error instanceof ApiError ? error.message : "Gagal memindahkan menu.",
      });
      return false;
    }
  },

  reorderMenu: async (id, position) => {
    set({ saving: true, formError: null, error: null });
    try {
      await menuApi.reorder(id, position);
      await get().fetchTree();
      set({ saving: false, success: "Posisi menu berhasil diubah." });
      return true;
    } catch (error) {
      set({
        saving: false,
        error: error instanceof ApiError ? error.message : "Gagal mengubah posisi menu.",
      });
      return false;
    }
  },

  clearSuccess: () => set({ success: null }),
}));
