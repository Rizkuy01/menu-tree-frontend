import { Grid2X2, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { menuApi } from "@/lib/api";
import type { SwaggerDocument, SwaggerOperation } from "@/types/menu";

export function ApiList() {
  const [document, setDocument] = useState<SwaggerDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuApi
      .getSwagger()
      .then((doc) => {
        setDocument(doc);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const operations = useMemo(() => {
    return Object.entries(document?.paths ?? {}).flatMap(([path, pathItem]) =>
      Object.entries(pathItem)
        .filter(([method]) =>
          ["get", "post", "put", "patch", "delete"].includes(method.toLowerCase())
        )
        .map(([method, operation]) => ({
          path,
          method: method.toUpperCase(),
          operation: operation as SwaggerOperation,
        }))
    );
  }, [document]);

  const filteredOperations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return operations.filter(({ path, method, operation }) => {
      const matchMethod = methodFilter === "ALL" || method === methodFilter;
      const matchQuery =
        !q ||
        `${path} ${method} ${operation.summary ?? ""} ${operation.description ?? ""}`
          .toLowerCase()
          .includes(q);
      return matchMethod && matchQuery;
    });
  }, [methodFilter, operations, query]);

  const methodCounts = useMemo(() => {
    return operations.reduce<Record<string, number>>((acc, item) => {
      acc[item.method] = (acc[item.method] ?? 0) + 1;
      return acc;
    }, {});
  }, [operations]);

  const methodBadgeColors: Record<string, string> = {
    GET: "bg-emerald-600 text-white",
    POST: "bg-blue-600 text-white",
    PUT: "bg-amber-600 text-white",
    PATCH: "bg-purple-600 text-white",
    DELETE: "bg-rose-600 text-white",
  };

  return (
    <section className="rounded-[18px] border border-[#EAECF0] bg-white overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="p-6 sm:p-7 border-b border-[#EAECF0] bg-linear-to-r from-white to-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0B4FB8] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Grid2X2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#101828]">
              {document?.info?.title ?? "API Endpoints"}
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-0.5 max-w-xl">
              {document?.info?.description ??
                "Live OpenAPI/Swagger documentation from the Go backend."}
            </p>
          </div>
        </div>
        {document?.info?.version && (
          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF3FF] text-[#0B4FB8] border border-[#CFE1F8]">
            Version {document.info.version}
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="m-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs sm:text-sm flex items-center justify-between">
          <span>Failed to load Swagger doc: {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="underline font-semibold hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="p-12 text-center text-xs text-[#667085]">
          Loading Swagger API documentation...
        </div>
      )}

      {/* Content */}
      {document && (
        <div className="p-5 sm:p-7">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-4 rounded-xl border border-[#EAECF0] bg-[#FAFBFC]">
              <div className="text-xl sm:text-2xl font-bold text-[#101828]">
                {operations.length}
              </div>
              <div className="text-[11px] text-[#667085] font-medium mt-0.5">
                Total Endpoints
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[#EAECF0] bg-[#FAFBFC]">
              <div className="text-xl sm:text-2xl font-bold text-[#101828]">
                {methodCounts.GET ?? 0}
              </div>
              <div className="text-[11px] text-[#667085] font-medium mt-0.5">
                GET Requests
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[#EAECF0] bg-[#FAFBFC]">
              <div className="text-xl sm:text-2xl font-bold text-[#101828]">
                {methodCounts.POST ?? 0}
              </div>
              <div className="text-[11px] text-[#667085] font-medium mt-0.5">
                POST Mutations
              </div>
            </div>
            <div className="p-4 rounded-xl border border-[#EAECF0] bg-[#FAFBFC]">
              <div className="text-xl sm:text-2xl font-bold text-[#101828]">
                {(methodCounts.PATCH ?? 0) + (methodCounts.PUT ?? 0)}
              </div>
              <div className="text-[11px] text-[#667085] font-medium mt-0.5">
                Updates &amp; Reorders
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search endpoints by path, summary..."
                className="w-full h-10 pl-9 pr-8 text-xs rounded-lg border border-[#D0D5DD] bg-white outline-none focus:border-[#0B4FB8]/40 focus:ring-2 focus:ring-[#0B4FB8]/10 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#475467]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-10 px-3 text-xs rounded-lg border border-[#D0D5DD] bg-white text-[#344054] font-medium outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">All methods</option>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <option key={m} value={m}>
                  {m} ({methodCounts[m] ?? 0})
                </option>
              ))}
            </select>
          </div>

          {/* Endpoint List */}
          <div className="divide-y divide-[#F2F4F7] border border-[#EAECF0] rounded-xl overflow-hidden bg-white">
            {filteredOperations.map(({ path, method, operation }) => (
              <div
                key={`${method}-${path}`}
                className="p-4 sm:p-4.5 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-start gap-3.5"
              >
                <div
                  className={`w-18 py-1 rounded text-center text-[10px] font-bold tracking-wider shrink-0 ${
                    methodBadgeColors[method] ?? "bg-gray-700 text-white"
                  }`}
                >
                  {method}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono font-semibold text-[#101828] bg-gray-100 px-1.5 py-0.5 rounded">
                      {document.basePath ?? ""}{path}
                    </code>
                    {operation.tags?.[0] && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[#475467] font-medium">
                        {operation.tags[0]}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#101828] mt-1.5">
                    {operation.summary ?? operation.operationId ?? "Endpoint"}
                  </h4>
                  {operation.description && (
                    <p className="text-xs text-[#667085] mt-0.5">
                      {operation.description}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {filteredOperations.length === 0 && (
              <div className="p-8 text-center text-xs text-[#667085]">
                No endpoints match your search criteria.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
