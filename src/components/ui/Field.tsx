import React, { type InputHTMLAttributes } from "react";

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  narrow?: boolean;
}

export function Field({
  label,
  value,
  readOnly,
  narrow = false,
  className = "",
  ...props
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${narrow ? "max-w-[120px]" : "w-full"} ${className}`}>
      <span className="text-[11px] font-medium text-[#475467] pl-1 select-none">
        {label}
      </span>
      <div className="relative">
        <input
          value={value ?? ""}
          readOnly={readOnly}
          className={`w-full h-11 px-4 text-xs sm:text-sm rounded-[14px] bg-[#F2F4F7] text-[#101828] transition-all focus:outline-none ${
            readOnly
              ? "text-[#667085] cursor-default bg-[#F2F4F7] focus:ring-0"
              : "border border-transparent focus:border-[#0B4FB8]/40 focus:bg-white focus:ring-2 focus:ring-[#0B4FB8]/10"
          }`}
          {...props}
        />
      </div>
    </div>
  );
}
