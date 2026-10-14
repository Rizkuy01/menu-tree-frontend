import { Search, X } from "lucide-react";
import React from "react";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search menus...",
}: SearchInputProps) {
  return (
    <div className="relative flex items-center w-full mb-3.5">
      <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 text-xs rounded-lg border border-[#EAECF0] bg-white text-[#101828] placeholder-[#98A2B3] outline-none transition-all focus:border-[#0B4FB8]/40 focus:ring-2 focus:ring-[#0B4FB8]/10"
        aria-label="Search menus"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 p-0.5 text-[#98A2B3] hover:text-[#475467] rounded transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
