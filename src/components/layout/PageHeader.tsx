import { Grid2X2 } from "lucide-react";
import type { ElementType } from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ElementType;
}

export function PageHeader({
  title,
  description,
  icon: Icon = Grid2X2,
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3.5 mb-7 sm:mb-8">
      <div className="w-10 h-10 rounded-full bg-[#0B4FB8] text-white flex items-center justify-center shadow-sm shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101828]">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
