# TASK: Build the Menu Tree frontend

> This file is self-contained: it holds the project context, the design spec, the API contract,
> and the implementation phases. Work phase by phase. Do not skip ahead.

## 0. Context

Technical test: **"Fullstack Menu Tree System"**. The Go backend (separate folder `menu-tree-backend`, already done)
exposes a REST API for a hierarchical menu tree. This folder (`menu-tree-frontend`) is the UI.

Grading weights: Code Quality 30%, Functionality 30%, **UX 20%**, Documentation 10%, Bonus 10%
(Docker, tests, performance, smooth drag-and-drop).

Hard requirements from the test:
- React/Next.js + **TypeScript** + **Tailwind CSS**; state management (Zustand/Redux/Context) is a bonus.
- Display the tree hierarchically; add items at any level; edit (inline or modal); delete **with confirmation**;
  expand/collapse; **search/filter**; **responsive** (mobile + desktop); **loading and error states**.
- Bonus: drag-and-drop reorder/restructure.
- UI should look **as similar as possible to the Figma design** (screenshots in `design/`, see section 3).

### Stack (already set up)
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind + `zustand` + `lucide-react`, `src/` directory, alias `@/*`.
**Check the installed versions first** (`package.json`) and follow them: Tailwind v4 is configured in CSS
(`@import "tailwindcss"` in `globals.css`, `@theme` for tokens), not in a `tailwind.config.*` file.

### Already existing files
- `src/types/menu.ts` — `MenuNode` (tree item with `children`) and `Menu` (single item with optional `parent_name`).
- `src/lib/api.ts` — `menuApi` (`getTree`, `getById`, `create`, `update`, `remove`, `move`, `reorder`) and `ApiError`
  (`code`, `message`, `status`). Reads `NEXT_PUBLIC_API_URL` (default `http://localhost:8080/api`).
- `.env.local` / `.env.example` with `NEXT_PUBLIC_API_URL`.
- `src/app/page.tsx` is a **temporary** API check page; replace it.

## 1. API contract (backend, base `http://localhost:8080/api`)

| Method | Path | Body | Result |
|---|---|---|---|
| GET | `/menus` | — | `MenuNode[]` — all roots with nested `children` (ordered by `position`) |
| GET | `/menus/:id` | — | `Menu` incl. `parent_name` |
| POST | `/menus` | `{name, parent_id?}` | `201 Menu` (depth computed by backend; appended last) |
| PUT | `/menus/:id` | `{name}` | `Menu` (only the name is editable) |
| DELETE | `/menus/:id` | — | `204`, **cascades to all descendants** |
| PATCH | `/menus/:id/move` | `{parent_id: string\|null, position?: number}` | `Menu`; `null` = root; omitted position = last |
| PATCH | `/menus/:id/reorder` | `{position}` | `Menu`; 0-based, clamped |

Errors: `{ "error": { "code": "...", "message": "..." } }` with codes `VALIDATION_ERROR` (400), `INVALID_ID` (400),
`NOT_FOUND` (404), `PARENT_NOT_FOUND` (404), `INVALID_MOVE` (409, move into itself/descendant), `INTERNAL_ERROR` (500).
Show `ApiError.message` to the user; never show raw stack traces.

Facts: IDs are UUID strings. `parent_id` is `null` for roots. Names may contain non-Latin text (e.g. Korean) — keep UTF-8 intact.

## 2. Conventions

- All components are typed; no `any`. Run `npx tsc --noEmit` and `npm run lint` (Next 16 does not lint during `build`).
- Server vs client: pages/components that use state, effects, or events need `"use client"`.
- Keep UI components small and single-purpose; logic lives in the store and `lib/tree.ts`, not inside JSX.
- No hard-coded API URLs outside `lib/api.ts`. No secrets in the repo; `.env.local` stays git-ignored, `.env.example` is committed
  (make sure `.gitignore` has `!.env.example` after `.env*`).
- Use semantic HTML and ARIA (`role="tree"`, `role="treeitem"`, `aria-expanded`, labelled buttons), visible focus states, keyboard support.
- Light theme only: **remove the dark-mode `prefers-color-scheme` block** from `globals.css` (the template turns the page dark; the design is light).
- Browser extensions (e.g. antivirus) can inject attributes like `bis_skin_checked` and cause a hydration warning overlay in dev.
  That is **not a bug in this code**; do not "fix" it with `suppressHydrationWarning`. Test in an Incognito window.
- Commit per phase with conventional messages (`feat:`, `fix:`, `style:`, `refactor:`).
- Do not claim something works unless it was actually run in the browser or via commands. State what could not be verified.

## 3. Design spec (from Figma)

Reference screenshots: save them in **`design/desktop.png`** and **`design/mobile.png`** and look at them while building.
The values below are approximate; define them as theme tokens so they are easy to tune against the screenshots.

### Desktop layout
```
┌────────┬─────────────────────────────────────────────────────────┐
│        │ 📁 › Menus                         (breadcrumb, h≈84)   │
│ Side-  ├─────────────────────────────────────────────────────────┤
│ bar    │ (●) Menus                           (page title, h≈84)  │
│ 240px  │ Menu                                                    │
│ blue   │ [ system management        ▾ ]  (≈350px wide)           │
│        │ [Expand All] [Collapse All]                             │
│        │ ┌ tree (≈280-310px) ┐   ┌ form (≈530px) ─────────────┐ │
│        │ │ ▾ System Mgmt     │   │ Menu ID   [uuid, readonly] │ │
│        │ │   ▾ Systems       │   │ Depth     [3, readonly]    │ │
│        │ │     ▾ System Code ⊕   │ Parent Data [Systems, ro]  │ │
│        │ │       Code Reg..  │   │ Name      [System Code]    │ │
│        │ └───────────────────┘   │ [   Save   ]               │ │
└────────┴─────────────────────────┴────────────────────────────┴─┘
```

**Sidebar** (240px wide, full height, rounded corners, strong blue background, white text/icons):
logo at top-left with a collapse/hamburger icon at the right; items in order:
`Systems`, `System Code`, `Properties`, **`Menus` (active: white pill, dark text)**, `API List` — these five sit in a slightly
lighter blue group block — then `Users & Group`, `Competition` (folder icons). Items are static links (no real routes needed),
except `Menus` which is the current page.

**Header**: breadcrumb with a folder icon, a separator, and the text `Menus`. Below it the page title `Menus`
(bold, large) preceded by a round blue icon containing a small grid glyph.

**Controls**: a labelled select `Menu` (small label inside the field, chevron on the right) listing the **root menus**;
below it two pill buttons: `Expand All` (dark filled) and `Collapse All` (outlined).

**Tree panel**: nodes with a chevron (expand/collapse) for nodes that have children, thin connector lines between levels,
indentation per depth, small text. The **selected node** shows a round blue `+` button right after its name (add child).
The root node of the selected root is shown as the first node.

**Form panel** (rounded card/outline): fields have a light-gray rounded background with a small label at the top inside the field:
`Menu ID` (read-only, full UUID), `Depth` (read-only, narrow), `Parent Data` (read-only, parent's name), `Name` (editable).
Primary button: blue pill `Save`.

### Mobile layout (stack vertically)
Top bar with hamburger (opens the sidebar as a drawer) and breadcrumb → page title → `Menu` select (full width) →
`Expand All` / `Collapse All` → tree → form fields stacked → `Save` pill button.

### Things the design does NOT show but the test requires (design them consistently)
- **Delete** with confirmation dialog → red outlined `Delete` button next to `Save` in the form (only for existing items).
  The dialog names the item and states how many descendants will also be deleted.
- **Search/filter** → search input above the tree with a magnifier icon and a clear button.
- **Create a new root menu** → small `+ New root` button next to the `Menu` select.
- **Loading** (skeletons), **error** (banner with Retry), **empty state** ("No menus yet — create the first one"), save spinner, inline form errors.

### Visual tokens (tune against the screenshots)
```
--color-primary:      ≈ #0B4FB8   (sidebar, Save button, round icons)
--color-primary-soft: ≈ lighter shade of primary (sidebar group block)
--color-ink:          ≈ #101828   (headings, dark pill)
--color-muted:        ≈ #667085   (labels)
--color-field:        ≈ #F2F4F7   (input background)
--color-line:         ≈ #D0D5DD   (tree connectors, outlines)
--color-danger:       ≈ #D92D20
radius: pills = full, fields ≈ 12-16px, sidebar ≈ 16-24px
font: clean geometric sans similar to the design (e.g. Plus Jakarta Sans via next/font/google); not critical
```

## 4. Target structure

```
src/
├── app/
│   ├── layout.tsx            # fonts, metadata, <html lang="en">
│   ├── globals.css           # Tailwind import + tokens (light theme only)
│   ├── page.tsx              # redirect("/menus")
│   └── menus/page.tsx        # the screen
├── components/
│   ├── layout/               # AppShell, Sidebar, Breadcrumb, PageHeader
│   ├── menus/                # RootMenuSelect, TreeToolbar, SearchInput, MenuTree, MenuNodeItem,
│   │                         # MenuForm, DeleteConfirmDialog, TreeSkeleton, ErrorBanner, EmptyState
│   └── ui/                   # Button, Field (label + input), Spinner (keep tiny)
├── lib/
│   ├── api.ts                # (exists)
│   └── tree.ts               # pure helpers (below)
├── store/menuStore.ts        # Zustand store
└── types/menu.ts             # (exists)
```

## 5. Core logic to implement first (pure, easy to unit-test)

`src/lib/tree.ts`:

```ts
import type { MenuNode } from "@/types/menu";

export function findNode(nodes: MenuNode[], id: string): MenuNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

export function findParent(nodes: MenuNode[], id: string): MenuNode | null {
  for (const n of nodes) {
    if (n.children.some((c) => c.id === id)) return n;
    const found = findParent(n.children, id);
    if (found) return found;
  }
  return null;
}

/** The node itself plus all descendant ids. */
export function collectIds(node: MenuNode): string[] {
  return [node.id, ...node.children.flatMap(collectIds)];
}

export function countDescendants(node: MenuNode): number {
  return collectIds(node).length - 1;
}

/** True when `targetId` is `root` itself or inside its subtree (used to block invalid drops). */
export function isInSubtree(root: MenuNode, targetId: string): boolean {
  return collectIds(root).includes(targetId);
}

/**
 * Case-insensitive filter. Keeps nodes whose name matches plus their ancestors.
 * `expandIds` = ancestors that must be expanded so matches are visible.
 */
export function filterTree(
  root: MenuNode,
  query: string,
): { tree: MenuNode | null; expandIds: Set<string> } {
  const q = query.trim().toLowerCase();
  if (!q) return { tree: root, expandIds: new Set() };

  const expandIds = new Set<string>();
  const walk = (n: MenuNode): MenuNode | null => {
    const kids = n.children.map(walk).filter((c): c is MenuNode => c !== null);
    const selfMatch = n.name.toLowerCase().includes(q);
    if (!selfMatch && kids.length === 0) return null;
    if (kids.length > 0) expandIds.add(n.id);
    return { ...n, children: kids.length > 0 ? kids : n.children };
  };
  return { tree: walk(root), expandIds };
}
```

`src/store/menuStore.ts` (Zustand). Required state and actions (implement fully):

```ts
type Mode = "view" | "add";

interface MenuState {
  tree: MenuNode[];            // all roots
  loading: boolean;            // initial/refresh load
  error: string | null;        // load error
  rootId: string | null;       // root chosen in the select
  selectedId: string | null;   // node shown in the form
  mode: Mode;                  // "add" = form is creating a new item
  addParentId: string | null;  // parent of the item being created (null = new root)
  expandedIds: Set<string>;    // always replace with a NEW Set (immutability)
  search: string;
  saving: boolean;
  formError: string | null;

  fetchTree(): Promise<void>;                 // keep rootId/selection if still valid; else first root; expand root on first load
  setRoot(id: string): void;
  select(id: string): void;                   // mode -> "view", clear formError
  toggle(id: string): void;
  expandAll(): void;                          // all ids of the current root's subtree
  collapseAll(): void;
  setSearch(q: string): void;
  startAddChild(parentId: string): void;      // mode "add", expand parent
  startAddRoot(): void;
  cancelAdd(): void;
  saveMenu(name: string): Promise<boolean>;   // POST in "add" mode, PUT otherwise; refetch; select the saved item; set formError on ApiError
  deleteMenu(id: string): Promise<boolean>;   // DELETE; refetch; select the parent (or the next root / null)
}
```

Rules: after every successful mutation, **refetch the tree** (simple and always consistent). Keep expanded state across refetches.
Derive form data (depth, parent name) from the in-memory tree via `findNode` / `findParent` — no extra request needed.
In "add" mode the form shows: Menu ID `—` (assigned after save), Depth = parent depth + 1 (0 for a new root), Parent Data = parent's name
(`—` for a new root), empty Name.

Validate on the client before calling the API: name is trimmed and non-empty, max 255 chars.

## 6. Phases (do them in order; commit after each)

### Phase 1 — Foundation and layout
1. Clean `globals.css` (light theme only, tokens above), set fonts in `layout.tsx`, `page.tsx` → `redirect("/menus")`.
2. Build `AppShell`, `Sidebar`, `Breadcrumb`, `PageHeader` per section 3. Sidebar is a fixed column on `lg+` and a **drawer** (hamburger, overlay, Esc/overlay-click to close) below `lg`.
3. `menus/page.tsx` renders the shell with placeholder panels.

**Done when:** desktop looks like `design/desktop.png` structurally; at mobile width the sidebar becomes a drawer.

### Phase 2 — Tree
1. `lib/tree.ts` and the store (fetch, select, toggle, expand/collapse all, root select).
2. `RootMenuSelect`, `TreeToolbar` (Expand All / Collapse All), `MenuTree` + recursive `MenuNodeItem`:
   chevron only if it has children, connector lines (e.g. a left border per level plus a short horizontal stub), indent per level,
   selected state, `+` button on the selected node, name truncation with `title` tooltip for long names.
3. `TreeSkeleton` while loading; `ErrorBanner` with Retry; `EmptyState`.

**Done when:** the seeded data renders as a nested tree; expand/collapse (single and all) works; switching the root in the select changes the tree; Korean text renders correctly.

### Phase 3 — Form and CRUD
1. `MenuForm` with the four fields (three read-only) and `Save`. Dirty-state: disable `Save` when the name is unchanged or invalid; spinner while saving.
2. Add child via `+` on the selected node; add root via `+ New root`; `Cancel` returns to view mode.
3. Edit name → PUT. Delete → `DeleteConfirmDialog` (accessible modal: focus trap, Esc closes, confirm button is destructive) → DELETE.
4. Show backend `error.message` inline in the form; success feedback (a small toast or inline confirmation).

**Done when:** create (root and nested), rename, and delete (with confirmation, children removed) all work and the tree updates without a page reload; empty or whitespace-only names are rejected on the client; backend errors are shown.

### Phase 4 — Search, states, responsive polish
1. `SearchInput` above the tree, debounced (≈200 ms), uses `filterTree`; auto-expands ancestors of matches; highlights the matched text; clear button; "No results" message; the selected node stays valid.
2. Final pass on loading/error/empty states and double-submit prevention.
3. Mobile layout per section 3 (tree above form; comfortable tap targets ≥ 40px). Check widths 360, 768, 1024, 1440.

**Done when:** every item in the test's frontend checklist works on desktop and mobile with no horizontal page scroll.

### Phase 5 — Bonus: drag-and-drop (only after phases 1-4 are solid)
- Install `@dnd-kit/core` (and `@dnd-kit/sortable` if useful). Do not implement DnD by hand.
- Drag a node: **drop on the middle of another node → `menuApi.move(id, targetId)`** (becomes last child);
  **drop on the top/bottom edge → `menuApi.move(id, targetParentId, index)`** (reorder; use `reorder` when the parent does not change).
- Block invalid drops client-side with `isInSubtree` (visual "not allowed" state); the backend also returns `409 INVALID_MOVE`.
- Show a drag overlay and a drop indicator line; keyboard sensor for accessibility; apply the change optimistically,
  then refetch; on error roll back and show the message.
- Auto-expand a collapsed node when hovering over it while dragging (short delay).

**Done when:** reordering and re-parenting work smoothly, invalid drops are prevented, and the tree matches the backend after a refresh.

### Phase 6 — Quality and delivery
1. `npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.
2. Unit tests for `lib/tree.ts` (Vitest: `findNode`, `findParent`, `collectIds`, `filterTree`, `isInSubtree`) — small and meaningful.
3. `README.md` for this folder: setup, env vars, run dev/prod, architecture and tech decisions (why Zustand, why refetch after mutations, component structure).
4. Take screenshots / record a short demo in an Incognito window (no extension overlays), desktop and mobile.

## 7. Manual test checklist (run before declaring done)

Start the backend (`go run ./cmd/api` in `menu-tree-backend`) and the frontend (`npm run dev`), open `http://localhost:3000/menus`.

- [ ] Tree loads from the API; skeleton shows while loading; stop the backend → error banner with Retry works.
- [ ] Expand/collapse a node, `Expand All`, `Collapse All`.
- [ ] Change the root in the select; `+ New root` creates a new root and it appears in the select.
- [ ] Select a node: form shows correct ID, depth, parent name, name.
- [ ] `+` on a node creates a child with depth = parent depth + 1.
- [ ] Rename → persists after reload. Empty/whitespace name is rejected.
- [ ] Delete a node with children → dialog shows descendant count → everything below disappears.
- [ ] Search "code" shows matches with their ancestors expanded; clearing restores the tree; no-match shows a message.
- [ ] Mobile width: drawer sidebar, stacked layout, no horizontal scroll.
- [ ] (Bonus) Drag to reorder, drag to re-parent, dropping a node into its own descendant is blocked.

## 8. Final report format

When finished, report: what was implemented per phase, commands run and their results (tsc, lint, build, tests),
what was verified manually vs. not verified, and any deviations from this spec with reasons.
