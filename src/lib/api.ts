import type { Menu, MenuNode, SwaggerDocument } from "@/types/menu";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
const SWAGGER_URL = `${BASE_URL.replace(/\/api\/?$/, "")}/swagger/doc.json`;

// Error dari backend berformat { error: { code, message } }.
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });

  if (!res.ok) {
    let code = "UNKNOWN_ERROR";
    let message = "Terjadi kesalahan pada server";
    try {
      const body = await res.json();
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      // body bukan JSON, pakai pesan default
    }
    throw new ApiError(code, message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const menuApi = {
  getTree: () => request<MenuNode[]>("/menus"),

  getById: (id: string) => request<Menu>(`/menus/${id}`),

  create: (name: string, parentId: string | null) =>
    request<Menu>("/menus", {
      method: "POST",
      body: JSON.stringify({ name, parent_id: parentId }),
    }),

  update: (id: string, name: string) =>
    request<Menu>(`/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),

  remove: (id: string) => request<void>(`/menus/${id}`, { method: "DELETE" }),

  move: (id: string, parentId: string | null, position?: number) =>
    request<Menu>(`/menus/${id}/move`, {
      method: "PATCH",
      body: JSON.stringify({ parent_id: parentId, position }),
    }),

  reorder: (id: string, position: number) =>
    request<Menu>(`/menus/${id}/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ position }),
    }),

  getSwagger: async () => {
    const res = await fetch(SWAGGER_URL);
    if (!res.ok) {
      throw new ApiError("SWAGGER_UNAVAILABLE", "Dokumentasi Swagger tidak tersedia", res.status);
    }
    return (await res.json()) as SwaggerDocument;
  },
};