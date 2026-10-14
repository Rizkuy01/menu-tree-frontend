import { AlertCircle } from "lucide-react";

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 p-3.5 sm:p-4 mb-4 rounded-xl border border-[#FECDCA] bg-[#FFF6F5] text-[#B42318] text-xs sm:text-sm"
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-[#D92D20]" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="font-semibold underline hover:no-underline cursor-pointer shrink-0 ml-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}
