export function TreeSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,340px)_minmax(420px,560px)] gap-6 items-start">
      {/* Tree Panel Skeleton */}
      <div className="p-5 rounded-[16px] border border-[#EAECF0] bg-white space-y-4 animate-pulse min-h-[360px]">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
        <div className="h-9 bg-gray-100 rounded-lg w-full" />
        <div className="space-y-3 pt-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-150 rounded w-2/3 ml-4" />
          <div className="h-5 bg-gray-150 rounded w-1/2 ml-8" />
          <div className="h-5 bg-gray-150 rounded w-3/5 ml-8" />
          <div className="h-5 bg-gray-200 rounded w-4/5" />
          <div className="h-5 bg-gray-150 rounded w-1/2 ml-4" />
        </div>
      </div>

      {/* Form Panel Skeleton */}
      <div className="p-6 sm:p-7 rounded-[16px] border border-[#EAECF0] bg-white space-y-5 animate-pulse min-h-[360px]">
        <div className="pb-4 border-b border-[#F0F1F3]">
          <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-48 bg-gray-150 rounded" />
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-11 bg-gray-100 rounded-[14px]" />
          <div className="h-11 bg-gray-100 rounded-[14px] w-1/3" />
          <div className="h-11 bg-gray-100 rounded-[14px]" />
          <div className="h-11 bg-gray-100 rounded-[14px]" />
        </div>
        <div className="pt-4 flex gap-4">
          <div className="h-10 w-28 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
