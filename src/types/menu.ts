export interface MenuNode {
  id: string;
  name: string;
  parent_id: string | null;
  depth: number;
  position: number;
  children: MenuNode[];
}

export interface Menu {
  id: string;
  name: string;
  parent_id: string | null;
  parent_name?: string;
  depth: number;
  position: number;
  created_at: string;
  updated_at: string;
}