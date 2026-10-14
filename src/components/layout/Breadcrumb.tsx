import { Folder } from "lucide-react";

export interface BreadcrumbProps {
  current?: string;
}

export function Breadcrumb({ current = "Menus" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-[#475467]">
      <Folder className="w-4 h-4 text-[#475467] fill-current" />
      <span className="text-[#D0D5DD]">/</span>
      <span className="font-medium text-[#101828]">{current}</span>
    </nav>
  );
}
