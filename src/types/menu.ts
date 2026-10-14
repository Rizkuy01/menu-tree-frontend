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

export interface SwaggerDocument {
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
  basePath?: string;
  paths?: Record<string, Record<string, SwaggerOperation>>;
}

export interface SwaggerOperation {
  summary?: string;
  description?: string;
  tags?: string[];
  operationId?: string;
  parameters?: Array<{
    name?: string;
    in?: string;
    required?: boolean;
    description?: string;
    type?: string;
  }>;
  responses?: Record<string, { description?: string }>;
}